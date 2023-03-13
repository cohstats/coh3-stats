import config from "../config";
import { TwitchStream } from "./coh3/coh3-types";

const getPlayerCardInfoUrl = (playerID: string | number) => {
  return encodeURI(
    `${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerCardInfoHttp?relicId=${playerID}`,
  );
};

const getPlayerRecentMatchesUrl = (playerID: string | number) => {
  return encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerMatchesHttp?relicId=${playerID}`);
};

const getTwitchStreamsUrl = () => {
  return encodeURI(`${config.BASE_CLOUD_FUNCTIONS_URL}/getTwitchStreamsHttp`);
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
      throw new Error(`Error getting twitch streams: ${data.error}`);
    }
    throw new Error(`Error getting twitch streams`);
  }
};

const getPlayerCardInfo = async (playerID: string | number) => {
  const response = await fetch(getPlayerCardInfoUrl(playerID));
  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    if (response.status === 500) {
      const data = await response.json();
      throw new Error(`Error getting player card info: ${data.error}`);
    }
    throw new Error(`Error getting player card info`);
  }
};

const getPlayerRecentMatches = async (playerID: string | number) => {
  const response = await fetch(getPlayerRecentMatchesUrl(playerID));

  if (response.ok) {
    const data = await response.json();
    const playerMatchesData = data.playerMatches;

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

export { getPlayerCardInfo, getPlayerRecentMatches, getTwitchStreams };
