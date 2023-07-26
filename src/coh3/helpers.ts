import { LaddersDataArrayObject, LaddersDataObject, PlayerReport } from "./coh3-types";
import { PlayerRanks, raceIDsAsObject } from "./coh3-data";

/**
 * Extracts just the string ID from the steam name used in the results of API.
 * @param name In format "/steam/76561198131099369"
 */
const convertSteamNameToID = (name: string): string => {
  const res = name.match(/\/steam\/(\d+)/);
  if (res) return res[1];
  return "";
};

const getMatchDuration = (startTime: number, endTime: number) => {
  return new Date((endTime - startTime) * 1000).toISOString().substr(11, 8); //return duration in HH:MM:SS format
};

const getMatchPlayersByFaction = (
  reportedPlayerResults: Array<PlayerReport>,
  faction: "axis" | "allies",
): Array<PlayerReport> => {
  const factionId = faction === "axis" ? 1 : 2;
  return reportedPlayerResults.filter(
    (playerResult) => raceIDsAsObject[playerResult.race_id]?.faction_id === factionId,
  );
};

const calculatePlayerTier = (rank: number, rating: number) => {
  if (!rank || rank <= 0) {
    return PlayerRanks.NO_RANK;
  }

  if (rating < 1600) {
    const playerRank = Object.values(PlayerRanks).find((x) => x.min <= rating && rating <= x.max);

    return playerRank || PlayerRanks.NO_RANK;
  }

  // If rating is higher than 1600, take into account the rank.
  if (rating >= 1600) {
    // GOLD_1 is exception
    if (rank > 50) {
      return PlayerRanks.GOLD_1;
    }

    // Create a sorted array of PlayerRanks entries
    const sortedPlayerRanks = Object.entries(PlayerRanks).sort(
      ([, rankInfoA], [, rankInfoB]) => rankInfoA.rank - rankInfoB.rank,
    );

    let rankKey = "CHALLENGER_5";

    for (const [key, rankInfo] of sortedPlayerRanks) {
      if (rank <= rankInfo.rank) {
        rankKey = key;
        break;
      }
    }

    return PlayerRanks[rankKey];
  }

  return PlayerRanks.NO_RANK;
};

const findAndMergeStatGroups = (
  laddersDataObject: LaddersDataObject | null | undefined,
  laddersHistoryObject: LaddersDataObject | null | undefined,
): Array<LaddersDataArrayObject> => {
  if (!laddersDataObject) return [];

  const statGroups = laddersDataObject.statGroups;
  const leaderboardStats = laddersDataObject.leaderboardStats;

  const statGroupsArray: Array<LaddersDataArrayObject> = [];

  for (const stat of leaderboardStats) {
    const statGroup = statGroups.find((group) => {
      return stat.statgroup_id === group.id;
    });

    let change: number | string = 0;

    if (laddersHistoryObject) {
      const oldHistoryObject = laddersHistoryObject.leaderboardStats.find((statsObject) => {
        return statsObject.statgroup_id === stat.statgroup_id;
      });

      if (oldHistoryObject) {
        change = oldHistoryObject.rank - stat.rank;
      } else {
        change = "new";
      }
    }

    statGroupsArray.push({
      ...stat,
      ...{
        members: statGroup?.members,
        change: change,
      },
    } as LaddersDataArrayObject);
  }

  return statGroupsArray;
};

export {
  findAndMergeStatGroups,
  convertSteamNameToID,
  getMatchDuration,
  getMatchPlayersByFaction,
  calculatePlayerTier,
};
