import config from "../config";
import { ProcessedMatch, TwitchStream } from "./coh3/coh3-types";
import { analysisType, getAnalysisStatsHttpResponse } from "./analysis-types";

const getPlayerCardInfoUrl = (playerID: string | number, cache_proxy = false) => {
  const path = `/getPlayerCardInfoHttp?relicId=${playerID}`;

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

const getStatsUrl = (
  startDate: number,
  endDate: number | "now" = "now",
  type: analysisType = "gameStats",
  ock: string,
) => {
  return encodeURI(
    `${config.BASED_CLOUD_FUNCTIONS_PROXY_URL}/getAnalysisStatsHttp?startDate=${startDate}&endDate=${endDate}&type=${type}&v=v7&ock=${ock}`,
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
const getTwitchStreams = async (): Promise<Array<TwitchStream>> => {
  const response = await fetch(getTwitchStreamsUrl());
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

const getPlayerCardInfo = async (playerID: string | number, cache_proxy = false) => {
  const response = await fetch(getPlayerCardInfoUrl(playerID, cache_proxy));
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

const getPlayerRecentMatches = async (playerID: string | number) => {
  const response = await fetch(getPlayerRecentMatchesUrl(playerID));

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

export { getPlayerCardInfo, getPlayerRecentMatches, getTwitchStreams, getStatsData };
