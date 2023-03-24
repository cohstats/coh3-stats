import { CustomizableUnit, getCoverMultiplier, WeaponMember } from "./dpsCommon";
import { WeaponStatsType } from "./mappingWeapon";

const getSingleWeaponDPS = (
  weapon_member: WeaponMember,
  isMoving = false,
  target_unit?: CustomizableUnit,
) => {
  //Formular: Hitchance * RateOfFire * Damage * ChanceToDamage(E.g. penetration)
  // since we assume it is an endless engagement we also encounter reload time
  // end we ignore intial time to setup the gun before starting the engagement.
  // Thus we compute: DamagePerClip/(TimeToEmptyClip+ReloadTime)
  // The default target size is 1. Possibly this can be parametrized
  // in future

  // initialize variables
  //

  const qty = weapon_member.num;

  if (qty <= 0) return [];

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

  const weapon_bag = weapon_member.weapon.weapon_bag;
  // _n = near, _m = mid _f = far

  // 1. compute rate of fire

  if (weapon_member.num < 0) return [];

  // range
  let range_n = weapon_bag.range_distance_near;
  let range_m = weapon_bag.range_distance_mid;
  let range_f = weapon_bag.range_distance_far;

  if (range_n === -1) range_n = weapon_bag.range_min;
  if (range_m === -1) range_m = (weapon_bag.range_max - weapon_bag.range_min) / 2;
  if (range_f === -1) range_f = weapon_bag.range_max;

  // average aim time
  const avgAimTime = (weapon_bag.fire_aim_time_max + weapon_bag.fire_aim_time_min) / 2;
  const aimTime_n = weapon_bag.aim_time_multiplier_near * avgAimTime;
  const aimTime_m = weapon_bag.aim_time_multiplier_mid * avgAimTime;
  const aimTime_f = weapon_bag.aim_time_multiplier_far * avgAimTime;

  let movingCooldownMp = 1;
  if (isMoving) movingCooldownMp = weapon_bag.moving_cooldown_multiplier;

  let cooldown_n = 0;
  let cooldown_m = 0;
  let cooldown_f = 0;
  let avgCooldown = 0;

  // 3. Cooldown
  avgCooldown = (weapon_bag.cooldown_duration_max + weapon_bag.cooldown_duration_min) / 2;

  cooldown_n = weapon_bag.cooldown_duration_multiplier_near * movingCooldownMp * avgCooldown;
  cooldown_m = weapon_bag.cooldown_duration_multiplier_mid * movingCooldownMp * avgCooldown;
  cooldown_f = weapon_bag.cooldown_duration_multiplier_far * movingCooldownMp * avgCooldown;

  // 4 wind up/down
  const windUp = weapon_bag.fire_wind_up;
  const windDown = weapon_bag.fire_wind_down;

  // Reload duration
  const avgReloadDuration = (weapon_bag.reload_duration_max + weapon_bag.reload_duration_min) / 2;
  const reloadTime_n = weapon_bag.reload_duration_multiplier_near * avgReloadDuration;
  const reloadTime_m = weapon_bag.reload_duration_multiplier_mid * avgReloadDuration;
  const reloadTime_f = weapon_bag.reload_duration_multiplier_far * avgReloadDuration;

  let burstTime_n = 0;
  let burstTime_m = 0;
  let burstTime_f = 0;

  // Avg clipSize (measured in number of cooldowns, thus we need to add the first shot)
  const avgClipSize = (weapon_bag.reload_frequency_min + weapon_bag.reload_frequency_max + 2) / 2;

  if (weapon_bag.burst_can_burst) {
    let movingBurstMp = 1;
    if (isMoving) movingBurstMp = weapon_bag.moving_burst_multiplier;

    const avgBurstTime = (weapon_bag.burst_duration_max + weapon_bag.burst_duration_min) / 2;
    burstTime_n = weapon_bag.burst_duration_multiplier_near * movingBurstMp * avgBurstTime;
    burstTime_m = weapon_bag.burst_duration_multiplier_mid * movingBurstMp * avgBurstTime;
    burstTime_f = weapon_bag.burst_duration_multiplier_far * movingBurstMp * avgBurstTime;
  }

  // duration per shot
  const shotDuration_n = aimTime_n + burstTime_n + cooldown_n + windDown + windUp;
  const shotDuration_m = aimTime_m + burstTime_m + cooldown_m + windDown + windUp;
  const shotDuration_f = aimTime_f + burstTime_f + cooldown_f + windDown + windUp;

  // Time to empty the clip and reload
  const clipTime_n = avgClipSize * shotDuration_n - avgCooldown + reloadTime_n;
  const clipTime_m = avgClipSize * shotDuration_m - avgCooldown + reloadTime_m;
  const clipTime_f = avgClipSize * shotDuration_f - avgCooldown + reloadTime_f;

  const avgDamage = (weapon_bag.damage_max + weapon_bag.damage_min * cover.damage_multiplier) / 2;

  // penetration chance

  const penetration_n = Math.min(
    (weapon_bag.penetration_near * cover.penetration_multiplier) / armor,
    1,
  );
  const penetration_m = Math.min(
    (weapon_bag.penetration_mid * cover.penetration_multiplier) / armor,
    1,
  );
  const penetration_f = Math.min(
    (weapon_bag.penetration_far * cover.penetration_multiplier) / armor,
    1,
  );

  let moveAccuracyMp = 1;
  if (isMoving) moveAccuracyMp = weapon_bag.moving_accuracy_multiplier;

  // expected accuracy
  const accuracy_n = Math.min(
    weapon_bag.accuracy_near * targetSize * moveAccuracyMp * cover.accuracy_multiplier,
    1,
  );
  const accuracy_m = Math.min(
    weapon_bag.accuracy_mid * targetSize * moveAccuracyMp * cover.accuracy_multiplier,
    1,
  );
  const accuracy_f = Math.min(
    weapon_bag.accuracy_far * targetSize * moveAccuracyMp * cover.accuracy_multiplier,
    1,
  );

  let movePenalty = 1;
  if (!weapon_bag.moving_can_fire_while_moving && isMoving == true) movePenalty = 0;

  const width = 3.5;
  const length = targetSize / 3;

  const scatter_acc_n = getScatterHitChance(
    weapon_bag,
    range_n != 0 ? range_n : range_m,
    width,
    length,
  );
  const scatter_acc_m = getScatterHitChance(weapon_bag, range_m, width, length);
  const scatter_acc_f = getScatterHitChance(weapon_bag, range_f, width, length);

  const acc_combined_n = accuracy_n + (1 - accuracy_n) * scatter_acc_n;
  const acc_combined_m = accuracy_m + (1 - accuracy_m) * scatter_acc_m;
  const acc_combined_f = accuracy_f + (1 - accuracy_f) * scatter_acc_f;

  const dmgPerDirectShot_n = avgDamage * acc_combined_n * penetration_n * movePenalty;
  const dmgPerDirectShot_m = avgDamage * acc_combined_m * penetration_m * movePenalty;
  const dmgPerDirectShot_f = avgDamage * acc_combined_f * penetration_f * movePenalty;

  // const dmgPerScatter_n = avgDamage * scatter_acc_n * penetration_n * movePenalty;
  // const dmgPerScatter_m = avgDamage * scatter_acc_m * penetration_m * movePenalty;
  // const dmgPerScatter_f = avgDamage * scatter_acc_f * penetration_f * movePenalty;

  // expected damage per clip including accuracy
  let dmgPerClip_n = avgClipSize * dmgPerDirectShot_n;
  let dmgPerClip_m = avgClipSize * dmgPerDirectShot_m;
  let dmgPerClip_f = avgClipSize * dmgPerDirectShot_f;

  // dmg for burst weapons
  if (weapon_bag.burst_can_burst) {
    const avgBurstRate =
      (weapon_bag.burst_rate_of_fire_max + weapon_bag.burst_rate_of_fire_min) / 2;

    const burstRate_n = weapon_bag.burst_rate_of_fire_multiplier_near * avgBurstRate;
    const burstRate_m = weapon_bag.burst_rate_of_fire_multiplier_mid * avgBurstRate;
    const burstRate_f = weapon_bag.burst_rate_of_fire_multiplier_far * avgBurstRate;

    dmgPerClip_n =
      avgClipSize *
      avgDamage *
      burstRate_n *
      burstTime_n *
      accuracy_n *
      penetration_n *
      movePenalty;
    dmgPerClip_m =
      avgClipSize *
      avgDamage *
      burstRate_m *
      burstTime_m *
      accuracy_m *
      penetration_m *
      movePenalty;
    dmgPerClip_f =
      avgClipSize *
      avgDamage *
      burstRate_f *
      burstTime_f *
      accuracy_f *
      penetration_f *
      movePenalty;
  }

  // DPS infinite engagement with target size 1
  const dps_n = dmgPerClip_n / clipTime_n;
  const dps_m = dmgPerClip_m / clipTime_m;
  const dps_f = dmgPerClip_f / clipTime_f;

  return [
    { x: 0, y: dps_n * qty },
    { x: range_n, y: dps_n * qty },
    { x: range_m, y: dps_m * qty },
    { x: range_f, y: dps_f * qty },
  ];
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
export { getSingleWeaponDPS };
