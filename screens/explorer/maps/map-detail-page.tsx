import React, { useMemo } from "react";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconChartBar,
  IconInfoCircle,
  IconRulerMeasure,
  IconUsers,
} from "@tabler/icons-react";
import { TFunction } from "next-i18next/pages";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getExplorerMapsRoute, getMapsStatsRoute, mapStatsModeType } from "../../../src/routes";
import { isOfficialMap } from "../../../src/coh3/coh3-data";
import MapMinimap from "./map-minimap";
import MapPointIcon from "./map-point-icon";
import {
  formatMpMapIncome,
  getMpMapIncomeSummary,
  getMpMapMode,
  getMpMapPointMarkers,
  MP_MAP_TEAM_LAYOUTS,
  MpMapIncomeEntry,
  MpMapRenderedPointKind,
} from "../../../src/explorer/mp-maps-helpers";
import type { MpMap } from "../../../src/explorer/mp-maps-types";

/** Order the point tiers are displayed in, from the smallest to the biggest. */
const TIER_ORDER = ["extra_low", "low", "medium", "extra_medium", "high", "default"];

/** Size of the point icons in the stats cards. */
const CARD_ICON_SIZE = 22;

/** Point kinds of the resource cards, in display order. */
const RESOURCE_POINT_KINDS = ["victory", "fuel", "munitions", "strategic"] as const;

/**
 * Point kind generating each resource, so the income rows can show the same icon as the point rows.
 * The data file calls the manpower points `strategic` and the munitions income `munition`.
 */
const RESOURCE_POINT_KIND: Record<MpMapIncomeEntry["resource"], MpMapRenderedPointKind> = {
  fuel: "fuel",
  munition: "munitions",
  manpower: "strategic",
};

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card withBorder radius="md" p="md">
    <Stack gap="xs">
      <Text fw={700}>{title}</Text>
      {children}
    </Stack>
  </Card>
);

/** A `label: value` row of one of the info cards. */
const InfoRow = ({
  label,
  value,
  icon,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <Group justify="space-between" gap="sm" wrap="nowrap">
    <Group gap={6} wrap="nowrap">
      {icon}
      <Text size="sm">{label}</Text>
    </Group>
    <Text size="sm" fw={500} ta="right">
      {value}
    </Text>
  </Group>
);

/**
 * Detail page of a single map - the minimap with the point layout drawn on top of it on the left, and
 * everything we know about the map on the right.
 */
const MapDetailPage = ({ map, t }: { map: MpMap; t: TFunction }) => {
  const mode = getMpMapMode(map);
  // We track the map stats only for the official automatch maps, and only for the team modes.
  const statsRoute =
    isOfficialMap(map.id) && MP_MAP_TEAM_LAYOUTS.includes(mode as mapStatsModeType)
      ? getMapsStatsRoute({ mode: mode as mapStatsModeType, map: map.id })
      : null;
  const markers = useMemo(() => getMpMapPointMarkers(map), [map]);
  const income = useMemo(() => getMpMapIncomeSummary(map), [map]);

  const { counts, countsByTier, totalCapturable } = map.resources;
  const playersPerTeam = Object.values(map.teams);

  // Point kinds which are worth listing with their tier breakdown - the player starts are not.
  const pointRows = RESOURCE_POINT_KINDS.filter((kind) => !!counts[kind]).map((kind) => {
    const tiers = countsByTier[kind] ?? {};

    return {
      kind,
      count: counts[kind] as number,
      tiers: TIER_ORDER.filter((tier) => !!tiers[tier])
        // A single unnamed tier carries no information, only list real ones.
        .filter((tier) => tier !== "default")
        .map((tier) => `${tiers[tier]}× ${t(`tiers.${tier}`)}`)
        .join(", "),
    };
  });

  return (
    <Grid gutter="lg">
      {/* Left column - title and the minimap. The description sits under the cards on the right, so
          that the minimap starts right below the title instead of being pushed down by it. */}
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Stack gap="md">
          <Stack gap={4}>
            <Anchor
              component={LinkWithOutPrefetch}
              href={getExplorerMapsRoute()}
              size="sm"
              w="fit-content"
            >
              <Group gap={4} wrap="nowrap">
                <IconArrowLeft size={16} />
                {t("detail.backToMaps")}
              </Group>
            </Anchor>
            <Title order={1}>{map.name}</Title>
          </Stack>

          <MapMinimap
            mapId={map.id}
            mapName={map.name}
            mapSize={map.mapSize}
            markers={markers}
            t={t}
          />
        </Stack>
      </Grid.Col>

      {/* Right column - the stats cards. */}
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Stack gap="md">
          {/* The badges line up with the page title on a wide screen, which sits lower than the top
              of the grid column - hence the top padding. */}
          <Group gap="xs" pt={{ base: 0, md: "md" }}>
            <Badge variant="light" color="blue" size="lg">
              {t(`modes.${mode}`)}
            </Badge>
            <Badge variant="light" color="gray" size="lg">
              {t("card.players", { count: map.maxPlayers })}
            </Badge>
            {map.isCommunity && (
              <Tooltip label={map.author ? t("card.authorTooltip", { author: map.author }) : ""}>
                <Badge variant="light" color="teal" size="lg">
                  {t("card.community")}
                </Badge>
              </Tooltip>
            )}
            {!map.isLobbyVisible && (
              <Tooltip label={t("card.notInLobbyTooltip")}>
                <Badge variant="light" color="red" size="lg">
                  {t("card.notInLobby")}
                </Badge>
              </Tooltip>
            )}
            {statsRoute && (
              <Button
                component={LinkWithOutPrefetch}
                href={statsRoute}
                variant="default"
                leftSection={<IconChartBar size={18} />}
                ml="auto"
              >
                {t("detail.mapStats", { mode })}
              </Button>
            )}
          </Group>

          <InfoCard title={t("detail.overview")}>
            <InfoRow
              label={t("card.mapSizeTooltip")}
              value={t("card.mapSize", { width: map.mapSize.width, height: map.mapSize.height })}
              icon={<IconRulerMeasure size={18} />}
            />
            <InfoRow
              label={t("detail.players")}
              value={
                playersPerTeam.length === 2
                  ? `${playersPerTeam.join(" vs ")}`
                  : String(map.maxPlayers)
              }
              icon={<IconUsers size={18} />}
            />
            {map.author && <InfoRow label={t("detail.author")} value={map.author} />}
            <InfoRow label={t("detail.mapId")} value={map.id} />
          </InfoCard>

          {pointRows.length > 0 && (
            <InfoCard title={t("detail.points")}>
              <Table verticalSpacing={4} horizontalSpacing={0} withRowBorders={false}>
                <Table.Tbody>
                  {pointRows.map(({ kind, count, tiers }) => (
                    <Table.Tr key={kind}>
                      <Table.Td>
                        <Group gap={8} wrap="nowrap">
                          <MapPointIcon
                            kind={kind}
                            size={CARD_ICON_SIZE}
                            alt={t(`points.${kind}`)}
                          />
                          <Text size="sm">{t(`points.${kind}`)}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {tiers}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={500}>
                          {count}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Divider />
              <InfoRow label={t("detail.totalCapturable")} value={totalCapturable} />
            </InfoCard>
          )}

          {income.length > 0 && (
            <InfoCard title={t("detail.income")}>
              <Table verticalSpacing={4} horizontalSpacing={0} withRowBorders={false}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th />
                    <Table.Th ta="right">
                      <Text size="xs" c="dimmed">
                        {t("detail.incomeTotal")}
                      </Text>
                    </Table.Th>
                    <Table.Th ta="right">
                      <Tooltip label={t("detail.incomePerSideTooltip")} multiline w={240}>
                        <Group gap={2} justify="flex-end" wrap="nowrap">
                          <Text size="xs" c="dimmed">
                            {t("detail.incomePerSide")}
                          </Text>
                          <IconInfoCircle size={12} />
                        </Group>
                      </Tooltip>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {income.map(({ resource, total, perSide }) => (
                    <Table.Tr key={resource}>
                      <Table.Td>
                        <Group gap={8} wrap="nowrap">
                          <MapPointIcon
                            kind={RESOURCE_POINT_KIND[resource]}
                            size={CARD_ICON_SIZE}
                            alt={t(`resources.${resource}`)}
                          />
                          <Text size="sm">{t(`resources.${resource}`)}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={500}>
                          {formatMpMapIncome(total)}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={500}>
                          {formatMpMapIncome(perSide)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Text size="xs" c="dimmed">
                {t("detail.incomeNote")}
              </Text>
            </InfoCard>
          )}

          {map.description && (
            <InfoCard title={t("detail.description")}>
              {/* In-game flavour text - the data file escapes the newlines in it. */}
              <Text size="sm" style={{ whiteSpace: "pre-line" }}>
                {map.description.replace(/\\n/g, "\n")}
              </Text>
            </InfoCard>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default MapDetailPage;
