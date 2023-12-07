// type description of mapped data

import { resolveLocstring } from "./locstring";
import { isBaseFaction, traverseTree } from "./unitStatsLib";
import config from "../../config";
import { internalSlash } from "../utils";

// need to be extended by all required fields
type EbpsType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british,.
  faction: string; // races\[factionName]
  unitType: string;
  /** A list of unit types. Found at `type_ext`. */
  unitTypes: string[];
  /** Found at `ui_ext`. */
  ui: EntityUiData;
  /** To differentiate from the `cost_ext`, the entity has the popcap stored
   * within the `population_ext` along with the unkeep per pop per minute. */
  populationExt: {
    personnel_pop: number;
    /** Found at `upkeep_per_pop_per_minute_override`. This is a multiplier,
     * which goes with `personnel_pop`. If greater than zero, overrides the
     * army/global tuning tables. */
    upkeep_per_pop: {
      fuel: number;
      manpower: number;
      munition: number;
    };
  };
  moving_ext: {
    acceleration: number;
    deceleration: number;
    speed_scaling_table: {
      default_speed: number;
      max_speed: number;
    };
  };
  sight_ext: {
    sight_package: {
      /**  */
      cone_angle: number;
      /**  */
      outer_radius: number;
    };
  };
  /** Found at `spawner_ext`. Only applies for buildings. This is needed to
   * extract the `item_cost_adjustment` that affects the cost of those entities
   * trained from the building.
   */
  spawner_ext: {
    /** Use the `instance_reference` last part as key (much easier to work with
     * dictionaries for lookups). */
    spawn_items: Record<string, EbpsSpawnItemSchema>;
  };
  /** Found at `cost_ext`. */
  cost: EntityCost;
  /** Found at `health_ext`. */
  health: {
    hitpoints: number;
    /** For infantry -> armor, for vehicles -> front, rear, side. */
    armorLayout: armorLayoutOption;
    /** Found at `health_ext`. */
    targetSize: number;
  };
  /** Found at `upgrade_ext.standard_upgrades`. List of instance references.
   * Applies to buildings only. */
  upgradeRefs: string[];
  /** Found at `combat_ext`. */
  weaponRef: combatExt[];
  // weapon_ext.weapon
  weaponId: string; // Id of weapon template

  // crew size to use the weapon
  /** Found at `recrewable_ext`. */
  crew_size: number;
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

type EbpsSpawnItemSchema = {
  squad: {
    /** The full path of the `instance_reference` field. */
    instance_reference: string;
  };
  item_cost_adjustment: Omit<EntityCost, "time">;
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
    faction: internalSlash(jsonPath).split("/")[1] ?? jsonPath,
    spawner_ext: { spawn_items: {} },
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
      targetSize: 1,
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
    crew_size: 0,
    populationExt: {
      personnel_pop: 0,
      upkeep_per_pop: {
        fuel: 0,
        manpower: 0,
        munition: 0,
      },
    },
    moving_ext: {
      speed_scaling_table: {
        default_speed: 0,
        max_speed: 0,
      },
      acceleration: 0,
      deceleration: 0,
    },
    sight_ext: {
      sight_package: {
        cone_angle: 0,
        outer_radius: 0,
      },
    },
  };

  // clearUndefined(ebpsEntity);
  mapExtensions(subtree, ebpsEntity);

  return ebpsEntity;
};

const mapExtensions = (root: any, ebps: EbpsType) => {
  for (const entityExt in root.extensions) {
    const extension = root.extensions[entityExt].exts;
    const extName = extension?.template_reference.value.split("\\")[1];
    switch (extName) {
      case "recrewable_ext":
        if (extension.race_list.length > 0)
          ebps.crew_size = extension.race_list[0].race_data.info.min_capture_crew_size;
        break;

      case "spawner_ext":
        {
          // Check if `spawn_items` is not empty, otherwise skip.
          if (!extension.spawn_items?.length) break;
          for (const spawnItem of extension.spawn_items) {
            const squadInstRef = spawnItem.spawn_item.squad?.instance_reference;
            if (squadInstRef) {
              const squadId = squadInstRef.split("/").slice(-1)[0];
              ebps.spawner_ext.spawn_items[squadId] ??= {
                squad: {
                  instance_reference: squadInstRef,
                },
                item_cost_adjustment: {
                  fuel: spawnItem.spawn_item.item_cost_adjustment.fuel,
                  manpower: spawnItem.spawn_item.item_cost_adjustment.manpower,
                  munition: spawnItem.spawn_item.item_cost_adjustment.munition,
                  popcap: spawnItem.spawn_item.item_cost_adjustment.popcap,
                },
              };
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
          ebps.ui.screenName = resolveLocstring(screenName) || "";
          const helpText = extension.help_text;
          ebps.ui.helpText = resolveLocstring(helpText) || "";
          const extraText = extension.extra_text;
          ebps.ui.extraText = resolveLocstring(extraText) || "";
          const briefText = extension.brief_text;
          ebps.ui.briefText = resolveLocstring(briefText) || "";
        }
        break;
      case "cost_ext":
        ebps.cost.time = extension.time_cost?.time_seconds || 0;
        ebps.cost.fuel = extension.time_cost?.cost?.fuel || 0;
        ebps.cost.munition = extension.time_cost?.cost?.munition || 0;
        ebps.cost.manpower = extension.time_cost?.cost?.manpower || 0;
        ebps.cost.popcap = extension.time_cost?.cost?.popcap || 0;
        break;
      case "population_ext":
        {
          const upkeepPerPop = extension.upkeep_per_pop_per_minute_override;
          ebps.populationExt.personnel_pop = extension.personnel_pop || 0;
          ebps.populationExt.upkeep_per_pop = {
            manpower: upkeepPerPop?.manpower || 0,
            munition: upkeepPerPop?.munition || 0,
            fuel: upkeepPerPop?.fuel || 0,
          };
        }
        break;
      case "health_ext":
        ebps.health.hitpoints = extension.hitpoints || 0;
        // armor
        if (extension?.armor_layout_option) {
          const refValue = extension.armor_layout_option?.template_reference?.value;
          ebps.health.armorLayout.type = refValue?.split("\\")[4] || "";
          ebps.health.armorLayout.armor = extension.armor_layout_option?.armor || 1; // infantry
          ebps.health.armorLayout.frontArmor = extension.armor_layout_option?.front_armor || 1;
          ebps.health.armorLayout.rearArmor = extension.armor_layout_option?.rear_armor || 1;
          ebps.health.armorLayout.sideArmor = extension.armor_layout_option?.side_armor || 1;
          ebps.health.targetSize = extension.target_size || 1;
        }
        break;
      case "moving_ext":
        {
          const speedScalingTable = extension.speed_scaling_table;
          ebps.moving_ext.speed_scaling_table.default_speed =
            speedScalingTable?.default_speed || 0;
          ebps.moving_ext.speed_scaling_table.max_speed = speedScalingTable?.max_speed || 0;
          ebps.moving_ext.acceleration = extension.acceleration;
          ebps.moving_ext.deceleration = extension.deceleration;
        }
        break;
      case "sight_ext":
        {
          const sightPackage = extension.sight_package;
          ebps.sight_ext.sight_package.cone_angle = sightPackage?.cone_angle || 0;
          ebps.sight_ext.sight_package.outer_radius = sightPackage?.outer_radius || 0;
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

let EbpsPatchData: Record<string, EbpsType[]>;

// calls the mapping for each entity and
// puts the result array into the exported SbpsData variable.
// This variable can be imported everywhere.
// this method is called after loading the JSON at build time.
const getEbpsStats = async (patch = "latest") => {
  if (patch == config.latestPatch) patch = "latest";
  // ebps needs to be returned to avoid double computation
  // if (ebpsStats) return ebpsStats;
  if (EbpsPatchData && EbpsPatchData[patch]) return EbpsPatchData[patch];

  const myReqEbps = await fetch(config.getPatchDataUrl("ebps.json", patch));

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
      // if (item.id === "bunker_command_ger") {
      //   console.group(item.id);
      //   console.log("🚀 ~ file: mappingEbps.ts:161 ~ ebpsSet.forEach ~ unitType:", item);
      //   console.groupEnd();
      // }

      // filter by relevant entity types
      switch (item.unitType) {
        case "emplacements": // Buildable outside base (AA guns, AT guns).
        case "production": // Base buildings.
        case "infantry": // General infantry
        case "defensive":
        // case "flame_throwers":
        case "team_weapons": // Team weapons (squad members).
        case "heavy_artillery":
        case "light_artillery":
        case "heavy_machine_gun": // Crew member of MGs, which is the weapon itself (the main guy firing it).
        case "sub_machine_gun":
        case "light_machine_gun":
        case "rifle":
        case "sidearm":
        case "mortar":
        case "anti_tank_gun":
        case "infantry_anti_tank_weapon":
        case "tank_gun":
        case "flak_gun":
        case "flame_throwers":
        case "vehicles": // General Vehicles
          ebpsSetAll.push(item);
          break;
        default:
          return;
      }
    });
  }

  if (!EbpsPatchData) EbpsPatchData = {};
  EbpsPatchData[patch] = ebpsSetAll;

  // Set singleton
  if (patch == "latest") ebpsStats = ebpsSetAll;

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
  if (!EbpsPatchData) {
    EbpsPatchData = {};
    EbpsPatchData["latest"] = stats;
  }
};

export { ebpsStats, getEbpsStats, setEbpsStats, EbpsPatchData };
export type { EbpsType };
