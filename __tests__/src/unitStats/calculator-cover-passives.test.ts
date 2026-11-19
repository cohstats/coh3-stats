import { calculatorMember, calculatorUnit } from "../../test-assets/calculator-fixtures";
import {
  getSingleWeaponDPS,
  getSingleWeaponScatterShotInputs,
  getSingleWeaponScatterDPS,
  getWeaponRpm,
} from "../../../src/unitStats/weaponLib";
import {
  simulateScatterShotDetails,
  type ScatterDpsOptions,
} from "../../../src/unitStats/scatterSimulation";
import { mapCustomizableUnit } from "../../../src/unitStats/dpsCommon";
import { getUpgradedVehicleWeaponBag } from "../../../src/unitStats/vehicleUpgradeEffects";
import type { AbilitiesType } from "../../../src/unitStats/mappingAbilities";
import { isProtectedByDirectionalCover } from "../../../src/unitStats/combatCover";

const scatter: ScatterDpsOptions = {
  models: [{ id: 1, x: 0, y: 0, enabled: true }],
  targetModelId: 1,
  gunnerAngleDeg: 270,
  samplesPerShot: 1,
};

const shot = (member = calculatorMember(), target = calculatorUnit(), options = scatter) =>
  getSingleWeaponScatterShotInputs(member, 20, options, false, target)!;

it.each([
  ["percentage", 20, 130],
  ["absolute", 200, 210],
  ["additive", 20, 130],
] as const)(
  "applies frontal veterancy after %s armor in both DPS paths",
  (type, value, expectedArmor) => {
    const target = calculatorUnit({ armor: 100, cover: "", veterancyLevel: 1 });
    target.sbps.veterancyInfo = {
      one: { exp: 100, modifiers: [{ id: "FRONT_ARMOR_ADDITION", value: 10 }] },
    } as typeof target.sbps.veterancyInfo;
    target.custom_modifiers!.armor = { type, value, enabled: true };
    const member = calculatorMember();
    const inputs = shot(member, target);
    expect(inputs.targetArmor).toBe(expectedArmor);
    expect(inputs.directPenetrationChance).toBeCloseTo(100 / expectedArmor);
    const baseDps = getSingleWeaponDPS(
      member,
      20,
      false,
      calculatorUnit({ cover: "", armor: 1 }),
    );
    expect(getSingleWeaponDPS(member, 20, false, target)).toBeCloseTo(
      (baseDps * 100) / expectedArmor,
    );
  },
);

it.each(["light", "heavy"])(
  "bypasses %s cover damage on projectile accuracy hits in both paths",
  (cover) => {
    const target = calculatorUnit({ cover });
    const member = calculatorMember();
    expect(simulateScatterShotDetails(shot(member, target)).totalExpectedDamage).toBeCloseTo(100);
    const normal = getSingleWeaponDPS(member, 20, false, target);
    expect(normal).toBeCloseTo((100 * getWeaponRpm(member.weapon.weapon_bag, 20)) / 60);
  },
);

it("applies shooter-origin cover to successful hits and scattered impacts", () => {
  const member = calculatorMember({ always_calculate_cover_from_shooting_position: true });
  expect(simulateScatterShotDetails(shot(member)).totalExpectedDamage).toBeCloseTo(50);
  member.weapon.weapon_bag.accuracy_near =
    member.weapon.weapon_bag.accuracy_mid =
    member.weapon.weapon_bag.accuracy_far =
      0;
  expect(
    simulateScatterShotDetails(
      shot(member, calculatorUnit(), {
        ...scatter,
        directionalCover: { minX: -1, maxX: 1, y: -0.5 },
      }),
    ).totalExpectedDamage,
  ).toBeCloseTo(50);
});

it("keeps cover on projectile weapons without AoE in both direct and scatter fallback paths", () => {
  const member = calculatorMember({ aoe_outer_radius: 0 });
  const covered = calculatorUnit();
  const uncovered = calculatorUnit({ cover: "" });
  expect(getSingleWeaponDPS(member, 20, false, covered)).toBeCloseTo(
    getSingleWeaponDPS(member, 20, false, uncovered) * 0.5,
  );
  expect(getSingleWeaponScatterDPS(member, 20, scatter, false, covered)).toBeCloseTo(
    getSingleWeaponScatterDPS(member, 20, scatter, false, uncovered) * 0.5,
  );
  const behind = {
    ...scatter,
    gunnerAngleDeg: 90,
    directionalCover: { minX: -1, maxX: 1, y: -0.5 },
  };
  expect(getSingleWeaponScatterDPS(member, 20, behind, false, covered)).toBeCloseTo(
    getSingleWeaponScatterDPS(member, 20, behind, false, uncovered),
  );
});

it.each([270, 90, 0])("uses the shooter's actual position at bearing %s for cover", (bearing) => {
  const options = {
    ...scatter,
    gunnerAngleDeg: bearing,
    directionalCover: { minX: -1, maxX: 1, y: -0.5 },
  };
  const member = calculatorMember({ always_calculate_cover_from_shooting_position: true });
  const expected = bearing === 270 ? 50 : 100;
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), options)).totalExpectedDamage,
  ).toBeCloseTo(expected);
  member.weapon.weapon_bag.accuracy_near =
    member.weapon.weapon_bag.accuracy_mid =
    member.weapon.weapon_bag.accuracy_far =
      0;
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), options)).totalExpectedDamage,
  ).toBeCloseTo(expected);
});

it("uses the shooter's side for accuracy and for non-AoE damage as well", () => {
  const options = { ...scatter, directionalCover: { minX: -1, maxX: 1, y: -0.5 } };
  const member = calculatorMember({
    projectile_type: "none",
    always_calculate_cover_from_shooting_position: true,
    aoe_outer_radius: 0,
    cover_table_tp_heavy_cover_accuracy_multiplier: 0.5,
  });
  const front = getSingleWeaponScatterDPS(member, 20, options, false, calculatorUnit());
  const back = getSingleWeaponScatterDPS(
    member,
    20,
    { ...options, gunnerAngleDeg: 90 },
    false,
    calculatorUnit(),
  );
  expect(back).toBeCloseTo(front * 4);
});

it.each([
  [{ x: 0, y: -20 }, { x: 0, y: 0 }, true],
  [{ x: 0, y: 20 }, { x: 0, y: 0 }, false],
  [{ x: 0, y: -20 }, { x: 0, y: -1 }, false],
  [{ x: 0, y: 20 }, { x: 0, y: -1 }, true],
  [{ x: 20, y: -20 }, { x: 20, y: 0 }, false],
  [{ x: -1, y: -0.5 }, { x: 1, y: -0.5 }, false],
] as const)(
  "checks whether the cover segment lies between %j and %j",
  (origin, model, expected) => {
    expect(isProtectedByDirectionalCover({ minX: -1, maxX: 1, y: -0.5 }, origin, model)).toBe(
      expected,
    );
  },
);

it("tests the damage origin separately for models on opposite sides of the line", () => {
  const options = {
    ...scatter,
    models: [...scatter.models, { id: 2, x: 0, y: -1, enabled: true }],
    directionalCover: { minX: -1, maxX: 1, y: -0.5 },
  };
  const member = calculatorMember();
  const projectile = simulateScatterShotDetails(shot(member, calculatorUnit(), options));
  expect(projectile.models.map(({ averageDamage }) => averageDamage)).toEqual([100, 50]);
  member.weapon.weapon_bag.always_calculate_cover_from_shooting_position = true;
  const shooter = simulateScatterShotDetails(shot(member, calculatorUnit(), options));
  expect(shooter.models.map(({ averageDamage }) => averageDamage)).toEqual([50, 100]);
});

it("also bypasses cover for nearby models caught in a projectile accuracy-hit explosion", () => {
  const options = {
    ...scatter,
    models: [...scatter.models, { id: 2, x: 0.5, y: 0, enabled: true }],
  };
  const member = calculatorMember();
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), options)).totalExpectedDamage,
  ).toBeCloseTo(200);
  member.weapon.weapon_bag.always_calculate_cover_from_shooting_position = true;
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), options)).totalExpectedDamage,
  ).toBeCloseTo(100);
});

it("checks projectile misses against the fixed front side of the cover line", () => {
  const options = { ...scatter, directionalCover: { minX: -1, maxX: 1, y: -0.5 } };
  const member = calculatorMember({ accuracy_near: 0, accuracy_mid: 0, accuracy_far: 0 });
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), options)).totalExpectedDamage,
  ).toBeCloseTo(100);
  member.weapon.weapon_bag.scatter_distance_scatter_offset = -1;
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), options)).totalExpectedDamage,
  ).toBeCloseTo(50);
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), { ...options, gunnerAngleDeg: 90 }))
      .totalExpectedDamage,
  ).toBeCloseTo(100);
  expect(simulateScatterShotDetails(shot(member)).totalExpectedDamage).toBeCloseTo(50);
  // Keep the impact in front of the line while moving the gunner behind it.
  member.weapon.weapon_bag.scatter_distance_scatter_offset = 1;
  expect(
    simulateScatterShotDetails(shot(member, calculatorUnit(), { ...options, gunnerAngleDeg: 90 }))
      .totalExpectedDamage,
  ).toBeCloseTo(50);
});

it.each([9.99, 10, 10.01, 11, 15])(
  "applies the point-blank threshold at %s metres without bypassing garrison",
  (distance) => {
    const member = calculatorMember({
      behaviour_point_blank: true,
      always_calculate_cover_from_shooting_position: true,
    });
    const target = calculatorUnit();
    const result = getSingleWeaponScatterShotInputs(member, distance, scatter, false, target)!;
    expect(simulateScatterShotDetails(result).totalExpectedDamage).toBeCloseTo(
      distance <= 10 ? 100 : 50,
    );
    const uncoveredDps = getSingleWeaponDPS(
      member,
      distance,
      false,
      calculatorUnit({ cover: "" }),
    );
    expect(getSingleWeaponDPS(member, distance, false, target)).toBeCloseTo(
      uncoveredDps * (distance <= 10 ? 1 : 0.5),
    );
    target.cover = "garrison";
    expect(
      simulateScatterShotDetails(
        getSingleWeaponScatterShotInputs(member, distance, scatter, false, target)!,
      ).totalExpectedDamage,
    ).toBeCloseTo(25);
    expect(getSingleWeaponDPS(member, distance, false, target)).toBeCloseTo(uncoveredDps * 0.25);
  },
);

it("tests point-blank cover at the displayed distance even when the weapon curve is shifted", () => {
  const member = calculatorMember({
    behaviour_point_blank: true,
    always_calculate_cover_from_shooting_position: true,
  });
  const target = calculatorUnit();
  const inputs = getSingleWeaponScatterShotInputs(
    member,
    5,
    scatter,
    false,
    target,
    undefined,
    15,
  )!;
  expect(simulateScatterShotDetails(inputs).totalExpectedDamage).toBeCloseTo(50);
  expect(
    getSingleWeaponDPS(member, 5, false, target, undefined, undefined, false, 15),
  ).toBeCloseTo(getSingleWeaponDPS(member, 5, false, calculatorUnit({ cover: "" })) * 0.5);
});

it("keeps garrison mitigation on projectile hits, including absolute manual damage", () => {
  const attacker = calculatorUnit();
  attacker.custom_modifiers!.damage = { enabled: true, type: "absolute", value: 200 };
  const target = calculatorUnit({ cover: "garrison" });
  const member = calculatorMember({ behaviour_point_blank: true });
  const inputs = getSingleWeaponScatterShotInputs(member, 5, scatter, false, target, attacker)!;
  expect(simulateScatterShotDetails(inputs).totalExpectedDamage).toBeCloseTo(50);
});

it("grants the Ranger passive only when both the ability and its entity tree match", () => {
  const soldier = calculatorMember().ebps;
  soldier.abilities = ["ranger_fire_when_moving_passive_us"];
  const squad = calculatorUnit().sbps;
  squad.reinforce = { cost_percentage: 1, time_percentage: 1 };
  squad.loadout = [
    { id: "soldier", type: "ebps/races/american/infantry/soldier", num: 1, isDefaultUnit: true },
  ];
  // An unarmed entity is sufficient to verify the ability's origin and tree match.
  const entity = {
    ...soldier,
    weaponRef: [],
    health: { hitpoints: 80, targetSize: 1, armorLayout: { armor: 1 } },
    cost: { manpower: 0, fuel: 0, munition: 0, popcap: 0 },
    spawner_ext: { spawn_items: {} },
    populationExt: { personnel_pop: 0, upkeep_per_pop: { manpower: 0, fuel: 0, munition: 0 } },
    sight_ext: { sight_package: { outer_radius: 0 } },
    moving_ext: { speed_scaling_table: { default_speed: 1 } },
  } as unknown as typeof soldier;
  const ability = {
    id: "ranger_fire_when_moving_passive_us",
    entityTree: "ranger_fire_when_moving_passive_us",
    abilityWeaponIds: [],
    requirements: { playerUpgrade: "" },
  } as unknown as AbilitiesType;
  const mapped = mapCustomizableUnit(squad, [entity], [], [], [ability]);
  expect(mapped.rangerFireOnMove).toBe(true);
  expect(
    mapCustomizableUnit(squad, [entity], [], [], [{ ...ability, entityTree: "other" }])
      .rangerFireOnMove,
  ).toBe(false);

  const member = calculatorMember({
    moving_can_fire_while_moving: false,
    accuracy_near: 0.5,
    accuracy_mid: 0.5,
    accuracy_far: 0.5,
  });
  const target = calculatorUnit({ cover: "" });
  expect(getSingleWeaponDPS(member, 20, true, target, calculatorUnit())).toBe(0);
  const inputs = getSingleWeaponScatterShotInputs(member, 20, scatter, true, target, mapped)!;
  expect(inputs.directHitChance).toBeCloseTo(0.6);
  expect(getSingleWeaponDPS(member, 20, true, target, mapped)).toBeGreaterThan(0);
  expect(getUpgradedVehicleWeaponBag(member, mapped).moving_can_fire_while_moving).toBe(true);
  expect(member.weapon.weapon_bag.moving_can_fire_while_moving).toBe(false);
});
