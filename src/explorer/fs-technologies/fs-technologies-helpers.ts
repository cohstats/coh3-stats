/**
 * Helpers for the Final Stand technologies pages.
 *
 * Everything here works on the parsed data of `fs-technologies.ts` - looking a faction / a
 * technology up, turning the icon paths of the data file into CDN urls, deciding which technologies
 * a draft pick can offer and the filtering the pages need.
 */

import { cohDBracesToNormalRaces } from "../../coh3/coh3-data";
import { raceTypeArray, type raceType } from "../../coh3/coh3-types";
import { getExplorerUnitRoute } from "../../routes";
import { getIconsPathOnCDN } from "../../utils";
import type {
  FsTechCategory,
  FsTechnologiesData,
  FsTechnologiesRace,
  FsTechnology,
  RawFsTechPick,
  RawFsTechnology,
} from "./fs-technologies-types";

/** Wave threshold the data file uses for "no upper bound". */
const FS_TECH_NO_THRESHOLD_MAX = 9999;

/* -------------------------------------------------------------------------- */
/* Races                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Maps a race of the technologies data file onto the race the app uses.
 *
 * Accepts what the file actually contains - a race blueprint path (`racebps/afrika_korps`), the game
 * files' race name (`afrika_korps`) or one of our own race ids. Anything unknown gives `null`.
 *
 * Note that the `id` of a race entry of this file is the id of its *technology list*
 * (`hoff_technology_list_ak`), not a race name - unlike in the perks file. Use the `race` field or
 * the key of the entry instead.
 */
const toAppRaceFromTechRace = (race?: string | null): raceType | null => {
  if (!race) return null;

  // `racebps/afrika_korps` -> `afrika_korps`.
  const name = race.split("/").pop() ?? race;

  if (raceTypeArray.includes(name as raceType)) return name as raceType;

  return cohDBracesToNormalRaces[name] ?? null;
};

/** The technology list of a faction, or `null` when the data file has none for it. */
const getFsTechnologiesRace = (
  data: FsTechnologiesData | null | undefined,
  race: raceType,
): FsTechnologiesRace | null => data?.races[race] ?? null;

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

/** CDN url of a technology icon. */
const getFsTechIconUrl = (technology: Pick<FsTechnology, "icon">): string =>
  getIconsPathOnCDN(`icons/${technology.icon}`) as string;

/* -------------------------------------------------------------------------- */
/* Units                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Id of the squad a `unit` technology unlocks, taken from its blueprint path - the last segment of
 * `sbps/hoff/afrika_korps/infantry/hoff_player_assault_panzergrenadier_ak`. That is the id the unit
 * pages are keyed by, so it is what turns a technology into a link to its unit.
 *
 * `null` for a technology which unlocks no squad, which is everything but the `unit` ones.
 */
const getFsTechUnitId = (squad?: string | null): string | null =>
  squad ? (squad.split("/").pop() ?? null) : null;

/**
 * Route of the unit a technology unlocks, `null` when it unlocks none.
 *
 * Every Final Stand squad sits in the folder of its own faction, so the race of the page is always
 * the race of the unit - no need to read it back out of the blueprint path.
 */
const getFsTechUnitRoute = (
  technology: Pick<FsTechnology, "unitId">,
  race: raceType,
): string | null => (technology.unitId ? getExplorerUnitRoute(race, technology.unitId) : null);

/* -------------------------------------------------------------------------- */
/* Technologies                                                               */
/* -------------------------------------------------------------------------- */

/** Finds a technology by its id anywhere in the list of a faction. */
const findFsTechnology = (
  race: Pick<FsTechnologiesRace, "technologies"> | null | undefined,
  technologyId: string,
): FsTechnology | null =>
  race?.technologies.find((technology) => technology.id === technologyId) ?? null;

/** Whether a technology can be offered in every wave of the draft. */
const isFsTechAlwaysAvailable = (
  technology: Pick<RawFsTechnology, "thresholdMin" | "thresholdMax">,
): boolean =>
  (technology.thresholdMin ?? 0) <= 0 &&
  (technology.thresholdMax ?? FS_TECH_NO_THRESHOLD_MAX) >= FS_TECH_NO_THRESHOLD_MAX;

/**
 * Whether a draft pick can offer a technology.
 *
 * A technology qualifies when it sits in one of the upgrade types of the pick. The passives declare
 * no bucket at all, those are drafted by category instead - which is also why a technology whose
 * category the data file left unset is treated as a passive here, the game files only ever leave it
 * out on passive technologies.
 *
 * Wave thresholds only apply to picks which don't `ignoreThresholds` - the unit and ability picks
 * do, so their whole bucket is always on the table.
 */
const canFsTechBeOfferedInPick = (
  technology: Pick<
    RawFsTechnology,
    "buckets" | "category" | "enabled" | "thresholdMin" | "thresholdMax"
  >,
  pick: Pick<RawFsTechPick, "category" | "upgradeTypes" | "ignoreThresholds" | "wave">,
): boolean => {
  if (technology.enabled === false) return false;

  const buckets = technology.buckets ?? [];

  const inBucket =
    buckets.length > 0
      ? pick.upgradeTypes.some((upgradeType) => buckets.includes(upgradeType))
      : (technology.category ?? "passive") === pick.category;

  if (!inBucket) return false;
  if (pick.ignoreThresholds) return true;

  return (
    pick.wave >= (technology.thresholdMin ?? 0) &&
    pick.wave <= (technology.thresholdMax ?? FS_TECH_NO_THRESHOLD_MAX)
  );
};

/* -------------------------------------------------------------------------- */
/* Filtering                                                                  */
/* -------------------------------------------------------------------------- */

/** Filters the pages apply on top of the draft. Every field is optional / empty for "no filter". */
type FsTechFilters = {
  /** Free text - matched against name, short name, description, type label and the raw id. */
  search?: string;
  /** Localized type labels to keep, eg. `Heavy Tank`. Empty keeps every label. */
  typeLabels?: string[];
  /** Raw tags to keep, eg. `Technology_Tank`. Empty keeps every tag. */
  tags?: string[];
  /** Whether the technologies of the common list are shown. Defaults to `true`. */
  includeCommon?: boolean;
};

/** Matches a technology against a search term. */
const matchesFsTechSearch = (technology: FsTechnology, search: string): boolean => {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  return [
    technology.name,
    technology.shortName,
    technology.description,
    technology.typeLabel,
    technology.extraText,
    technology.id,
  ].some((text) => text?.toLowerCase().includes(term));
};

/** Whether a technology passes every active filter. */
const matchesFsTechFilters = (technology: FsTechnology, filters: FsTechFilters = {}): boolean => {
  const { search = "", typeLabels = [], tags = [], includeCommon = true } = filters;

  if (!includeCommon && technology.source === "common") return false;

  if (
    typeLabels.length > 0 &&
    !(technology.typeLabel && typeLabels.includes(technology.typeLabel))
  )
    return false;

  if (tags.length > 0 && !technology.tags.some((tag) => tags.includes(tag))) return false;

  return matchesFsTechSearch(technology, search);
};

const filterFsTechnologies = (
  technologies: FsTechnology[],
  filters: FsTechFilters = {},
): FsTechnology[] =>
  technologies.filter((technology) => matchesFsTechFilters(technology, filters));

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Turns a raw tag into something readable, eg. `Technology_AntiTank` -> `Anti Tank`. The tags are
 * not localized in the game files, so this is the best we can do for them.
 */
const formatFsTechTag = (tag: string): string =>
  tag
    .replace(/^Technology_/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");

/** The categories in the order the draft goes through them. */
const FS_TECH_CATEGORIES: FsTechCategory[] = ["unit", "ability", "passive"];

export type { FsTechFilters };
export {
  FS_TECH_CATEGORIES,
  FS_TECH_NO_THRESHOLD_MAX,
  canFsTechBeOfferedInPick,
  filterFsTechnologies,
  findFsTechnology,
  formatFsTechTag,
  getFsTechIconUrl,
  getFsTechUnitId,
  getFsTechUnitRoute,
  getFsTechnologiesRace,
  isFsTechAlwaysAvailable,
  matchesFsTechFilters,
  matchesFsTechSearch,
  toAppRaceFromTechRace,
};
