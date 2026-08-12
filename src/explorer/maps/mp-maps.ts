/**
 * Downloads and parses the multiplayer maps mapping (`data/mp-maps.json`) from the coh3-data repo.
 *
 * The data file contains one entry per multiplayer scenario, keyed by the map id, plus a `__meta`
 * block. Names and descriptions are stored as locstring ids (with the English value baked in), so
 * they are resolved against the locstring file of the same patch.
 *
 * Both the patch and the locale can be changed at runtime, results are cached per
 * patch + locale + includePoints combination.
 */

import config from "../../../config";
import { fetchJsonWithLogging } from "../../unitStats/fetch-mappings-withLogs";
import { clearPatchLocstringCache, getLocstringForPatch } from "../patch-locstring";
import type {
  MpMap,
  MpMapsData,
  MpMapsMeta,
  RawMpMap,
  RawMpMapLocalizedText,
  RawMpMapsFile,
} from "./mp-maps-types";

const MP_MAPS_DATA_FILE = "mp-maps.json";

/** Key of the metadata block inside the data file. */
const META_KEY = "__meta";

type GetMpMapsOptions = {
  /** Patch version as defined in `config.patches`, or `"latest"`. */
  patch?: string;
  /** Locale of the resolved texts, eg. `en`, `de`. */
  locale?: string;
  /**
   * Whether to include the per map geometry - the `points` and the `sectors` arrays. Those are by
   * far the heaviest part of the data file, set to `false` when only the aggregated resource info is
   * needed.
   */
  includePoints?: boolean;
};

// Cache of parsed data, keyed by patch + locale + includePoints.
const mpMapsCache: Record<string, MpMapsData> = {};

const getCacheKey = (patch: string, locale: string, includePoints: boolean) =>
  `${patch}-${locale}-${includePoints}`;

/**
 * Resolves a localizable text of the data file. Falls back to the English value baked into the
 * data file when the locstring is missing in the given locale.
 */
const resolveMpMapText = (
  text: RawMpMapLocalizedText | undefined | null,
  locstring: Record<string, string | null>,
): string | null => {
  if (!text) return null;

  const locstringId = text.locstring;
  const localized = locstringId ? locstring[locstringId] : null;

  return localized ?? text.en ?? null;
};

/**
 * Parses the raw data file into the localized structure. Exported for testing / for consumers which
 * already have the raw JSON at hand.
 */
const parseMpMaps = (
  rawFile: RawMpMapsFile,
  locstring: Record<string, string | null>,
  includePoints = true,
): { meta: MpMapsMeta; maps: Record<string, MpMap> } => {
  const maps: Record<string, MpMap> = {};

  for (const [key, value] of Object.entries(rawFile)) {
    if (key === META_KEY) continue;

    const rawMap = value as RawMpMap;
    // Defensive - skip anything which doesn't look like a map entry.
    if (!rawMap || typeof rawMap !== "object" || !rawMap.id) continue;

    const { name, description, points, sectors, ...rest } = rawMap;

    maps[rawMap.id] = {
      ...rest,
      points: includePoints ? (points ?? []) : [],
      sectors: includePoints ? (sectors ?? []) : [],
      name: resolveMpMapText(name, locstring) ?? rawMap.id,
      description: resolveMpMapText(description, locstring),
      locstringIds: {
        name: name?.locstring ?? null,
        description: description?.locstring ?? null,
      },
    };
  }

  return { meta: rawFile[META_KEY] as MpMapsMeta, maps };
};

/**
 * Downloads the multiplayer maps mapping for the given patch and resolves the texts for the given
 * locale.
 *
 * Returns `null` when the data is not available for the requested patch - the file was added only
 * in later versions of the data repo, so older patches simply don't have it. Errors are logged and
 * don't throw, so a missing file cannot break a build / page render.
 */
const getMpMaps = async (options: GetMpMapsOptions = {}): Promise<MpMapsData | null> => {
  const { patch = "latest", locale = "en", includePoints = true } = options;

  const cacheKey = getCacheKey(patch, locale, includePoints);
  if (mpMapsCache[cacheKey]) return mpMapsCache[cacheKey];

  if (patch !== "latest" && !config.patches[patch]) {
    console.warn(`[mp-maps] Unknown patch "${patch}", cannot download ${MP_MAPS_DATA_FILE}.`);
    return null;
  }

  try {
    const url = config.getPatchDataUrl(MP_MAPS_DATA_FILE, patch);

    const [rawFile, locstring] = await Promise.all([
      fetchJsonWithLogging(url, `${MP_MAPS_DATA_FILE} for patch ${patch}`),
      getLocstringForPatch(patch, locale),
    ]);

    if (!rawFile || typeof rawFile !== "object") {
      console.warn(`[mp-maps] Unexpected content of ${MP_MAPS_DATA_FILE} for patch ${patch}.`);
      return null;
    }

    const { meta, maps } = parseMpMaps(rawFile as RawMpMapsFile, locstring, includePoints);

    const data: MpMapsData = { meta, maps, patch, locale };
    mpMapsCache[cacheKey] = data;

    return data;
  } catch (e) {
    // The file is not present in older data tags - don't break the caller because of it.
    console.warn(
      `[mp-maps] Failed to get ${MP_MAPS_DATA_FILE} for patch ${patch} and locale ${locale}. ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
    return null;
  }
};

/** Clears the in-memory caches, useful in tests. */
const clearMpMapsCache = () => {
  for (const key of Object.keys(mpMapsCache)) delete mpMapsCache[key];
  clearPatchLocstringCache();
};

export { getMpMaps, parseMpMaps, resolveMpMapText, clearMpMapsCache, MP_MAPS_DATA_FILE };
export type { GetMpMapsOptions };
