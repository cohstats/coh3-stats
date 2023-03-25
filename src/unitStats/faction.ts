import { raceType } from "../coh3/coh3-types";
import { AbilitiesType } from "./mappingAbilities";
import { EbpsType } from "./mappingEbps";
import { SbpsType } from "./mappingSbps";
import { UpgradesType } from "./mappingUpgrades";
import { WeaponType } from "./mappingWeapon";
import { getSquadTotalCost, ResourceValues } from "./squadTotalCost";

export function getResolvedAbilities(refs: string[], abilities: AbilitiesType[]) {
  // The key is the ability id.
  const foundAbilities: Record<string, AbilitiesType> = {};
  for (const refId of refs) {
    const foundAbility = abilities.find((x) => x.id === refId);
    if (!foundAbility) continue;

    foundAbilities[refId] ??= foundAbility;
  }
  return foundAbilities;
}

export function getResolvedUpgrades(refs: string[], upgradesData: UpgradesType[]) {
  // The key is the upgrade id.
  const researchableUpgrades: Record<string, UpgradesType> = {};
  for (const refPath of refs) {
    // Get the last element of the array, which is the id.
    const upgradeId = refPath.split("/").slice(-1)[0];
    const upgradeFound = upgradesData.find((x) => x.id === upgradeId);
    // Ignore those upgrades not found.
    if (!upgradeFound) continue;

    researchableUpgrades[upgradeId] ??= upgradeFound;
  }
  return researchableUpgrades;
}

export function getResolvedWeapons(refs: string[], weaponsData: WeaponType[]) {
  // The key is the weapon id.
  const loadoutWeapons: Record<string, WeaponType> = {};
  for (const refPath of refs) {
    // Get the last element of the array, which is the id.
    const weaponId = refPath.split("/").slice(-1)[0];
    const weaponFound = weaponsData.find((x) => x.id === weaponId);
    // Ignore those upgrades not found.
    if (!weaponFound) continue;

    loadoutWeapons[weaponId] ??= weaponFound;
  }
  return loadoutWeapons;
}

export function getResolvedSquads(refs: string[], sbpsData: SbpsType[], ebpsData: EbpsType[]) {
  // The key is the squad id.
  const squadEntities: Record<string, SbpsType & { time_cost: ResourceValues }> = {};
  for (const refPath of refs) {
    // Get the last element of the array, which is the id.
    const sbpsId = refPath.split("/").slice(-1)[0];
    const sbpsUnitFound = sbpsData.find((x) => x.id === sbpsId);
    // Ignore those squad entities not found.
    if (!sbpsUnitFound) continue;
    // Map the required fields.
    const totalCost = getSquadTotalCost(sbpsUnitFound, ebpsData);

    squadEntities[sbpsId] ??= { ...sbpsUnitFound, time_cost: totalCost };
  }
  return squadEntities;
}

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

export const RaceBagDescription = {
  // Locstring value: $11234530
  german:
    "A steadfast and elite force that can hold against even the most stubborn foe. Unlock unique arsenals to specialize your forces.",
  // Locstring value: $11234529
  american:
    "Versatile infantry and weaponry that can displace any opponent. Experience is key to improving your forces for the fight ahead.",
  // Locstring value: $11220490
  dak: "A combined-arms force of aggressive vehicles, plentiful reinforcements and stubborn tanks that can break down any enemy line.",
  // Locstring value: $11234532
  british:
    "Infantry and team weapons form a backbone that is tough to break. Myriad vehicles will create the opening you need to seize the day.",
} as const;

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
export const HalfTrackDeploymentUnitsAfrikaKorps = {
  halftrack_deployment_panzerjager_inf_1_ak: ["halftrack_250_ak", "panzerjaeger_inf_ak"],
  halftrack_deployment_assault_grenadier_1_ak: ["halftrack_250_ak", "assault_panzergrenadier_ak"],
  halftrack_deployment_at_gun_1_ak: ["halftrack_250_ak", "at_gun_50mm_pak_38_ak"],
  halftrack_deployment_leig_1_ak: ["halftrack_250_ak", "leig_75mm_ak"],
  halftrack_deployment_piv_tank_hunter_group_ak: ["panzer_iv_ak", "panzerjaeger_inf_ak"],
  halftrack_deployment_stug_assault_group_ak: ["stug_iii_ak"],
  halftrack_deployment_panzer_iii_assault_group_ak: [
    "panzer_iii_ak",
    "assault_panzergrenadier_ak",
  ],
  halftrack_deployment_tiger_ak: ["tiger_ak"],
} as const;

function generateAfrikaKorpsCallInsBuilding(): EbpsType {
  return {
    id: "halftrack_deployment_ak",
    path: "afrika_corps",
    faction: "afrika_corps",
    unitType: "production",
    unitTypes: ["halftrack_deployment"],
    spawnItems: [],
    crew_size: 0, // Chrida: crewsize added / was missing.
    cost: {
      fuel: 0,
      manpower: 0,
      popcap: 0,
      munition: 0,
      time: 0,
    },
    populationExt: {
      personnel_pop: 0,
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
      targetSize: 0,
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
