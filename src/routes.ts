import { leaderBoardType, raceType } from "./coh3/coh3-types";

const getLeaderBoardRoute = (race: raceType, type: leaderBoardType, start?: number) => {
  return encodeURI(`/leaderboards?race=${race}&type=${type}${start ? `&start=${start}` : ""}`);
};

const getExplorerFactionRoute = (race: raceType) => {
  return encodeURI(`/explorer/races/${race}`);
};

const getDPSCalculatorRoute = () => {
  return encodeURI(`/explorer/dps`);
};

export { getLeaderBoardRoute, getExplorerFactionRoute, getDPSCalculatorRoute };
