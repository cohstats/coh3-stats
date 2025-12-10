/** Taken from the Essence Editor enums. */
export const WeaponClass = [
  "rifle",
  "flame",
  "hmg",
  "mortar",
  "at_gun",
  "bazooka",
  "cannon",
  "sniper",
  "lmg",
  "smg",
  "dummy",
  "rifle_grenade",
  "nebelwerfer",
  "throwing_knife",
  "panzerfaust",
  "cannon_burst",
  "mine",
  "panzerbuschse",
  "melee",
  "grenade_launcher",
  "artillery_small",
  "artillery_medium",
  "cannon_small",
  "construction_tool",
  "white_phosphorus",
  "smoke",
  "pistol",
  "minesweeper",
  "artillery_mobile",
] as const;

export const WeaponCategory = [
  "ballistic_weapon",
  "explosive_weapon",
  "flame_throwers",
  "small_arms",
  "campaign",
  "parent",
  "preroll_destruction",
  "unknown",
] as const;

/** --------------- INPUT SCHEMA FROM JSON --------------- */
export type WeaponBagSchema = {
  weapon_bag: WeaponBag;
  pbgid: number;
  parent_pbg: ParentPbg;
};

export type ParentPbg = {
  instance_reference: string;
};

export type WeaponBag = {
  accuracy: Accuracy;
  aim: Aim;
  anim_table: AnimTable;
  area_effect: AreaEffect;
  behaviour: Behaviour;
  burst: Burst;
  cooldown: Cooldown;
  damage: Damage;
  deflection: Deflection;
  fire: Fire;
  flinch_radius: number;
  fx_action_target_name: string;
  fx_always_visible: string;
  fx_building_hit_delay: number;
  fx_delay_in_building: number;
  fx_munition_name: string;
  fx_tracer_name: string;
  fx_tracer_speed: number;
  fx_use_building_panel_normal: string;
  help_text: HelpText;
  icon_name: string;
  moving: Moving;
  name: string;
  priority: Priority;
  projectile: Projectile;
  range: Range;
  reload: Reload;
  scatter: Scatter;
  setup: Setup;
  suppressed: Suppressed;
  suppression: Suppression;
  teardown: Teardown;
  tracking: Tracking;
  ui_name: HelpText;
  ui_range: ParentPbg;
  ui_setfacing: ParentPbg;
  penetration: Accuracy;
  ui_map_colour: UIMapColour;
  weapon_options: TemplateReferenceParentSchema;
  weapon_class: (typeof WeaponClass)[number];
  fx_aoe_munition_name: string;
  speech_code: string;
  target_type_table: TargetTypeTableItemSchema[];
  cover_table: CoverTable;
  fx_piercing_munition_name: string;
  charge_option: TemplateReferenceParentSchema;
  siege_option: TemplateReferenceParentSchema;
  brace_option: TemplateReferenceParentSchema;
  default_attack_type: string;
  animation_role_option: AnimationRoleOption;
  height_bonuses: HeightBonuses;
  fog_of_war: FogOfWar;
  kill_unit_types_on_hit: any[];
  avoid_blockers_of_relationship: AvoidBlockersOfRelationship;
  weapon_tags: any[];
  building_charring_settings: ParentPbg;
  audio: Audio;
  weapon_impact_modifier: number;
  conditional_table: any[];
};

type TargetTypeTableItemSchema = {
  target_unit_type_multipliers: TargetUnitTypeMultipliers;
};

export type TargetUnitTypeMultipliers = {
  unit_type: "destructible_object" | "bunker" | "infantry" | "building";
  weapon_multipliers: WeaponMultipliers;
  base_damage_modifier: number;
};

type WeaponMultipliers = {
  accuracy_multiplier: number;
  damage_multiplier: number;
  penetration_multiplier: number;
  suppression_multiplier: number;
};

export type Accuracy = {
  near: number;
  far: number;
  mid: number;
  template_reference?: TemplateReference;
  beyond_max_range_penalty?: number;
};

export type TemplateReference = {
  name: string;
  value: string;
};

export type Aim = {
  fire_aim_time: FireAimTime;
  post_firing_aim_time_seconds: number;
  post_firing_cooldown_interval_seconds: number;
  ready_aim_time: FireAimTime;
  aim_time_multiplier: Accuracy;
};

export type FireAimTime = {
  max: number;
  min: number;
};

export type AnimTable = {
  cooldown_time_name: string;
  state_name: string;
  track_horizontal: string;
  track_horizontal_speed: string;
  track_vertical: string;
  track_vertical_speed: string;
  variety_name: string;
  visibility_name: string;
  target_range_name: string;
  attack_speed_scale_name: string;
  attack_speed_scale_value: number;
  track_world_pos_x_name: string;
  track_world_pos_y_name: string;
  track_world_pos_z_name: string;
  ability_state: string;
};

export type AnimationRoleOption = {
  template_reference: TemplateReference;
  squad_animation_roles: SquadAnimationRole[];
};

export type SquadAnimationRole = {
  flavour: Flavour;
};

export type Flavour = {
  squad_contents: SquadContent[];
  key: string;
};

export type SquadContent = {
  squad_member: SquadMember;
};

export type SquadMember = {
  animation_variants: AnimationVariant[];
};

export type AnimationVariant = {
  animation_role: ParentPbg;
};

export type AreaEffect = {
  accuracy: Accuracy;
  area_info: AreaInfo;
  damage: Accuracy;
  damage_friendly: Accuracy;
  distance: Accuracy;
  has_friendly_fire: string;
  can_harm_shooter: string;
  suppression: Accuracy;
  suppression_friendly: Accuracy;
  damage_all_in_hold: string;
  aoe_penetration: Accuracy;
  damage_max_members_per_squad: number;
  aoe_origin_and_direction: string;
  fx: Fx;
  area_over_time_option: TemplateReferenceParentSchema;
  damage_own_units: Accuracy;
};

export type AreaInfo = {
  template_reference: TemplateReference;
  outer_radius: number;
  inner_radius: number;
  is_two_dimensional: string;
  dynamic_radius_type: string;
};

export type TemplateReferenceParentSchema = {
  template_reference: TemplateReference;
};

export type Fx = {
  exponential_distribution_lambda: number;
  num_randomized_ground_hit_fx: number;
};

export type Audio = {
  suppress_under_fire_callout: string;
};

export type AvoidBlockersOfRelationship = {
  undefined: string;
  enemy: string;
  ally: string;
  neutral: string;
};

export type Behaviour = {
  aa_weapon: string;
  aa_weapon_shoot_through: string;
  artillery_force_obey_los: string;
  attack_team_weapon_user: string;
  can_be_offhanded: string;
  can_be_substituted: string;
  combat_slot_offset: number;
  enable_auto_target_search: string;
  fire_at_building_combat_slot: string;
  ground_hit_rate: number;
  ignore_shot_blocking: string;
  non_moving_setup: string;
  point_blank: string;
  prevents_prone: string;
  reset_rotation_on_teardown: string;
  single_handed_weapon: string;
  substitute_weapon: string;
  support_weapon: string;
  surprises_idle: string;
  piercing: string;
  reaction_radius: number;
  causes_combat: string;
  can_abort_winddown_on_weapon_switch: string;
  reaction_type: string;
  ignore_relations: string;
  wants_prone_firing_option: TemplateReferenceParentSchema;
  attack_ground_type: string;
  hit_pos_behaviour: string;
  non_moving_setup_requires_facing: string;
  hit_everything_on_miss: string;
  can_damage_allies: string;
  hit_everything_on_hit: string;
  can_abort_winddown_on_move_command: string;
  share_parent_anim: string;
  copy_transform_on_equip: string;
  aa_range_multiplier: number;
  can_only_fire_once_while_out_of_control: string;
  target_selection_prioritizes_hold: string;
};

export type Burst = {
  can_burst: string;
  duration: FireAimTime;
  incremental_target_table: IncrementalTargetTable;
  rate_of_fire: FireAimTime;
  duration_multiplier: Accuracy;
  rate_of_fire_multiplier: Accuracy;
  focus_fire: string;
  convert_target_to_position_before_firing: string;
};

export type IncrementalTargetTable = {
  accuracy_multiplier: number;
  search_radius: Accuracy;
};

export type Cooldown = {
  duration: FireAimTime;
  duration_multiplier: Accuracy;
  persistent_cooldownticks: string;
};

export type CoverTable = {
  tp_defcover: TpDefcover;
  tp_heavy_cover: TpDefcover;
  tp_light_cover: TpDefcover;
  tp_negative_cover: TpDefcover;
  tp_water_cover: TpDefcover;
  tp_smoke_cover: TpDefcover;
  tp_garrison_cover: TpDefcover;
  tp_trench_cover: TpDefcover;
  tp_road_light_cover: TpDefcover;
  tp_road_heavy_cover: TpDefcover;
};

export type TpDefcover = {
  template_reference?: TemplateReference;
  accuracy_multiplier: number;
  damage_multiplier: number;
  penetration_multiplier: number;
  suppression_multiplier: number;
};

export type Damage = {
  max: number;
  min: number;
  damage_type: string;
  allow_overkill: string;
  on_penetrated_state_trees: OnPenetratedStateTree[];
  on_deflected_state_trees: any[];
  post_damage_state_trees: any[];
  damage_target_requirement: string;
  enable_damage_modifiers: string;
};

export type OnPenetratedStateTree = {
  container: Container;
};

export type Container = {
  state_tree: string;
};

export type Deflection = {
  deflection_damage_multiplier: number;
  has_deflection_damage: string;
};

export type Fire = {
  wind_down: number;
  wind_up: number;
  advanced: Advanced;
};

export type Advanced = {
  wind_up_overtime: number;
  fire: number;
  fire_delay: number;
  scale_fire_animation_using_actual_sim_time: string;
};

export type FogOfWar = {
  reveal_self_on_attack: string;
  reveal_target_on_hit: string;
};

export type HeightBonuses = {
  height_advantage: HeightAdvantage;
  height_disadvantage: HeightDisadvantage;
  low_height_threshold: number;
};

export type HeightAdvantage = {
  height_threshold: number;
  multipliers: TpDefcover;
  negates_cover: string;
};

export type HeightDisadvantage = {
  height_threshold: number;
  multipliers: TpDefcover;
};

export type HelpText = {
  locstring: TemplateReference;
};

export type Moving = {
  accuracy_multiplier: number;
  burst_multiplier: number;
  cooldown_multiplier: number;
  can_fire_while_moving: string;
  moving_end_time: number;
  moving_start_time: number;
};

export type Priority = {
  current_target: number;
  distance: Accuracy;
  rotation: number;
  window_bonus: number;
  penetration: number;
  suggested_target: number;
  over_penetration_priority_penalty: string;
  vs_armor_type: number;
  target: Target;
  current_target_squad: number;
  randomly_target_squad_mates_of_best_priority_entity: string;
  untargeted_by_formation_melee: number;
  untargeted_by_formation_ranged: number;
};

export type Target = {
  vs_armor_type: number;
  dps: number;
  penetration: number;
  current_health_percentage: number;
  in_cover: number;
  max_health: number;
  out_of_los: number;
};

export type Projectile = {
  delete_previous_on_hit: string;
  projectile: ParentPbg;
  terrain_elevation_option: TemplateReferenceParentSchema;
  midair_detonation_height: number;
};

export type Range = {
  max: number;
  min: number;
  distance: Accuracy;
  max_height: number;
  max_animation_angle_distance: number;
  attack_move_stop_offset: number;
};

export type Reload = {
  duration: FireAimTime;
  duration_multiplier: Accuracy;
  frequency: FireAimTime;
  require_reload_after_switch: string;
  persistent_reloadticks: string;
  weapon_reload_behavior_on_blueprint_convert: string;
};

export type Scatter = {
  angle_scatter: number;
  burst_pattern_enable: string;
  delay_bracket_change_chance: number;
  distance_bracket_count_air: number;
  distance_bracket_count_ground: number;
  distance_scatter_max: number;
  distance_scatter_obj_hit_min: number;
  distance_scatter_offset: number;
  distance_scatter_ratio: number;
  fow_angle_multiplier: number;
  fow_distance_multiplier: number;
  max_tilt_angle: number;
  min_tilt_angle: number;
  tilt_max_distance: number;
  tilt_scatter_chance: number;
  area_scatter_option: TemplateReferenceParentSchema;
  distance_guaranteed_before_hit_percentage: number;
  movement_scatter_angle_multiplier: number;
  movement_scatter_distance_multiplier: number;
  min_distance_collision_height_offset: number;
};

export type Setup = {
  duration: number;
  has_instant_setup: string;
  can_interrupt_setup: string;
  attach_duration: number;
  requires_aim_elevation: string;
};

export type Suppressed = {
  pinned_burst_multiplier: number;
  pinned_cooldown_multiplier: number;
  pinned_reload_multiplier: number;
  suppressed_burst_multiplier: number;
  suppressed_cooldown_multiplier: number;
  suppressed_reload_multiplier: number;
};

export type Suppression = {
  nearby_suppression_multiplier: number;
  nearby_suppression_radius: number;
  target_pinned_multipliers: TpDefcover;
  target_suppressed_multipliers: TpDefcover;
  amount: number;
};

export type Teardown = {
  duration: number;
};

export type Tracking = {
  fire_cone_angle: number;
  normal: Normal;
  pivot_end_time: number;
  pivot_only: string;
  pivot_start_time: number;
  fire_cone_angle_vert: number;
  horizontal_tracking_relies_on_parent_facing: string;
};

export type Normal = {
  max_down: number;
  max_left: number;
  max_right: number;
  max_up: number;
  speed_horizontal: number;
  speed_vertical: number;
};

export type UIMapColour = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};
