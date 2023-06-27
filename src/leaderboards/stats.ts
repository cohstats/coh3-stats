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
  // Counts players on level 16+
  topLevelPlayers: Record<raceType, Record<leaderBoardType, number>>;
};

/**
 * Fetches all leaderboards data and returns it as a LeaderboardStats object.
 */
const _fetchAllLeaderboardsData = async () => {
  const promises = raceTypeArray.flatMap((faction) =>
    leaderBoardTypeArray.map((gameMode) =>
      getLeaderBoardData(faction, gameMode, 1, 200, 1).then((data: any) => ({
        faction,
        gameMode,
        data,
      })),
    ),
  );

  const entries = await Promise.all(promises);

  const result: {
    [factionName: string]: {
      [gameModeName: string]: any;
    };
  } = {};

  entries.forEach(({ faction, gameMode, data }) => {
    if (!result[faction]) {
      result[faction] = {};
    }
    result[faction][gameMode] = data;
  });

  return result;
};

const calculateLeaderboardStats = async () => {
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
  result.topLevelPlayers = {
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
      result.topLevelPlayers[race][leaderBoardType] = allLeaderboardsData[race][
        leaderBoardType
      ].leaderboardStats.filter((player: { ranklevel: number }) => player.ranklevel >= 16).length;
    }
  }

  return result;
};

export { calculateLeaderboardStats, _fetchAllLeaderboardsData };
