// type description of mapped data

import config from "../../config";
import { internalSlash } from "../utils";
import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";

// Need to be extended by all required fields
type AbilitiesType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british.
  faction: string; // races/[factionName]
  abilityType: string;
  /** Found at `ui_info`. */
  ui: AbilitiesUiData;
  /** Recharge time when casted the ability. */
  rechargeTime: number;
  /** Found at `cost_to_player`. */
  cost: AbilitiesCost;
  /**
   * The ability is actually linked to the upgrade via
   * `requirements/required_player_upgrade/upgrade_name` path.
   */
  requirements: {
    /** If the template reference is `requirements\\required_player_upgrade`,
     * populate it with `upgrade_name` -> `instance_reference`. */
    playerUpgrade: "";
  };
};

/**
 * These are found within `ui_info`.
 * @TODO We could re-use this type with the ebps and sbps mapping functions as well.
 */
type AbilitiesUiData = {
  /* Icon paths in-game. */
  iconName: string; // Could be empty.
  symbolIconName: string; // Could be empty.
  /* Locstring fields. */
  helpText: string | null;
  briefText: string | null;
  screenName: string | null;
  extraText: string | null; // Could be empty (Set as $0).
};

/**
 * These are found within `cost_to_player`.
 * @TODO We could re-use this type with the ebps and sbps mapping functions as well.
 */
type AbilitiesCost = {
  fuel: number;
  manpower: number;
  munition: number;
  popcap: number;
};

// Exported variable holding mapped data for each json file. Will be set via
// `setAbilitiesStats`. Can be accessed from everywhere.
let abilitiesStats: AbilitiesType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapAbilitiesData = (filename: string, subtree: any, jsonPath: string, parent: string) => {
  const abilityEntity: AbilitiesType = {
    id: filename,
    path: jsonPath,
    faction: internalSlash(jsonPath).split("/")[1] ?? jsonPath,
    abilityType: parent,
    ui: {
      iconName: "",
      symbolIconName: "",
      helpText: "",
      briefText: "",
      screenName: "",
      extraText: "",
    },
    rechargeTime: 0,
    cost: {
      fuel: 0,
      manpower: 0,
      munition: 0,
      popcap: 0,
    },
    requirements: {
      playerUpgrade: "",
    },
  };

  mapAbilityBag(subtree, abilityEntity);

  return abilityEntity;
};

const mapAbilityBag = (root: any, ability: AbilitiesType) => {
  const abilityBag = root.ability_bag;

  /* --------- UI SECTION --------- */
  ability.ui.iconName = abilityBag.ui_info?.icon_name || "";
  ability.ui.symbolIconName = abilityBag.ui_info?.symbol_icon_name || "";
  // When it is empty, it has a value of "0".
  ability.ui.screenName = resolveLocstring(abilityBag.ui_info?.screen_name);
  ability.ui.helpText = resolveLocstring(abilityBag.ui_info?.help_text);
  ability.ui.extraText = resolveLocstring(abilityBag.ui_info?.extra_text);
  ability.ui.briefText = resolveLocstring(abilityBag.ui_info?.brief_text);

  /* --------- COST SECTION --------- */
  ability.cost.fuel = abilityBag.cost_to_player?.fuel || 0;
  ability.cost.munition = abilityBag.cost_to_player?.munition || 0;
  ability.cost.manpower = abilityBag.cost_to_player?.manpower || 0;
  ability.cost.popcap = abilityBag.cost_to_player?.popcap || 0;
  ability.rechargeTime = abilityBag.recharge_time || 0;

  /* --------- REQUIREMENTS SECTION --------- */
  if (Array.isArray(abilityBag.requirements)) {
    // Find the required player upgrade, which points to the upgrade reference.
    const reqPlayerUpgrade = abilityBag.requirements.find(
      (req: any) =>
        req.required.template_reference.value.split("\\").slice(-1)[0] ===
        "required_player_upgrade",
    );
    if (reqPlayerUpgrade) {
      ability.requirements.playerUpgrade =
        reqPlayerUpgrade.required.upgrade_name?.instance_reference || "";
    }
  }
};

// Calls the mapping for each entity and puts the result array into the exported
// SbpsData variable. This variable can be imported everywhere. this method is
// called after loading the JSON at build time.
const getAbilitiesStats = async () => {
  if (abilitiesStats) return abilitiesStats;

  const myReqAbilities = await fetch(config.getPatchDataUrl("abilities.json"));

  const root = await myReqAbilities.json();

  const abilitiesSetAll: AbilitiesType[] = [];

  // Extract from JSON
  for (const obj in root) {
    const abilitiesSet = traverseTree(
      root[obj],
      isAbilityBagContainer,
      mapAbilitiesData,
      obj,
      obj,
    );

    // Filter relevant objects
    abilitiesSet.forEach((item: AbilitiesType) => {
      abilitiesSetAll.push(item);
    });
  }

  setAbilitiesStats(abilitiesSetAll);

  return abilitiesSetAll;
};

const isAbilityBagContainer = (key: string, obj: any) => {
  // check if first child is `ability_bag`.
  return Object.keys(obj).includes("ability_bag");
};

//
const setAbilitiesStats = (stats: AbilitiesType[]) => {
  abilitiesStats = stats;
};

export { abilitiesStats, setAbilitiesStats, getAbilitiesStats };
export type { AbilitiesType };
