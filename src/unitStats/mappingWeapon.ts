import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";
import config from "../../config";
import { WeaponBagSchema, WeaponCategory, WeaponClass } from "./types";

const WeaponPatchData: Record<string, Record<string, WeaponType[]>> = {}; // Modified to store by locale and patch

type RangeType = {
  near: number;
  mid: number;
  far: number;
  min: number;
  max: number;
};

type WeaponProjectileType = "none" | "direct" | "artillery";

type ProjectileMeta = {
  id: string;
  path: string;
  isArtillery: boolean;
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

  aoe_shape: "circle" | "rectangle" | "point" | "unknown";
  aoe_outer_radius: number;
  aoe_outer_length: number;
  aoe_width: number;

  aoe_damage_far: number;
  aoe_damage_mid: number;
  aoe_damage_near: number;

  aoe_damage_friendly_far: number;
  aoe_damage_friendly_mid: number;
  aoe_damage_friendly_near: number;
  aoe_has_friendly_fire: boolean;

  aoe_damage_max_member: number;

  aoe_distance_near: number;
  aoe_distance_mid: number;
  aoe_distance_far: number;

  aoe_suppression_far: number;
  aoe_suppression_mid: number;
  aoe_suppression_near: number;

  aim_time_multiplier_near: number;
  aim_time_multiplier_mid: number;
  aim_time_multiplier_far: number;
  fire_aim_time_min: number;
  fire_aim_time_max: number;

  behaviour_enable_auto_target_search: boolean;

  burst_can_burst: boolean;
  burst_duration_min: number;
  burst_duration_max: number;
  burst_duration_multiplier_near: number;
  burst_duration_multiplier_mid: number;
  burst_duration_multiplier_far: number;
  burst_focus_fire: boolean;
  burst_incremental_target_table_accuracy_multiplier: number;
  burst_incremental_target_table_search_radius_near: number;
  burst_incremental_target_table_search_radius_mid: number;
  burst_incremental_target_table_search_radius_far: number;
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
  cover_table_tp_defcover_cover_aim_time_multiplier: number;

  cover_table_tp_garrison_cover_accuracy_multiplier: number;
  cover_table_tp_garrison_cover_damage_multiplier: number;
  cover_table_tp_garrison_cover_penetration_multiplier: number;
  cover_table_tp_garrison_cover_aim_time_multiplier: number;

  cover_table_tp_heavy_cover_accuracy_multiplier: number;
  cover_table_tp_heavy_cover_damage_multiplier: number;
  cover_table_tp_heavy_cover_penetration_multiplier: number;
  cover_table_tp_heavy_cover_aim_time_multiplier: number;

  cover_table_tp_light_cover_accuracy_multiplier: number;
  cover_table_tp_light_cover_damage_multiplier: number;
  cover_table_tp_light_cover_penetration_multiplier: number;
  cover_table_tp_light_cover_aim_time_multiplier: number;

  damage_damage_type: string;
  damage_min: number;
  damage_max: number;

  default_attack_type: string;

  deflection_damage_multiplier: number;
  deflection_has_deflection_damage: boolean;

  fire_wind_down: number;
  fire_wind_up: number;

  moving_accuracy_multiplier: number;
  moving_burst_multiplier: number;
  moving_can_fire_while_moving: boolean;
  moving_cooldown_multiplier: number;

  penetration_near: number;
  penetration_mid: number;
  penetration_far: number;

  projectile_id: string;
  projectile_path: string;
  projectile_is_artillery: boolean;
  projectile_type: WeaponProjectileType;

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
  scatter_moving_scatter_angle_multiplier: number;
  scatter_moving_scatter_distance_multiplier: number;

  setup_time: number;

  suppression_amount: number;
  suppression_nearby_suppression_multiplier: number;
  suppression_nearby_suppression_radius: number;

  target_type_table: TargetType[];

  tracking_normal_max_left: number;
  tracking_normal_max_right: number;
  tracking_normal_speed_horizontal: number;

  teardown_time: number;
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
  weapon_class: (typeof WeaponClass)[number]; // Class defined in the weapon bag (cannon, at_gun)
  weapon_cat: (typeof WeaponCategory)[number]; // category defined by high_level folder structure (ballistic, small arms, explosive)
};

type TargetType = {
  unit_type: string;
  dmg_modifier: number;
  accuracy_multiplier: number;
  penetration_multiplier: number;
  damage_multiplier: number;
};

type AoeShape = "point" | "circle" | "rectangle" | "unknown";

const getAoeShape = (templateReference: string | undefined): AoeShape => {
  const ref = templateReference || "";

  if (ref.includes("point_area_option")) return "point";
  if (ref.includes("circle_area_option")) return "circle";
  if (ref.includes("rectangle_area_option")) return "rectangle";

  return "unknown";
};

const relicBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
};

const getIdFromInstanceReference = (instanceReference = "") => {
  return instanceReference.replace(/\\/g, "/").split("/").filter(Boolean).slice(-1)[0] || "";
};

const getExtensionName = (extension: any) => {
  return extension?.exts?.template_reference?.value?.split("\\").slice(-1)[0] || "";
};

const getProjectileExt = (node: any) => {
  if (!Array.isArray(node.extensions)) return undefined;

  return node.extensions.find(
    (extension: any) => getExtensionName(extension) === "projectile_ext",
  )?.exts;
};

const isProjectileContainer = (_key: string, obj: any) => {
  return !!getProjectileExt(obj);
};

const getProjectileMetadataMap = (ebpsRoot: any) => {
  const projectileMap = new Map<string, ProjectileMeta>();

  for (const obj in ebpsRoot) {
    const projectileSet = traverseTree(
      ebpsRoot[obj],
      isProjectileContainer,
      (filename: string, subtree: any, jsonPath: string) => {
        const projectileExt = getProjectileExt(subtree);

        return {
          id: filename,
          path: jsonPath,
          isArtillery: relicBoolean(projectileExt?.artillery?.is_artillery, false),
        };
      },
      obj,
      obj,
    );

    for (const projectile of projectileSet) {
      projectileMap.set(projectile.id, projectile);
    }
  }

  return projectileMap;
};

const mapWeaponData = (
  key: string,
  node: any,
  jsonPath: string,
  parent: string,
  locale = "en",
  projectileMap: Map<string, ProjectileMeta> = new Map(),
) => {
  const weapon_bag: WeaponBagSchema["weapon_bag"] = node.weapon_bag;

  const rangeDistance = {
    near: weapon_bag.range?.distance?.near || -1,
    mid: weapon_bag.range?.distance?.mid || -1,
    far: weapon_bag.range?.distance?.far || -1,
    min: weapon_bag.range?.min || 0,
    max: weapon_bag.range?.max || 0,
  };

  if (rangeDistance.near === -1) {
    rangeDistance.near = rangeDistance.min;
  }
  if (rangeDistance.mid === -1) {
    rangeDistance.mid = (rangeDistance.max - rangeDistance.min) / 2;
  }
  if (rangeDistance.far === -1) {
    rangeDistance.far = rangeDistance.max;
  }

  const projectilePath = weapon_bag.projectile?.projectile?.instance_reference || "";
  const projectileId = getIdFromInstanceReference(projectilePath);
  const projectileMeta = projectileId ? projectileMap.get(projectileId) : undefined;

  const projectileType: WeaponProjectileType = !projectileId
    ? "none"
    : projectileMeta?.isArtillery
      ? "artillery"
      : "direct";

  // todo remove redundancy
  const weaponData: WeaponType = {
    id: key,
    ui_name: resolveLocstring(weapon_bag.ui_name, locale) || "",
    icon_name: weapon_bag.icon_name || "",
    pbgid: node.pbgid,
    path: jsonPath,
    label: key,
    value: key,
    weapon_class: weapon_bag.weapon_class,
    description: resolveLocstring(weapon_bag.ui_name, locale) || "",
    faction: jsonPath.split("/")[0],
    parent: parent,
    weapon_cat: (jsonPath.split("/")[1] as (typeof WeaponCategory)[number]) || "unknown",
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

      aoe_shape: getAoeShape(weapon_bag.area_effect?.area_info?.template_reference?.value),
      aoe_outer_radius: weapon_bag.area_effect?.area_info?.outer_radius || 0,
      aoe_outer_length: weapon_bag.area_effect?.area_info?.outer_length || 0,
      aoe_width: weapon_bag.area_effect?.area_info?.width || 0,

      aoe_damage_far: weapon_bag.area_effect?.damage?.far || 1,
      aoe_damage_mid: weapon_bag.area_effect?.damage?.mid || 1,
      aoe_damage_near: weapon_bag.area_effect?.damage?.near || 1,

      aoe_damage_friendly_far: weapon_bag.area_effect?.damage_friendly?.far ?? 0,
      aoe_damage_friendly_mid: weapon_bag.area_effect?.damage_friendly?.mid ?? 0,
      aoe_damage_friendly_near: weapon_bag.area_effect?.damage_friendly?.near ?? 0,
      aoe_has_friendly_fire: relicBoolean(weapon_bag.area_effect?.has_friendly_fire, false),

      aoe_suppression_far: weapon_bag.area_effect?.suppression?.far ?? 0,
      aoe_suppression_mid: weapon_bag.area_effect?.suppression?.mid ?? 0,
      aoe_suppression_near: weapon_bag.area_effect?.suppression?.near ?? 0,

      aim_time_multiplier_near: weapon_bag.aim?.aim_time_multiplier?.near || 1,
      aim_time_multiplier_mid: weapon_bag.aim?.aim_time_multiplier?.mid || 1,
      aim_time_multiplier_far: weapon_bag.aim?.aim_time_multiplier?.far || 1,

      fire_aim_time_min: weapon_bag.aim?.fire_aim_time?.min || 0,
      fire_aim_time_max: weapon_bag.aim?.fire_aim_time?.max || 0,

      behaviour_enable_auto_target_search:
        weapon_bag.behaviour?.enable_auto_target_search !== "False", //default to true

      burst_can_burst: weapon_bag.burst?.can_burst == "True" ? true : false,
      burst_duration_min: weapon_bag.burst?.duration?.min || 0,
      burst_duration_max: weapon_bag.burst?.duration?.max || 0,
      burst_duration_multiplier_near: weapon_bag.burst?.duration_multiplier?.near || 1,
      burst_duration_multiplier_mid: weapon_bag.burst?.duration_multiplier?.mid || 1,
      burst_duration_multiplier_far: weapon_bag.burst?.duration_multiplier?.far || 1,
      burst_focus_fire: weapon_bag.burst?.focus_fire == "True" ? true : false,
      burst_incremental_target_table_accuracy_multiplier:
        weapon_bag.burst?.incremental_target_table?.accuracy_multiplier || 0,
      burst_incremental_target_table_search_radius_near:
        weapon_bag.burst?.incremental_target_table?.search_radius?.near || 0,
      burst_incremental_target_table_search_radius_mid:
        weapon_bag.burst?.incremental_target_table?.search_radius?.mid || 0,
      burst_incremental_target_table_search_radius_far:
        weapon_bag.burst?.incremental_target_table?.search_radius?.far || 0,
      burst_rate_of_fire_min: weapon_bag.burst?.rate_of_fire?.min || 0,
      burst_rate_of_fire_max: weapon_bag.burst?.rate_of_fire?.max || 0,
      burst_rate_of_fire_multiplier_near: weapon_bag.burst?.rate_of_fire_multiplier?.near || 1,
      burst_rate_of_fire_multiplier_mid: weapon_bag.burst?.rate_of_fire_multiplier?.mid || 1,
      burst_rate_of_fire_multiplier_far: weapon_bag.burst?.rate_of_fire_multiplier?.far || 1,

      cooldown_duration_min: weapon_bag.cooldown?.duration?.min || 0,
      cooldown_duration_max: weapon_bag.cooldown?.duration?.max || 0,
      cooldown_duration_multiplier_near: weapon_bag.cooldown?.duration_multiplier?.near || 1,
      cooldown_duration_multiplier_mid: weapon_bag.cooldown?.duration_multiplier?.mid || 1,
      cooldown_duration_multiplier_far: weapon_bag.cooldown?.duration_multiplier?.far || 1,

      cover_table_tp_defcover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_defcover?.accuracy_multiplier || 1,
      cover_table_tp_defcover_damage_multiplier:
        weapon_bag.cover_table?.tp_defcover?.damage_multiplier || 1,
      cover_table_tp_defcover_penetration_multiplier:
        weapon_bag.cover_table?.tp_defcover?.penetration_multiplier || 1,
      cover_table_tp_defcover_cover_aim_time_multiplier:
        weapon_bag.cover_table?.tp_defcover?.aim_time_multiplier || 1,

      cover_table_tp_garrison_cover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_garrison_cover?.accuracy_multiplier || 1,
      cover_table_tp_garrison_cover_damage_multiplier:
        weapon_bag.cover_table?.tp_garrison_cover?.damage_multiplier || 1,
      cover_table_tp_garrison_cover_penetration_multiplier:
        weapon_bag.cover_table?.tp_garrison_cover?.penetration_multiplier || 1,
      cover_table_tp_garrison_cover_aim_time_multiplier:
        weapon_bag.cover_table?.tp_garrison_cover?.aim_time_multiplier || 1,

      cover_table_tp_heavy_cover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_heavy_cover?.accuracy_multiplier || 1,
      cover_table_tp_heavy_cover_damage_multiplier:
        weapon_bag.cover_table?.tp_heavy_cover?.damage_multiplier || 1,
      cover_table_tp_heavy_cover_penetration_multiplier:
        weapon_bag.cover_table?.tp_heavy_cover?.penetration_multiplier || 1,
      cover_table_tp_heavy_cover_aim_time_multiplier:
        weapon_bag.cover_table?.tp_heavy_cover?.aim_time_multiplier || 1,

      cover_table_tp_light_cover_accuracy_multiplier:
        weapon_bag.cover_table?.tp_light_cover?.accuracy_multiplier || 1,
      cover_table_tp_light_cover_damage_multiplier:
        weapon_bag.cover_table?.tp_light_cover?.damage_multiplier || 1,
      cover_table_tp_light_cover_penetration_multiplier:
        weapon_bag.cover_table?.tp_light_cover?.penetration_multiplier || 1,
      cover_table_tp_light_cover_aim_time_multiplier:
        weapon_bag.cover_table?.tp_light_cover?.aim_time_multiplier || 1,

      damage_damage_type: weapon_bag.damage?.damage_type || "",
      damage_min: weapon_bag.damage?.min || 0,
      damage_max: weapon_bag.damage?.max || 0,

      default_attack_type: weapon_bag.default_attack_type || "",

      deflection_damage_multiplier: weapon_bag.deflection?.deflection_damage_multiplier || 0,
      deflection_has_deflection_damage:
        weapon_bag.deflection?.has_deflection_damage == "True" ? true : false,

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

      projectile_id: projectileId,
      projectile_path: projectilePath,
      projectile_is_artillery: projectileType === "artillery",
      projectile_type: projectileType,

      range_distance_near: rangeDistance.near,
      range_distance_mid: rangeDistance.mid,
      range_distance_far: rangeDistance.far,

      range_min: rangeDistance.min,
      range_max: rangeDistance.max,

      range: {
        far: rangeDistance.far,
        mid: rangeDistance.mid,
        near: rangeDistance.near,
        min: rangeDistance.min,
        max: rangeDistance.max,
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
      scatter_distance_object_min: weapon_bag.scatter?.distance_scatter_obj_hit_min || 0,
      scatter_moving_scatter_angle_multiplier:
        weapon_bag.scatter?.movement_scatter_angle_multiplier ?? 1,
      scatter_moving_scatter_distance_multiplier:
        weapon_bag.scatter?.movement_scatter_distance_multiplier ?? 1,

      setup_time: weapon_bag.setup?.duration || 0,

      suppression_amount: weapon_bag.suppression?.amount || 0,
      suppression_nearby_suppression_multiplier:
        weapon_bag.suppression?.nearby_suppression_multiplier || 0,
      suppression_nearby_suppression_radius:
        weapon_bag.suppression?.nearby_suppression_radius || 0,
      //aoe_distance_object_min : weapon_bag.scatt
      target_type_table: [],

      tracking_normal_max_left: weapon_bag.tracking?.normal?.max_left || 0,
      tracking_normal_max_right: weapon_bag.tracking?.normal?.max_right || 0,
      tracking_normal_speed_horizontal: weapon_bag.tracking?.normal?.speed_horizontal || 0,

      teardown_time: weapon_bag.teardown?.duration || 0,
    },
  };

  if (weapon_bag.target_type_table)
    for (const target_types of weapon_bag.target_type_table) {
      weaponData.weapon_bag.target_type_table.push({
        unit_type: target_types.target_unit_type_multipliers?.unit_type || "",
        dmg_modifier: target_types.target_unit_type_multipliers?.base_damage_modifier ?? 0,
        accuracy_multiplier:
          target_types.target_unit_type_multipliers?.weapon_multipliers?.accuracy_multiplier ?? 1,
        penetration_multiplier:
          target_types.target_unit_type_multipliers?.weapon_multipliers?.penetration_multiplier ??
          1,
        damage_multiplier:
          target_types.target_unit_type_multipliers?.weapon_multipliers?.damage_multiplier ?? 1,
      });
    }

  return weaponData;
};

const getWeaponStats = async (patch = "latest", locale = "en") => {
  if (patch == config.latestPatch) patch = "latest";

  // Check if we already have the data for this patch and locale
  if (WeaponPatchData[patch]?.[locale]) return WeaponPatchData[patch][locale];

  const [myReqWeapon, myReqEbps] = await Promise.all([
    fetch(config.getPatchDataUrl("weapon.json", patch)),
    fetch(config.getPatchDataUrl("ebps.json", patch)),
  ]);

  const root = await myReqWeapon.json();
  const ebpsRoot = await myReqEbps.json();

  const projectileMap = getProjectileMetadataMap(ebpsRoot);

  const weaponSetAll: WeaponType[] = [];

  // Extract from JSON
  for (const obj in root) {
    const weaponSet = traverseTree(
      root[obj],
      isWeaponBagContainer,
      (filename: string, subtree: any, jsonPath: string, parent: string) =>
        mapWeaponData(filename, subtree, jsonPath, parent, locale, projectileMap),
      obj,
      obj,
    );

    // Filter relevant objects
    weaponSet.forEach((item: any) => {
      weaponSetAll.push(item);
    });
  }

  // Initialize nested structure if needed
  if (!WeaponPatchData[patch]) WeaponPatchData[patch] = {};
  WeaponPatchData[patch][locale] = weaponSetAll;

  return weaponSetAll;
};

const setWeaponStats = (weaponStats: WeaponType[], patch = "latest", locale = "en") => {
  if (!WeaponPatchData[patch]) WeaponPatchData[patch] = {};
  WeaponPatchData[patch][locale] = weaponStats;
};

const isWeaponBagContainer = (key: string, obj: any) => {
  // check if first child is weapon_bag
  return Object.keys(obj)[0] === "weapon_bag";
};

export { setWeaponStats, getWeaponStats, WeaponPatchData };
export type { WeaponType, RangeType };
