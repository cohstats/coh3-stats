/**
 * This is unique API component, we won't be using this much.
 * The reason we have this here is, so we can cache it.
 */

import { getNumberOfOnlinePlayersSteamUrl } from "../../src/apis/steam-api";
import { logger } from "../../src/logger";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fetchResponse = await fetch(getNumberOfOnlinePlayersSteamUrl());
    const { response } = await fetchResponse.json();

    res
      .setHeader(
        "Cache-Control",
        "public, max-age=300, s-maxage=180, stale-while-revalidate=1200",
      )
      .status(200)
      .json({ playerCount: response.player_count, timeStampMs: new Date().valueOf() });
  } catch (e) {
    logger.error(e);
    res.status(500).json({});
  }
}
