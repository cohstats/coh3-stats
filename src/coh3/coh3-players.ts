import { platformType, PlayerStatsFromRelicAllPlatforms } from "./coh3-types";
import { getPersonalStatsUrl } from "./coh3-api";

import axiosRetry from "axios-retry";
import axios from "axios";
import { Agent } from "https";
import rateLimit from "axios-rate-limit";
import { chunk } from "lodash";
import { logger } from "../logger";

const httpsAgent = new Agent({ keepAlive: true });

// Create rate limited axios instance with 5 requests per second
const rateLimitedAxios = rateLimit(axios.create({ httpsAgent }), { maxRPS: 5 });
axiosRetry(rateLimitedAxios, { retries: 2, retryDelay: axiosRetry.exponentialDelay });

const _hasData = (
  data:
    | string
    | "UNREGISTERED_PROFILE_NAME"
    | "UNKNOWN_PROFILE_IDS"
    | PlayerStatsFromRelicAllPlatforms
    | PlayerStatsFromRelicAllPlatforms[],
) => {
  if (Array.isArray(data)) {
    return data.length > 0;
  }
  return !(data === "UNREGISTERED_PROFILE_NAME" || data === "UNKNOWN_PROFILE_IDS");
};

const _getPlatformPlayerStatsFromRelic = async (
  profileIDs: string | string[],
  platform: platformType = "steam",
): Promise<PlayerStatsFromRelicAllPlatforms | PlayerStatsFromRelicAllPlatforms[] | string> => {
  // Handle single profile ID for backward compatibility
  if (typeof profileIDs === "string") {
    const url = getPersonalStatsUrl([profileIDs], platform);

    logger.debug(`Fetching player stats with rate limit (maxRPS: 5): ${url}`);
    const response = await rateLimitedAxios.get(url);
    const data = response.data;

    if (data["result"]["message"] === "SUCCESS" || data["result"]["code"] === 0) {
      return {
        platform,
        statGroups: data["statGroups"],
        leaderboardStats: data["leaderboardStats"],
      };
    } else if (data["result"]["message"] === "UNREGISTERED_PROFILE_NAME") {
      return "UNREGISTERED_PROFILE_NAME";
    } else if (data["result"]["message"] === "UNKNOWN_PROFILE_IDS") {
      return "UNKNOWN_PROFILE_IDS";
    } else {
      logger.error(`Error getting player profile data for playerID ${profileIDs}, ${data}`);
      throw new Error("ERROR GETTING PLAYER PROFILE DATA");
    }
  }

  // Handle array of profile IDs
  if (profileIDs.length === 0) {
    return [];
  }

  // Chunk the profile IDs into groups of 10 (Relic API limit)
  const RELIC_API_LIMIT = 10;
  const chunks = chunk(profileIDs, RELIC_API_LIMIT);
  const allResults: PlayerStatsFromRelicAllPlatforms[] = [];

  logger.debug(
    `Fetching player stats for ${profileIDs.length} profiles in ${chunks.length} chunks`,
  );

  // Process chunks sequentially to respect rate limiting
  for (const profileChunk of chunks) {
    try {
      const url = getPersonalStatsUrl(profileChunk, platform);
      logger.debug(`Fetching player stats chunk with rate limit (maxRPS: 5): ${url}`);

      const response = await rateLimitedAxios.get(url);
      const data = response.data;

      if (data["result"]["message"] === "SUCCESS" || data["result"]["code"] === 0) {
        // The API returns combined statGroups and leaderboardStats for all requested profiles
        // We need to separate them by profile
        const statGroups = data["statGroups"] || [];
        const leaderboardStats = data["leaderboardStats"] || [];

        // Group statGroups by profile_id (each statGroup has members array with profile info)
        const profileStatGroups: Record<string, any[]> = {};
        for (const statGroup of statGroups) {
          if (statGroup.members && statGroup.members.length > 0) {
            const profileId = statGroup.members[0].profile_id.toString();
            if (!profileStatGroups[profileId]) {
              profileStatGroups[profileId] = [];
            }
            profileStatGroups[profileId].push(statGroup);
          }
        }

        // Group leaderboardStats by statgroup_id and match to profiles
        const profileLeaderboardStats: Record<string, any[]> = {};
        for (const leaderboardStat of leaderboardStats) {
          // Find which profile this leaderboard stat belongs to by matching statgroup_id
          for (const statGroup of statGroups) {
            if (
              statGroup.id === leaderboardStat.statgroup_id &&
              statGroup.members &&
              statGroup.members.length > 0
            ) {
              const profileId = statGroup.members[0].profile_id.toString();
              if (!profileLeaderboardStats[profileId]) {
                profileLeaderboardStats[profileId] = [];
              }
              profileLeaderboardStats[profileId].push(leaderboardStat);
              break;
            }
          }
        }

        // Create individual results for each profile in the chunk
        for (const profileId of profileChunk) {
          const profileStatGroupsData = profileStatGroups[profileId] || [];
          const profileLeaderboardStatsData = profileLeaderboardStats[profileId] || [];

          if (profileStatGroupsData.length > 0 || profileLeaderboardStatsData.length > 0) {
            allResults.push({
              platform,
              statGroups: profileStatGroupsData,
              leaderboardStats: profileLeaderboardStatsData,
            });
          }
        }
      } else {
        logger.warn(
          `Error getting player profile data for chunk ${profileChunk.join(",")}: ${data["result"]["message"]}`,
        );
        // Continue processing other chunks even if one fails
      }
    } catch (error) {
      logger.error(`Error fetching player stats for chunk ${profileChunk.join(",")}, ${error}`);
      // Continue processing other chunks even if one fails
    }
  }

  return allResults;
};

const getMultiplePlayersStatsFromRelic = async (
  profileIDs: string[],
  platform: platformType = "steam",
): Promise<PlayerStatsFromRelicAllPlatforms[]> => {
  const result = await _getPlatformPlayerStatsFromRelic(profileIDs, platform);

  if (Array.isArray(result)) {
    return result;
  }

  // If it's a string error or single result, return empty array
  return [];
};

/**
 * Fetches player stats from Relic for all platforms.
 * Use only SERVER SIDE.
 * @param profileID
 */
const getPlayerStatsFromRelic = async (
  profileID: string,
): Promise<PlayerStatsFromRelicAllPlatforms> => {
  const playerDataSteam = await _getPlatformPlayerStatsFromRelic(profileID, "steam");

  if (!_hasData(playerDataSteam)) {
    const [playerDataXbox, playerDataPSN] = await Promise.all([
      _getPlatformPlayerStatsFromRelic(profileID, "xbox"),
      _getPlatformPlayerStatsFromRelic(profileID, "psn"),
    ]);

    if (_hasData(playerDataXbox)) {
      return playerDataXbox as PlayerStatsFromRelicAllPlatforms;
    } else if (_hasData(playerDataPSN)) {
      return playerDataPSN as PlayerStatsFromRelicAllPlatforms;
    } else {
      throw new Error(
        `ERROR GETTING PLAYER PROFILE DATA for playerID ${profileID}, STEAM: ${playerDataSteam}, XBOX: ${playerDataXbox}, PSN: ${playerDataPSN}`,
      );
    }
  }

  return playerDataSteam as PlayerStatsFromRelicAllPlatforms;
};

export { getPlayerStatsFromRelic, getMultiplePlayersStatsFromRelic };
