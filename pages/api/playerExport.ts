/**
 * This is special function used by tournaments organizations to generate
 * the latest info for their tables.
 */
import { logger } from "../../src/logger";
import { getPlayerCardInfoUrl } from "../../src/coh3stats-api";
import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import { leaderBoardType, PlayerCardDataType, raceType } from "../../src/coh3/coh3-types";
import { json2csvAsync } from "json-2-csv";

const getPlayerCardInfo = async (profileID: string) => {
  const PlayerCardRes = await fetch(getPlayerCardInfoUrl(profileID));
  return await PlayerCardRes.json();
};

const getPlayerInfo = async (profileID: string): Promise<PlayerCardDataType> => {
  return processPlayerInfoAPIResponse(await getPlayerCardInfo(profileID));
};

const generateCSVObject = (
  playerInfo: PlayerCardDataType,
  profileID: string,
  types = ["1v1", "2v2", "3v3", "4v4"],
) => {
  console.log("TYPEs", types);

  const standingsObject: any = {};

  for (const race of ["german", "american", "dak", "british"]) {
    for (const type of types) {
      const standing = playerInfo.standings[race as raceType][type as leaderBoardType];

      standingsObject[`${race}_${type}_rank`] = standing?.rank || null;
      standingsObject[`${race}_${type}_elo`] = standing?.rating || null;
      standingsObject[`${race}_${type}_total`] = standing
        ? standing.wins + standing.losses
        : null;
    }
  }

  // We do this because of the order of the keys on the object
  const playerInfoAsObject: any = {
    alias: playerInfo.info.name,
    relic_id: profileID,
    steam_id: playerInfo.steamData.steamid,
  };

  for (const type of types) {
    playerInfoAsObject[`${type}_axis_elo`] = Math.max(
      standingsObject[`german_${type}_elo`],
      standingsObject[`dak_${type}_elo`],
    );
    playerInfoAsObject[`${type}_allies_elo`] = Math.max(
      standingsObject[`american_${type}_elo`],
      standingsObject[`british_${type}_elo`],
    );
  }

  return {
    ...playerInfoAsObject,
    ...standingsObject,
  };
};

export default async function handler(req: any, res: any) {
  try {
    const query = req.query;
    const { profileIDs } = query;
    const { types } = query;

    if (!profileIDs) {
      throw new Error("Invalid params");
    }

    const arrayOfIds = JSON.parse(profileIDs);
    logger.log(`Going to parse ${arrayOfIds.length} ids`);
    logger.log(`List of IDs ${arrayOfIds}`);
    if (arrayOfIds.length > 100) {
      throw new Error("Too much records");
    }
    const parsedTypes = JSON.parse(types || null);

    const finalArray = [];

    for (const profileId of arrayOfIds) {
      const playerInfo = await getPlayerInfo(profileId);
      const playerInfoAsCSVObject = generateCSVObject(
        playerInfo,
        profileId,
        parsedTypes || undefined,
      );
      finalArray.push(playerInfoAsCSVObject);
    }

    res
      .status(200)
      .setHeader("content-type", "text/csv")
      .send(await json2csvAsync(finalArray, {}));
  } catch (e) {
    logger.error(e);
    res.status(500).json({ error: "error processing the request" });
  }
}
