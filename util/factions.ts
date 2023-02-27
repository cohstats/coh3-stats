export type Factions = "american" | "german" | "dak" | "british";

export const getFactionName = (faction: Factions) => {
  switch (faction) {
    case "american":
      return "US Forces";
    case "german":
      return "Wehrmacht";
    case "dak":
      return "Deutsches Afrikakorps";
    case "british":
      return "British Forces";
  }
};

export type Gamemodes = "1v1" | "2v2" | "3v3" | "4v4";

// USF 1v1 = 2130255
// USF 2v2 = 2130300
// USF 3v3 = 2130329
// USF 4v4 = 2130353
// BRIT 1v1 = 2130257
// BRIT 2v2 = 2130302
// BRIT 3v3 = 2130331
// BRIT 4v4 = 2130355
// DAK 1v1 = 2130259
// DAK 2v2 = 2130304
// DAK 3v3 = 2130333
// DAK 4v4 = 2130357
// WEHR 1v1 = 2130261
// WEHR 2v2 = 2130306
// WEHR 3v3 = 2130335
// WEHR 4v4 = 2130359

export const getLeaderboardID = (faction: Factions, gamemode: Gamemodes) => {
  let id = 2130000;
  switch (gamemode) {
    case "1v1":
      id += 255;
      break;
    case "2v2":
      id += 300;
      break;
    case "3v3":
      id += 329;
      break;
    case "4v4":
      id += 353;
      break;
  }
  switch (faction) {
    case "american":
      id += 0;
      break;
    case "british":
      id += 2;
      break;
    case "dak":
      id += 4;
      break;
    case "german":
      id += 6;
      break;
  }
  return id;
};
