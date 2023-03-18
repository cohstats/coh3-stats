import { raceType } from "../coh3/coh3-types";
import { EbpsType } from "./mappingEbps";

/** The british is different for multiplayer within the ebps and sbps. */
const buildingFactionMultiplayer = [
  "german",
  "american",
  "british_africa",
  "afrika_korps",
] as const;

type buildingFactionMultiplayer = (typeof buildingFactionMultiplayer)[number];

function transformToMultiplayerBuildingFaction(race: raceType): buildingFactionMultiplayer {
  switch (race) {
    case "british":
      return "british_africa";
    case "dak":
      return "afrika_korps";
    default:
      return race;
  }
}

/** Filter invisible or unused buildings in multiplayer. */
export function filterMultiplayerBuildings(buildings: EbpsType[], race: raceType) {
  const faction = transformToMultiplayerBuildingFaction(race);
  // Filter by faction (dak, german, uk, us), unit type (production buildings).
  const filteredByRace = buildings.filter(
    (entity) => entity.faction === faction && entity.unitType === "production",
  );
  // console.log(
  //   "🚀 ~ file: faction.ts:27 ~ filterMultiplayerBuildings ~ filteredByRace:",
  //   filteredByRace,
  // );
  const filteredByMultiplayer = filteredByRace.filter((building) => {
    switch (faction) {
      // For DAK, buildings `halftrack_deployment_ak` and
      // `heavy_weapon_kompanie_ak`. The `halftrack_deployment_ak` will be
      // populated manually as the unit call-ins are hardcoded.
      case "afrika_korps":
        return !["halftrack_deployment_ak", "heavy_weapon_kompanie_ak"].includes(building.id);
      // For American, the safe house of partisans (maybe campaign only).
      case "american":
        return !["safe_house_partisan"].includes(building.id);
      default:
        return true;
    }
  });
  // Only for DAK, we add the Call-Ins as "Halftrack Deployment" building.
  if (faction === "afrika_korps") {
    filteredByMultiplayer.unshift(generateAfrikaKorpsCallInsBuilding());
  }
  // Sort like in-game menu (no idea how to simplify it).
  const sortedBuildings = [
    ...filteredByMultiplayer.filter((x) => x.unitTypes.includes("halftrack_deployment")),
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

/**
 * As the DAK Call-in is hardcoded (probably unit references behind state_trees
 * which we don't have access at the moment), we will map the costs from the
 * `abilities.json` file with the following keys:
 *
 * So first one is Halftrack deployment:
 *
 * - `halftrack_deployment_panzerjager_inf_1_ak`
 * - `halftrack_deployment_assault_grenadier_1_ak`
 * - `halftrack_deployment_at_gun_1_ak`
 * - `halftrack_deployment_leig_1_ak`
 *
 * The second one (Armored Reserves Deployment):
 * - `halftrack_deployment_piv_tank_hunter_group_ak`
 * - `halftrack_deployment_stug_assault_group_ak`
 * - `halftrack_deployment_panzer_iii_assault_group_ak`
 * - `halftrack_deployment_tiger_ak`
 *
 * NOTE: All these are inside the `abilities.json` with the following path:
 * `races/afrika_korps/halftrack_deployment/halftrack_1`.
 *
 * The keys of this object are the abilities ids whereas the values are the
 * squads that conforms those call-ins.
 */
const HalfTrackDeploymentUnitsAfrikaKorps = {
  halftrack_deployment_panzerjager_inf_1_ak: [""],
  halftrack_deployment_assault_grenadier_1_ak: [""],
  halftrack_deployment_at_gun_1_ak: [""],
  halftrack_deployment_leig_1_ak: [""],
  halftrack_deployment_piv_tank_hunter_group_ak: [""],
  halftrack_deployment_stug_assault_group_ak: [""],
  halftrack_deployment_panzer_iii_assault_group_ak: [""],
  halftrack_deployment_tiger_ak: [""],
} as const;

function generateAfrikaKorpsCallInsBuilding(): EbpsType {
  return {
    id: "halftrack_deployment_ak",
    path: "afrika_corps",
    faction: "afrika_corps",
    unitType: "production",
    unitTypes: ["halftrack_deployment"],
    spawnItems: [],
    cost: {
      fuel: 0,
      manpower: 0,
      popcap: 0,
      munition: 0,
      time: 0,
    },
    ui: {
      iconName: "races/afrika_corps/vehicles/halftrack_logistics_ak",
      symbolIconName: "races/common/symbols/building_support_center",
      helpText: "Unique DAK ability.",
      briefText: "Provides squad call-ins off the map.",
      screenName: "Half Track / Armored Reserves Deployment Systems",
      extraText: "Call-Ins",
    },
    health: {
      hitpoints: 1500,
      armorLayout: {
        frontArmor: 1,
        sideArmor: 1,
        rearArmor: 1,
        armor: 35,
        type: "armor_layout_uniform",
      },
    },
    upgradeRefs: [],
    weaponRef: [],
    weaponId: "",
  };
}
