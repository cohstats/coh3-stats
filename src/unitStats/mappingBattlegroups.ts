// type description of mapped data

import slash from "slash";
import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";

// The battlegroup represents the parent BG with its children (branches).
type BattlegroupsType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british.
  faction: string; // races/[factionName]
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
let battlegroupStats: BattlegroupsType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapBattlegroupData = (filename: string, subtree: any, jsonPath: string, parent: string) => {
  const bgEntity: BattlegroupsType = {
    id: filename,
    path: jsonPath,
    faction: slash(jsonPath).split("/")[1] ?? jsonPath,
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

  mapTechTreeBag(subtree, bgEntity);

  return bgEntity;
};

const mapTechTreeBag = (root: any, bg: BattlegroupsType) => {
  const techTreeBag = root.techtree_bag;

  /* --------- UI SECTION --------- */
  bg.activationRef = techTreeBag.activation_upgrade?.instance_reference || "";
  // The first item in the array is the left branch. The second is the right branch.
  const [leftBranch, rightBranch] = techTreeBag.branches;
  bg.branchesRefs = {
    LEFT: {
      name: resolveLocstring(leftBranch.branch.name),
      upgrades: Array.isArray(leftBranch.branch.upgrades)
        ? leftBranch.branch.upgrades.map(
            (x: { upgrade: { instance_reference: string } }) => x.upgrade.instance_reference,
          )
        : [],
    },
    RIGHT: {
      name: resolveLocstring(rightBranch.branch.name),
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
const getBattlegroupStats = async () => {
  if (battlegroupStats) return battlegroupStats;

  const myReqBattlegroup = await fetch(
    "https://raw.githubusercontent.com/KingDarBoja/coh3-data/export-battlegroups/scripts/xml-to-json/exported/battlegroup.json",
  );

  const root = await myReqBattlegroup.json();

  const bgSetAll: BattlegroupsType[] = [];

  // Extract from JSON
  for (const obj in root) {
    const bgSet = traverseTree(root[obj], isTechTreeBagContainer, mapBattlegroupData, obj, obj);

    // Filter relevant objects
    bgSet.forEach((item: BattlegroupsType) => {
      bgSetAll.push(item);
    });
  }

  setBattlegroupStats(bgSetAll);

  return bgSetAll;
};

const isTechTreeBagContainer = (key: string, obj: any) => {
  // check if first child is `techtree_bag`.
  return Object.keys(obj).includes("techtree_bag");
};

/**
 * Assign the stats to the global variable.
 * @param stats
 */
const setBattlegroupStats = (stats: BattlegroupsType[]) => {
  battlegroupStats = stats;
};

export { battlegroupStats, setBattlegroupStats, getBattlegroupStats };
export type { BattlegroupsType };
