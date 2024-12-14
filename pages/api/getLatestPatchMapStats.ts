import { logger } from "../../src/logger";
import { NextApiRequest, NextApiResponse } from "next";
import config from "../../config";
import { generateExpireTimeStamps, getGMTTimeStamp } from "../../src/utils";
import { getStatsData } from "../../src/apis/coh3stats-api";
import { maps } from "../../src/coh3/coh3-data";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`SSR - /api/getLatestPatchMapStats`);

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

    // Remove the days object, we don't need it, lowers the amount of data
    // @ts-ignore
    data.analysis.days = undefined;

    const response = {
      latestPatchInfo: statsPatchSelector[config.latestPatch],
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
