import { platformType, PlayerStatsFromRelicAllPlatforms } from "./coh3-types";
import { getPersonalStatsUrl } from "./coh3-api";

import axiosRetry from "axios-retry";
import axios from "axios";
import { Agent } from "https";
import rateLimit from "axios-rate-limit";

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
  profileIDs: string,
  platform: platformType = "steam",
): Promise<
  PlayerStatsFromRelicAllPlatforms | "UNREGISTERED_PROFILE_NAME" | "UNKNOWN_PROFILE_IDS"
> => {
  // Handle single profile ID for backward compatibility
  const url = getPersonalStatsUrl([profileIDs], platform);

  console.debug(`Fetching player stats with rate limit (maxRPS: 5): ${url}`);
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
    console.error(`Error getting player profile data for playerID ${profileIDs}`, data);
    throw new Error("ERROR GETTING PLAYER PROFILE DATA");
  }
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

export { getPlayerStatsFromRelic };
