/**
 * Types for the Final Stand perks data file (`data/fs-perks.json`) from the coh3-data repo.
 *
 * Final Stand (called "hoff" / Hold Off in the game files, see `src/unitStats/finalStand.ts`) gives
 * every faction a perk tree. Perks are bought with perk points, most of them have several levels,
 * and the tree is split into tiers which unlock once enough perk levels have been bought.
 *
 * There are two flavours of types here:
 *  - `Raw*` types describe the JSON file exactly as it is generated from the game files.
 *  - The non-raw types are the parsed / localized projection we render the perks from. It is
 *    deliberately smaller than the raw data - the blueprint paths and pbgids of the raw file are of
 *    no use to the frontend, so they are dropped.
 */

import type { raceType } from "../../coh3/coh3-types";

/* -------------------------------------------------------------------------- */
/* Raw JSON shape                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A localizable text of the raw data. Unlike the maps data file, the perks file stores plain
 * locstring ids (eg. `"11245065"`) with no English value baked in, so a missing locstring cannot be
 * recovered from the data file itself.
 */
type RawFsPerkLocstringId = string;

/**
 * A text built from a formatter locstring and its arguments, eg. the formatter `"%1:.p%"` with the
 * argument `20` renders as `20%`.
 *
 * Arguments are either numbers (rendered as they are) or locstring ids (eg. `"11152057"` -> the
 * localized `Munitions`).
 */
type RawFsPerkTextFormatter = {
  formatter: RawFsPerkLocstringId;
  arguments: Array<number | RawFsPerkLocstringId>;
};

/** Type of a perk modifier value as declared in the game files. */
type FsPerkModifierType = "float" | "int" | "pbgid";

/**
 * A single modifier a perk level applies.
 *
 * `id` is the game's modifier name, eg. `WEAPON_PENETRATION_MODIFIER` or `AMOUNT_FUEL`. `value` is a
 * number for the `float` / `int` types and a blueprint path for the `pbgid` type (eg. the crate
 * entity a perk makes bosses drop).
 */
type RawFsPerkModifier = {
  id: string;
  type: FsPerkModifierType;
  value: number | string;
};

/** The ui block of a perk level - either a plain text or a formatter, never both. */
type RawFsPerkLevelUi = {
  helpText?: RawFsPerkLocstringId;
  helpTextFormatter?: RawFsPerkTextFormatter;
};

type RawFsPerkLevel = {
  /** 1 based, always continuous up to the `maxLevel` of the perk. */
  level: number;
  /** Perk points this single level costs. */
  cost: number;
  /** Missing / empty for the perks whose effect is not a stat modifier (unlocks, upgrades). */
  modifiers?: RawFsPerkModifier[];
  /** Missing on a level which has no text of its own. */
  ui?: RawFsPerkLevelUi;
};

type RawFsPerkUi = {
  /** Name of the perk. */
  screenName: RawFsPerkLocstringId;
  /** Description of the perk. Perks which have no plain description use the formatter instead. */
  briefText?: RawFsPerkLocstringId;
  briefTextFormatter?: RawFsPerkTextFormatter;
  /** Summary of the perk effect, only a couple of perks have it. */
  helpTextFormatter?: RawFsPerkTextFormatter;
  /** Icon path without an extension, eg. `hoff/perks/vehicle_repair_rate_0`. */
  icon: string;
  /** The lit up variant of `icon`, shown by the game once the perk is bought. */
  iconAlternate: string;
};

type RawFsPerk = {
  id: string;
  /** Path of the perk blueprint in the game files. */
  path: string;
  pbgid: number;
  /** Player upgrade the perk applies. */
  playerUpgrade: string;
  ui: RawFsPerkUi;
  maxLevel: number;
  /** Perk points needed to max the perk out - the sum of the level costs. */
  totalCost: number;
  levels: RawFsPerkLevel[];
};

type RawFsPerkTier = {
  /** 1 based tier number. */
  tier: number;
  /** Amount of perk levels which have to be bought before the tier unlocks. `0` for the first. */
  unlockThreshold: number;
  perks: RawFsPerk[];
};

/** Perk tree of a single faction. */
type RawFsPerksRace = {
  /**
   * Race id as the game files spell it: `afrika_korps`, `americans`, `british_africa`, `germans`.
   * Note that this differs from the key the race is stored under in the `races` object.
   */
  id: string;
  pbgid: number;
  /** Race blueprint path, eg. `racebps/afrika_korps`. */
  race: string;
  /** Perk pool of the race, `hoff` for every Final Stand race. */
  perkPool: string;
  /** Perk points pool of the race, eg. `hoff_points_afrika_korps`. */
  perkPointsPool: string;
  ui: {
    /** Locstring id of the faction name. */
    name: RawFsPerkLocstringId;
    /** Faction icon, eg. `common/factions/afrika_korps_mipped`. */
    icon: string;
    /** Large faction badge, eg. `races/faction_badges_large/dak_xl_faction_icon`. */
    backgroundImage: string;
  };
  tiers: RawFsPerkTier[];
};

/**
 * The raw data file. Unlike the maps file it has no `__meta` block, everything sits under `races`,
 * keyed by the short race name (`afrika_korps`, `american`, `british`, `german`).
 */
type RawFsPerksFile = {
  races: Record<string, RawFsPerksRace>;
};

/* -------------------------------------------------------------------------- */
/* Parsed shape                                                               */
/* -------------------------------------------------------------------------- */

/** A modifier of a perk level, with the raw blueprint path of `pbgid` values kept as is. */
type FsPerkModifier = {
  /** Game modifier name, eg. `WEAPON_PENETRATION_MODIFIER`. */
  id: string;
  type: FsPerkModifierType;
  value: number | string;
};

/** A single level of a perk. */
type FsPerkLevel = {
  level: number;
  /** Perk points this level costs on its own. */
  cost: number;
  /** Perk points spent to get from an unbought perk up to this level. */
  cumulativeCost: number;
  /**
   * Localized effect of this level, eg. `20%` or `Officer`. `null` for the handful of levels which
   * have no text in the game files.
   */
  effect: string | null;
  /** Stat modifiers of this level. Empty for unlock / upgrade perks, which have none. */
  modifiers: FsPerkModifier[];
};

/** A single perk with everything the frontend needs to render it. */
type FsPerk = {
  id: string;
  /** Localized name. Falls back to the perk id when the locstring is missing. */
  name: string;
  /** Localized description. */
  description: string | null;
  /**
   * Localized summary of the effect, independent of the level (eg. `2.5/s`). Only a couple of perks
   * have one, `null` for the rest.
   */
  effect: string | null;
  /** Icon path of the unbought perk, use `getFsPerkIconUrl` to turn it into a CDN url. */
  icon: string;
  /** Icon path of the bought perk, the lit up variant of `icon`. */
  iconActive: string;
  /** Tier the perk sits in. Kept on the perk so a flat list stays useful. */
  tier: number;
  /** Amount of perk levels which have to be bought before the tier of this perk unlocks. */
  unlockThreshold: number;
  /** Amount of levels the perk has. `1` for the perks which are a single unlock. */
  maxLevel: number;
  /** Perk points needed to max the perk out. */
  totalCost: number;
  levels: FsPerkLevel[];
};

/** A tier of the perk tree of a faction. */
type FsPerkTier = {
  tier: number;
  unlockThreshold: number;
  perks: FsPerk[];
};

/** The perk tree of a single faction. */
type FsPerksRace = {
  /** Race id as the data file spells it, eg. `british_africa`. */
  id: string;
  /** The race as the rest of the app knows it, eg. `british`. */
  race: raceType;
  /** Localized faction name. Falls back to our own localized name for the race. */
  name: string;
  /** Faction icon path, use `getFsPerksRaceIconUrl` for the CDN url. */
  icon: string;
  /** Large faction badge path, use `getFsPerksRaceBackgroundUrl` for the CDN url. */
  backgroundImage: string;
  tiers: FsPerkTier[];
  /** Amount of perks in the tree. */
  perkCount: number;
  /** Amount of perk levels in the tree - the amount of buys needed to max everything out. */
  levelCount: number;
  /** Perk points needed to max every perk of the tree out. */
  totalCost: number;
};

/** The result of downloading and parsing the Final Stand perks data. */
type FsPerksData = {
  /**
   * Perk trees keyed by race. Partial on purpose - a data file which loses a faction (or gains one
   * we don't know yet) must not break the pages, use `getFsPerksRace` to read from it.
   */
  races: Partial<Record<raceType, FsPerksRace>>;
  /** The perk trees in display order, the same order the rest of the app lists the factions in. */
  raceList: FsPerksRace[];
  /** The patch the data was downloaded for. */
  patch: string;
  /** The locale the texts were resolved for. */
  locale: string;
};

export type {
  FsPerk,
  FsPerkLevel,
  FsPerkModifier,
  FsPerkModifierType,
  FsPerkTier,
  FsPerksData,
  FsPerksRace,
  RawFsPerk,
  RawFsPerkLevel,
  RawFsPerkLevelUi,
  RawFsPerkLocstringId,
  RawFsPerkModifier,
  RawFsPerkTextFormatter,
  RawFsPerkTier,
  RawFsPerkUi,
  RawFsPerksFile,
  RawFsPerksRace,
};
