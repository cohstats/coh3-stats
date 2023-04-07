import { CustomizableUnit, getCoverMultiplier, WeaponMember } from "./dpsCommon";
import { RangeType, WeaponStatsType } from "./mappingWeapon";

const getSingleWeaponDPS = (
  weapon_member: WeaponMember,
  distance = 0,
  isMoving = false,
  target_unit?: CustomizableUnit,
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

  if (!weapon_bag.moving_can_fire_while_moving && isMoving == true) return 0;

  let cover = {
    accuracy_multiplier: 1, // opponent cover penalty
    damage_multiplier: 1,
    penetration_multiplier: 1,
  };
  let targetSize = 1;
  let armor = 1;

  if (target_unit) {
    cover = getCoverMultiplier(target_unit.cover, weapon_member.weapon.weapon_bag);
    targetSize = target_unit.target_size;
    armor = target_unit.armor;
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
  const avgDamage = (weapon_bag.damage_max + weapon_bag.damage_min * cover.damage_multiplier) / 2;

  /*  Hitchance 
      --------------------------------------------------
  */

  // penetration chance

  const penetration = getInterpolationByDistance(
    distance,
    range,
    1,
    1,
    weapon_bag.penetration_near,
    weapon_bag.penetration_mid,
    weapon_bag.penetration_far,
  );

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
    cover.accuracy_multiplier;

  accuracy = Math.min(accuracy * targetSize, 1);

  /* Scatter Hitchance */
  let width = 0.5;
  let length = 0.5;

  if (targetSize >= 3) {
    width = 3.5;
    length = targetSize / 3;
  }

  // count units
  let units = 1;
  if (target_unit?.weapon_member) {
    units = 0;
    for (const target_member of target_unit.weapon_member) {
      units += target_member.num;
    }
    if (units == 0) return 0;
  }

  let scatter_acc = 0;

  const weapon_class = weapon_member.weapon.path.split("/")[1];
  if (weapon_class == "ballistic_weapon" && target_unit?.unit_type == "vehicles")
    scatter_acc = getScatterHitChance(weapon_bag, distance != 0 ? distance : 1, width, length);

  let aoeDamageCombines = 0;

  if (weapon_class == "ballistic_weapon" || weapon_class == "explosive_weapon") {
    // AOE Hitchance (Approximation model)
    const scatter_area = getScatterArea(distance, weapon_bag);

    // let aoe_accuracy = 0;
    let i = 0;

    //   for (i = 0; i < weapon_bag.aoe_outer_radius; i++) {
    //     aoe_accuracy += getInterpolationByDistance(
    //       i,
    //       {
    //         near: weapon_bag.aoe_distance_near,
    //         mid: weapon_bag.aoe_distance_mid,
    //         far: weapon_bag.aoe_distance_far,
    //         min: 0,
    //         max: weapon_bag.aoe_outer_radius,
    //       },
    //       1,
    //       1,
    //       weapon_bag.aoe_accuracy_near,
    //       weapon_bag.aoe_accuracy_mid,
    //       weapon_bag.aoe_accuracy_far,

    //     )
    //   }

    //   if (i > 0)
    //     aoe_accuracy = Math.min(aoe_accuracy / i, 1);

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
    // const aoeAreaMid =
    //   Math.PI * Math.pow(Math.min(weapon_bag.aoe_distance_mid, weapon_bag.aoe_outer_radius), 2);
    // const aoeAreaNear =
    //   Math.PI * Math.pow(Math.min(weapon_bag.aoe_distance_near, weapon_bag.aoe_outer_radius), 2);

    const aoe_hitchance = Math.min(aoeAreaFar / scatter_area, 1);
    // @todo check accuracy multiplyer
    // let aoe_accuracy_far = 1;
    // let aoe_accuracy_mid = 1;
    // let aoe_accuracy_near = 1;

    // if (scatter_area != 0) {
    //   aoe_accuracy_far = Math.min((aoeAreaFar - aoeAreaMid) / scatter_area, 1);
    //   aoe_accuracy_mid = Math.min((aoeAreaMid - aoeAreaNear) / scatter_area, 1);
    //   aoe_accuracy_near = Math.min(aoeAreaNear / scatter_area, 1);
    // }

    // new
    const aoePenetrationChance = aoe_hitchance * Math.min(aoe_pen / armor, 1);

    // const aoeHitChanceFar =
    //   aoe_accuracy_far * Math.min(weapon_bag.aoe_penetration_far / armor, 1);
    // const aoeHitChanceMid =
    //   aoe_accuracy_mid * Math.min(weapon_bag.aoe_penetration_mid / armor, 1);
    // const aoeHitChancenear =
    //   aoe_accuracy_near * Math.min(weapon_bag.aoe_penetration_near / armor, 1);

    // const aoeDamageMidFar = (1 - aoeHitChancenear) * aoeHitChanceMid;
    // const aoeDamageFarMax = (1 - aoeDamageMidFar) * aoeHitChanceFar;

    // let health = 100;
    // if (target_unit) health = target_unit.hitpoints;

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

    // Squad Formation approximation
    const memberHit = Math.min(weapon_bag.aoe_outer_radius, maxDamageMember);

    // check how much units will fit into the area
    // const unitPerAreaApproximation = Math.min(Math.max(scatter_area / Math.pow(width,2),1),units)

    let type_damage_mp = 1;
    if (target_unit && target_unit.weapon_member)
      for (const modifier of weapon_bag.target_type_table) {
        if (modifier.unit_type && target_unit.unit_type)
          type_damage_mp *= modifier.damage_multiplier;
      }

    // new
    const aoe_damage_multi = aoe_damage * type_damage_mp * aoePenetrationChance * memberHit;

    // Restrict damage multiplyer by max model health and maximum affected models.
    // const aoeDamageFar = Math.min(
    //   Math.min(avgDamage * weapon_bag.aoe_damage_far, health),
    //   avgDamage * type_damage_mp * weapon_bag.aoe_damage_far,
    // );
    // const aoeDamageMid = Math.min(
    //   Math.min(avgDamage * weapon_bag.aoe_damage_mid, health),
    //   avgDamage * type_damage_mp * weapon_bag.aoe_damage_mid,
    // );
    // const aoeDamageNear = Math.min(
    //   Math.min(avgDamage * weapon_bag.aoe_damage_near, health),
    //   avgDamage * type_damage_mp * weapon_bag.aoe_damage_near,
    // );

    // const memberHit =  Math.min(units, weapon_bag.aoe_damage_max_member!=-1? weapon_bag.aoe_damage_max_member:units)

    // Expected Damage via Area Effect
    // aoeDamageCombines =
    //   (aoeHitChancenear * aoeDamageNear +
    //     aoeDamageMidFar * aoeDamageMid +
    //     aoeDamageFarMax * aoeDamageFar) *
    //   Math.min(units / 2, 1);

    // new
    aoeDamageCombines = aoe_damage_multi;
  }

  /* Combined accuracy */
  const acc_combined = accuracy + (1 - accuracy) * scatter_acc;

  /* Hitchance */
  const hitChance = acc_combined * penetrationChance;

  /*   get rounds per minute 
    --------------------------------------------------
  */
  const rpm = getWeaponRpm(weapon_bag, distance, isMoving);
  if (rpm == 0) return 0;

  /*   Damage per Second *
    -------------------------------------------------
  */
  const dps = (rpm / 60) * (hitChance * avgDamage + (1 - hitChance) * aoeDamageCombines);

  return dps * weapon_member.num;
};

export const getWeaponRpm = (weapon_bag: WeaponStatsType, distance = 0, isMoving = false) => {
  // average aim time

  const aimTime = getInterpolationByDistance(
    distance,
    weapon_bag.range,
    weapon_bag.fire_aim_time_min,
    weapon_bag.fire_aim_time_max,
    weapon_bag.aim_time_multiplier_near,
    weapon_bag.aim_time_multiplier_mid,
    weapon_bag.aim_time_multiplier_far,
  );

  // Cooldown
  let movingCooldownMp = 1;
  if (isMoving) movingCooldownMp = weapon_bag.moving_cooldown_multiplier;

  const cooldown =
    getInterpolationByDistance(
      distance,
      weapon_bag.range,
      weapon_bag.cooldown_duration_min,
      weapon_bag.cooldown_duration_max,
      weapon_bag.cooldown_duration_multiplier_near,
      weapon_bag.cooldown_duration_multiplier_mid,
      weapon_bag.cooldown_duration_multiplier_far,
    ) * movingCooldownMp;

  // 4 wind up/down
  const windUp = weapon_bag.fire_wind_up;
  const windDown = weapon_bag.fire_wind_down;

  // Reload duration
  const reloadTime = getInterpolationByDistance(
    distance,
    weapon_bag.range,
    weapon_bag.reload_duration_min,
    weapon_bag.reload_duration_max,
    weapon_bag.reload_duration_multiplier_near,
    weapon_bag.reload_duration_multiplier_mid,
    weapon_bag.reload_duration_multiplier_far,
  );

  // Avg clipSize (measured in number of cooldowns, thus we need to add the first shot)
  const avgClipSize = (weapon_bag.reload_frequency_min + weapon_bag.reload_frequency_max + 2) / 2;

  let burstTime = 0;

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

    burstTime =
      getInterpolationByDistance(
        distance,
        weapon_bag.range,
        weapon_bag.burst_duration_min,
        weapon_bag.burst_duration_max,
        weapon_bag.burst_duration_multiplier_near,
        weapon_bag.burst_duration_multiplier_mid,
        weapon_bag.burst_duration_multiplier_far,
      ) * movingBurstMp;

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

    shotsPerClip = avgClipSize * burstTime * burstRate;
  }
  let burstDuration = 0;

  // time for a burst (mg) or shot (single bolt)
  burstDuration = aimTime + burstTime + cooldown + windDown + windUp;

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
  let avg = (min + max) / 2;

  if (avg == 0) avg = 1;

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

const getScatterHitChance = (
  weapon: WeaponStatsType,
  distance: number,
  width = 1,
  length = 1,
) => {
  //   const area = ((distance + (1 + weapon_bag.scatter_distance_scatter_offset) * weapon_bag.scatter_distance_scatter_max)^2 -
  //                 (distance - (1 - weapon_bag.scatter_distance_scatter_offset) * weapon_bag.scatter_distance_scatter_max)^2) *
  //                 Math.PI * (weapon_bag.scatter_angle_scatter/360)

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

  // (
  //                           Math.pow(distance + (1 + scatter_offset) * distance_scatter_max,2)
  //                         - Math.pow(distance - (1 - scatter_offset) * distance_scatter_max ,2)
  //                       )
  //                       * Math.PI * (scatter_angle/360)

  return scatter_area;
};

export { getSingleWeaponDPS, getScatterArea };
