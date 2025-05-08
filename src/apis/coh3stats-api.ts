import config from "../../config";
import {
  GlobalAchievementsData,
  leaderBoardType,
  LiveGameSummary,
  PlayerReport,
  ProcessedMatch,
  raceType,
  ResponseLiveGames,
  TeamsFullSummary,
  TwitchStream,
  TypeOfLiveGame,
  YouTubeVideo,
  TeamDetails,
} from "../coh3/coh3-types";
import {
  analysisFilterType,
  analysisMapFilterType,
  analysisType,
  getAnalysisStatsHttpResponse,
} from "../analysis-types";
import { cleanXForwardedFor, parseFirstIPFromString } from "../utils";
import { logger } from "../logger";
import { getMatchURlsWithoutLeavers } from "../coh3/helpers";

export const GET_ANALYSIS_STATS = "v10";

const getPlayerCardInfoUrl = (playerID: string | number, cache_proxy = false) => {
  const path = `/getPlayerCardInfoGen2Http?relicId=${playerID}`;

  return cache_proxy
    ? encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getPlayerCardStatsUrl = (playerID: string | number, cache_proxy = true) => {
  const path = `/getPlayerCardStatsGen2Http?relicId=${playerID}`;

  return cache_proxy
    ? encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getPlayerRecentMatchesUrl = (playerID: string | number) => {
  return encodeURI(
    `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/getPlayerMatchesGen2Http?relicId=${playerID}`,
  );
};

const getMatchUrl = (matchID: string | number, profileIDs?: Array<string>) => {
  let url = `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/getMatchHttp?matchID=${matchID}`;

  if (profileIDs && profileIDs.length > 0) {
    url += `&profileIDs=[${profileIDs.join(",")}]`;
  }

  return encodeURI(url);
};

const getTwitchStreamsUrl = () => {
  return encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}/getTwitchStreamsHttp`);
};

const getSearchUrl = (searchQuery: string) => {
  return encodeURI(
    `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/sharedAPIGen2Http/search/players?alias=${searchQuery}`,
  );
};

const getGlobalAchievementsUrl = (cache_proxy = true) => {
  const path = `/getGlobalAchievementsHttp`;

  return cache_proxy
    ? encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getReplayUrl = (matchID: string | number) => {
  return encodeURI(`${config.BASE_REPLAY_STORAGE_URL}/${matchID}.rec`);
};

const setReplayFileUrl = () => {
  return encodeURI(
    // This will be in the browser / we don't want to touch our GCP directly without proxy
    `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/setReplayFileHttp`,
  );
};

const getLiveGamesSummaryUrl = () => {
  return encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/getLiveGamesSummaryHttp`);
};

const getStatsUrl = (
  startDate: number,
  endDate: number | "now" = "now",
  type: analysisType = "gameStats",
  ock: string, //ock is used for correct cors caching
  filters?: Array<analysisFilterType | analysisMapFilterType | "all">,
) => {
  if (filters?.includes("all")) {
    filters = undefined;
  }

  let url = `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/getAnalysisStatsHttp?startDate=${startDate}&endDate=${endDate}&type=${type}&v=${GET_ANALYSIS_STATS}&ock=${ock}`;

  if (filters && filters.length > 0) {
    const filtersString = filters.join(",");
    url += `&filters=${filtersString}`;
  }

  return encodeURI(url);
};

export const getLiveGamesSummary = async (): Promise<LiveGameSummary> => {
  const response = await fetch(getLiveGamesSummaryUrl());
  if (response.ok) {
    return await response.json();
  } else {
    logger.error(`Error getting live games summary - status code: ${response.status}`);
    throw new Error(`Error getting live games summary - status code: ${response.status}`);
  }
};

/**
 *
 * @param type
 * @param orderBy
 * @param start STARTS FROM 1
 * @param count
 */
export const getLiveGames = async (
  type: TypeOfLiveGame,
  orderBy: string,
  start = 1,
  count = 50,
): Promise<ResponseLiveGames> => {
  const response = await fetch(
    `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/getLiveGamesHttp?type=${type}&orderBy=${orderBy}&start=${start}&count=${count}`,
  );
  if (response.ok) {
    return await response.json();
  } else {
    logger.error(`Error getting live games: ${response.status}`);
    throw new Error(`Error getting live games: ${response.status}`);
  }
};

const getStatsData = async (
  startDate: number,
  endDate: number | "now" = "now",
  type: analysisType = "gameStats",
  ock: string,
  filters?: Array<analysisFilterType | analysisMapFilterType | "all">,
  headers?: Record<string, string>,
) => {
  const response = await fetch(getStatsUrl(startDate, endDate, type, ock, filters), {
    headers: headers,
  });

  if (response.ok) {
    const data: getAnalysisStatsHttpResponse = await response.json();
    return data;
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting the stats data: ${data.error}`);
    }
    console.log(response);
    logger.error(`Error getting the stats data - status code ${response.status}`);
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

const getMatch = async (matchID: string | number, playerIDs?: Array<string>) => {
  const response = await fetch(getMatchUrl(matchID, playerIDs));

  if (response.ok) {
    const data = await response.json();

    data.match.matchhistoryreportresults = data.match.matchhistoryreportresults.map(
      (result: PlayerReport) => {
        result.counters = JSON.parse(result.counters as unknown as string);
        return result;
      },
    );

    const matchData: ProcessedMatch = data.match;

    return matchData;
  } else {
    if (response.status === 404) {
      throw new Error(`Match not found`);
    }

    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting match data: ${data.error}`);
    }
    throw new Error(`Error getting match data`);
  }
};

const getPlayerRecentMatches = async (playerID: string | number) => {
  // const xff = cleanXForwardedFor(XForwardedFor);

  const response = await fetch(getPlayerRecentMatchesUrl(playerID), {
    // headers: {
    //   // "X-Forwarded-For": xff,
    //   // "c-edge-ip": parseFirstIPFromString(xff),
    // },
  });

  if (response.ok) {
    const data = await response.json();

    // Change the counters to JSON
    data.playerMatches.forEach((match: ProcessedMatch) => {
      match.matchhistoryreportresults.forEach((result: PlayerReport) => {
        result.counters = JSON.parse(result.counters as unknown as string);
      });
    });

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
  const path = encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/getYouTubeVideosHttp`);

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
    `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/getPlayerNemesisUpdatesHttp?relicId=${playerID}`,
  );

  const response = await fetch(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

const generateReplayUrl = async (matchObject: ProcessedMatch) => {
  const r2url = getReplayUrl(matchObject.id);

  let response;

  try {
    response = await fetch(r2url, { method: "HEAD" });
  } catch (e) {}
  if (response && response.status === 200) {
    return {
      url: r2url,
      status: "success",
    };
  } else {
    const replayURLs = getMatchURlsWithoutLeavers(matchObject);

    if (replayURLs.length === 0) {
      return {
        url: null,
        status: "error",
        message: "No replays without leavers available.",
      };
    }

    const response = await fetch(setReplayFileUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        matchID: matchObject.id,
        replayURLs: JSON.stringify(
          replayURLs.map((data) => {
            return {
              profile_id: data.profile_id,
              replay_id: data.key,
            };
          }),
        ),
      }),
    });

    const parsedResponse = await response.json();
    if (parsedResponse.status === "success") {
      return {
        url: r2url,
        status: "success",
      };
    } else if (parsedResponse.status === "error") {
      return {
        url: null,
        status: "error",
        message: parsedResponse.message,
      };
    }

    console.error(parsedResponse);

    throw new Error("Error generating replay url");
  }
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

const getTeamsFullSummaryUrl = (profileID: string | number, cache_proxy = true) => {
  const path = `/sharedAPIGen2Http/teams/fullSummary?profileID=${profileID}`;

  return cache_proxy
    ? encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getTeamDetailsUrl = (teamID: string | number, cache_proxy = true) => {
  const path = `/sharedAPIGen2Http/teams/details/${teamID}`;

  return cache_proxy
    ? encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getTeamMatchesUrl = (matchIDs: Array<string | number>, cache_proxy = true) => {
  const path = `/sharedAPIGen2Http/teams/matches?matchIDs=[${matchIDs.join(",")}]`;

  return cache_proxy
    ? encodeURI(`${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}${path}`)
    : encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}${path}`);
};

const getTeamsFullSummary = async (
  profileID: string | number,
  cache_proxy = true,
): Promise<TeamsFullSummary> => {
  const response = await fetch(getTeamsFullSummaryUrl(profileID, cache_proxy));

  if (response.ok) {
    return await response.json();
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting teams full summary: ${data.error}`);
    }
    throw new Error(`Error getting teams full summary`);
  }
};

const getTeamDetails = async (
  teamID: string | number,
  cache_proxy = true,
): Promise<TeamDetails> => {
  const response = await fetch(getTeamDetailsUrl(teamID, cache_proxy));

  if (response.ok) {
    return await response.json();
  } else {
    if (response.status === 404) {
      throw new Error("Team not found");
    }
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting team details: ${data.error}`);
    }
    throw new Error(`Error getting team details`);
  }
};

const getTeamMatches = async (
  matchIDs: Array<string | number>,
  cache_proxy = true,
): Promise<Record<number, ProcessedMatch>> => {
  if (matchIDs.length < 1 || matchIDs.length > 10) {
    throw new Error("Must provide between 1 and 10 match IDs");
  }

  const response = await fetch(getTeamMatchesUrl(matchIDs, cache_proxy));

  if (response.ok) {
    const data = await response.json();

    // Parse the counters field in each match
    Object.values(data as Record<number, ProcessedMatch>).forEach((match) => {
      match.matchhistoryreportresults.forEach((result: PlayerReport) => {
        result.counters = JSON.parse(result.counters as unknown as string);
      });
    });

    return data;
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting team matches: ${data.error}`);
    }
    throw new Error(`Error getting team matches`);
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
  getMatch,
  getYouTubeVideosHttp,
  triggerPlayerNemesisAliasesUpdate,
  getOldLeaderboardData,
  generateReplayUrl,
  getSearchUrl,
  getTeamsFullSummary,
  getTeamDetails,
  getTeamMatches,
};
