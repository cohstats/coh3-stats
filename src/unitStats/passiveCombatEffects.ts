import type { CustomizableUnit } from "./dpsCommon";
import type { WeaponStatsType } from "./mappingWeapon";

export const RANGER_FIRE_ON_MOVE_ABILITY = "ranger_fire_when_moving_passive_us";
export const getPassiveAccuracyMultiplier = (unit?: CustomizableUnit) =>
  unit?.rangerFireOnMove ? 1.2 : 1;
export const canFireOnMove = (weapon: WeaponStatsType, unit?: CustomizableUnit) =>
  Boolean(weapon.moving_can_fire_while_moving || unit?.rangerFireOnMove);
