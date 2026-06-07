// type description of mapped data

import config from "../../config";
import { internalSlash } from "../utils";
import { resolveLocstring, resolveTextFormatterLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";
import { getAbilityStateTreeWeaponMappings } from "./workarounds";
import { extractDisplayRequirements } from "./requirement-utils";
import type { DisplayRequirement } from "./requirement-utils";

/** Child requirements in case of parent requirement being
 * "required_all_in_list". */
interface AbilityRequirementChildItem {
  requirement: {
    template_reference: {
      name: string;
      value: string;
    };
    upgrade_name: {
      instance_reference: string;
    };
  };
}

/** Parent requirements that can be a single "required_player_upgrade" or
 * "required_all_in_list". */
interface AbilityRequirementItem {
  required: {
    template_reference: {
      name: string;
      value: string;
    };
    reason: string;
    requirements?: AbilityRequirementChildItem[];
    upgrade_name?: {
      instance_reference: string;
    };
  };
}

interface AbilityCustomPbgidPropertyItem {
  custom_pbgid_property?: {
    id?: string;
    pbg?: {
      instance_reference?: string;
    };
  };
}

interface AbilityCustomInt32PropertyItem {
  custom_int32_property?: {
    id?: string;
    value?: number;
  };
}

const ABILITY_WEAPON_PBG_PROPERTY_IDS = new Set(["WEAPON_PBG_1", "WEAPON_PBG_2", "WEAPON_PBG_3"]);

const getIdFromInstanceReference = (instanceReference: string) =>
  internalSlash(instanceReference).split("/").filter(Boolean).slice(-1)[0] || "";

const addUnique = (array: string[], value?: string) => {
  if (!value) return;
  if (!array.includes(value)) array.push(value);
};

const getValueAtPath = (source: unknown, path: readonly (string | number)[]): unknown => {
  return path.reduce<unknown>((currentValue, pathPart) => {
    if (currentValue === null || currentValue === undefined) return undefined;

    return (currentValue as Record<string | number, unknown>)[pathPart];
  }, source);
};

const getStateTreeAtPath = (source: unknown, path: readonly (string | number)[]) => {
  const value = getValueAtPath(source, path);

  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const instanceReference = (value as { instance_reference?: unknown }).instance_reference;

    if (typeof instanceReference === "string") return instanceReference;
  }

  return "";
};

const applyAbilityStateTreeWeaponMappings = (ability: AbilitiesType, root: unknown) => {
  for (const mapping of getAbilityStateTreeWeaponMappings(ability.id)) {
    const stateTree = getStateTreeAtPath(root, mapping.stateTreePath);

    // Strict match by exact path + exact value.
    // If Relic moves or renames the state tree, this intentionally does nothing.
    if (stateTree !== mapping.stateTree) continue;

    for (const weaponReference of mapping.weaponIds ?? []) {
      addUnique(ability.abilityWeaponIds, getIdFromInstanceReference(weaponReference));
    }

    if (
      mapping.numShots !== undefined &&
      (ability.numShots === null || mapping.overrideNumShots)
    ) {
      ability.numShots = mapping.numShots;
    }
  }
};

// Need to be extended by all required fields
type AbilitiesType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british.
  faction: string; // races/[factionName]
  abilityType: string;
  /** Found at `ui_info`. */
  ui: AbilitiesUiData;
  /** Ability activation type, e.g. targeted, timed, toggle. */
  activation: string;
  /** Recharge time when casted the ability. */
  rechargeTime: number;
  /** Duration from channeling.channeling_time_second. Null when not present. */
  duration: number | null;
  /** Toggle recharge when switching on. Null when missing or zero. */
  toggledRechargeTimeOn: number | null;
  /** Toggle recharge when switching off. Null when missing or zero. */
  toggledRechargeTimeOff: number | null;
  /** Ability cast range. Null when missing or zero. */
  range: number | null;
  /** Ability cast min range. Null when missing or zero. */
  minRange: number | null;
  /** Weapon-related PBG IDs referenced by custom_pbgid_properties WEAPON_PBG_1..3.
   * Usually weapon EBPS IDs, but some abilities point directly to weapon stat IDs.
   */
  abilityWeaponIds: string[];
  /** Found in custom_int32_properties/NUM_SHOTS. Null when not present. */
  numShots: number | null;
  /** Found at `cost_to_player`. */
  cost: AbilitiesCost;
  /**
   * The ability is actually linked to the upgrade via
   * `requirements/required_player_upgrade/upgrade_name` path.
   */
  requirements: {
    /** If the template reference is `requirements\\required_player_upgrade`,
     * populate it with `upgrade_name` -> `instance_reference`. */
    playerUpgrade: string;
  };
  /** Small player-facing requirement list for UI display. */
  displayRequirements: DisplayRequirement[];
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
  helpText: string;
  briefText: string;
  screenName: string;
  extraText: string; // Could be empty (Set as $0).
  briefTextFormatter: string;
  extraTextFormatter: string;
  // extraTextFormatter?: {
  //   formatter: string; // The default string which contains the formatted variables.
  //   args: number[]; // Formatter arguments (ordered list). Kept for reference.
  // }
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

// Add a cache object at the top of the file, after abilitiesStats declaration
let abilitiesPatchData: Record<string, AbilitiesType[]> = {};

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapAbilitiesData = (
  filename: string,
  subtree: any,
  jsonPath: string,
  parent: string,
  locale: string = "en",
) => {
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
      briefTextFormatter: "",
      extraTextFormatter: "",
    },
    activation: "",
    rechargeTime: 0,
    duration: null,
    toggledRechargeTimeOn: null,
    toggledRechargeTimeOff: null,
    range: null,
    minRange: null,
    abilityWeaponIds: [],
    numShots: null,
    cost: {
      fuel: 0,
      manpower: 0,
      munition: 0,
      popcap: 0,
    },
    requirements: {
      playerUpgrade: "",
    },
    displayRequirements: [],
  };

  mapAbilityBag(subtree, abilityEntity, locale);

  return abilityEntity;
};

const mapAbilityBag = (root: any, ability: AbilitiesType, locale: string = "en") => {
  const abilityBag = root.ability_bag;

  /* --------- UI SECTION --------- */
  ability.ui.iconName = abilityBag.ui_info?.icon_name || "";
  ability.ui.symbolIconName = abilityBag.ui_info?.symbol_icon_name || "";
  // When it is empty, it has a value of "0".
  ability.ui.screenName = resolveLocstring(abilityBag.ui_info?.screen_name, locale) || "";
  ability.ui.helpText = resolveLocstring(abilityBag.ui_info?.help_text, locale) || "";
  ability.ui.extraText = resolveLocstring(abilityBag.ui_info?.extra_text, locale) || "";
  ability.ui.briefText = resolveLocstring(abilityBag.ui_info?.brief_text, locale) || "";

  ability.ui.briefTextFormatter =
    resolveTextFormatterLocstring(abilityBag.ui_info?.brief_text_formatter, locale) || "";
  ability.ui.extraTextFormatter =
    resolveTextFormatterLocstring(abilityBag.ui_info?.extra_text_formatter, locale) || "";

  ability.activation = abilityBag.activation || "";
  /* --------- COST SECTION --------- */
  ability.cost.fuel = abilityBag.cost_to_player?.fuel || 0;
  ability.cost.munition = abilityBag.cost_to_player?.munition || 0;
  ability.cost.manpower = abilityBag.cost_to_player?.manpower || 0;
  ability.cost.popcap = abilityBag.cost_to_player?.popcap || 0;
  ability.rechargeTime = abilityBag.recharge_time || 0;

  const duration = Number(abilityBag.channeling?.channeling_time_second);
  if (Number.isFinite(duration) && duration > 0) {
    ability.duration = duration;
  }
  const toggledRechargeTimeOn = Number(abilityBag.toggled_recharge_time_on);
  if (Number.isFinite(toggledRechargeTimeOn) && toggledRechargeTimeOn > 0) {
    ability.toggledRechargeTimeOn = toggledRechargeTimeOn;
  }

  const toggledRechargeTimeOff = Number(abilityBag.toggled_recharge_time_off);
  if (Number.isFinite(toggledRechargeTimeOff) && toggledRechargeTimeOff > 0) {
    ability.toggledRechargeTimeOff = toggledRechargeTimeOff;
  }

  const range = Number(abilityBag.range);
  if (Number.isFinite(range) && range > 0) {
    ability.range = range;
  }

  const minRange = Number(abilityBag.min_range);
  if (Number.isFinite(minRange) && minRange > 0) {
    ability.minRange = minRange;
  }

  /* --------- CUSTOM PROPERTY SECTION --------- */
  const customProperties = root.custom_properties;

  if (Array.isArray(customProperties?.custom_pbgid_properties)) {
    for (const item of customProperties.custom_pbgid_properties as AbilityCustomPbgidPropertyItem[]) {
      const property = item.custom_pbgid_property;
      const propertyId = property?.id?.toUpperCase() || "";
      const weaponReference = property?.pbg?.instance_reference || "";

      if (!ABILITY_WEAPON_PBG_PROPERTY_IDS.has(propertyId) || !weaponReference) continue;

      const weaponId = getIdFromInstanceReference(weaponReference);
      if (weaponId && !ability.abilityWeaponIds.includes(weaponId)) {
        ability.abilityWeaponIds.push(weaponId);
      }
    }
  }

  const numShotsProperty = (
    customProperties?.custom_int32_properties as AbilityCustomInt32PropertyItem[] | undefined
  )?.find((item) => item.custom_int32_property?.id?.toUpperCase() === "NUM_SHOTS");
  const numShots = Number(numShotsProperty?.custom_int32_property?.value);
  if (Number.isFinite(numShots) && numShots > 0) {
    ability.numShots = Math.trunc(numShots);
  }

  applyAbilityStateTreeWeaponMappings(ability, root);

  /* --------- REQUIREMENTS SECTION --------- */
  ability.displayRequirements = extractDisplayRequirements(abilityBag.requirements);

  if (Array.isArray(abilityBag.requirements)) {
    // Find the required player upgrade, which points to the upgrade reference.
    const reqPlayerUpgrade = (abilityBag.requirements as AbilityRequirementItem[]).find(
      (reqItem) => {
        const reqRef = reqItem.required.template_reference.value.split("\\").slice(-1)[0];
        return reqRef === "required_player_upgrade" || reqRef === "required_all_in_list";
      },
    );
    if (reqPlayerUpgrade) {
      const reqRef = reqPlayerUpgrade.required.template_reference.value.split("\\").slice(-1)[0];
      // NEW: Some abilities have a new "required_all_in_list" vaue at the
      // parent requirement, which means we meed to lookup for the child
      if (reqRef === "required_player_upgrade") {
        ability.requirements.playerUpgrade =
          reqPlayerUpgrade.required.upgrade_name?.instance_reference || "";
      } else {
        const childReqAllItem = reqPlayerUpgrade.required.requirements?.find(
          (x) =>
            x.requirement.template_reference.value.split("\\").slice(-1)[0] ===
            "required_player_upgrade",
        );
        ability.requirements.playerUpgrade =
          childReqAllItem?.requirement.upgrade_name?.instance_reference || "";
      }
    }
  }
};

// Calls the mapping for each entity and puts the result array into the exported
// SbpsData variable. This variable can be imported everywhere. this method is
// called after loading the JSON at build time.
const getAbilitiesStats = async (patch = "latest", locale: string = "en") => {
  if (patch == config.latestPatch) patch = "latest";

  const cacheKey = `${patch}-${locale}`;
  if (abilitiesPatchData && abilitiesPatchData[cacheKey]) return abilitiesPatchData[cacheKey];

  const myReqAbilities = await fetch(config.getPatchDataUrl("abilities.json", patch));
  const root = await myReqAbilities.json();

  const abilitiesSetAll: AbilitiesType[] = [];

  // Extract from JSON
  for (const obj in root) {
    const abilitiesSet = traverseTree(
      root[obj],
      isAbilityBagContainer,
      (filename: string, subtree: any, jsonPath: string, parent: string) =>
        mapAbilitiesData(filename, subtree, jsonPath, parent, locale),
      obj,
      obj,
    );

    // Filter relevant objects
    abilitiesSet.forEach((item: AbilitiesType) => {
      abilitiesSetAll.push(item);
    });
  }

  // Store in cache
  if (!abilitiesPatchData) abilitiesPatchData = {};
  abilitiesPatchData[cacheKey] = abilitiesSetAll;

  // Set singleton for latest patch
  if (patch === "latest") {
    setAbilitiesStats(abilitiesSetAll);
  }

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
