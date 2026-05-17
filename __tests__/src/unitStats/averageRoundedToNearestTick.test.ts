import { _averageRoundedToNearestTick } from "../../../src/unitStats/weaponLib";

describe("_averageRoundedToNearestTick", () => {
  describe("Edge Cases", () => {
    test("should handle equal min and max values", () => {
      // When min == max, should return that value rounded to nearest tick
      expect(_averageRoundedToNearestTick(1.0, 1.0)).toBe(1.0);
      expect(_averageRoundedToNearestTick(0.5, 0.5)).toBe(0.5);
      expect(_averageRoundedToNearestTick(1.06, 1.06)).toBe(1.0); // Rounds to 1.0
      expect(_averageRoundedToNearestTick(1.07, 1.07)).toBe(1.125); // Rounds to 1.125
    });

    test("should swap reversed inputs (min > max)", () => {
      // Should produce same result regardless of order
      const result1 = _averageRoundedToNearestTick(2.0, 1.0);
      const result2 = _averageRoundedToNearestTick(1.0, 2.0);
      expect(result1).toBe(result2);
      expect(result1).toBeCloseTo(1.5, 10);
    });

    test("should handle zero values", () => {
      expect(_averageRoundedToNearestTick(0, 0)).toBe(0);
      expect(_averageRoundedToNearestTick(0, 0.5)).toBeCloseTo(0.25, 10);
    });

    test("should handle negative values", () => {
      expect(_averageRoundedToNearestTick(-1.0, -1.0)).toBe(-1.0);
      expect(_averageRoundedToNearestTick(-1.0, 0)).toBeCloseTo(-0.5, 10);
      expect(_averageRoundedToNearestTick(-2.0, -1.0)).toBeCloseTo(-1.5, 10);
    });
  });

  describe("Tick Alignment", () => {
    test("should handle values exactly on tick boundaries", () => {
      // Values that are exactly k/8 for some integer k
      expect(_averageRoundedToNearestTick(0.125, 0.125)).toBe(0.125); // 1/8
      expect(_averageRoundedToNearestTick(0.25, 0.25)).toBe(0.25); // 2/8
      expect(_averageRoundedToNearestTick(0.375, 0.375)).toBe(0.375); // 3/8
      expect(_averageRoundedToNearestTick(0.5, 0.5)).toBe(0.5); // 4/8
      expect(_averageRoundedToNearestTick(1.0, 1.0)).toBe(1.0); // 8/8
    });

    test("should handle range between two adjacent ticks", () => {
      // Small range within one tick interval
      // Range from 1.0 to 1.1, should round mostly to 1.0 and 1.125
      const result = _averageRoundedToNearestTick(1.0, 1.1);
      expect(result).toBeGreaterThan(1.0);
      expect(result).toBeLessThan(1.1);
    });
  });

  describe("Specific Game Scenarios", () => {
    test("should calculate average for typical aim time range", () => {
      // Typical aim time might be 1.5 to 2.0 seconds
      const result = _averageRoundedToNearestTick(1.5, 2.0);
      expect(result).toBeGreaterThanOrEqual(1.5);
      expect(result).toBeLessThanOrEqual(2.0);
      // Expected to be close to 1.75 but accounting for tick rounding
      expect(result).toBeCloseTo(1.75, 2);
    });

    test("should calculate average for typical cooldown range", () => {
      // Typical cooldown might be 2.0 to 3.0 seconds
      const result = _averageRoundedToNearestTick(2.0, 3.0);
      expect(result).toBeGreaterThanOrEqual(2.0);
      expect(result).toBeLessThanOrEqual(3.0);
      expect(result).toBeCloseTo(2.5, 2);
    });

    test("should calculate average for burst duration", () => {
      // Burst duration with multipliers
      const result = _averageRoundedToNearestTick(0.5, 1.5);
      expect(result).toBeGreaterThanOrEqual(0.5);
      expect(result).toBeLessThanOrEqual(1.5);
      expect(result).toBeCloseTo(1.0, 2);
    });
  });

  describe("Range Width Tests", () => {
    test("should handle very small range (less than one tick)", () => {
      // Range smaller than 0.125 (one tick)
      const result = _averageRoundedToNearestTick(1.0, 1.05);
      expect(result).toBeCloseTo(1.0, 2);
    });

    test("should handle range of exactly one tick", () => {
      const result = _averageRoundedToNearestTick(1.0, 1.125);
      expect(result).toBeGreaterThanOrEqual(1.0);
      expect(result).toBeLessThanOrEqual(1.125);
    });

    test("should handle large range spanning many ticks", () => {
      const result = _averageRoundedToNearestTick(1.0, 5.0);
      expect(result).toBeGreaterThanOrEqual(1.0);
      expect(result).toBeLessThanOrEqual(5.0);
      expect(result).toBeCloseTo(3.0, 2);
    });
  });

  describe("Precision and Rounding Behavior", () => {
    test("should round 1.06 to 1.0 (closer to 8/8 than 9/8)", () => {
      // 1.06 * 8 = 8.48, rounds to 8, which is 1.0
      expect(_averageRoundedToNearestTick(1.06, 1.06)).toBe(1.0);
    });

    test("should round 1.07 to 1.125 (closer to 9/8 than 8/8)", () => {
      // 1.07 * 8 = 8.56, rounds to 9, which is 1.125
      expect(_averageRoundedToNearestTick(1.07, 1.07)).toBe(1.125);
    });

    test("should round 0.5625 to 0.5 or 0.625 based on nearest tick", () => {
      // 0.5625 * 8 = 4.5, rounds to 4 or 5
      // Math.round(4.5) = 5 in JavaScript, so 5/8 = 0.625
      expect(_averageRoundedToNearestTick(0.5625, 0.5625)).toBe(0.625);
    });
  });

  describe("Weighted Average Validation", () => {
    test("should compute weighted average correctly for symmetric range", () => {
      // For a symmetric range like [1, 2], the average should be close to 1.5
      const result = _averageRoundedToNearestTick(1.0, 2.0);
      expect(result).toBeCloseTo(1.5, 2);
    });

    test("should compute weighted average for asymmetric values", () => {
      // Range that doesn't align nicely with ticks
      const result = _averageRoundedToNearestTick(0.7, 1.3);
      expect(result).toBeGreaterThan(0.7);
      expect(result).toBeLessThan(1.3);
      // Should be somewhere around 1.0
      expect(result).toBeCloseTo(1.0, 1);
    });
  });

  describe("Boundary Conditions", () => {
    test("should handle fractional values near tick boundaries", () => {
      // Test values just above and below tick boundaries
      const justBelow = _averageRoundedToNearestTick(0.124, 0.124);
      const justAbove = _averageRoundedToNearestTick(0.126, 0.126);

      expect(justBelow).toBe(0.125);
      expect(justAbove).toBe(0.125);
    });

    test("should handle very large values", () => {
      const result = _averageRoundedToNearestTick(100.0, 101.0);
      expect(result).toBeCloseTo(100.5, 2);
    });
  });
});
