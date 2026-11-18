/** @jest-environment node */

import { getWeaponStats, WeaponPatchData } from "../../../src/unitStats/mappingWeapon";
import { fetchJsonWithLogging } from "../../../src/unitStats/fetch-mappings-withLogs";
import config from "../../../config";

jest.mock("../../../src/unitStats/fetch-mappings-withLogs", () => ({
  fetchJsonWithLogging: jest.fn(),
}));

it("maps the hold flag and preserves zero FAR damage and accuracy", async () => {
  const patch = Object.keys(config.patches).find((patch) => patch !== config.latestPatch)!;
  delete WeaponPatchData[patch];
  const gun = (hold?: string | boolean) => ({
    weapon_bag: {
      area_effect: {
        damage_all_in_hold: hold,
        damage: { near: 1, mid: 0.5, far: 0 },
        accuracy: { near: 1, mid: 0.5, far: 0 },
        distance: { near: 1, mid: 2, far: 10 },
        area_info: {
          outer_radius: 3,
          template_reference: { value: "options\\area_info_options\\circle_area_option" },
        },
      },
    },
  });
  const root = {
    american: {
      ballistic_weapon: {
        enabled: gun("True"),
        disabled: gun("False"),
        absent: gun(),
        boolean: gun(true),
      },
    },
  };
  jest
    .mocked(fetchJsonWithLogging)
    .mockImplementation(async (url) => (url.endsWith("/weapon.json") ? root : {}));
  try {
    const mapped = await getWeaponStats(patch);
    expect(mapped).toHaveLength(4);
    for (const weapon of mapped) {
      expect(weapon.weapon_bag.aoe_damage_all_in_hold).toBe(
        ["enabled", "boolean"].includes(weapon.id),
      );
      expect(weapon.weapon_bag.aoe_damage_far).toBe(0);
      expect(weapon.weapon_bag.aoe_accuracy_far).toBe(0);
      expect(weapon.weapon_bag.aoe_distance_far).toBe(10);
      expect(weapon.weapon_bag.aoe_outer_radius).toBe(3);
    }
  } finally {
    delete WeaponPatchData[patch];
  }
});
