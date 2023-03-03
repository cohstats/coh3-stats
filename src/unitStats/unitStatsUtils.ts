const traverseTree = (o: any, func: any, mapper: any) => {
  var relevantSet = new Set();

  for (var i in o) {
    // check if object is relevant (eg. is weapon_bag?)
    const isRelevant = func.apply(this, [i, o[i]]);

    if (!isRelevant && o[i] !== null && typeof o[i] == "object") {
      //going one step down in the object tree!!
      var childSet = traverseTree(o[i], func, mapper);

      childSet.forEach(relevantSet.add, relevantSet);
      // merge relevant object of child
      for (var s in childSet) relevantSet.add(s);

      // add relevant object to return list
    } else if (isRelevant) {
      if (mapper != "undefined") relevantSet.add(mapper.apply(this, [i, o[i]]));
      else relevantSet.add(o(i));
    }
  }

  return relevantSet;
};

interface WeaponData {
  id: string;
  ui_name: string;
  icon_name: string;
  unit_name: string;
  weapon_bag: any;
  pbgid: string;
  parent_pbg: string;
}

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
  var burstRate_n = weapon_bag.burst.rate_of_fire_multiplier.near * avgBurstRate;
  var burstRate_m = weapon_bag.burst.rate_of_fire_multiplier.mid * avgBurstRate;
  var burstRate_f = weapon_bag.burst.rate_of_fire_multiplier.far * avgBurstRate;

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
  const windDown = weapon_bag.fire_wind_down;

  // Reload duration
  const avgReloadDuration =
    (parseFloat(weapon_bag.reload.duration.max) + parseFloat(weapon_bag.reload.duration.min)) / 2;
  const reloadTime_n = weapon_bag.reload.duration_multiplier.near * avgReloadDuration;
  const reloadTime_m = weapon_bag.reload.duration_multiplier.mid * avgReloadDuration;
  const reloadTime_f = weapon_bag.reload.duration_multiplier.far * avgReloadDuration;

  // Avg clipSize (measured in number of cooldowns, thus we need to add the first shot)
  const avgClipSize =
    parseFloat(weapon_bag.reload.frequency.min) +
    1 +
    (parseFloat(weapon_bag.reload.frequency.max) + 1) / 2;

  // duration per shot
  const shotDuration_n =
    aimTime_n + burstTime_n + cooldown_n + parseFloat(windDown || 0) + parseFloat(windUp);
  const shotDuration_m =
    aimTime_m + burstTime_m + cooldown_m + parseFloat(windDown || 0) + parseFloat(windUp);
  const shotDuration_f =
    aimTime_f + burstTime_f + cooldown_f + parseFloat(windDown || 0) + parseFloat(windUp);

  // Time to empty the clip and reload
  const clipTime_n = avgClipSize * shotDuration_n + reloadTime_n;
  const clipTime_m = avgClipSize * shotDuration_m + reloadTime_m;
  const clipTime_f = avgClipSize * shotDuration_f + reloadTime_f;

  const avgDamage = (parseFloat(weapon_bag.damage.max) + parseFloat(weapon_bag.damage.min)) / 2;

  // expected damage per clip including accuracy
  var dmgPerClip_n = avgClipSize * avgDamage * weapon_bag.accuracy.near;
  var dmgPerClip_m = avgClipSize * avgDamage * weapon_bag.accuracy.mid;
  var dmgPerClip_f = avgClipSize * avgDamage * weapon_bag.accuracy.far;

  // dmg for burst weapons
  if (weapon_bag.burst.can_burst === "True") {
    dmgPerClip_n =
      avgClipSize * avgDamage * burstRate_n * avgBurstTime * weapon_bag.accuracy.near;
    dmgPerClip_m = avgClipSize * avgDamage * burstRate_m * avgBurstTime * weapon_bag.accuracy.mid;
    dmgPerClip_f = avgClipSize * avgDamage * burstRate_f * avgBurstTime * weapon_bag.accuracy.far;
  }

  // DPS infinite engagement with target size 1
  const dps_n = dmgPerClip_n / clipTime_n;
  const dps_m = dmgPerClip_m / clipTime_m;
  const dps_f = dmgPerClip_f / clipTime_f;

  // range
  var range_n = weapon_bag.range.distance.near;
  var range_m = weapon_bag.range.distance.mid;
  var range_f = weapon_bag.range.distance.far;

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

// Helper eg. to have a more comfortable structure for for drop downs.
const mapWeaponData = (key: string, root: any) => {
  var weaponData: WeaponData = {
    id: "",
    ui_name: "",
    icon_name: "",
    unit_name: "",
    weapon_bag: null,
    pbgid: "",
    parent_pbg: "",
  };

  weaponData.id = key;
  const weapon_bag: any = root.weapon_bag;
  weaponData.ui_name = weapon_bag.ui_name;
  weaponData.icon_name = weapon_bag.icon_name;
  weaponData.weapon_bag = weapon_bag;
  weaponData.pbgid = root.pbgid;
  weaponData.parent_pbg = root.parent_pbg;

  return weaponData;
};

const isWeaponBagContainer = (key: string, obj: any) => {
  // check if first child is weapon_bag
  return Object.keys(obj)[0] === "weapon_bag";
};

const getWeaponData = (root: any) => {
  var weaponBags = traverseTree(root, isWeaponBagContainer, mapWeaponData);
  return weaponBags;
};

export { traverseTree, getWeaponData, getSingleWeaponDPS };
export type { WeaponData };
