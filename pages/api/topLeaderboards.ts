import { NextApiRequest, NextApiResponse } from "next";
import { logger } from "../../src/logger";
import { getTop1v1LeaderBoards } from "../../src/leaderboards/top-leaderboards";
import { z } from "zod";
import { raceTypeArray } from "../../src/coh3/coh3-types";

// Simple validation for race parameter
const validateRace = (race: unknown) => {
  const raceSchema = z.enum(raceTypeArray).optional().default("american");
  return raceSchema.parse(race);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate race parameter
    const race = validateRace(req.query.race);

    console.log(`SSR - /api/topLeaderboards, validated race: ${race}`);

    const data = await getTop1v1LeaderBoards(race);

    res.setHeader("Cache-Control", "public, max-age=60").status(200).json(data);
  } catch (e) {
    logger.error(`Error in topLeaderboards API: ${e}`);

    // Return more specific error for validation errors
    if (e instanceof Error && e.message.includes("Invalid")) {
      res.status(400).json({ error: e.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
