import {
  getBaseDistanceForDisplayedRange,
  getDisplayedWeaponMaxRange,
  type CustomizableUnit,
  type WeaponMember,
} from "./dpsCommon";
import { getEffectiveWeaponStats, getSingleWeaponDPS, getWeaponTiming } from "./weaponLib";
import { getUpgradedVehicleWeaponBag } from "./vehicleUpgradeEffects";
import { canFireOnMove } from "./passiveCombatEffects";

/** Prepared only for an open hover, with a bounded curve for one weapon. */
export const getDpsWeaponPreview = (member: WeaponMember, unit: CustomizableUnit) => {
  const bag = getUpgradedVehicleWeaponBag(member, unit);
  const max = getDisplayedWeaponMaxRange(unit, member);
  const steps = Math.max(1, Math.min(200, Math.ceil(max)));
  const single = { ...member, num: 1 };
  return {
    weapon: { ...member.weapon, weapon_bag: getEffectiveWeaponStats(member, unit) },
    timingAtRange: (distance: number) =>
      unit.is_moving && !canFireOnMove(bag, unit)
        ? { rpm: 0, burstDuration: 0, timeBetweenBurstsCooldown: 0, timeBetweenBurstsReload: 0 }
        : getWeaponTiming(
            bag,
            getBaseDistanceForDisplayedRange(unit, distance),
            unit.is_moving,
            unit,
          ),
    curve: Array.from({ length: steps + 1 }, (_, index) => {
      const x = (index * max) / steps;
      return {
        x,
        y:
          x < bag.range_min
            ? 0
            : getSingleWeaponDPS(
                single,
                getBaseDistanceForDisplayedRange(unit, x),
                unit.is_moving,
                undefined,
                unit,
                undefined,
                false,
                x,
              ),
      };
    }),
  };
};
