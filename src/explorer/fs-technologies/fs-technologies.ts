/**
 * Downloads and parses the Final Stand technologies mapping (`data/fs-technologies.json`) from the
 * coh3-data repo.
 *
 * The data file holds the technology list of every faction plus the draft rules (`meta`) which say
 * after which wave the game offers which bucket. All texts are stored as locstring ids (some of them
 * as a formatter plus its arguments), so they are resolved against the locstring file of the same
 * patch.
 *
 * The file was added in the data tag `v2.5.3-3` - older patches don't have it and `getFsTechnologies`
 * returns `null` for them.
 *
 * Both the patch and the locale can be changed at runtime, results are cached per patch + locale.
 *
 * Same system as the perks data (see `../fs-perks/fs-perks.ts`).
 */

import config from "../../../config";
import { localizedNames } from "../../coh3/coh3-data";
import { raceTypeArray, type raceType } from "../../coh3/coh3-types";
import { fetchJsonWithLogging } from "../../unitStats/fetch-mappings-withLogs";
import {
  getLocstringForPatch,
  resolveLocstring,
  resolveLocstringText,
  type PatchLocstring,
} from "../patch-locstring";
import {
  canFsTechBeOfferedInPick,
  getFsTechUnitId,
  isFsTechAlwaysAvailable,
  toAppRaceFromTechRace,
} from "./fs-technologies-helpers";
import type {
  FsTechCategory,
  FsTechMeta,
  FsTechPick,
  FsTechnologiesData,
  FsTechnologiesRace,
  FsTechnology,
  RawFsTechMeta,
  RawFsTechPick,
  RawFsTechnologiesFile,
  RawFsTechnologiesRace,
  RawFsTechnology,
} from "./fs-technologies-types";

const FS_TECHNOLOGIES_DATA_FILE = "fs-technologies.json";

/** First data tag which ships the file. Only used for the log message of an older patch. */
const FS_TECHNOLOGIES_FIRST_DATA_TAG = "v2.5.3-3";

type GetFsTechnologiesOptions = {
  /** Patch version as defined in `config.patches`, or `"latest"`. */
  patch?: string;
  /** Locale of the resolved texts, eg. `en`, `de`. Mapped onto the locstring files of the patch. */
  locale?: string;
};

// Cache of parsed data, keyed by patch + locale.
const fsTechnologiesCache: Record<string, FsTechnologiesData> = {};

const getCacheKey = (patch: string, locale: string) => `${patch}-${locale}`;

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

const parseFsTechnology = (
  rawTechnology: RawFsTechnology,
  locstring: PatchLocstring,
): FsTechnology => ({
  id: rawTechnology.id,
  name: resolveLocstring(rawTechnology.ui?.screenName, locstring) ?? rawTechnology.id,
  shortName: resolveLocstring(rawTechnology.ui?.screenNameShort, locstring),
  description: resolveLocstringText(
    rawTechnology.ui?.briefText,
    rawTechnology.ui?.briefTextFormatter,
    locstring,
  ),
  typeLabel: resolveLocstring(rawTechnology.ui?.helpText, locstring),
  extraText: resolveLocstring(rawTechnology.ui?.extraText, locstring),
  icon: rawTechnology.ui?.icon ?? "",
  category: rawTechnology.category ?? null,
  source: rawTechnology.source,
  buckets: rawTechnology.buckets ?? [],
  tags: rawTechnology.tags ?? [],
  thresholdMin: rawTechnology.thresholdMin ?? 0,
  thresholdMax: rawTechnology.thresholdMax ?? 9999,
  alwaysAvailable: isFsTechAlwaysAvailable(rawTechnology),
  weight: rawTechnology.weight ?? 100,
  commandCost: rawTechnology.commandCost ?? 0,
  // Only an explicit `false` disables a technology, a missing flag means it is on.
  enabled: rawTechnology.enabled !== false,
  squad: rawTechnology.squad ?? null,
  ability: rawTechnology.ability ?? null,
  upgrade: rawTechnology.upgrade ?? null,
  unitId: getFsTechUnitId(rawTechnology.squad),
});

/**
 * Resolves the pool of every draft pick against the technologies of a faction.
 *
 * `newTechnologies` holds the technologies of a pick which no earlier pick could offer - the pages
 * describe a technology in the first pick it can show up in and only reference it afterwards, so the
 * four nearly identical passive picks don't repeat the same twenty cards.
 */
const parseFsTechPicks = (
  rawPicks: RawFsTechPick[],
  rawTechnologies: RawFsTechnology[],
  technologiesById: Map<string, FsTechnology>,
  locstring: PatchLocstring,
): FsTechPick[] => {
  const alreadyOffered = new Set<string>();

  return [...rawPicks]
    .sort((a, b) => a.pick - b.pick)
    .map((rawPick) => {
      const technologies = rawTechnologies
        .filter((rawTechnology) => canFsTechBeOfferedInPick(rawTechnology, rawPick))
        .map((rawTechnology) => technologiesById.get(rawTechnology.id))
        .filter((technology): technology is FsTechnology => !!technology);

      const newTechnologies = technologies.filter(({ id }) => !alreadyOffered.has(id));
      newTechnologies.forEach(({ id }) => alreadyOffered.add(id));

      return {
        pick: rawPick.pick,
        wave: rawPick.wave,
        bucket: rawPick.bucket,
        category: rawPick.category,
        upgradeTypes: rawPick.upgradeTypes ?? [],
        ignoreThresholds: rawPick.ignoreThresholds ?? false,
        fillEmptySlots: rawPick.fillEmptySlots ?? false,
        title: resolveLocstring(rawPick.title, locstring),
        technologies,
        newTechnologies,
      };
    });
};

const parseFsTechnologiesRace = (
  rawRace: RawFsTechnologiesRace,
  race: raceType,
  rawPicks: RawFsTechPick[],
  locstring: PatchLocstring,
): FsTechnologiesRace => {
  const rawTechnologies = rawRace.technologies ?? [];

  const technologies = rawTechnologies.map((rawTechnology) =>
    parseFsTechnology(rawTechnology, locstring),
  );
  const technologiesById = new Map(technologies.map((technology) => [technology.id, technology]));

  const picks = parseFsTechPicks(rawPicks, rawTechnologies, technologiesById, locstring);

  const offered = new Set(picks.flatMap(({ technologies: pool }) => pool.map(({ id }) => id)));

  const categoryCounts: Record<FsTechCategory, number> = { unit: 0, ability: 0, passive: 0 };
  for (const { category } of technologies) {
    // A technology without a category is a passive - the game files only ever leave it out on those.
    categoryCounts[category ?? "passive"] += 1;
  }

  const typeLabels = [
    ...new Set(
      technologies
        .map(({ typeLabel }) => typeLabel)
        .filter((typeLabel): typeLabel is string => !!typeLabel),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const tags = [
    ...new Set(technologies.flatMap(({ tags: technologyTags }) => technologyTags)),
  ].sort((a, b) => a.localeCompare(b));

  return {
    id: rawRace.id,
    race,
    name: localizedNames[race],
    technologies,
    picks,
    unreachableTechnologies: technologies.filter(({ id }) => !offered.has(id)),
    technologyCount: technologies.length,
    categoryCounts,
    typeLabels,
    tags,
  };
};

const parseFsTechMeta = (rawMeta: RawFsTechMeta | undefined): FsTechMeta => ({
  choicesPerPick: rawMeta?.choicesPerPick ?? 3,
  maxSlots: rawMeta?.maxSlots ?? 0,
  maxOfferingCount: rawMeta?.maxOfferingCount ?? 1,
  defaultWeight: rawMeta?.defaultWeight ?? 100,
});

/**
 * Parses the raw data file into the localized structure. Exported for testing / for consumers which
 * already have the raw JSON at hand.
 */
const parseFsTechnologies = (
  rawFile: RawFsTechnologiesFile,
  locstring: PatchLocstring,
): Pick<FsTechnologiesData, "races" | "raceList" | "meta"> => {
  const rawPicks = rawFile.meta?.picks ?? [];
  const races: Partial<Record<raceType, FsTechnologiesRace>> = {};

  for (const [key, rawRace] of Object.entries(rawFile.races ?? {})) {
    // Defensive - skip anything which doesn't look like a race entry.
    if (!rawRace || typeof rawRace !== "object" || !Array.isArray(rawRace.technologies)) continue;

    // The `id` of an entry is the id of its technology list, not a race - so the race comes from the
    // `race` blueprint path, with the key of the entry as the fallback.
    const race = toAppRaceFromTechRace(rawRace.race) ?? toAppRaceFromTechRace(key);

    if (!race) {
      console.warn(
        `[fs-technologies] Unknown race "${rawRace.race ?? key}", skipping its technologies.`,
      );
      continue;
    }

    races[race] = parseFsTechnologiesRace(rawRace, race, rawPicks, locstring);
  }

  // The factions in the order the rest of the app lists them in.
  const raceList = raceTypeArray
    .map((race) => races[race])
    .filter((parsedRace): parsedRace is FsTechnologiesRace => !!parsedRace);

  return { races, raceList, meta: parseFsTechMeta(rawFile.meta) };
};

/* -------------------------------------------------------------------------- */
/* Download                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Downloads the Final Stand technologies mapping for the given patch and resolves the texts for the
 * given locale.
 *
 * Returns `null` when the data is not available for the requested patch - the file was added only in
 * `v2.5.3-3`, so older patches simply don't have it. Errors are logged and don't throw, so a missing
 * file cannot break a build / page render.
 */
const getFsTechnologies = async (
  options: GetFsTechnologiesOptions = {},
): Promise<FsTechnologiesData | null> => {
  const { patch = "latest", locale = "en" } = options;

  const cacheKey = getCacheKey(patch, locale);
  if (fsTechnologiesCache[cacheKey]) return fsTechnologiesCache[cacheKey];

  if (patch !== "latest" && !config.patches[patch]) {
    console.warn(
      `[fs-technologies] Unknown patch "${patch}", cannot download ${FS_TECHNOLOGIES_DATA_FILE}.`,
    );
    return null;
  }

  try {
    const url = config.getPatchDataUrl(FS_TECHNOLOGIES_DATA_FILE, patch);

    const [rawFile, locstring] = await Promise.all([
      fetchJsonWithLogging(url, `${FS_TECHNOLOGIES_DATA_FILE} for patch ${patch}`),
      getLocstringForPatch(patch, locale),
    ]);

    if (!rawFile || typeof rawFile !== "object" || !rawFile.races) {
      console.warn(
        `[fs-technologies] Unexpected content of ${FS_TECHNOLOGIES_DATA_FILE} for patch ${patch}. ` +
          `The file exists from the data tag ${FS_TECHNOLOGIES_FIRST_DATA_TAG} onwards.`,
      );
      return null;
    }

    const { races, raceList, meta } = parseFsTechnologies(
      rawFile as RawFsTechnologiesFile,
      locstring,
    );

    if (raceList.length === 0) {
      console.warn(
        `[fs-technologies] No known race in ${FS_TECHNOLOGIES_DATA_FILE} for patch ${patch}.`,
      );
      return null;
    }

    const data: FsTechnologiesData = { races, raceList, meta, patch, locale };
    fsTechnologiesCache[cacheKey] = data;

    return data;
  } catch (e) {
    // The file is not present in older data tags - don't break the caller because of it.
    console.warn(
      `[fs-technologies] Failed to get ${FS_TECHNOLOGIES_DATA_FILE} for patch ${patch} and locale ` +
        `${locale}. ${e instanceof Error ? e.message : String(e)}`,
    );
    return null;
  }
};

/** Clears the in-memory cache, useful in tests. */
const clearFsTechnologiesCache = () => {
  for (const key of Object.keys(fsTechnologiesCache)) delete fsTechnologiesCache[key];
};

export {
  FS_TECHNOLOGIES_DATA_FILE,
  FS_TECHNOLOGIES_FIRST_DATA_TAG,
  clearFsTechnologiesCache,
  getFsTechnologies,
  parseFsTechnologies,
};
export type { GetFsTechnologiesOptions };
