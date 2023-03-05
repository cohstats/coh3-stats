interface WeaponData {
  id: string; // file name in essence editor
  ui_name: string; // name in game
  icon_name: string; // icon path in game
  unit_name: string; // referencing squad
  weapon_bag: any; // weapon data
  pbgid: string; // essence id
  parent_pbg: string; // essence parent path
  root: any; // root object e.g africa_korps
  image_weapon: string; // image for weapon e.g. in search selection
  image_faction: string; // image for faction e.g. in search selection
  label: string; // label for search selection
  value: string; // value for search selection
  data: any; // weapon_data (duplicate)
  description: string; // search selection description
  faction: string; // faction string e.g. afrika_korps
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
}

const traverseTree = (o: any, func: any, mapper: any, root: string, parent: string) => {
  const relevantSet = new Set();
  //let parent = parent;
  if (parent === "") parent = root;

  for (const i in o) {
    // check if object is relevant (eg. is weapon_bag?)
    const isRelevant = func.apply(this, [i, o[i]]);

    if (!isRelevant && o[i] !== null && typeof o[i] == "object") {
      // remember current node as parrent (parent folder e.g. rifle)
      parent = i;

      //going one step down in the object tree!!
      const childSet = traverseTree(o[i], func, mapper, root, parent);

      childSet.forEach(relevantSet.add, relevantSet);
      // merge relevant object of child
      for (const s in childSet) relevantSet.add(s);

      // add relevant object to return list
    } else if (isRelevant) {
      if (mapper != "undefined") relevantSet.add(mapper.apply(this, [i, o[i], root, parent]));
      else relevantSet.add(o(i));
    }
  }

  return relevantSet;
};

// Helper eg. to have a more comfortable structure for for drop downs.
const mapWeaponData = (key: string, node: any, root: string, parent: string) => {
  if (key === "75_mm_leig_direct_shot_ak") console.log("undefined");

  const weaponData: WeaponData = {
    id: "",
    ui_name: "",
    icon_name: "",
    unit_name: "",
    weapon_bag: null,
    pbgid: "",
    parent_pbg: "",
    root: "",
    image_weapon: "",
    image_faction: "",
    label: "",
    value: "",
    data: "",
    description: "",
    faction: "",
    parent: "",
  };

  weaponData.id = key;

  const weapon_bag: any = node.weapon_bag;

  // weaponData.ui_name = weapon_bag.ui_name.locstring.value; //@todo localization
  weaponData.icon_name = weapon_bag.icon_name;
  weaponData.weapon_bag = weapon_bag;
  weaponData.pbgid = node.pbgid;
  //weaponData.parent_pbg = node.parent_pbg.instance_reference;
  weaponData.root = root;
  weaponData.faction = root;
  weaponData.label = key;
  weaponData.value = key;
  weaponData.data = weapon_bag;
  weaponData.description = weaponData.ui_name || "No Description Available";
  weaponData.parent = parent;

  return weaponData;
};

const isWeaponBagContainer = (key: string, obj: any) => {
  // check if first child is weapon_bag
  return Object.keys(obj)[0] === "weapon_bag";
};

const getWeaponData = (root: any) => {
  const weaponSetAll: WeaponData[] = [];

  for (const obj in root) {
    const weaponSet = traverseTree(root[obj], isWeaponBagContainer, mapWeaponData, obj, obj);
    // weaponSet.forEach(weaponSetAll.add, weaponSetAll);
    weaponSet.forEach((item: any) => {
      let weapon_icon;

      if (!item.weapon_bag.weapon_class) return;

      // filter by relevant weapon types
      switch (item.parent) {
        case "sub_machine_gun":
          weapon_icon = "m1_thompson_sub_machine_gun.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        case "light_machine_gun":
          weapon_icon = "weapon_lmg_mg34.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        case "heavy_machine_gun":
          weapon_icon = "hmg_mg42_ger.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        case "rifle":
          weapon_icon = "weapon_dp_28_lmg.png";
          item.image = "/unitStats/weaponClass/" + weapon_icon;
          weaponSetAll.push(item);
          break;
        default:
          return;
          break;
      }

      //weaponData.
    });
  }

  return weaponSetAll;
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
      1 +
      parseFloat(weapon_bag.reload.frequency.max) +
      1) /
    2;

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
  let dmgPerClip_n = avgClipSize * avgDamage * weapon_bag.accuracy.near;
  let dmgPerClip_m = avgClipSize * avgDamage * weapon_bag.accuracy.mid;
  let dmgPerClip_f = avgClipSize * avgDamage * weapon_bag.accuracy.far;

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

export { traverseTree, getWeaponData, getSingleWeaponDPS };
export type { WeaponData };
