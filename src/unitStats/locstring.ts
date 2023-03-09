// Locstring example.
// {
//    "1234": "Value A",
//    "5678": "Value B"
// }

let unitStatsLocString: any;

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

  const myReqLocstring = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/locstring.json",
  );

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
