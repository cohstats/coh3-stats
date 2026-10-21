import { getMultiplePlayersStatsFromRelic } from "../coh3/coh3-players";
import { logger } from "../logger";
import type { LadderPlayerNames } from "./ladder-tournament";

/**
 * Looks up the player names and countries on Relic. SERVER SIDE ONLY.
 * Never throws - returns the names it got, the missing players fall back to "Player #<id>".
 * @param relicIds Relic profile IDs, duplicates are removed
 */
export const getLadderPlayerNames = async (relicIds: number[]): Promise<LadderPlayerNames> => {
  const ids = [...new Set(relicIds)];
  const names: LadderPlayerNames = {};
  if (ids.length === 0) return names;

  try {
    const results = await getMultiplePlayersStatsFromRelic(ids.map((id) => `${id}`));
    const wanted = new Set(ids);

    for (const result of results) {
      for (const statGroup of result?.statGroups ?? []) {
        for (const member of statGroup?.members ?? []) {
          if (wanted.has(member.profile_id) && !names[member.profile_id]) {
            names[member.profile_id] = {
              alias: member.alias,
              country: member.country || null,
            };
          }
        }
      }
    }
  } catch (error) {
    logger.error(`Failed getting Ladder Tournament player names from Relic: ${error}`);
  }

  return names;
};
