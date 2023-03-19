// type description of mapped data

import slash from "slash";
import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";

// Need to be extended by all required fields
type UpgradesType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british,.
  faction: string; // races/[factionName]
  upgradeType: string;
  /** Found at `ui_info`. */
  ui: UpgradeUiData;
  /** Found at `time_cost`. */
  cost: UpgradeCost;
};

/**
 * These are found within `ui_info`.
 * @TODO We could re-use this type with the ebps and sbps mapping functions as well.
 */
type UpgradeUiData = {
  /* Icon paths in-game. */
  iconName: string; // Could be empty.
  symbolIconName: string; // Could be empty.
  /* Locstring fields. */
  helpText: string;
  briefText: string;
  screenName: string;
  extraText: string; // Could be empty (Set as $0).
};

/**
 * These are found within `time_cost`.
 * @TODO We could re-use this type with the ebps and sbps mapping functions as well.
 */
type UpgradeCost = {
  fuel: number;
  manpower: number;
  munition: number;
  popcap: number;
  /** Training / research time. Found at `time_seconds` */
  time: number;
};

// Exported variable holding mapped data for each json file. Will be set via
// `setUpgradesStats`. Can be accessed from everywhere.
let upgradesStats: UpgradesType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapUpgradesData = (filename: string, subtree: any, jsonPath: string, parent: string) => {
  const upgradesEntity: UpgradesType = {
    id: filename,
    path: jsonPath,
    faction: slash(jsonPath).split("/")[1] ?? jsonPath,
    upgradeType: parent,
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
  };

  mapUpgradeBag(subtree, upgradesEntity);

  return upgradesEntity;
};

const mapUpgradeBag = (root: any, upgrade: UpgradesType) => {
  const upgradeBag = root.upgrade_bag;

  /* --------- UI SECTION --------- */
  upgrade.ui.iconName = upgradeBag.ui_info?.icon_name || "";
  upgrade.ui.symbolIconName = upgradeBag.ui_info?.symbol_icon_name || "";
  // When it is empty, it has a value of "0".
  const screenName = upgradeBag.ui_info.screen_name;
  upgrade.ui.screenName = resolveLocstring(screenName);
  const helpText = upgradeBag.ui_info.help_text;
  upgrade.ui.helpText = resolveLocstring(helpText);
  const extraText = upgradeBag.ui_info.extra_text;
  upgrade.ui.extraText = resolveLocstring(extraText);
  const briefText = upgradeBag.ui_info.brief_text;
  upgrade.ui.briefText = resolveLocstring(briefText);

  /* --------- COST SECTION --------- */
  upgrade.cost.time = upgradeBag.time_cost?.time_seconds || 0;
  upgrade.cost.fuel = upgradeBag.time_cost?.cost?.fuel || 0;
  upgrade.cost.munition = upgradeBag.time_cost?.cost?.munition || 0;
  upgrade.cost.manpower = upgradeBag.time_cost?.cost?.manpower || 0;
  upgrade.cost.popcap = upgradeBag.time_cost?.cost?.popcap || 0;
};

// Calls the mapping for each entity and puts the result array into the exported
// SbpsData variable. This variable can be imported everywhere. this method is
// called after loading the JSON at build time.
const getUpgradesStats = async () => {
  if (upgradesStats) return upgradesStats;

  const myReqUpgrades = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/master/data/upgrade.json",
  );

  const root = await myReqUpgrades.json();

  const upgradesSetAll: UpgradesType[] = [];

  // Extract from JSON
  for (const obj in root) {
    const upgradesSet = traverseTree(root[obj], isUpgradeBagContainer, mapUpgradesData, obj, obj);

    // Filter relevant objects
    upgradesSet.forEach((item: UpgradesType) => {
      upgradesSetAll.push(item);
    });
  }

  return upgradesSetAll;
};

const isUpgradeBagContainer = (key: string, obj: any) => {
  // check if first child is upgrade_bag.
  return Object.keys(obj).includes("upgrade_bag");
};

//
const setUpgradesStats = (stats: UpgradesType[]) => {
  upgradesStats = stats;
};

export { upgradesStats, setUpgradesStats, getUpgradesStats };
export type { UpgradesType };
