import { isUndefined } from "lodash";
import { leaderBoardType, platformType, raceType } from "./coh3/coh3-types";

export const getLeaderBoardRoute = (
  race?: raceType,
  type?: leaderBoardType,
  start?: number,
  platform: platformType = "steam",
) => {
  const searchParams = new URLSearchParams(
    Object.assign(
      {},
      !isUndefined(race) && { race },
      !isUndefined(type) && { type },
      !isUndefined(start) && { start },
      platform !== "steam" && { platform },
    ) as any,
  );
  let searchParamString = searchParams.toString();
  if (searchParamString.length > 0) {
    searchParamString = "?" + searchParamString;
  }
  return encodeURI(`/leaderboards${searchParamString}`);
};

export const getLeaderBoardStatsRoute = () => {
  return encodeURI(`/stats/leaderboards`);
};

export const getGlobalAchievementsStatsRoute = () => {
  return encodeURI(`/stats/achievements`);
};

export const getPlayersStatsRoute = () => {
  return encodeURI(`/stats/players`);
};

export const getGameStatsRoute = () => {
  return encodeURI(`/stats/games`);
};

export const getMapsStatsRoute = () => {
  return encodeURI(`/stats/maps`);
};

export const getExplorerFactionRoute = (race: raceType) => {
  return encodeURI(`/explorer/races/${race}`);
};

export const getExplorerFactionUnitsRoute = (race: raceType) => {
  return encodeURI(`/explorer/races/${race}/units`);
};

/**
 * @param race Notice the stupid afrika_korps and british_africa, they even have typos in the name. Relic :facepalm:
 * @param unitId
 */
export const getExplorerUnitRoute = (
  race: raceType | "afrika_korps" | "british_africa",
  unitId: string,
) => {
  // This is protection for some data generated differently
  if (race === "afrika_korps") {
    race = "dak";
  } else {
    if (race === "british_africa") {
      race = "british";
    }
  }

  return encodeURI(`/explorer/races/${race}/units/${unitId}`);
};

export const getDPSCalculatorRoute = () => {
  return encodeURI(`/explorer/dps`);
};

export const getUnitBrowserRoute = () => {
  return encodeURI(`/explorer/unit-browser`);
};

export const getDesktopAppRoute = () => {
  return encodeURI(`/desktop-app`);
};

export const getAboutRoute = () => {
  return encodeURI(`/about`);
};

export const getPlayerCardRoute = (playerId: string | number) => {
  return encodeURI(`/players/${playerId}`);
};

export const getSearchRoute = (searchQuery: string) => {
  return encodeURI(`/search?q=${searchQuery}`);
};

export const getOpenDataRoute = () => {
  return encodeURI(`/other/open-data`);
};

export const getPlayerExportRoute = () => {
  return encodeURI(`/other/player-export`);
};

export const getRankingTiersRoute = () => {
  return encodeURI(`/other/ranking-tiers`);
};
