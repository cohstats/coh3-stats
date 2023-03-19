import { WeaponStatsType, WeaponType } from "./mappingWeapon";

const getSingleWeaponDPS = (
  weapon_bag: WeaponStatsType,
  qty = 1, // Qantity of weapons
  targetSize = 1, // opponent target size
  armor = 1, // opponent armor
  isMoving = false, // move penalty multiplier
  cover = {
    accuracy_multiplier: 1, // opponent cover penalty
    damage_multiplier: 1,
    penetration_multiplier: 1,
  },
) => {
  //Formular: Hitchance * RateOfFire * Damage * ChanceToDamage(E.g. penetration)
  // since we assume it is an endless engagement we also encounter reload time
  // end we ignore intial time to setup the gun before starting the engagement.
  // Thus we compute: DamagePerClip/(TimeToEmptyClip+ReloadTime)
  // The default target size is 1. Possibly this can be parametrized
  // in future

  // _n = near, _m = mid _f = far

  // 1. compute rate of fire

  if (qty < 0) return [];

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
  const avgClipSize =
    (weapon_bag.reload_frequency_min + weapon_bag.reload_frequency_max + +2) / 2;

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
  const accuracy_n =
    weapon_bag.accuracy_near * targetSize * moveAccuracyMp * cover.accuracy_multiplier;
  const accuracy_m =
    weapon_bag.accuracy_mid * targetSize * moveAccuracyMp * cover.accuracy_multiplier;
  const accuracy_f =
    weapon_bag.accuracy_far * targetSize * moveAccuracyMp * cover.accuracy_multiplier;

  let movePenalty = 1;
  if (!weapon_bag.moving_can_fire_while_moving && isMoving == true) movePenalty = 0;

  // expected damage per clip including accuracy
  let dmgPerClip_n = avgClipSize * avgDamage * accuracy_n * penetration_n * movePenalty;
  let dmgPerClip_m = avgClipSize * avgDamage * accuracy_m * penetration_m * movePenalty;
  let dmgPerClip_f = avgClipSize * avgDamage * accuracy_f * penetration_f * movePenalty;

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

  // range
  let range_n = weapon_bag.range_distance_near;
  let range_m = weapon_bag.range_distance_mid;
  let range_f = weapon_bag.range_distance_far;

  if (range_n === -1) range_n = weapon_bag.range_min;
  if (range_m === -1) range_m = (weapon_bag.range_max - weapon_bag.range_min) / 2;
  if (range_f === -1) range_f = weapon_bag.range_max;

  return [
    { x: 0, y: dps_n * qty },
    { x: range_n, y: dps_n * qty },
    { x: range_m, y: dps_m * qty },
    { x: range_f, y: dps_f * qty },
  ];
};

export { getSingleWeaponDPS };
