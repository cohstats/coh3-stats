import { leaderBoardType, platformType, raceType, RawLaddersObject } from "./coh3-types";
import {
  apiTitleTypes,
  leaderboardRegions,
  LeaderboardRegionTypes,
  leaderboardsIDAsObject,
} from "./coh3-data";

import axiosRetry from "axios-retry";
import axios from "axios";
import { Agent } from "https";
import rateLimit from "axios-rate-limit";
import { logger } from "../logger";

const BASE_API_URL = "https://coh3-api.reliclink.com";

const httpsAgent = new Agent({ keepAlive: true });

// Create rate limited axios instance with 8 requests per second
const rateLimitedAxios = rateLimit(axios.create({ httpsAgent }), { maxRPS: 8 });
axiosRetry(rateLimitedAxios, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Don't retry on 403 Forbidden
    return error.response?.status !== 403 && axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

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

  logger.debug(`Fetching leaderboard data with rate limit (maxRPS: 5): ${url}`);

  try {
    const response = await rateLimitedAxios.get(url);
    return response.data;
  } catch (error) {
    logger.error(`Leaderboard API request failed for ${url}: ${error}`);
    throw new Error(`Leaderboard API request failed: ${error}`);
  }
};

export { getLeaderBoardData, _getLeaderBoardsUrl, getPersonalStatsUrl, rateLimitedAxios };
