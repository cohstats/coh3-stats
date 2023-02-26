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
