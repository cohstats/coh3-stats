import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import {
  getPlayerCardInfo,
  getPlayerRecentMatches,
  getPlayerCardStats,
} from "../../src/apis/coh3stats-api";
import { GetServerSideProps } from "next";
import { getReplaysForPlayer, ProcessReplaysData } from "../../src/apis/cohdb-api";

import PlayerCard from "../../screens/players";
import { PlayerProfileCOHStats, ProcessedCOHPlayerStats } from "../../src/coh3/coh3-types";

const ProcessPlayerCardStatsData = (
  playerStatsData: PlayerProfileCOHStats,
): ProcessedCOHPlayerStats => {
  const processedActivityByDate = [];
  for (const [date, value] of Object.entries(playerStatsData.stats?.activityByDate || {})) {
    processedActivityByDate.push({
      day: date,
      value: value.w - value.l,
      wins: value.w,
      losses: value.l,
    });
  }

  const processedActivityByHour = [];
  for (const [hour, value] of Object.entries(playerStatsData.stats?.activityByHour || {})) {
    processedActivityByHour.push({
      hour,
      value: value.w + value.l,
      wins: value.w,
      losses: value.l,
    });
  }

  const processedActivityByDayOfWeek = [];
  for (const [dayOfWeek, value] of Object.entries(
    playerStatsData.stats?.activityByWeekDay || {},
  )) {
    processedActivityByDayOfWeek.push({
      day: dayOfWeek,
      value: value.w + value.l,
      wins: value.w,
      losses: value.l,
    });
  }

  return {
    activityByWeekDay: processedActivityByDayOfWeek,
    activityByDate: processedActivityByDate,
    activityByHour: processedActivityByHour,
  };
};

export const getServerSideProps: GetServerSideProps<any, { playerID: string }> = async ({
  params,
  query,
  req,
}) => {
  const playerID = params?.playerID[0] || "";
  const { view, start } = query;
  const xff = `${req.headers["x-forwarded-for"]}`;

  const viewPlayerMatches = view === "recentMatches";
  const isReplaysPage = view === "replays";
  // const viewStandings = view === "standings";

  let playerData = null;
  let playerStatsData = null;
  let playerMatchesData = null;
  let error = null;
  let replaysData = null;

  // const prevPage = req.headers.referer;
  // const prevPlayerId = prevPage?.match(/.+players\/(\d+).+/)?.[1];
  // const isSamePlayer = prevPlayerId === playerID;
  // const isFromPlayerPage = isSamePlayer && Boolean(prevPage?.includes("/players/"));

  try {
    const PromisePlayerCardData = getPlayerCardInfo(playerID, true, xff);
    const PromisePlayerCardStatsData = getPlayerCardStats(playerID, xff);
    const PromiseReplaysData = isReplaysPage
      ? getReplaysForPlayer(playerID, start as string | undefined)
      : Promise.resolve();

    const PromisePlayerMatchesData = viewPlayerMatches
      ? getPlayerRecentMatches(playerID, xff)
      : Promise.resolve();

    const [playerAPIData, playerCardStatsData, PlayerMatchesAPIData, replaysAPIDAta] =
      await Promise.all([
        PromisePlayerCardData,
        PromisePlayerCardStatsData,
        PromisePlayerMatchesData,
        PromiseReplaysData,
      ]);

    playerStatsData = playerCardStatsData?.playerStats
      ? ProcessPlayerCardStatsData(playerCardStatsData.playerStats)
      : null;
    playerData = playerAPIData ? processPlayerInfoAPIResponse(playerAPIData) : null;
    playerMatchesData = viewPlayerMatches ? PlayerMatchesAPIData : null;
    replaysData = isReplaysPage ? ProcessReplaysData(replaysAPIDAta) : null;
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
      playerMatchesData,
      playerStatsData,
      replaysData,
    }, // will be passed to the page component as props
  };
};

export default PlayerCard;
