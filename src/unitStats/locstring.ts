// Locstring example.
// {
//    "1234": "Value A",
//    "5678": "Value B"
// }

import config from "../../config";

let unitStatsLocString: Record<string, string | null>;

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
  formatter_arguments: Array<{ int_value: number }>;
};

// The input comes from the weapon / ebps / sbps / upgrade json.
const resolveLocstring = (inLocstring: LocstringObjectSchema) => {
  if (!unitStatsLocString) return null;
  // unitStatsLocString is a object (Record<string, string>
  return unitStatsLocString[inLocstring?.locstring?.value] ?? null;
};

const resolveTextFormatterLocstring = (inFormatter: TextFormatterSchema) => {
  if (!inFormatter || !inFormatter?.formatter?.locstring?.value) return null;
  // We lookup for the formatter locstring and replace the values with the argument list.
  const foundFormatterLoc = unitStatsLocString[inFormatter.formatter.locstring.value] ?? null;
  if (!foundFormatterLoc) return null;

  const valRegex = /(\%\d+\%)/g;
  const replacements = inFormatter.formatter_arguments.map((x) => `${x.int_value}`);
  const formattedLoc = foundFormatterLoc.replace(valRegex, () => replacements.shift() ?? "0");

  // Now replace the double % symbol via regex to preserve a single percentage symbol.
  const perRegex = /(\%\%)/g;
  const finalFormattedLoc = formattedLoc.replace(perRegex, "%");

  return finalFormattedLoc;
};

const fetchLocstring = async () => {
  if (unitStatsLocString) return unitStatsLocString;

  const myReqLocstring = await fetch(config.getPatchDataUrl("locstring.json"));

  unitStatsLocString = await myReqLocstring.json();

  // some value are undefined, we need to fix that,
  // otherwise we cannot serialize it.
  for (const prop in unitStatsLocString)
    if (!unitStatsLocString[prop]) unitStatsLocString[prop] = null;

  return unitStatsLocString;
};

const setLocstring = (locstring: any) => {
  unitStatsLocString = locstring;
};

export {
  resolveLocstring,
  resolveTextFormatterLocstring,
  fetchLocstring,
  unitStatsLocString,
  setLocstring,
};
