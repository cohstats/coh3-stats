import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Chip,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import MapCard from "./map-card";
import MapsViewSwitch from "./maps-view-switch";
import {
  filterMpMaps,
  groupMpMapsByMode,
  MP_MAP_MODES,
  MpMapListItem,
  MpMapMode,
  sortMpMapsByName,
} from "../../../src/explorer/maps/mp-maps-helpers";

/** Parses the `mode` query param, eg. `?mode=3v3,4v4`. Unknown values are dropped. */
const parseModesQuery = (value: string | string[] | undefined): MpMapMode[] => {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");

  return raw
    .split(",")
    .map((mode) => mode.trim())
    .filter((mode): mode is MpMapMode => MP_MAP_MODES.includes(mode as MpMapMode));
};

const MapsExplorerPage = ({ maps }: { maps: MpMapListItem[] }) => {
  const { t } = useTranslation(["explorer-maps"]);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [modes, setModes] = useState<MpMapMode[]>([]);
  const [lobbyOnly, setLobbyOnly] = useState(true);
  const [debouncedSearch] = useDebouncedValue(search, 200);

  // The page is statically generated, so the query is only available after hydration.
  useEffect(() => {
    if (!router.isReady) return;

    const { search: searchQuery, mode, lobby } = router.query;

    setSearch(typeof searchQuery === "string" ? searchQuery : "");
    setModes(parseModesQuery(mode));
    setLobbyOnly(lobby !== "false");
  }, [router.isReady]);

  const updateQuery = useCallback(
    (next: { search: string; modes: MpMapMode[]; lobbyOnly: boolean }) => {
      if (!router.isReady) return;

      const query: Record<string, string> = {};
      if (next.search.trim()) query.search = next.search.trim();
      if (next.modes.length) query.mode = next.modes.join(",");
      if (!next.lobbyOnly) query.lobby = "false";

      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );

  // Keep the url in sync with the (debounced) filters.
  useEffect(() => {
    updateQuery({ search: debouncedSearch, modes, lobbyOnly });
  }, [debouncedSearch, modes, lobbyOnly]);

  const filteredMaps = useMemo(
    () => filterMpMaps(maps, { search: debouncedSearch, modes, lobbyOnly }),
    [maps, debouncedSearch, modes, lobbyOnly],
  );

  // While searching, a flat list reads better than a bunch of one-card sections.
  const isSearching = debouncedSearch.trim().length > 0;
  const groups: Array<[MpMapMode | null, MpMapListItem[]]> = isSearching
    ? [[null, sortMpMapsByName(filteredMaps)]]
    : groupMpMapsByMode(filteredMaps);

  return (
    <Container size="lg" p={0}>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Title order={1}>{t("page.title")}</Title>
            <Text size="lg" c="dimmed">
              {t("page.subtitle")}
            </Text>
          </Stack>
          <MapsViewSwitch active="cards" t={t} />
        </Group>

        <Stack gap="sm">
          <TextInput
            placeholder={t("filters.searchPlaceholder")}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            maw={400}
            data-testid="maps-search-input"
          />

          <Group justify="space-between" align="center">
            <Chip.Group
              multiple
              value={modes}
              onChange={(value) => setModes(value as MpMapMode[])}
            >
              <Group gap="xs">
                {MP_MAP_MODES.filter((mode) => mode !== "other").map((mode) => (
                  <Chip key={mode} value={mode} size="sm" variant="outline">
                    {t(`modes.${mode}`)}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>

            <Switch
              label={t("filters.lobbyOnly")}
              checked={lobbyOnly}
              onChange={(event) => setLobbyOnly(event.currentTarget.checked)}
              data-testid="maps-lobby-switch"
            />
          </Group>

          <Text size="sm" c="dimmed">
            {t("filters.mapCount", { count: filteredMaps.length })}
          </Text>
        </Stack>

        {filteredMaps.length === 0 && <Text>{t("page.noMaps")}</Text>}

        {groups.map(([mode, modeMaps]) => (
          <Stack key={mode ?? "all"} gap="sm">
            {mode && (
              <Title order={2} size="h3">
                {t(`sections.${mode}`)} ({modeMaps.length})
              </Title>
            )}
            {/* The cards are wide (image on the left, text on the right), 2 per row is the most
                that fits without squeezing the badges. */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {modeMaps.map((map) => (
                <MapCard key={map.id} map={map} t={t} />
              ))}
            </SimpleGrid>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
};

export default MapsExplorerPage;
