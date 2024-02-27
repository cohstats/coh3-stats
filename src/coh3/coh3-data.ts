import { leaderBoardType, platformType, raceID, raceType } from "./coh3-types";

export type PlayerRank = { name: string; url: string; min: number; max: number; rank: number };

export const PlayerRanks: Record<string, PlayerRank> = {
  // Requires 10 matches to get the placement rank.
  NO_RANK: {
    name: "Placement",
    url: "/icons/ranks/00_placement_medium.webp",
    min: -1,
    max: -1,
    rank: 0,
  },
  // All other ranks after completing 10 matches.
  BRASS_3: {
    name: "Brass 3",
    url: "/icons/ranks/01_brass_03_medium.webp",
    min: 0,
    max: 299,
    rank: 0,
  },
  BRASS_2: {
    name: "Brass 2",
    url: "/icons/ranks/01_brass_02_medium.webp",
    min: 300,
    max: 599,
    rank: 0,
  },
  BRASS_1: {
    name: "Brass 1",
    url: "/icons/ranks/01_brass_01_medium.webp",
    min: 600,
    max: 799,
    rank: 0,
  },
  BRONZE_3: {
    name: "Bronze 3",
    url: "/icons/ranks/02_bronze_03_medium.webp",
    min: 800,
    max: 999,
    rank: 0,
  },
  BRONZE_2: {
    name: "Bronze 2",
    url: "/icons/ranks/02_bronze_02_medium.webp",
    min: 1000,
    max: 1049,
    rank: 0,
  },
  BRONZE_1: {
    name: "Bronze 1",
    url: "/icons/ranks/02_bronze_01_medium.webp",
    min: 1050,
    max: 1099,
    rank: 0,
  },
  IRON_3: {
    name: "Iron 3",
    url: "/icons/ranks/03_iron_03_medium.webp",
    min: 1100,
    max: 1149,
    rank: 0,
  },
  IRON_2: {
    name: "Iron 2",
    url: "/icons/ranks/03_iron_02_medium.webp",
    min: 1150,
    max: 1199,
    rank: 0,
  },
  IRON_1: {
    name: "Iron 1",
    url: "/icons/ranks/03_iron_01_medium.webp",
    min: 1200,
    max: 1249,
    rank: 0,
  },
  SILVER_3: {
    name: "Silver 3",
    url: "/icons/ranks/04_silver_03_medium.webp",
    min: 1250,
    max: 1299,
    rank: 0,
  },
  SILVER_2: {
    name: "Silver 2",
    url: "/icons/ranks/04_silver_02_medium.webp",
    min: 1300,
    max: 1349,
    rank: 0,
  },
  SILVER_1: {
    name: "Silver 1",
    url: "/icons/ranks/04_silver_01_medium.webp",
    min: 1350,
    max: 1399,
    rank: 0,
  },
  GOLD_3: {
    name: "Gold 3",
    url: "/icons/ranks/05_gold_03_medium.webp",
    min: 1400,
    max: 1499,
    rank: 0,
  },
  GOLD_2: {
    name: "Gold 2",
    url: "/icons/ranks/05_gold_02_medium.webp",
    min: 1500,
    max: 1599,
    rank: 0,
  },
  // Not in the top 50 players per leaderboard.
  GOLD_1: {
    name: "Gold 1",
    url: "/icons/ranks/05_gold_01_medium.webp",
    min: 1600,
    max: 5000,
    rank: 0,
  },
  // These ranks need the special "top" field to identify those players above +1600 ELO in the leaderboard.
  CHALLENGER_5: {
    name: "Challenger 5",
    url: "/icons/ranks/06_master_05_medium.webp",
    min: 1600,
    max: 5000,
    rank: 50,
  },
  CHALLENGER_4: {
    name: "Challenger 4",
    url: "/icons/ranks/06_master_04_medium.webp",
    min: 1600,
    max: 5000,
    rank: 25,
  },
  CHALLENGER_3: {
    name: "Challenger 3",
    url: "/icons/ranks/06_master_03_medium.webp",
    min: 1600,
    max: 5000,
    rank: 10,
  },
  CHALLENGER_2: {
    name: "Challenger 2",
    url: "/icons/ranks/06_master_02_medium.webp",
    min: 1600,
    max: 5000,
    rank: 5,
  },
  CHALLENGER_1: {
    name: "Challenger 1",
    url: "/icons/ranks/06_master_01_medium.webp",
    min: 1600,
    max: 5000,
    rank: 1,
  },
};

const leaderboardsIDAsObject = {
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

const leaderboardsIDsToTypes: Record<number, { type: leaderBoardType; race: raceType }> = {
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

const localizedNames: Record<raceType, string> = {
  german: "Wehrmacht",
  american: "US Forces",
  dak: "Deutsches Afrikakorps",
  british: "British Forces",
};

const localizedGameTypes: Record<leaderBoardType, string> = {
  "1v1": "1 vs 1",
  "2v2": "2 vs 2",
  "3v3": "3 vs 3",
  "4v4": "4 vs 4",
};

const raceIDs: Record<raceID, raceType> = {
  129494: "american",
  137123: "german",
  197345: "british",
  198437: "dak",
  // WTF? This is British_Africa but localized name is still British
  203852: "british",
};

// This is what we get from the cohdb.com API
export const cohDBracesToNormalRaces: Record<string, raceType> = {
  afrika_korps: "dak",
  british_africa: "british",
  americans: "american",
  germans: "german",
};

const raceIDsAsObject: Record<
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

const matchTypesAsObject: Record<number, { id: number; name: string; localizedName?: string }> = {
  0: {
    id: 0,
    name: "Custom",
  },
  1: {
    id: 1,
    name: "1V1_Ranked",
    localizedName: "1 VS 1",
  },
  2: {
    id: 2,
    name: "2V2_Ranked",
    localizedName: "2 VS 2",
  },
  3: {
    id: 3,
    name: "3V3_Ranked",
    localizedName: "3 VS 3",
  },
  4: {
    id: 4,
    name: "4V4_Ranked",
    localizedName: "4 VS 4",
  },
  5: {
    id: 5,
    name: "2V2_Ai_Easy",
  },
  6: {
    id: 6,
    name: "2V2_Ai_Medium",
  },
  7: {
    id: 7,
    name: "2V2_Ai_Hard",
  },
  8: {
    id: 8,
    name: "2V2_Ai_Expert",
  },
  9: {
    id: 9,
    name: "3V3_Ai_Easy",
  },
  10: {
    id: 10,
    name: "3V3_Ai_Medium",
  },
  11: {
    id: 11,
    name: "3V3_Ai_Hard",
  },
  12: {
    id: 12,
    name: "3V3_Ai_Expert",
  },
  13: {
    id: 13,
    name: "4V4_Ai_Easy",
  },
  14: {
    id: 14,
    name: "4V4_Ai_Medium",
  },
  15: {
    id: 15,
    name: "4V4_Ai_Hard",
  },
  16: {
    id: 16,
    name: "4V4_Ai_Expert",
  },
  20: {
    id: 20,
    name: "1V1_Unranked",
    localizedName: "1 VS 1",
  },
  21: {
    id: 21,
    name: "2V2_Unranked",
    localizedName: "2 VS 2",
  },
  22: {
    id: 22,
    name: "3V3_Unranked",
    localizedName: "3 VS 3",
  },
  23: {
    id: 23,
    name: "4V4_Unranked",
    localizedName: "4 VS 4",
  },
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
  "faymonville_2p", // Community maps
  "steppe_8p", // Community maps
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

const maps: Record<(typeof OfficialMapKeys)[number], OfficialMapValue> = {
  twin_beach_2p_mkii: {
    name: "Twin Beaches",
    url: "/icons/maps/twin_beach_2p_mkii_mm_handmade.webp",
    // automatch: true,
  },
  desert_village_2p_mkiii: {
    name: "Road to Tunis",
    url: "/icons/maps/desert_village_2p_mkiii_mm_handmade.webp",
    // automatch: true,
  },
  cliff_crossing_2p: {
    name: "Taranto Coastline",
    url: "/icons/maps/cliff_crossing_2p_mm_handmade.webp",
    // automatch: true,
  },
  rails_and_sand_4p: {
    name: "Campbell's Convoy",
    url: "/icons/maps/rails_and_sand_4p_mm_handmade.webp",
    // automatch: true,
  },
  rural_town_4p: {
    name: "Pachino Farmlands",
    url: "/icons/maps/rural_town_4p_mm_handmade.webp",
    // automatch: true,
  },
  torrente_4p_mkiii: {
    name: "Torrente",
    url: "/icons/maps/torrente_4p_mkiii_mm_handmade.webp",
    // automatch: true,
  },
  rural_castle_4p: {
    name: "Aere Perennius",
    url: "/icons/maps/rural_castle_4p_mm_handmade.webp",
    // automatch: true,
  },
  desert_airfield_6p_mkii: {
    name: "Gazala Landing Ground",
    url: "/icons/maps/desert_airfield_6p_mkii_mm_handmade.webp",
    // automatch: true,
  },
  industrial_railyard_6p_mkii: {
    name: "L'Aquila",
    url: "/icons/maps/industrial_railyard_6p_mkii_mm_handmade.webp",
    // automatch: true,
  },
  winter_line_8p_mkii: {
    name: "Winter Line",
    url: "/icons/maps/winter_line_8p_mkii_mm_handmade.webp",
    // automatch: true,
  },
  mountain_ruins_8p_mkii: {
    name: "Mignano Gap",
    url: "/icons/maps/mountain_ruins_8p_mkii_mm_handmade.webp",
    // automatch: true,
  },
  mountain_ruins_6p: {
    name: "Mignano Summit",
    url: "/icons/maps/mountain_ruins_6p_mm_handmade.webp",
    // automatch: true,
  },
  gardens_2p_mm: {
    name: "Gardens",
    url: "/icons/maps/gardens_2p_mm_handmade.webp",
    // automatch: true,
  },
  pachino_2p: {
    name: "Pachino Stalemate",
    url: "/icons/maps/pachino_2p_mm_handmade.webp",
    // automatch: true,
  },
  rural_town_2p_mkii: {
    name: "Pachino Farmlands",
    url: "/icons/maps/pachino_2p_mm_handmade.webp",
    // automatch: true,
  },
  monte_cavo_8p: {
    name: "Monte Cavo",
    url: "/icons/maps/monte_cavo_8p_mm_handmade.webp",
    // automatch: true,
  },
  benghazi_6p: {
    name: "Benghazi",
    url: "/icons/maps/benghazi_6p_mm_handmade.webp",
    // automatch: true,
  },
  sousse_wetlands_8p: {
    name: "Sousse Wetlands",
    url: "/icons/maps/sousse_wetlands_8p_mm_handmade.webp",
    // automatch: true,
  },
  catania_crossing_6p: {
    name: "Catania Crossing",
    url: "/icons/maps/catania_crossing_6p_mm_handmade.webp",
    // automatch: false,
  },
  day_101_4p: {
    name: "Day 101",
    url: "/icons/maps/day_101_4p_mm_handmade.webp",
    // automatch: true,
  },
  villa_fiore_2p_mkii: {
    name: "Villa Fiore",
    url: "/icons/maps/villa_fiore_2p_mkii_mm_handmade.webp",
    // automatch: true,
  },
  /* ------------------------- 1.5.0 Maps ---------------------------- */
  semois_2p: {
    name: "Semois",
    url: "/icons/maps/semois_2p_mm_handmade.webp",
  },
  elst_outskirts_4p: {
    name: "Elst Outskirts",
    url: "/icons/maps/elst_outskirts_4p_mm_handmade.webp",
  },
  montherme_6p: {
    name: "Elst Outskirts",
    url: "/icons/maps/montherme_6p_mm_handmade.webp",
  },
  sangro_river_crossing_6p: {
    name: "Sangro River Crossing",
    url: "/icons/maps/sangro_river_crossing_6p_mm_handmade.webp",
  },
  sousse_stronghold_8p: {
    name: "Sousse Stronghold",
    url: "/icons/maps/sousse_stronghold_8p_mm_handmade.webp",
  },
  faymonville_2p: {
    name: "Faymonville",
    url: "/icons/maps/faymonville_mm_handmade.webp",
  },
  steppe_8p: {
    name: "Steppes",
    url: "/icons/maps/steppe_8p_mm_handmade.webp",
  },
};

export {
  leaderboardsIDAsObject,
  localizedNames,
  localizedGameTypes,
  raceIDs,
  matchTypesAsObject,
  raceIDsAsObject,
  leaderboardsIDsToTypes,
  maps,
};
