import { getLeaderBoardData } from "../coh3/coh3-api";
import { findAndMergeStatGroups } from "../coh3/helpers";
import { raceType, Top1v1LeaderboardsData } from "../coh3/coh3-types";

const getTop1v1LeaderBoards = async (race: raceType): Promise<Top1v1LeaderboardsData> => {
  const leaderBoardDataRaw = await getLeaderBoardData(race, "1v1", 0, 10, 1, "steam");
  const leaderBoardData = findAndMergeStatGroups(leaderBoardDataRaw, null);

  return {
    race: race,
    data: leaderBoardData,
  };
};

export { getTop1v1LeaderBoards };
