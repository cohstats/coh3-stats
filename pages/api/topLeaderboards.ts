import { NextApiRequest, NextApiResponse } from "next";
import { logger } from "../../src/logger";
import { getTop1v1LeaderBoards } from "../../src/leaderboards/top-leaderboards";
import { raceType } from "../../src/coh3/coh3-types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = req.query;
    const { race } = query;
    const data = await getTop1v1LeaderBoards(race as raceType);

    res.setHeader("Cache-Control", "public, max-age=60").status(200).json(data);
  } catch (e) {
    logger.error(e);
    res.status(500).json({});
  }
}
