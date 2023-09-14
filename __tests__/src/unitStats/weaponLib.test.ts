import { getScatterArea, WeaponStatsType } from "../../../src/unitStats";

describe("getScatterArea", () => {
  // Marauder 3 data
  const mockWeaponBag = {
    scatter_distance_scatter_offset: 0.25,
    scatter_distance_scatter_max: 4,
    scatter_angle_scatter: 5,
    scatter_distance_scatter_ratio: 1,
  };

  test("Should calculate Marauder 3 correctly for distance 10", () => {
    const scatter = getScatterArea(10, mockWeaponBag as WeaponStatsType);
    expect(scatter).toBe(7.679448708775048);
  });

  test("Should calculate Marauder 3 correctly for distance 30", () => {
    const scatter = getScatterArea(30, mockWeaponBag as WeaponStatsType);
    expect(scatter).toBe(21.642082724729686);
  });

  test("Should calculate Marauder 3 correctly for distance 50", () => {
    const scatter = getScatterArea(50, mockWeaponBag as WeaponStatsType);
    expect(scatter).toBe(35.604716740684324);
  });
});
