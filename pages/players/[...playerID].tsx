import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import { getPlayerCardInfo, getPlayerCardStatsOrNull } from "../../src/apis/coh3stats-api";
import { GetServerSideProps } from "next";
import { getReplaysForPlayer, ProcessReplaysData } from "../../src/apis/cohdb-api";

import PlayerCard from "../../screens/players";
import { PlayerProfileCOHStats, ProcessedCOHPlayerStats } from "../../src/coh3/coh3-types";
import {
  gameTypesIDsTypeAsKey,
  leaderboardsIDAsObject,
  raceIDsNameAsKey,
} from "../../src/coh3/coh3-data";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const ProcessPlayerCardStatsData = (
  playerStatsData: PlayerProfileCOHStats | null,
): ProcessedCOHPlayerStats => {
  const processedActivityByDate = [];
  for (const [date, value] of Object.entries(playerStatsData?.stats?.activityByDate || {})) {
    processedActivityByDate.push({
      day: date,
      value: value.w - value.l,
      wins: value.w,
      losses: value.l,
    });
  }

  const processedActivityByHour = [];
  for (const [hour, value] of Object.entries(playerStatsData?.stats?.activityByHour || {})) {
    processedActivityByHour.push({
      hour,
      value: value.w + value.l,
      wins: value.w,
      losses: value.l,
    });
  }

  const processedActivityByDayOfWeek = [];
  for (const [dayOfWeek, value] of Object.entries(
    playerStatsData?.stats?.activityByWeekDay || {},
  )) {
    processedActivityByDayOfWeek.push({
      day: dayOfWeek,
      value: value.w + value.l,
      wins: value.w,
      losses: value.l,
    });
  }

  const nemesisArray = Object.entries(playerStatsData?.stats?.nemesis || {})
    .map(([id, value]) => ({
      profile_id: id,
      ...value,
    }))
    .sort((a, b) => b.w + b.l - (a.w + a.l));

  const statGroupKey = Object.keys(playerStatsData?.stats?.statGroups || {})[0];
  const playerStatGroupId = statGroupKey?.match(/^\d+-\d+-(\d+)$/)?.[1];
  if (!playerStatGroupId) {
    console.warn("Failed to get playerStatGroupId from statGroupKey", statGroupKey);
  }

  const statGroupsStats = {
    "1v1": {
      german:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["german"]}-${gameTypesIDsTypeAsKey["1v1"]}-${playerStatGroupId}`
        ] || null,
      american:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["american"]}-${gameTypesIDsTypeAsKey["1v1"]}-${playerStatGroupId}`
        ] || null,
      dak:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["dak"]}-${gameTypesIDsTypeAsKey["1v1"]}-${playerStatGroupId}`
        ] || null,
      british:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["british"]}-${gameTypesIDsTypeAsKey["1v1"]}-${playerStatGroupId}`
        ] || null,
    },
    "2v2": {
      german:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["german"]}-${gameTypesIDsTypeAsKey["2v2"]}-${playerStatGroupId}`
        ] || null,
      american:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["american"]}-${gameTypesIDsTypeAsKey["2v2"]}-${playerStatGroupId}`
        ] || null,
      dak:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["dak"]}-${gameTypesIDsTypeAsKey["2v2"]}-${playerStatGroupId}`
        ] || null,
      british:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["british"]}-${gameTypesIDsTypeAsKey["2v2"]}-${playerStatGroupId}`
        ] || null,
    },
    "3v3": {
      german:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["german"]}-${gameTypesIDsTypeAsKey["3v3"]}-${playerStatGroupId}`
        ] || null,
      american:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["american"]}-${gameTypesIDsTypeAsKey["3v3"]}-${playerStatGroupId}`
        ] || null,
      dak:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["dak"]}-${gameTypesIDsTypeAsKey["3v3"]}-${playerStatGroupId}`
        ] || null,
      british:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["british"]}-${gameTypesIDsTypeAsKey["3v3"]}-${playerStatGroupId}`
        ] || null,
    },
    "4v4": {
      german:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["german"]}-${gameTypesIDsTypeAsKey["4v4"]}-${playerStatGroupId}`
        ] || null,
      american:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["american"]}-${gameTypesIDsTypeAsKey["4v4"]}-${playerStatGroupId}`
        ] || null,
      dak:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["dak"]}-${gameTypesIDsTypeAsKey["4v4"]}-${playerStatGroupId}`
        ] || null,
      british:
        playerStatsData?.stats?.statGroups[
          `${raceIDsNameAsKey["british"]}-${gameTypesIDsTypeAsKey["4v4"]}-${playerStatGroupId}`
        ] || null,
    },
  };

  // This is stat group ID for the player - it's in format 2387-2130255, where the first is stat group / second is leaderboard ID
  // So far relic stores only personal player leaderboards but in the future they might add teams
  const statGroupID = Object.keys(playerStatsData?.leaderboardStats || {})[0]?.match(
    /^(\d+)-\d+$/,
  )?.[1];

  // Recheck later if we need to do any modifications of the data
  const leaderBoardStats = {
    "1v1": {
      german:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["1v1"].german}`
        ] || null,
      american:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["1v1"].american}`
        ] || null,
      dak:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["1v1"].dak}`
        ] || null,
      british:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["1v1"].british}`
        ] || null,
    },
    "2v2": {
      german:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["2v2"].german}`
        ] || null,
      american:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["2v2"].american}`
        ] || null,
      dak:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["2v2"].dak}`
        ] || null,
      british:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["2v2"].british}`
        ] || null,
    },
    "3v3": {
      german:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["3v3"].german}`
        ] || null,
      american:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["3v3"].american}`
        ] || null,
      dak:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["3v3"].dak}`
        ] || null,
      british:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["3v3"].british}`
        ] || null,
    },
    "4v4": {
      german:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["4v4"].german}`
        ] || null,
      american:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["4v4"].american}`
        ] || null,
      dak:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["4v4"].dak}`
        ] || null,
      british:
        playerStatsData?.leaderboardStats?.[
          `${statGroupID}-${leaderboardsIDAsObject["4v4"].british}`
        ] || null,
    },
  };

  const processedAliasHistory =
    playerStatsData?.alias_history?.map((data) => ({
      alias: data.alias,
      updatedAt: data.updatedAt._seconds,
    })) || [];

  return {
    activityByWeekDay: processedActivityByDayOfWeek,
    activityByDate: processedActivityByDate,
    activityByHour: processedActivityByHour,
    nemesis: nemesisArray,
    customGamesHidden: playerStatsData?.customGamesHidden?.hidden || false,
    statGroups: statGroupsStats,
    leaderBoardStats: leaderBoardStats,
    aliasHistory: processedAliasHistory,
  };
};

export const getServerSideProps: GetServerSideProps<any, { playerID: string }> = async ({
  params,
  query,
  req,
  res,
  locale = "en",
}) => {
  const playerID = params?.playerID[0] || "";
  const { view, start } = query;
  const xff = `${req.headers["x-forwarded-for"]}`;

  const isReplaysPage = view === "replays";
  // const viewStandings = view === "standings";

  console.log(`SSR - /players/${playerID}, view: ${view}`);

  let playerData = null;
  let playerStatsData = null;
  let error = null;
  let replaysData = null;

  // const prevPage = req.headers.referer;
  // const prevPlayerId = prevPage?.match(/.+players\/(\d+).+/)?.[1];
  // const isSamePlayer = prevPlayerId === playerID;
  // const isFromPlayerPage = isSamePlayer && Boolean(prevPage?.includes("/players/"));

  try {
    const PromisePlayerCardData = getPlayerCardInfo(playerID, true, xff);
    const PromisePlayerCardStatsData = getPlayerCardStatsOrNull(playerID, xff);
    const PromiseReplaysData = isReplaysPage
      ? getReplaysForPlayer(playerID, start as string | undefined)
      : Promise.resolve();

    const [playerAPIData, playerCardStatsData, replaysAPIDAta] = await Promise.all([
      PromisePlayerCardData,
      PromisePlayerCardStatsData,
      PromiseReplaysData,
    ]);

    playerStatsData = playerCardStatsData?.playerStats
      ? ProcessPlayerCardStatsData(playerCardStatsData.playerStats)
      : null;
    playerData = playerAPIData ? processPlayerInfoAPIResponse(playerAPIData) : null;
    replaysData = isReplaysPage ? ProcessReplaysData(replaysAPIDAta) : null;

    res.setHeader("Cache-Control", "public, max-age=15, s-maxage=30, stale-while-revalidate=60");
    res.setHeader("x-robots-tag", "nofollow");
  } catch (e: any) {
    console.error(`Failed getting data for player id ${playerID}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: {
      playerID,
      playerDataAPI: playerData,
      error,
      playerStatsData,
      replaysData,
      ...(await serverSideTranslations(locale, ["common"])),
    }, // will be passed to the page component as props
  };
};

export default PlayerCard;
