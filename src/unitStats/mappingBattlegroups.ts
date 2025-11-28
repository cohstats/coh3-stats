// type description of mapped data

import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";
import config from "../../config";
import { internalSlash } from "../utils";

// The battlegroup represents the parent BG with its children (branches).
type BattlegroupsType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british.
  faction: string; // races/[factionName]
  name: string; // name of the battlegroup
  /** The raw activation upgrade reference found at `activation_upgrade/instance_reference`. */
  activationRef: string;
  /** The raw upgrade references found at `branch/upgrades` and resolved namesfound at `branch/name`. */
  branchesRefs: {
    LEFT: { name: string; upgrades: string[] };
    RIGHT: { name: string; upgrades: string[] };
  };
};

// Exported variable holding mapped data for each json file. Will be set via
// `setBattlegroupStats`. Can be accessed from everywhere.
const battlegroupStats: Record<string, BattlegroupsType[]> = {};

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapBattlegroupData = (
  filename: string,
  subtree: any,
  jsonPath: string,
  locale: string = "en",
) => {
  const bgEntity: BattlegroupsType = {
    id: filename,
    path: jsonPath,
    faction: internalSlash(jsonPath).split("/")[1] ?? jsonPath,
    name: "",
    activationRef: "",
    branchesRefs: {
      LEFT: {
        name: "",
        upgrades: [],
      },
      RIGHT: {
        name: "",
        upgrades: [],
      },
    },
  };

  mapTechTreeBag(subtree, bgEntity, locale);

  return bgEntity;
};

const mapTechTreeBag = (root: any, bg: BattlegroupsType, locale: string = "en") => {
  const techTreeBag = root.techtree_bag;

  /* --------- UI SECTION --------- */
  bg.activationRef = techTreeBag.activation_upgrade?.instance_reference || "";
  bg.name = resolveLocstring(techTreeBag.name, locale) || "";
  // The first item in the array is the left branch. The second is the right branch.
  const [leftBranch, rightBranch] = techTreeBag.branches;
  bg.branchesRefs = {
    LEFT: {
      name: resolveLocstring(leftBranch.branch.name, locale) || "",
      upgrades: Array.isArray(leftBranch.branch.upgrades)
        ? leftBranch.branch.upgrades.map(
            (x: { upgrade: { instance_reference: string } }) => x.upgrade.instance_reference,
          )
        : [],
    },
    RIGHT: {
      name: resolveLocstring(rightBranch.branch.name, locale) || "",
      upgrades: Array.isArray(rightBranch.branch.upgrades)
        ? rightBranch.branch.upgrades.map(
            (x: { upgrade: { instance_reference: string } }) => x.upgrade.instance_reference,
          )
        : [],
    },
  };
};

// Calls the mapping for each entity and puts the result array into the exported
// SbpsData variable. This variable can be imported everywhere. this method is
// called after loading the JSON at build time.
const getBattlegroupStats = async (locale: string = "en") => {
  if (battlegroupStats[locale]) return battlegroupStats[locale];

  const myReqBattlegroup = await fetch(config.getPatchDataUrl("battlegroup.json"));

  const root = await myReqBattlegroup.json();

  const bgSetAll: BattlegroupsType[] = [];

  // Extract from JSON
  for (const obj in root) {
    const bgSet = traverseTree(
      root[obj],
      isTechTreeBagContainer,
      (filename: string, subtree: any, jsonPath: string) =>
        mapBattlegroupData(filename, subtree, jsonPath, locale),
      obj,
      obj,
    );

    // Filter relevant objects
    bgSet.forEach((item: BattlegroupsType) => {
      bgSetAll.push(item);
    });
  }

  setBattlegroupStats(bgSetAll, locale);

  return bgSetAll;
};

const isTechTreeBagContainer = (key: string, obj: any) => {
  // check if first child is `techtree_bag`.
  return Object.keys(obj).includes("techtree_bag");
};

/**
 * Assign the stats to the global variable.
 * @param stats
 * @param locale
 */
const setBattlegroupStats = (stats: BattlegroupsType[], locale: string = "en") => {
  battlegroupStats[locale] = stats;
};

export { battlegroupStats, setBattlegroupStats, getBattlegroupStats };
export type { BattlegroupsType };
