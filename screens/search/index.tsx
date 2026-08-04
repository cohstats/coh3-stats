import {
  Center,
  Container,
  Divider,
  Flex,
  Input,
  Loader,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { IconSearch, IconDatabaseOff } from "@tabler/icons-react";
import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { useTranslation } from "next-i18next/pages";
import { platformType, SearchPlayerCardData } from "../../src/coh3/coh3-types";
import { SearchPlayerCard } from "./search-components/search-player-card";
import ErrorCard from "../../components/error-card";
import { SearchPageUsed, SearchPageView } from "../../src/firebase/analytics";
import { searchPlayers } from "../../src/apis/coh3stats-api";
import unitsData from "./units-search-data.json";
import mapsData from "./maps-search-data.json";
import { UnitCard, UnitData } from "./search-components/unit-card";
import { MapCard, MapSearchData } from "./search-components/map-card";
import { stripMpMapNamePrefix } from "../../src/explorer/mp-maps-helpers";

export const SearchScreen = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Array<SearchPlayerCardData> | null>(null);
  const [unitResults, setUnitResults] = React.useState<UnitData[]>([]);
  const [mapResults, setMapResults] = React.useState<MapSearchData[]>([]);

  const { query } = useRouter();
  const { q } = query;
  const { t } = useTranslation(["common", "search"]);

  useEffect(() => {
    SearchPageView();
  }, []);

  const searchUnits = (searchTerm: string) => {
    if (!searchTerm) {
      setUnitResults([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const results = unitsData.filter((unit) => unit.name.toLowerCase().includes(searchTermLower));
    setUnitResults(results);
  };

  const searchMaps = (searchTerm: string) => {
    if (!searchTerm) {
      setMapResults([]);
      return;
    }

    // Map ids use underscores where the name uses spaces (eg. `hoff_city` / "Hoff City") - normalize
    // both sides the same way so a query in either style matches.
    const normalize = (value: string) =>
      stripMpMapNamePrefix(value).replace(/[_-]+/g, " ").toLowerCase();

    const searchTermLower = normalize(searchTerm);
    const results = (mapsData as MapSearchData[]).filter(
      (map) =>
        normalize(map.id).includes(searchTermLower) ||
        normalize(map.name).includes(searchTermLower),
    );
    setMapResults(results);
  };

  const [searchValue, setSearchValue] = React.useState(q || "");

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length <= 1) {
      setData(null);
      setUnitResults([]);
      setMapResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search units locally
      searchUnits(searchQuery);

      // Search maps locally
      searchMaps(searchQuery);

      // Search players via API
      const searchResults = await searchPlayers(searchQuery);
      setData(convertSearchResultsToPlayerCardData(searchResults));

      // Track search usage
      SearchPageUsed(searchQuery);
    } catch (e: any) {
      console.error(`Failed getting data for player search ${searchQuery}`);
      console.error(e);
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle initial load with query parameter
  useEffect(() => {
    if (q) {
      setSearchValue(q as string);
      performSearch(q as string);
    }
  }, [q]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      performSearch(value);
    }, 700),
    [performSearch],
  );

  const content = error ? (
    <ErrorCard title={t("search:errors.searchError")} body={JSON.stringify(error)} />
  ) : (
    <>
      {" "}
      {searchValue && searchValue.length > 1 && (
        <>
          <Divider my="xs" label={t("search:sections.players")} labelPosition="center" />
          {loading && (
            <Center maw={400} h={250} mx="auto">
              <Loader />
            </Center>
          )}
          {data && !loading && (
            <Container size={"md"}>
              <Flex gap="sm" wrap={"wrap"} justify="center">
                {data.length === 0 && (
                  <Text c={"dimmed"}>
                    <Stack align={"center"} gap={"xs"}>
                      <IconDatabaseOff />
                      <div>{t("search:noResults.players")}</div>
                    </Stack>
                    <Space h={"lg"} />
                  </Text>
                )}
                {data.map((playerData) => {
                  return (
                    <SearchPlayerCard data={playerData} key={playerData.relicProfileId} t={t} />
                  );
                })}
              </Flex>
              <Space />
              <Stack align={"center"} gap={0}>
                {data.length >= 50 && (
                  <Text c={"dimmed"} fs={"italic"}>
                    {t("search:info.firstResults")}
                  </Text>
                )}
                <Text c={"dimmed"} fs={"italic"}>
                  {t("search:info.consoleSearch")}
                </Text>
                <Text c={"dimmed"} fs={"italic"}>
                  {t("search:info.steamSearch")}
                </Text>
              </Stack>
            </Container>
          )}

          <Divider my="xs" label={t("search:sections.units")} labelPosition="center" />
          <Container size={"md"}>
            <Flex gap="sm" wrap={"wrap"} justify="center">
              {unitResults.length === 0 ? (
                <Text c={"dimmed"} size={"sm"}>
                  <Stack align={"center"} gap={"xs"}>
                    <IconDatabaseOff />
                    <div>{t("search:noResults.units")}</div>
                    <div>{t("search:noResults.unitsEnglishOnly")}</div>
                  </Stack>
                  <Space h={"lg"} />
                </Text>
              ) : (
                unitResults.map((unit) => <UnitCard key={unit.id} unit={unit} />)
              )}
            </Flex>
          </Container>

          <Divider my="xs" label={t("search:sections.maps")} labelPosition="center" />
          <Container size={"md"}>
            <Flex gap="sm" wrap={"wrap"} justify="center">
              {mapResults.length === 0 ? (
                <Text c={"dimmed"} size={"sm"}>
                  <Stack align={"center"} gap={"xs"}>
                    <IconDatabaseOff />
                    <div>{t("search:noResults.maps")}</div>
                  </Stack>
                  <Space h={"lg"} />
                </Text>
              ) : (
                mapResults.map((map) => <MapCard key={map.id} map={map} t={t} />)
              )}
            </Flex>
          </Container>
        </>
      )}
    </>
  );

  return (
    <Container size={"lg"}>
      <Center>
        <Input
          leftSection={<IconSearch />}
          w={400}
          radius={"md"}
          value={searchValue}
          placeholder={t("common:search.playersAndUnits")}
          onChange={(event: { currentTarget: { value: any } }) => {
            const value = event.currentTarget.value;
            setSearchValue(value);
            debouncedSearch(value);
          }}
        />
      </Center>
      <div style={{ minHeight: "1200px" }}>{content}</div>
    </Container>
  );
};

const convertSearchResultsToPlayerCardData = (
  searchResults: Array<{
    platform: string;
    id: number;
    alias: string;
    country: string;
    avatar: string;
    lastActiveUnixTs: number;
  }>,
) => {
  const foundProfiles: Array<SearchPlayerCardData> = [];
  if (!searchResults) return [];

  for (const playerSearchResult of searchResults) {
    foundProfiles.push({
      platform: playerSearchResult.platform as platformType,
      avatar: playerSearchResult.avatar || "",
      country: playerSearchResult.country,
      relicProfileId: playerSearchResult.id,
      lastActiveUnixTs: playerSearchResult.lastActiveUnixTs,
      alias: playerSearchResult.alias,
    });
  }

  return foundProfiles;
};
