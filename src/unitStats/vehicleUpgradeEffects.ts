import type { CustomizableUnit, WeaponMember } from "./dpsCommon";
import type { WeaponStatsType } from "./mappingWeapon";
import { hasScatterAoe } from "./scatterSimulation";

/**
 * Per-attacker Compare Mode upgrade toggles. Values currently come from the
 * upgrade definitions supplied by Emma
 *
 * Heavy Barrels (improved_vehicle_machine_guns_us): 25% burst RoF, +5m range.
 * DAK Armored Support (armored_support_coax_upgrade_ak): +50% damage on
 * entity combat_ext hardpoints 1 and 2 (0-based). Pintles are not included.
 */
export const VEHICLE_MG_UPGRADE_VALUES = {
  heavyBarrelsBurstRateMultiplier: 1.25,
  heavyBarrelsRangeAddition: 5,
  dakCoaxHullDamageMultiplier: 1.5,
} as const;

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
  const heavyBarrels = Boolean(attacker.heavyBarrelsEnabled && isMg);
  const dakCoaxHull = Boolean(
    attacker.dakCoaxUpgradeEnabled &&
    (member.hardpointIndex === 1 || member.hardpointIndex === 2),
  );

  return {
    burstRateMultiplier: heavyBarrels
      ? VEHICLE_MG_UPGRADE_VALUES.heavyBarrelsBurstRateMultiplier
      : 1,
    rangeAddition: heavyBarrels ? VEHICLE_MG_UPGRADE_VALUES.heavyBarrelsRangeAddition : 0,
    damageMultiplier: dakCoaxHull ? VEHICLE_MG_UPGRADE_VALUES.dakCoaxHullDamageMultiplier : 1,
  };
};

/** Never mutate the raw weapon data: two identical attackers may have different upgrades. */
export const getUpgradedVehicleWeaponBag = (
  member: WeaponMember,
  attacker?: CustomizableUnit,
): WeaponStatsType => {
  const bag = member.weapon.weapon_bag;
  const { burstRateMultiplier, rangeAddition } = getVehicleWeaponUpgradeEffects(member, attacker);
  if (burstRateMultiplier === 1 && rangeAddition === 0) return bag;

  // Additive range shifts the near/mid/far distance profile and maximum, but
  // never the minimum range or any of the scatter parameters.
  const shifted = (value: number) => (value < 0 ? value : value + rangeAddition);
  return {
    ...bag,
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
