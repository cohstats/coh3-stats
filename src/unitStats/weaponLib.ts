import { CustomizableUnit, getCoverMultiplier, WeaponMember } from "./dpsCommon";
import { RangeType, WeaponStatsType } from "./mappingWeapon";

const getSingleWeaponDPS = (
  weapon_member: WeaponMember,
  distance = 0,
  isMoving = false,
  target_unit?: CustomizableUnit,
  attacking_unit?: CustomizableUnit,
) => {
  //Formular: Hitchance * RateOfFire * Damage * ChanceToDamage(E.g. penetration)
  // since we assume it is an endless engagement we also encounter reload time
  // end we ignore intial time to setup the gun before starting the engagement.
  // Thus we compute: DamagePerClip/(TimeToEmptyClip+ReloadTime)
  // The default target size is 1. Possibly this can be parametrized
  // in future

  /* initialize variables */

  const qty = weapon_member.num;

  if (qty <= 0) return 0;

  const weapon_bag = weapon_member.weapon.weapon_bag;

  if (!weapon_bag.moving_can_fire_while_moving && isMoving) return 0;

  let cover = {
    accuracy_multiplier: 1, // opponent cover penalty
    damage_multiplier: 1,
    penetration_multiplier: 1,
  };
  let targetSize = 1;
  let armor = 1;

  const FALLBACK_TARGET_TYPES_BY_UNIT_CATEGORY: Record<string, string[]> = {
    infantry: ["infantry"],
    vehicles: ["vehicle"], // source category is "vehicles", target type table wants "vehicle"
    aircraft: ["aircraft"],
    team_weapons: ["infantry"], // crewed weapons should still receive infantry modifiers
  };
  const rawTargetUnitTypes = target_unit?.ebps_default?.unitTypes ?? [];

  const fallbackTargetUnitTypes = target_unit?.unit_type
    ? (FALLBACK_TARGET_TYPES_BY_UNIT_CATEGORY[target_unit.unit_type] ?? [])
    : [];

  const targetUnitTypes = [...new Set([...rawTargetUnitTypes, ...fallbackTargetUnitTypes])];

  const targetModifiers = getTargetTypeModifiers(weapon_bag.target_type_table, targetUnitTypes);
  if (target_unit) {
    cover = getCoverMultiplier(target_unit.cover, weapon_member.weapon.weapon_bag);
    targetSize = target_unit.target_size;
    armor = target_unit.armor;

    // Apply armor modifier from target unit early (affects all armor calculations)
    if (target_unit.custom_modifiers?.armor.enabled) {
      if (target_unit.custom_modifiers.armor.type === "percentage") {
        armor = armor * (1 + target_unit.custom_modifiers.armor.value / 100);
      } else {
        armor = target_unit.custom_modifiers.armor.value;
      }
      armor = Math.max(armor, 0.1); // Ensure positive (minimum 0.1 to avoid division by zero)
    }
  }

  const range: RangeType = {
    near: weapon_bag.range_distance_near,
    mid: weapon_bag.range_distance_mid,
    far: weapon_bag.range_distance_far,
    min: weapon_bag.range_min,
    max: weapon_bag.range_max,
  };

  if (range.near === -1) range.near = range.min;
  if (range.mid === -1) range.mid = (range.max - range.min) / 2;
  if (range.far === -1) range.far = range.max;

  /*   Damage per Shot *
    --------------------------------------------------
  */
  const avgDamage =
    ((weapon_bag.damage_max + weapon_bag.damage_min) * cover.damage_multiplier) / 2;

  /*  Hitchance
      --------------------------------------------------
  */

  // penetration chance

  const penetration =
    getInterpolationByDistance(
      distance,
      range,
      1,
      1,
      weapon_bag.penetration_near,
      weapon_bag.penetration_mid,
      weapon_bag.penetration_far,
    ) * targetModifiers.penetration_multiplier;

  const penetrationChance = Math.min(penetration / armor, 1);

  /*  Base accuracy */

  let moveAccuracyMp = 1;
  if (isMoving) moveAccuracyMp = weapon_bag.moving_accuracy_multiplier;
  let accuracy =
    getInterpolationByDistance(
      distance,
      range,
      1,
      1,
      weapon_bag.accuracy_near,
      weapon_bag.accuracy_mid,
      weapon_bag.accuracy_far,
    ) *
    moveAccuracyMp *
    cover.accuracy_multiplier *
    targetModifiers.accuracy_multiplier;

  accuracy = Math.min(accuracy * targetSize, 1);

  /* Scatter Hitchance
  let width = 0.5;
  let length = 0.5;

  // Blasitc Weapons with scatter only:
  // Estimation of the Hit-Box Size.
  // Roughly derived from target size
  // real values are not accessable
  if (targetSize >= 3) {
    width = 3.5;
    length = targetSize / 3;
  }
  */
  // count units
  let units = 1;
  if (target_unit?.weapon_member) {
    units = 0;
    for (const target_member of target_unit.weapon_member) {
      units += target_member.num;
    }
    if (units == 0) return 0;
  }

  /*let scatter_acc = 0;

  const weapon_class = weapon_member.weapon.path.split("/")[1];
  if (weapon_class == "ballistic_weapon" && target_unit?.unit_type == "vehicles")
    scatter_acc = getScatterHitChance(weapon_bag, distance != 0 ? distance : 1, width, length);

  let aoeDamageCombines = 0;

  if (weapon_class == "ballistic_weapon" || weapon_class == "explosive_weapon") {
    // AOE Hitchance (Approximation model)
    const scatter_area = getScatterArea(distance, weapon_bag);

    // let aoe_accuracy = 0;
    let i = 0;

    let aoe_damage = 0;
    let counter = 0;
    for (i = 0; i < weapon_bag.aoe_outer_radius; i += 0.1) {
      aoe_damage += getInterpolationByDistance(
        i,
        {
          near: weapon_bag.aoe_distance_near,
          mid: weapon_bag.aoe_distance_mid,
          far: weapon_bag.aoe_distance_far,
          min: 0,
          max: weapon_bag.aoe_outer_radius,
        },
        weapon_bag.damage_min,
        weapon_bag.damage_max,
        weapon_bag.aoe_damage_near,
        weapon_bag.aoe_damage_mid,
        weapon_bag.aoe_damage_far,
      );
      counter++;
    }
    if (counter > 0) aoe_damage = aoe_damage / counter;

    counter = 0;
    let aoe_pen = 0;
    for (i = 0; i < weapon_bag.aoe_outer_radius; i += 0.1) {
      aoe_pen += getInterpolationByDistance(
        i,
        {
          near: weapon_bag.aoe_distance_near,
          mid: weapon_bag.aoe_distance_mid,
          far: weapon_bag.aoe_distance_far,
          min: 0,
          max: weapon_bag.aoe_outer_radius,
        },
        1,
        1,
        weapon_bag.aoe_penetration_near,
        weapon_bag.aoe_penetration_mid,
        weapon_bag.aoe_penetration_far,
      );
      counter++;
    }
    if (counter > 0) aoe_pen = aoe_pen / counter;

    const aoeAreaFar =
      Math.PI * Math.pow(Math.min(weapon_bag.aoe_distance_far, weapon_bag.aoe_outer_radius), 2);

    const aoe_hitchance = Math.min(aoeAreaFar / scatter_area, 1);

    const aoePenetrationChance = aoe_hitchance * Math.min(aoe_pen / armor, 1);

    let squadSize = 0;
    if (target_unit)
      for (const member of target_unit.weapon_member) {
        squadSize += member.num;
        if (member.num == 0) squadSize += member.crew_size;
      }
    if (squadSize == 0) squadSize = 1;

    let maxMember = squadSize;
    if (weapon_bag.aoe_damage_max_member > 0) maxMember = weapon_bag.aoe_damage_max_member;

    // health = health * maxMember;

    const maxDamageMember = Math.min(squadSize, maxMember);

    // Explosive AOE Weapons only:
    // Squad Formation approximation. Squad densitiy is unknown.
    // For simplification we assume every model within the model cap to be damaged.
    const memberHit = maxDamageMember;

    // check how many units will fit into the area
    // const unitPerAreaApproximation = Math.min(Math.max(scatter_area / Math.pow(width,2),1),units)

    let type_damage_mp = 1;
    //if (target_unit && target_unit.weapon_member)
    for (const modifier of weapon_bag.target_type_table) {
      if (modifier.unit_type && target_unit && target_unit.unit_type)
        type_damage_mp *= modifier.damage_multiplier;

      // Some weapons like AT Guns or Bazookas deal no damage to infantry .
      // At the moment it is not clear, which attribute exactly causes the zero damage effect.
      // However, having the infantry in the target table is a good indicator to build a
      // workaround.
      if (
        modifier.unit_type == "infantry" &&
        (!target_unit || target_unit.unit_type == "infantry")
      )
        return 0;
    }

    // new
    const aoe_damage_multi = aoe_damage * type_damage_mp * aoePenetrationChance * memberHit;

    // new
    aoeDamageCombines = aoe_damage_multi;
  }*/

  /* Combined accuracy */
  //const acc_combined = accuracy + (1 - accuracy) * scatter_acc;

  /*   get rounds per minute
    --------------------------------------------------
  */
  const rpm = getWeaponRpm(weapon_bag, distance, isMoving, attacking_unit);
  if (rpm == 0) return 0;

  /*   Apply Custom Modifiers
    --------------------------------------------------
  */
  let finalAccuracy = accuracy;
  let finalDamage =
    (avgDamage + targetModifiers.base_damage_modifier) * targetModifiers.damage_multiplier;
  let finalPenetrationChance = penetrationChance;
  const finalRpm = rpm;
  const finalArmor = armor; // Armor is already modified if target has custom modifiers
  // Apply custom modifiers from attacking unit (accuracy, damage, penetration, rpm)
  if (attacking_unit?.custom_modifiers) {
    const modifiers = attacking_unit.custom_modifiers;

    // Apply accuracy modifier
    if (modifiers.accuracy.enabled) {
      if (modifiers.accuracy.type === "percentage") {
        finalAccuracy = accuracy * (1 + modifiers.accuracy.value / 100);
      } else {
        finalAccuracy = modifiers.accuracy.value;
      }
      finalAccuracy = Math.min(Math.max(finalAccuracy, 0), 1); // Clamp between 0 and 1
    }

    // Apply damage modifier
    if (modifiers.damage.enabled) {
      if (modifiers.damage.type === "percentage") {
        finalDamage = avgDamage * (1 + modifiers.damage.value / 100);
      } else {
        finalDamage = modifiers.damage.value;
      }
      finalDamage = Math.max(finalDamage, 0); // Ensure non-negative
    }

    // Apply penetration modifier
    if (modifiers.penetration.enabled) {
      const basePenetration = penetration;
      let modifiedPenetration = basePenetration;

      if (modifiers.penetration.type === "percentage") {
        modifiedPenetration = basePenetration * (1 + modifiers.penetration.value / 100);
      } else {
        modifiedPenetration = modifiers.penetration.value;
      }

      finalPenetrationChance = Math.min(Math.max(modifiedPenetration, 0) / finalArmor, 1);
    }

    /* Apply RPM modifier
    if (modifiers.rpm.enabled) {
      if (modifiers.rpm.type === "percentage") {
        finalRpm = rpm * (1 + modifiers.rpm.value / 100);
      } else {
        finalRpm = modifiers.rpm.value;
      }
      finalRpm = Math.max(finalRpm, 0); // Ensure non-negative
    }*/
  }

  // Recalculate hit chance with modified values
  // If no penetration modifier was applied, recalculate with modified armor
  if (attacking_unit?.custom_modifiers?.penetration.enabled !== true) {
    finalPenetrationChance = Math.min(penetration / finalArmor, 1);
  }
  const finalHitChance = finalAccuracy * finalPenetrationChance;

  /*   Damage per Second *
    -------------------------------------------------
  */
  const dps = (finalRpm / 60) * (finalHitChance * finalDamage);

  return dps * weapon_member.num;
};

export const getWeaponRpm = (
  weapon_bag: WeaponStatsType,
  distance = 0,
  isMoving = false,
  attacking_unit?: CustomizableUnit,
) => {
  // average aim time
  let aimMod = 1;
  let windMod = 1;
  let cooldownMod = 1;
  let reloadMod = 1;

  if (attacking_unit?.custom_modifiers?.overallAttackSpeed.enabled) {
    let attackSpeedMod = 1;
    if (attacking_unit.custom_modifiers.overallAttackSpeed.type === "percentage") {
      attackSpeedMod = Math.max(
        1 - attacking_unit.custom_modifiers.overallAttackSpeed.value / 100,
        0,
      );
    } else {
      attackSpeedMod = attacking_unit?.custom_modifiers?.overallAttackSpeed.value;
    }
    aimMod *= attackSpeedMod;
    windMod *= attackSpeedMod;
    cooldownMod *= attackSpeedMod;
    reloadMod *= attackSpeedMod;
  }

  if (attacking_unit?.custom_modifiers?.cooldownReload.enabled) {
    let rofMod = 1;

    if (attacking_unit.custom_modifiers.cooldownReload.type === "percentage") {
      rofMod = Math.max(1 - attacking_unit.custom_modifiers.cooldownReload.value / 100, 0);
    } else {
      return attacking_unit.custom_modifiers.cooldownReload.value;
    }

    cooldownMod *= rofMod;
    reloadMod *= rofMod;
  }
  const [aimTimeMin, aimTimeMax] = _getInterpolationByDistanceMinMax(
    distance,
    weapon_bag.range,
    weapon_bag.fire_aim_time_min,
    weapon_bag.fire_aim_time_max,
    weapon_bag.aim_time_multiplier_near,
    weapon_bag.aim_time_multiplier_mid,
    weapon_bag.aim_time_multiplier_far,
  );
  const aimTime = _averageRoundedToNearestTick(aimTimeMin * aimMod, aimTimeMax * aimMod);

  // Cooldown
  let movingCooldownMp = 1;
  if (isMoving) movingCooldownMp = weapon_bag.moving_cooldown_multiplier;

  const [cooldownMin, cooldownMax] = _getInterpolationByDistanceMinMax(
    distance,
    weapon_bag.range,
    weapon_bag.cooldown_duration_min,
    weapon_bag.cooldown_duration_max,
    weapon_bag.cooldown_duration_multiplier_near,
    weapon_bag.cooldown_duration_multiplier_mid,
    weapon_bag.cooldown_duration_multiplier_far,
  );

  const cooldown = _averageRoundedToNearestTick(
    cooldownMin * movingCooldownMp * cooldownMod,
    cooldownMax * movingCooldownMp * cooldownMod,
  );
  // 4 wind up/down
  let windUp = Math.round(weapon_bag.fire_wind_up * windMod * 8) / 8;
  const windDown = Math.round(weapon_bag.fire_wind_down * windMod * 8) / 8;
  if (windUp > 0) windUp += 0.125;
  // Reload duration
  const [reloadTimeMin, reloadTimeMax] = _getInterpolationByDistanceMinMax(
    distance,
    weapon_bag.range,
    weapon_bag.reload_duration_min,
    weapon_bag.reload_duration_max,
    weapon_bag.reload_duration_multiplier_near,
    weapon_bag.reload_duration_multiplier_mid,
    weapon_bag.reload_duration_multiplier_far,
  );
  let reloadTime = cooldown;
  if (attacking_unit?.custom_modifiers?.reload.enabled) {
    if (attacking_unit.custom_modifiers.reload.type === "percentage") {
      const reloadSpeedMod = Math.max(1 - attacking_unit.custom_modifiers.reload.value / 100, 0);
      reloadMod *= reloadSpeedMod;
      reloadTime = _averageRoundedToNearestTick(
        reloadTimeMin * reloadMod,
        reloadTimeMax * reloadMod,
      );
    } else {
      reloadTime = attacking_unit.custom_modifiers.reload.value;
    }
  } else {
    reloadTime = _averageRoundedToNearestTick(reloadTimeMin, reloadTimeMax);
  }
  if (reloadTime == 0) reloadTime = cooldown;
  // Avg clipSize (measured in number of cooldowns, thus we need to add the first shot)
  const avgClipSize = (weapon_bag.reload_frequency_min + weapon_bag.reload_frequency_max + 2) / 2;

  let burstTime = 0.125;

  let shotsPerClip = avgClipSize;

  // dmg for burst weapons
  if (weapon_bag.burst_can_burst) {
    if (isMoving && !weapon_bag.moving_can_fire_while_moving) return 0;

    let movingBurstMp = 1;
    if (isMoving) movingBurstMp = weapon_bag.moving_burst_multiplier;

    // const avgBurstTime = (weapon_bag.burst_duration_max + weapon_bag.burst_duration_min) / 2;
    // burstTime_n = weapon_bag.burst_duration_multiplier_near * movingBurstMp * avgBurstTime;
    // burstTime_m = weapon_bag.burst_duration_multiplier_mid * movingBurstMp * avgBurstTime;
    // burstTime_f = weapon_bag.burst_duration_multiplier_far * movingBurstMp * avgBurstTime;

    const [burstTimeMin, burstTimeMax] = _getInterpolationByDistanceMinMax(
      distance,
      weapon_bag.range,
      weapon_bag.burst_duration_min,
      weapon_bag.burst_duration_max,
      weapon_bag.burst_duration_multiplier_near,
      weapon_bag.burst_duration_multiplier_mid,
      weapon_bag.burst_duration_multiplier_far,
    );
    if (attacking_unit?.custom_modifiers?.burstLength.enabled) {
      if (attacking_unit.custom_modifiers.burstLength.type === "percentage") {
        const burstLengthMod = 1 + attacking_unit.custom_modifiers.burstLength.value / 100;
        burstTime = _averageRoundedToNearestTick(
          burstTimeMin * movingBurstMp * burstLengthMod,
          burstTimeMax * movingBurstMp * burstLengthMod,
        );
      } else {
        burstTime = attacking_unit.custom_modifiers.burstLength.value;
      }
    } else
      burstTime = _averageRoundedToNearestTick(
        burstTimeMin * movingBurstMp,
        burstTimeMax * movingBurstMp,
      );
    if (burstTime < 0.125) burstTime = 0.125;

    const burstRate = getInterpolationByDistance(
      distance,
      weapon_bag.range,
      weapon_bag.burst_rate_of_fire_min,
      weapon_bag.burst_rate_of_fire_max,
      weapon_bag.burst_rate_of_fire_multiplier_near,
      weapon_bag.burst_rate_of_fire_multiplier_mid,
      weapon_bag.burst_rate_of_fire_multiplier_far,
    );
    // Shots per clip magazine
    let burstShots = 1;

    if (attacking_unit?.custom_modifiers?.burstShots.enabled) {
      if (attacking_unit.custom_modifiers.burstShots.type === "percentage") {
        const burstShotsMod = 1 + attacking_unit.custom_modifiers.burstShots.value / 100;
        burstShots = Math.round(burstTime * burstRate * burstShotsMod);
      } else {
        burstShots = attacking_unit.custom_modifiers.burstShots.value;
      }
    } else {
      burstShots = Math.round(burstTime * burstRate);
    }

    shotsPerClip = avgClipSize * burstShots;
  }
  let burstDuration = 0;

  // time for a burst (mg) or shot (single bolt) + tick time
  burstDuration = aimTime + burstTime + cooldown + windDown + windUp + 0.125;

  // Time to empty the clip and reload
  const clipTime = avgClipSize * burstDuration - cooldown + reloadTime;

  // Rounds per minute = Clip Time / Bullets per Clip * 60
  let rpm = 0;
  if (shotsPerClip > 0) rpm = (shotsPerClip / clipTime) * 60;

  return rpm;
};

const getInterpolationByDistance = (
  distance: number,
  range: RangeType,
  min: number,
  max: number,
  multi_n: number,
  multi_m: number,
  multi_f: number,
  capMax?: number,
) => {
  if (distance > range.max) return 0;

  // initialize
  const avg = (min + max) / 2;

  let result = 0;
  const near = avg * multi_n;
  const mid = avg * multi_m;
  const far = avg * multi_f;

  if (distance > range.far) result = far;
  else if (distance > range.mid)
    result = mid - ((mid - far) / (range.mid - range.far)) * (range.mid - distance);
  else if (distance > range.near)
    result = near - ((near - mid) / (range.near - range.mid)) * (range.near - distance);
  else result = near;

  if (capMax && capMax > 0) result = Math.min(result, capMax);

  return result;
};

const _getInterpolationByDistanceMinMax = (
  distance: number,
  range: RangeType,
  min: number,
  max: number,
  multi_n: number,
  multi_m: number,
  multi_f: number,
  capMax?: number,
) => {
  if (distance > range.max) return [0, 0];

  // initialize
  //let avg = (min + max) / 2;

  //if (avg == 0) avg = 0;

  let resultMin = 0;
  let resultMax = 0;
  const minNear = min * multi_n;
  const minMid = min * multi_m;
  const minFar = min * multi_f;
  const maxNear = max * multi_n;
  const maxMid = max * multi_m;
  const maxFar = max * multi_f;

  if (distance > range.far) resultMin = minFar;
  else if (distance > range.mid)
    resultMin = minMid - ((minMid - minFar) / (range.mid - range.far)) * (range.mid - distance);
  else if (distance > range.near)
    resultMin =
      minNear - ((minNear - minMid) / (range.near - range.mid)) * (range.near - distance);
  else resultMin = minNear;

  if (capMax && capMax > 0) resultMin = Math.min(resultMin, capMax);

  if (distance > range.far) resultMax = maxFar;
  else if (distance > range.mid)
    resultMax = maxMid - ((maxMid - maxFar) / (range.mid - range.far)) * (range.mid - distance);
  else if (distance > range.near)
    resultMax =
      maxNear - ((maxNear - maxMid) / (range.near - range.mid)) * (range.near - distance);
  else resultMax = maxNear;

  if (capMax && capMax > 0) resultMax = Math.min(resultMax, capMax);

  return [resultMin, resultMax];
};
/*
const getScatterHitChance = (
  weapon: WeaponStatsType,
  distance: number,
  width = 1,
  length = 1,
) => {
  //  return targe_size/area;
  const scatter_max = weapon.scatter_distance_scatter_max;
  const ratio = weapon.scatter_distance_scatter_ratio;
  const angle = weapon.scatter_angle_scatter;
  const offset = weapon.scatter_distance_scatter_offset;

  if (distance == 0) distance = 1;

  const chance =
    ((distance +
      Math.min(scatter_max, distance * ratio) * (1 + offset) -
      Math.max(
        distance - Math.min(scatter_max, distance * ratio) * (1 - offset),
        distance - length / 2,
      )) *
      Math.min(
        (distance * Math.PI * angle) / 180,
        (width * (distance + length / 2)) / distance,
      )) /
    Math.max(
      (Math.min(scatter_max, distance * ratio) * 2 * distance * Math.PI * angle) / 180,
      0.1,
    );

  return chance;
};
*/
const getScatterArea = (distance = 0, weapon_bag: WeaponStatsType) => {
  const scatter_offset = weapon_bag.scatter_distance_scatter_offset;
  const distance_scatter_max = weapon_bag.scatter_distance_scatter_max;
  const scatter_angle = weapon_bag.scatter_angle_scatter;
  const scatter_ratio = weapon_bag.scatter_distance_scatter_ratio;

  const range_min =
    distance - Math.min(distance * scatter_ratio, distance_scatter_max) * (1 - scatter_offset);
  const range_max =
    distance + Math.min(distance * scatter_ratio, distance_scatter_max) * (1 + scatter_offset);

  // =(PI()*R2^2-PI()*S2^2)*(N2/360)

  const scatter_area =
    (Math.PI * Math.pow(range_max, 2) - Math.PI * Math.pow(range_min, 2)) * (scatter_angle / 360);

  return scatter_area;
};

const _averageRoundedToNearestTick = (min: number, max: number): number => {
  if (min > max) {
    [min, max] = [max, min];
  }

  if (min == max) {
    return Math.round(min * 8) / 8;
  }

  const lo = min * 8;
  const hi = max * 8;

  let weightedSum = 0;

  const firstK = Math.floor(lo - 0.5);
  const lastK = Math.ceil(hi + 0.5);

  for (let k = firstK; k <= lastK; k++) {
    const intervalStart = k - 0.5;
    const intervalEnd = k + 0.5;

    const overlapStart = Math.max(lo, intervalStart);
    const overlapEnd = Math.min(hi, intervalEnd);
    const overlap = overlapEnd - overlapStart;

    if (overlap > 0) {
      const roundedValue = k / 8;
      weightedSum += roundedValue * overlap;
    }
  }

  return weightedSum / (hi - lo);
};

type TargetTypeModifier = {
  unit_type: string;
  dmg_modifier: number;
  accuracy_multiplier: number;
  penetration_multiplier: number;
  damage_multiplier: number;
};

type AppliedTargetModifiers = {
  base_damage_modifier: number;
  accuracy_multiplier: number;
  penetration_multiplier: number;
  damage_multiplier: number;
  matched_unit_types: string[];
};

const getTargetTypeModifiers = (
  targetTypeTable: TargetTypeModifier[] | undefined,
  targetUnitTypes: string[],
): AppliedTargetModifiers => {
  const result: AppliedTargetModifiers = {
    base_damage_modifier: 0,
    accuracy_multiplier: 1,
    penetration_multiplier: 1,
    damage_multiplier: 1,
    matched_unit_types: [],
  };

  if (!targetTypeTable) return result;

  const targetTypeSet = new Set(targetUnitTypes);

  for (const entry of targetTypeTable) {
    if (!entry.unit_type) continue;

    if (targetTypeSet.has(entry.unit_type)) {
      result.base_damage_modifier += entry.dmg_modifier;
      result.accuracy_multiplier *= entry.accuracy_multiplier;
      result.penetration_multiplier *= entry.penetration_multiplier;
      result.damage_multiplier *= entry.damage_multiplier;
      result.matched_unit_types.push(entry.unit_type);
    }
  }

  return result;
};

export {
  getSingleWeaponDPS,
  getScatterArea,
  _averageRoundedToNearestTick,
  _getInterpolationByDistanceMinMax,
};
