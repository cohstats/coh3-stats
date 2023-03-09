// type description of mapped data

import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";

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
    faction: jsonPath.split("\\")[1] ?? jsonPath,
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
    //  a       : subtree.a
    //  z       : subtree.x.y.z
    // todo
  };

  mapExtensions(subtree, ebpsEntity);

  return ebpsEntity;
};

const mapExtensions = (root: any, epbps: EbpsType) => {
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
              epbps.spawnItems.push(squadInstRef);
            }
          }
        }
        break;
      case "type_ext":
        // Check if `unit_type_list` is not empty, otherwise skip.
        if (!extension.unit_type_list?.length) break;
        for (const unitType of extension.unit_type_list) {
          if (unitType.unit_type) {
            epbps.unitTypes.push(unitType.unit_type);
          }
        }
        break;
      case "ui_ext":
        {
          epbps.ui.iconName = extension?.icon_name || "";
          epbps.ui.symbolIconName = extension?.symbol_icon_name || "";
          // When it is empty, it has a value of "0".
          const screenName = extension.screen_name;
          epbps.ui.screenName = resolveLocstring(screenName);
          const helpText = extension.help_text;
          epbps.ui.helpText = resolveLocstring(helpText);
          const extraText = extension.extra_text;
          epbps.ui.extraText = resolveLocstring(extraText);
          const briefText = extension.brief_text;
          epbps.ui.briefText = resolveLocstring(briefText);
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
  if (ebpsStats) return;

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
    ebpsSet.forEach((item: any) => {
      // filter by relevant weapon types
      switch (item.unitType) {
        case "production":
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
  // check if first child is weapon_bag
  return Object.keys(obj)[0] === "extensions";
};

//
const setEbpsStats = (stats: EbpsType[]) => {
  //@todo to be filled
  ebpsStats = stats;
};

export { ebpsStats, getEbpsStats, setEbpsStats };
export type { EbpsType };
