import { LaddersDataArrayObject, LaddersDataObject } from "./coh3-types";
import { raceIDsAsObject } from "./coh3-data";

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
  reportedPlayerResults: Array<any>,
  faction: "axis" | "allies",
) => {
  const factionId = faction === "axis" ? 1 : 2;
  return reportedPlayerResults.filter(
    (playerResult) => raceIDsAsObject[playerResult.race_id]?.faction_id === factionId,
  );
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
};
