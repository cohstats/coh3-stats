// type description of mapped data

import slash from "slash";
import { resolveLocstring } from "./locstring";
import { isBaseFaction, traverseTree } from "./unitStatsLib";

// need to be extended by all required fields
type EbpsType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british,.
  faction: string; // races\[factionName]
  unitType: string;
  /** A list of unit types. Found at `type_ext`. */
  unitTypes: string[];
  /** A lit of unit spawnable items. Applies only for buildings (?). Found at
   * `spawner_ext`. */
  spawnItems: string[];
  /** Found at `ui_ext`. */
  ui: EntityUiData;
  /** Found at `cost_ext`. */
  cost: EntityCost;
  /** Found at `health_ext`. */
  health: {
    hitpoints: number;
    /** Found at `health_ext`. */
    armorLayout: armorLayoutOption;
  };
  /** Found at `upgrade_ext.standard_upgrades`. List of instance references.
   * Applies to buildings only. */
  upgradeRefs: string[];
  /** Found at `combat_ext`. */
  weaponRef: combatExt[];
  // weapon_ext.weapon
  weaponId: string; // Id of weapon template
};

/** These are found within `time_cost` at `ebpextensions\\cost_ext` */
type EntityCost = {
  fuel: number;
  manpower: number;
  munition: number;
  popcap: number;
  /** Training / research time. Found at `time_seconds` */
  time: number;
};

type EntityUiData = {
  /* Icon paths in-game. */
  iconName: string; // Could be empty.
  symbolIconName: string; // Could be empty.
  /* Locstring fields. Found at `ebpextensions\\ui_ext`. */
  helpText: string;
  briefText: string;
  screenName: string;
  extraText: string; // Could be empty (Set as $0).
};

type armorLayoutOption = {
  type: string;
  armor: number;
  frontArmor: number;
  rearArmor: number;
  sideArmor: number;
};

// Extensions -> combat_ext -> hardpoints -> Weapon
type combatExt = {
  type: string;
  ebp: string;
};

// exported variable holding mapped data for each
// json file. Will be set via setSbpsStats.
// Can be accessed from everywhere
let ebpsStats: EbpsType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapEbpsData = (filename: string, subtree: any, jsonPath: string, parent: string) => {
  const ebpsEntity: EbpsType = {
    id: filename,
    path: jsonPath,
    faction: slash(jsonPath).split("/")[1] ?? jsonPath,
    spawnItems: [],
    unitType: parent,
    unitTypes: [],
    ui: {
      iconName: "",
      symbolIconName: "",
      helpText: "",
      briefText: "",
      screenName: "",
      extraText: "",
    },
    cost: {
      fuel: 0,
      manpower: 0,
      munition: 0,
      popcap: 0,
      time: 0,
    },
    health: {
      hitpoints: 0,
      armorLayout: {
        type: "",
        armor: 1,
        frontArmor: 1,
        rearArmor: 1,
        sideArmor: 1,
      },
    },
    upgradeRefs: [],
    weaponRef: [],
    weaponId: "",
  };

  // clearUndefined(ebpsEntity);
  mapExtensions(subtree, ebpsEntity);

  return ebpsEntity;
};

const mapExtensions = (root: any, ebps: EbpsType) => {
  for (const entityExt in root.extensions) {
    const extension = root.extensions[entityExt].exts;
    const extName = extension.template_reference.value.split("\\")[1];
    switch (extName) {
      case "spawner_ext":
        {
          // Check if `spawn_items` is not empty, otherwise skip.
          if (!extension.spawn_items?.length) break;
          for (const spawnItem of extension.spawn_items) {
            const squadInstRef = spawnItem.spawn_item.squad?.instance_reference;
            if (squadInstRef) {
              ebps.spawnItems.push(squadInstRef);
            }
          }
        }
        break;
      case "type_ext":
        // Check if `unit_type_list` is not empty, otherwise skip.
        if (!extension.unit_type_list?.length) break;
        for (const unitType of extension.unit_type_list) {
          if (unitType.unit_type) {
            ebps.unitTypes.push(unitType.unit_type);
          }
        }
        break;
      case "ui_ext":
        {
          ebps.ui.iconName = extension?.icon_name || "";
          ebps.ui.symbolIconName = extension?.symbol_icon_name || "";
          // When it is empty, it has a value of "0".
          const screenName = extension.screen_name;
          ebps.ui.screenName = resolveLocstring(screenName);
          const helpText = extension.help_text;
          ebps.ui.helpText = resolveLocstring(helpText);
          const extraText = extension.extra_text;
          ebps.ui.extraText = resolveLocstring(extraText);
          const briefText = extension.brief_text;
          ebps.ui.briefText = resolveLocstring(briefText);
        }
        break;
      case "cost_ext":
        ebps.cost.time = extension.time_cost?.time_seconds || 0;
        ebps.cost.fuel = extension.time_cost?.cost?.fuel || 0;
        ebps.cost.munition = extension.time_cost?.cost?.munition || 0;
        ebps.cost.manpower = extension.time_cost?.cost?.manpower || 0;
        ebps.cost.popcap = extension.time_cost?.cost?.popcap || 0;
        break;
      case "health_ext":
        ebps.health.hitpoints = extension.hitpoints || 0;
        // armor
        if (extension?.armor_layout_option) {
          const refValue = extension.armor_layout_option?.template_reference?.value;
          ebps.health.armorLayout.type = refValue.split("\\")[4] || "";
          ebps.health.armorLayout.armor = extension.armor_layout_option?.armor || 1; // infantry
          ebps.health.armorLayout.frontArmor = extension.armor_layout_option?.front_armor || 1;
          ebps.health.armorLayout.rearArmor = extension.armor_layout_option?.rear_armor || 1;
          ebps.health.armorLayout.sideArmor = extension.armor_layout_option?.side_armor || 1;
        }

        break;

      case "combat_ext":
        for (const index in extension.hardpoints) {
          if (extension.hardpoints[index]?.hardpoint?.weapon_table)
            for (const weapon_i in extension.hardpoints[index].hardpoint.weapon_table) {
              const weapon = extension.hardpoints[index].hardpoint.weapon_table[weapon_i];
              const weapon_ref: combatExt = {
                type: weapon.weapon.type || "",
                ebp:
                  weapon.weapon.weapon_entity_attachment?.entity_attach_data.ebp
                    ?.instance_reference || "",
              };
              ebps.weaponRef.push(weapon_ref);
              break; // choose main weapon only
            }
        }
        break;
      case "weapon_ext":
        const weaponPath = extension.weapon.instance_reference.split("/");
        ebps.weaponId = weaponPath[weaponPath.length - 1];
        break;
      case "upgrade_ext":
        // Check if the `standard_upgrades` is not empty, otherwise skip.
        if (!extension.standard_upgrades?.length) break;

        for (const upg of extension.standard_upgrades) {
          if (upg.upgrade?.instance_reference) {
            ebps.upgradeRefs.push(upg.upgrade.instance_reference);
          }
        }
        break;
      default:
        break;
    }
  }
};

// calls the mapping for each entity and
// puts the result array into the exported SbpsData variable.
// This variable can be imported everywhere.
// this method is called after loading the JSON at build time.
const getEbpsStats = async () => {
  // ebps needs to be returned to avoid double computation
  if (ebpsStats) return ebpsStats;

  const myReqEbps = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/ebps.json",
  );

  const root = await myReqEbps.json();

  //@todo initiate mapping to target structure
  const ebpsSetAll: EbpsType[] = [];

  // Extract from JSON
  for (const obj in root) {
    const ebpsSet = traverseTree(root[obj], isExtensionContainer, mapEbpsData, obj, obj);

    // Filter relevant objects
    ebpsSet.forEach((item: EbpsType) => {
      //  only entities with faction should be relevant
      if (!isBaseFaction(item.faction)) return;

      /** Uncomment if you want to check for each entity type. */
      // console.group(item.id);
      // console.log("🚀 ~ file: mappingEbps.ts:161 ~ ebpsSet.forEach ~ unitType:", item.unitType);
      // console.groupEnd();

      // filter by relevant entity types
      switch (item.unitType) {
        case "production": // Base buildings.
        case "infantry": // General infantry
        // case "flame_throwers":
        case "team_weapons": // Team weapons (squad members).
        case "heavy_machine_gun": // Crew member of MGs, which is the weapon itself (the main guy firing it).
        case "sub_machine_gun":
        case "light_machine_gun":
        case "rifle":
        case "sidearm":

        case "vehicles": // General Vehicles
          ebpsSetAll.push(item);
          break;
        default:
          return;
      }
    });
  }

  return ebpsSetAll;
};

const isExtensionContainer = (key: string, obj: any) => {
  // check if first child is "extensions"
  return Object.keys(obj).includes("extensions");
};

//
const setEbpsStats = (stats: EbpsType[]) => {
  //@todo to be filled
  ebpsStats = stats;
};

export { ebpsStats, getEbpsStats, setEbpsStats };
export type { EbpsType };
