/**
 * Downloads and parses the in-game tips mapping (`data/ingame-tips.json`) from the coh3-data repo.
 *
 * The data file lists the loading screen tips of the game. Their texts are stored as locstring ids,
 * so they are resolved against the locstring file of the same patch (see `../patch-locstring`).
 *
 * Both the patch and the locale can be changed at runtime. Caching works on two levels:
 *  - the raw file is cached per patch, so all the locales share one download,
 *  - the parsed result is cached per patch + locale.
 * Both caches hold promises, so concurrent callers (eg. many pages rendered by one build worker)
 * share a single request instead of racing each other.
 *
 * On the server the file is read from the disk cache filled by `scripts/prefetch-data.ts`.
 *
 * Same system as the perks data (see `../fs-perks/fs-perks.ts`).
 */

import config from "../../../config";
import { fetchJsonWithLogging } from "../../unitStats/fetch-mappings-withLogs";
import { isMissingMappingFile } from "../../unitStats/mappingFileErrors";
import { getLocstringForPatch, resolveLocstring, type PatchLocstring } from "../patch-locstring";
import type {
  IngameTip,
  IngameTipsData,
  RawIngameTip,
  RawIngameTipsFile,
} from "./ingame-tips-types";

const INGAME_TIPS_DATA_FILE = "ingame-tips.json";

type GetIngameTipsOptions = {
  /** Patch version as defined in `config.patches`, or `"latest"`. */
  patch?: string;
  /** Locale of the resolved texts, eg. `en`, `pt-BR`. Mapped onto the locstring files of the patch. */
  locale?: string;
};

// Raw file per patch. `null` = the data tag of the patch doesn't ship the file (404), which is
// remembered so a build doesn't ask for a missing file once per page.
const rawFileCache: Record<string, Promise<RawIngameTipsFile | null>> = {};
// Parsed data per patch + locale.
const ingameTipsCache: Record<string, Promise<IngameTipsData | null>> = {};

/** `latest` and the explicit latest patch are the same file, don't download it twice. */
const normalizePatch = (patch: string) => (patch === config.latestPatch ? "latest" : patch);

const isRawIngameTip = (value: unknown): value is RawIngameTip => {
  const tip = value as RawIngameTip | null;
  return !!tip && typeof tip.id === "string" && typeof tip.locstring === "string";
};

/**
 * Parses the raw data file into the localized structure. Exported for testing / for consumers which
 * already have the raw JSON at hand.
 *
 * Tips without a text in the given locstring are left out - a tip without its text is of no use.
 */
const parseIngameTips = (rawFile: RawIngameTipsFile, locstring: PatchLocstring): IngameTip[] => {
  const tips: IngameTip[] = [];
  const seen = new Set<string>();

  for (const rawTip of rawFile.tips ?? []) {
    // Defensive - skip anything which doesn't look like a tip entry, and duplicates.
    if (!isRawIngameTip(rawTip) || seen.has(rawTip.id)) continue;

    const text = resolveLocstring(rawTip.locstring, locstring)?.trim();
    if (!text) continue;

    seen.add(rawTip.id);
    tips.push({
      id: rawTip.id,
      pbgid: rawTip.pbgid,
      text,
      category: rawTip.category ?? "",
      topic: rawTip.topic ?? "",
      gameMode: rawTip.gameMode ?? null,
    });
  }

  return tips;
};

const getRawIngameTipsFile = (patch: string): Promise<RawIngameTipsFile | null> => {
  if (!(patch in rawFileCache)) {
    rawFileCache[patch] = (async () => {
      try {
        const rawFile = await fetchJsonWithLogging(
          config.getPatchDataUrl(INGAME_TIPS_DATA_FILE, patch),
          `${INGAME_TIPS_DATA_FILE} for patch ${patch}`,
        );

        if (!rawFile || typeof rawFile !== "object" || !Array.isArray(rawFile.tips)) {
          // Thrown (not cached as null) - a faulty response must not hide the tips until restart.
          throw new Error(
            `[ingame-tips] Unexpected content of ${INGAME_TIPS_DATA_FILE} for patch ${patch}.`,
          );
        }

        return rawFile as RawIngameTipsFile;
      } catch (error) {
        // The data tag of the patch doesn't ship the file - remember that.
        if (isMissingMappingFile(error)) {
          console.warn(
            `[ingame-tips] ${INGAME_TIPS_DATA_FILE} is not part of the data of patch ${patch}.`,
          );
          return null;
        }
        // A transient failure must not stick - the next caller tries again.
        delete rawFileCache[patch];
        throw error;
      }
    })();
  }

  return rawFileCache[patch];
};

/**
 * Downloads the in-game tips for the given patch and resolves their texts for the given locale.
 *
 * Returns `null` when the data is not available for the requested patch - the file was added to the
 * data repo later, so older data tags don't have it. Errors are logged and don't throw, so a missing
 * file cannot break a build / page render.
 */
const getIngameTips = (options: GetIngameTipsOptions = {}): Promise<IngameTipsData | null> => {
  const { locale = "en" } = options;
  const patch = normalizePatch(options.patch ?? "latest");

  if (patch !== "latest" && !config.patches[patch]) {
    console.warn(
      `[ingame-tips] Unknown patch "${patch}", cannot download ${INGAME_TIPS_DATA_FILE}.`,
    );
    return Promise.resolve(null);
  }

  const cacheKey = `${patch}-${locale}`;

  if (!(cacheKey in ingameTipsCache)) {
    ingameTipsCache[cacheKey] = (async () => {
      try {
        const rawFile = await getRawIngameTipsFile(patch);
        if (!rawFile) return null;

        // The heavy locstring file is only needed once we know the tips exist for the patch.
        const locstring = await getLocstringForPatch(patch, locale);
        const tips = parseIngameTips(rawFile, locstring);

        if (tips.length === 0) {
          console.warn(
            `[ingame-tips] No tip with a text for patch ${patch} and locale ${locale}.`,
          );
          return null;
        }

        return { tips, patch, locale };
      } catch (e) {
        // Retry a transient failure on the next call, but don't break the caller now.
        delete ingameTipsCache[cacheKey];
        console.warn(
          `[ingame-tips] Failed to get ${INGAME_TIPS_DATA_FILE} for patch ${patch} and locale ${locale}. ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
        return null;
      }
    })();
  }

  return ingameTipsCache[cacheKey];
};

/** Clears the in-memory caches, useful in tests. */
const clearIngameTipsCache = () => {
  for (const key of Object.keys(rawFileCache)) delete rawFileCache[key];
  for (const key of Object.keys(ingameTipsCache)) delete ingameTipsCache[key];
};

export { INGAME_TIPS_DATA_FILE, clearIngameTipsCache, getIngameTips, parseIngameTips };
export type { GetIngameTipsOptions };
