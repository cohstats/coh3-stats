import {
  COH3StatsPlayerInfoAPI,
  leaderBoardType,
  PlayerCardDataType,
  raceType,
  RawLeaderboardStat,
  RawStatGroup,
} from "../coh3/coh3-types";
import { leaderboardsIDsToTypes } from "../coh3/coh3-data";

const preparePlayerStandings = (leaderboardStats: Array<RawLeaderboardStat>) => {
  const playerStandings: Record<raceType, Record<leaderBoardType, RawLeaderboardStat | null>> = {
    german: {
      "1v1": null,
      "2v2": null,
      "3v3": null,
      "4v4": null,
    },
    american: {
      "1v1": null,
      "2v2": null,
      "3v3": null,
      "4v4": null,
    },
    dak: {
      "1v1": null,
      "2v2": null,
      "3v3": null,
      "4v4": null,
    },
    british: {
      "1v1": null,
      "2v2": null,
      "3v3": null,
      "4v4": null,
    },
  };

  // Populate the player standings
  for (const stat of leaderboardStats) {
    const lt = leaderboardsIDsToTypes[stat.leaderboard_id];
    if (lt) playerStandings[lt.race][lt.type] = stat;
  }

  return playerStandings;
};

const getPlayerInfo = (statGroup: RawStatGroup) => {
  const playerData = statGroup.members[0];

  return {
    name: playerData.alias,
    country: playerData.country,
    level: playerData.level,
    xp: playerData.xp,
  };
};

const filterOnlyPlayerStatGroup = (statGroups: Array<RawStatGroup>) => {
  return statGroups.filter((statGroup) => {
    return statGroup.type === 1;
  })[0];
};

const processPlayerInfoAPIResponse = (data: COH3StatsPlayerInfoAPI): PlayerCardDataType => {
  return {
    platform: data.platform,
    standings: preparePlayerStandings(data.RelicProfile.leaderboardStats),
    info: getPlayerInfo(filterOnlyPlayerStatGroup(data.RelicProfile.statGroups)),
    steamData: Object.values(data.SteamProfile || {})[0] || null,
    COH3PlayTime: data.COH3PlayTime || null,
  };
};

export { getPlayerInfo, preparePlayerStandings, processPlayerInfoAPIResponse };
