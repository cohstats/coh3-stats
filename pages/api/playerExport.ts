/**
 * This is special function used by tournaments organizations to generate
 * the latest info for their tables.
 */
import { logger } from "../../src/logger";
import { getPlayerCardInfoUrl } from "../../src/coh3stats-api";
import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import { PlayerCardDataType } from "../../src/coh3/coh3-types";
import { json2csvAsync } from "json-2-csv";
import { NextApiRequest, NextApiResponse } from "next";
import { generateCSVObject } from "../../src/players/export";

const getPlayerCardInfo = async (profileID: string) => {
  const PlayerCardRes = await fetch(getPlayerCardInfoUrl(profileID));
  return await PlayerCardRes.json();
};

const getPlayerInfo = async (profileID: string): Promise<PlayerCardDataType> => {
  return processPlayerInfoAPIResponse(await getPlayerCardInfo(profileID));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = req.query;
    const { profileIDs, types } = query;

    if (!profileIDs) {
      return res.status(400).json({ error: "profile id param is missing" });
    }

    if (typeof profileIDs !== "string") {
      return res.status(400).json({ error: "profile id contains invalid params" });
    }
    let parsedTypes;

    if (types !== undefined && typeof types !== "string") {
      return res.status(400).json({ error: "profile id contains invalid params" });
    }
    if (types !== undefined) {
      parsedTypes = JSON.parse(types);
    }

    const arrayOfIds = JSON.parse(profileIDs);
    logger.log(`Going to parse ${arrayOfIds.length} ids`);
    logger.log(`List of IDs ${arrayOfIds}`);
    if (arrayOfIds.length > 100) {
      return res.status(500).json({ error: "Too many records requested" });
    }

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
