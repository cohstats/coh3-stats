/**
 * Building types found at `ebps/unit_type_list/unit_type` of each building.
 *
 * These are the common ones used in multiplayer. There are special ones
 * (probably campaign only).
 *
 * @todo Check if the support centers (the arrow up icon), contain the
 * `support_center` type or if missing as special entity.
 */
export type BuildingType =
  | "support_center"
  | "hq"
  | "production1"
  | "production2"
  | "production3"
  | "production4";

/** The key is the enum within the game for the building type. The value is the icon name. */
export const BuildingIcon: Record<BuildingType, string> = {
  support_center: "support_center",
  hq: "hq",
  production1: "barracks",
  production2: "weapon_support",
  production3: "motor_pool",
  production4: "tank_depot",
};
