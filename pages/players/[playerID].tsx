import config from "../../config";
import {
  Image,
  Avatar,
  Container,
  Group,
  Stack,
  Title,
  Anchor,
  Tabs,
  Space,
} from "@mantine/core";
import { Steam } from "../../components/icon/steam";
import Link from "next/link";
import PlayerRecentMatches from "../../components/player-card/player-recent-matches";
import { useRouter } from "next/router";
import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import PlayerStandings from "../../components/player-card/player-standings";
import Head from "next/head";
import React from "react";
import { PlayerCardDataType } from "../../src/coh3/coh3-types";

/**
 *
 * Example url http://localhost:3000/players/26631
 * For player card ^^
 *
 * For player card with matches http://localhost:3000/players/26631?view=recentMatches
 *
 * @param playerID
 * @param data
 * @param error
 * @constructor
 */

// @ts-ignore
const PlayerCard = ({
  playerID,
  playerData,
  error,
  playerMatchesData,
}: {
  playerID: string;
  playerData: PlayerCardDataType;
  error: string;
  playerMatchesData: any;
}) => {
  const { push, query } = useRouter();
  const { view } = query;
  console.log("playerData", playerData);

  if (error) {
    return <Container size="lg">{error}</Container>;
  }

  const pageTitle = `Player card - ${playerData.info.name}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`COH3 Stats - player card for player ${playerData.info.name}.`}
        />
      </Head>
      <Container size={"lg"}>
        <Container fluid>
          <Group>
            <Avatar
              src={playerData.steamData.avatarmedium}
              imageProps={{ loading: "lazy" }}
              alt={playerData.info.name}
              size="xl"
            />
            <Stack spacing={"xs"}>
              <Group>
                <Image
                  src={"/flags/4x3/" + playerData.info.country + ".svg"}
                  imageProps={{ loading: "lazy" }}
                  alt={playerData.info.country}
                  width={40}
                />
                <Title> {playerData.info.name}</Title>
              </Group>
              <Group spacing={"xs"}>
                <Anchor component={Link} href={playerData.steamData.profileurl} target="_blank">
                  <Steam label="Steam Profile" />
                </Anchor>
              </Group>

              {/*<Text>Last played:</Text>
            <Text>Play time:</Text>*/}
            </Stack>
          </Group>
        </Container>
        <Tabs
          variant={"outline"}
          value={(view as string) || "standings"}
          defaultValue={(view as string) || "standings"}
          onTabChange={async (value) => {
            await push({ query: { ...query, view: value } });
          }}
        >
          <Tabs.List position="center">
            <Tabs.Tab value={"standings"}>Player Standings</Tabs.Tab>
            <Tabs.Tab value={"recentMatches"}>Recent Matches</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="standings">
            <PlayerStandings playerStandings={playerData.standings} />
            {/*<SimpleGrid*/}
            {/*  cols={3}*/}
            {/*  mt="xl"*/}
            {/*  breakpoints={[*/}
            {/*    { maxWidth: 1300, cols: 2 },*/}
            {/*    { maxWidth: 650, cols: 1 },*/}
            {/*  ]}*/}
            {/*>*/}
            {/*  <PlayerFactionOverview faction={localizedNames.american} {...playerData.american} />*/}
            {/*  <PlayerFactionOverview faction={localizedNames.german} {...playerData.german} />*/}
            {/*  <PlayerFactionOverview faction={localizedNames.dak} {...playerData.dak} />*/}
            {/*  <PlayerFactionOverview faction={localizedNames.british} {...playerData.british} />*/}
            {/*</SimpleGrid>*/}
          </Tabs.Panel>
          <Tabs.Panel value={"recentMatches"}>
            <Space h="lg" />
            <PlayerRecentMatches
              playerMatchesData={playerMatchesData}
              profileID={playerID}
              error={error}
            />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};

// THIS code is super dirty to get the things done, needs to be fixed
// I am not sure if it's a good idea to have it as query parameter
// I am counting with the old url setup as we had on coh2stats https://coh2stats.com/players/76561198051168720-F3riG?view=recentMatches
// @ts-ignore
export async function getServerSideProps({ params, query }) {
  const { playerID } = params;
  const { view } = query;

  let playerData = null;
  let playerMatchesData = null;
  let error = null;

  try {
    const PromisePlayerCardFetch = fetch(
      `${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerCardInfoHttp?relicId=${playerID}`,
    );

    const PromisePlayerMatchesFetch =
      view == "recentMatches"
        ? fetch(`${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerMatchesHttp?relicId=${playerID}`)
        : Promise.resolve();

    const [PlayerCardRes, PlayerMatchesRes] = await Promise.all([
      PromisePlayerCardFetch,
      PromisePlayerMatchesFetch,
    ]);

    // Also check status code if not 200
    const playerAPIData = await PlayerCardRes.json();
    if (playerAPIData.errors) {
      throw Error(playerAPIData.errors[0].msg + " " + playerAPIData.errors[0].param);
    } else {
      playerData = processPlayerInfoAPIResponse(playerAPIData);
    }

    if (view === "recentMatches") {
      // @ts-ignore
      playerMatchesData = (await PlayerMatchesRes.json()).playerMatches;
      if (playerMatchesData.errors) {
        throw Error(playerAPIData.errors[0].msg + " " + playerAPIData.errors[0].param);
      } else {
        playerMatchesData = playerMatchesData.sort(
          (a: { completiontime: number }, b: { completiontime: number }) => {
            if (a.completiontime > b.completiontime) {
              return -1;
            } else {
              return 1;
            }
          },
        );
      }
    }
  } catch (e: any) {
    console.error(`Failed getting data for player id ${playerID}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: { playerID, playerData, error, playerMatchesData }, // will be passed to the page component as props
  };
}

export default PlayerCard;
