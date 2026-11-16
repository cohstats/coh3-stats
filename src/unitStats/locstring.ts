// Locstring example.
// {
//    "1234": "Value A",
//    "5678": "Value B"
// }

import config from "../../config";
import { fetchJsonWithLogging } from "./fetch-mappings-withLogs";

export type LocstringTable = Record<string, string | null>;

// Map of locale -> locstring used for displayed text.
const unitStatsLocStringCache: Record<string, LocstringTable> = {};
// Numeric metadata must not depend on which display language was loaded first.
const englishMetadataCache = new Map<string, Promise<LocstringTable>>();

type LocstringSchema = {
  name: string;
  value: string;
};

type LocstringObjectSchema = {
  locstring: LocstringSchema;
};

type TextFormatterSchema = {
  // template_reference: { name: string; value: string };
  formatter: LocstringObjectSchema;
  formatter_arguments: Array<{
    int_value?: number;
    float_value?: number;
    locstring_value?: LocstringObjectSchema;
  }>;
};

// The input comes from the weapon / ebps / sbps / upgrade json.
const resolveLocstring = (
  inLocstring: LocstringObjectSchema,
  locale: string = "en",
  strings: LocstringTable | undefined = unitStatsLocStringCache[locale],
) => {
  if (!strings) return null;
  // unitStatsLocString is a object (Record<string, string>

  // console.log(`Resolving locstring: ${inLocstring?.locstring?.value}, locale: ${locale}`);

  return strings[inLocstring?.locstring?.value] ?? null;
};

const resolveTextFormatterLocstring = (
  inFormatter: TextFormatterSchema | null | undefined,
  locale: string = "en",
  strings: LocstringTable | undefined = unitStatsLocStringCache[locale],
): string | null => {
  const locKey = inFormatter?.formatter?.locstring?.value;
  if (!locKey) return null;

  // Look up the localized formatter string.
  const foundFormatterLoc = strings?.[locKey] ?? null;

  if (!foundFormatterLoc) return null;

  const args = inFormatter.formatter_arguments ?? [];

  const replacements = args.map((x): string | number => {
    // `!= null` is safer than truthy checks.
    // Even if 0 cannot happen here, this avoids future surprises.
    if (x.int_value != null) return x.int_value;
    if (x.float_value != null) return x.float_value;

    if (x.locstring_value != null) {
      return resolveLocstring(x.locstring_value, locale, strings) ?? "0";
    }

    return 0;
  });

  // Relic's placeholders are one-based: %3:.2% prints argument 3 with two
  // decimal places. The p formats append a percent sign to an already-scaled
  // value (25 -> 25%), with optional precision such as %1:.1p%.
  // Handle %% in the same pass so inserted text is never interpreted again.
  return foundFormatterLoc.replace(
    /%%|%(\d+)(?::(\.\d+p?|\.p|p))?%/g,
    (match, indexText: string | undefined, format: string | undefined) => {
      if (indexText === undefined) return "%";
      const value = replacements[Number(indexText) - 1] ?? 0;
      if (typeof value !== "number" || !Number.isFinite(value)) return `${value}`;
      const precisionText = format?.match(/^\.(\d+)/)?.[1];
      let formatted = `${value}`;
      if (precisionText !== undefined) {
        const precision = Number(precisionText);
        // Number.toFixed supports 0..100 digits; leave invalid formats visible.
        if (precision > 100) return match;
        formatted = value.toFixed(precision);
      }
      return format?.endsWith("p") ? `${formatted}%` : formatted;
    },
  );
};

/** Canonical English game metadata, isolated from the translated display cache. */
const fetchEnglishMetadataLocstring = (patch = "latest"): Promise<LocstringTable> => {
  const key = patch === config.latestPatch ? "latest" : patch;
  let request = englishMetadataCache.get(key);
  if (!request) {
    request = fetchJsonWithLogging(
      config.getPatchDataLocaleUrl("en", key),
      `English metadata for patch ${key}`,
    ).catch((error) => {
      englishMetadataCache.delete(key);
      throw error;
    });
    englishMetadataCache.set(key, request);
  }
  return request;
};

const fetchLocstring = async (locale: string = "en") => {
  if (unitStatsLocStringCache[locale]) return unitStatsLocStringCache[locale];

  const path = config.getPatchDataLocaleUrl(locale);
  const locstring = await fetchJsonWithLogging(path, `locstring for locale ${locale}`);

  // some value are undefined, we need to fix that,
  // otherwise we cannot serialize it.
  for (const prop in locstring) if (!locstring[prop]) locstring[prop] = null;

  unitStatsLocStringCache[locale] = locstring;
  return locstring;
};

const setLocstring = (locstring: any, locale: string = "en") => {
  unitStatsLocStringCache[locale] = locstring;
};

// For backward compatibility, expose the English locstring
const unitStatsLocString = () => unitStatsLocStringCache["en"] ?? null;

export {
  resolveLocstring,
  resolveTextFormatterLocstring,
  fetchLocstring,
  fetchEnglishMetadataLocstring,
  unitStatsLocString,
  setLocstring,
};
