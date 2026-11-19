import type { CustomizableUnit, WeaponMember } from "./dpsCommon";
import type { WeaponStatsType } from "./mappingWeapon";
import { hasScatterAoe } from "./scatterSimulation";

export type VehicleWeaponUpgradeEffects = {
  burstRateMultiplier: number;
  rangeAddition: number;
  damageMultiplier: number;
};

export const getVehicleWeaponUpgradeEffects = (
  member: WeaponMember,
  attacker?: CustomizableUnit,
): VehicleWeaponUpgradeEffects => {
  if (!attacker || attacker.unit_type !== "vehicles") {
    return { burstRateMultiplier: 1, rangeAddition: 0, damageMultiplier: 1 };
  }

  // The DPS tool's agreed simple grouping: AoE = main gun, non-AoE = MG.
  const isMg = !hasScatterAoe(member.weapon.weapon_bag);
  const heavyBarrels = attacker.heavyBarrelsEnabled && isMg ? attacker.heavyBarrels : undefined;
  const dakCoaxHull = Boolean(
    attacker.dakCoaxUpgradeEnabled &&
    (member.hardpointIndex === 1 || member.hardpointIndex === 2),
  );

  return {
    burstRateMultiplier: heavyBarrels?.burstRateMultiplier ?? 1,
    rangeAddition: heavyBarrels?.rangeAddition ?? 0,
    damageMultiplier: dakCoaxHull ? (attacker.superiorFireDrillsDamageMultiplier ?? 1) : 1,
  };
};

/** Never mutate the raw weapon data: two identical attackers may have different upgrades. */
export const getUpgradedVehicleWeaponBag = (
  member: WeaponMember,
  attacker?: CustomizableUnit,
): WeaponStatsType => {
  const bag = member.weapon.weapon_bag;
  const { burstRateMultiplier, rangeAddition } = getVehicleWeaponUpgradeEffects(member, attacker);
  const forceFireOnMove = Boolean(attacker?.rangerFireOnMove);
  if (burstRateMultiplier === 1 && rangeAddition === 0 && !forceFireOnMove) return bag;

  // Additive range shifts the near/mid/far distance profile and maximum, but
  // never the minimum range or any of the scatter parameters.
  const shifted = (value: number) => (value < 0 ? value : value + rangeAddition);
  return {
    ...bag,
    moving_can_fire_while_moving: bag.moving_can_fire_while_moving || forceFireOnMove,
    burst_rate_of_fire_min: bag.burst_rate_of_fire_min * burstRateMultiplier,
    burst_rate_of_fire_max: bag.burst_rate_of_fire_max * burstRateMultiplier,
    range_min: bag.range_min,
    range_max: bag.range_max + rangeAddition,
    range_distance_near: shifted(bag.range_distance_near),
    range_distance_mid: shifted(bag.range_distance_mid),
    range_distance_far: shifted(bag.range_distance_far),
    range: {
      ...bag.range,
      near: shifted(bag.range.near),
      mid: shifted(bag.range.mid),
      far: shifted(bag.range.far),
      max: bag.range.max + rangeAddition,
    },
  };
};
