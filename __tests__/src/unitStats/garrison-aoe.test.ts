import { calculatorMember, calculatorUnit } from "../../test-assets/calculator-fixtures";
import {
  getSingleWeaponDPS,
  getSingleWeaponScatterShotInputs,
  getWeaponRpm,
} from "../../../src/unitStats/weaponLib";
import {
  simulateScatterShotDetails,
  type ScatterDpsOptions,
} from "../../../src/unitStats/scatterSimulation";

const formation: ScatterDpsOptions = {
  models: [
    { id: 1, x: 0, y: 0, enabled: true },
    { id: 2, x: 0.5, y: 0, enabled: true },
    { id: 3, x: 10, y: 0, enabled: true },
    { id: 4, x: 20, y: 0, enabled: false },
  ],
  targetModelId: 1,
  gunnerAngleDeg: 270,
  samplesPerShot: 1,
};
const member = () =>
  calculatorMember({
    aoe_damage_all_in_hold: true,
    aoe_outer_radius: 1,
    aoe_distance_far: 10,
    aoe_damage_far: 0.2,
    aoe_damage_max_member: 2,
    scatter_distance_scatter_ratio: 0,
    scatter_distance_scatter_offset: 0,
  });
const target = () =>
  calculatorUnit({ cover: "garrison", weapon_member: [{ ...calculatorMember(), num: 3 }] });
const details = (gun = member(), defender = target(), options = formation) =>
  simulateScatterShotDetails(
    getSingleWeaponScatterShotInputs(gun, 20, options, false, defender)!,
  );

it.each([1, 2, -1])(
  "applies FAR damage to remaining occupants beyond the radius and cap %s",
  (cap) => {
    const gun = member();
    gun.weapon.weapon_bag.aoe_damage_max_member = cap;
    const result = details(gun);
    expect(result.models.map(({ averageDamage }) => averageDamage)).toEqual([
      25,
      cap === 1 ? 5 : 25,
      5,
      0,
    ]);
    expect(result.totalExpectedDamage).toBeCloseTo(cap === 1 ? 35 : 55);
  },
);

it("applies the hold rule to scattered blasts that reach the garrison", () => {
  const gun = member();
  gun.weapon.weapon_bag.accuracy_near =
    gun.weapon.weapon_bag.accuracy_mid =
    gun.weapon.weapon_bag.accuracy_far =
      0;
  expect(details(gun).models.map(({ averageDamage }) => averageDamage)).toEqual([25, 25, 5, 0]);
  expect(
    details(gun, target(), { ...formation, targetModelId: null, groundTarget: { x: 0, y: 100 } })
      .totalExpectedDamage,
  ).toBe(0);
});

it("requires both a garrison and the weapon's hold flag", () => {
  const gun = member();
  gun.weapon.weapon_bag.aoe_damage_all_in_hold = false;
  expect(details(gun).models.map(({ averageDamage }) => averageDamage)).toEqual([25, 25, 0, 0]);
  for (const cover of ["", "light", "heavy"]) {
    const defender = target();
    defender.cover = cover;
    expect(details(member(), defender).models[2].averageDamage).toBe(0);
  }
});

it("keeps garrison mitigation in either direction, including point-blank weapons", () => {
  const gun = member();
  gun.weapon.weapon_bag.behaviour_point_blank = true;
  for (const shooterOrigin of [true, false]) {
    gun.weapon.weapon_bag.always_calculate_cover_from_shooting_position = shooterOrigin;
    for (const bearing of [90, 270]) {
      const shot = getSingleWeaponScatterShotInputs(
        gun,
        5,
        {
          ...formation,
          gunnerAngleDeg: bearing,
          directionalCover: { minX: -1, maxX: 21, y: -0.5 },
        },
        false,
        target(),
      )!;
      expect(simulateScatterShotDetails(shot).totalExpectedDamage).toBeCloseTo(55);
    }
  }
});

it("uses FAR accuracy and penetration, and caps each occupant's damage at their HP", () => {
  const gun = member();
  const defender = target();
  defender.armor = 100;
  gun.weapon.weapon_bag.aoe_accuracy_far = 0.5;
  gun.weapon.weapon_bag.aoe_penetration_far = 50;
  expect(details(gun, defender).models[2].averageDamage).toBeCloseTo(1.25);
  const fragile = target();
  fragile.hitpoints = 4;
  expect(details(member(), fragile).models.map(({ averageDamage }) => averageDamage)).toEqual([
    4, 4, 4, 0,
  ]);
});

it("preserves a zero FAR damage multiplier", () => {
  const gun = member();
  gun.weapon.weapon_bag.aoe_damage_far = 0;
  expect(details(gun).models[2].averageDamage).toBe(0);
});

it("includes other occupants in the ordinary VS/direct calculation", () => {
  const gun = member();
  const defender = target();
  const rpm = getWeaponRpm(gun.weapon.weapon_bag, 20);
  expect(getSingleWeaponDPS(gun, 20, false, defender)).toBeCloseTo((35 * rpm) / 60);
  gun.weapon.weapon_bag.aoe_damage_all_in_hold = false;
  expect(getSingleWeaponDPS(gun, 20, false, defender)).toBeCloseTo((25 * rpm) / 60);
});
