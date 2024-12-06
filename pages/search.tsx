import { NextPage } from "next";
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
import Head from "next/head";
import React, { useEffect } from "react";
import { generateKeywordsString } from "../src/head-utils";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { SearchPlayerCardData } from "../src/coh3/coh3-types";
import { SearchPlayerCard } from "../components/search/search-player-card";
import ErrorCard from "../components/error-card";
import { getSearchRoute } from "../src/routes";
import { SearchPageUsed, SearchPageView } from "../src/firebase/analytics";
import { getSearchUrl } from "../src/apis/coh3stats-api";

/**
 *
 * Example URL http://localhost:3000/search?q=Thomas
 *
 *
 * @constructor
 */

const Search: NextPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Array<SearchPlayerCardData> | null>(null);

  const { query, push } = useRouter();
  const { q } = query;

  useEffect(() => {
    SearchPageView();
  }, []);

  const [searchValue, setSearchValue] = React.useState(q || "");
  useEffect(() => {
    q ? setSearchValue(q as string) : setSearchValue("");
    SearchPageUsed(q as string);

    (async () => {
      if (q) {
        try {
          setLoading(true);

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

  const description = "Search for any players in Company of Heroes 3.";
  const metaKeywords = generateKeywordsString([`search players`, `search data`, `coh3 search`]);

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
                  </Text>
                )}
                {data.map((playerData) => {
                  return <SearchPlayerCard data={playerData} key={playerData.relicProfileId} />;
                })}
                <Space />
                {data.length >= 50 && (
                  <Text c={"dimmed"} fs={"italic"}>
                    Only the first 50 results are displayed. Please refine your search.
                  </Text>
                )}
              </Flex>
              <Center>
                <Text c={"dimmed"} fs={"italic"}>
                  Console player search supports exact match only.
                </Text>
              </Center>
            </Container>
          )}
        </>
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>{"COH3 Stats - Search"}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={metaKeywords} />
        <meta name="robots" content="nofollow" />
      </Head>
      <Container size={"lg"}>
        <Center>
          <Input
            leftSection={<IconSearch />}
            w={400}
            radius={"md"}
            defaultValue={searchValue}
            placeholder="Search players"
            onChange={(event: { currentTarget: { value: any } }) => {
              debouncedSearch(event.currentTarget.value);
            }}
          />
        </Center>
        <div style={{ minHeight: "1200px" }}>{content}</div>
      </Container>
    </>
  );
};

const convertSearchResultsToPlayerCardData = (
  searchResults: Array<Record<"steamProfile" | "relicProfile" | "platform", any>>,
) => {
  const foundProfiles: Array<SearchPlayerCardData> = [];
  if (!searchResults) return [];

  for (const playerSearchResult of searchResults) {
    foundProfiles.push({
      platform: playerSearchResult.platform || "unknown",
      avatar: playerSearchResult.steamProfile?.avatarmedium || "",
      country: playerSearchResult.relicProfile.members[0].country,
      relicProfileId: playerSearchResult.relicProfile.members[0].profile_id,
      alias: playerSearchResult.relicProfile.members[0].alias,
      level: playerSearchResult.relicProfile.members[0].level,
    });
  }

  return foundProfiles;
};

export default Search;
