import { calculatorMember, calculatorUnit } from "../../test-assets/calculator-fixtures";
import { getDpsWeaponPreview } from "../../../src/unitStats/dpsWeaponPreview";
import { getProjectileTravelTime } from "../../../components/unit-cards/weapon-loadout/projectile-calculations";
import {
  getEffectiveWeaponStats,
  getScatterDimensions,
  getSingleWeaponDPS,
  getSingleWeaponScatterShotInputs,
  getWeaponTiming,
} from "../../../src/unitStats/weaponLib";
import { getBaseDistanceForDisplayedRange } from "../../../src/unitStats/dpsCommon";

const veteran = () => {
  const member = calculatorMember({
    accuracy_near: 0.5,
    accuracy_mid: 0.4,
    accuracy_far: 0.3,
    range_min: 5,
  });
  const unit = calculatorUnit({
    cover: "",
    weapon_member: [member],
    def_weapon_member: [member],
    veterancyLevel: 1,
  });
  unit.sbps.veterancyInfo = {
    one: {
      exp: 100,
      modifiers: [
        { id: "WEAPON_ACCURACY_MODIFIER", value: 1.2 },
        { id: "WEAPON_DAMAGE_MODIFIER", value: 1.2 },
        { id: "WEAPON_PENETRATION_MODIFIER", value: 1.1 },
        { id: "WEAPON_OVERALL_ATTACK_SPEED", value: 0.8 },
        { id: "WEAPON_RANGE_MULTIPLICATION_MODIFIER", value: 1.2 },
        { id: "WEAPON_SCATTER", value: 0.8 },
        { id: "WEAPON_AOE_MAX_MEMBER_HIT_MODIFIER", value: 1 },
      ],
    },
  } as any;
  for (const key of ["accuracy", "damage", "penetration", "reload", "scatterAccuracy"] as const)
    unit.custom_modifiers![key] = { type: "percentage", value: 20, enabled: true };
  unit.custom_modifiers!.range = { type: "additive", value: 5, enabled: true };
  return { member, unit };
};

it("shows effective accuracy, damage, penetration, range and scatter without changing the base weapon", () => {
  const { member, unit } = veteran();
  const original = JSON.stringify(member.weapon);
  const stats = getEffectiveWeaponStats(member, unit);
  expect(stats.accuracy_near).toBeCloseTo(0.72);
  expect(stats.damage_min).toBeCloseTo(144);
  expect(stats.penetration_near).toBeCloseTo(132);
  expect(stats.range).toEqual({ min: 5, near: 17, mid: 29, far: 41, max: 53 });
  expect(stats.scatter_distance_scatter_max).toBeCloseTo(
    member.weapon.weapon_bag.scatter_distance_scatter_max * 0.64,
  );
  expect(stats.aoe_damage_max_member).toBe(-1);
  expect(JSON.stringify(member.weapon)).toBe(original);
  const other = calculatorUnit({ weapon_member: [member] });
  expect(getEffectiveWeaponStats(member, other).damage_min).toBe(100);
});

it("matches the solver's direct accuracy, damage, and timing at every displayed breakpoint", () => {
  const { member, unit } = veteran();
  const preview = getDpsWeaponPreview(member, unit);
  const target = calculatorUnit({ cover: "", armor: 1 });
  const scatter = {
    models: [{ id: 1, x: 0, y: 0, enabled: true }],
    targetModelId: 1,
    gunnerAngleDeg: 270,
    samplesPerShot: 144,
  };
  for (const key of ["near", "mid", "far"] as const) {
    const displayed = preview.weapon.weapon_bag.range[key];
    const base = getBaseDistanceForDisplayedRange(unit, displayed);
    const shot = getSingleWeaponScatterShotInputs(
      member,
      base,
      scatter,
      false,
      target,
      unit,
      displayed,
    )!;
    expect(preview.weapon.weapon_bag[`accuracy_${key}`]).toBeCloseTo(shot.directHitChance);
    expect(preview.weapon.weapon_bag.damage_max).toBeCloseTo(shot.directDamage);
    expect(preview.timingAtRange(displayed)).toEqual(
      getWeaponTiming(member.weapon.weapon_bag, base, false, unit),
    );
  }
});

it("keeps firing-cycle timing at the signed breakpoint while scatter and flight use physical distance", () => {
  const member = calculatorMember({
    cooldown_duration_multiplier_mid: 3,
    projectile_type: "artillery",
    scatter_angle_scatter: 10,
  });
  const unit = calculatorUnit({ weapon_member: [member] });
  unit.custom_modifiers!.range = { type: "additive", value: -15, enabled: true };
  const preview = getDpsWeaponPreview(member, unit);
  const bag = preview.weapon.weapon_bag;
  expect(bag.range).toEqual({ min: 0, near: -5, mid: 5, far: 15, max: 25 });
  const nearTiming = preview.timingAtRange(bag.range_distance_near);
  expect(nearTiming).toEqual(getWeaponTiming(member.weapon.weapon_bag, 10));
  expect(nearTiming.rpm).not.toBe(preview.timingAtRange(0).rpm);
  expect(preview.curve[0].x).toBe(0);
  expect(getScatterDimensions(bag.range.near, bag)).toMatchObject({
    width: 0,
    length: 0,
    offset: 0,
  });
  expect(getProjectileTravelTime(bag.range_distance_near, bag)).toBeNull();
  expect(
    getProjectileTravelTime(bag.range_distance_near, {
      ...bag,
      projectile_trajectory_type: "projectile_trajectory",
      projectile_trajectory_time_seconds: 2,
    }),
  ).toBe(2);
});

it("adds flat damage before the infantry multiplier in combat and the preview curve", () => {
  const member = calculatorMember({
    damage_min: 50,
    damage_max: 50,
    target_type_table: [
      {
        unit_type: "infantry",
        dmg_modifier: 0,
        damage_multiplier: 0.5,
        accuracy_multiplier: 1,
        penetration_multiplier: 1,
      },
    ],
  });
  const attacker = calculatorUnit();
  attacker.custom_modifiers!.damage = { type: "additive", value: 10, enabled: true };
  const target = calculatorUnit({ cover: "" });
  const preview = getDpsWeaponPreview(member, attacker);
  const shotsPerSecond = preview.timingAtRange(20).rpm / 60;
  expect(shotsPerSecond).toBeGreaterThan(0);
  expect(preview.weapon.weapon_bag).toMatchObject({ damage_min: 60, damage_max: 60 });
  expect(preview.weapon.weapon_bag.target_type_table).toEqual(
    member.weapon.weapon_bag.target_type_table,
  );
  expect(preview.curve.find(({ x }) => x === 20)!.y).toBeCloseTo(30 * shotsPerSecond);
  expect(getSingleWeaponDPS(member, 20, false, target, attacker)).toBeCloseTo(
    30 * shotsPerSecond,
  );
  const shot = getSingleWeaponScatterShotInputs(
    member,
    20,
    {
      models: [{ id: 1, x: 0, y: 0, enabled: true }],
      targetModelId: 1,
      gunnerAngleDeg: 270,
      samplesPerShot: 1,
    },
    false,
    target,
    attacker,
  )!;
  expect(shot.directDamage).toBe(30);
  expect(shot.splashDamage).toBe(30);
});

it("honors absolute and additive overrides in the display and mini graph", () => {
  const { member, unit } = veteran();
  unit.custom_modifiers!.accuracy = { type: "absolute", value: 0.25, enabled: true };
  unit.custom_modifiers!.damage = { type: "absolute", value: 50, enabled: true };
  const preview = getDpsWeaponPreview(member, unit);
  expect(preview.weapon.weapon_bag.accuracy_near).toBe(0.25);
  expect(preview.weapon.weapon_bag.damage_max).toBe(50);
  const base = calculatorUnit({ cover: "", weapon_member: [member] });
  const baseline = getDpsWeaponPreview(member, base);
  // The same weapon now fires with its current accuracy/damage/timing, not dps_default.
  expect(preview.curve.find((p) => p.x > 10)!.y).not.toBe(
    baseline.curve.find((p) => p.x > 10)!.y,
  );
  unit.custom_modifiers!.damage = { type: "additive", value: 10, enabled: true };
  expect(getEffectiveWeaponStats(member, unit).damage_max).toBeCloseTo(132);
});

it("includes Ranger's passive and vehicle upgrades only on the affected weapon", () => {
  const member = calculatorMember({
    aoe_outer_radius: 0,
    moving_can_fire_while_moving: false,
    burst_rate_of_fire_min: 10,
  });
  member.hardpointIndex = 1;
  const ranger = calculatorUnit({ weapon_member: [member], rangerFireOnMove: true });
  expect(getEffectiveWeaponStats(member, ranger).accuracy_near).toBeCloseTo(1.2);
  expect(getEffectiveWeaponStats(member, ranger).moving_can_fire_while_moving).toBe(true);
  const tank = calculatorUnit({
    unit_type: "vehicles",
    weapon_member: [member],
    heavyBarrelsEnabled: true,
    dakCoaxUpgradeEnabled: true,
  });
  expect(getEffectiveWeaponStats(member, tank)).toMatchObject({
    damage_max: 100,
    range_max: 40,
    burst_rate_of_fire_min: 10,
  });
  tank.heavyBarrels = { burstRateMultiplier: 1.4, rangeAddition: 7 };
  tank.superiorFireDrillsDamageMultiplier = 1.8;
  expect(getEffectiveWeaponStats(member, tank)).toMatchObject({
    damage_max: 180,
    range_max: 47,
    burst_rate_of_fire_min: 14,
  });
  const pintle = { ...member, hardpointIndex: 3 };
  expect(getEffectiveWeaponStats(pintle, tank).damage_max).toBe(100);
});

it("treats a restored negative absolute attack-time factor as zero throughout the firing cycle", () => {
  const { member, unit } = veteran();
  unit.custom_modifiers!.overallAttackSpeed = { type: "absolute", enabled: true, value: -0.5 };
  const timing = getWeaponTiming(member.weapon.weapon_bag, 20, false, unit);
  unit.custom_modifiers!.overallAttackSpeed.value = 0;
  expect(timing).toEqual(getWeaponTiming(member.weapon.weapon_bag, 20, false, unit));
});

it("keeps the preview curve bounded for very large custom ranges", () => {
  const member = calculatorMember();
  const unit = calculatorUnit({ weapon_member: [member] });
  unit.custom_modifiers!.range = { type: "absolute", value: 10000, enabled: true };
  const preview = getDpsWeaponPreview(member, unit);
  expect(preview.curve).toHaveLength(201);
  expect(preview.curve.at(-1)!.x).toBe(10000);
});

it("shows no firing while moving unless a passive allows it", () => {
  const member = calculatorMember({ moving_can_fire_while_moving: false });
  const unit = calculatorUnit({ is_moving: true, weapon_member: [member] });
  expect(getDpsWeaponPreview(member, unit).timingAtRange(20).rpm).toBe(0);
  expect(getDpsWeaponPreview(member, unit).curve.every(({ y }) => y === 0)).toBe(true);
  unit.rangerFireOnMove = true;
  expect(getDpsWeaponPreview(member, unit).timingAtRange(20).rpm).toBeGreaterThan(0);
});
