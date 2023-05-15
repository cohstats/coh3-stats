import { GetServerSideProps, NextPage } from "next";
import config from "../config";
import { Center, Container, Divider, Flex, Input, Stack, Text } from "@mantine/core";
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

/**
 *
 * Example URL http://localhost:3000/search?q=Thomas
 *
 *
 * @param searchQuery
 * @param data
 * @param error
 * @constructor
 */

const Search: NextPage<{
  searchQuery: string;
  data: Array<SearchPlayerCardData> | null;
  error: string | null;
}> = ({ searchQuery, data, error }) => {
  const { query, push } = useRouter();
  const { q } = query;

  useEffect(() => {
    SearchPageView();
  }, []);

  const [searchValue, setSearchValue] = React.useState(q || "");
  useEffect(() => {
    q ? setSearchValue(q as string) : setSearchValue("");
    SearchPageUsed(q as string);
  }, [q]);

  const description = "Search for any players in Company of Heroes 3.";
  const metaKeywords = generateKeywordsString([`search players`, `search data`, `coh3 search`]);

  const debouncedSearch = debounce((value) => {
    if (value.length > 1) {
      push(getSearchRoute(value));
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
          {data && (
            <Container size={"md"}>
              <Flex gap="sm" wrap={"wrap"} justify="center">
                {data.length === 0 && (
                  <Text c={"dimmed"}>
                    <Stack align={"center"} spacing={"xs"}>
                      <IconDatabaseOff />
                      <div>No players found</div>
                    </Stack>
                  </Text>
                )}
                {data.map((playerData) => {
                  return <SearchPlayerCard data={playerData} key={playerData.relicProfileId} />;
                })}
                {data.length >= 50 && (
                  <Text c={"dimmed"} fs={"italic"}>
                    Only the first 50 results are displayed. Please refine your search.
                  </Text>
                )}
              </Flex>
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
            icon={<IconSearch />}
            w={400}
            radius={"md"}
            defaultValue={searchValue}
            placeholder="Search players"
            onChange={(event: { currentTarget: { value: any } }) => {
              debouncedSearch(event.currentTarget.value);
            }}
          />
        </Center>
        {content}
      </Container>
    </>
  );
};

const convertSearchResultsToPlayerCardData = (
  searchResults: Array<Record<"steamProfile" | "relicProfile", any>>,
) => {
  const foundProfiles: Array<SearchPlayerCardData> = [];
  if (!searchResults) return [];

  for (const playerSearchResult of searchResults) {
    foundProfiles.push({
      avatar: playerSearchResult.steamProfile.avatarmedium,
      country: playerSearchResult.relicProfile.members[0].country,
      relicProfileId: playerSearchResult.relicProfile.members[0].profile_id,
      alias: playerSearchResult.relicProfile.members[0].alias,
      level: playerSearchResult.relicProfile.members[0].level,
    });
  }

  return foundProfiles;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  let { q } = query;

  q = q || "";

  let data = null;
  let error = null;

  if (q) {
    try {
      const res = await fetch(`${config.BASE_CLOUD_FUNCTIONS_URL}/searchPlayers2Http?alias=${q}`);

      if (res.status !== 200) {
        data = await res.json();
        throw new Error(`Failed getting data for player id ${q}: ${JSON.stringify(data)} `);
      } else {
        data = convertSearchResultsToPlayerCardData(await res.json());
      }
    } catch (e: any) {
      console.error(`Failed getting data for player id ${q}`);
      console.error(e);
      error = e.message;
    }
  }

  return {
    props: { searchQuery: q, data: data, error }, // will be passed to the page component as props
  };
};

export default Search;
