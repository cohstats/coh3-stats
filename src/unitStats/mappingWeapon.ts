import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";
import config from "../../config";

let WeaponStats: WeaponType[];

type RangeType = {
  near: number;
  mid: number;
  far: number;
  min: number;
  max: number;
};

export type WeaponStatsType = {
  accuracy_near: number;
  accuracy_mid: number;
  accuracy_far: number;

  aoe_accuracy_far: number;
  aoe_accuracy_mid: number;
  aoe_accuracy_near: number;

  aoe_penetration_far: number;
  aoe_penetration_mid: number;
  aoe_penetration_near: number;

  aoe_outer_radius: number;

  aoe_damage_far: number;
  aoe_damage_mid: number;
  aoe_damage_near: number;

  aoe_damage_max_member: number;

  aoe_distance_near: number;
  aoe_distance_mid: number;
  aoe_distance_far: number;

  aim_time_multiplier_near: number;
  aim_time_multiplier_mid: number;
  aim_time_multiplier_far: number;
  fire_aim_time_min: number;
  fire_aim_time_max: number;

  burst_can_burst: boolean;
  burst_duration_min: number;
  burst_duration_max: number;
  burst_duration_multiplier_near: number;
  burst_duration_multiplier_mid: number;
  burst_duration_multiplier_far: number;
  burst_rate_of_fire_min: number;
  burst_rate_of_fire_max: number;
  burst_rate_of_fire_multiplier_near: number;
  burst_rate_of_fire_multiplier_mid: number;
  burst_rate_of_fire_multiplier_far: number;

  cooldown_duration_min: number;
  cooldown_duration_max: number;
  cooldown_duration_multiplier_near: number;
  cooldown_duration_multiplier_mid: number;
  cooldown_duration_multiplier_far: number;

  cover_table_tp_defcover_accuracy_multiplier: number;
  cover_table_tp_defcover_damage_multiplier: number;
  cover_table_tp_defcover_penetration_multiplier: number;

  cover_table_tp_garrison_cover_accuracy_multiplier: number;
  cover_table_tp_garrison_cover_damage_multiplier: number;
  cover_table_tp_garrison_cover_penetration_multiplier: number;

  cover_table_tp_heavy_cover_accuracy_multiplier: number;
  cover_table_tp_heavy_cover_damage_multiplier: number;
  cover_table_tp_heavy_cover_penetration_multiplier: number;

  cover_table_tp_light_cover_accuracy_multiplier: number;
  cover_table_tp_light_cover_damage_multiplier: number;
  cover_table_tp_light_cover_penetration_multiplier: number;

  damage_damage_type: string;
  damage_min: number;
  damage_max: number;

  default_attack_type: string;

  fire_wind_down: number;
  fire_wind_up: number;

  moving_accuracy_multiplier: number;
  moving_burst_multiplier: number;
  moving_can_fire_while_moving: boolean;
  moving_cooldown_multiplier: number;

  penetration_near: number;
  penetration_mid: number;
  penetration_far: number;

  range: RangeType;

  range_distance_near: number;
  range_distance_mid: number;
  range_distance_far: number;

  range_min: number;
  range_max: number;

  reload_duration_min: number;
  reload_duration_max: number;

  reload_duration_multiplier_near: number;
  reload_duration_multiplier_mid: number;
  reload_duration_multiplier_far: number;

  reload_frequency_min: number;
  reload_frequency_max: number;

  scatter_angle_scatter: number;
  scatter_distance_scatter_max: number;
  scatter_distance_scatter_offset: number;
  scatter_distance_scatter_ratio: number;
  scatter_distance_object_min: number;

  target_type_table: TargetType[];
};

// Maps a single weapon entity
type WeaponType = {
  // might be a bit redundant by now

  //@todo remvoe redundancy from prototyping
  id: string; // file name in essence editor
  ui_name: string; // name in game
  icon_name: string; // icon path in game
  weapon_bag: WeaponStatsType; // weapon data
  pbgid: string; // essence id
  path: string; // root object e.g africa_korps
  label: string; // label for search selection
  value: string; // value for search selection
  description: string; // search selection description
  faction: string; // faction string e.g. afrika_korps
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
  weapon_class: string; // Class defined in the weapon bag (cannon, at_gun)
  weapon_cat: string; // category defined by high_level folder structure (ballistic, small arms, explosive)
};

type TargetType = {
  unit_type: string;
  dmg_modifier: number;
  accuracy_multiplier: number;
  penetration_multiplier: number;
  damage_multiplier: number;
};

const mapWeaponData = (key: string, node: any, jsonPath: string, parent: string) => {
  const weapon_bag: any = node.weapon_bag;

  // todo remove redundancy
  const weaponData: WeaponType = {
    id: key,
    ui_name: resolveLocstring(weapon_bag.ui_name),
    icon_name: weapon_bag.icon_name || "",
    pbgid: node.pbgid,
    path: jsonPath,
    label: key,
    value: key,
    weapon_class: weapon_bag.weapon_class || "",
    description: resolveLocstring(weapon_bag.ui_name),
    faction: jsonPath.split("/")[0],
    parent: parent,
    weapon_cat: jsonPath.split("/")[1] || "",

    weapon_bag: {
      accuracy_near: weapon_bag.accuracy?.near || 0,
      accuracy_mid: weapon_bag.accuracy?.mid || 0,
      accuracy_far: weapon_bag.accuracy?.far || 0,

      aoe_accuracy_far: weapon_bag.area_effect?.accuracy?.far || 1,
      aoe_accuracy_mid: weapon_bag.area_effect?.accuracy?.mid || 1,
      aoe_accuracy_near: weapon_bag.area_effect?.accuracy?.near || 1,

      aoe_penetration_far: weapon_bag.area_effect?.aoe_penetration?.far || 0,
      aoe_penetration_mid: weapon_bag.area_effect?.aoe_penetration?.mid || 0,
      aoe_penetration_near: weapon_bag.area_effect?.aoe_penetration?.near || 0,

      aoe_distance_near: weapon_bag.area_effect?.distance.near || 0,
      aoe_distance_mid: weapon_bag.area_effect?.distance.mid || 0,
      aoe_distance_far: weapon_bag.area_effect?.distance.far || 0,

      aoe_damage_max_member: weapon_bag.area_effect?.damage_max_members_per_squad || -1,

      aoe_outer_radius: weapon_bag.area_effect?.area_info?.outer_radius || 0,

      aoe_damage_far: weapon_bag.area_effect?.damage?.far || 1,
      aoe_damage_mid: weapon_bag.area_effect?.damage?.mid || 1,
      aoe_damage_near: weapon_bag.area_effect?.damage?.near || 1,

      aim_time_multiplier_near: weapon_bag.aim?.aim_time_multiplier?.near || 1,
      aim_time_multiplier_mid: weapon_bag.aim?.aim_time_multiplier?.mid || 1,
      aim_time_multiplier_far: weapon_bag.aim?.aim_time_multiplier?.far || 1,

      fire_aim_time_min: weapon_bag.fire_aim_time?.min || 0,
      fire_aim_time_max: weapon_bag.fire_aim_time?.max || 0,

      burst_can_burst: weapon_bag.burst?.can_burst == "True" ? true : false,
      burst_duration_min: weapon_bag.burst?.duration?.min || 0,
      burst_duration_max: weapon_bag.burst?.duration?.max || 0,
      burst_duration_multiplier_near: weapon_bag.burst?.duration_multiplier?.near || 1,
      burst_duration_multiplier_mid: weapon_bag.burst?.duration_multiplier?.mid || 1,
      burst_duration_multiplier_far: weapon_bag.burst?.duration_multiplier?.far || 1,
      burst_rate_of_fire_min: weapon_bag.burst?.rate_of_fire?.min || 0,
      burst_rate_of_fire_max: weapon_bag.burst?.rate_of_fire?.max || 0,
      burst_rate_of_fire_multiplier_near: weapon_bag.burst?.rate_of_fire_multiplier?.near || 1,
      burst_rate_of_fire_multiplier_mid: weapon_bag.burst?.rate_of_fire_multiplier?.mid || 1,
      burst_rate_of_fire_multiplier_far: weapon_bag.burst?.rate_of_fire_multiplier?.far || 1,

      cooldown_duration_min: weapon_bag.cooldown?.duration?.min || 0,
      cooldown_duration_max: weapon_bag.cooldown?.duration?.max || 0,
      cooldown_duration_multiplier_near: weapon_bag.cooldown?.duration_multiplier?.near || 1,
      cooldown_duration_multiplier_mid: weapon_bag.cooldown?.duration_multiplier?.mid || 1,
      cooldown_duration_multiplier_far: weapon_bag.cooldown?.duration_multiplier?.max || 1,

      cover_table_tp_defcover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_defcover?.accuracy_multiplier || 1,
      cover_table_tp_defcover_damage_multiplier:
        weapon_bag.cover_table?.tp_defcover?.damage_multiplier || 1,
      cover_table_tp_defcover_penetration_multiplier:
        weapon_bag.cover_table?.tp_defcover?.penetration_multiplier || 1,

      cover_table_tp_garrison_cover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_garrison_cover?.accuracy_multiplier || 1,
      cover_table_tp_garrison_cover_damage_multiplier:
        weapon_bag.cover_table?.tp_garrison_cover?.damage_multiplier || 1,
      cover_table_tp_garrison_cover_penetration_multiplier:
        weapon_bag.cover_table?.tp_garrison_cover?.penetration_multiplier || 1,

      cover_table_tp_heavy_cover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_heavy_cover?.accuracy_multiplier || 1,
      cover_table_tp_heavy_cover_damage_multiplier:
        weapon_bag.cover_table?.tp_heavy_cover?.damage_multiplier || 1,
      cover_table_tp_heavy_cover_penetration_multiplier:
        weapon_bag.cover_table?.tp_heavy_cover?.penetration_multiplier || 1,

      cover_table_tp_light_cover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_light_cover?.accuracy_multiplier || 1,
      cover_table_tp_light_cover_damage_multiplier:
        weapon_bag.cover_table?.tp_light_cover?.damage_multiplier || 1,
      cover_table_tp_light_cover_penetration_multiplier:
        weapon_bag.cover_table?.tp_light_cover?.penetration_multiplier || 1,

      damage_damage_type: weapon_bag.damage?.damage_type || "",
      damage_min: weapon_bag.damage?.min || 0,
      damage_max: weapon_bag.damage?.max || 0,

      default_attack_type: weapon_bag.default_attack_type || "",

      fire_wind_down: weapon_bag.fire?.wind_down || 0,
      fire_wind_up: weapon_bag.fire?.wind_up || 0,

      moving_accuracy_multiplier: weapon_bag.moving?.accuracy_multiplier || 1,
      moving_burst_multiplier: weapon_bag.moving?.burst_multiplier || 1,
      moving_can_fire_while_moving:
        weapon_bag.moving?.can_fire_while_moving == "True" ? true : false,
      moving_cooldown_multiplier: weapon_bag.moving?.cooldown_multiplier || 1,

      penetration_near: weapon_bag.penetration?.near || 0,
      penetration_mid: weapon_bag.penetration?.mid || 0,
      penetration_far: weapon_bag.penetration?.far || 0,

      range_distance_near: weapon_bag.range?.distance?.near || -1,
      range_distance_mid: weapon_bag.range?.distance?.mid || -1,
      range_distance_far: weapon_bag.range?.distance?.far || -1,

      range_min: weapon_bag.range?.min || 0,
      range_max: weapon_bag.range?.max || 0,

      range: {
        far: weapon_bag.range?.distance?.far || -1,
        mid: weapon_bag.range?.distance?.mid || -1,
        near: weapon_bag.range?.distance?.near || -1,
        min: weapon_bag.range?.min || 0,
        max: weapon_bag.range?.max || 0,
      },

      reload_duration_min: weapon_bag.reload?.duration?.min || 0,
      reload_duration_max: weapon_bag.reload?.duration?.max || 0,

      reload_duration_multiplier_near: weapon_bag.reload?.duration_multiplier?.near || 1,
      reload_duration_multiplier_mid: weapon_bag.reload?.duration_multiplier?.mid || 1,
      reload_duration_multiplier_far: weapon_bag.reload?.duration_multiplier?.far || 1,

      reload_frequency_min: weapon_bag.reload?.frequency?.min || 0,
      reload_frequency_max: weapon_bag.reload?.frequency?.max || 0,

      scatter_angle_scatter: weapon_bag.scatter?.angle_scatter || 0,
      scatter_distance_scatter_max: weapon_bag.scatter?.distance_scatter_max || 0,
      scatter_distance_scatter_offset: weapon_bag.scatter?.distance_scatter_offset || 0,
      scatter_distance_scatter_ratio: weapon_bag.scatter?.distance_scatter_ratio || 0,
      scatter_distance_object_min: weapon_bag.scatter?.distance_scatter_object_min_hit || 0,
      //aoe_distance_object_min : weapon_bag.scatt
      target_type_table: [],
    },
  };

  if (weapon_bag.range.near === -1) weapon_bag.range.near = weapon_bag.range.min;
  if (weapon_bag.range.mid === -1)
    weapon_bag.range.mid = (weapon_bag.range.max - weapon_bag.range.min) / 2;
  if (weapon_bag.range.far === -1) weapon_bag.range.far = weapon_bag.range.max;

  if (weapon_bag.target_type_table)
    for (const target_types of weapon_bag.target_type_table) {
      weaponData.weapon_bag.target_type_table.push({
        unit_type: target_types.target_unit_type_multipliers?.unit_type || "",
        dmg_modifier: target_types.target_unit_type_multipliers?.base_damage_modifier || 0,
        accuracy_multiplier:
          target_types.target_unit_type_multipliers?.weapon_multiplier?.accuracy_multiplier || 1,
        penetration_multiplier:
          target_types.target_unit_type_multipliers?.weapon_multiplier?.penetration_multiplier ||
          1,
        damage_multiplier:
          target_types.target_unit_type_multiplier?.weapon_multipliers?.damage_multiplier || 1,
      });
    }

  return weaponData;
};

// parses the attribute tree and initiates the mapping. Save
// the mapping array in global exporting variable.
const getWeaponStats = async () => {
  // make sure that this method is called only once among all pages
  if (WeaponStats) return WeaponStats;

  const myReqWeapon = await fetch(config.getPatchDataUrl("weapon.json"));

  const root = await myReqWeapon.json();

  const weaponSetAll: WeaponType[] = [];

  // Extract from JSON
  for (const obj in root) {
    // find all weapon_bags
    const weaponSet = traverseTree(root[obj], isWeaponBagContainer, mapWeaponData, obj, obj);
    // weaponSet.forEach(weaponSetAll.add, weaponSetAll);

    // Filter relevant objects
    weaponSet.forEach((item: any) => {
      weaponSetAll.push(item);
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
export type { WeaponType, RangeType };
