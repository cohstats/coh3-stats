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
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { useTranslation } from "next-i18next";
import { platformType, SearchPlayerCardData } from "../../src/coh3/coh3-types";
import { SearchPlayerCard } from "./search-components/search-player-card";
import ErrorCard from "../../components/error-card";
import { getSearchRoute } from "../../src/routes";
import { SearchPageUsed, SearchPageView } from "../../src/firebase/analytics";
import { getSearchUrl } from "../../src/apis/coh3stats-api";
import unitsData from "./units-search-data.json";
import { UnitCard, UnitData } from "./search-components/unit-card";

export const SearchScreen = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Array<SearchPlayerCardData> | null>(null);
  const [unitResults, setUnitResults] = React.useState<UnitData[]>([]);

  const { query, push } = useRouter();
  const { q } = query;
  const { t } = useTranslation("common");

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

  const [searchValue, setSearchValue] = React.useState(q || "");
  useEffect(() => {
    q ? setSearchValue(q as string) : setSearchValue("");
    SearchPageUsed(q as string);

    (async () => {
      if (q) {
        try {
          setLoading(true);
          searchUnits(q as string);

          const searchRes = await fetch(getSearchUrl(q as string));

          if (searchRes.status !== 200) {
            const resData = await searchRes.json();
            throw new Error(
              `Failed getting data for player id ${q}: ${JSON.stringify(resData)} `,
            );
          } else {
            setData(convertSearchResultsToPlayerCardData(await searchRes.json()));
            setError(null);
          }
        } catch (e: any) {
          console.error(`Failed getting data for player id ${q}`);
          console.error(e);
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [q]);

  const debouncedSearch = debounce((value) => {
    if (value.length > 1) {
      push(getSearchRoute(value), undefined, { shallow: true });
    }
  }, 600);

  const content = error ? (
    <ErrorCard title={"Error while searching "} body={JSON.stringify(error)} />
  ) : (
    <>
      {" "}
      {q && (
        <>
          <Divider my="xs" label="Players" labelPosition="center" />
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
                      <div>No players found</div>
                    </Stack>
                    <Space h={"lg"} />
                  </Text>
                )}
                {data.map((playerData) => {
                  return <SearchPlayerCard data={playerData} key={playerData.relicProfileId} />;
                })}
              </Flex>
              <Space />
              <Stack align={"center"} gap={0}>
                {data.length >= 50 && (
                  <Text c={"dimmed"} fs={"italic"}>
                    Only the first 50 results are displayed. Please refine your search.
                  </Text>
                )}
                <Text c={"dimmed"} fs={"italic"}>
                  Console player search supports exact match only.
                </Text>
                <Text c={"dimmed"} fs={"italic"}>
                  You can also search using Steam ID.
                </Text>
              </Stack>
            </Container>
          )}

          <Divider my="xs" label="Units" labelPosition="center" />
          <Container size={"md"}>
            <Flex gap="sm" wrap={"wrap"} justify="center">
              {unitResults.length === 0 ? (
                <Text c={"dimmed"} size={"sm"}>
                  <Stack align={"center"} gap={"xs"}>
                    <IconDatabaseOff />
                    <div>No Units Found</div>
                    <div>Unit search supports English Language only</div>
                  </Stack>
                  <Space h={"lg"} />
                </Text>
              ) : (
                unitResults.map((unit) => <UnitCard key={unit.id} unit={unit} />)
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
          defaultValue={searchValue}
          placeholder={t("search.playersAndUnits")}
          onChange={(event: { currentTarget: { value: any } }) => {
            debouncedSearch(event.currentTarget.value);
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
