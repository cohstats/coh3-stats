/**
 * Locstring handling for the explorer data files.
 *
 * The data files of the coh3-data repo (`mp-maps.json`, `fs-perks.json`, ...) store every text as a
 * locstring id, which has to be resolved against the locstring file of the same patch. This module
 * holds the two things every one of them needs: the mapping of our app locales onto the locstring
 * files of the data repo, and a cached download of those files per patch.
 */

import config from "../../config";
import { fetchJsonWithLogging } from "../unitStats/fetch-mappings-withLogs";
import { fetchLocstring } from "../unitStats/locstring";

/** A resolved locstring file - locstring id -> text. Missing texts are stored as `null`. */
type PatchLocstring = Record<string, string | null>;

/**
 * Locales the data repo ships a locstring file for (`data/locales/<locale>-locstring.json`).
 *
 * These are the locales of the game itself, lowercased. Our app locales (see
 * `next-i18next.config.js`) currently map onto them one to one, the casing being the only
 * difference - `resolvePatchLocstringLocale` takes care of that.
 */
const PATCH_LOCSTRING_LOCALES = [
  "cs",
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pl",
  "pt-br",
  "ru",
  "tr",
  "uk-ua",
  "zh-hans",
  "zh-hant",
] as const;

type PatchLocstringLocale = (typeof PATCH_LOCSTRING_LOCALES)[number];

const DEFAULT_PATCH_LOCSTRING_LOCALE: PatchLocstringLocale = "en";

/**
 * Locstring file to use for a bare language code which has no file of its own. The game only ships
 * regional variants of these, so eg. `pt` has to be served by the Brazilian file.
 */
const PATCH_LOCSTRING_LANGUAGE_ALIASES: Record<string, PatchLocstringLocale> = {
  pt: "pt-br",
  uk: "uk-ua",
  // Simplified is what the game defaults to for a bare `zh`.
  zh: "zh-hans",
};

/**
 * Maps an app locale (eg. `pt-BR`, `zh-Hans`) onto the locstring file of the data repo.
 *
 * Falls back to English for anything we have no file for - a locale which was added to the app
 * before the game (and therefore the data repo) got it, or a locale coming from a url the user
 * typed by hand.
 */
const resolvePatchLocstringLocale = (locale?: string | null): PatchLocstringLocale => {
  if (!locale) return DEFAULT_PATCH_LOCSTRING_LOCALE;

  const normalized = locale.toLowerCase().replace("_", "-");

  if (PATCH_LOCSTRING_LOCALES.includes(normalized as PatchLocstringLocale)) {
    return normalized as PatchLocstringLocale;
  }

  const language = normalized.split("-")[0];

  if (PATCH_LOCSTRING_LOCALES.includes(language as PatchLocstringLocale)) {
    return language as PatchLocstringLocale;
  }

  return PATCH_LOCSTRING_LANGUAGE_ALIASES[language] ?? DEFAULT_PATCH_LOCSTRING_LOCALE;
};

// Cache of locstrings for patches other than the latest one, keyed by patch + locale.
// The latest patch is served from the shared unitStats locstring cache.
const patchLocstringCache: Record<string, PatchLocstring> = {};

/**
 * Returns the locstring map for the given patch and locale.
 *
 * For the latest patch we reuse the shared unitStats locstring cache, so the (heavy) locstring file
 * is downloaded only once per locale. For older patches we keep a separate cache, because the
 * unitStats one is keyed by locale only.
 *
 * The locale is mapped with `resolvePatchLocstringLocale`, so callers can pass an app locale as is.
 */
const getLocstringForPatch = async (patch: string, locale: string): Promise<PatchLocstring> => {
  const dataLocale = resolvePatchLocstringLocale(locale);

  if (patch === "latest" || patch === config.latestPatch) {
    return (await fetchLocstring(dataLocale)) ?? {};
  }

  const cacheKey = `${patch}-${dataLocale}`;
  if (patchLocstringCache[cacheKey]) return patchLocstringCache[cacheKey];

  const url = config.getPatchDataLocaleUrl(dataLocale, patch);
  const locstring = await fetchJsonWithLogging(
    url,
    `locstring for locale ${dataLocale}, patch ${patch}`,
  );

  // Some values are undefined, we need to fix that, otherwise we cannot serialize it.
  for (const prop in locstring) if (!locstring[prop]) locstring[prop] = null;

  patchLocstringCache[cacheKey] = locstring;
  return locstring;
};

/** Clears the in-memory locstring cache of the older patches, useful in tests. */
const clearPatchLocstringCache = () => {
  for (const key of Object.keys(patchLocstringCache)) delete patchLocstringCache[key];
};

export {
  PATCH_LOCSTRING_LOCALES,
  DEFAULT_PATCH_LOCSTRING_LOCALE,
  clearPatchLocstringCache,
  getLocstringForPatch,
  resolvePatchLocstringLocale,
};
export type { PatchLocstring, PatchLocstringLocale };
