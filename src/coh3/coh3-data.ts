import { leaderBoardType, platformType, raceID, raceType } from "./coh3-types";

export type PlayerRank = {
  name: string;
  url: string;
  min: number;
  max: number;
  rank: number;
  order: number;
};

export const PlayerRanks: Record<string, PlayerRank> = {
  // Requires 10 matches to get the placement rank.
  NO_RANK: {
    name: "Placement",
    url: "/icons/ranks/00_placement_medium.webp",
    min: -1,
    max: -1,
    rank: 0,
    order: 21,
  },
  // All other ranks after completing 10 matches.
  BRASS_3: {
    name: "Brass 3",
    url: "/icons/ranks/01_brass_03_medium.webp",
    min: 0,
    max: 299,
    rank: 0,
    order: 20,
  },
  BRASS_2: {
    name: "Brass 2",
    url: "/icons/ranks/01_brass_02_medium.webp",
    min: 300,
    max: 599,
    rank: 0,
    order: 19,
  },
  BRASS_1: {
    name: "Brass 1",
    url: "/icons/ranks/01_brass_01_medium.webp",
    min: 600,
    max: 799,
    rank: 0,
    order: 18,
  },
  BRONZE_3: {
    name: "Bronze 3",
    url: "/icons/ranks/02_bronze_03_medium.webp",
    min: 800,
    max: 999,
    rank: 0,
    order: 17,
  },
  BRONZE_2: {
    name: "Bronze 2",
    url: "/icons/ranks/02_bronze_02_medium.webp",
    min: 1000,
    max: 1049,
    rank: 0,
    order: 16,
  },
  BRONZE_1: {
    name: "Bronze 1",
    url: "/icons/ranks/02_bronze_01_medium.webp",
    min: 1050,
    max: 1099,
    rank: 0,
    order: 15,
  },
  IRON_3: {
    name: "Iron 3",
    url: "/icons/ranks/03_iron_03_medium.webp",
    min: 1100,
    max: 1149,
    rank: 0,
    order: 14,
  },
  IRON_2: {
    name: "Iron 2",
    url: "/icons/ranks/03_iron_02_medium.webp",
    min: 1150,
    max: 1199,
    rank: 0,
    order: 13,
  },
  IRON_1: {
    name: "Iron 1",
    url: "/icons/ranks/03_iron_01_medium.webp",
    min: 1200,
    max: 1249,
    rank: 0,
    order: 12,
  },
  SILVER_3: {
    name: "Silver 3",
    url: "/icons/ranks/04_silver_03_medium.webp",
    min: 1250,
    max: 1299,
    rank: 0,
    order: 11,
  },
  SILVER_2: {
    name: "Silver 2",
    url: "/icons/ranks/04_silver_02_medium.webp",
    min: 1300,
    max: 1349,
    rank: 0,
    order: 10,
  },
  SILVER_1: {
    name: "Silver 1",
    url: "/icons/ranks/04_silver_01_medium.webp",
    min: 1350,
    max: 1399,
    rank: 0,
    order: 9,
  },
  GOLD_3: {
    name: "Gold 3",
    url: "/icons/ranks/05_gold_03_medium.webp",
    min: 1400,
    max: 1499,
    rank: 0,
    order: 8,
  },
  GOLD_2: {
    name: "Gold 2",
    url: "/icons/ranks/05_gold_02_medium.webp",
    min: 1500,
    max: 1599,
    rank: 0,
    order: 7,
  },
  // Not in the top 50 players per leaderboard.
  GOLD_1: {
    name: "Gold 1",
    url: "/icons/ranks/05_gold_01_medium.webp",
    min: 1600,
    max: 5000,
    rank: 0,
    order: 6,
  },
  // These ranks need the special "top" field to identify those players above +1600 ELO in the leaderboard.
  CHALLENGER_5: {
    name: "Challenger 5",
    url: "/icons/ranks/06_master_05_medium.webp",
    min: 1600,
    max: 5000,
    rank: 50,
    order: 5,
  },
  CHALLENGER_4: {
    name: "Challenger 4",
    url: "/icons/ranks/06_master_04_medium.webp",
    min: 1600,
    max: 5000,
    rank: 25,
    order: 4,
  },
  CHALLENGER_3: {
    name: "Challenger 3",
    url: "/icons/ranks/06_master_03_medium.webp",
    min: 1600,
    max: 5000,
    rank: 10,
    order: 3,
  },
  CHALLENGER_2: {
    name: "Challenger 2",
    url: "/icons/ranks/06_master_02_medium.webp",
    min: 1600,
    max: 5000,
    rank: 5,
    order: 2,
  },
  CHALLENGER_1: {
    name: "Challenger 1",
    url: "/icons/ranks/06_master_01_medium.webp",
    min: 1600,
    max: 5000,
    rank: 1,
    order: 1,
  },
};

export type LeaderboardRegionTypes = keyof typeof leaderboardRegions;

export const leaderboardRegions = {
  europe: {
    id: 2074389,
    name: "Europe",
    locstringid: 11223541,
  },
  na: {
    id: 2074390,
    name: "North America",
    locstringid: 11223543,
  },
  me: {
    id: 2074436,
    name: "Middle East",
    locstringid: 11223542,
  },
  asia: {
    id: 2074437,
    name: "Asia",
    locstringid: 11223540,
  },
  sa: {
    id: 2074438,
    name: "South America",
    locstringid: 11223545,
  },
  oceania: {
    id: 2074440,
    name: "Oceania",
    locstringid: 11223544,
  },
  africa: {
    id: 2074441,
    name: "Africa",
    locstringid: 11223539,
  },
  unkown: {
    id: 2074442,
    name: "Unknown",
    locstringid: 11223546,
  },
};

export const leaderboardsIDAsObject = {
  "1v1": {
    american: 2130255,
    british: 2130257,
    dak: 2130259,
    german: 2130261,
  },
  "2v2": {
    american: 2130300,
    british: 2130302,
    dak: 2130304,
    german: 2130306,
  },
  "3v3": {
    american: 2130329,
    british: 2130331,
    dak: 2130333,
    german: 2130335,
  },
  "4v4": {
    american: 2130353,
    british: 2130356,
    dak: 2130358,
    german: 2130360,
  },
};

export const leaderboardsIDsToTypes: Record<number, { type: leaderBoardType; race: raceType }> = {
  2130255: {
    type: "1v1",
    race: "american",
  },
  2130257: {
    type: "1v1",
    race: "british",
  },
  2130259: {
    type: "1v1",
    race: "dak",
  },
  2130261: {
    type: "1v1",
    race: "german",
  },
  2130300: {
    type: "2v2",
    race: "american",
  },
  2130302: {
    type: "2v2",
    race: "british",
  },
  2130304: {
    type: "2v2",
    race: "dak",
  },
  2130306: {
    type: "2v2",
    race: "german",
  },
  2130329: {
    type: "3v3",
    race: "american",
  },
  2130331: {
    type: "3v3",
    race: "british",
  },
  2130333: {
    type: "3v3",
    race: "dak",
  },
  2130335: {
    type: "3v3",
    race: "german",
  },
  2130353: {
    type: "4v4",
    race: "american",
  },
  2130356: {
    type: "4v4",
    race: "british",
  },
  2130358: {
    type: "4v4",
    race: "dak",
  },
  2130360: {
    type: "4v4",
    race: "german",
  },
};

export const localizedNames: Record<raceType, string> = {
  german: "Wehrmacht",
  american: "US Forces",
  dak: "Deutsches Afrikakorps",
  british: "British Forces",
};

export const localizedGameTypes: Record<leaderBoardType, string> = {
  "1v1": "1 vs 1",
  "2v2": "2 vs 2",
  "3v3": "3 vs 3",
  "4v4": "4 vs 4",
};

export const raceIDs: Record<raceID, raceType> = {
  129494: "american",
  137123: "german",
  197345: "british",
  198437: "dak",
  // WTF? This is British_Africa but localized name is still British
  203852: "british",
};

export const raceIDsNameAsKey = {
  american: 129494,
  german: 137123,
  dak: 198437,
  british: 203852,
};

// This is what we get from the cohdb.com API
export const cohDBracesToNormalRaces: Record<string, raceType> = {
  afrika_korps: "dak",
  british_africa: "british",
  americans: "american",
  germans: "german",
};

export const raceIDsAsObject: Record<
  number,
  {
    id: number;
    name: string;
    faction_id: number;
    localizedName?: string;
  }
> = {
  129494: {
    id: 129494,
    name: "Americans",
    faction_id: 2,
    localizedName: "US Forces",
  },
  137123: {
    id: 137123,
    name: "Germans",
    faction_id: 1,
    localizedName: "Wehrmacht",
  },
  181726: {
    id: 181726,
    name: "Americans_Campaign",
    faction_id: 0,
  },
  196502: {
    id: 196502,
    name: "Germans_Campaign",
    faction_id: 0,
  },
  197345: {
    id: 197345,
    name: "British",
    faction_id: 2,

    localizedName: "British Forces",
  },
  198437: {
    id: 198437,
    name: "Afrika_Korps",
    faction_id: 1,

    localizedName: "Afrikakorps",
  },
  203852: {
    id: 203852,
    name: "British_Africa",
    faction_id: 2,

    localizedName: "British Forces",
  },
  211661: {
    id: 211661,
    name: "British_Campaign",
    faction_id: 0,
  },
  2057043: {
    id: 2057043,
    name: "Afrika_Korps_Campaign",
    faction_id: 0,
  },
  2064141: {
    id: 2064141,
    name: "Partisan",
    faction_id: 2,
  },
};

export const matchTypesAsObject: Record<
  number,
  { id: number; name: string; localizedName: string }
> = {
  0: {
    id: 0,
    name: "Custom",
    localizedName: "Custom",
  },
  1: {
    id: 1,
    name: "1V1_Ranked",
    localizedName: "1 vs 1",
  },
  2: {
    id: 2,
    name: "2V2_Ranked",
    localizedName: "2 vs 2",
  },
  3: {
    id: 3,
    name: "3V3_Ranked",
    localizedName: "3 vs 3",
  },
  4: {
    id: 4,
    name: "4V4_Ranked",
    localizedName: "4 vs 4",
  },
  5: {
    id: 5,
    name: "2V2_Ai_Easy",
    localizedName: "2v2 AI Easy",
  },
  6: {
    id: 6,
    name: "2V2_Ai_Medium",
    localizedName: "2v2 AI Medium",
  },
  7: {
    id: 7,
    name: "2V2_Ai_Hard",
    localizedName: "2v2 AI Hard",
  },
  8: {
    id: 8,
    name: "2V2_Ai_Expert",
    localizedName: "2v2 AI Expert",
  },
  9: {
    id: 9,
    name: "3V3_Ai_Easy",
    localizedName: "3v3 AI Easy",
  },
  10: {
    id: 10,
    name: "3V3_Ai_Medium",
    localizedName: "3v3 AI Medium",
  },
  11: {
    id: 11,
    name: "3V3_Ai_Hard",
    localizedName: "3v3 AI Hard",
  },
  12: {
    id: 12,
    name: "3V3_Ai_Expert",
    localizedName: "3v3 AI Expert",
  },
  13: {
    id: 13,
    name: "4V4_Ai_Easy",
    localizedName: "4v4 AI Easy",
  },
  14: {
    id: 14,
    name: "4V4_Ai_Medium",
    localizedName: "4v4 AI Medium",
  },
  15: {
    id: 15,
    name: "4V4_Ai_Hard",
    localizedName: "4v4 AI Hard",
  },
  16: {
    id: 16,
    name: "4V4_Ai_Expert",
    localizedName: "4v4 AI Expert",
  },
  20: {
    id: 20,
    name: "1V1_Unranked",
    localizedName: "1 vs 1",
  },
  21: {
    id: 21,
    name: "2V2_Unranked",
    localizedName: "2 vs 2",
  },
  22: {
    id: 22,
    name: "3V3_Unranked",
    localizedName: "3 vs 3",
  },
  23: {
    id: 23,
    name: "4V4_Unranked",
    localizedName: "4 vs 4",
  },
};

export const gameTypesIDsTypeAsKey = {
  "1v1": 20,
  "2v2": 21,
  "3v3": 22,
  "4v4": 23,
};

export const apiTitleTypes: Record<platformType, string> = {
  steam: "coh3",
  xbox: "coh3xbl",
  psn: "coh3psn",
};

const OfficialMapKeys = [
  "benghazi_6p",
  "catania_crossing_6p",
  "cliff_crossing_2p",
  "day_101_4p",
  "desert_airfield_6p_mkii",
  "desert_village_2p_mkiii",
  "gardens_2p_mm",
  "industrial_railyard_6p_mkii",
  "monte_cavo_8p",
  "mountain_ruins_6p",
  "mountain_ruins_8p_mkii",
  "pachino_2p", // Current Pachino 1v1 map. (post-1.3.0)
  "rural_town_2p_mkii", // Old Pachino 1v1 map (pre-1.3.0).
  "rails_and_sand_4p",
  "rural_castle_4p",
  "rural_town_4p",
  "sousse_wetlands_8p",
  "torrente_4p_mkiii",
  "twin_beach_2p_mkii",
  "villa_fiore_2p_mkii",
  "winter_line_8p_mkii",
  /* ---------- 1.5.0 Maps ---------- */
  "semois_2p",
  "elst_outskirts_4p",
  "montherme_6p",
  "sangro_river_crossing_6p",
  "sousse_stronghold_8p",
  "faymonville", // Community maps
  "steppe_8p", // Community maps
  /* ---------- 1.6.0 Maps ---------- */
  "eindhoven", // Community maps
  "gothic_line_8p", // Community maps
  "oasis_depot_8p", // Community maps
  /* ---------- 1.7.0 Maps ---------- */
  "black_gold_8p",
  /* ---------- 1.8.0 Maps ---------- */
  "primosole_4p",
  "longstop_hill_6p",
  "halfa_8p",
  /* ---------- 1.9.0 Maps ---------- */
  "rapido_river_8p",
  "santuario_4p", // Community maps
] as const;

export function isOfficialMap(mapname: string): mapname is (typeof OfficialMapKeys)[number] {
  return OfficialMapKeys.includes(mapname as (typeof OfficialMapKeys)[number]);
}

type OfficialMapValue = {
  name: string;
  url: string;
  /** Flag to filter out those official maps that are excluded from "ranked". */
  // automatch: boolean;
};

export const maps: Record<(typeof OfficialMapKeys)[number], OfficialMapValue> = {
  twin_beach_2p_mkii: {
    name: "Twin Beaches",
    url: "/twin_beach_2p_mkii/twin_beach_2p_mkii.webp",
    // automatch: true,
  },
  desert_village_2p_mkiii: {
    name: "Road to Tunis",
    url: "/desert_village_2p_mkiii/desert_village_2p_mkiii.webp",
    // automatch: true,
  },
  cliff_crossing_2p: {
    name: "Taranto Coastline",
    url: "/cliff_crossing_2p/cliff_crossing_2p.webp",
    // automatch: true,
  },
  rails_and_sand_4p: {
    name: "Campbell's Convoy",
    url: "/rails_and_sand_4p/rails_and_sand_4p.webp",
    // automatch: true,
  },
  rural_town_4p: {
    name: "Pachino Farmlands",
    url: "/rural_town_4p/rural_town_4p.webp",
    // automatch: true,
  },
  torrente_4p_mkiii: {
    name: "Torrente",
    url: "/torrente_4p_mkiii/torrente_4p_mkiii.webp",
    // automatch: true,
  },
  rural_castle_4p: {
    name: "Aere Perennius",
    url: "/rural_castle_4p/rural_castle_4p.webp",
    // automatch: true,
  },
  desert_airfield_6p_mkii: {
    name: "Gazala Landing Ground",
    url: "/desert_airfield_6p_mkii/desert_airfield_6p_mkii.webp",
    // automatch: true,
  },
  industrial_railyard_6p_mkii: {
    name: "L'Aquila",
    url: "/industrial_railyard_6p_mkii/industrial_railyard_6p_mkii.webp",
    // automatch: true,
  },
  winter_line_8p_mkii: {
    name: "Winter Line",
    url: "/winter_line_8p_mkii/winter_line_8p_mkii.webp",
    // automatch: true,
  },
  mountain_ruins_8p_mkii: {
    name: "Mignano Gap",
    url: "/mountain_ruins_8p_mkii/mountain_ruins_8p_mkii.webp",
    // automatch: true,
  },
  mountain_ruins_6p: {
    name: "Mignano Summit",
    url: "/mountain_ruins_6p/mountain_ruins_6p.webp",
    // automatch: true,
  },
  gardens_2p_mm: {
    name: "Gardens",
    url: "/gardens_2p_mm/gardens_2p.webp",
    // automatch: true,
  },
  pachino_2p: {
    name: "Pachino Stalemate",
    url: "/pachino_2p/pachino_2p.webp",
    // automatch: true,
  },
  rural_town_2p_mkii: {
    name: "Pachino Farmlands",
    url: "/rural_town_2p_mkii/pachino_2p.webp",
    // automatch: true,
  },
  monte_cavo_8p: {
    name: "Monte Cavo",
    url: "/monte_cavo_8p/monte_cavo_8p.webp",
    // automatch: true,
  },
  benghazi_6p: {
    name: "Benghazi",
    url: "/benghazi_6p/benghazi_6p.webp",
    // automatch: true,
  },
  sousse_wetlands_8p: {
    name: "Sousse Wetlands",
    url: "/sousse_wetlands_8p/sousse_wetlands_8p.webp",
    // automatch: true,
  },
  catania_crossing_6p: {
    name: "Catania Crossing",
    url: "/catania_crossing_6p/catania_crossing_6p.webp",
    // automatch: false,
  },
  day_101_4p: {
    name: "Day 101",
    url: "/day_101_4p/day_101_4p.webp",
    // automatch: true,
  },
  villa_fiore_2p_mkii: {
    name: "Villa Fiore",
    url: "/villa_fiore_2p_mkii/villa_fiore_2p_mkii.webp",
    // automatch: true,
  },
  /* ------------------------- 1.5.0 Maps ---------------------------- */
  semois_2p: {
    name: "Semois",
    url: "/semois_2p/semois_2p.webp",
  },
  elst_outskirts_4p: {
    name: "Elst Outskirts",
    url: "/elst_outskirts_4p/elst_outskirts_4p.webp",
  },
  montherme_6p: {
    name: "Montherme",
    url: "/montherme_6p/montherme_6p.webp",
  },
  sangro_river_crossing_6p: {
    name: "Sangro River Crossing",
    url: "/sangro_river_crossing_6p/sangro_river_crossing_6p.webp",
  },
  sousse_stronghold_8p: {
    name: "Sousse Stronghold",
    url: "/sousse_stronghold_8p/sousse_stronghold_8p.webp",
  },
  faymonville: {
    name: "Faymonville",
    url: "/faymonville/faymonville.webp",
  },
  steppe_8p: {
    name: "Steppes",
    url: "/steppe_8p/steppe_8p.webp",
  },
  /* ------------------------- 1.6.0 Maps ---------------------------- */
  eindhoven: {
    name: "Operation Eindhoven",
    url: "/eindhoven/eindhoven.webp",
  },
  gothic_line_8p: {
    name: "Gothic Line",
    url: "/gothic_line_8p/gothic_line_8p.webp",
  },
  oasis_depot_8p: {
    name: "Oasis Depot",
    url: "/oasis_depot_8p/oasis_depot_8p.webp",
  },
  /* ------------------------- 1.7.0 Maps ---------------------------- */
  black_gold_8p: {
    name: "Black Gold",
    url: "/black_gold_8p/black_gold_8p.webp",
  },
  /* ------------------------- 1.8.0 Maps ---------------------------- */
  primosole_4p: {
    name: "Road to Primosole",
    url: "/primosole_4p/primosole_4p.webp",
  },
  longstop_hill_6p: {
    name: "Longstop Hill",
    url: "/longstop_hill_6p/longstop_hill_6p.webp",
  },
  halfa_8p: {
    name: "Alam el Halfa",
    url: "/halfa_8p/halfa_8p.webp",
  },
  /* ------------------------- 1.9.0 Maps ---------------------------- */
  santuario_4p: {
    name: "Santuario",
    url: "/santuario_4p/santuario_4p.webp",
  },
  rapido_river_8p: {
    name: "Rapido River Crossing",
    url: "/rapido_river_8p/rapido_river_8p.webp",
  },
};
