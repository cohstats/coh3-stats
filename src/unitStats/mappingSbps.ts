// type description of mapped data

import slash from "slash";
import { resolveLocstring } from "./locstring";
import { isBaseFaction, traverseTree } from "./unitStatsLib";

// need to be extended by all required fields
type SbpsType = {
  id: string; // filename  -> eg. panzergrenadier_ak
  screenName: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\screen_name
  path: string; // path to object
  faction: string; // from folder structure races\[factionName]
  loadout: LoadoutData[]; // squad_loadout_ext.unit_list
  unitType: string; // folder Infantry | vehicles | team_weapons | buildings
  helpText: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\help_text
  iconName: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\icon_name
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
    // default values

    id: filename,
    screenName: filename,
    path: slash(jsonPath),
    faction: jsonPath.split("/")[1] ?? jsonPath,
    unitType: parent,
    loadout: [],
    helpText: filename,
    iconName: slash("/icons/general/infantry_icn.png"),
  };

  mapExtensions(subtree, sbpsEntity);

  // compute load out

  return sbpsEntity;
};

const mapExtensions = (root: any, sbps: SbpsType) => {
  for (const squadext in root.extensions) {
    const extension = root.extensions[squadext].squadexts;
    const extName = extension.template_reference.value.split("\\")[1];
    switch (extName) {
      case "squad_loadout_ext":
        for (const unit in extension.unit_list) {
          let unitNum = extension.unit_list[unit].loadout_data.num;
          if (typeof unitNum == "undefined") unitNum = 5; // workaround aslong json is not complete

          if (extension.unit_list[unit].loadout_data.type)
            sbps.loadout.push({
              isDefaultUnit: true,
              num: unitNum, //@todo num not always avilable
              type: extension.unit_list[unit].loadout_data.type.instance_reference,
            });
          else console.log(sbps.id + ": Loadout not found");
        }
        break;

      case "squad_ui_ext":
        const info = extension.race_list[0]?.race_data?.info;
        if (info) {
          sbps.helpText = resolveLocstring(info.help_text) || sbps.helpText; // otherwise keep default values
          sbps.iconName = slash("icons/" + info.icon_name + ".png") || sbps.iconName;
          sbps.screenName = resolveLocstring(info.screen_name) || sbps.screenName;
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
    // find all extensions
    const sbpsSet = traverseTree(root[obj], isExtensionContainer, mapSbpsData, obj, obj);

    // Filter relevant objects
    sbpsSet.forEach((item: any) => {
      // skip non base factions
      if (!isBaseFaction(item.faction)) return;

      // filter by relevant weapon types
      switch (item.unitType) {
        case "infantry":
          sbpsSetAll.push(item);
          break;

        default:
          return;
      }
    });
  }

  sbpsStats = sbpsSetAll;

  //@todo to be filled
  return sbpsSetAll;
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
