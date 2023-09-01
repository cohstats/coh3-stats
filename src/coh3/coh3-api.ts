import { leaderBoardType, platformType, raceType, RawLaddersObject } from "./coh3-types";
import { apiTitleTypes, leaderboardsIDAsObject } from "./coh3-data";

const BASE_API_URL = "https://coh3-api.reliclink.com";

/**
 *
 * @param leaderboard_id
 * @param sortBy 1 - ELO, 0 - Wins*
 * @param count 1 - 200
 * @param start
 * @param platform
 */
const getLeaderBoardsUrl = (
  leaderboard_id: number,
  sortBy = 0,
  count = 100,
  start = 1,
  platform: platformType = "steam",
) => {
  const title = apiTitleTypes[platform];

  return encodeURI(
    `${BASE_API_URL}/community/leaderboard/getleaderboard2?count=${count}&leaderboard_id=${leaderboard_id}&start=${start}&sortBy=${sortBy}&title=${title}`,
  );
};

const getLeaderBoardData = async (
  race: raceType,
  leaderBoardType: leaderBoardType,
  sortBy: number, // 1 - ELO, 0 - Wins*
  count: number,
  start: number,
  platform: platformType = "steam",
): Promise<RawLaddersObject> => {
  const lbID = leaderboardsIDAsObject[leaderBoardType][race];
  const url = getLeaderBoardsUrl(lbID, sortBy, count, start, platform);

  const res = await fetch(url, { keepalive: true });
  return await res.json();
};

export { getLeaderBoardData };
