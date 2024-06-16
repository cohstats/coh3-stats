import config from "../../config";
import {
  GlobalAchievementsData,
  leaderBoardType,
  ProcessedMatch,
  raceType,
  TwitchStream,
  YouTubeVideo,
} from "../coh3/coh3-types";
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
  ock: string, //ock is used for correct cors caching
) => {
  return encodeURI(
    `${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}/getAnalysisStatsHttp?startDate=${startDate}&endDate=${endDate}&type=${type}&v=v9&ock=${ock}`,
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

const getYouTubeVideosHttp = async (): Promise<Array<YouTubeVideo>> => {
  const path = encodeURI(`${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}/getYouTubeVideosHttp`);

  try {
    const response = await fetch(path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      logger.error(`Error getting youtube videos: ${response.status}`);
      return [];
    }

    const data = await response.json();

    return data.videos;
  } catch (e) {
    logger.error(e);
    return [];
  }
};

const triggerPlayerNemesisAliasesUpdate = async (playerID: string | number) => {
  const path = encodeURI(
    `${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}/getPlayerNemesisUpdatesHttp?relicId=${playerID}`,
  );

  const response = await fetch(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

const _fetchFirstXLinesOfLeaderBoards = async (url: string, amountOfPlayers: number) => {
  const response = await fetch(url);

  // There seems to be an issue in Edgio build environment
  // Bug reported here https://forum.edg.io/t/nextjs-error-t-body-getreader-is-not-a-function/1166
  if (typeof response.body?.getReader === "function") {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";
    let lines: string[] = [];

    while (lines.length < amountOfPlayers && reader) {
      const { value, done } = await reader.read();
      if (done) break;

      // Decode and append to buffer
      buffer += decoder.decode(value || new Uint8Array(), { stream: true });

      // Split the buffer into lines
      const splitBuffer = buffer.split("},");

      // Save the last part of the current buffer for the next iteration
      buffer = splitBuffer.pop() || "";

      // Add the complete lines to our lines array
      lines.push(...splitBuffer);

      // If we have more than 10 lines, truncate the array
      if (lines.length >= amountOfPlayers) {
        lines = lines.slice(0, amountOfPlayers);
        break;
      }
    }

    // Remove the starts of the file
    lines[0] = lines[0].replace('{"leaderboards":[', "");

    return lines.reduce((acc: Record<string, any>, line) => {
      // Add the missing closing bracket and parse the JSON
      const obj = JSON.parse(line + "}");

      // Use the statgroup_id as the key
      acc[obj.statgroup_id] = obj;

      return acc;
    }, {});
  } else {
    // Handle scenario where getReader is not supported
    console.info(
      "Stream API not supported, cannot read response body in chunks, fallback to full load",
    );
    const data = await response.json();
    const leaderboards = data["leaderboards"].slice(0, amountOfPlayers);
    return leaderboards.reduce((acc: Record<string, any>, obj: any) => {
      acc[obj.statgroup_id] = obj;
      return acc;
    }, {});
  }
};

/**
 * Fetches only top x items for now
 * https://storage.coh3stats.com/leaderboards/1718064000/1718064000_1v1_american.json
 * @param timeStamp
 * @param type
 * @param race
 * @param amountOfPlayers
 */
const getOldLeaderboardData = async (
  timeStamp: string | number,
  type: leaderBoardType,
  race: raceType,
  amountOfPlayers: number,
) => {
  const url = `${config.STORAGE_LINK}/leaderboards/${timeStamp}/${timeStamp}_${type}_${race}.json`;

  try {
    const data = await _fetchFirstXLinesOfLeaderBoards(url, amountOfPlayers);
    return data;
  } catch (e) {
    console.error(e);
    return {};
  }
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
  getYouTubeVideosHttp,
  triggerPlayerNemesisAliasesUpdate,
  getOldLeaderboardData,
};
