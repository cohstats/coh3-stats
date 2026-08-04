import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Group,
  Image,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconInfoCircle, IconSearch } from "@tabler/icons-react";
import { DataTable, DataTableColumn, DataTableSortStatus } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { TFunction, useTranslation } from "next-i18next/pages";
import MapsViewSwitch from "./maps-view-switch";
import MapPointIcon from "./map-point-icon";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getExplorerMapRoute } from "../../../src/routes";
import {
  filterMpMaps,
  formatMpMapIncome,
  getMpMapImageUrl,
  MP_MAP_MODES,
  MpMapMode,
  MpMapRenderedPointKind,
  MpMapTableItem,
  stripMpMapNamePrefix,
} from "../../../src/explorer/mp-maps-helpers";

/** Side of the minimap thumbnail in the first column. */
const THUMBNAIL_SIZE = 40;

/** Size of the resource point icons in the column headers. */
const HEADER_ICON_SIZE = 18;

/** Order the point tiers are displayed in, from the lowest to the highest yield. */
const TIER_ORDER = ["extra_low", "low", "medium", "extra_medium", "high", "default"];

/** Point kinds with a count column, in display order. */
const POINT_KINDS = ["victory", "fuel", "munitions", "strategic"] as const;

/** The resource income columns, in display order, with the point kind generating each resource. */
const INCOME_RESOURCES = [
  { resource: "fuel", kind: "fuel", labelKey: "columns.fuel", tooltipKey: "tooltips.incomeFuel" },
  {
    resource: "munition",
    kind: "munitions",
    labelKey: "columns.munitions",
    tooltipKey: "tooltips.incomeMunitions",
  },
  {
    resource: "manpower",
    kind: "strategic",
    labelKey: "columns.strategic",
    tooltipKey: "tooltips.incomeManpower",
  },
] as const;

type IncomeResource = (typeof INCOME_RESOURCES)[number]["resource"];

type SortKey =
  | "name"
  | "mode"
  | "points.victory"
  | "points.fuel"
  | "points.munitions"
  | "points.strategic"
  | "points.capturable"
  | "income.fuel"
  | "income.munition"
  | "income.manpower"
  | "size.map"
  | "size.playable";

/** Value each sortable column is sorted by. Everything is a number except the name. */
const SORT_VALUE: Record<SortKey, (map: MpMapTableItem) => number | string> = {
  name: (map) => stripMpMapNamePrefix(map.name).toLowerCase(),
  // Sorting by the mode string would put `fs` between `4v4` and `other`, the display order is nicer.
  mode: (map) => MP_MAP_MODES.indexOf(map.mode),
  "points.victory": (map) => map.pointCounts.victory ?? 0,
  "points.fuel": (map) => map.pointCounts.fuel ?? 0,
  "points.munitions": (map) => map.pointCounts.munitions ?? 0,
  "points.strategic": (map) => map.pointCounts.strategic ?? 0,
  "points.capturable": (map) => map.totalCapturable,
  "income.fuel": (map) => map.incomePerMinute.fuel ?? 0,
  "income.munition": (map) => map.incomePerMinute.munition ?? 0,
  "income.manpower": (map) => map.incomePerMinute.manpower ?? 0,
  "size.map": (map) => map.mapSize.width * map.mapSize.height,
  "size.playable": (map) => map.playableArea.width * map.playableArea.height,
};

/** Column and direction the table starts at - the maps grouped by mode, like the card view. */
const DEFAULT_SORT_STATUS: DataTableSortStatus<MpMapTableItem> = {
  columnAccessor: "mode",
  direction: "asc",
};

const isSortKey = (value: unknown): value is SortKey =>
  typeof value === "string" && value in SORT_VALUE;

/** Parses the `mode` query param, eg. `?mode=3v3,4v4`. Unknown values are dropped. */
const parseModesQuery = (value: string | string[] | undefined): MpMapMode[] => {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");

  return raw
    .split(",")
    .map((mode) => mode.trim())
    .filter((mode): mode is MpMapMode => MP_MAP_MODES.includes(mode as MpMapMode));
};

/**
 * Column header of a resource point column - just the icon of the point kind. The group header says
 * whether the column is a point count or an income, the tooltip spells the whole thing out.
 */
const PointHeader = ({
  kind,
  label,
  tooltip,
}: {
  kind: MpMapRenderedPointKind;
  /** Short name of the resource, used as the alt text of the icon. */
  label: string;
  tooltip: string;
}) => (
  <Tooltip label={tooltip}>
    <Group gap={4} wrap="nowrap" justify="center">
      <MapPointIcon kind={kind} size={HEADER_ICON_SIZE} alt={label} />
    </Group>
  </Tooltip>
);

/**
 * Formats the tier breakdown of a point kind, eg. `2× low, 4× medium`. Shown as the tooltip of the
 * point count cells, so the tier information is there without opening the detail page.
 */
const formatTiers = (
  tiers: Record<string, number | undefined> | undefined,
  t: TFunction,
): string | null => {
  if (!tiers) return null;

  const parts = sortBy(Object.entries(tiers), ([tier]) => {
    const index = TIER_ORDER.indexOf(tier);

    // Unknown tiers go last instead of breaking the order.
    return index === -1 ? TIER_ORDER.length : index;
  })
    .filter(([, count]) => !!count)
    .map(([tier, count]) => `${count}× ${t(`explorer-maps:tiers.${tier}`)}`);

  return parts.length ? parts.join(", ") : null;
};

/** A centered numeric cell with a tooltip explaining what the number is. */
const NumberCell = ({ value, tooltip }: { value: number; tooltip: string }) => {
  if (!value) return <Text c="dimmed">-</Text>;

  return (
    <Tooltip label={tooltip}>
      <Text size="sm">{value}</Text>
    </Tooltip>
  );
};

const MapsTablePage = ({ maps }: { maps: MpMapTableItem[] }) => {
  const { t } = useTranslation(["common", "explorer-maps", "explorer-maps-table"]);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [modes, setModes] = useState<MpMapMode[]>([]);
  const [lobbyOnly, setLobbyOnly] = useState(true);
  /** Whether the income columns show the whole map or the estimated income of one side. */
  const [incomePerSide, setIncomePerSide] = useState(false);
  const [sortStatus, setSortStatus] =
    useState<DataTableSortStatus<MpMapTableItem>>(DEFAULT_SORT_STATUS);
  const [debouncedSearch] = useDebouncedValue(search, 200);

  // The page is statically generated, so the query is only available after hydration.
  useEffect(() => {
    if (!router.isReady) return;

    const { search: searchQuery, mode, lobby, sort, dir } = router.query;

    setSearch(typeof searchQuery === "string" ? searchQuery : "");
    setModes(parseModesQuery(mode));
    setLobbyOnly(lobby !== "false");
    if (isSortKey(sort)) {
      setSortStatus({ columnAccessor: sort, direction: dir === "desc" ? "desc" : "asc" });
    }
  }, [router.isReady]);

  const updateQuery = useCallback(
    (next: {
      search: string;
      modes: MpMapMode[];
      lobbyOnly: boolean;
      sortStatus: DataTableSortStatus<MpMapTableItem>;
    }) => {
      if (!router.isReady) return;

      const query: Record<string, string> = {};
      if (next.search.trim()) query.search = next.search.trim();
      if (next.modes.length) query.mode = next.modes.join(",");
      if (!next.lobbyOnly) query.lobby = "false";
      // The default sorting doesn't need to show up in the url.
      if (
        next.sortStatus.columnAccessor !== DEFAULT_SORT_STATUS.columnAccessor ||
        next.sortStatus.direction !== DEFAULT_SORT_STATUS.direction
      ) {
        query.sort = String(next.sortStatus.columnAccessor);
        query.dir = next.sortStatus.direction;
      }

      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );

  // Keep the url in sync with the (debounced) filters and the sorting.
  useEffect(() => {
    updateQuery({ search: debouncedSearch, modes, lobbyOnly, sortStatus });
  }, [debouncedSearch, modes, lobbyOnly, sortStatus]);

  const records = useMemo(() => {
    const filtered = filterMpMaps(maps, {
      search: debouncedSearch,
      modes,
      lobbyOnly,
    });

    const sortValue =
      SORT_VALUE[isSortKey(sortStatus.columnAccessor) ? sortStatus.columnAccessor : "mode"];
    // Name as the secondary key, so the many maps sharing a value keep a sensible order.
    const sorted = sortBy(filtered, [sortValue, SORT_VALUE.name]);

    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [maps, debouncedSearch, modes, lobbyOnly, sortStatus]);

  /** Formatted income of a single resource, halved when the per side mode is on. */
  const incomeValue = (map: MpMapTableItem, resource: IncomeResource): string | null => {
    const total = map.incomePerMinute[resource] ?? 0;
    if (!total) return null;

    return formatMpMapIncome(incomePerSide ? total / 2 : total);
  };

  const pointCountColumns: DataTableColumn<MpMapTableItem>[] = POINT_KINDS.map((kind) => ({
    accessor: `points.${kind}`,
    title: (
      <PointHeader
        kind={kind}
        label={t(`explorer-maps-table:columns.${kind}`)}
        tooltip={t(`explorer-maps-table:tooltips.${kind}`)}
      />
    ),
    sortable: true,
    textAlign: "center",
    width: 55,
    render: (map) => {
      const count = map.pointCounts[kind] ?? 0;
      if (!count) return <Text c="dimmed">-</Text>;

      const tiers = formatTiers(map.pointCountsByTier[kind], t);

      return (
        <Tooltip
          label={
            tiers
              ? `${t(`explorer-maps-table:tooltips.${kind}`)} - ${tiers}`
              : t(`explorer-maps-table:tooltips.${kind}`)
          }
        >
          <Text size="sm">{count}</Text>
        </Tooltip>
      );
    },
  }));

  const incomeColumns: DataTableColumn<MpMapTableItem>[] = INCOME_RESOURCES.map(
    ({ resource, kind, labelKey, tooltipKey }) => ({
      accessor: `income.${resource}`,
      title: (
        <PointHeader
          kind={kind}
          label={t(`explorer-maps-table:${labelKey}`)}
          tooltip={t(`explorer-maps-table:${tooltipKey}`)}
        />
      ),
      sortable: true,
      textAlign: "center",
      width: 70,
      render: (map) => {
        const value = incomeValue(map, resource);
        if (!value) return <Text c="dimmed">-</Text>;

        return (
          <Tooltip
            label={
              incomePerSide
                ? t("explorer-maps-table:tooltips.incomePerSideNote")
                : t(`explorer-maps-table:${tooltipKey}`)
            }
            multiline
            w={280}
          >
            <Text size="sm">+{value}</Text>
          </Tooltip>
        );
      },
    }),
  );

  return (
    <Container size="xl" p={0}>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Title order={1}>{t("explorer-maps-table:page.title")}</Title>
            <Text size="lg" c="dimmed">
              {t("explorer-maps-table:page.subtitle")}
            </Text>
          </Stack>
          <MapsViewSwitch active="table" t={t} />
        </Group>

        <Stack gap="sm">
          <Group gap="sm" align="flex-end">
            <TextInput
              placeholder={t("explorer-maps:filters.searchPlaceholder")}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              w={260}
              data-testid="maps-table-search-input"
            />
            <Stack gap={2}>
              <Group gap={4}>
                <Text size="sm" fw={500}>
                  {t("explorer-maps-table:filters.income")}
                </Text>
                <Tooltip label={t("explorer-maps-table:filters.incomeTooltip")} multiline w={280}>
                  <IconInfoCircle size={14} />
                </Tooltip>
              </Group>
              <SegmentedControl
                size="xs"
                value={incomePerSide ? "perSide" : "total"}
                onChange={(value) => setIncomePerSide(value === "perSide")}
                data={[
                  { value: "total", label: t("explorer-maps-table:filters.incomeTotal") },
                  { value: "perSide", label: t("explorer-maps-table:filters.incomePerSide") },
                ]}
                data-testid="maps-table-income-switch"
              />
            </Stack>
          </Group>

          <Group justify="space-between" align="center">
            <Chip.Group
              multiple
              value={modes}
              onChange={(value) => setModes(value as MpMapMode[])}
            >
              <Group gap="xs">
                {MP_MAP_MODES.filter((mode) => mode !== "other").map((mode) => (
                  <Chip key={mode} value={mode} size="sm" variant="outline">
                    {t(`explorer-maps:modes.${mode}`)}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>

            <Switch
              label={t("explorer-maps:filters.lobbyOnly")}
              checked={lobbyOnly}
              onChange={(event) => setLobbyOnly(event.currentTarget.checked)}
              data-testid="maps-table-lobby-switch"
            />
          </Group>

          <Text size="sm" c="dimmed">
            {t("explorer-maps:filters.mapCount", { count: records.length })}
          </Text>
        </Stack>

        <Box data-testid="maps-table">
          <DataTable
            withTableBorder
            withColumnBorders
            borderRadius="md"
            highlightOnHover
            striped
            verticalSpacing={4}
            fz="sm"
            minHeight={200}
            idAccessor="id"
            records={records}
            noRecordsText={t("explorer-maps-table:page.noMaps")}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            groups={[
              {
                id: "map",
                title: t("explorer-maps-table:groups.map"),
                columns: [
                  {
                    accessor: "name",
                    title: t("explorer-maps-table:columns.name"),
                    sortable: true,
                    width: 290,
                    render: (map) => (
                      <Group gap="xs" wrap="nowrap">
                        <Image
                          src={getMpMapImageUrl(map.id)}
                          alt={map.name}
                          w={THUMBNAIL_SIZE}
                          h={THUMBNAIL_SIZE}
                          fit="contain"
                          // The whole list is rendered at once, no point in fetching ~100 minimaps
                          // before they are scrolled to.
                          loading="lazy"
                          fallbackSrc={`https://placehold.co/${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}?text=?`}
                          style={{ flex: `0 0 ${THUMBNAIL_SIZE}px` }}
                        />
                        {/* minWidth 0 so a long name wraps instead of stretching the column. */}
                        <Stack gap={0} style={{ minWidth: 0 }}>
                          <Group gap={6} wrap="nowrap">
                            <Text
                              size="sm"
                              fw={500}
                              component={LinkWithOutPrefetch}
                              href={getExplorerMapRoute(map.id)}
                            >
                              {map.name}
                            </Text>
                            {map.isCommunity && (
                              <Tooltip
                                label={
                                  map.author
                                    ? t("explorer-maps:card.authorTooltip", {
                                        author: map.author,
                                      })
                                    : t("explorer-maps:card.community")
                                }
                              >
                                <Badge variant="light" color="teal" size="xs">
                                  {t("explorer-maps:card.community")}
                                </Badge>
                              </Tooltip>
                            )}
                            {!map.isLobbyVisible && (
                              <Tooltip label={t("explorer-maps:card.notInLobbyTooltip")}>
                                <Badge variant="light" color="red" size="xs">
                                  {t("explorer-maps:card.notInLobby")}
                                </Badge>
                              </Tooltip>
                            )}
                          </Group>
                          <Tooltip
                            label={t("explorer-maps-table:tooltips.mapIdVersion", {
                              version: map.version,
                            })}
                          >
                            <Text size="xs" c="dimmed">
                              {map.id}
                            </Text>
                          </Tooltip>
                        </Stack>
                      </Group>
                    ),
                  },
                  {
                    accessor: "mode",
                    title: t("explorer-maps-table:columns.mode"),
                    sortable: true,
                    textAlign: "center",
                    width: 80,
                    render: (map) => t(`explorer-maps:modes.${map.mode}`),
                  },
                ],
              },
              {
                id: "points",
                title: t("explorer-maps-table:groups.points"),
                textAlign: "center",
                columns: [
                  ...pointCountColumns,
                  {
                    accessor: "points.capturable",
                    title: t("explorer-maps-table:columns.capturable"),
                    sortable: true,
                    textAlign: "center",
                    width: 72,
                    render: (map) => (
                      <NumberCell
                        value={map.totalCapturable}
                        tooltip={t("explorer-maps-table:tooltips.capturable")}
                      />
                    ),
                  },
                ],
              },
              {
                id: "income",
                title: `${t("explorer-maps-table:groups.income")}${
                  incomePerSide ? ` (${t("explorer-maps-table:filters.incomePerSide")})` : ""
                }`,
                textAlign: "center",
                columns: incomeColumns,
              },
              {
                id: "size",
                title: t("explorer-maps-table:groups.size"),
                textAlign: "center",
                columns: [
                  {
                    accessor: "size.map",
                    title: t("explorer-maps-table:columns.mapSize"),
                    sortable: true,
                    textAlign: "center",
                    width: 100,
                    render: (map) => (
                      <Tooltip label={t("explorer-maps-table:tooltips.mapSize")}>
                        <Text size="sm">
                          {t("explorer-maps:card.mapSize", {
                            width: map.mapSize.width,
                            height: map.mapSize.height,
                          })}
                        </Text>
                      </Tooltip>
                    ),
                  },
                  {
                    accessor: "size.playable",
                    title: t("explorer-maps-table:columns.playableArea"),
                    sortable: true,
                    textAlign: "center",
                    width: 100,
                    render: (map) => (
                      <Tooltip label={t("explorer-maps-table:tooltips.playableArea")}>
                        <Text size="sm">
                          {t("explorer-maps:card.mapSize", {
                            width: Math.round(map.playableArea.width),
                            height: Math.round(map.playableArea.height),
                          })}
                        </Text>
                      </Tooltip>
                    ),
                  },
                ],
              },
              {
                id: "actions",
                title: "",
                columns: [
                  {
                    accessor: "details",
                    title: "",
                    textAlign: "center",
                    width: 100,
                    render: (map) => (
                      <Tooltip
                        label={t("explorer-maps-table:details.tooltip", { name: map.name })}
                      >
                        <Button
                          component={LinkWithOutPrefetch}
                          href={getExplorerMapRoute(map.id)}
                          variant="light"
                          size="compact-xs"
                          data-testid={`map-details-${map.id}`}
                        >
                          {t("explorer-maps-table:details.button")}
                        </Button>
                      </Tooltip>
                    ),
                  },
                ],
              },
            ]}
          />
        </Box>
      </Stack>
    </Container>
  );
};

export default MapsTablePage;
