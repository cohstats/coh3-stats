import { logger } from "../../src/logger";
import { NextApiRequest, NextApiResponse } from "next";
import config from "../../config";
import { generateExpireTimeStamps, getGMTTimeStamp } from "../../src/utils";
import { getStatsData } from "../../src/apis/coh3stats-api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const statsPatchSelector = config.statsPatchSelector;
    const fromTimeStamp = getGMTTimeStamp(new Date(statsPatchSelector[config.latestPatch].from));

    const data = await getStatsData(
      fromTimeStamp,
      "now",
      "mapStats",
      "https://coh3stats.com",
      ["all"],
      {
        Origin: "https://coh3stats.com",
      },
    );

    const response = {
      latestPatchInfo: statsPatchSelector[config.latestPatch],
      mapStats: data,
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
