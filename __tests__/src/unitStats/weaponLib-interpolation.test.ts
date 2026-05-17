import { RangeType } from "../../../src/unitStats/mappingWeapon";
import { _getInterpolationByDistanceMinMax } from "../../../src/unitStats/weaponLib";

describe("_getInterpolationByDistanceMinMax", () => {
  // Standard range setup for testing
  const standardRange: RangeType = {
    near: 10,
    mid: 20,
    far: 30,
    min: 0,
    max: 40,
  };

  describe("Edge Cases", () => {
    test("should return [0, 0] when distance exceeds max range", () => {
      const result = _getInterpolationByDistanceMinMax(
        50, // distance > range.max
        standardRange,
        10,
        20,
        1.5,
        1.0,
        0.5,
      );
      expect(result).toEqual([0, 0]);
    });

    test("should return [0, 0] when distance equals max range + 1", () => {
      const result = _getInterpolationByDistanceMinMax(41, standardRange, 10, 20, 1.5, 1.0, 0.5);
      expect(result).toEqual([0, 0]);
    });

    test("should handle zero min and max values", () => {
      const result = _getInterpolationByDistanceMinMax(15, standardRange, 0, 0, 1.5, 1.0, 0.5);
      expect(result).toEqual([0, 0]);
    });

    test("should handle negative min and max values", () => {
      const result = _getInterpolationByDistanceMinMax(15, standardRange, -10, -5, 1.5, 1.0, 0.5);
      // min * multi_m = -10 * 1.0 = -10
      // max * multi_m = -5 * 1.0 = -5
      expect(result[0]).toBeLessThan(0);
      expect(result[1]).toBeLessThan(0);
    });
  });

  describe("Distance Zones - Near Range", () => {
    test("should return near multiplier values when distance is at or below near range", () => {
      const result = _getInterpolationByDistanceMinMax(5, standardRange, 10, 20, 1.5, 1.0, 0.5);
      // At near range: min * multi_n = 10 * 1.5 = 15, max * multi_n = 20 * 1.5 = 30
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(30);
    });

    test("should return near multiplier values when distance exactly equals near range", () => {
      const result = _getInterpolationByDistanceMinMax(10, standardRange, 10, 20, 1.5, 1.0, 0.5);
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(30);
    });

    test("should return near multiplier values when distance is zero", () => {
      const result = _getInterpolationByDistanceMinMax(0, standardRange, 10, 20, 1.5, 1.0, 0.5);
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(30);
    });
  });

  describe("Distance Zones - Near to Mid Range (Interpolation)", () => {
    test("should interpolate between near and mid when distance is between them", () => {
      // Distance 15 is halfway between near (10) and mid (20)
      const result = _getInterpolationByDistanceMinMax(15, standardRange, 10, 20, 1.5, 1.0, 0.5);
      // minNear = 15, minMid = 10
      // Halfway interpolation: 15 - ((15-10)/(10-20)) * (10-15) = 15 - (5/-10) * (-5) = 15 - 2.5 = 12.5
      expect(result[0]).toBeCloseTo(12.5);
      // maxNear = 30, maxMid = 20
      expect(result[1]).toBeCloseTo(25);
    });

    test("should interpolate at 1/4 position between near and mid", () => {
      // Distance 12.5 is 1/4 of the way from near (10) to mid (20)
      const result = _getInterpolationByDistanceMinMax(
        12.5,
        standardRange,
        10,
        20,
        1.5,
        1.0,
        0.5,
      );
      // Formula: minNear - ((minNear - minMid) / (range.near - range.mid)) * (range.near - distance)
      // 15 - ((15 - 10) / (10 - 20)) * (10 - 12.5) = 15 - (5 / -10) * (-2.5) = 15 - 1.25 = 13.75
      expect(result[0]).toBeCloseTo(13.75);
    });
  });

  describe("Distance Zones - Mid to Far Range (Interpolation)", () => {
    test("should interpolate between mid and far when distance is between them", () => {
      // Distance 25 is halfway between mid (20) and far (30)
      const result = _getInterpolationByDistanceMinMax(25, standardRange, 10, 20, 1.5, 1.0, 0.5);
      // minMid = 10, minFar = 5
      // Halfway: 10 - ((10-5)/(20-30)) * (20-25) = 10 - (5/-10) * (-5) = 10 - 2.5 = 7.5
      expect(result[0]).toBeCloseTo(7.5);
      // maxMid = 20, maxFar = 10
      expect(result[1]).toBeCloseTo(15);
    });

    test("should return mid values when distance exactly equals mid range", () => {
      const result = _getInterpolationByDistanceMinMax(20, standardRange, 10, 20, 1.5, 1.0, 0.5);
      // At mid: min * multi_m = 10, max * multi_m = 20
      expect(result[0]).toBeCloseTo(10);
      expect(result[1]).toBeCloseTo(20);
    });
  });

  describe("Distance Zones - Far Range and Beyond", () => {
    test("should return far multiplier values when distance is beyond far range", () => {
      const result = _getInterpolationByDistanceMinMax(35, standardRange, 10, 20, 1.5, 1.0, 0.5);
      // At far: min * multi_f = 10 * 0.5 = 5, max * multi_f = 20 * 0.5 = 10
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(10);
    });

    test("should return far multiplier values when distance exactly equals far range", () => {
      const result = _getInterpolationByDistanceMinMax(30, standardRange, 10, 20, 1.5, 1.0, 0.5);
      expect(result[0]).toBeCloseTo(5);
      expect(result[1]).toBeCloseTo(10);
    });
  });

  describe("Cap Functionality", () => {
    test("should cap resultMin when it exceeds capMax", () => {
      // Near range with high multiplier, but capped
      const result = _getInterpolationByDistanceMinMax(
        5,
        standardRange,
        10,
        20,
        1.5,
        1.0,
        0.5,
        12,
      );
      // Normal: min * multi_n = 10 * 1.5 = 15, but capped at 12
      expect(result[0]).toBe(12);
      // Normal: max * multi_n = 20 * 1.5 = 30, but capped at 12
      expect(result[1]).toBe(12);
    });

    test("should not cap when capMax is not provided", () => {
      const result = _getInterpolationByDistanceMinMax(5, standardRange, 10, 20, 1.5, 1.0, 0.5);
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(30);
    });

    test("should not cap when capMax is 0", () => {
      const result = _getInterpolationByDistanceMinMax(
        5,
        standardRange,
        10,
        20,
        1.5,
        1.0,
        0.5,
        0,
      );
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(30);
    });

    test("should not cap when capMax is negative", () => {
      const result = _getInterpolationByDistanceMinMax(
        5,
        standardRange,
        10,
        20,
        1.5,
        1.0,
        0.5,
        -5,
      );
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(30);
    });

    test("should not cap when result is below capMax", () => {
      const result = _getInterpolationByDistanceMinMax(
        35,
        standardRange,
        10,
        20,
        1.5,
        1.0,
        0.5,
        100,
      );
      // Far: min * 0.5 = 5, max * 0.5 = 10, both below 100
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(10);
    });

    test("should cap interpolated values correctly", () => {
      // Mid-range interpolation with cap
      const result = _getInterpolationByDistanceMinMax(
        25,
        standardRange,
        10,
        20,
        1.5,
        1.0,
        0.5,
        8,
      );
      // Interpolated: [7.5, 15], capped to [7.5, 8]
      expect(result[0]).toBeCloseTo(7.5);
      expect(result[1]).toBe(8);
    });
  });

  describe("Multiplier Edge Cases", () => {
    test("should handle all multipliers being 1", () => {
      const result = _getInterpolationByDistanceMinMax(15, standardRange, 10, 20, 1, 1, 1);
      // All multipliers are 1, so values remain constant
      expect(result[0]).toBeCloseTo(10);
      expect(result[1]).toBeCloseTo(20);
    });

    test("should handle all multipliers being 0", () => {
      const result = _getInterpolationByDistanceMinMax(15, standardRange, 10, 20, 0, 0, 0);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
    });

    test("should handle inverted multipliers (far > near)", () => {
      // Unusual case where far multiplier is higher than near
      const result = _getInterpolationByDistanceMinMax(35, standardRange, 10, 20, 0.5, 1.0, 1.5);
      // Far: min * 1.5 = 15, max * 1.5 = 30
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(30);
    });

    test("should handle very large multipliers", () => {
      const result = _getInterpolationByDistanceMinMax(5, standardRange, 10, 20, 100, 50, 25);
      // Near: min * 100 = 1000, max * 100 = 2000
      expect(result[0]).toBe(1000);
      expect(result[1]).toBe(2000);
    });

    test("should handle fractional multipliers", () => {
      const result = _getInterpolationByDistanceMinMax(5, standardRange, 10, 20, 0.1, 0.05, 0.01);
      // Near: min * 0.1 = 1, max * 0.1 = 2
      expect(result[0]).toBeCloseTo(1);
      expect(result[1]).toBeCloseTo(2);
    });
  });

  describe("Range Configuration Edge Cases", () => {
    test("should handle equal near, mid, far ranges", () => {
      const equalRange: RangeType = {
        near: 10,
        mid: 10,
        far: 10,
        min: 0,
        max: 20,
      };
      // This would cause division by zero in interpolation formulas
      // The function should handle this gracefully
      const result = _getInterpolationByDistanceMinMax(10, equalRange, 10, 20, 1.5, 1.0, 0.5);
      // Since all ranges are equal, should return far values (last condition that matches)
      expect(result).toBeDefined();
    });

    test("should handle min > max in base values", () => {
      const result = _getInterpolationByDistanceMinMax(15, standardRange, 20, 10, 1.5, 1.0, 0.5);
      // min=20, max=10 (inverted)
      // At distance 15 (halfway between near=10 and mid=20):
      // minNear = 20 * 1.5 = 30, minMid = 20 * 1.0 = 20
      // Interpolated min: 30 - ((30-20)/(10-20)) * (10-15) = 30 - (10/-10) * (-5) = 30 - 5 = 25
      // maxNear = 10 * 1.5 = 15, maxMid = 10 * 1.0 = 10
      // Interpolated max: 15 - ((15-10)/(10-20)) * (10-15) = 15 - (5/-10) * (-5) = 15 - 2.5 = 12.5
      expect(result[0]).toBeCloseTo(25);
      expect(result[1]).toBeCloseTo(12.5);
    });

    test("should handle very small range distances", () => {
      const tinyRange: RangeType = {
        near: 0.1,
        mid: 0.2,
        far: 0.3,
        min: 0,
        max: 0.4,
      };
      const result = _getInterpolationByDistanceMinMax(0.15, tinyRange, 10, 20, 1.5, 1.0, 0.5);
      // Should interpolate between near and mid
      expect(result[0]).toBeGreaterThan(0);
      expect(result[1]).toBeGreaterThan(0);
    });

    test("should handle very large range distances", () => {
      const largeRange: RangeType = {
        near: 1000,
        mid: 2000,
        far: 3000,
        min: 0,
        max: 4000,
      };
      const result = _getInterpolationByDistanceMinMax(1500, largeRange, 10, 20, 1.5, 1.0, 0.5);
      // Should interpolate between near and mid
      expect(result[0]).toBeGreaterThan(0);
      expect(result[1]).toBeGreaterThan(0);
    });
  });

  describe("Real-world Scenarios", () => {
    test("should calculate weapon accuracy falloff correctly", () => {
      // Simulating accuracy: high at near, medium at mid, low at far
      const result = _getInterpolationByDistanceMinMax(
        15, // between near and mid
        standardRange,
        0.5, // min accuracy
        0.9, // max accuracy
        1.2, // near multiplier (boost)
        1.0, // mid multiplier (normal)
        0.6, // far multiplier (penalty)
      );
      // Should get interpolated accuracy between near and mid
      expect(result[0]).toBeGreaterThan(0.5);
      expect(result[0]).toBeLessThan(0.7);
      expect(result[1]).toBeGreaterThan(0.9);
      expect(result[1]).toBeLessThan(1.08);
    });

    test("should calculate damage falloff with cap", () => {
      // Simulating damage with a maximum cap
      const result = _getInterpolationByDistanceMinMax(
        5, // close range
        standardRange,
        80, // min damage
        120, // max damage
        1.0, // near multiplier
        0.8, // mid multiplier
        0.5, // far multiplier
        100, // damage cap
      );
      // Near: min=80, max=120 capped to 100
      expect(result[0]).toBe(80);
      expect(result[1]).toBe(100);
    });
  });
});
