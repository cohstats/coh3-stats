const isWeaponBagContainer = (key: string, obj: any) => {
  // check if first child is weapon_bag
  return Object.keys(obj)[0] === "weapon_bag";
};

const getSingleWeaponDPS = (weapon_bag: any) => {
  //Formular: Hitchance * RateOfFire * Damage * ChanceToDamage(E.g. penetration)
  // since we assume it is an endless engagement we also encounter reload time
  // end we ignore intial time to setup the gun before starting the engagement.
  // Thus we compute: DamagePerClip/(TimeToEmptyClip+ReloadTime)
  // The default target size is 1. Possibly this can be parametrized
  // in future

  // _n = near, _m = mid _f = far

  // 1. compute rate of fire
  // average aim time
  const avgAimTime =
    (parseFloat(weapon_bag.aim.fire_aim_time.max) +
      parseFloat(weapon_bag.aim.fire_aim_time.min)) /
    2;
  const aimTime_n = weapon_bag.aim.aim_time_multiplier.near * avgAimTime;
  const aimTime_m = weapon_bag.aim.aim_time_multiplier.mid * avgAimTime;
  const aimTime_f = weapon_bag.aim.aim_time_multiplier.far * avgAimTime;

  // 2. Compute burst

  const avgBurstTime =
    (parseFloat(weapon_bag.burst.duration.max) + parseFloat(weapon_bag.burst.duration.min)) / 2;
  const burstTime_n = weapon_bag.burst.duration_multiplier.near * avgBurstTime;
  const burstTime_m = weapon_bag.burst.duration_multiplier.mid * avgBurstTime;
  const burstTime_f = weapon_bag.burst.duration_multiplier.far * avgBurstTime;

  const avgBurstRate =
    (parseFloat(weapon_bag.burst.rate_of_fire.max) +
      parseFloat(weapon_bag.burst.rate_of_fire.min)) /
    2;
  const burstRate_n = weapon_bag.burst.rate_of_fire_multiplier.near * avgBurstRate;
  const burstRate_m = weapon_bag.burst.rate_of_fire_multiplier.mid * avgBurstRate;
  const burstRate_f = weapon_bag.burst.rate_of_fire_multiplier.far * avgBurstRate;

  // 3. Cooldown
  const avgCooldown =
    (parseFloat(weapon_bag.cooldown.duration.max) +
      parseFloat(weapon_bag.cooldown.duration.min)) /
    2;
  const cooldown_n = weapon_bag.cooldown.duration_multiplier.near * avgCooldown;
  const cooldown_m = weapon_bag.cooldown.duration_multiplier.mid * avgCooldown;
  const cooldown_f = weapon_bag.cooldown.duration_multiplier.far * avgCooldown;

  // 4 wind up/down
  const windUp = weapon_bag.fire.wind_up;
  const windDown = weapon_bag.fire.wind_down;

  // Reload duration
  const avgReloadDuration =
    (parseFloat(weapon_bag.reload.duration.max) + parseFloat(weapon_bag.reload.duration.min)) / 2;
  const reloadTime_n = weapon_bag.reload.duration_multiplier.near * avgReloadDuration;
  const reloadTime_m = weapon_bag.reload.duration_multiplier.mid * avgReloadDuration;
  const reloadTime_f = weapon_bag.reload.duration_multiplier.far * avgReloadDuration;

  // Avg clipSize (measured in number of cooldowns, thus we need to add the first shot)
  const avgClipSize =
    (parseFloat(weapon_bag.reload.frequency.min) +
      parseFloat(weapon_bag.reload.frequency.max) +
      +2) /
    2;

  // duration per shot
  const shotDuration_n =
    aimTime_n + burstTime_n + cooldown_n + parseFloat(windDown || 0) + parseFloat(windUp);
  const shotDuration_m =
    aimTime_m + burstTime_m + cooldown_m + parseFloat(windDown || 0) + parseFloat(windUp);
  const shotDuration_f =
    aimTime_f + burstTime_f + cooldown_f + parseFloat(windDown || 0) + parseFloat(windUp);

  // Time to empty the clip and reload
  const clipTime_n = avgClipSize * shotDuration_n - avgCooldown + reloadTime_n;
  const clipTime_m = avgClipSize * shotDuration_m - avgCooldown + reloadTime_m;
  const clipTime_f = avgClipSize * shotDuration_f - avgCooldown + reloadTime_f;

  const avgDamage = (parseFloat(weapon_bag.damage.max) + parseFloat(weapon_bag.damage.min)) / 2;

  // expected damage per clip including accuracy
  let dmgPerClip_n = avgClipSize * avgDamage * weapon_bag.accuracy.near;
  let dmgPerClip_m = avgClipSize * avgDamage * weapon_bag.accuracy.mid;
  let dmgPerClip_f = avgClipSize * avgDamage * weapon_bag.accuracy.far;

  // dmg for burst weapons
  if (weapon_bag.burst.can_burst === "True") {
    dmgPerClip_n = avgClipSize * avgDamage * burstRate_n * burstTime_n * weapon_bag.accuracy.near;
    dmgPerClip_m = avgClipSize * avgDamage * burstRate_m * burstTime_m * weapon_bag.accuracy.mid;
    dmgPerClip_f = avgClipSize * avgDamage * burstRate_f * burstTime_f * weapon_bag.accuracy.far;
  }

  // DPS infinite engagement with target size 1
  const dps_n = dmgPerClip_n / clipTime_n;
  const dps_m = dmgPerClip_m / clipTime_m;
  const dps_f = dmgPerClip_f / clipTime_f;

  // range
  let range_n = weapon_bag.range.distance.near;
  let range_m = weapon_bag.range.distance.mid;
  let range_f = weapon_bag.range.distance.far;

  if (range_n === -1) range_n = weapon_bag.range.min;
  if (range_m === -1) range_m = (weapon_bag.range.max - weapon_bag.range.min) / 2;
  if (range_f === -1) range_f = weapon_bag.range.max;

  return [
    { x: 0, y: dps_n },
    { x: range_n, y: dps_n },
    { x: range_m, y: dps_m },
    { x: range_f, y: dps_f },
  ];
};

export { getSingleWeaponDPS, isWeaponBagContainer };
