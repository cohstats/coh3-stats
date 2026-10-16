import { logger } from "../../src/logger";
import { NextApiRequest, NextApiResponse } from "next";
import config from "../../config";
import { generateExpireTimeStamps } from "../../src/utils";
import { maps } from "../../src/coh3/coh3-data";
import { getLatestPatchMapStats } from "../../src/stats/latest-patch-map-stats";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`SSR - /api/getLatestPatchMapStats`);

  try {
    const statsPatchSelector = config.statsPatchSelector;

    const data = await getLatestPatchMapStats();

    const response = {
      latestPatchInfo: statsPatchSelector[config.latestPatch],
      latestPatchDataTag: config.patches[config.latestPatch].dataTag,
      mapStats: data,
      mapInfo: maps,
    };

    res
      .setHeader("Cache-Control", "public")
      .setHeader("Expires", generateExpireTimeStamps(7))
      .status(200)
      .json(response);
  } catch (e) {
    logger.error(e);
    res.status(500).json({});
  }
}
