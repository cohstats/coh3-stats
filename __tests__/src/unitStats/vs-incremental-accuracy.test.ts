import {
  getSingleWeaponDPS,
  getSingleWeaponScatterShotInputs,
  getSingleWeaponScatterDPS,
  getWeaponScatterMultiplier,
} from "../../../src/unitStats/weaponLib";
import {
  getScatterBand,
  simulateScatterShotDetails,
} from "../../../src/unitStats/scatterSimulation";
import {
  getWeaponDPSData,
  getCombatDps,
  getDpsVsHealth,
  createDefaultCustomModifiers,
  updateHealth,
  getUnitModelCount,
  setUnitVeterancyLevel,
} from "../../../src/unitStats/dpsCommon";
import type { CustomizableUnit, WeaponMember } from "../../../src/unitStats/dpsCommon";
import type { WeaponStatsType } from "../../../src/unitStats/mappingWeapon";

const baseBag = {
  // Basic weapon stats
  accuracy_near: 0.8,
  accuracy_mid: 0.6,
  accuracy_far: 0.4,
  damage_min: 80,
  damage_max: 120,
  penetration_near: 100,
  penetration_mid: 80,
  penetration_far: 60,
  range_distance_near: 10,
  range_distance_mid: 20,
  range_distance_far: 30,
  range_min: 0,
  range_max: 35,

  // AOE stats
  aoe_accuracy_far: 1,
  aoe_accuracy_mid: 1,
  aoe_accuracy_near: 1,
  aoe_penetration_far: 50,
  aoe_penetration_mid: 60,
  aoe_penetration_near: 70,
  aoe_outer_radius: 5,
  aoe_damage_far: 40,
  aoe_damage_mid: 50,
  aoe_damage_near: 60,
  aoe_damage_max_member: 4,
  aoe_distance_near: 1,
  aoe_distance_mid: 2.5,
  aoe_distance_far: 4,

  // Scatter stats for AOE calculation
  scatter_distance_scatter_offset: 0.25,
  scatter_distance_scatter_max: 4,
  scatter_angle_scatter: 5,
  scatter_distance_scatter_ratio: 1,

  // RPM calculation stats
  fire_aim_time_min: 1,
  fire_aim_time_max: 2,
  aim_time_multiplier_near: 1,
  aim_time_multiplier_mid: 1,
  aim_time_multiplier_far: 1,
  cooldown_duration_min: 2,
  cooldown_duration_max: 3,
  cooldown_duration_multiplier_near: 1,
  cooldown_duration_multiplier_mid: 1,
  cooldown_duration_multiplier_far: 1,
  fire_wind_up: 0.5,
  fire_wind_down: 0.5,
  reload_duration_min: 3,
  reload_duration_max: 4,
  reload_duration_multiplier_near: 1,
  reload_duration_multiplier_mid: 1,
  reload_duration_multiplier_far: 1,
  reload_frequency_min: 1,
  reload_frequency_max: 2,

  // Movement stats
  moving_can_fire_while_moving: true,
  moving_accuracy_multiplier: 0.5,
  moving_cooldown_multiplier: 1.5,
  moving_burst_multiplier: 1,

  // Burst stats
  burst_can_burst: false,
  burst_duration_min: 0,
  burst_duration_max: 0,
  burst_duration_multiplier_near: 1,
  burst_duration_multiplier_mid: 1,
  burst_duration_multiplier_far: 1,
  burst_rate_of_fire_min: 0,
  burst_rate_of_fire_max: 0,
  burst_rate_of_fire_multiplier_near: 1,
  burst_rate_of_fire_multiplier_mid: 1,
  burst_rate_of_fire_multiplier_far: 1,

  // Cover stats
  cover_table_tp_defcover_accuracy_multiplier: 1,
  cover_table_tp_defcover_damage_multiplier: 1,
  cover_table_tp_defcover_penetration_multiplier: 1,

  // Target type table
  target_type_table: [],

  // Range object
  range: {
    near: 10,
    mid: 20,
    far: 30,
    min: 0,
    max: 35,
  },
} as unknown as WeaponStatsType;
const member = (): WeaponMember =>
  ({
    weapon_id: "test_mg",
    num: 1,
    crew_size: 1,
    weapon: {
      id: "test_mg",
      path: "weapons/small_arms/test",
      weapon_bag: {
        ...baseBag,
        accuracy_near: 0.1,
        accuracy_mid: 0.1,
        accuracy_far: 0.1,
        damage_min: 10,
        damage_max: 10,
        aoe_outer_radius: 0,
        burst_can_burst: true,
        burst_duration_min: 1,
        burst_duration_max: 1,
        burst_rate_of_fire_min: 10,
        burst_rate_of_fire_max: 10,
        burst_incremental_target_table_accuracy_multiplier: 1.2,
        burst_incremental_target_table_search_radius_near: 0,
        burst_incremental_target_table_search_radius_mid: 0,
        burst_incremental_target_table_search_radius_far: 0,
      },
    },
  }) as unknown as WeaponMember;
const unit = (count = 4): CustomizableUnit =>
  ({
    id: "test_infantry",
    unit_type: "infantry",
    is_moving: false,
    cover: "",
    armor: 1,
    target_size: 1,
    hitpoints: 80,
    health: count * 80,
    weapon_member: [{ ...member(), num: count }],
    sbps: {},
    ebps_default: { unitTypes: ["infantry"] },
    custom_modifiers: createDefaultCustomModifiers(),
  }) as unknown as CustomizableUnit;

describe("veterancy squad-member count", () => {
  const squad = () => {
    const result = unit(4);
    result.def_member = "crew";
    result.weapon_member[0].ebps = { id: "crew" } as any;
    result.def_weapon_member = result.weapon_member.map((member) => ({ ...member }));
    result.sbps = {
      veterancyInfo: {
        one: { exp: 100, modifiers: [] },
        two: { exp: 200, modifiers: [{ id: "COUNT", value: 1 }] },
        three: { exp: 300, modifiers: [] },
      },
    } as any;
    return result;
  };

  it("adds a normal weapon, a human target and that member's HP", () => {
    const attacker = squad(),
      target = unit(1);
    const original = getCombatDps(attacker, target)[15].y;
    setUnitVeterancyLevel(attacker, 2);
    expect(attacker.weapon_member[0].num).toBe(5);
    expect(getUnitModelCount(attacker)).toBe(5);
    expect(attacker.health).toBe(400);
    expect(getCombatDps(attacker, target)[15].y).toBeCloseTo((original * 5) / 4);
    expect(attacker.def_weapon_member[0].num).toBe(4);
  });

  it("does not accumulate extra members when switching ranks or toggling veterancy", () => {
    const value = squad();
    for (const [level, count] of [
      [2, 5],
      [2, 5],
      [3, 5],
      [1, 4],
      [2, 5],
      [0, 4],
    ]) {
      setUnitVeterancyLevel(value, level);
      expect(value.weapon_member[0].num).toBe(count);
      expect(value.health).toBe(count * 80);
    }
  });

  it("preserves custom weapons and manual quantity edits", () => {
    const value = squad();
    const upgrade = { ...member(), weapon_id: "custom_lmg", num: 1 };
    value.weapon_member[0].num = 3;
    value.weapon_member.push(upgrade);
    setUnitVeterancyLevel(value, 2);
    expect(value.weapon_member[0].num).toBe(4);
    expect(upgrade.num).toBe(1);
    value.weapon_member[0].num = 3;
    setUnitVeterancyLevel(value, 3);
    expect(value.weapon_member[0].num).toBe(3);
    setUnitVeterancyLevel(value, 0);
    expect(value.weapon_member[0].num).toBe(2);
    expect(upgrade.num).toBe(1);
  });

  it("equips only the extra member when the normal weapon was removed", () => {
    const value = squad();
    const upgrade = { ...member(), weapon_id: "custom_lmg", num: 1 };
    value.weapon_member = [upgrade];
    setUnitVeterancyLevel(value, 2);
    expect(value.weapon_member.map(({ weapon_id, num }) => ({ weapon_id, num }))).toEqual([
      { weapon_id: "custom_lmg", num: 1 },
      { weapon_id: "test_mg", num: 1 },
    ]);
    expect(value.health).toBe(160);
  });

  it("includes the additional defender in VS incremental accuracy", () => {
    const attacker = unit(1),
      target = squad();
    const original = getWeaponDPSData([attacker, target])[0][15].y;
    setUnitVeterancyLevel(target, 2);
    expect(getWeaponDPSData([attacker, target])[0][15].y).toBeCloseTo(original * 1.2);
  });
});

describe("veterancy AoE member cap", () => {
  const scatter = {
    models: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, x: i * 0.2, y: 0, enabled: true })),
    targetModelId: 1,
    gunnerAngleDeg: 270,
    samplesPerShot: 144,
  };
  const aoeAttacker = () => {
    const result = unit(1);
    result.weapon_member[0].weapon.weapon_bag = {
      ...baseBag,
      aoe_shape: "circle",
      aoe_damage_max_member: 2,
      damage_min: 10,
      damage_max: 10,
      accuracy_near: 1,
      accuracy_mid: 1,
      accuracy_far: 1,
      aoe_damage_near: 1,
      aoe_damage_mid: 1,
      aoe_damage_far: 1,
    };
    result.sbps = {
      veterancyInfo: {
        one: { exp: 100, modifiers: [{ id: "WEAPON_AOE_MAX_MEMBER_HIT_MODIFIER", value: 1 }] },
      },
    } as any;
    return result;
  };

  it("raises a cap of two to three for both per-shot details and scatter DPS", () => {
    const attacker = aoeAttacker(),
      target = unit(4);
    const weapon = attacker.weapon_member[0];
    const original = getSingleWeaponScatterDPS(weapon, 20, scatter, false, target, attacker);
    setUnitVeterancyLevel(attacker, 1);
    const shot = getSingleWeaponScatterShotInputs(weapon, 20, scatter, false, target, attacker)!;
    expect(shot.weapon.aoe_damage_max_member).toBe(3);
    const details = simulateScatterShotDetails(shot);
    expect(details.totalExpectedDamage).toBeCloseTo(30);
    expect(details.models.filter((model) => model.averageDamage > 0)).toHaveLength(3);
    expect(getSingleWeaponScatterDPS(weapon, 20, scatter, false, target, attacker)).toBeCloseTo(
      original * 1.5,
    );
    expect(weapon.weapon.weapon_bag.aoe_damage_max_member).toBe(2);
    setUnitVeterancyLevel(attacker, 0);
    expect(getSingleWeaponScatterDPS(weapon, 20, scatter, false, target, attacker)).toBeCloseTo(
      original,
    );
  });

  it.each([-1, 0])("preserves the unlimited cap sentinel %s", (cap) => {
    const attacker = aoeAttacker(),
      target = unit(4);
    const weapon = attacker.weapon_member[0];
    weapon.weapon.weapon_bag.aoe_damage_max_member = cap;
    setUnitVeterancyLevel(attacker, 1);
    const shot = getSingleWeaponScatterShotInputs(weapon, 20, scatter, false, target, attacker)!;
    expect(shot.weapon.aoe_damage_max_member).toBe(cap);
    expect(simulateScatterShotDetails(shot).totalExpectedDamage).toBeCloseTo(40);
  });
});

describe("anti-vehicle veterancy follows EBPS target tags", () => {
  it.each([
    ["vehicles", ["vehicle"], true],
    ["emplacements", ["vehicle"], true],
    ["infantry", ["vehicle", "infantry"], true],
    ["vehicles", [], false],
    ["vehicles", ["infantry"], false],
    ["vehicles", ["vehicles"], false],
    ["vehicles", ["Vehicle"], false],
  ] as const)("checks tags for %s with %j", (type, tags, matches) => {
    const attacker = unit(1), target = unit(1);
    target.unit_type = type;
    target.ebps_default.unitTypes = [...tags];
    const weapon = attacker.weapon_member[0];
    weapon.weapon.weapon_bag = {
      ...baseBag,
      aoe_shape: "circle",
      damage_min: 10,
      damage_max: 10,
      accuracy_near: 1,
      accuracy_mid: 1,
      accuracy_far: 1,
      aoe_damage_near: 1,
      aoe_damage_mid: 1,
      aoe_damage_far: 1,
      target_type_table: [{
        unit_type: "vehicle", dmg_modifier: 0, damage_multiplier: 1.5,
        accuracy_multiplier: 1, penetration_multiplier: 1,
      }],
    };
    attacker.sbps = { veterancyInfo: { one: { modifiers: [
      { id: "WEAPON_DAMAGE_VS_VEHICLES_ADDITION", value: 5 },
      { id: "WEAPON_DAMAGE_VS_VEHICLES_MULTIPLIER", value: 2 },
    ] } } } as any;
    const scatter = {
      models: [{ id: 1, x: 0, y: 0, enabled: true }],
      targetModelId: 1, gunnerAngleDeg: 270, samplesPerShot: 144,
    };
    const ordinary = getSingleWeaponDPS(weapon, 20, false, target, attacker);
    const geometric = getSingleWeaponScatterDPS(weapon, 20, scatter, false, target, attacker);
    attacker.veterancyLevel = 1;
    const multiplier = matches ? 3 : 1;
    expect(getSingleWeaponDPS(weapon, 20, false, target, attacker)).toBeCloseTo(ordinary * multiplier);
    expect(getSingleWeaponScatterDPS(weapon, 20, scatter, false, target, attacker)).toBeCloseTo(geometric * multiplier);
    const shot = getSingleWeaponScatterShotInputs(weapon, 20, scatter, false, target, attacker)!;
    expect(shot.directFullDamage).toBe(matches ? 45 : 10);
    expect(shot.splashDamage).toBe(matches ? 45 : 10);
  });
});

describe("defenders without weapons", () => {
  it.each(["vehicles", "emplacements"])(
    "keeps an unarmed %s target damageable with its full HP",
    (type) => {
      const attacker = unit(1),
        target = unit(1);
      target.unit_type = type;
      const expected = getCombatDps(attacker, target)[20].y;
      expect(expected).toBeGreaterThan(0);

      target.weapon_member = [];
      updateHealth(target);
      expect(target.health).toBe(80);
      expect(getCombatDps(attacker, target)[20].y).toBeCloseTo(expected);

      target.weapon_member = [{ ...member(), num: 0 }];
      updateHealth(target);
      expect(target.health).toBe(80);
      expect(getCombatDps(attacker, target)[20].y).toBeCloseTo(expected);
    },
  );

  it("still treats an empty infantry squad as having no targets", () => {
    const attacker = unit(1),
      target = unit(1);
    target.weapon_member = [];
    updateHealth(target);
    expect(target.health).toBe(0);
    expect(getCombatDps(attacker, target)[20].y).toBe(0);
  });
});

describe("VS incremental accuracy assumes all other defender models are in the area", () => {
  it("applies multiplier^(N-1) to both VS directions", () => {
    const first = unit(4),
      second = unit(6);
    const curves = getWeaponDPSData([first, second]);
    expect(curves[0][15].y).toBeCloseTo(getCombatDps(first, second)[15].y * 1.2 ** 5);
    expect(curves[1][15].y).toBeCloseTo(getCombatDps(second, first)[15].y * 1.2 ** 3);
    expect(curves[0][15].y).toBeGreaterThan(0);
  });

  it("uses current positive loadout counts and counts team-weapon operators as humans", () => {
    const attacker = unit(1),
      target = unit(1);
    target.unit_type = "team_weapons";
    target.weapon_member = [
      { ...member(), num: 1, crew_size: 2 },
      { ...member(), num: 2, crew_size: 1 },
      { ...member(), num: 0, crew_size: 1 },
    ];
    expect(getWeaponDPSData([attacker, target])[0][15].y).toBeCloseTo(
      getCombatDps(attacker, target)[15].y * 1.2 ** 3,
    );
    target.weapon_member[1].num = 1;
    expect(getWeaponDPSData([attacker, target])[0][15].y).toBeCloseTo(
      getCombatDps(attacker, target)[15].y * 1.2 ** 2,
    );
  });

  it("does not grant extra-model accuracy for vehicles, one model or no defender", () => {
    const attacker = unit(1),
      vehicle = unit(6);
    vehicle.unit_type = "vehicles";
    for (const target of [vehicle, unit(1), undefined]) {
      expect(getWeaponDPSData(target ? [attacker, target] : [attacker])[0][15].y).toBeCloseTo(
        getCombatDps(attacker, target)[15].y,
      );
    }
  });

  it("keeps ordinary non-burst weapons unchanged", () => {
    const attacker = unit(1),
      target = unit(6);
    attacker.weapon_member[0].weapon.weapon_bag.burst_can_burst = false;
    expect(getWeaponDPSData([attacker, target])[0][15].y).toBeCloseTo(
      getCombatDps(attacker, target)[15].y,
    );
  });

  it("applies the same bonus to DPS versus health", () => {
    const attacker = unit(1),
      target = unit(4);
    const dps = getWeaponDPSData([attacker, target])[0][15].y;
    expect(getDpsVsHealth([], attacker, target)[15].y).toBeCloseTo((dps / target.health) * 100);
  });

  it("keeps Compare's geometry-based incremental accuracy separate from the VS assumption", () => {
    const attacker = unit(1),
      target = unit(6);
    const bag = attacker.weapon_member[0].weapon.weapon_bag;
    bag.burst_incremental_target_table_search_radius_near = 10;
    bag.burst_incremental_target_table_search_radius_mid = 10;
    bag.burst_incremental_target_table_search_radius_far = 10;
    const scatter = {
      models: [
        { id: 1, x: 0, y: 0, enabled: true },
        { id: 2, x: 50, y: 0, enabled: true },
      ],
      targetModelId: 1,
      gunnerAngleDeg: 0,
      samplesPerShot: 144,
    };
    const geometric = getSingleWeaponDPS(
      attacker.weapon_member[0],
      15,
      false,
      target,
      attacker,
      scatter,
    );
    expect(
      getSingleWeaponDPS(attacker.weapon_member[0], 15, false, target, attacker, scatter, true),
    ).toBeCloseTo(geometric);
    expect(getWeaponDPSData([attacker, target])[0][15].y).toBeGreaterThan(geometric);
  });

  it("applies incremental accuracy after a manual absolute accuracy override", () => {
    const attacker = unit(1),
      target = unit(4);
    attacker.custom_modifiers!.accuracy = { type: "absolute", value: 0.1, enabled: true };
    expect(getWeaponDPSData([attacker, target])[0][15].y).toBeCloseTo(
      getCombatDps(attacker, target)[15].y * 1.2 ** 3,
    );
  });

  it("caps final accuracy at 100 percent", () => {
    const attacker = unit(1),
      target = unit(6);
    const bag = attacker.weapon_member[0].weapon.weapon_bag;
    bag.accuracy_near = bag.accuracy_mid = bag.accuracy_far = 0.8;
    const result = getWeaponDPSData([attacker, target])[0][15].y;
    bag.burst_incremental_target_table_accuracy_multiplier = 1;
    bag.accuracy_near = bag.accuracy_mid = bag.accuracy_far = 1;
    expect(result).toBeCloseTo(getWeaponDPSData([attacker, target])[0][15].y);
  });
});

describe("manual scatter accuracy and defensive modifiers", () => {
  const scatter = {
    models: [{ id: 1, x: 0, y: 0, enabled: true }],
    targetModelId: 1,
    gunnerAngleDeg: 270,
    samplesPerShot: 576,
  };
  const aoeAttacker = () => {
    const attacker = unit(1);
    attacker.weapon_member[0].weapon.weapon_bag = {
      ...baseBag,
      aoe_shape: "circle",
      damage_min: 10,
      damage_max: 10,
      aoe_damage_near: 1,
      aoe_damage_mid: 1,
      aoe_damage_far: 1,
    };
    return attacker;
  };

  it.each([20, -20, 100])(
    "applies %s%% damage reduction to ordinary and scatter damage",
    (value) => {
      const attacker = aoeAttacker(),
        target = unit(1);
      const weapon = attacker.weapon_member[0];
      const ordinary = getSingleWeaponDPS(weapon, 20, false, target, attacker);
      const aoe = getSingleWeaponScatterDPS(weapon, 20, scatter, false, target, attacker);
      target.custom_modifiers!.receivedDamage = { type: "percentage", value, enabled: true };
      const multiplier = 1 - value / 100;
      expect(getSingleWeaponDPS(weapon, 20, false, target, attacker)).toBeCloseTo(
        ordinary * multiplier,
      );
      expect(getSingleWeaponScatterDPS(weapon, 20, scatter, false, target, attacker)).toBeCloseTo(
        aoe * multiplier,
      );
      const shot = getSingleWeaponScatterShotInputs(
        weapon,
        20,
        scatter,
        false,
        target,
        attacker,
      )!;
      expect(shot.directDamage).toBeCloseTo(10 * multiplier);
      expect(shot.splashDamage).toBeCloseTo(10 * multiplier);
    },
  );

  it("keeps negative received accuracy beneficial and combines it with damage reduction", () => {
    const attacker = unit(1),
      target = unit(1);
    const original = getSingleWeaponDPS(attacker.weapon_member[0], 20, false, target, attacker);
    target.custom_modifiers!.receivedAccuracy = { type: "percentage", value: -20, enabled: true };
    target.custom_modifiers!.receivedDamage = { type: "percentage", value: 20, enabled: true };
    expect(
      getSingleWeaponDPS(attacker.weapon_member[0], 20, false, target, attacker),
    ).toBeCloseTo(original * 0.8 * 0.8);
  });

  it("combines manual scatter accuracy with veterancy for the solver and preview geometry", () => {
    const attacker = aoeAttacker();
    attacker.sbps = {
      veterancyInfo: { one: { modifiers: [{ id: "WEAPON_SCATTER", value: 0.75 }] } },
    } as any;
    attacker.veterancyLevel = 1;
    attacker.custom_modifiers!.scatterAccuracy = { type: "percentage", value: 20, enabled: true };
    const shot = getSingleWeaponScatterShotInputs(
      attacker.weapon_member[0],
      20,
      scatter,
      false,
      undefined,
      attacker,
    )!;
    expect(shot.scatterMultiplier).toBeCloseTo(0.6);
    expect(getWeaponScatterMultiplier(attacker)).toBeCloseTo(shot.scatterMultiplier!);
    const original = getScatterBand(shot.weapon, 20);
    const modified = getScatterBand(shot.weapon, 20, false, shot.scatterMultiplier);
    expect(modified.angleWidth).toBeCloseTo(original.angleWidth * 0.6);
    expect(modified.maxRange - modified.minRange).toBeCloseTo(
      (original.maxRange - original.minRange) * 0.6,
    );
    attacker.custom_modifiers!.scatterAccuracy.enabled = false;
    expect(getWeaponScatterMultiplier(attacker)).toBeCloseTo(0.75);
  });
});
