import { raceAttributesMultiplayer, raceType } from "../coh3/coh3-types";
import { EbpsType } from "./mappingEbps";

export function transformToMultiplayerFaction(race: raceType): raceAttributesMultiplayer {
  switch (race) {
    case "british":
      return "british_africa";
    case "dak":
      return "afrika_korps";
    default:
      return race;
  }
}

/** Similar to Chrida `isBaseFaction` function but exported in a separate file
 * and takes into account the multiplayer faction names. */
export function isMultiplayerFaction(faction: string) {
  return raceAttributesMultiplayer.includes(faction as raceAttributesMultiplayer);
}

/** Filter invisible or unused buildings in multiplayer. */
export function filterMultiplayerBuildings(
  buildings: EbpsType[],
  race: raceAttributesMultiplayer,
) {
  // Filter by faction (dak, german, uk, us), unit type (production buildings).
  const filteredByRace = buildings.filter(
    (entity) => entity.faction === race && entity.unitType === "production",
  );
  console.log(
    "🚀 ~ file: faction.ts:27 ~ filterMultiplayerBuildings ~ filteredByRace:",
    filteredByRace,
  );
  const filteredByMultiplayer = filteredByRace.filter((building) => {
    switch (race) {
      // For DAK, buildings `halftrack_deployment_ak` and `heavy_weapon_kompanie_ak`.
      case "afrika_korps":
        return !["halftrack_deployment_ak", "heavy_weapon_kompanie_ak"].includes(building.id);
      // For American, the safe house of partisans (maybe campaign only).
      case "american":
        return !["safe_house_partisan"].includes(building.id);
      default:
        return true;
    }
  });
  // Sort like in-game menu (no idea how to simplify it).
  const sortedBuildings = [
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("armory")),
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("support_center")),
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("hq")),
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("production1")),
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("production2")),
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("production3")),
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("production4")),
  ];
  return sortedBuildings;
}
