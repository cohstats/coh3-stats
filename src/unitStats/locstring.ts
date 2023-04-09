// Locstring example.
// {
//    "1234": "Value A",
//    "5678": "Value B"
// }

import config from "../../config";

let unitStatsLocString: Record<string, string>;

let unitStatsLocStringPatchData: Record<string, Record<string, string>>;

type LocstringSchema = {
  id: number;
  value: string;
};

type LocstringObjectSchema = {
  locstring: LocstringSchema;
};

// The input comes from the weapon / ebps / sbps / upgrade json.
const resolveLocstring = (inLocstring: LocstringObjectSchema, patch = "latest") => {
  if (!unitStatsLocStringPatchData[patch]) return "No text found.";
  // unitStatsLocString is a object (Record<string, string>
  return unitStatsLocStringPatchData[patch][inLocstring?.locstring?.value] ?? "No text found.";
};

const fetchLocstring = async (patch = "latest") => {
  if (patch == config.latestPatch) patch = "latest";

  if (unitStatsLocStringPatchData && unitStatsLocStringPatchData[patch])
    return unitStatsLocStringPatchData[patch];

  const myReqLocstring = await fetch(config.getPatchDataUrl("locstring.json", patch));

  const localUnitStatsLocString = await myReqLocstring.json();

  // some value are undefined, we need to fix that,
  // otherwise we cannot serialize it.
  for (const prop in localUnitStatsLocString)
    if (!localUnitStatsLocString[prop]) localUnitStatsLocString[prop] = "Missing Translation";

  if (!unitStatsLocStringPatchData) unitStatsLocStringPatchData = {};
  unitStatsLocStringPatchData[patch] = localUnitStatsLocString;
  if (patch == "latest") unitStatsLocString = localUnitStatsLocString;

  return unitStatsLocString;
};

const setLocstring = (locstring: any) => {
  unitStatsLocString = locstring;
};

export { resolveLocstring, fetchLocstring, unitStatsLocString, setLocstring };
