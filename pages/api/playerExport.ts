/**
 * This is special function used by tournaments organizations to generate
 * the latest info for their tables.
 */
import { logger } from "../../src/logger";
import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import { json2csv } from "json-2-csv";
import { NextApiRequest, NextApiResponse } from "next";
import { generateCSVObject } from "../../src/players/export";
import { getMultiplePlayersStatsFromRelic } from "../../src/coh3/coh3-players";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = req.query;
    const { profileIDs, types } = query;

    logger.log(`SSR - /api/playerExport, profileIDs: ${profileIDs}, types: ${types}`);

    if (!profileIDs) {
      return res.status(400).json({ error: "profile id param is missing" });
    }

    if (typeof profileIDs !== "string") {
      return res.status(400).json({ error: "profile id contains invalid data" });
    }

    // Parse and validate profileIDs
    let arrayOfIds: Array<number>;
    try {
      arrayOfIds = JSON.parse(profileIDs);
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ error: "error parsing the profileIDs data" });
    }

    if (!Array.isArray(arrayOfIds)) {
      return res.status(400).json({ error: "profileIDs must be an array" });
    }

    logger.log(`Going to parse ${arrayOfIds.length} ids`);
    logger.log(`List of IDs ${arrayOfIds}`);
    if (arrayOfIds.length > 50) {
      return res.status(400).json({ error: "Too many records requested" });
    }

    // Parse and validate types
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

      if (!Array.isArray(parsedTypes)) {
        return res.status(400).json({ error: "types must be an array" });
      }

      if (!parsedTypes.every((type) => ["1v1", "2v2", "3v3", "4v4"].includes(type))) {
        return res.status(400).json({ error: "parsedTypes contains invalid data" });
      }
    }

    const playerStatsArray = await getMultiplePlayersStatsFromRelic(
      arrayOfIds.map((id) => `${id}`),
    );
    const finalArray = playerStatsArray.map((playerStats, index) => {
      const playerInfo = processPlayerInfoAPIResponse(playerStats);
      return generateCSVObject(playerInfo, arrayOfIds[index], parsedTypes || undefined);
    });

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
