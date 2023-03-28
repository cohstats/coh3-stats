import {
  InternalStandings,
  leaderBoardType,
  ProcessedMatch,
  raceType,
  RawLeaderboardStat,
} from "../coh3/coh3-types";

const isPlayerVictorious = (matchRecord: ProcessedMatch, profileID: string): boolean => {
  if (!matchRecord) return false;

  const playerResult = getPlayerMatchHistoryResult(matchRecord, profileID);
  return playerResult?.resulttype === 1 || false;
};

const getPlayerMatchHistoryResult = (matchRecord: ProcessedMatch, profileID: string) => {
  for (const record of matchRecord.matchhistoryreportresults) {
    if (`${record.profile_id}` === `${profileID}`) {
      return record;
    }
  }
  return null;
};

const findBestValueOnLeaderboardStat = (
  data: Record<leaderBoardType, RawLeaderboardStat | null>,
  rating: "rating" | "ranklevel",
) => {
  let bestValue: number | null = 0;
  let bestValueKey = "";

  for (const [key, value] of Object.entries(data)) {
    if (value?.[rating] && value[rating] > (bestValue || 0)) {
      bestValue = value[rating] || null;
      bestValueKey = key;
    }
  }

  return {
    bestValue,
    bestValueKey,
  };
};

const findBestRankLeaderboardStat = (
  data: Record<leaderBoardType, RawLeaderboardStat | null>,
  rating: "rank",
) => {
  let bestValue: number | null = Infinity;
  let bestValueKey = "";

  for (const [key, value] of Object.entries(data)) {
    if (value?.[rating] && value[rating] < (bestValue || Infinity) && value[rating] > 0) {
      bestValue = value[rating] || null;
      bestValueKey = key;
    }
  }

  return {
    bestValue,
    bestValueKey,
  };
};

const bestElo = (
  { playerStandings }: { playerStandings: InternalStandings },
  faction1: raceType,
  faction2: raceType,
) => {
  const bestFaction1Elo = findBestValueOnLeaderboardStat(playerStandings[faction1], "rating");
  const bestFaction2Elo = findBestValueOnLeaderboardStat(playerStandings[faction2], "rating");

  if ((bestFaction1Elo.bestValue || 0) > (bestFaction2Elo.bestValue || 0)) {
    return {
      bestElo: bestFaction1Elo.bestValue,
      inMode: bestFaction1Elo.bestValueKey,
      inFaction: faction1,
    };
  } else {
    return {
      bestElo: bestFaction2Elo.bestValue,
      inMode: bestFaction2Elo.bestValueKey,
      inFaction: faction2,
    };
  }
};

const calculatePlayerSummary = (playerStandings: InternalStandings) => {
  const bestAxisElo = bestElo({ playerStandings }, "german", "dak");
  const bestAlliesElo = bestElo({ playerStandings }, "american", "british");

  const allRawLeaderboardStats = Object.values(playerStandings)
    .map((standings) => Object.values(standings))
    .flat();

  const totalGames = allRawLeaderboardStats.reduce((acc, cur) => {
    return acc + ((cur?.wins || 0) + (cur?.losses || 0));
  }, 0);

  const totalWins = allRawLeaderboardStats.reduce((acc, cur) => {
    return acc + (cur?.wins || 0);
  }, 0);
  const winRate = totalWins / totalGames;

  const lastMatchDate: number = allRawLeaderboardStats.reduce((acc, cur) => {
    return acc > (cur?.lastmatchdate || 0) ? acc : cur?.lastmatchdate || 0;
  }, 0);

  return {
    bestAxisElo,
    bestAlliesElo,
    totalGames,
    winRate,
    lastMatchDate,
  };
};

export type PlayerSummaryType = ReturnType<typeof calculatePlayerSummary>;

export {
  isPlayerVictorious,
  getPlayerMatchHistoryResult,
  findBestRankLeaderboardStat,
  findBestValueOnLeaderboardStat,
  calculatePlayerSummary,
};
