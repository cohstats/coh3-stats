/**
 * Types for the Final Stand technologies data file (`data/fs-technologies.json`) from the coh3-data
 * repo. The file exists from the data tag `v2.5.3-3` onwards, older patches simply don't have it.
 *
 * Final Stand (called "hoff" / Hold Off in the game files, see `src/unitStats/finalStand.ts`) makes
 * the player draft technologies between waves. Every couple of waves the game offers a small random
 * selection out of a pool and the player keeps one of them - units, abilities and passive buffs.
 *
 * Two flavours of types, the same split as `fs-perks`:
 *  - `Raw*` describes the JSON exactly as it is generated from the game files.
 *  - The non-raw types are the parsed / localized projection the pages render from.
 */

import type { raceType } from "../../coh3/coh3-types";

/* -------------------------------------------------------------------------- */
/* Raw JSON shape                                                             */
/* -------------------------------------------------------------------------- */

/** A locstring id, eg. `"11241638"`. The file bakes in no English text, ids only. */
type RawFsTechLocstringId = string;

/**
 * A text built from a formatter locstring and its arguments - identical to the perks file, see
 * `resolveFsTechFormatter` for the placeholder syntax.
 */
type RawFsTechTextFormatter = {
  formatter: RawFsTechLocstringId;
  arguments: Array<number | RawFsTechLocstringId>;
};

/** Category of a technology. `null` for the handful the game files leave unset. */
type FsTechCategory = "unit" | "ability" | "passive";

/** Where a technology comes from - the faction's own list or the list shared by every faction. */
type FsTechSource = "faction" | "common";

/** Type of a technology property value as declared in the game files. */
type FsTechPropertyType = "float" | "int" | "bool" | "pbgid";

/**
 * A single property of a technology - the raw knobs of the game files. Most of them are stat
 * modifiers (`WEAPON_PENETRATION_MODIFIER`, `AMOUNT_FUEL`, ...), a few are the plumbing of the
 * technology itself (`THRESHOLD_MIN` / `THRESHOLD_MAX`, the `*_PBG` blueprint references).
 *
 * A `pbgid` property can hold a list rather than a single blueprint - the passives which scale with
 * a stack point at one decorator blueprint per stage that way.
 */
type RawFsTechProperty = {
  id: string;
  type: FsTechPropertyType;
  value: number | string | boolean | string[];
};

type RawFsTechUi = {
  /** Name of the technology. */
  screenName: RawFsTechLocstringId;
  /** Shorter name, only some technologies have one. */
  screenNameShort?: RawFsTechLocstringId;
  /** Description. A technology has either this or the formatter, never both. */
  briefText?: RawFsTechLocstringId;
  briefTextFormatter?: RawFsTechTextFormatter;
  /**
   * Type label of the technology as the game shows it, eg. `Light Vehicle`, `Heavy Tank`,
   * `Offensive Ability`, `Resource Passive`. Despite the name it is not a help text.
   */
  helpText?: RawFsTechLocstringId;
  /** An extra note below the description, eg. `Deals suppression damage.`. Rare. */
  extraText?: RawFsTechLocstringId;
  /** Icon path without an extension, eg. `races/afrika_corps/vehicles/armored_car_8_rad_ak`. */
  icon: string;
};

/**
 * A technology as the data file has it. Note that `properties` is deliberately not carried over into
 * the parsed `FsTechnology` - every one of its entries is either already covered by a field of its
 * own (the thresholds, the squad / ability / upgrade it unlocks) or is a raw game knob whose effect
 * the localized description already states in words.
 */
type RawFsTechnology = {
  id: string;
  /** Path of the technology upgrade blueprint in the game files. */
  path: string;
  pbgid: number;
  source: FsTechSource;
  category: FsTechCategory | null;
  /**
   * Upgrade types the technology belongs to, eg. `Technology_Unit_Bucket1`. A pick offers only
   * technologies of its own bucket. Empty for the passives - those are drafted by category.
   */
  buckets: string[];
  /** Free form tags of the game files, eg. `Technology_Tank`, `Technology_Infantry`. */
  tags: string[];
  /** First wave the technology can be offered in. `0` when there is no lower bound. */
  thresholdMin: number;
  /** Last wave the technology can be offered in. `9999` when there is no upper bound. */
  thresholdMax: number;
  /** Relative chance of being offered. Currently `100` for every technology. */
  weight: number;
  /** Command points the technology costs. Currently `1` for every technology. */
  commandCost: number;
  /** `false` for a technology which is in the files but switched off. */
  enabled: boolean;
  ui: RawFsTechUi;
  properties?: RawFsTechProperty[];
  /** Squad blueprint the technology unlocks - only the `unit` technologies have one. */
  squad?: string;
  /** Ability blueprint the technology unlocks - only the `ability` technologies have one. */
  ability?: string;
  /** Upgrade blueprint the technology applies - a couple of the passives have one. */
  upgrade?: string;
};

/** The technology list of a single faction. */
type RawFsTechnologiesRace = {
  /**
   * Id of the *list*, eg. `hoff_technology_list_ak` - note that unlike the perks file this is not a
   * race name, the race has to be read from `race` / the key of the entry.
   */
  id: string;
  pbgid: number;
  /** Race blueprint path, eg. `racebps/afrika_korps`. */
  race: string;
  /** Technology lists which were merged into `technologies`, the faction's own plus the common one. */
  lists: string[];
  technologies: RawFsTechnology[];
};

/**
 * One draft pick of a Final Stand run - "after wave N, choose one of three technologies of this
 * bucket".
 */
type RawFsTechPick = {
  /** 1 based number of the pick. */
  pick: number;
  /** Wave the pick happens after. `0` is the setup phase before the first wave. */
  wave: number;
  /** Bucket the game draws from, eg. `TECHNOLOGYBUCKET_UNIT_0`. */
  bucket: string;
  category: FsTechCategory;
  /** Upgrade types of the bucket - this is what is matched against `buckets` of a technology. */
  upgradeTypes: string[];
  /**
   * When `true` the pick ignores the wave thresholds of a technology - the unit and ability picks
   * do, so their whole bucket is always on the table. Only the passive picks respect them.
   */
  ignoreThresholds: boolean;
  /** Whether the game tops the offer up with out-of-bucket technologies when the pool runs dry. */
  fillEmptySlots: boolean;
  /** Locstring id of the headline the game shows for the pick. */
  title: RawFsTechLocstringId;
  /** Free form note of the data generator, eg. `first boss wave`. Not localized, not for display. */
  note?: string;
};

/** The draft rules, shared by every faction. */
type RawFsTechMeta = {
  /** Technologies offered per pick. */
  choicesPerPick: number;
  /**
   * Choice slots the technology menu has (`technologies_slot_a` .. `_e`). It caps how many
   * technologies one pick can offer, not how many a player may hold - every pick is permanent.
   */
  maxSlots: number;
  /** How often the same technology may be offered within one pick. */
  maxOfferingCount: number;
  /** Weight a technology gets when it declares none. */
  defaultWeight: number;
  picks: RawFsTechPick[];
};

type RawFsTechnologiesFile = {
  meta: RawFsTechMeta;
  /** Keyed by the short race name (`afrika_korps`, `american`, `british`, `german`). */
  races: Record<string, RawFsTechnologiesRace>;
};

/* -------------------------------------------------------------------------- */
/* Parsed shape                                                               */
/* -------------------------------------------------------------------------- */

/** A single technology with everything the frontend needs to render it. */
type FsTechnology = {
  id: string;
  /** Localized name. Falls back to the technology id when the locstring is missing. */
  name: string;
  /** Localized short name, `null` when the technology has none. */
  shortName: string | null;
  /** Localized description. */
  description: string | null;
  /**
   * Localized type label, eg. `Heavy Tank` / `Offensive Ability`. This is the `helpText` of the game
   * files, which despite its name is a category label rather than a help text.
   */
  typeLabel: string | null;
  /** Localized extra note below the description. Only a couple of technologies have one. */
  extraText: string | null;
  /** Icon path, use `getFsTechIconUrl` to turn it into a CDN url. */
  icon: string;
  category: FsTechCategory | null;
  source: FsTechSource;
  buckets: string[];
  tags: string[];
  /** First wave the technology can be offered in. */
  thresholdMin: number;
  /** Last wave the technology can be offered in, `9999` for no upper bound. */
  thresholdMax: number;
  /** `true` when the technology is available in every wave - the common case. */
  alwaysAvailable: boolean;
  weight: number;
  commandCost: number;
  enabled: boolean;
  /** Squad / ability / upgrade blueprint the technology unlocks, `null` when it unlocks none. */
  squad: string | null;
  ability: string | null;
  upgrade: string | null;
  /**
   * Id of the squad the technology unlocks - the last segment of `squad`, which is the id the unit
   * pages are keyed by. `null` for everything but the `unit` technologies. Use
   * `getFsTechUnitRoute` to turn it into a link.
   */
  unitId: string | null;
};

/** A draft pick with the technologies it can offer. */
type FsTechPick = {
  pick: number;
  wave: number;
  bucket: string;
  category: FsTechCategory;
  upgradeTypes: string[];
  ignoreThresholds: boolean;
  fillEmptySlots: boolean;
  /** Localized headline of the pick. */
  title: string | null;
  /** Every technology which can be offered in this pick, in the order of the data file. */
  technologies: FsTechnology[];
  /**
   * The technologies of `technologies` which no earlier pick could offer. The pages render these in
   * full and the rest as compact chips, so a technology is only described once per page.
   */
  newTechnologies: FsTechnology[];
};

/** The technology list of a single faction. */
type FsTechnologiesRace = {
  /** Id of the technology list of the faction, eg. `hoff_technology_list_ak`. */
  id: string;
  /** The race as the rest of the app knows it, eg. `dak`. */
  race: raceType;
  /** Localized faction name. */
  name: string;
  /** Every technology of the faction, faction list and common list merged. */
  technologies: FsTechnology[];
  /** The draft, with the pool of every pick resolved. */
  picks: FsTechPick[];
  /**
   * Technologies which no pick of the draft can offer - either their wave window lies outside the
   * draft or they have no bucket and no category. Kept so nothing of the data file is silently
   * dropped.
   */
  unreachableTechnologies: FsTechnology[];
  /** Amount of technologies of the faction. */
  technologyCount: number;
  /** Amount of technologies per category. */
  categoryCounts: Record<FsTechCategory, number>;
  /** Every localized type label of the faction, sorted, for the filter UI. */
  typeLabels: string[];
  /** Every raw tag of the faction, sorted, for the filter UI. */
  tags: string[];
};

/** The draft rules, without the per faction pools. */
type FsTechMeta = {
  choicesPerPick: number;
  maxSlots: number;
  maxOfferingCount: number;
  defaultWeight: number;
};

/** The result of downloading and parsing the Final Stand technologies data. */
type FsTechnologiesData = {
  /** Technology lists keyed by race. Partial on purpose - see `getFsTechnologiesRace`. */
  races: Partial<Record<raceType, FsTechnologiesRace>>;
  /** The factions in display order, the same order the rest of the app lists them in. */
  raceList: FsTechnologiesRace[];
  meta: FsTechMeta;
  /** The patch the data was downloaded for. */
  patch: string;
  /** The locale the texts were resolved for. */
  locale: string;
};

export type {
  FsTechCategory,
  FsTechMeta,
  FsTechPick,
  FsTechPropertyType,
  FsTechSource,
  FsTechnologiesData,
  FsTechnologiesRace,
  FsTechnology,
  RawFsTechLocstringId,
  RawFsTechMeta,
  RawFsTechPick,
  RawFsTechProperty,
  RawFsTechTextFormatter,
  RawFsTechUi,
  RawFsTechnologiesFile,
  RawFsTechnologiesRace,
  RawFsTechnology,
};
