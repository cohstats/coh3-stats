import { logger } from "../../src/logger";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.setHeader("Cache-Control", "public").status(200).json({ nodeVersion: process.version });
  } catch (e) {
    logger.error(e);
    res.status(500).json({});
  }
}
