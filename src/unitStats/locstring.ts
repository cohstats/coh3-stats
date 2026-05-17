// Locstring example.
// {
//    "1234": "Value A",
//    "5678": "Value B"
// }

import config from "../../config";

// Map of locale -> locstring
const unitStatsLocStringCache: Record<string, Record<string, string | null>> = {};

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
const resolveLocstring = (inLocstring: LocstringObjectSchema, locale: string = "en") => {
  if (!unitStatsLocStringCache[locale]) return null;
  // unitStatsLocString is a object (Record<string, string>

  // console.log(`Resolving locstring: ${inLocstring?.locstring?.value}, locale: ${locale}`);

  return unitStatsLocStringCache[locale][inLocstring?.locstring?.value] ?? null;
};

const resolveTextFormatterLocstring = (
  inFormatter: TextFormatterSchema | null | undefined,
  locale: string = "en",
): string | null => {
  const locKey = inFormatter?.formatter?.locstring?.value;
  if (!locKey) return null;

  // Look up the localized formatter string.
  const foundFormatterLoc = unitStatsLocStringCache[locale]?.[locKey] ?? null;

  if (!foundFormatterLoc) return null;

  const args = inFormatter.formatter_arguments ?? [];

  const replacements = args.map((x): string => {
    // `!= null` is safer than truthy checks.
    // Even if 0 cannot happen here, this avoids future surprises.
    if (x.int_value != null) return `${x.int_value}`;
    if (x.float_value != null) return `${x.float_value}`;

    if (x.locstring_value != null) {
      return resolveLocstring(x.locstring_value, locale) ?? "0";
    }

    return "0";
  });

  // Replace numbered placeholders using their actual index.
  // %1% = replacements[0]
  // %2% = replacements[1]
  // etc.
  const formattedLoc = foundFormatterLoc.replace(/%(\d+)%/g, (_match, indexText) => {
    const index = Number(indexText) - 1;
    return replacements[index] ?? "0";
  });

  // Replace escaped percentage signs.
  return formattedLoc.replace(/%%/g, "%");
};

const fetchLocstring = async (locale: string = "en") => {
  if (unitStatsLocStringCache[locale]) return unitStatsLocStringCache[locale];

  const path = config.getPatchDataLocaleUrl(locale);
  const myReqLocString = await fetch(path);

  const locstring = await myReqLocString.json();

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
  unitStatsLocString,
  setLocstring,
};
