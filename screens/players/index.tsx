import { PlayerCardDataType, ProcessedCOHPlayerStats } from "../../src/coh3/coh3-types";
import { calculatePlayerSummary, PlayerSummaryType } from "../../src/players/utils";
import { localizedNames } from "../../src/coh3/coh3-data";
import { format } from "timeago.js";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";
import {
  AnalyticsPlayerCardActivityView,
  AnalyticsPlayerCardDetailedStatsView,
  AnalyticsPlayerCardMatchView,
  AnalyticsPlayerCardNemesisView,
  AnalyticsPlayerCardReplaysView,
  AnalyticsPlayerCardView,
} from "../../src/firebase/analytics";
import { Anchor, Avatar, Container, Group, Space, Stack, Tabs, Title } from "@mantine/core";
import { generateKeywordsString } from "../../src/head-utils";
import Head from "next/head";
import Link from "next/link";
import { Steam } from "../../components/icon/steam";
import { PSNIcon } from "../../components/icon/psn";
import { XboxIcon } from "../../components/icon/xbox";
import ErrorCard from "../../components/error-card";
import { ProcessedReplayData } from "../../src/apis/cohdb-api";
import { isBrowserEnv } from "../../src/utils";
import CountryFlag from "../../components/country-flag";
import PlayerIdIcon from "./tabs/components/player-id-icon";
import PlayerSummary from "./tabs/components/player-summary";
import DetailedStatsTab from "./tabs/detailed-stats-tab/detailed-stats-tab";
import PlayerRecentMatchesTab from "./tabs/recent-matches-tab/player-recent-matches-tab";
import PlayerStandingsTab from "./tabs/standings-tab/player-standings-tab";
import ActivityTab from "./tabs/activity-tab/activity-tab";
import NemesisTab from "./tabs/nemesis-tab";
import ReplaysTab from "./tabs/replays-tab/replays-tab";

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
  playerStatsData,
  replaysData,
}: {
  playerID: string;
  playerDataAPI: PlayerCardDataType | null;
  error: string;
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  replaysData: ProcessedReplayData;
}) => {
  const { push, query, asPath, replace } = useRouter();
  const { view } = query;
  const { t } = useTranslation("players");

  const playerData = playerDataAPI;
  // Default to steam
  const platform = playerData?.platform || "steam";

  // This adds username to the url
  useEffect(() => {
    const cleanName = playerData?.info.name.replace(/[^a-zA-Z0-9-_]/g, "");

    if ((cleanName && asPath.includes(cleanName)) || cleanName === undefined) return;

    // This is weird, I feel like there should be a better way to do this
    if (isBrowserEnv()) {
      const originalUrl = new URL(asPath, window.location.origin);
      const originalQuery = originalUrl.searchParams;
      const newURL = new URL(`/players/${playerID}/${cleanName}`, window.location.origin);
      newURL.search = originalQuery.toString();
      // Replace works the same way as push but doesn't add it into the history
      replace(newURL.toString(), undefined, { shallow: true });
    }
  }, [playerID]);

  useEffect(() => {
    if (view === "recentMatches") {
      AnalyticsPlayerCardMatchView(playerID);
    } else if (view === "replays") {
      AnalyticsPlayerCardReplaysView(playerID);
    } else if (view === "standingsDetails") {
      AnalyticsPlayerCardDetailedStatsView(playerID);
    } else if (view === "activity") {
      AnalyticsPlayerCardActivityView(playerID);
    } else if (view === "nemesis") {
      AnalyticsPlayerCardNemesisView(playerID);
    } else {
      AnalyticsPlayerCardView(playerID);
    }
  }, [playerID, view]);

  const tabChangeFunction = async (value: any) => {
    let haveAllData = true;
    // The replays are SSR data, we need to request them
    if (value === "replays") {
      haveAllData = false;
    }

    await push({ query: { ...query, view: value } }, undefined, {
      shallow: haveAllData,
    });
  };

  if (error || !playerData) {
    return (
      <Container size="lg">
        <ErrorCard title={t("card.error.title")} body={error} />
      </Container>
    );
  }

  const pageTitle =
    view === "recentMatches"
      ? t("card.titleWithView.recentMatches", { name: playerData.info.name })
      : view === "replays"
        ? t("card.titleWithView.replays", { name: playerData.info.name })
        : t("card.title", { name: playerData.info.name });

  const playerSummary = calculatePlayerSummary(playerData.standings);

  const description = createPlayerHeadDescription(playerData, playerSummary);
  const metaKeywords = generateKeywordsString([
    t("meta.keywords.stats", { name: playerData.info.name }),
    t("meta.keywords.matches", { name: playerData.info.name }),
    t("meta.keywords.cohStats", { name: playerData.info.name }),
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
      <Container fluid p={0}>
        <Container
          fluid
          pl={{ base: 1, xs: "md" }}
          pr={{ base: 1, xs: "md" }}
          pb={{ base: "xs", md: 0 }}
        >
          <Group justify={"space-between"}>
            <Group>
              <Avatar
                src={playerData.steamData?.avatarmedium}
                imageProps={{ loading: "lazy" }}
                alt={playerData.info.name}
                radius="sm"
                size="xl"
                mt={5}
              />
              <Stack gap={"xs"}>
                <Group>
                  <CountryFlag
                    countryCode={playerData.info.country || "xx"}
                    width={40}
                    height={30}
                  />
                  <Title> {playerData.info.name}</Title>
                </Group>
                <Group gap={"xs"}>
                  <PlayerIdIcon
                    relicID={playerData.info.relicID}
                    steamID={playerData.info.steamID || undefined}
                  />
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
                </Group>
              </Stack>
            </Group>
            <PlayerSummary
              playerSummary={playerSummary}
              highestRankTier={playerData.highestRankTier}
            />
          </Group>
        </Container>
        <Tabs
          variant={"outline"}
          keepMounted={false}
          value={(view as string) || "standings"}
          defaultValue={(view as string) || "standings"}
          onChange={tabChangeFunction}
        >
          <Tabs.List justify="center">
            <Tabs.Tab value={"standings"}>{t("tabs.standings")}</Tabs.Tab>
            <Tabs.Tab value={"standingsDetails"}>{t("tabs.standingsDetails")}</Tabs.Tab>
            <Tabs.Tab value={"recentMatches"}>{t("tabs.recentMatches")}</Tabs.Tab>
            <Tabs.Tab value={"activity"}>{t("tabs.activity")}</Tabs.Tab>
            <Tabs.Tab value={"nemesis"}>{t("tabs.nemesis")}</Tabs.Tab>
            <Tabs.Tab value={"replays"}>{t("tabs.replays")}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="standings">
            <PlayerStandingsTab
              playerStandings={playerData.standings}
              playerStatsData={playerStatsData}
              platform={platform}
              COH3PlayTime={playerData.COH3PlayTime}
            />
          </Tabs.Panel>
          <Tabs.Panel value="standingsDetails">
            <DetailedStatsTab playerStatsData={playerStatsData} />
          </Tabs.Panel>
          <Tabs.Panel value={"recentMatches"}>
            <Space h="lg" />
            <PlayerRecentMatchesTab
              profileID={playerID}
              customGamesHidden={playerStatsData?.customGamesHidden}
            />
          </Tabs.Panel>
          <Tabs.Panel value={"activity"}>
            <ActivityTab playerStatsData={playerStatsData} platform={platform} />
          </Tabs.Panel>
          <Tabs.Panel value={"nemesis"}>
            <NemesisTab
              playerStatsData={playerStatsData}
              platform={platform}
              profileID={playerID}
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
