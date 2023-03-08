// type description of mapped data

import { traverseTree } from "./unitStatsLib";

// need to be extended by all required fields
type SbpsType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  path: string; // folder from which the extraction got started. Eg. afrika_corps, american, british,.
  faction: string; // races\[factionName]
  loadout: LoadoutData[]; // squad_loadout_ext.unit_list
  unitType: string; //
};

type LoadoutData = {
  isDefaultUnit: boolean;
  num: number;
  type: string;
};

// exported variable holding mapped data for each
// json file. Will be set via setSbpsStats.
// Can be accessed from everywhere
let sbpsStats: SbpsType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapSbpsData = (filename: string, subtree: any, jsonPath: string, parent: string) => {
  const sbpsEntity: SbpsType = {
    id: filename,
    path: jsonPath,
    faction: jsonPath.split("//")[1],
    unitType: parent,
    loadout: [],
  };

  mapExtensions(subtree, sbpsEntity);

  // compute load out

  return sbpsEntity;
};

const mapExtensions = (root: any, spbps: SbpsType) => {
  for (const squadext in root.extensions) {
    const extension = root.extensions[squadext].squadexts;
    for (const attribute in extension) {
      const attr_obj = extension[attribute];
      switch (attribute) {
        case "squad_loadout_ext":
          for (const unit in attr_obj) {
            spbps.loadout.push({
              isDefaultUnit: attr_obj.is_default_unit,
              num: attr_obj.num,
              type: attr_obj.type,
            });
          }
          break;

        default:
          break;
      }
    }
  }
};

// calls the mapping for each entity and
// puts the result array into the exported SbpsData variable.
// This variable can be imported everywhere.
// this method is called after loading the JSON at build time.
const getSbpsStats = async () => {
  // check if data already extracted
  if (sbpsStats) return sbpsStats;

  const myReqSbps = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/sbps.json",
  );

  const root = await myReqSbps.json();

  const sbpsSetAll: SbpsType[] = [];

  // Extract from JSON
  for (const obj in root) {
    // find all weapon_bags
    const sbpsSet = traverseTree(root[obj], isExtensionContainer, mapSbpsData, obj, obj);

    // Filter relevant objects
    sbpsSet.forEach((item: any) => {
      // filter by relevant weapon types
      switch (item.parent) {
        // case "sub_machine_gun":
        //   weapon_icon = "m1_thompson_sub_machine_gun.png";
        //   item.image = "/unitStats/weaponClass/" + weapon_icon;
        //   weaponSetAll.push(item);
        //   break;
        // case "light_machine_gun":
        //   weapon_icon = "weapon_lmg_mg34.png";
        //   item.image = "/unitStats/weaponClass/" + weapon_icon;
        //   weaponSetAll.push(item);
        //   break;
        // case "heavy_machine_gun":
        //   weapon_icon = "hmg_mg42_ger.png";
        //   item.image = "/unitStats/weaponClass/" + weapon_icon;
        //   weaponSetAll.push(item);
        //   break;
        // case "rifle":
        //   weapon_icon = "weapon_dp_28_lmg.png";
        //   item.image = "/unitStats/weaponClass/" + weapon_icon;
        //   weaponSetAll.push(item);
        //   break;
        default:
          return;
      }
    });
  }

  //@todo to be filled
  return [];
};

const isExtensionContainer = (key: string, obj: any) => {
  // check if first child is weapon_bag
  return Object.keys(obj)[0] === "extensions";
};

//
const setSbpsStats = (sbpsStats: SbpsType[]) => {
  //@todo to be filled
  sbpsStats = sbpsStats;
};

export { sbpsStats, setSbpsStats, getSbpsStats };
export type { SbpsType };
