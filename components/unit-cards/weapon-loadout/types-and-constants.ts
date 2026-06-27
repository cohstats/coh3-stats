import { WeaponStatsType } from "../../../src/unitStats";

// ============================================================================
// Types
// ============================================================================

export type WeaponCardInput = {
  id: string;
  icon_name: string; // icon path in game
  // faction: string;
  weapon_bag: WeaponStatsType;
  weapon_class: string;
  weapon_cat: string;
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
};

export type WeaponCardContext = {
  source?: "loadout" | "upgrade" | "ability";
  abilityNumShots?: number | null;
};

export type TargetType = WeaponStatsType["target_type_table"][number];

export type OwnUnitAoeDamageSource = "friendly" | "enemy" | "custom" | "none";

export type AoeFalloffValues = {
  near: number;
  mid: number;
  far: number;
};

export type CoverModifierRow = {
  label: string;
  accuracy: number;
  damage: number;
  aimTime: number;
  icon?: string;
};

export type RangeStatRowConfig = {
  label: string;
  tooltip?: string;
  near: React.ReactNode;
  mid: React.ReactNode;
  far: React.ReactNode;
  show?: boolean;
};

export type CompactStatItemConfig = {
  label: string;
  tooltip?: string;
  value: React.ReactNode;
  icon?: string;
  alt?: string;
  show?: boolean;
};

export type AoeDatasetOptions = {
  yAxisID?: "yDamage" | "ySuppression";
  borderWidth?: number;
  borderDash?: number[];
  order?: number;
};

// ============================================================================
// Constants
// ============================================================================

export const WeaponCardIcons = {
  damage: "/icons/unit_status/bw2/8_damagebonus.png",
  deflection_damage: "/icons/unit_status/bw2/anti_tank.png",
  reload_frequency: "/icons/unit_status/bw2/ammo_swap.png",
  aim_time: "/icons/unit_status/bw2/9_markedtarget.png",
  range: "/icons/unit_status/bw2/range_boost.png",
  aoe_size: "/icons/unit_status/bw2/flame.png",
  traverse_speed: "/icons/unit_status/bw2/skorpion.png",
  firing_arc: "/icons/unit_status/bw2/artillery_radio_beacon.png",
  setup_time: "/icons/unit_status/bw2/deploying.png",
  teardown_time: "/icons/races/common/symbols/building_support_center.png",
  suppression: "/icons/unit_status/bw2/suppression.png",
  suppression_radius: "/icons/unit_status/bw2/suppressive_fire.png",
  incremental_accuracy: "/icons/unit_status/bw2/accuracy_buff.png",
  detonation_delay: "/icons/common/resources/resource_buildtime_extra.png",
  projectile_travel_time: "/icons/unit_status/bw2/designated_artillery_overwatch_active.png",
  projectile_avoidance_arc_max:
    "/icons/unit_status/bw2/designated_artillery_overwatch_active.png",
} as const;

export const PROJECTILE_LAUNCH_HEIGHT = 2;
export const BASE_GRAVITY = 9.8;
export const MIN_PROJECTILE_SPEED_INCREMENT = 0.1;
export const DEFAULT_PROJECTILE_SPEED_INCREMENT = 0.5;
