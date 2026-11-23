import {
  leaderBoardType,
  leaderBoardTypeArray,
  raceType,
  raceTypeArray,
} from "../coh3/coh3-types";
import { getLeaderBoardData } from "../coh3/coh3-api";

export type LeaderboardStatsType = {
  totalPlayers: Record<raceType, Record<leaderBoardType, number>>;
  topElo: Record<raceType, Record<leaderBoardType, number>>;
  // Counts players with ELO 1600+
  elo1600: Record<raceType, Record<leaderBoardType, number>>;
  // Counts players with ELO 1800+
  elo1800: Record<raceType, Record<leaderBoardType, number>>;
};

/**
 * Fetches all leaderboards data and returns it as a LeaderboardStats object.
 * Fetches top 2 pages (400 players total) for each faction and game mode.
 */
const _fetchAllLeaderboardsData = async () => {
  // Fetch both page 1 (start=1, count=200) and page 2 (start=201, count=200)
  const promises = raceTypeArray.flatMap((faction) =>
    leaderBoardTypeArray.flatMap((gameMode) => [
      getLeaderBoardData(faction, gameMode, 1, 200, 1).then((data: any) => ({
        faction,
        gameMode,
        page: 1,
        data,
      })),
      getLeaderBoardData(faction, gameMode, 1, 200, 201).then((data: any) => ({
        faction,
        gameMode,
        page: 2,
        data,
      })),
    ]),
  );

  const entries = await Promise.all(promises);

  const result: {
    [factionName: string]: {
      [gameModeName: string]: any;
    };
  } = {};

  // Group entries by faction and gameMode, then merge the leaderboardStats
  entries.forEach(({ faction, gameMode, data }) => {
    if (!result[faction]) {
      result[faction] = {};
    }

    if (!result[faction][gameMode]) {
      // First page - initialize with the data
      result[faction][gameMode] = {
        ...data,
        leaderboardStats: [...data.leaderboardStats],
        statGroups: [...data.statGroups],
      };
    } else {
      // Second page - merge the leaderboardStats and statGroups arrays
      result[faction][gameMode].leaderboardStats = [
        ...result[faction][gameMode].leaderboardStats,
        ...data.leaderboardStats,
      ];
      result[faction][gameMode].statGroups = [
        ...result[faction][gameMode].statGroups,
        ...data.statGroups,
      ];
    }
  });

  return result;
};

// The stats page is generated once per locale. Share one result across all of them
// for a few minutes so we don't hit the Relic API with 32 calls per locale.
const STATS_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let statsCache: { promise: Promise<LeaderboardStatsType>; timestamp: number } | null = null;

const _resetLeaderboardStatsCache = () => {
  statsCache = null;
};

/**
 * Returns leaderboard stats, cached in memory for STATS_CACHE_DURATION_MS.
 * The promise itself is cached, so locales generated in parallel share one in-flight fetch.
 * Failed fetches are not cached.
 */
const calculateLeaderboardStats = async (): Promise<LeaderboardStatsType> => {
  if (statsCache && Date.now() - statsCache.timestamp < STATS_CACHE_DURATION_MS) {
    return statsCache.promise;
  }

  const entry = { promise: _calculateLeaderboardStats(), timestamp: Date.now() };
  statsCache = entry;

  try {
    return await entry.promise;
  } catch (e) {
    // Don't keep a failed result around; only clear it if nothing newer replaced it
    if (statsCache === entry) {
      statsCache = null;
    }
    throw e;
  }
};

const _calculateLeaderboardStats = async (): Promise<LeaderboardStatsType> => {
  const allLeaderboardsData = await _fetchAllLeaderboardsData();

  const result = {} as LeaderboardStatsType;

  result.totalPlayers = {
    american: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    british: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    dak: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    german: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
  };
  result.topElo = {
    american: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    british: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    dak: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    german: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
  };
  result.elo1600 = {
    american: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    british: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    dak: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    german: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
  };
  result.elo1800 = {
    american: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    british: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    dak: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
    german: { "1v1": 0, "2v2": 0, "3v3": 0, "4v4": 0 },
  };

  for (const race of raceTypeArray) {
    for (const leaderBoardType of leaderBoardTypeArray) {
      result.totalPlayers[race][leaderBoardType] =
        allLeaderboardsData[race][leaderBoardType].rankTotal;
      result.topElo[race][leaderBoardType] =
        allLeaderboardsData[race][leaderBoardType].leaderboardStats[0].rating;
      result.elo1600[race][leaderBoardType] = allLeaderboardsData[race][
        leaderBoardType
      ].leaderboardStats.filter((player: { rating: number }) => player.rating >= 1600).length;
      result.elo1800[race][leaderBoardType] = allLeaderboardsData[race][
        leaderBoardType
      ].leaderboardStats.filter((player: { rating: number }) => player.rating >= 1800).length;
    }
  }

  return result;
};

export { calculateLeaderboardStats, _fetchAllLeaderboardsData, _resetLeaderboardStatsCache };
