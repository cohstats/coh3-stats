import { resolveLocstring } from "../../pages/unitCard";
import { traverseTree } from "./unitStatsLib";
import { isWeaponBagContainer } from "./weaponLib";

let WeaponStats: WeaponType[];

// Maps a single weapon entity
type WeaponType = {
  // might be a bit redundant by now

  id: string; // file name in essence editor
  ui_name: string; // name in game
  icon_name: string; // icon path in game
  unit_name: string; // referencing squad
  weapon_bag: any; // weapon data
  pbgid: string; // essence id
  parent_pbg: string; // essence parent path
  root: any; // root object e.g africa_korps
  image_weapon: string; // image for weapon e.g. in search selection
  image_faction: string; // image for faction e.g. in search selection
  label: string; // label for search selection
  value: string; // value for search selection
  data: any; // weapon_data (duplicate)
  description: string; // search selection description
  faction: string; // faction string e.g. afrika_korps
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
};

// Helper eg. to have a more comfortable structure for for drop downs.
const mapWeaponData = (key: string, node: any, root: string, parent: string) => {
  const weaponData: WeaponType = {
    id: "",
    ui_name: "",
    icon_name: "",
    unit_name: "",
    weapon_bag: null,
    pbgid: "",
    parent_pbg: "",
    root: "",
    image_weapon: "",
    image_faction: "",
    label: "",
    value: "",
    data: "",
    description: "",
    faction: "",
    parent: "",
  };

  weaponData.id = key;

  const weapon_bag: any = node.weapon_bag;

  weaponData.ui_name = resolveLocstring(weapon_bag.ui_name); //@todo localization
  weaponData.icon_name = weapon_bag.icon_name;
  weaponData.weapon_bag = weapon_bag;
  weaponData.pbgid = node.pbgid;
  //weaponData.parent_pbg = node.parent_pbg.instance_reference;
  weaponData.root = root;
  weaponData.faction = root;
  weaponData.label = key;
  weaponData.value = key;
  weaponData.data = weapon_bag;
  weaponData.description = weaponData.ui_name || "No Description Available";
  weaponData.parent = parent;

  return weaponData;
};

// parses the attribute tree and initiates the mapping. Save
// the mapping array in global exporting variable.
const getWeaponStats = (root: any) => {
  const weaponSetAll: WeaponType[] = [];

  for (const obj in root) {
    const weaponSet = traverseTree(root[obj], isWeaponBagContainer, mapWeaponData, obj, obj);
    // weaponSet.forEach(weaponSetAll.add, weaponSetAll);
    weaponSet.forEach((item: any) => {
      let weapon_icon;

      if (!item.weapon_bag.weapon_class) return;

      // filter by relevant weapon types
      switch (item.parent) {
        case "sub_machine_gun":
          weapon_icon = "m1_thompson_sub_machine_gun.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        case "light_machine_gun":
          weapon_icon = "weapon_lmg_mg34.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        case "heavy_machine_gun":
          weapon_icon = "hmg_mg42_ger.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        case "rifle":
          weapon_icon = "weapon_dp_28_lmg.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        default:
          return;
          break;
      }

      //weaponData.
    });
  }

  WeaponStats = weaponSetAll;

  return weaponSetAll;
};

const setWeaponStats = (weaponStats: WeaponType[]) => {
  WeaponStats = weaponStats;
};

export { WeaponStats, setWeaponStats, getWeaponStats };
export type { WeaponType };
