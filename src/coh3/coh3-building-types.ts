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
