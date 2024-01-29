import config from "../../config";
import { GlobalAchievementsData, ProcessedMatch, TwitchStream } from "../coh3/coh3-types";
import { analysisType, getAnalysisStatsHttpResponse } from "../analysis-types";
import { cleanXForwardedFor, parseFirstIPFromString } from "../utils";
import { logger } from "../logger";

const getPlayerCardInfoUrl = (playerID: string | number, cache_proxy = false) => {
  const path = `/getPlayerCardInfoHttp?relicId=${playerID}`;

  return cache_proxy
    ? encodeURI(`${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getPlayerCardStatsUrl = (playerID: string | number, cache_proxy = true) => {
  const path = `/getPlayerCardStatsHttp?relicId=${playerID}`;

  return cache_proxy
    ? encodeURI(`${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getPlayerRecentMatchesUrl = (playerID: string | number) => {
  return encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerMatchesHttp?relicId=${playerID}`);
};

const getTwitchStreamsUrl = () => {
  return encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}/getTwitchStreamsHttp`);
};

const getGlobalAchievementsUrl = (cache_proxy = true) => {
  const path = `/getGlobalAchievementsHttp`;

  return cache_proxy
    ? encodeURI(`${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getStatsUrl = (
  startDate: number,
  endDate: number | "now" = "now",
  type: analysisType = "gameStats",
  ock: string,
) => {
  return encodeURI(
    `${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}/getAnalysisStatsHttp?startDate=${startDate}&endDate=${endDate}&type=${type}&v=v8&ock=${ock}`,
  );
};

const getStatsData = async (
  startDate: number,
  endDate: number | "now" = "now",
  type: analysisType = "gameStats",
  ock: string,
) => {
  const response = await fetch(getStatsUrl(startDate, endDate, type, ock));
  const data: getAnalysisStatsHttpResponse = await response.json();

  if (response.ok) {
    return data;
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting the stats data: ${data.error}`);
    }
    throw new Error(`Error getting the stats data`);
  }
};

/**
 * Returns the array of EN twitch streams sorted by viewer count
 */
const getTwitchStreams = async (XForwardedFor: string): Promise<Array<TwitchStream>> => {
  const xff = cleanXForwardedFor(XForwardedFor);

  const response = await fetch(getTwitchStreamsUrl(), {
    headers: {
      "X-Forwarded-For": xff,
      "c-edge-ip": parseFirstIPFromString(xff),
    },
  });
  const data = await response.json();

  if (response.ok) {
    return data.twitchStreams;
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting Twitch streams: ${data.error}`);
    }
    throw new Error(`Error getting Twitch streams`);
  }
};

const getPlayerCardInfo = async (
  playerID: string | number,
  cache_proxy = false,
  XForwardedFor: string,
) => {
  const xff = cleanXForwardedFor(XForwardedFor);

  const response = await fetch(getPlayerCardInfoUrl(playerID, cache_proxy), {
    headers: {
      "X-Forwarded-For": xff,
      "c-edge-ip": parseFirstIPFromString(xff),
    },
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    if (response.status === 500) {
      throw new Error(`Error getting player card info: ${data.error}`);
    }
    throw new Error(`Error getting player card info`);
  }
};

/**
 * Player Card Stats are cached until 7AM , when it's refreshed.
 * @param playerID
 * @param XForwardedFor
 */
const getPlayerCardStatsOrNull = async (playerID: string | number, XForwardedFor: string) => {
  const xff = cleanXForwardedFor(XForwardedFor);

  try {
    const response = await fetch(getPlayerCardStatsUrl(playerID, true), {
      headers: {
        "X-Forwarded-For": xff,
        "c-edge-ip": parseFirstIPFromString(xff),
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      if (response.status === 500) {
        logger.error(`Error getting player card stats: ${data.error}`);
        throw new Error(`Error getting player card info: ${data.error}`);
      }
    }
  } catch (e) {
    logger.error(`Error getting player card stats: ${e}`);
    return null;
  }
};

const getPlayerRecentMatches = async (playerID: string | number, XForwardedFor: string) => {
  const xff = cleanXForwardedFor(XForwardedFor);

  const response = await fetch(getPlayerRecentMatchesUrl(playerID), {
    headers: {
      "X-Forwarded-For": xff,
      "c-edge-ip": parseFirstIPFromString(xff),
    },
  });

  if (response.ok) {
    const data = await response.json();
    const playerMatchesData: Array<ProcessedMatch> = data.playerMatches;

    // Sort by completion time
    return playerMatchesData.sort(
      (a: { completiontime: number }, b: { completiontime: number }) => {
        if (a.completiontime > b.completiontime) {
          return -1;
        } else {
          return 1;
        }
      },
    );
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting player recent matches: ${data.error}`);
    }
    throw new Error(`Error getting player recent matches`);
  }
};

const getGlobalAchievements = async (XForwardedFor: string): Promise<GlobalAchievementsData> => {
  const xff = cleanXForwardedFor(XForwardedFor);

  const response = await fetch(getGlobalAchievementsUrl(), {
    headers: {
      "X-Forwarded-For": xff,
      "c-edge-ip": parseFirstIPFromString(xff),
    },
  });
  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting global achievements streams: ${data.error}`);
    }
    throw new Error(`Error getting global achievements streams`);
  }
};

/**
 *
 * @param playerIDs
 * @param value TRUE to HIDE custom games with action setCustomGamesHidden
 * @param password
 * @param action
 */
const setPlayerCardsConfigAdminHttp = async (
  playerIDs: string[],
  value: boolean,
  password: string,
  action = "setCustomGamesHidden",
) => {
  const path = encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}/setPlayerCardsConfigHttp`);

  // POST request to the given path
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerIDs: JSON.stringify(playerIDs),
      value: value.toString(),
      action,
      password,
    }),
  });

  return await response.json();
};

const getPlayersCardsConfigsHttp = async (): Promise<{ profiles: Array<any> }> => {
  const path = encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayersCardsConfigsHttp`);

  const response = await fetch(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

export {
  getPlayerCardInfo,
  getPlayerRecentMatches,
  getTwitchStreams,
  getStatsData,
  getGlobalAchievements,
  getPlayerCardStatsOrNull,
  setPlayerCardsConfigAdminHttp,
  getPlayersCardsConfigsHttp,
};
