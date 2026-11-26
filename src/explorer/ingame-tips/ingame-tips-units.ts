/**
 * Which in-game tips are relevant for which kind of unit.
 *
 * The data file only groups the tips by `topic` (too coarse - `combat` mixes infantry cover tips
 * with tanks crushing cover) and `category`. So the mapping is done here, per category, with a
 * few per-tip overrides for the categories which mix unit kinds.
 *
 * Tips of categories which are not listed here (controls, resources, command cards, ...) are not
 * about a kind of unit, so they are never shown on a unit page. A new category in the data file is
 * therefore simply ignored until it gets mapped.
 */

import type { IngameTip } from "./ingame-tips-types";

/**
 * Kind of unit a tip applies to. The first four are the `unitType` values of the sbps data
 * (the folder the squad lives in), `engineer` is an engineer / pioneer / sapper squad - see
 * `isEngineerUnit`.
 */
type IngameTipUnitGroup = "infantry" | "team_weapons" | "vehicles" | "emplacements" | "engineer";

const MOBILE: IngameTipUnitGroup[] = ["infantry", "team_weapons", "vehicles"];

const TIP_CATEGORY_UNIT_GROUPS: Record<string, IngameTipUnitGroup[]> = {
  accuracy: MOBILE,
  antiair: ["emplacements", "vehicles"],
  armor: ["vehicles"],
  artillery: ["team_weapons", "vehicles", "emplacements"],
  attackmove: ["infantry", "vehicles"],
  barbedwire: ["engineer"],
  breach: ["infantry"],
  capture: ["infantry", "vehicles"],
  cover: ["infantry", "team_weapons"],
  crewshock: ["vehicles"],
  engineer: ["engineer"],
  experience: MOBILE,
  explosives: ["engineer"],
  facing: ["team_weapons", "vehicles"],
  fire: ["infantry"],
  garrison: ["infantry", "team_weapons"],
  grenades: ["infantry"],
  health: ["infantry", "team_weapons"],
  holdfire: ["infantry", "team_weapons"],
  indirect: ["team_weapons", "vehicles"],
  los: MOBILE,
  move: ["infantry", "vehicles"],
  prioritize: ["vehicles", "team_weapons"],
  restore: ["vehicles"],
  retreat: ["infantry", "team_weapons"],
  smoke: MOBILE,
  suppress: ["infantry", "team_weapons"],
  transport: ["infantry", "vehicles"],
  veterancy: MOBILE,
  weapons: ["infantry"],
};

/** Tips whose text is about a different kind of unit than the rest of their category. */
const TIP_ID_UNIT_GROUPS: Record<string, IngameTipUnitGroup[]> = {
  // Where to paradrop when the enemy has anti-air - not about a kind of unit.
  tipantiair2: [],
  // Vehicles crushing cover / tanks used as cover.
  tipcover8: ["vehicles"],
  tipcover9: ["vehicles"],
  tipcover10: ["vehicles"],
  // Vehicles with fixed forward guns.
  tipfacing3: ["vehicles"],
  // Mortars vs garrisons, Hazard Removal Kits of engineers.
  tipgarrison4: ["team_weapons"],
  tipgarrison9: ["engineer"],
  tipindirect2: ["team_weapons"],
  // Vehicles on roads / heavy infantry weapons can't fire on the move.
  tipmove2: ["vehicles"],
  tipmove3: ["infantry"],
};

const getIngameTipUnitGroups = (tip: Pick<IngameTip, "id" | "category">): IngameTipUnitGroup[] =>
  TIP_ID_UNIT_GROUPS[tip.id] ?? TIP_CATEGORY_UNIT_GROUPS[tip.category] ?? [];

type IngameTipUnit = {
  /** `unitType` of the squad, eg. `infantry`, `vehicles`. */
  unitType: string;
  /** Engineer / pioneer / sapper squad, use `isEngineerUnit` to find out. */
  isEngineer?: boolean;
};

/**
 * Whether the squad is an engineer type of unit. Being able to construct is not enough - plenty of
 * line infantry (eg. Grenadiers) can build sandbags and wire, while the engineering tips talk about
 * tank traps, mines and repairs. The engineers are the infantry squads which can repair.
 */
const isEngineerUnit = (unitType: string, abilityIds: string[]): boolean =>
  unitType === "infantry" && abilityIds.some((id) => id.startsWith("repair_"));

/** The unit groups a unit belongs to. */
const getUnitIngameTipGroups = ({ unitType, isEngineer }: IngameTipUnit) => {
  const groups = new Set<string>([unitType]);
  if (isEngineer) groups.add("engineer");
  return groups;
};

/**
 * The generic (`gameMode: null`) tips which are relevant for the given unit, in the order of the
 * data file. Empty for a unit type no tip is mapped to.
 */
const filterIngameTipsForUnit = <T extends Pick<IngameTip, "id" | "category" | "gameMode">>(
  tips: T[],
  unit: IngameTipUnit,
): T[] => {
  const unitGroups = getUnitIngameTipGroups(unit);

  return tips.filter(
    (tip) =>
      tip.gameMode === null && getIngameTipUnitGroups(tip).some((group) => unitGroups.has(group)),
  );
};

export {
  TIP_CATEGORY_UNIT_GROUPS,
  filterIngameTipsForUnit,
  getIngameTipUnitGroups,
  isEngineerUnit,
};
export type { IngameTipUnit, IngameTipUnitGroup };
