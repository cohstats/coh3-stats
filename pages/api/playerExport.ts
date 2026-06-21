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
import { z } from "zod";

// Zod schemas for request validation
const gameTypeSchema = z.enum(["1v1", "2v2", "3v3", "4v4"]);

// Custom preprocess to parse JSON string into array with custom error messages
const parseProfileIDs = (val: unknown) => {
  if (typeof val !== "string" || val.length === 0) {
    throw new Error("profile id param is missing");
  }

  let parsed;
  try {
    parsed = JSON.parse(val);
  } catch (e) {
    throw new Error("error parsing the profileIDs data");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("profileIDs must be an array");
  }

  if (parsed.length > 50) {
    throw new Error("Too many records requested");
  }

  return parsed as number[];
};

const parseTypes = (val: unknown) => {
  if (val === undefined) return undefined;

  if (typeof val !== "string") {
    throw new Error("types contains invalid data");
  }

  let parsed;
  try {
    parsed = JSON.parse(val);
  } catch (e) {
    throw new Error("error parsing the types data");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("types must be an array");
  }

  if (!parsed.every((type) => ["1v1", "2v2", "3v3", "4v4"].includes(type))) {
    throw new Error("parsedTypes contains invalid data");
  }

  return parsed as Array<"1v1" | "2v2" | "3v3" | "4v4">;
};

const playerExportQuerySchema = z.object({
  profileIDs: z.preprocess(parseProfileIDs, z.array(z.number())),
  types: z.preprocess(parseTypes, z.array(gameTypeSchema).optional()),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    logger.log(
      `SSR - /api/playerExport, profileIDs: ${req.query.profileIDs}, types: ${req.query.types}`,
    );

    // Validate query parameters with Zod
    const validationResult = playerExportQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      logger.error(`Validation error: ${firstError.message}`);
      return res.status(400).json({ error: firstError.message });
    }

    const { profileIDs: arrayOfIds, types: parsedTypes } = validationResult.data;

    logger.log(`Going to parse ${arrayOfIds.length} ids`);
    logger.log(`List of IDs ${arrayOfIds}`);

    const playerStatsArray = await getMultiplePlayersStatsFromRelic(
      arrayOfIds.map((id) => `${id}`),
    );
    const finalArray = playerStatsArray.map((playerStats, index) => {
      const playerInfo = processPlayerInfoAPIResponse(playerStats);
      return generateCSVObject(
        playerInfo,
        arrayOfIds[index],
        parsedTypes as Array<"1v1" | "2v2" | "3v3" | "4v4"> | undefined,
      );
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
