/**
 * Downloads and parses the Final Stand perks mapping (`data/fs-perks.json`) from the coh3-data repo.
 *
 * The data file holds the perk tree of every faction - tiers, perks and their levels. All texts are
 * stored as locstring ids (some of them as a formatter plus its arguments), so they are resolved
 * against the locstring file of the same patch.
 *
 * Both the patch and the locale can be changed at runtime, results are cached per patch + locale.
 *
 * Same system as the maps data (see `../maps/mp-maps.ts`).
 */

import config from "../../../config";
import { localizedNames } from "../../coh3/coh3-data";
import type { raceType } from "../../coh3/coh3-types";
import { raceTypeArray } from "../../coh3/coh3-types";
import { fetchJsonWithLogging } from "../../unitStats/fetch-mappings-withLogs";
import { getLocstringForPatch, type PatchLocstring } from "../patch-locstring";
import { formatFsPerkNumber, toAppRace } from "./fs-perks-helpers";
import type {
  FsPerk,
  FsPerkLevel,
  FsPerkTier,
  FsPerksData,
  FsPerksRace,
  RawFsPerk,
  RawFsPerkLocstringId,
  RawFsPerkTextFormatter,
  RawFsPerkTier,
  RawFsPerksFile,
  RawFsPerksRace,
} from "./fs-perks-types";

const FS_PERKS_DATA_FILE = "fs-perks.json";

type GetFsPerksOptions = {
  /** Patch version as defined in `config.patches`, or `"latest"`. */
  patch?: string;
  /** Locale of the resolved texts, eg. `en`, `de`. Mapped onto the locstring files of the patch. */
  locale?: string;
};

// Cache of parsed data, keyed by patch + locale.
const fsPerksCache: Record<string, FsPerksData> = {};

const getCacheKey = (patch: string, locale: string) => `${patch}-${locale}`;

/**
 * The locstring files carry the line breaks of the game as literal `\r\n` / `\n` escape sequences.
 * Turn them into real new lines, so the texts can be rendered with `white-space: pre-line`.
 */
const unescapeFsPerkText = (text: string): string =>
  text.replace(/\\r\\n|\\r|\\n/g, "\n").replace(/\\t/g, "\t");

/** Resolves a plain locstring id. */
const resolveFsPerkLocstring = (
  locstringId: RawFsPerkLocstringId | undefined | null,
  locstring: PatchLocstring,
): string | null => {
  if (!locstringId) return null;

  const text = locstring[locstringId];

  return text ? unescapeFsPerkText(text) : null;
};

/**
 * Resolves a formatter text - the localized formatter string with its arguments substituted in.
 *
 * The game uses `%1%` style placeholders, optionally with a format spec after a colon. The only spec
 * the perks data uses is `.p` (percent), whose argument is already a percentage - `%1:.p%` with the
 * argument `20` renders as `20%`. Unknown specs fall back to the plain value.
 *
 * Numeric arguments are printed as they are, string arguments are locstring ids themselves (eg. the
 * localized `Fuel` / `Munitions` a salvage perk grants).
 */
const resolveFsPerkFormatter = (
  textFormatter: RawFsPerkTextFormatter | undefined | null,
  locstring: PatchLocstring,
): string | null => {
  const formatter = resolveFsPerkLocstring(textFormatter?.formatter, locstring);
  if (!formatter) return null;

  const args = textFormatter?.arguments ?? [];

  const resolveArgument = (argument: number | string | undefined, spec?: string): string => {
    if (argument === undefined) return "";

    const value =
      typeof argument === "number"
        ? formatFsPerkNumber(argument)
        : // A string argument is a locstring id, fall back to it being a literal text.
          (resolveFsPerkLocstring(argument, locstring) ?? argument);

    return spec?.startsWith(".p") ? `${value}%` : value;
  };

  return (
    formatter
      // %1% / %1:.p% - the index is 1 based.
      .replace(/%(\d+)(?::([^%]*))?%/g, (_match, indexText, spec) =>
        resolveArgument(args[Number(indexText) - 1], spec),
      )
      // Escaped percentage signs.
      .replace(/%%/g, "%")
  );
};

/**
 * Resolves a text which the data file stores either as a plain locstring or as a formatter. Both are
 * optional and mutually exclusive - the plain text wins when a perk ever ends up having both.
 */
const resolveFsPerkText = (
  locstringId: RawFsPerkLocstringId | undefined | null,
  textFormatter: RawFsPerkTextFormatter | undefined | null,
  locstring: PatchLocstring,
): string | null =>
  resolveFsPerkLocstring(locstringId, locstring) ??
  resolveFsPerkFormatter(textFormatter, locstring);

const parseFsPerkLevels = (rawPerk: RawFsPerk, locstring: PatchLocstring): FsPerkLevel[] => {
  let cumulativeCost = 0;

  return (rawPerk.levels ?? []).map((rawLevel) => {
    cumulativeCost += rawLevel.cost ?? 0;

    return {
      level: rawLevel.level,
      cost: rawLevel.cost ?? 0,
      cumulativeCost,
      effect: resolveFsPerkText(rawLevel.ui?.helpText, rawLevel.ui?.helpTextFormatter, locstring),
      modifiers: (rawLevel.modifiers ?? []).map(({ id, type, value }) => ({ id, type, value })),
    };
  });
};

const parseFsPerk = (
  rawPerk: RawFsPerk,
  rawTier: RawFsPerkTier,
  locstring: PatchLocstring,
): FsPerk => ({
  id: rawPerk.id,
  name: resolveFsPerkLocstring(rawPerk.ui?.screenName, locstring) ?? rawPerk.id,
  description: resolveFsPerkText(
    rawPerk.ui?.briefText,
    rawPerk.ui?.briefTextFormatter,
    locstring,
  ),
  effect: resolveFsPerkFormatter(rawPerk.ui?.helpTextFormatter, locstring),
  icon: rawPerk.ui?.icon ?? "",
  iconActive: rawPerk.ui?.iconAlternate ?? rawPerk.ui?.icon ?? "",
  tier: rawTier.tier,
  unlockThreshold: rawTier.unlockThreshold ?? 0,
  maxLevel: rawPerk.maxLevel,
  totalCost: rawPerk.totalCost,
  levels: parseFsPerkLevels(rawPerk, locstring),
});

const parseFsPerksRace = (
  rawRace: RawFsPerksRace,
  race: raceType,
  locstring: PatchLocstring,
): FsPerksRace => {
  const tiers: FsPerkTier[] = (rawRace.tiers ?? [])
    .map((rawTier) => ({
      tier: rawTier.tier,
      unlockThreshold: rawTier.unlockThreshold ?? 0,
      perks: (rawTier.perks ?? []).map((rawPerk) => parseFsPerk(rawPerk, rawTier, locstring)),
    }))
    .sort((a, b) => a.tier - b.tier);

  const perks = tiers.flatMap((tier) => tier.perks);

  return {
    id: rawRace.id,
    race,
    // The data file has the faction name as a locstring, our own name is the safety net.
    name: resolveFsPerkLocstring(rawRace.ui?.name, locstring) ?? localizedNames[race],
    icon: rawRace.ui?.icon ?? "",
    backgroundImage: rawRace.ui?.backgroundImage ?? "",
    tiers,
    perkCount: perks.length,
    levelCount: perks.reduce((sum, perk) => sum + perk.levels.length, 0),
    totalCost: perks.reduce((sum, perk) => sum + perk.totalCost, 0),
  };
};

/**
 * Parses the raw data file into the localized structure. Exported for testing / for consumers which
 * already have the raw JSON at hand.
 */
const parseFsPerks = (
  rawFile: RawFsPerksFile,
  locstring: PatchLocstring,
): Pick<FsPerksData, "races" | "raceList"> => {
  const races: Partial<Record<raceType, FsPerksRace>> = {};

  for (const [key, rawRace] of Object.entries(rawFile.races ?? {})) {
    // Defensive - skip anything which doesn't look like a race entry.
    if (!rawRace || typeof rawRace !== "object" || !rawRace.id) continue;

    // The `id` of the entry is the race name of the game files, the key is a shorter alias of it.
    // Both are mapped, so a renamed key alone cannot make us drop a faction.
    const race = toAppRace(rawRace.id) ?? toAppRace(key);

    if (!race) {
      console.warn(`[fs-perks] Unknown race "${rawRace.id}", skipping its perks.`);
      continue;
    }

    races[race] = parseFsPerksRace(rawRace, race, locstring);
  }

  // The factions in the order the rest of the app lists them in.
  const raceList = raceTypeArray
    .map((race) => races[race])
    .filter((parsedRace): parsedRace is FsPerksRace => !!parsedRace);

  return { races, raceList };
};

/**
 * Downloads the Final Stand perks mapping for the given patch and resolves the texts for the given
 * locale.
 *
 * Returns `null` when the data is not available for the requested patch - the file was added only in
 * later versions of the data repo, so older patches simply don't have it. Errors are logged and don't
 * throw, so a missing file cannot break a build / page render.
 */
const getFsPerks = async (options: GetFsPerksOptions = {}): Promise<FsPerksData | null> => {
  const { patch = "latest", locale = "en" } = options;

  const cacheKey = getCacheKey(patch, locale);
  if (fsPerksCache[cacheKey]) return fsPerksCache[cacheKey];

  if (patch !== "latest" && !config.patches[patch]) {
    console.warn(`[fs-perks] Unknown patch "${patch}", cannot download ${FS_PERKS_DATA_FILE}.`);
    return null;
  }

  try {
    const url = config.getPatchDataUrl(FS_PERKS_DATA_FILE, patch);

    const [rawFile, locstring] = await Promise.all([
      fetchJsonWithLogging(url, `${FS_PERKS_DATA_FILE} for patch ${patch}`),
      getLocstringForPatch(patch, locale),
    ]);

    if (!rawFile || typeof rawFile !== "object" || !rawFile.races) {
      console.warn(`[fs-perks] Unexpected content of ${FS_PERKS_DATA_FILE} for patch ${patch}.`);
      return null;
    }

    const { races, raceList } = parseFsPerks(rawFile as RawFsPerksFile, locstring);

    if (raceList.length === 0) {
      console.warn(`[fs-perks] No known race in ${FS_PERKS_DATA_FILE} for patch ${patch}.`);
      return null;
    }

    const data: FsPerksData = { races, raceList, patch, locale };
    fsPerksCache[cacheKey] = data;

    return data;
  } catch (e) {
    // The file is not present in older data tags - don't break the caller because of it.
    console.warn(
      `[fs-perks] Failed to get ${FS_PERKS_DATA_FILE} for patch ${patch} and locale ${locale}. ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
    return null;
  }
};

/** Clears the in-memory cache, useful in tests. */
const clearFsPerksCache = () => {
  for (const key of Object.keys(fsPerksCache)) delete fsPerksCache[key];
};

export {
  FS_PERKS_DATA_FILE,
  clearFsPerksCache,
  getFsPerks,
  parseFsPerks,
  resolveFsPerkFormatter,
  resolveFsPerkLocstring,
  resolveFsPerkText,
  unescapeFsPerkText,
};
export type { GetFsPerksOptions };
