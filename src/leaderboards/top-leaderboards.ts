import { getLeaderBoardData } from "../coh3/coh3-api";
import { findAndMergeStatGroups } from "../coh3/helpers";
import { raceType, Top1v1LeaderboardsData } from "../coh3/coh3-types";
import { getOldLeaderboardData } from "../apis/coh3stats-api";

const AMOUNT_OF_PLAYERS = 12;

const getTop1v1LeaderBoards = async (race: raceType): Promise<Top1v1LeaderboardsData> => {
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

  return {
    race: race,
    data: leaderBoardData,
  };
};

export { getTop1v1LeaderBoards };
