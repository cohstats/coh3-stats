const matchTypes = [
  {
    id: 0,
    name: "Custom",
  },
  {
    id: 1,
    name: "1V1_Ranked",

    localizedName: "1 VS 1",
  },
  {
    id: 2,
    name: "2V2_Ranked",

    localizedName: "2 VS 2",
  },
  {
    id: 3,
    name: "3V3_Ranked",
  },
  {
    id: 4,
    name: "4V4_Ranked",
  },
  {
    id: 5,
    name: "2V2_Ai_Easy",
  },
  {
    id: 6,
    name: "2V2_Ai_Medium",
  },
  {
    id: 7,
    name: "2V2_Ai_Hard",
  },
  {
    id: 8,
    name: "2V2_Ai_Expert",
  },
  {
    id: 9,
    name: "3V3_Ai_Easy",
  },
  {
    id: 10,
    name: "3V3_Ai_Medium",
  },
  {
    id: 11,
    name: "3V3_Ai_Hard",
  },
  {
    id: 12,
    name: "3V3_Ai_Expert",
  },
  {
    id: 13,
    name: "4V4_Ai_Easy",
  },
  {
    id: 14,
    name: "4V4_Ai_Medium",
  },
  {
    id: 15,
    name: "4V4_Ai_Hard",
  },
  {
    id: 16,
    name: "4V4_Ai_Expert",
  },
  {
    id: 20,
    name: "1V1_Unranked",

    localizedName: "1 VS 1",
  },
  {
    id: 21,
    name: "2V2_Unranked",

    localizedName: "2 VS 2",
  },
  {
    id: 22,
    name: "3V3_Unranked",
  },
  {
    id: 23,
    name: "4V4_Unranked",
  },
];

const races = [
  {
    id: 129494,
    name: "Americans",
    faction_id: 2,
    localizedName: "US Forces",
  },
  {
    id: 137123,
    name: "Germans",
    faction_id: 1,
    localizedName: "Wehrmacht",
  },
  {
    id: 181726,
    name: "Americans_Campaign",
    faction_id: 0,
  },
  {
    id: 196502,
    name: "Germans_Campaign",
    faction_id: 0,
  },
  {
    id: 197345,
    name: "British",
    faction_id: 2,

    localizedName: "British Forces",
  },
  {
    id: 198437,
    name: "Afrika_Korps",
    faction_id: 1,

    localizedName: "Afrikakorps",
  },
  {
    id: 203852,
    name: "British_Africa",
    faction_id: 2,

    localizedName: "British Forces",
  },
  {
    id: 211661,
    name: "British_Campaign",
    faction_id: 0,
  },
  {
    id: 2057043,
    name: "Afrika_Korps_Campaign",
    faction_id: 0,
  },
  {
    id: 2064141,
    name: "Partisan",
    faction_id: 2,
  },
];

const leaderboards = [
  {
    id: 2130255,
    name: "1v1American",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 1,
        statgroup_type: 1,
        race_id: 129494,
      },
      {
        matchtype_id: 20,
        statgroup_type: 1,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130256,
    name: "1v1AmericanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130257,
    name: "1v1British",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 20,
        statgroup_type: 1,
        race_id: 203852,
      },
      {
        matchtype_id: 1,
        statgroup_type: 1,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130258,
    name: "1v1BritishUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130259,
    name: "1v1DAK",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 1,
        statgroup_type: 1,
        race_id: 198437,
      },
      {
        matchtype_id: 20,
        statgroup_type: 1,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130260,
    name: "1v1DAKUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130261,
    name: "1v1German",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 1,
        statgroup_type: 1,
        race_id: 137123,
      },
      {
        matchtype_id: 20,
        statgroup_type: 1,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130262,
    name: "1v1GermanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130283,
    name: "2v2AIEasyAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 5,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130284,
    name: "2v2AIEasyBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 5,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130285,
    name: "2v2AIEasyDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 5,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130286,
    name: "2v2AIEasyGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 5,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130287,
    name: "2v2AIExpertAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 8,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130288,
    name: "2v2AIExpertBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 8,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130289,
    name: "2v2AIExpertDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 8,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130290,
    name: "2v2AIExpertGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 8,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130291,
    name: "2v2AIHardAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 7,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130293,
    name: "2v2AIHardBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 7,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130294,
    name: "2v2AIHardDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 7,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130295,
    name: "2v2AIHardGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 7,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130296,
    name: "2v2AIMediumAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 6,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130297,
    name: "2v2AIMediumBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 6,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130298,
    name: "2v2AIMediumDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 6,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130299,
    name: "2v2AIMediumGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 6,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130300,
    name: "2v2American",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 2,
        statgroup_type: 1,
        race_id: 129494,
      },
      {
        matchtype_id: 21,
        statgroup_type: 1,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130301,
    name: "2v2AmericanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130302,
    name: "2v2British",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 2,
        statgroup_type: 1,
        race_id: 203852,
      },
      {
        matchtype_id: 21,
        statgroup_type: 1,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130303,
    name: "2v2BritishUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130304,
    name: "2v2DAK",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 2,
        statgroup_type: 1,
        race_id: 198437,
      },
      {
        matchtype_id: 21,
        statgroup_type: 1,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130305,
    name: "2v2DAKUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130306,
    name: "2v2German",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 2,
        statgroup_type: 1,
        race_id: 137123,
      },
      {
        matchtype_id: 21,
        statgroup_type: 1,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130307,
    name: "2v2GermanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130308,
    name: "3v3AIEasyAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 9,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130309,
    name: "3v3AIEasyBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 9,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130310,
    name: "3v3AIEasyDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 9,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130311,
    name: "3v3AIEasyGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 9,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130313,
    name: "3v3AIExpertAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 12,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130317,
    name: "3v3AIExpertBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 12,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130318,
    name: "3v3AIExpertDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 12,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130319,
    name: "3v3AIExpertGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 12,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130320,
    name: "3v3AIHardAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 11,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130321,
    name: "3v3AIHardBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 11,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130322,
    name: "3v3AIHardDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 11,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130323,
    name: "3v3AIHardGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 11,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130325,
    name: "3v3AIMediumAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 10,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130326,
    name: "3v3AIMediumBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 10,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130327,
    name: "3v3AIMediumDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 10,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130328,
    name: "3v3AIMediumGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 10,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130329,
    name: "3v3American",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 22,
        statgroup_type: 1,
        race_id: 129494,
      },
      {
        matchtype_id: 3,
        statgroup_type: 1,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130330,
    name: "3v3AmericanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130331,
    name: "3v3British",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 22,
        statgroup_type: 1,
        race_id: 203852,
      },
      {
        matchtype_id: 3,
        statgroup_type: 1,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130332,
    name: "3v3BritishUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130333,
    name: "3v3DAK",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 22,
        statgroup_type: 1,
        race_id: 198437,
      },
      {
        matchtype_id: 3,
        statgroup_type: 1,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130334,
    name: "3v3DAKUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130335,
    name: "3v3German",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 22,
        statgroup_type: 1,
        race_id: 137123,
      },
      {
        matchtype_id: 3,
        statgroup_type: 1,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130336,
    name: "3v3GermanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130337,
    name: "4v4AIEasyAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 13,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130338,
    name: "4v4AIEasyBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 13,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130339,
    name: "4v4AIEasyAxis",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 13,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130340,
    name: "4v4AIEasyGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 13,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130341,
    name: "4v4AIExpertAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 16,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130342,
    name: "4v4AIExpertBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 16,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130343,
    name: "4v4AIExpertDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 16,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130344,
    name: "4v4AIExpertGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 16,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130345,
    name: "4v4AIHardAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 15,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130346,
    name: "4v4AIHardBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 15,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130347,
    name: "4v4AIHardDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 15,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130348,
    name: "4v4AIHardGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 15,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130349,
    name: "4v4AIMediumAmerican",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 14,
        statgroup_type: 0,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130350,
    name: "4v4AIMediumBritish",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 14,
        statgroup_type: 0,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130351,
    name: "4v4AIMediumDAK",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 14,
        statgroup_type: 0,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130352,
    name: "4v4AIMediumGerman",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 14,
        statgroup_type: 0,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130353,
    name: "4v4American",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 4,
        statgroup_type: 1,
        race_id: 129494,
      },
      {
        matchtype_id: 23,
        statgroup_type: 1,
        race_id: 129494,
      },
    ],
  },
  {
    id: 2130354,
    name: "4v4AmericanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130356,
    name: "4v4British",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 23,
        statgroup_type: 1,
        race_id: 203852,
      },
      {
        matchtype_id: 4,
        statgroup_type: 1,
        race_id: 203852,
      },
    ],
  },
  {
    id: 2130357,
    name: "4v4BritishUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130358,
    name: "4v4DAK",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 4,
        statgroup_type: 1,
        race_id: 198437,
      },
      {
        matchtype_id: 23,
        statgroup_type: 1,
        race_id: 198437,
      },
    ],
  },
  {
    id: 2130359,
    name: "4v4DAKUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130360,
    name: "4v4German",
    isranked: 1,
    leaderboardmap: [
      {
        matchtype_id: 4,
        statgroup_type: 1,
        race_id: 137123,
      },
      {
        matchtype_id: 23,
        statgroup_type: 1,
        race_id: 137123,
      },
    ],
  },
  {
    id: 2130361,
    name: "4v4GermanUnranked",
    isranked: 0,
    leaderboardmap: [],
  },
  {
    id: 2130362,
    name: "Custom",
    isranked: 0,
    leaderboardmap: [
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 137123,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 2064141,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 196502,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 211661,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 197345,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 181726,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 2057043,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 129494,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 203852,
      },
      {
        matchtype_id: 0,
        statgroup_type: 1,
        race_id: 198437,
      },
    ],
  },
];

const factions = {
  0: {
    id: 0,
    name: "none",
  },
  1: {
    id: 1,
    name: "axis",
  },
  2: {
    id: 2,
    name: "allies",
  },
};

export { factions, races, matchTypes, leaderboards };
