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
  inFormatter: TextFormatterSchema,
  locale: string = "en",
) => {
  if (!inFormatter || !inFormatter?.formatter?.locstring?.value) return null;
  // We lookup for the formatter locstring and replace the values with the argument list.
  const foundFormatterLoc =
    unitStatsLocStringCache[locale]?.[inFormatter.formatter.locstring.value] ?? null;
  if (!foundFormatterLoc) return null;

  const valRegex = /(\%\d+\%)/g;
  const replacements = inFormatter.formatter_arguments.map((x) => {
    if (x.int_value) return `${x.int_value}`;
    if (x.float_value) return `${x.float_value}`;
    if (x.locstring_value) return resolveLocstring(x.locstring_value, locale);
  });
  const formattedLoc = foundFormatterLoc.replace(valRegex, () => replacements.shift() ?? "0");

  // Now replace the double % symbol via regex to preserve a single percentage symbol.
  const perRegex = /(\%\%)/g;
  const finalFormattedLoc = formattedLoc.replace(perRegex, "%");

  // Small formatter step to add spaces instead of the string line break characters.
  // const lineBreakRegex = /\\r?\\n|\\r|\\n/g;
  // const lineFormatterLoc = finalFormattedLoc.replace(lineBreakRegex, " ");

  return finalFormattedLoc;
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
