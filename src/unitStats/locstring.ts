// Locstring example.
// {
//    "1234": "Value A",
//    "5678": "Value B"
// }

import config from "../../config";

let unitStatsLocString: Record<string, string>;

type LocstringSchema = {
  id: number;
  value: string;
};

type LocstringObjectSchema = {
  locstring: LocstringSchema;
};

// The input comes from the weapon / ebps / sbps / upgrade json.
const resolveLocstring = (inLocstring: LocstringObjectSchema) => {
  if (!unitStatsLocString) return "No text found.";
  // unitStatsLocString is a object (Record<string, string>
  return unitStatsLocString[inLocstring?.locstring?.value] ?? "No text found.";
};

const fetchLocstring = async () => {
  if (unitStatsLocString) return unitStatsLocString;

  const myReqLocstring = await fetch(config.getPatchDataUrl("locstring.json"));

  unitStatsLocString = await myReqLocstring.json();

  // some value are undefined, we need to fix that,
  // otherwise we cannot serialize it.
  for (const prop in unitStatsLocString)
    if (!unitStatsLocString[prop]) unitStatsLocString[prop] = "Missing Translation";

  return unitStatsLocString;
};

const setLocstring = (locstring: any) => {
  unitStatsLocString = locstring;
};

export { resolveLocstring, fetchLocstring, unitStatsLocString, setLocstring };
