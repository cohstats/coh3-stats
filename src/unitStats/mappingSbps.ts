// type description of mapped data

import { resolveLocstring, resolveTextFormatterLocstring } from "./locstring";
import { isBaseFaction, traverseTree } from "./unitStatsLib";
import config from "../../config";
import { internalSlash } from "../utils";
import { extractRequirements } from "./requirement-utils";
import { getStateTreeSpawnMapping } from "./workarounds";
import { unitToBeIgnored } from "./coh3-unit-configs";

type SpawnWeaponData = {
  pbg: string;
  count: number;
  replacesNormalWeapon: boolean;
};

type VeterancyRankData = {
  exp: number;
  screenName: string;
  requirementIds: string[];
};
// need to be extended by all required fields
type SbpsType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  screenName: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\screen_name
  path: string; // path to object
  faction: string; // from folder structure races\[factionName]
  loadout: LoadoutData[]; // squad_loadout_ext.unit_list
  /** Found at `squad_ui_ext.race_list`. */
  ui: SquadUiData;
  /** Found at `squad_upgrade_ext.upgrades`. List of instance references. */
  upgrades: string[];

  /** Found at `squad_upgrade_apply_ext.upgrades`, plus inferred from spawn state trees. */
  spawnUpgrades: string[];

  /** Found at `squad_action_apply_ext.action_state_trees`. Used for manual spawn-upgrade mapping. */
  spawnUpgradeStateTrees: string[];

  /** Weapons automatically added on spawn, usually from squad_action_apply_ext state trees. */
  spawnWeapons: SpawnWeaponData[];

  unitType: string;
  /** The `squad_population_ext` holds the base popcap and upkeep per pop per
   * minute costs, which will be stacked with the ebps. */
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
  /** Found at `squad_veterancy_ext`. This contains a list of veterancy
   * description / required xp per level. */
  veterancyInfo: {
    one: VeterancyRankData;
    two: VeterancyRankData;
    three: VeterancyRankData;
    four?: VeterancyRankData;
  };
  /** Found at `squad_requirement_ext`. This contains unit training requirements
   * references. */
  requirements: string[];
  /** Found at `squad_ability_ext`. This contains unit abilities references. */
  abilities: string[];
  /** Found at `squad_engineer_ext/construction_groups/construction_items` list.
   * This conatins the ebps reference to the building list this squad can
   * construct. */
  construction: string[];
  /** Found at `squad_reinforce_ext`. This contains reinforcement
   * information
   */
  reinforce: {
    time_percentage: number;
    cost_percentage: number;
  };
  // Capture rates -> squad_strategic_point_ext
  capture_rate: number;
  capture_revert: number;
};

type SquadUiData = {
  /* Icon paths in-game. */
  iconName: string; // Could be empty.
  symbolIconName: string; // Could be empty.
  /* Locstring fields. Found at `sbpextensions\\squad_ui_ext`. */
  helpText: string;
  briefText: string;
  screenName: string;
  extraText: string; // Could be empty (Set as $0).
  /* Armor type icon, found within `sbps` ->
  `sbpextensions\\squad_ui_ext\race_list\race_data\info` ->
  `ui_armor_info\armor_icon`. Applies to only vehicles. */
  armorIcon: string;
};

type LoadoutData = {
  id: string;
  isDefaultUnit: boolean;
  num: number;
  type: string;
};

// exported variable holding mapped data for each
// json file. Will be set via setSbpsStats.
// Can be accessed from everywhere
let sbpsStats: SbpsType[];

// It's in format PATCH : DATA
let sbpsPatchData: Record<string, SbpsType[]>;

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapSbpsData = (
  filename: string,
  subtree: any,
  jsonPath: string,
  parent: string,
  locale: string,
) => {
  const sbpsEntity: SbpsType = {
    // default values
    id: filename,
    screenName: filename,
    path: internalSlash(jsonPath),
    faction: jsonPath.split("/")[1] ?? jsonPath,
    unitType: parent,
    loadout: [],
    ui: {
      iconName: "",
      symbolIconName: "",
      helpText: "",
      briefText: "",
      screenName: "",
      extraText: "",
      armorIcon: "",
    },
    upgrades: [],
    spawnUpgrades: [],
    spawnUpgradeStateTrees: [],
    spawnWeapons: [],
    populationExt: {
      personnel_pop: 0,
      upkeep_per_pop: {
        fuel: 0,
        manpower: 0,
        munition: 0,
      },
    },
    veterancyInfo: {
      one: { exp: 0, screenName: "", requirementIds: [] },
      two: { exp: 0, screenName: "", requirementIds: [] },
      three: { exp: 0, screenName: "", requirementIds: [] },
    },
    reinforce: {
      cost_percentage: 0,
      time_percentage: 0,
    },
    capture_rate: 0,
    capture_revert: 0,
    requirements: [],
    abilities: [],
    construction: [],
  };

  mapExtensions(subtree, sbpsEntity, locale);

  // compute load out

  return sbpsEntity;
};

const addUnique = (array: string[], value?: string) => {
  if (!value) return;
  if (!array.includes(value)) array.push(value);
};

const getVeterancyRequirementIds = (requirements?: any[]) => {
  if (!requirements?.length) return [];

  return requirements
    .flatMap((reqItem) => extractRequirements(reqItem))
    .filter((req) => !BanishedRequirements.some((v) => req.includes(v)))
    .map((req) => req.split("/").slice(-1)[0])
    .filter(Boolean);
};

const mapVeterancyRank = (rankInfo: any, locale: string): VeterancyRankData => {
  const rank = rankInfo?.veterancy_rank;

  return {
    exp: rank?.veterancy_value || 0,
    screenName:
      resolveTextFormatterLocstring(rank?.brief_text_formatter, locale) ||
      resolveLocstring(rank?.brief_text, locale) ||
      "",
    requirementIds: getVeterancyRequirementIds(rank?.requirements),
  };
};

const mapExtensions = (root: any, sbps: SbpsType, locale: string = "en") => {
  for (const squadext in root.extensions) {
    const extension = root.extensions[squadext].squadexts;
    const extName = extension.template_reference.value.split("\\")[1];
    switch (extName) {
      case "squad_loadout_ext":
        for (const unit in extension.unit_list) {
          // The serializer will transform the missing field as "undefined". For
          // better check, let's assign it as `-1`.
          let unitNum: number = extension.unit_list[unit].loadout_data.num || -1;
          // Workaround as long as the JSON is not complete. We will validate by unitType.
          if (unitNum === -1) {
            switch (sbps.unitType) {
              // Vehicles are always 1.
              case "vehicles":
                unitNum = 1;
                break;
              // Team weapons and infantry usually varies. Lets set as 4 by now.
              case "infantry": // General infantry.
              case "team_weapons": // MGs, artillery (the mobile ones).
                unitNum = 4;
              // Other stuff as 5.
              default:
                unitNum = 5;
                break;
            }
          }

          if (extension.unit_list[unit].loadout_data.type) {
            const ldType = extension.unit_list[unit].loadout_data.type.instance_reference;
            const ldPath = ldType.split("/");
            const ebpsId = ldPath[ldPath.length - 1];
            sbps.loadout.push({
              isDefaultUnit: true,
              num: unitNum, //@todo num not always avilable
              type: ldType,
              id: ebpsId,
            });
          } else console.log(sbps.id + ": Loadout not found");
        }
        break;
      case "squad_population_ext":
        {
          const upkeepPerPop = extension.upkeep_per_pop_per_minute_override;
          sbps.populationExt.personnel_pop = extension.personnel_pop || 0;
          sbps.populationExt.upkeep_per_pop = {
            manpower: upkeepPerPop?.manpower || 0,
            munition: upkeepPerPop?.munition || 0,
            fuel: upkeepPerPop?.fuel || 0,
          };
        }
        break;
      case "squad_ui_ext":
        {
          // Check if the `race_list` is not empty, otherwise skip.
          if (!extension.race_list?.length) break;
          // The race_list is always one item.
          const uiExtInfo = extension.race_list[0].race_data.info;
          sbps.ui.iconName = uiExtInfo?.icon_name || "";
          sbps.ui.symbolIconName = uiExtInfo?.symbol_icon_name || "";
          // When it is empty, it has a value of "0".
          const screenName = uiExtInfo?.screen_name;
          sbps.ui.screenName = resolveLocstring(screenName, locale) || "";
          const helpText = uiExtInfo?.help_text;
          sbps.ui.helpText = resolveLocstring(helpText, locale) || "";
          const extraText = uiExtInfo?.extra_text;
          sbps.ui.extraText = resolveLocstring(extraText, locale) || "";
          const briefText = resolveLocstring(uiExtInfo?.brief_text, locale);
          const briefTextFormatter = resolveTextFormatterLocstring(
            uiExtInfo?.brief_text_formatter,
            locale,
          );
          sbps.ui.briefText = briefText || briefTextFormatter || "";
          sbps.ui.armorIcon = uiExtInfo?.ui_armor_info?.armor_icon.split("/").slice(-1)[0] || "";
        }
        break;
      case "squad_upgrade_ext":
        // Check if the `upgrades` is not empty, otherwise skip.
        if (!extension.upgrades?.length) break;
        for (const upg of extension.upgrades) {
          if (upg.upgrade?.instance_reference) {
            sbps.upgrades.push(upg.upgrade.instance_reference);
          }
        }
        break;
      case "squad_veterancy_ext":
        {
          // Check if the `race_list` is not empty, otherwise skip.
          if (!extension.race_list?.length) break;
          // The race_list is always one item.
          const vetExtInfo: any[] =
            extension.race_list[0].race_data.info.veterancy_rank_info || [];
          // Technically the first one is vet 1, second is vet 2 and third is vet 3.

          sbps.veterancyInfo.one = mapVeterancyRank(vetExtInfo[0], locale);
          sbps.veterancyInfo.two = mapVeterancyRank(vetExtInfo[1], locale);
          sbps.veterancyInfo.three = mapVeterancyRank(vetExtInfo[2], locale);

          if (vetExtInfo[3]) {
            sbps.veterancyInfo.four = mapVeterancyRank(vetExtInfo[3], locale);
          }
        }
        break;

      case "squad_upgrade_apply_ext":
        if (!extension.upgrades?.length) break;

        for (const upg of extension.upgrades) {
          const upgradeRef = upg.upgrade?.instance_reference;
          addUnique(sbps.spawnUpgrades, upgradeRef);
        }

        break;

      case "squad_action_apply_ext":
        if (!extension.action_state_trees?.length) break;

        for (const actionStateTree of extension.action_state_trees) {
          const stateTree = actionStateTree.container?.state_tree;
          addUnique(sbps.spawnUpgradeStateTrees, stateTree);

          const mappedSpawn = getStateTreeSpawnMapping(stateTree);

          for (const upgradeRef of mappedSpawn.upgrades ?? []) {
            addUnique(sbps.spawnUpgrades, upgradeRef);
          }

          for (const weaponRef of mappedSpawn.weapons ?? []) {
            if (!weaponRef.pbg) continue;

            sbps.spawnWeapons.push({
              pbg: weaponRef.pbg,
              count: weaponRef.count ?? 1,
              replacesNormalWeapon: weaponRef.replacesNormalWeapon ?? true,
            });
          }
        }

        break;

      case "squad_reinforce_ext":
        {
          sbps.reinforce.cost_percentage = extension.time_cost_percentage?.cost_percentage ?? 0;
          sbps.reinforce.time_percentage = extension.time_cost_percentage?.time_percentage ?? 0;
        }
        break;
      case "squad_capture_strategic_point_ext":
        {
          sbps.capture_rate = extension.capture_rate_multiplier;
          sbps.capture_revert = extension.revert_rate_multiplier;
        }
        break;
      /* @todo Maybe convert this case to recursive function. */
      case "squad_requirement_ext":
        if (!extension.requirement_table?.length) break;
        for (const reqItem of extension.requirement_table) {
          const reqs = extractRequirements(reqItem);
          for (const req of reqs) {
            // Filter out the campaign-only requirements.
            if (!BanishedRequirements.some((v) => req.includes(v))) {
              sbps.requirements.push(req.split("/").slice(-1)[0]);
            }
          }
        }
        break;
      case "squad_ability_ext":
        if (!extension.abilities?.length) break;
        for (const abi of extension.abilities) {
          if (abi.ability.instance_reference) {
            sbps.abilities.push(abi.ability.instance_reference.split("/").slice(-1)[0]);
          }
        }
        break;
      case "squad_engineer_ext":
        if (!extension.construction_groups?.length) break;
        for (const conGroup of extension.construction_groups) {
          if (!conGroup.construction_group.construction_items?.length) break;
          for (const conItem of conGroup.construction_group.construction_items) {
            if (conItem.construction_item.ebp.instance_reference) {
              sbps.construction.push(
                conItem.construction_item.ebp.instance_reference.split("/").slice(-1)[0],
              );
            }
          }
        }
        break;
      default:
        break;
    }
  }
};

const BanishedRequirements = ["mass_production", "campaign"];

// calls the mapping for each entity and
// puts the result array into the exported SbpsData variable.
// This variable can be imported everywhere.
// this method is called after loading the JSON at build time.
const getSbpsStats = async (patch = "latest", locale = "en") => {
  if (patch == config.latestPatch) patch = "latest";

  const cacheKey = `${patch}-${locale}`;
  if (sbpsPatchData && sbpsPatchData[cacheKey]) return sbpsPatchData[cacheKey];

  const myReqSbps = await fetch(config.getPatchDataUrl("sbps.json", patch));
  const root = await myReqSbps.json();

  const sbpsSetAll: SbpsType[] = [];

  // Extract from JSON
  for (const obj in root) {
    // find all extensions
    const sbpsSet = traverseTree(
      root[obj],
      isExtensionContainer,
      (filename: string, subtree: any, jsonPath: string, parent: string) =>
        mapSbpsData(filename, subtree, jsonPath, parent, locale),
      obj,
      obj,
    );

    // Filter relevant objects
    sbpsSet.forEach((item: SbpsType) => {
      // skip non base factions
      if (!isBaseFaction(item.faction)) return;

      // Filter by relevant weapon types
      switch (item.unitType) {
        case "emplacements": // Buildable outside base (AA guns, AT guns).
        case "infantry": // General infantry.
        case "team_weapons": // MGs, artillery (the mobile ones).
        case "vehicles": // General vehicles (tanks, armoured cars).
          // Filter over here, when we get rid of other stuff
          if (unitToBeIgnored(item.id, true)) return;
          sbpsSetAll.push(item);
          break;
        default:
          return;
      }
    });
  }

  // sbpsStats = sbpsSetAll;
  if (!sbpsPatchData) sbpsPatchData = {};
  sbpsPatchData[cacheKey] = sbpsSetAll;

  // Set singleton
  if (patch == "latest") sbpsStats = sbpsSetAll;

  //@todo to be filled
  return sbpsSetAll;
};

const isExtensionContainer = (key: string, obj: any) => {
  // check if first child is "extensions"
  return Object.keys(obj).includes("extensions");
};

//
const setSbpsStats = (stats: SbpsType[]) => {
  sbpsStats = stats;
  if (!sbpsPatchData) {
    sbpsPatchData = {};
    sbpsPatchData["latest"] = stats;
  }
};

export { sbpsStats, setSbpsStats, getSbpsStats, sbpsPatchData };
export type { SbpsType };
