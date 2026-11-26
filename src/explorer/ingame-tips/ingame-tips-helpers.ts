/**
 * Pure helpers over the parsed in-game tips. Safe to use in the browser - nothing here downloads.
 */

import type { IngameTip, IngameTipGameMode, IngameTipsData } from "./ingame-tips-types";

/** Game mode of the Final Stand tips in the data file. */
const FINAL_STAND_TIPS_GAME_MODE = "hoff";

type IngameTipsFilter = {
  /**
   * `null` = only the generic tips, a string = only the tips of that mode, `undefined` = all tips.
   * Use `includeGeneric` to add the generic tips to a mode.
   */
  gameMode?: IngameTipGameMode;
  /** With `gameMode` set to a mode, also keep the generic (`gameMode: null`) tips. */
  includeGeneric?: boolean;
  /** Keep only the tips of these topics. */
  topics?: string[];
  /** Keep only the tips of these categories. */
  categories?: string[];
};

const filterIngameTips = (
  data: IngameTipsData | IngameTip[] | null | undefined,
  filter: IngameTipsFilter = {},
): IngameTip[] => {
  const tips = Array.isArray(data) ? data : (data?.tips ?? []);
  const { gameMode, includeGeneric = false, topics, categories } = filter;

  return tips.filter(
    (tip) =>
      (gameMode === undefined ||
        tip.gameMode === gameMode ||
        (includeGeneric && tip.gameMode === null)) &&
      (!topics || topics.includes(tip.topic)) &&
      (!categories || categories.includes(tip.category)),
  );
};

/** Groups the tips by topic, keeping the order of the data file in both the keys and the lists. */
const groupIngameTipsByTopic = (tips: IngameTip[]): Record<string, IngameTip[]> => {
  const groups: Record<string, IngameTip[]> = {};
  for (const tip of tips) (groups[tip.topic] ??= []).push(tip);
  return groups;
};

/**
 * Picks a tip. Without a seed it is random; with a seed (eg. the day number, a match id) the pick
 * is stable, so the server and the client render the same tip and hydration doesn't mismatch.
 */
const pickIngameTip = <T = IngameTip>(tips: T[], seed?: number): T | null => {
  if (tips.length === 0) return null;

  const index =
    seed === undefined
      ? Math.floor(Math.random() * tips.length)
      : ((Math.floor(seed) % tips.length) + tips.length) % tips.length;

  return tips[index];
};

const getIngameTipById = (
  data: IngameTipsData | null | undefined,
  id: string,
): IngameTip | null => data?.tips.find((tip) => tip.id === id) ?? null;

export {
  FINAL_STAND_TIPS_GAME_MODE,
  filterIngameTips,
  getIngameTipById,
  groupIngameTipsByTopic,
  pickIngameTip,
};
export type { IngameTipsFilter };
