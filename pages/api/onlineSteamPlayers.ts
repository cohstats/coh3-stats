/**
 * This is unique API component, we won't be using this much.
 * The reason we have this here is, so we can cache it.
 */

import { getNumberOfOnlinePlayersSteamUrl } from "../../src/steam-api";
import { logger } from "../../src/logger";

export default async function handler(req: any, res: any) {
  try {
    const fetchResponse = await fetch(getNumberOfOnlinePlayersSteamUrl());
    const { response } = await fetchResponse.json();

    res
      .setHeader("Cache-Control", "public")
      .status(200)
      .json({ playerCount: response.player_count, timeStampMs: new Date().valueOf() });
  } catch (e) {
    logger.error(e);
    res.status(500).json();
  }
}
