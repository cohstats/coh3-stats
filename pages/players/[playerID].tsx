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
import { PlayerCardDataType, ProcessedMatch } from "../../src/coh3/coh3-types";
import { getPlayerCardInfo, getPlayerRecentMatches } from "../../src/coh3stats-api";
import { GetServerSideProps } from "next";
import PlayerSummary from "../../components/player-card/player-summary";
import { calculatePlayerSummary, PlayerSummaryType } from "../../src/players/utils";
import { localizedNames } from "../../src/coh3/coh3-data";
import { format } from "timeago.js";

const createPlayerHeadDescription = (
  playerData: PlayerCardDataType,
  playerSummary: PlayerSummaryType,
): string => {
  return `Player card for player ${playerData.info.name} - coh3stats.com
  Best ALLIES ELO ${playerSummary.bestAlliesElo.bestElo} in ${
    playerSummary.bestAlliesElo.inMode
  } as ${localizedNames[playerSummary.bestAlliesElo.inFaction]}.
  Best AXIS ELO ${playerSummary.bestAxisElo.bestElo} in ${playerSummary.bestAxisElo.inMode} as ${
    localizedNames[playerSummary.bestAxisElo.inFaction]
  }.
  Total games ${playerSummary.totalGames} with Win Rate ${Math.round(
    playerSummary.winRate * 100,
  )}%.
  Last match ${format(playerSummary.lastMatchDate * 1000, "en")}`;
};

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
  playerMatchesData: Array<ProcessedMatch>;
}) => {
  const { push, query } = useRouter();
  const { view } = query;

  if (error) {
    return <Container size="lg">{error}</Container>;
  }

  const pageTitle = `Player card - ${playerData.info.name} ${
    view === "recentMatches" ? "recent matches" : ""
  }`;

  const playerSummary = calculatePlayerSummary(playerData.standings);

  const description = createPlayerHeadDescription(playerData, playerSummary);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content={`coh3, coh3stats,${playerData.info.name} stats, ${playerData.info.name} matches`}
        />
        <meta property="og:image" content={playerData.steamData.avatarmedium} />
      </Head>
      <Container fluid>
        <Container fluid>
          <Group position={"apart"}>
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
              </Stack>
            </Group>
            <PlayerSummary playerSummary={playerSummary} />
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

export const getServerSideProps: GetServerSideProps<any, { playerID: string }> = async ({
  params,
  query,
  res,
}) => {
  const { playerID } = params!;
  const { view } = query;

  const viewPlayerMatches = view === "recentMatches";

  let playerData = null;
  let playerMatchesData = null;
  let error = null;

  try {
    const PromisePlayerCardData = getPlayerCardInfo(playerID);

    const PromisePlayerMatchesData = viewPlayerMatches
      ? getPlayerRecentMatches(playerID)
      : Promise.resolve();

    const [playerAPIData, PlayerMatchesAPIData] = await Promise.all([
      PromisePlayerCardData,
      PromisePlayerMatchesData,
    ]);

    playerData = processPlayerInfoAPIResponse(playerAPIData);
    playerMatchesData = viewPlayerMatches ? PlayerMatchesAPIData : null;
  } catch (e: any) {
    console.error(`Failed getting data for player id ${playerID}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: { playerID, playerData, error, playerMatchesData }, // will be passed to the page component as props
  };
};

export default PlayerCard;
