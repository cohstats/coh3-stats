export type raceType = "german" | "american" | "dak" | "british";

export type leaderBoardType = "1v1" | "2v2" | "3v3" | "4v4";

export type raceID = 129494 | 137123 | 197345 | 198437 | 203852;

type RelicAPIResult = {
  code: number;
  message: string;
};

type RawPlayerProfile = {
  profile_id: number;
  name: string; // /steam/bulshit
  alias: string;
  personal_statgroup_id?: number;
  xp?: number;
  level: number;
  leaderboardregion_id?: number;
  country: string;
};

export type RawStatGroup = {
  id: number;
  name?: string; // empty
  type?: number;
  members: Array<RawPlayerProfile>;
};

export type RawLeaderboardStat = {
  statgroup_id: number;
  leaderboard_id: number;
  wins: number;
  losses: number;
  streak: number;
  disputes: number;
  drops: number;
  rank: number;
  ranktotal?: number;
  regionrank?: number;
  ranklevel: number;
  rating: number;
  regionranktotal?: number;
  lastmatchdate: number;
};

export interface RawLaddersObject extends LaddersDataObject {
  result?: RelicAPIResult;
}

export interface LaddersDataObject {
  leaderboardStats: Array<RawLeaderboardStat>;
  statGroups: Array<RawStatGroup>;
  rankTotal: number;
}

export interface LaddersDataArrayObject extends RawLeaderboardStat {
  change: number | string;
  members: Array<Record<string, any>>;
}

export interface COH3StatsPlayerInfoAPI {
  COH3PlayTime: null;
  RelicProfile: {
    leaderboardStats: Array<RawLeaderboardStat>;
    statGroups: Array<RawStatGroup>;
  };
  SteamProfile: Record<string, { steamid: string; profileurl: string; avatarmedium: string }>;
}

export type InternalStandings = Record<
  "german" | "american" | "dak" | "british",
  Record<"1v1" | "2v2" | "3v3" | "4v4", RawLeaderboardStat | null>
>;

export type PlayerCardDataType = {
  steamData: { steamid: string; profileurl: string; avatarmedium: string };
  COH3PlayTime: null;
  standings: InternalStandings;
  info: { country: string; level: number; name: string; xp: number | undefined };
};

export interface WeaponsData {
  afrika_korps: Partial<WeaponTypes>;
  american: Partial<WeaponTypes>;
  british: Partial<WeaponTypes>;
  british_africa: Partial<WeaponTypes>;
  common: Partial<WeaponTypes>;
  dev: Partial<WeaponTypes>;
  german: Partial<WeaponTypes>;
}

export interface WeaponTypes {
  ballistic_weapon: BallisticWeapon;
  explosive_weapon: ExplosiveWeapon;
  campaign: Record<string, WeaponData>;
  flame_throwers: Record<string, WeaponData>;
  small_arms: Record<string, WeaponData>;
  special: Record<string, WeaponData>;
}

export interface ExplosiveWeapon {
  grenade: WeaponData;
  heavy_artillery: WeaponData;
  light_artillery: WeaponData;
  mine: WeaponData;
  mortar: WeaponData;
}

export interface BallisticWeapon {
  anti_tank_gun: WeaponData;
  infantry_anti_tank_weapon: WeaponData;
  tank_gun: WeaponData;
}

export interface WeaponData {
  weapon_bag: WeaponBag;
  pbgid: number;
}

export interface WeaponBag {
  accuracy: Accuracy;
  aim: Aim;
  anim_table: AnimTable;
  area_effect: AreaEffect;
  behaviour: Behaviour;
  damage: Damage;
  deflection: Deflection;
  fire: Fire;
  fx_always_visible: string;
  fx_munition_name: string;
  fx_use_building_panel_normal: string;
  moving: Moving;
  priority: Priority;
  projectile: Projectile;
  range: Range;
  reload: Reload;
  scatter: Scatter;
  setup: SetupOrTeardown;
  suppressed: Suppressed;
  suppression: Suppression;
  teardown: SetupOrTeardown;
  tracking: Tracking;
  ui_name: UiNameOrHelpText;
  ui_setfacing: ProjectileOrAnimationRoleOrUiSetfacingOrParentPbgOrUiRangeOrBuildingCharringSettings;
  penetration: Penetration;
  weapon_class: string;
  target_type_table?: TargetTypeTableEntity[] | null;
  cover_table: CoverTable;
  default_attack_type: string;
  animation_role_option: AnimationRoleOption;
  height_bonuses: HeightBonuses;
  icon_name?: string;
}

export interface Accuracy {
  near: number;
  far: number;
  mid: number;
}

export interface Aim {
  fire_aim_time: FireAimTime;
  post_firing_aim_time_seconds: number;
  aim_time_multiplier: AimTimeMultiplier;
}

export interface FireAimTime {
  max: number;
  min: number;
}

export interface AimTimeMultiplier {
  far: number;
  mid: number;
}

export interface AnimTable {
  state_name: string;
  track_horizontal: string;
  track_vertical: string;
}
export interface AreaEffect {
  accuracy: Penetration;
  area_info: AreaInfo;
  damage: Damage;
  damage_friendly: Penetration;
  distance: Penetration;
  has_friendly_fire: string;
  aoe_penetration: AoePenetration;
}
export interface AreaInfo {
  template_reference: TemplateReferenceOrLocstring;
  outer_radius: number;
  inner_radius: number;
  is_two_dimensional: string;
  dynamic_radius_type: string;
}
export interface TemplateReferenceOrLocstring {
  name: string;
  value: string;
}
export interface AoePenetration {
  template_reference: TemplateReferenceOrLocstring;
  far: number;
  mid: number;
  near: number;
}
export interface Behaviour {
  combat_slot_offset: number;
  enable_auto_target_search: string;
  ground_hit_rate: number;
  non_moving_setup: string;
  reaction_radius: number;
  attack_ground_type: string;
  non_moving_setup_requires_facing: string;
  can_damage_allies: string;
}
export interface Damage {
  max: number;
  min: number;
  damage_type: string;
}
export interface Deflection {
  deflection_damage_multiplier: number;
  has_deflection_damage: string;
}
export interface Fire {
  wind_down: number;
}
export interface Moving {
  accuracy_multiplier: number;
  moving_end_time: number;
  moving_start_time: number;
}
export interface Priority {
  current_target: number;
  distance: DistanceOrAimTimeMultiplierOrDamageOrAccuracy;
  rotation: number;
  penetration: number;
  suggested_target: number;
  vs_armor_type: number;
}
export interface DistanceOrAimTimeMultiplierOrDamageOrAccuracy {
  near: number;
  mid: number;
}
export interface Projectile {
  projectile: ProjectileOrAnimationRoleOrUiSetfacingOrParentPbgOrUiRangeOrBuildingCharringSettings;
}
export interface ProjectileOrAnimationRoleOrUiSetfacingOrParentPbgOrUiRangeOrBuildingCharringSettings {
  instance_reference: string;
}
export interface Range {
  max: number;
  distance: Penetration;
}
export interface Reload {
  duration: Duration;
  require_reload_after_switch: string;
}
export interface Scatter {
  angle_scatter: number;
  distance_scatter_max: number;
  distance_scatter_offset: number;
  distance_scatter_ratio: number;
  fow_angle_multiplier: number;
  fow_distance_multiplier: number;
}
export interface SetupOrTeardown {
  duration: number;
}
export interface Suppressed {
  pinned_burst_multiplier: number;
  pinned_cooldown_multiplier: number;
  pinned_reload_multiplier: number;
  suppressed_burst_multiplier: number;
  suppressed_cooldown_multiplier: number;
  suppressed_reload_multiplier: number;
}
export interface Suppression {
  target_pinned_multipliers: TargetPinnedMultipliersOrTargetSuppressedMultipliersOrWeaponMultipliersOrMultipliers;
  target_suppressed_multipliers: TargetPinnedMultipliersOrTargetSuppressedMultipliersOrWeaponMultipliersOrMultipliers;
}
export interface TargetPinnedMultipliersOrTargetSuppressedMultipliersOrWeaponMultipliersOrMultipliers {
  accuracy_multiplier: number;
  damage_multiplier: number;
  penetration_multiplier: number;
  suppression_multiplier: number;
}
export interface Tracking {
  fire_cone_angle: number;
  normal: Normal;
}
export interface Normal {
  max_left: number;
  max_right: number;
  max_up: number;
  speed_horizontal: number;
  speed_vertical: number;
}
export interface UiNameOrHelpText {
  locstring: TemplateReferenceOrLocstring;
}
export interface TargetTypeTableEntity {
  target_unit_type_multipliers: TargetUnitTypeMultipliers;
}
export interface TargetUnitTypeMultipliers {
  unit_type: string;
  weapon_multipliers: TargetPinnedMultipliersOrTargetSuppressedMultipliersOrWeaponMultipliersOrMultipliers;
  base_damage_modifier: number;
}
export interface CoverTable {
  tp_heavy_cover: TpHeavyCoverOrTpNegativeCoverOrTpGarrisonCover;
  tp_light_cover: TpLightCoverOrTpSmokeCover;
  tp_negative_cover: TpHeavyCoverOrTpNegativeCoverOrTpGarrisonCover;
  tp_smoke_cover: TpSmokeCoverOrTpLightCoverOrTpNegativeCoverOrTpHeavyCover;
  tp_garrison_cover: TpHeavyCoverOrTpNegativeCoverOrTpGarrisonCover;
}
export interface TpHeavyCoverOrTpNegativeCoverOrTpGarrisonCover {
  template_reference: TemplateReferenceOrLocstring;
  accuracy_multiplier: number;
  damage_multiplier: number;
  suppression_multiplier: number;
}
export interface TpLightCoverOrTpSmokeCover {
  template_reference: TemplateReferenceOrLocstring;
  accuracy_multiplier: number;
  suppression_multiplier: number;
}
export interface TpSmokeCoverOrTpLightCoverOrTpNegativeCoverOrTpHeavyCover {
  template_reference: TemplateReferenceOrLocstring;
  accuracy_multiplier: number;
}
export interface AnimationRoleOption {
  template_reference: TemplateReferenceOrLocstring;
  squad_animation_roles?: SquadAnimationRolesEntity[] | null;
}
export interface SquadAnimationRolesEntity {
  flavour: Flavour;
}
export interface Flavour {
  squad_contents?: SquadContentsEntity[] | null;
  key: string;
}
export interface SquadContentsEntity {
  squad_member: SquadMember;
}
export interface SquadMember {
  animation_variants?: AnimationVariantsEntity[] | null;
}
export interface AnimationVariantsEntity {
  animation_role: ProjectileOrAnimationRoleOrUiSetfacingOrParentPbgOrUiRangeOrBuildingCharringSettings;
}
export interface HeightBonuses {
  height_advantage: HeightAdvantageOrHeightDisadvantage;
}
export interface HeightAdvantageOrHeightDisadvantage {
  height_threshold: number;
}

export interface ReloadOrCooldown {
  duration: Duration;
}

export interface Setup {
  has_instant_setup: string;
  can_interrupt_setup: string;
}

export interface HeightAdvantage {
  height_threshold: number;
  multipliers: MultipliersOrMoving;
  negates_cover: string;
}
export interface MultipliersOrMoving {
  accuracy_multiplier: number;
}

export interface Range {
  max: number;
}

export interface Duration {
  max: number;
  min: number;
}

export interface Penetration {
  near: number;
  far: number;
  mid: number;
}

export interface Damage {
  far: number;
  mid: number;
}
