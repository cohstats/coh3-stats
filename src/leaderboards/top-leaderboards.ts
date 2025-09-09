import { getLeaderBoardData } from "../coh3/coh3-api";
import { findAndMergeStatGroups } from "../coh3/helpers";
import { raceType, Top1v1LeaderboardsData } from "../coh3/coh3-types";
import { getOldLeaderboardData } from "../apis/coh3stats-api";

const AMOUNT_OF_PLAYERS = 12;
const CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

// Simple in-memory cache
interface CacheEntry {
  data: Top1v1LeaderboardsData;
  timestamp: number;
}

const cache = new Map<raceType, CacheEntry>();

const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_DURATION_MS;
};

const getTop1v1LeaderBoards = async (race: raceType): Promise<Top1v1LeaderboardsData> => {
  const cachedEntry = cache.get(race);

  // Check if we have valid cached data
  if (cachedEntry && isCacheValid(cachedEntry)) {
    return cachedEntry.data;
  }

  const date = new Date();
  const yesterdayTimeStamp =
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1, 0, 0, 0) / 1000;

  const promisedLeaderBoardDataRaw = getLeaderBoardData(
    race,
    "1v1",
    1,
    AMOUNT_OF_PLAYERS,
    1,
    "steam",
  );
  const promisedOldData = getOldLeaderboardData(
    yesterdayTimeStamp,
    "1v1",
    race,
    AMOUNT_OF_PLAYERS,
  );

  // Old data is already well formatted
  const [leaderBoardDataRaw, oldData] = await Promise.all([
    promisedLeaderBoardDataRaw,
    promisedOldData,
  ]);
  // We need to convert the RAW data
  let leaderBoardData = findAndMergeStatGroups(leaderBoardDataRaw, null);

  // Add the change there
  leaderBoardData = leaderBoardData.map((value) => {
    if (oldData[value.statgroup_id]) {
      value.change = oldData[value.statgroup_id].rank - value.rank;
    } else {
      value.change = "new";
    }
    return value;
  });

  const result = {
    race: race,
    data: leaderBoardData,
  };

  // Cache the result
  cache.set(race, {
    data: result,
    timestamp: Date.now(),
  });

  return result;
};

export { getTop1v1LeaderBoards };
