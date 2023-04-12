import {leaderBoardType, raceType} from "../coh3/coh3-types";
import {getLeaderBoardData} from "../coh3/coh3-api";


type TotalPlayers = Record<raceType, Record<leaderBoardType, number>>;
type TopElo = Record<raceType, Record<leaderBoardType, number>>;

type LeaderboardStats = {
  totalPlayers: TotalPlayers;
  topElo: TopElo;

}



const calculateLeaderboardStats = () => {


  await getLeaderBoardData(
    ,
    typeToFetch,
    sortByToFetch,
    200,
    startToFetch,
  )

  return {

  }

}
