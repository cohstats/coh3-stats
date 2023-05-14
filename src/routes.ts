import { isUndefined } from "lodash";
import { leaderBoardType, raceType } from "./coh3/coh3-types";

export const getLeaderBoardRoute = (race?: raceType, type?: leaderBoardType, start?: number) => {
  const searchParams = new URLSearchParams(
    Object.assign(
      {},
      !isUndefined(race) && { race },
      !isUndefined(type) && { type },
      !isUndefined(start) && { start },
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

export const getExplorerFactionRoute = (race: raceType) => {
  return encodeURI(`/explorer/races/${race}`);
};

export const getExplorerFactionUnitsRoute = (race: raceType) => {
  return encodeURI(`/explorer/races/${race}/units`);
};

export const getExplorerUnitRoute = (race: raceType, unitId: string) => {
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

export const getPlayerCardRoute = (playerId: string) => {
  return encodeURI(`/players/${playerId}`);
};

export const getSearchRoute = (searchQuery: string) => {
  return encodeURI(`/search?q=${searchQuery}`);
};
