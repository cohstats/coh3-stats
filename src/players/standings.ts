import {
  COH3StatsPlayerInfoAPI,
  leaderBoardType,
  PlayerCardDataType,
  raceType,
  RawLeaderboardStat,
  RawStatGroup,
} from "../coh3/coh3-types";
import { leaderboardsIDsToTypes, PlayerRanks } from "../coh3/coh3-data";
import { calculatePlayerTier, convertSteamNameToID } from "../coh3/helpers";

const calculateHighestRankTier = (leaderboardStats: Array<RawLeaderboardStat>) => {
  let bestTier = PlayerRanks.NO_RANK;
  let bestTierInfo = null;

  for (const stat of leaderboardStats) {
    const currentTier = calculatePlayerTier(stat?.rank, stat?.rating);
    if (currentTier.order < bestTier.order) {
      bestTier = currentTier;
      bestTierInfo = leaderboardsIDsToTypes[stat.leaderboard_id];
    }
  }

  return {
    tier: bestTier,
    info: bestTierInfo,
  };
};

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

  // This will not be present for other platforms
  const possibleSteamId = convertSteamNameToID(playerData.name);

  return {
    relicID: playerData.profile_id,
    name: playerData.alias,
    country: playerData.country,
    level: playerData.level,
    xp: playerData.xp,
    steamID: possibleSteamId !== "" ? possibleSteamId : null,
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
    highestRankTier: calculateHighestRankTier(data.RelicProfile.leaderboardStats),
    steamData: Object.values(data.SteamProfile || {})[0] || null,
    COH3PlayTime: data.COH3PlayTime || null,
    topTeamsSummary: data.topTeamsSummary || null,
  };
};

export {
  getPlayerInfo,
  preparePlayerStandings,
  processPlayerInfoAPIResponse,
  calculateHighestRankTier,
};
