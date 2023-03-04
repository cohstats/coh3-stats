import { leaderBoardType, raceType } from "./coh3/coh3-types";

const getLeaderBoardRoute = (race: raceType, type: leaderBoardType, start?: number) => {
  return encodeURI(`/leaderboards?race=${race}&type=${type}${start ? `&start=${start}` : ""}`);
};

export { getLeaderBoardRoute };
