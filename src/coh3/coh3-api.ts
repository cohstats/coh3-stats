import { leaderBoardType, platformType, raceType, RawLaddersObject } from "./coh3-types";
import {
  apiTitleTypes,
  leaderboardRegions,
  LeaderboardRegionTypes,
  leaderboardsIDAsObject,
} from "./coh3-data";

const BASE_API_URL = "https://coh3-api.reliclink.com";

/**
 * @param profileIDs max 10 items
 * @param platform
 */
const getPersonalStatsUrl = (profileIDs: string[], platform: platformType = "steam"): string => {
  const title = apiTitleTypes[platform];

  return encodeURI(
    `${BASE_API_URL}/community/leaderboard/getpersonalstat?profile_ids=[${profileIDs.join(",")}]&title=${title}`,
  );
};

/**
 *
 * @param leaderboard_id
 * @param sortBy 1 - ELO, 0 - Wins*
 * @param count 1 - 200
 * @param start
 * @param platform
 * @param region
 */
const _getLeaderBoardsUrl = (
  leaderboard_id: number,
  sortBy = 0,
  count = 100,
  start = 1,
  platform: platformType = "steam",
  region: LeaderboardRegionTypes | null = null,
) => {
  const title = apiTitleTypes[platform];

  return encodeURI(
    `${BASE_API_URL}/community/leaderboard/getleaderboard2?count=${count}&leaderboard_id=${leaderboard_id}&start=${start}&sortBy=${sortBy}${region ? `&leaderboardRegion_id=${leaderboardRegions[region].id}` : ""}&title=${title}`,
  );
};

const getLeaderBoardData = async (
  race: raceType,
  leaderBoardType: leaderBoardType,
  sortBy: number, // 1 - ELO, 0 - Wins*
  count: number,
  start: number,
  platform: platformType = "steam",
  region: LeaderboardRegionTypes | null = null,
): Promise<RawLaddersObject> => {
  const lbID = leaderboardsIDAsObject[leaderBoardType][race];
  const url = _getLeaderBoardsUrl(lbID, sortBy, count, start, platform, region);

  const res = await fetch(url, { keepalive: true });

  if (!res.ok) {
    const error = `Leaderboard API request failed with status ${res.status}: ${res.statusText}`;
    console.error(error, { url, status: res.status, statusText: res.statusText });
    throw new Error(error);
  }

  return await res.json();
};

export { getLeaderBoardData, _getLeaderBoardsUrl, getPersonalStatsUrl };
