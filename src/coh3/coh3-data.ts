import { leaderBoardType, raceID, raceType } from "./coh3-types";

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

export {
  leaderboardsIDAsObject,
  localizedNames,
  localizedGameTypes,
  raceIDs,
  matchTypesAsObject,
  raceIDsAsObject,
};
