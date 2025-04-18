import {
  FactionSide,
  LaddersDataArrayObject,
  LaddersDataObject,
  PlayerReport,
  PlayersOnLiveGames,
  ProcessedMatch,
  raceType,
} from "./coh3-types";
import { isOfficialMap, maps, PlayerRanks, raceIDsAsObject } from "./coh3-data";

/**
 * Extracts just the string ID from the steam name used in the results of API.
 * @param name In format "/steam/76561198131099369"
 */
const convertSteamNameToID = (name: string): string => {
  const res = name.match(/\/steam\/(\d+)/);
  if (res) return res[1];
  return "";
};

/**
 * Converts the start and end time to the duration in format HH:MM:SS, max 24 hours
 * @param startTime
 * @param endTime
 */
export const getMatchDuration = (startTime: number, endTime: number) => {
  const durationSeconds = endTime - startTime;
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${pad(minutes)}:${pad(seconds)}`;
  }
};

/**
 * Converts the game time to the duration in format HH:MM:SS, max 24 hours
 * @param gameTime
 */
export const getMatchDurationGameTime = (gameTime: number) => {
  return new Date(gameTime * 1000).toISOString().slice(11, 19); //return duration in HH:MM:SS format
};

const getFactionSide = (faction: raceType): FactionSide => {
  if (faction === "american" || faction === "british") {
    return "allies";
  } else {
    return "axis";
  }
};

const getMatchPlayersByFaction = <T extends PlayerReport | PlayersOnLiveGames>(
  reportedPlayerResults: Array<T>,
  faction: "axis" | "allies",
): Array<T> => {
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

/**
 * Converts the server map name to the localized name
 * @param mapName
 */
const getMapLocalizedName = (mapName: string) => {
  if (!isOfficialMap(mapName)) {
    return mapName;
  } else {
    return maps[mapName].name;
  }
};

const getMatchURlsWithoutLeavers = (match: ProcessedMatch) => {
  // If someone left they have lower game time
  const gameTime = match.matchhistoryreportresults.reduce((acc, cur) => {
    return acc > cur.counters.gt ? acc : cur.counters.gt;
  }, 0);

  // Filter out players that left the game
  const profileIDsWithoutLeavers = match.matchhistoryreportresults.filter(
    (player) => player.counters.gt === gameTime,
  );

  return match.matchurls.filter((url) =>
    profileIDsWithoutLeavers.find((player) => player.profile_id === url.profile_id),
  );
};

export {
  getFactionSide,
  findAndMergeStatGroups,
  convertSteamNameToID,
  getMatchPlayersByFaction,
  calculatePlayerTier,
  getMapLocalizedName,
  getMatchURlsWithoutLeavers,
};
