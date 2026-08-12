/**
 * Helpers for the Final Stand perks pages.
 *
 * Everything here works on the parsed data of `fs-perks.ts` - looking a faction / a perk up, turning
 * the icon paths of the data file into CDN urls and the small bits of formatting the perk cards need.
 */

import { cohDBracesToNormalRaces } from "../../coh3/coh3-data";
import { raceTypeArray, type raceType } from "../../coh3/coh3-types";
import { getIconsPathOnCDN } from "../../utils";
import type {
  FsPerk,
  FsPerkLevel,
  FsPerkModifier,
  FsPerksData,
  FsPerksRace,
} from "./fs-perks-types";

/* -------------------------------------------------------------------------- */
/* Races                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Maps a race id of the game files onto the race the app uses.
 *
 * The perks data file spells the factions the way the game files do - `afrika_korps`,
 * `british_africa`, `americans`, `germans` - which is the same odd spelling the cohdb API uses, so we
 * reuse its mapping. Race ids which already are one of ours (the shorter keys of the data file) are
 * passed through, anything unknown gives `null`.
 */
const toAppRace = (raceId?: string | null): raceType | null => {
  if (!raceId) return null;
  if (raceTypeArray.includes(raceId as raceType)) return raceId as raceType;

  return cohDBracesToNormalRaces[raceId] ?? null;
};

/** The perk tree of a faction, or `null` when the data file has none for it. */
const getFsPerksRace = (
  data: FsPerksData | null | undefined,
  race: raceType,
): FsPerksRace | null => data?.races[race] ?? null;

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * CDN url of a perk icon. Every perk has two of them - the greyed out one of an unbought perk and the
 * lit up `iconActive` the game shows once it is bought.
 */
const getFsPerkIconUrl = (perk: Pick<FsPerk, "icon" | "iconActive">, active = false): string =>
  getIconsPathOnCDN(`icons/${active ? perk.iconActive : perk.icon}`) as string;

/** CDN url of the faction icon of a perk tree. */
const getFsPerksRaceIconUrl = (race: Pick<FsPerksRace, "icon">): string =>
  getIconsPathOnCDN(`icons/${race.icon}`) as string;

/**
 * CDN url of the large faction badge of a perk tree.
 *
 * These live in the flattened folder of the CDN - the `races/faction_badges_large/...` path of the
 * data file doesn't exist there, only the file name does.
 */
const getFsPerksRaceBackgroundUrl = (race: Pick<FsPerksRace, "backgroundImage">): string =>
  getIconsPathOnCDN(race.backgroundImage, "export_flatten") as string;

/* -------------------------------------------------------------------------- */
/* Perks                                                                      */
/* -------------------------------------------------------------------------- */

/** Every perk of a faction as a flat list, in tier order. */
const flattenFsPerks = (race: Pick<FsPerksRace, "tiers"> | null | undefined): FsPerk[] =>
  (race?.tiers ?? []).flatMap((tier) => tier.perks);

/** Finds a perk by its id anywhere in the tree of a faction. */
const findFsPerk = (
  race: Pick<FsPerksRace, "tiers"> | null | undefined,
  perkId: string,
): FsPerk | null => flattenFsPerks(race).find((perk) => perk.id === perkId) ?? null;

/** A single level of a perk, `null` for a level the perk doesn't have. */
const getFsPerkLevel = (perk: Pick<FsPerk, "levels">, level: number): FsPerkLevel | null =>
  perk.levels.find((perkLevel) => perkLevel.level === level) ?? null;

/**
 * Perk points needed to get a perk up to the given level. `0` for level `0` (an unbought perk), the
 * `totalCost` of the perk once the level is maxed out.
 */
const getFsPerkCostToLevel = (perk: Pick<FsPerk, "levels">, level: number): number =>
  perk.levels
    .filter((perkLevel) => perkLevel.level <= level)
    .reduce((sum, perkLevel) => sum + perkLevel.cost, 0);

/** Whether a perk is a single unlock rather than something to level up. */
const isSingleLevelFsPerk = (perk: Pick<FsPerk, "maxLevel">): boolean => perk.maxLevel <= 1;

/** Matches a perk against a search term - name, effect texts and the raw perk id. */
const matchesFsPerkSearch = (perk: FsPerk, search: string): boolean => {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  return (
    perk.name.toLowerCase().includes(term) ||
    perk.id.toLowerCase().includes(term) ||
    (perk.description?.toLowerCase().includes(term) ?? false)
  );
};

const filterFsPerks = (perks: FsPerk[], search: string): FsPerk[] =>
  perks.filter((perk) => matchesFsPerkSearch(perk, search));

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/** Formats a number of the data file for display, without trailing zeros. */
const formatFsPerkNumber = (value: number): string => String(Math.round(value * 1000) / 1000);

/**
 * Value of a modifier as it should be displayed. `pbgid` modifiers point at a blueprint (eg. the
 * crate entity a perk makes bosses drop), for those the blueprint name is all we can show.
 */
const formatFsPerkModifierValue = (modifier: FsPerkModifier): string =>
  typeof modifier.value === "number"
    ? formatFsPerkNumber(modifier.value)
    : (modifier.value.split("/").pop() ?? modifier.value);

/**
 * Turns a game modifier name into something readable, eg. `WEAPON_PENETRATION_MODIFIER` ->
 * `Weapon Penetration Modifier`.
 */
const formatFsPerkModifierName = (modifierId: string): string =>
  modifierId
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export {
  filterFsPerks,
  findFsPerk,
  flattenFsPerks,
  formatFsPerkModifierName,
  formatFsPerkModifierValue,
  formatFsPerkNumber,
  getFsPerkCostToLevel,
  getFsPerkIconUrl,
  getFsPerkLevel,
  getFsPerksRace,
  getFsPerksRaceBackgroundUrl,
  getFsPerksRaceIconUrl,
  isSingleLevelFsPerk,
  matchesFsPerkSearch,
  toAppRace,
};
