import {
  CustomizableUnit,
  getCoverMultiplier,
  getModifiedHitpoints,
  getUnitModelCount,
  WeaponMember,
  CustomModifier,
} from "./dpsCommon";
import { RangeType, WeaponStatsType } from "./mappingWeapon";
import { getDpsVeterancyEffects } from "./dpsVeterancy";
import { canFireOnMove, getPassiveAccuracyMultiplier } from "./passiveCombatEffects";
import {
  getEffectiveCoverType,
  getShooterPosition,
  isLightOrHeavyCover,
  isProtectedByDirectionalCover,
  usesProjectileImpactCover,
} from "./combatCover";
import {
  getUpgradedVehicleWeaponBag,
  getVehicleWeaponUpgradeEffects,
} from "./vehicleUpgradeEffects";
import {
  getIncrementalTargetAccuracyMultiplier,
  getAoeDamageChance,
  hasScatterAoe,
  simulateExpectedScatterShot,
  type ScatterDpsOptions,
  type ScatterShotInputs,
} from "./scatterSimulation";

export const TICK_DURATION = 0.125;
const tickRate = 1 / TICK_DURATION;

type PercentApplyMode = "normal" | "inverse";

interface ApplyCustomModifierOptions {
  percentMode?: PercentApplyMode;
  min?: number;
  max?: number;
}

// Percentage range bonuses scale near/mid/far/max; flat additions shift them.
// Minimum range remains unchanged by either type of modifier.
const getVeterancyAdjustedRange = (
  range: RangeType,
  veterancy: ReturnType<typeof getDpsVeterancyEffects>,
): RangeType => {
  const multiplier = veterancy.rangeMultiplier;
  const addition = veterancy.rangeAddition;
  const adjust = (distance: number) => Math.max(0, distance * multiplier + addition);
  const near = range.near === -1 ? range.min : range.near;
  const mid = range.mid === -1 ? (range.max - range.min) / 2 : range.mid;
  const far = range.far === -1 ? range.max : range.far;

  return {
    near: adjust(near),
    mid: adjust(mid),
    far: adjust(far),
    min: range.min,
    max: adjust(range.max),
  };
};

export const applyCustomModifier = (
  baseValue: number,
  modifier: CustomModifier | undefined,
  options: ApplyCustomModifierOptions = {},
): number => {
  if (!modifier?.enabled) return baseValue;

  const value = Number.isFinite(modifier.value) ? modifier.value : 0;
  const percentMode = options.percentMode ?? "normal";

  let result = baseValue;

  switch (modifier.type) {
    case "percentage":
      result =
        percentMode === "inverse" ? baseValue * (1 - value / 100) : baseValue * (1 + value / 100);
      break;

    case "absolute":
      result = value;
      break;

    case "additive":
      result = baseValue + value;
      break;

    default:
      result = baseValue;
      break;
  }

  if (options.min !== undefined) {
    result = Math.max(options.min, result);
  }

  if (options.max !== undefined) {
    result = Math.min(options.max, result);
  }

  return result;
};

/** Shared by the scatter solver and preview; positive accuracy reduces scatter. */
export const getWeaponScatterMultiplier = (unit?: CustomizableUnit): number =>
  applyCustomModifier(
    getDpsVeterancyEffects(unit).scatterMultiplier,
    unit?.custom_modifiers?.scatterAccuracy,
    { percentMode: "inverse", min: 0 },
  );

/** Use the weapon's near/mid/far range interpolation for incremental target radius. */
/** Same AoE/non-AoE split used by the formation scatter calculator. */
const isMainGunWeapon = (weapon: WeaponStatsType): boolean => hasScatterAoe(weapon);

/** Match the exact EBPS tag, just as weapon target-table entries do. */
const isVehicleTarget = (unit?: CustomizableUnit): boolean =>
  unit?.ebps_default?.unitTypes?.includes("vehicle") ?? false;

const getSpecialWeaponDamageMultipliers = (
  weapon: WeaponStatsType,
  vet: ReturnType<typeof getDpsVeterancyEffects>,
  target?: CustomizableUnit,
  weaponCategory?: string,
) => {
  const mainGun = isMainGunWeapon(weapon);
  const isFlamethrower = weaponCategory === "flame_throwers";
  return {
    accuracy: mainGun ? vet.mainGunAccuracyMultiplier : 1,
    damage:
      (mainGun ? 1 : vet.mgDamageMultiplier) *
      (mainGun && isVehicleTarget(target) ? vet.damageVsVehiclesMultiplier : 1),
    // Crocodile veterancy adds a flat amount to the flamethrower's base damage.
    flatFlamethrowerDamage: isFlamethrower ? vet.flamethrowerDamageAddition : 0,
    // Anti-vehicle flat damage is *only* on AoE/main guns, never their MGs.
    flatVehicleDamage: mainGun && isVehicleTarget(target) ? vet.damageVsVehiclesAddition : 0,
  };
};

/** VS uses the configured human count; a crew weapon contributes its operators, not an extra gun model. */
const getPackedDefenderModelCount = (target?: CustomizableUnit): number => {
  if (!target || !["infantry", "team_weapons"].includes(target.unit_type)) return 1;
  return Math.max(
    1,
    Math.floor(
      (target.weapon_member ?? []).reduce(
        (sum, member) => sum + Math.max(0, member.num) * Math.max(1, member.crew_size || 1),
        0,
      ),
    ),
  );
};

const getIncrementalAccuracyMultiplier = (
  weapon: WeaponStatsType,
  distance: number,
  range: RangeType,
  scatter?: ScatterDpsOptions,
  assumedTargetModels?: number,
): number => {
  const perModel = weapon.burst_incremental_target_table_accuracy_multiplier;
  if (!weapon.burst_can_burst || !Number.isFinite(perModel) || perModel <= 0) return 1;
  // VS deliberately assumes every OTHER defender model is inside the incremental area.
  // Do not create a scatter context: that would also change AoE and per-model damage capping.
  if (!scatter)
    return assumedTargetModels === undefined
      ? 1
      : Math.pow(perModel, Math.max(0, assumedTargetModels - 1));

  const radius = getInterpolationByDistance(
    distance,
    range,
    1,
    1,
    weapon.burst_incremental_target_table_search_radius_near,
    weapon.burst_incremental_target_table_search_radius_mid,
    weapon.burst_incremental_target_table_search_radius_far,
  );
  return getIncrementalTargetAccuracyMultiplier(
    weapon,
    radius,
    scatter.models,
    scatter.targetModelId,
  );
};

const getSingleWeaponDPS = (
  weapon_member: WeaponMember,
  distance = 0,
  isMoving = false,
  target_unit?: CustomizableUnit,
  attacking_unit?: CustomizableUnit,
  scatter?: ScatterDpsOptions,
  assumeAllDefendersInArea = false,
  displayedDistance = distance,
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

  const weapon_bag = getUpgradedVehicleWeaponBag(weapon_member, attacking_unit);
  const armyUpgrade = getVehicleWeaponUpgradeEffects(weapon_member, attacking_unit);
  const attackingVeterancy = getDpsVeterancyEffects(attacking_unit);
  const targetVeterancy = getDpsVeterancyEffects(target_unit);
  const specialVet = getSpecialWeaponDamageMultipliers(
    weapon_bag,
    attackingVeterancy,
    target_unit,
    weapon_member.weapon.weapon_cat,
  );

  if (!canFireOnMove(weapon_bag, attacking_unit) && isMoving) return 0;

  let cover = {
    accuracy_multiplier: 1, // opponent cover penalty
    damage_multiplier: 1,
    penetration_multiplier: 1,
  };
  let targetSize = 1;
  let armor = 1;

  // Without a selected defender we already assume target size 1, i.e. infantry.
  // Apply infantry target-type modifiers in that same default case.
  const targetUnitTypes = target_unit
    ? (target_unit.ebps_default?.unitTypes ?? [])
    : ["infantry"];

  const targetModifiers = getTargetTypeModifiers(weapon_bag.target_type_table, targetUnitTypes);
  if (target_unit) {
    const coverType = getEffectiveCoverType(target_unit.cover, weapon_bag, displayedDistance);
    cover = getCoverMultiplier(coverType, weapon_bag);
    const selected = scatter?.models.find((model) => model.id === scatter.targetModelId);
    if (
      isLightOrHeavyCover(coverType) &&
      scatter?.directionalCover &&
      selected &&
      !isProtectedByDirectionalCover(
        scatter.directionalCover,
        getShooterPosition(selected, displayedDistance, scatter.gunnerAngleDeg),
        selected,
      )
    ) {
      cover = getCoverMultiplier("", weapon_bag);
    }
    if (
      isLightOrHeavyCover(coverType) &&
      hasScatterAoe(weapon_bag) &&
      usesProjectileImpactCover(weapon_bag)
    )
      cover.damage_multiplier = 1;
    targetSize = target_unit.target_size;
    // Front armor is the default facing in the DPS calculator. Veterancy
    // adds to that base before manual modifiers (including absolute overrides).
    armor = target_unit.armor + targetVeterancy.frontArmorAddition;

    // Apply armor modifier from target unit early (affects all armor calculations)
    armor = applyCustomModifier(armor, target_unit.custom_modifiers?.armor, {
      percentMode: "normal",
      min: 0,
    });
  }

  const range = getVeterancyAdjustedRange(
    {
      near: weapon_bag.range_distance_near,
      mid: weapon_bag.range_distance_mid,
      far: weapon_bag.range_distance_far,
      min: weapon_bag.range_min,
      max: weapon_bag.range_max,
    },
    attackingVeterancy,
  );

  /*   Damage per Shot *
    --------------------------------------------------
  */
  const avgDamage = (weapon_bag.damage_max + weapon_bag.damage_min) / 2;

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
    ) *
    targetModifiers.penetration_multiplier *
    attackingVeterancy.penetrationMultiplier;

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

  accuracy *= targetSize; // Clamp after custom + veterancy accuracy effects below.
  if (weapon_bag.projectile_is_artillery) accuracy = 0;

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
  // Empty infantry squads have no targets; vehicles and emplacements still
  // exist and take damage even when they have no active weapons.
  if (target_unit && getUnitModelCount(target_unit) <= 0) return 0;

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
  // Apply attacker veterancy before manual customization so absolute
  // accuracy settings remain true overrides.
  let finalAccuracy =
    accuracy *
    attackingVeterancy.accuracyMultiplier *
    getPassiveAccuracyMultiplier(attacking_unit) *
    specialVet.accuracy *
    (isMoving ? attackingVeterancy.movingAccuracyMultiplier : 1);
  let finalDamage =
    (avgDamage +
      targetModifiers.base_damage_modifier +
      specialVet.flatVehicleDamage +
      attackingVeterancy.damageAddition +
      specialVet.flatFlamethrowerDamage) *
    targetModifiers.damage_multiplier *
    attackingVeterancy.damageMultiplier *
    specialVet.damage *
    armyUpgrade.damageMultiplier;
  let finalPenetrationChance = penetrationChance;
  const finalRpm = rpm;
  const finalArmor = armor; // Armor is already modified if target has custom modifiers
  // Apply custom modifiers from attacking unit (accuracy, damage, penetration, rpm)
  if (attacking_unit?.custom_modifiers) {
    const modifiers = attacking_unit.custom_modifiers;

    // Apply accuracy modifier
    if (modifiers.accuracy.enabled) {
      if (modifiers.accuracy.type === "percentage") {
        finalAccuracy *= 1 + modifiers.accuracy.value / 100;
      } else {
        finalAccuracy = modifiers.accuracy.value;
      }
      // Clamp after the target's received-accuracy effects have also been applied.
    }

    // Apply damage modifier
    finalDamage = applyCustomModifier(finalDamage, modifiers?.damage, {
      percentMode: "normal",
      min: 0,
    });

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

  // Apply received-damage mitigation after manual damage customization,
  // including absolute damage overrides.
  finalDamage *= cover.damage_multiplier * targetVeterancy.receivedDamageMultiplier;
  finalDamage = applyCustomModifier(finalDamage, target_unit?.custom_modifiers?.receivedDamage, {
    percentMode: "inverse",
    min: 0,
  });

  // Recalculate hit chance with modified values
  // If no penetration modifier was applied, recalculate with modified armor
  if (attacking_unit?.custom_modifiers?.penetration.enabled !== true) {
    finalPenetrationChance = Math.min(penetration / finalArmor, 1);
  }
  // In Compare scatter mode, account for extra nearby infantry even for
  // non-AoE weapons (which still use this established direct-DPS path).
  finalAccuracy *= getIncrementalAccuracyMultiplier(
    weapon_bag,
    distance,
    range,
    scatter,
    assumeAllDefendersInArea ? getPackedDefenderModelCount(target_unit) : undefined,
  );
  // Attacker veterancy has already been applied; combine with defender's
  // received-accuracy modifier, then cap hit chance.
  finalAccuracy = Math.min(
    Math.max(
      applyCustomModifier(
        finalAccuracy * targetVeterancy.receivedAccuracyMultiplier,
        target_unit?.custom_modifiers?.receivedAccuracy,
        { min: 0 },
      ),
      0,
    ),
    1,
  );
  //autobounce is at 3%, any pen below that automatically fails
  const AUTOBOUNCE_THRESHOLD = 0.03;
  if (finalPenetrationChance < AUTOBOUNCE_THRESHOLD) {
    finalPenetrationChance = 0;
  }

  const penetrationDamageMultiplier =
    finalPenetrationChance +
    (weapon_bag.deflection_has_deflection_damage
      ? weapon_bag.deflection_damage_multiplier * (1 - finalPenetrationChance)
      : 0);

  // Only the formation-aware Compare calculation has individual model HP.
  // Cap each actual hit/deflection AFTER damage and defender HP modifiers,
  // but BEFORE averaging penetration outcomes. Generic/no-target DPS stays uncapped.
  const modelHitpoints = scatter && target_unit ? getModifiedHitpoints(target_unit) : undefined;
  const damageOnHit =
    modelHitpoints === undefined
      ? undefined
      : Math.min(finalDamage, modelHitpoints) * finalPenetrationChance +
        (weapon_bag.deflection_has_deflection_damage
          ? Math.min(finalDamage * weapon_bag.deflection_damage_multiplier, modelHitpoints) *
            (1 - finalPenetrationChance)
          : 0);

  /*   Damage per Second *
    -------------------------------------------------
  */
  const effectiveHitDamageMultiplier = finalAccuracy * penetrationDamageMultiplier;
  // Without a formation, only the aimed-at model is resolved spatially. A hit
  // on a garrison still applies FAR AoE damage to every other occupant.
  const otherGarrisonDamage =
    target_unit?.cover === "garrison" &&
    weapon_bag.aoe_damage_all_in_hold &&
    hasScatterAoe(weapon_bag)
      ? Math.max(0, Math.floor(getUnitModelCount(target_unit)) - 1) *
        Math.min(
          getModifiedHitpoints(target_unit),
          Math.max(0, finalDamage * weapon_bag.aoe_damage_far),
        ) *
        getAoeDamageChance(
          weapon_bag.aoe_accuracy_far,
          weapon_bag.aoe_penetration_far,
          finalArmor,
          targetModifiers.penetration_multiplier * attackingVeterancy.penetrationMultiplier,
          attacking_unit?.custom_modifiers?.penetration,
        )
      : 0;
  const dps =
    (finalRpm / 60) *
    ((damageOnHit === undefined
      ? effectiveHitDamageMultiplier * finalDamage
      : finalAccuracy * damageOnHit) +
      finalAccuracy * otherGarrisonDamage);

  return dps * weapon_member.num;
};

/**
 * One shared shot-input calculation for both the DPS curve and its per-model
 * hover preview. This keeps shooter/defender modifiers exactly in sync.
 */
export const getSingleWeaponScatterShotInputs = (
  weapon_member: WeaponMember,
  distance: number,
  scatter: ScatterDpsOptions,
  isMoving = false,
  target_unit?: CustomizableUnit,
  attacking_unit?: CustomizableUnit,
  displayedDistance = distance,
): ScatterShotInputs | null => {
  const bag = getUpgradedVehicleWeaponBag(weapon_member, attacking_unit);
  const armyUpgrade = getVehicleWeaponUpgradeEffects(weapon_member, attacking_unit);
  if (
    weapon_member.num <= 0 ||
    (isMoving && !canFireOnMove(bag, attacking_unit)) ||
    !hasScatterAoe(bag) ||
    !(scatter.targetModelId === null
      ? scatter.groundTarget !== undefined && scatter.groundTarget !== null
      : scatter.models.some((model) => model.id === scatter.targetModelId))
  ) {
    return null;
  }

  const vet = getDpsVeterancyEffects(attacking_unit);
  const targetVet = getDpsVeterancyEffects(target_unit);
  const specialVet = getSpecialWeaponDamageMultipliers(
    bag,
    vet,
    target_unit,
    weapon_member.weapon.weapon_cat,
  );
  const coverType = getEffectiveCoverType(target_unit?.cover ?? "", bag, displayedDistance);
  const cover = target_unit
    ? getCoverMultiplier(coverType, bag)
    : {
        accuracy_multiplier: 1,
        damage_multiplier: 1,
        penetration_multiplier: 1,
      };
  const selected = scatter.models.find((model) => model.id === scatter.targetModelId);
  if (
    isLightOrHeavyCover(coverType) &&
    scatter.directionalCover &&
    selected &&
    !isProtectedByDirectionalCover(
      scatter.directionalCover,
      getShooterPosition(selected, displayedDistance, scatter.gunnerAngleDeg),
      selected,
    )
  ) {
    cover.accuracy_multiplier = getCoverMultiplier("", bag).accuracy_multiplier;
  }
  const types = target_unit ? (target_unit.ebps_default?.unitTypes ?? []) : ["infantry"];
  const typeMods = getTargetTypeModifiers(bag.target_type_table, types);
  const targetSize = target_unit?.target_size ?? 1;
  let armor = (target_unit?.armor ?? 1) + targetVet.frontArmorAddition;
  armor = applyCustomModifier(armor, target_unit?.custom_modifiers?.armor, { min: 0.001 });
  const range = getVeterancyAdjustedRange(
    {
      near: bag.range_distance_near,
      mid: bag.range_distance_mid,
      far: bag.range_distance_far,
      min: bag.range_min,
      max: bag.range_max,
    },
    vet,
  );

  const accuracyBase = getInterpolationByDistance(
    distance,
    range,
    1,
    1,
    bag.accuracy_near,
    bag.accuracy_mid,
    bag.accuracy_far,
  );
  let accuracy =
    accuracyBase *
    (isMoving ? bag.moving_accuracy_multiplier : 1) *
    cover.accuracy_multiplier *
    typeMods.accuracy_multiplier *
    targetSize *
    vet.accuracyMultiplier *
    getPassiveAccuracyMultiplier(attacking_unit) *
    specialVet.accuracy *
    (isMoving ? vet.movingAccuracyMultiplier : 1);
  const manualAccuracy = attacking_unit?.custom_modifiers?.accuracy;
  if (manualAccuracy?.enabled) {
    accuracy =
      manualAccuracy.type === "percentage"
        ? accuracy * (1 + manualAccuracy.value / 100)
        : manualAccuracy.value;
  }
  // Each additional active model close to the selected target increases the
  // chance of a direct hit; it does not change the scatter envelope itself.
  // Apply after manual accuracy overrides, before defender received accuracy.
  accuracy *= getIncrementalAccuracyMultiplier(bag, distance, range, scatter);
  // Match standard DPS: even an absolute attacker accuracy override must still
  // respect the defender's received-accuracy modifier.
  accuracy *= targetVet.receivedAccuracyMultiplier;
  accuracy = applyCustomModifier(accuracy, target_unit?.custom_modifiers?.receivedAccuracy, {
    min: 0,
  });
  // An artillery projectile scatters even when its nominal accuracy is high.
  if (bag.projectile_is_artillery || scatter.targetModelId === null) accuracy = 0;
  accuracy = Math.min(1, Math.max(0, accuracy));

  const baseDamage = (bag.damage_min + bag.damage_max) / 2;
  const calculateDamage = (coverDamage: number) => {
    let damage =
      (baseDamage +
        typeMods.base_damage_modifier +
        vet.damageAddition +
        specialVet.flatFlamethrowerDamage +
        specialVet.flatVehicleDamage) *
      typeMods.damage_multiplier *
      vet.damageMultiplier *
      specialVet.damage *
      armyUpgrade.damageMultiplier;
    damage = applyCustomModifier(damage, attacking_unit?.custom_modifiers?.damage, { min: 0 });
    damage *= coverDamage * targetVet.receivedDamageMultiplier;
    damage = applyCustomModifier(damage, target_unit?.custom_modifiers?.receivedDamage, {
      percentMode: "inverse",
      min: 0,
    });
    return damage;
  };
  const damage = calculateDamage(cover.damage_multiplier);
  const impactBasedCover = isLightOrHeavyCover(coverType) && usesProjectileImpactCover(bag);

  let penetration =
    getInterpolationByDistance(
      distance,
      range,
      1,
      1,
      bag.penetration_near,
      bag.penetration_mid,
      bag.penetration_far,
    ) *
    typeMods.penetration_multiplier *
    vet.penetrationMultiplier;
  penetration = applyCustomModifier(penetration, attacking_unit?.custom_modifiers?.penetration, {
    min: 0,
  });
  const directPenChance = penetration / armor < 0.03 ? 0 : Math.min(1, penetration / armor);
  const directDamageMultiplier =
    directPenChance +
    (bag.deflection_has_deflection_damage
      ? bag.deflection_damage_multiplier * (1 - directPenChance)
      : 0);
  return {
    ...scatter,
    // Non-positive caps mean unlimited. Keep that sentinel, and never mutate a
    // weapon bag shared with another attacker or an unvetted preview.
    weapon:
      bag.aoe_damage_max_member > 0 && vet.aoeMaxMemberHitAddition !== 0
        ? {
            ...bag,
            aoe_damage_max_member: Math.max(
              1,
              bag.aoe_damage_max_member + vet.aoeMaxMemberHitAddition,
            ),
          }
        : bag,
    // The chart's x-coordinate is the true firing range, even with manual range scaling.
    distance: displayedDistance,
    isMoving,
    directHitChance: accuracy,
    directDamage: damage * directDamageMultiplier,
    // When a specific defender is selected, cap damage on each model per
    // actual outcome (penetration/deflection), not after averaging outcomes.
    modelHitpoints: target_unit ? getModifiedHitpoints(target_unit) : undefined,
    directFullDamage: damage,
    directPenetrationChance: directPenChance,
    directDeflectionMultiplier: bag.deflection_has_deflection_damage
      ? bag.deflection_damage_multiplier
      : 0,
    splashDamage: damage,
    impactBasedCover,
    uncoveredDamage:
      isLightOrHeavyCover(coverType) && (impactBasedCover || scatter.directionalCover)
        ? calculateDamage(1)
        : undefined,
    targetInGarrison: target_unit?.cover === "garrison",
    targetArmor: armor,
    splashPenetrationMultiplier: typeMods.penetration_multiplier * vet.penetrationMultiplier,
    // Apply manual penetration after AoE's own penetration falloff, just as
    // the direct-hit path applies it after ordinary ranged penetration.
    splashPenetrationModifier: attacking_unit?.custom_modifiers?.penetration,
    scatterMultiplier: getWeaponScatterMultiplier(attacking_unit),
  };
};

/** Expected squad HP DPS with direct hits and a sampled projectile scatter/AoE model. */
export const getSingleWeaponScatterDPS = (
  weapon_member: WeaponMember,
  distance: number,
  scatter: ScatterDpsOptions,
  isMoving = false,
  target_unit?: CustomizableUnit,
  attacking_unit?: CustomizableUnit,
  displayedDistance = distance,
): number => {
  const qty = weapon_member.num;
  if (qty <= 0) return 0;
  const bag = getUpgradedVehicleWeaponBag(weapon_member, attacking_unit);
  if (isMoving && !canFireOnMove(bag, attacking_unit)) return 0;

  const selected = scatter.models.find((model) => model.id === scatter.targetModelId);
  if (scatter.targetModelId !== null && !selected) return 0;
  if (scatter.targetModelId === null && !scatter.groundTarget) return 0;

  // No-AoE weapons cannot damage ground targets or disabled models. Regular
  // targeted fire still uses the existing direct-fire DPS implementation.
  if (!hasScatterAoe(bag)) {
    return selected?.enabled
      ? getSingleWeaponDPS(
          weapon_member,
          distance,
          isMoving,
          target_unit,
          attacking_unit,
          scatter,
          false,
          displayedDistance,
        )
      : 0;
  }

  const inputs = getSingleWeaponScatterShotInputs(
    weapon_member,
    distance,
    scatter,
    isMoving,
    target_unit,
    attacking_unit,
    displayedDistance,
  );
  if (!inputs) return 0;
  const rpm = getWeaponRpm(bag, distance, isMoving, attacking_unit);
  return rpm > 0 ? ((simulateExpectedScatterShot(inputs) * rpm) / 60) * qty : 0;
};

export type WeaponTiming = {
  rpm: number;
  burstDuration: number;
  timeBetweenBurstsCooldown: number;
  timeBetweenBurstsReload: number;
};

export const getWeaponTiming = (
  weapon_bag: WeaponStatsType,
  distance = 0,
  isMoving = false,
  attacking_unit?: CustomizableUnit,
): WeaponTiming => {
  // Use the same scaled/shifted range breakpoints as accuracy.
  const veterancy = getDpsVeterancyEffects(attacking_unit);
  const effectiveRange = getVeterancyAdjustedRange(weapon_bag.range, veterancy);
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
      attackSpeedMod = attacking_unit.custom_modifiers.overallAttackSpeed.value;
    }

    aimMod *= attackSpeedMod;
    windMod *= attackSpeedMod;
    cooldownMod *= attackSpeedMod;
    reloadMod *= attackSpeedMod;
  }

  if (attacking_unit?.custom_modifiers?.cooldownReload.enabled) {
    if (attacking_unit.custom_modifiers.cooldownReload.type === "percentage") {
      const rofMod = Math.max(1 - attacking_unit.custom_modifiers.cooldownReload.value / 100, 0);

      cooldownMod *= rofMod;
      reloadMod *= rofMod;
    } else {
      return {
        rpm: attacking_unit.custom_modifiers.cooldownReload.value,
        burstDuration: 0,
        timeBetweenBurstsCooldown: 0,
        timeBetweenBurstsReload: 0,
      };
    }
  }

  // Apply automatic veterancy timing modifiers before 1/8-second tick rounding.
  const vetAttackTime = getDpsVeterancyEffects(attacking_unit).attackTimeMultiplier;
  aimMod *= vetAttackTime;
  windMod *= vetAttackTime;
  cooldownMod *= vetAttackTime;
  reloadMod *= vetAttackTime;
  const [aimTimeMin, aimTimeMax] = _getInterpolationByDistanceMinMax(
    distance,
    effectiveRange,
    weapon_bag.fire_aim_time_min,
    weapon_bag.fire_aim_time_max,
    weapon_bag.aim_time_multiplier_near,
    weapon_bag.aim_time_multiplier_mid,
    weapon_bag.aim_time_multiplier_far,
  );

  const aimTime = _averageRoundedToNearestTick(aimTimeMin * aimMod, aimTimeMax * aimMod);

  let movingCooldownMp = 1;
  if (isMoving) movingCooldownMp = weapon_bag.moving_cooldown_multiplier;

  const [cooldownMin, cooldownMax] = _getInterpolationByDistanceMinMax(
    distance,
    effectiveRange,
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

  let windUp = Math.round(weapon_bag.fire_wind_up * windMod * tickRate) / tickRate;
  const windDown = Math.round(weapon_bag.fire_wind_down * windMod * tickRate) / tickRate;

  if (windUp > 0) windUp += TICK_DURATION;

  const [reloadTimeMin, reloadTimeMax] = _getInterpolationByDistanceMinMax(
    distance,
    effectiveRange,
    weapon_bag.reload_duration_min,
    weapon_bag.reload_duration_max,
    weapon_bag.reload_duration_multiplier_near,
    weapon_bag.reload_duration_multiplier_mid,
    weapon_bag.reload_duration_multiplier_far,
  );

  let reloadTime = _averageRoundedToNearestTick(
    reloadTimeMin * reloadMod,
    reloadTimeMax * reloadMod,
  );

  if (attacking_unit?.custom_modifiers?.reload.enabled) {
    if (attacking_unit.custom_modifiers.reload.type === "percentage") {
      const reloadSpeedMod = Math.max(1 - attacking_unit.custom_modifiers.reload.value / 100, 0);

      reloadTime = _averageRoundedToNearestTick(
        reloadTimeMin * reloadMod * reloadSpeedMod,
        reloadTimeMax * reloadMod * reloadSpeedMod,
      );
    } else {
      reloadTime = attacking_unit.custom_modifiers.reload.value;
    }
  }

  if (reloadTime === 0) reloadTime = cooldown;

  const avgClipSize = (weapon_bag.reload_frequency_min + weapon_bag.reload_frequency_max + 2) / 2;

  let burstTime = TICK_DURATION;
  let shotsPerClip = avgClipSize;

  if (weapon_bag.burst_can_burst) {
    if (isMoving && !canFireOnMove(weapon_bag, attacking_unit)) {
      return {
        rpm: 0,
        burstDuration: 0,
        timeBetweenBurstsCooldown: 0,
        timeBetweenBurstsReload: 0,
      };
    }

    let movingBurstMp = 1;
    if (isMoving) movingBurstMp = weapon_bag.moving_burst_multiplier;

    let [burstTimeMin, burstTimeMax] = _getInterpolationByDistanceMinMax(
      distance,
      effectiveRange,
      weapon_bag.burst_duration_min,
      weapon_bag.burst_duration_max,
      weapon_bag.burst_duration_multiplier_near,
      weapon_bag.burst_duration_multiplier_mid,
      weapon_bag.burst_duration_multiplier_far,
    );

    const vetBurstDuration = getDpsVeterancyEffects(attacking_unit).burstDurationMultiplier;
    burstTimeMin *= movingBurstMp * vetBurstDuration;
    burstTimeMax *= movingBurstMp * vetBurstDuration;

    if (attacking_unit?.custom_modifiers?.burstLength.enabled) {
      if (attacking_unit.custom_modifiers.burstLength.type === "percentage") {
        const burstLengthMod = 1 + attacking_unit.custom_modifiers.burstLength.value / 100;
        burstTimeMin *= burstLengthMod;
        burstTimeMax *= burstLengthMod;
        burstTime = _averageRoundedBurstDuration(burstTimeMin, burstTimeMax);
      } else {
        burstTime = attacking_unit.custom_modifiers.burstLength.value;
        burstTimeMin = attacking_unit.custom_modifiers.burstLength.value;
        burstTimeMax = attacking_unit.custom_modifiers.burstLength.value;
      }
    } else {
      burstTime = _averageRoundedBurstDuration(burstTimeMin, burstTimeMax);
    }

    let [burstRateMin, burstRateMax] = _getInterpolationByDistanceMinMax(
      distance,
      effectiveRange,
      weapon_bag.burst_rate_of_fire_min,
      weapon_bag.burst_rate_of_fire_max,
      weapon_bag.burst_rate_of_fire_multiplier_near,
      weapon_bag.burst_rate_of_fire_multiplier_mid,
      weapon_bag.burst_rate_of_fire_multiplier_far,
    );

    const vetBurstRate = getDpsVeterancyEffects(attacking_unit).burstRateMultiplier;
    burstRateMin *= vetBurstRate;
    burstRateMax *= vetBurstRate;
    let burstShots = 1;

    if (attacking_unit?.custom_modifiers?.burstShots.enabled) {
      if (attacking_unit.custom_modifiers.burstShots.type === "percentage") {
        const burstShotsMod = 1 + attacking_unit.custom_modifiers.burstShots.value / 100;

        burstShots = _averageBurstShots(
          burstTimeMin,
          burstTimeMax,
          burstRateMin * burstShotsMod,
          burstRateMax * burstShotsMod,
        );
      } else {
        burstShots = attacking_unit.custom_modifiers.burstShots.value;
      }
    } else {
      burstShots = _averageBurstShots(burstTimeMin, burstTimeMax, burstRateMin, burstRateMax);
    }

    shotsPerClip = avgClipSize * burstShots;
  }

  // These are measured from the end of the current shot/burst to the start of the next one.
  const timeBetweenBurstsCooldown = aimTime + windUp + windDown + cooldown + TICK_DURATION;
  const timeBetweenBurstsReload = aimTime + windUp + windDown + reloadTime + TICK_DURATION;

  const fullNonReloadCycle = burstTime + timeBetweenBurstsCooldown;
  const clipTime = avgClipSize * fullNonReloadCycle - cooldown + reloadTime;

  const calculatedRpm = shotsPerClip > 0 && clipTime > 0 ? (shotsPerClip / clipTime) * 60 : 0;

  return {
    rpm: calculatedRpm,
    burstDuration: burstTime,
    timeBetweenBurstsCooldown,
    timeBetweenBurstsReload,
  };
};

export const getWeaponRpm = (
  weapon_bag: WeaponStatsType,
  distance = 0,
  isMoving = false,
  attacking_unit?: CustomizableUnit,
) => {
  return getWeaponTiming(weapon_bag, distance, isMoving, attacking_unit).rpm;
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

const getScatterDimensions = (distance = 0, weapon_bag: WeaponStatsType) => {
  const scatter_offset = weapon_bag.scatter_distance_scatter_offset;
  const distance_scatter_max = weapon_bag.scatter_distance_scatter_max;
  const scatter_angle = weapon_bag.scatter_angle_scatter;
  const scatter_ratio = weapon_bag.scatter_distance_scatter_ratio;

  const scatter_distance = Math.min(distance * scatter_ratio, distance_scatter_max);

  const range_min = distance - scatter_distance * (1 - scatter_offset);
  const range_max = distance + scatter_distance * (1 + scatter_offset);

  const length = Math.max(range_max - range_min, 0);

  // Use the center of the scatter band for width.
  // This makes scatter_offset affect the displayed width.
  const center_range = Math.max((range_min + range_max) / 2, 0);
  const scatter_angle_radians = (scatter_angle * Math.PI) / 180;

  // Arc length across the scatter cone at center_range.
  const width = center_range * scatter_angle_radians;

  const offset = scatter_distance * scatter_offset;

  return {
    width,
    length,
    offset,
    range_min,
    range_max,
  };
};

const _averageRoundedToNearestTick = (min: number, max: number): number => {
  if (min > max) {
    [min, max] = [max, min];
  }

  // Single fixed value
  if (min === max) {
    return Math.round(min / TICK_DURATION) * TICK_DURATION;
  }

  const halfTick = TICK_DURATION / 2;
  const totalRange = max - min;

  let weightedSum = 0;

  // Wide enough bounds to cover every rounded tick whose interval can overlap [min, max]
  const firstTickIndex = Math.floor((min - halfTick) / TICK_DURATION);
  const lastTickIndex = Math.ceil((max + halfTick) / TICK_DURATION);

  for (let tickIndex = firstTickIndex; tickIndex <= lastTickIndex; tickIndex++) {
    const roundedValue = tickIndex * TICK_DURATION;

    // Raw values in this interval round to roundedValue
    const roundingIntervalMin = roundedValue - halfTick;
    const roundingIntervalMax = roundedValue + halfTick;

    // How much of that interval overlaps the actual input range?
    const overlapMin = Math.max(min, roundingIntervalMin);
    const overlapMax = Math.min(max, roundingIntervalMax);
    const overlap = Math.max(0, overlapMax - overlapMin);

    if (overlap === 0) continue;

    weightedSum += roundedValue * overlap;
  }

  return weightedSum / totalRange;
};

const _averageRoundedToNearestInteger = (min: number, max: number): number => {
  if (min > max) {
    [min, max] = [max, min];
  }

  if (min === max) {
    return Math.round(min);
  }

  const halfStep = 0.5;
  const totalRange = max - min;

  let weightedSum = 0;

  // Wide enough bounds to cover every integer whose rounding interval can overlap [min, max]
  const firstInteger = Math.floor(min - halfStep);
  const lastInteger = Math.ceil(max + halfStep);

  for (let integer = firstInteger; integer <= lastInteger; integer++) {
    // Raw values in this interval round to this integer
    const roundingIntervalMin = integer - halfStep;
    const roundingIntervalMax = integer + halfStep;

    // How much of that interval overlaps the actual input range?
    const overlapMin = Math.max(min, roundingIntervalMin);
    const overlapMax = Math.min(max, roundingIntervalMax);
    const overlap = Math.max(0, overlapMax - overlapMin);

    if (overlap === 0) continue;

    weightedSum += integer * overlap;
  }

  return weightedSum / totalRange;
};

export const _averageRoundedBurstDuration = (min: number, max: number): number => {
  if (min > max) {
    [min, max] = [max, min];
  }

  // Single fixed burst duration
  if (min === max) {
    const roundedDuration = Math.round(min / TICK_DURATION) * TICK_DURATION;
    return Math.max(TICK_DURATION, roundedDuration);
  }

  const halfTick = TICK_DURATION / 2;
  const totalRange = max - min;

  let weightedSum = 0;

  // Wide enough bounds to cover every rounded tick whose interval can overlap [min, max]
  const firstTickIndex = Math.floor((min - halfTick) / TICK_DURATION);
  const lastTickIndex = Math.ceil((max + halfTick) / TICK_DURATION);

  for (let tickIndex = firstTickIndex; tickIndex <= lastTickIndex; tickIndex++) {
    const roundedDuration = tickIndex * TICK_DURATION;

    // Burst durations can never be shorter than one tick
    const actualDuration = Math.max(TICK_DURATION, roundedDuration);

    // Raw values in this interval round to roundedDuration
    const roundingIntervalMin = roundedDuration - halfTick;
    const roundingIntervalMax = roundedDuration + halfTick;

    // How much of that interval overlaps the actual input range?
    const overlapMin = Math.max(min, roundingIntervalMin);
    const overlapMax = Math.min(max, roundingIntervalMax);
    const overlap = Math.max(0, overlapMax - overlapMin);

    if (overlap === 0) continue;

    weightedSum += actualDuration * overlap;
  }

  return weightedSum / totalRange;
};

export function _averageBurstShots(
  burstTimeMin: number,
  burstTimeMax: number,
  burstRateMin: number,
  burstRateMax: number,
): number {
  let min = burstTimeMin;
  let max = burstTimeMax;

  if (min > max) {
    [min, max] = [max, min];
  }

  // Single fixed burst time
  if (min === max) {
    const roundedBurstTime = Math.round(min / TICK_DURATION) * TICK_DURATION;

    const actualBurstDuration = Math.max(TICK_DURATION, roundedBurstTime);

    return _averageRoundedToNearestInteger(
      actualBurstDuration * burstRateMin,
      actualBurstDuration * burstRateMax,
    );
  }

  const halfTick = TICK_DURATION / 2;
  const totalRange = max - min;

  let weightedShots = 0;

  // Wide enough bounds to cover every rounded tick whose interval can overlap [min, max]
  const firstTickIndex = Math.floor((min - halfTick) / TICK_DURATION);
  const lastTickIndex = Math.ceil((max + halfTick) / TICK_DURATION);

  for (let tickIndex = firstTickIndex; tickIndex <= lastTickIndex; tickIndex++) {
    const roundedBurstTime = tickIndex * TICK_DURATION;

    // Bursts never last less than one tick
    const actualBurstDuration = Math.max(TICK_DURATION, roundedBurstTime);

    // Raw burst times in this interval round to roundedBurstTime
    const roundingIntervalMin = roundedBurstTime - halfTick;
    const roundingIntervalMax = roundedBurstTime + halfTick;

    // How much of that interval overlaps the actual burst-time range?
    const overlapMin = Math.max(min, roundingIntervalMin);
    const overlapMax = Math.min(max, roundingIntervalMax);
    const overlap = Math.max(0, overlapMax - overlapMin);

    if (overlap === 0) continue;

    const averageShotsForThisDuration = _averageRoundedToNearestInteger(
      actualBurstDuration * burstRateMin,
      actualBurstDuration * burstRateMax,
    );

    weightedShots += averageShotsForThisDuration * overlap;
  }

  return weightedShots / totalRange;
}

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
  getScatterDimensions,
  _averageRoundedToNearestTick,
  _getInterpolationByDistanceMinMax,
};
