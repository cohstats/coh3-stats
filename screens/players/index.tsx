import { PlayerCardDataType, ProcessedMatch } from "../../src/coh3/coh3-types";
import { calculatePlayerSummary, PlayerSummaryType } from "../../src/players/utils";
import { localizedNames } from "../../src/coh3/coh3-data";
import { format } from "timeago.js";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import {
  AnalyticsPlayerCardMatchView,
  AnalyticsPlayerCardReplaysView,
  AnalyticsPlayerCardView,
} from "../../src/firebase/analytics";
import {
  Anchor,
  Avatar,
  Container,
  Group,
  Image,
  Space,
  Stack,
  Tabs,
  Title,
} from "@mantine/core";
import { generateKeywordsString } from "../../src/head-utils";
import Head from "next/head";
import Link from "next/link";
import { Steam } from "../../components/icon/steam";
import { PSNIcon } from "../../components/icon/psn";
import { XboxIcon } from "../../components/icon/xbox";
import PlayerSummary from "./components/player-summary";
import PlayerStandingsTab from "./components/player-standings-tab";
import PlayerRecentMatchesTab from "./components/player-recent-matches-tab";
import ErrorCard from "../../components/error-card";
import PlayerIdIcon from "./components/player-id-icon";
import ReplaysTab from "./components/replays-tab";
import { ProcessedReplayData } from "../../src/apis/cohdb-api";
import { isBrowserEnv } from "../../src/utils";

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
  playerDataAPI,
  error,
  playerMatchesData,
  replaysData,
}: {
  playerID: string;
  playerDataAPI: PlayerCardDataType;
  error: string;
  playerMatchesData: Array<ProcessedMatch>;
  replaysData: ProcessedReplayData;
}) => {
  const { push, query, asPath } = useRouter();
  const { view } = query;

  const playerData = playerDataAPI;
  const platform = playerData?.platform;

  // This adds username to the url
  useEffect(() => {
    const cleanName = playerData.info.name.replace(/[^a-zA-Z0-9-_]/g, "");

    if (asPath.includes(cleanName)) return;

    // This is weird, I feel like there should be a better way to do this
    if (isBrowserEnv()) {
      const originalUrl = new URL(asPath, window.location.origin);
      const originalQuery = originalUrl.searchParams;
      const newURL = new URL(`/players/${playerID}/${cleanName}`, window.location.origin);
      newURL.search = originalQuery.toString();
      push(newURL.toString(), undefined, { shallow: true });
    }
  }, [playerID]);

  useEffect(() => {
    if (view === "recentMatches") {
      AnalyticsPlayerCardMatchView(playerID);
    } else if (view === "replays") {
      AnalyticsPlayerCardReplaysView(playerID);
    } else {
      AnalyticsPlayerCardView(playerID);
    }
  }, [playerID, view]);

  if (error || !playerData) {
    return (
      <Container size="lg">
        <ErrorCard title={"Error loading the player card"} body={error} />
      </Container>
    );
  }

  const pageTitle = `Player card - ${playerData.info.name}${
    view === "recentMatches" ? " - Recent Matches" : ""
  } ${view === "replays" ? " - Replays" : ""}`;

  const playerSummary = calculatePlayerSummary(playerData.standings);

  const description = createPlayerHeadDescription(playerData, playerSummary);
  const metaKeywords = generateKeywordsString([
    `${playerData.info.name} stats`,
    `${playerData.info.name} matches`,
    `coh3 ${playerData.info.name} stats`,
  ]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={metaKeywords} />
        {platform === "steam" && (
          <meta property="og:image" content={playerData.steamData?.avatarmedium} />
        )}
      </Head>
      <Container fluid>
        <Container fluid>
          <Group position={"apart"}>
            <Group>
              <Avatar
                src={playerData.steamData?.avatarmedium}
                imageProps={{ loading: "lazy" }}
                alt={playerData.info.name}
                size="xl"
                mt={5}
              />
              <Stack spacing={"xs"}>
                <Group>
                  <Image
                    src={"/flags/4x3/" + (playerData.info.country || "xx") + ".svg"}
                    imageProps={{ loading: "lazy" }}
                    alt={playerData.info.country}
                    width={40}
                  />
                  <Title> {playerData.info.name}</Title>
                </Group>
                <Group spacing={"xs"}>
                  {platform === "steam" && (
                    <Anchor
                      component={Link}
                      href={
                        playerData.steamData?.profileurl ||
                        `https://steamcommunity.com/profiles/${playerData.info.steamID}`
                      }
                      target="_blank"
                    >
                      <Steam label="Steam Profile" />
                    </Anchor>
                  )}
                  {platform === "psn" && <PSNIcon label="Play Station player" />}
                  {platform === "xbox" && <XboxIcon label="XBOX player" />}
                  <PlayerIdIcon
                    relicID={playerData.info.relicID}
                    steamID={playerData.info.steamID || undefined}
                  />
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
            <Tabs.Tab value={"replays"}>Replays</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="standings">
            <PlayerStandingsTab playerStandings={playerData.standings} platform={platform} />
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
            <PlayerRecentMatchesTab
              playerMatchesData={playerMatchesData}
              profileID={playerID}
              error={error}
            />
          </Tabs.Panel>
          <Tabs.Panel value={"replays"}>
            <Space h="lg" />
            <ReplaysTab replaysData={replaysData} profileID={playerID} error={error} />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};

export default PlayerCard;
