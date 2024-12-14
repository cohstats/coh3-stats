/**
 * This is special function used by tournaments organizations to generate
 * the latest info for their tables.
 */
import { logger } from "../../src/logger";
import { getPlayerCardInfo } from "../../src/apis/coh3stats-api";
import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import { PlayerCardDataType } from "../../src/coh3/coh3-types";
import { json2csv } from "json-2-csv";
import { NextApiRequest, NextApiResponse } from "next";
import { generateCSVObject } from "../../src/players/export";
import { chunk } from "lodash";

const getPlayerInfo = async (profileID: string, xff: string): Promise<PlayerCardDataType> => {
  return processPlayerInfoAPIResponse(await getPlayerCardInfo(profileID, true, xff));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = req.query;
    const xff = `${req.headers["x-forwarded-for"]}`;
    const { profileIDs, types } = query;

    logger.log(`SSR - /api/playerExport, profileIDs: ${profileIDs}, types: ${types}`);

    if (!profileIDs) {
      return res.status(400).json({ error: "profile id param is missing" });
    }

    if (typeof profileIDs !== "string") {
      return res.status(400).json({ error: "profile id contains invalid data" });
    }
    let parsedTypes: ["1v1", "2v2", "3v3", "4v4"];

    if (types !== undefined && typeof types !== "string") {
      return res.status(400).json({ error: "types contains invalid data" });
    }

    if (types !== undefined) {
      try {
        parsedTypes = JSON.parse(types);
      } catch (e) {
        logger.error(e);
        return res.status(400).json({ error: "error parsing the types data" });
      }

      if (!parsedTypes.every((type) => ["1v1", "2v2", "3v3", "4v4"].includes(type))) {
        return res.status(400).json({ error: "parsedTypes contains invalid data" });
      }
    }

    const arrayOfIds: Array<string> = JSON.parse(profileIDs);
    logger.log(`Going to parse ${arrayOfIds.length} ids`);
    logger.log(`List of IDs ${arrayOfIds}`);
    if (arrayOfIds.length > 50) {
      return res.status(400).json({ error: "Too many records requested" });
    }

    const finalArray = [];

    for (const singleChunk of chunk(arrayOfIds, 2)) {
      const playerInfoPromises = singleChunk.map((profileId) => getPlayerInfo(profileId, xff));
      const playerInfoArray = await Promise.all(playerInfoPromises);
      const playerInfoAsCSVObjects = playerInfoArray.map((playerInfo, index) =>
        generateCSVObject(playerInfo, singleChunk[index], parsedTypes || undefined),
      );
      finalArray.push(...playerInfoAsCSVObjects);
    }

    res
      .status(200)
      .setHeader("Cache-Control", "public, max-age=60")
      .setHeader("content-type", "text/csv")
      .send(json2csv(finalArray, {}));
  } catch (e) {
    logger.error(e);
    res.status(500).json({ error: "error processing the request" });
  }
}
