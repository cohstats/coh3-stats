import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";

let WeaponStats: WeaponType[];

// Maps a single weapon entity
type WeaponType = {
  // might be a bit redundant by now

  //@todo remvoe redundancy from prototyping
  id: string; // file name in essence editor
  ui_name: string; // name in game
  icon_name: string; // icon path in game
  weapon_bag: any; // weapon data
  pbgid: string; // essence id
  path: string; // root object e.g africa_korps
  label: string; // label for search selection
  value: string; // value for search selection
  data: any; // weapon_data (duplicate)
  description: string; // search selection description
  faction: string; // faction string e.g. afrika_korps
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
};

const mapWeaponData = (key: string, node: any, jsonPath: string, parent: string) => {
  const weapon_bag: any = node.weapon_bag;

  // todo remove redundancy
  const weaponData: WeaponType = {
    id: key,
    ui_name: resolveLocstring(weapon_bag.ui_name),
    icon_name: weapon_bag.icon_name,
    weapon_bag: weapon_bag,
    pbgid: node.pbgid,
    path: jsonPath,
    label: key,
    value: key,
    data: weapon_bag,
    description: resolveLocstring(weapon_bag.ui_name),
    faction: jsonPath.split("\\")[0],
    parent: parent,
  };

  return weaponData;
};

// parses the attribute tree and initiates the mapping. Save
// the mapping array in global exporting variable.
const getWeaponStats = async () => {
  // make sure that this method is called only once among all pages
  if (WeaponStats) return WeaponStats;

  // Fetch JSON data
  const myReqWeapon = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/weapon.json",
  );

  const root = await myReqWeapon.json();

  const weaponSetAll: WeaponType[] = [];

  // Extract from JSON
  for (const obj in root) {
    // find all weapon_bags
    const weaponSet = traverseTree(root[obj], isWeaponBagContainer, mapWeaponData, obj, obj);
    // weaponSet.forEach(weaponSetAll.add, weaponSetAll);

    // Filter relevant objects
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
      }
    });
  }

  // Set singleton
  WeaponStats = weaponSetAll;

  return weaponSetAll;
};

const setWeaponStats = (weaponStats: WeaponType[]) => {
  WeaponStats = weaponStats;
};

const isWeaponBagContainer = (key: string, obj: any) => {
  // check if first child is weapon_bag
  return Object.keys(obj)[0] === "weapon_bag";
};

export { WeaponStats, setWeaponStats, getWeaponStats };
export type { WeaponType };
