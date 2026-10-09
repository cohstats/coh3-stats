import {
  combineModesAnalysis,
  getAverageGameTimeMinutes,
  getFactionSlotsCount,
  getGameTimeBucketLabel,
  getModeLabel,
  getTotalGameTimeHours,
  withCombinedDays,
} from "../../../src/stats/combine-game-stats";
import {
  AnalysisObjectType,
  DaysAnalysisObjectType,
  StatsDataObject,
} from "../../../src/analysis-types";

const modeAnalysis = (
  base: number,
  overrides: Partial<AnalysisObjectType> = {},
): AnalysisObjectType => ({
  german: { wins: base, losses: base + 1 },
  american: { wins: base + 2, losses: base + 3 },
  dak: { wins: base + 4, losses: base + 5 },
  british: { wins: base + 6, losses: base + 7 },
  matchCount: base * 10,
  gameTime: base * 1000,
  gameTimeSpread: { "0": base, "10": base * 2 },
  maps: { map_a: base },
  factionMatrix: { WxB: { wins: 1, losses: 1 } },
  ...overrides,
});

const statsData = (): StatsDataObject => ({
  "1v1": modeAnalysis(1, { maps: { map_a: 1, only_1v1: 5 } }),
  "2v2": modeAnalysis(2, { gameTimeSpread: { "0": 2, "60": 7 } }),
  "3v3": modeAnalysis(3),
  "4v4": modeAnalysis(4),
  days: {},
});

describe("combineModesAnalysis", () => {
  test("sums the faction results, match count and game time of all the modes", () => {
    const combined = combineModesAnalysis(statsData());

    // base 1 + 2 + 3 + 4 = 10
    expect(combined.german).toEqual({ wins: 10, losses: 14 });
    expect(combined.american).toEqual({ wins: 18, losses: 22 });
    expect(combined.dak).toEqual({ wins: 26, losses: 30 });
    expect(combined.british).toEqual({ wins: 34, losses: 38 });
    expect(combined.matchCount).toBe(100);
    expect(combined.gameTime).toBe(10000);
  });

  test("merges the game time spread and maps when the modes have different keys", () => {
    const combined = combineModesAnalysis(statsData());

    expect(combined.gameTimeSpread).toEqual({ "0": 10, "10": 16, "60": 7 });
    expect(combined.maps).toEqual({ map_a: 10, only_1v1: 5 });
  });

  test("leaves the faction matrix empty - its keys can't be combined across modes", () => {
    expect(combineModesAnalysis(statsData()).factionMatrix).toEqual({});
  });

  test("treats missing modes and values as 0", () => {
    const data = statsData();
    // @ts-ignore - simulate incomplete data from the API
    delete data["3v3"];
    // @ts-ignore
    data["4v4"].dak = undefined;
    // @ts-ignore
    data["4v4"].gameTime = undefined;
    // @ts-ignore
    data["4v4"].maps = undefined;

    const combined = combineModesAnalysis(data);

    expect(combined.dak).toEqual({ wins: 11, losses: 13 });
    expect(combined.gameTime).toBe(3000);
    expect(combined.matchCount).toBe(70);
    expect(combined.maps).toEqual({ map_a: 3, only_1v1: 5 });
  });

  test("does not modify the original analysis", () => {
    const data = statsData();
    const copy = JSON.parse(JSON.stringify(data));
    combineModesAnalysis(data);
    expect(data).toEqual(copy);
  });
});

describe("withCombinedDays", () => {
  const day = (base: number) => ({
    german: { wins: base, losses: base },
    american: { wins: base, losses: 0 },
    dak: { wins: 0, losses: base },
    british: { wins: 1, losses: 1 },
  });

  test("adds an `all` key with the factions summed over the modes for every day", () => {
    const days: DaysAnalysisObjectType = {
      "1690000000": { "1v1": day(1), "2v2": day(2), "3v3": day(3), "4v4": day(4) },
      "1690086400": { "1v1": day(10), "2v2": day(0), "3v3": day(0), "4v4": day(0) },
    };

    const result = withCombinedDays(days);

    expect(result["1690000000"].all).toEqual({
      german: { wins: 10, losses: 10 },
      american: { wins: 10, losses: 0 },
      dak: { wins: 0, losses: 10 },
      british: { wins: 4, losses: 4 },
    });
    expect(result["1690086400"].all?.german).toEqual({ wins: 10, losses: 10 });
    // The single modes are kept
    expect(result["1690000000"]["2v2"]).toEqual(day(2));
    // Original object is untouched
    expect((days["1690000000"] as any).all).toBeUndefined();
  });

  test("handles a day with missing modes", () => {
    const days = { "1690000000": { "1v1": day(1) } } as unknown as DaysAnalysisObjectType;
    expect(withCombinedDays(days)["1690000000"].all?.german).toEqual({ wins: 1, losses: 1 });
  });

  test("returns an empty object for empty days", () => {
    expect(withCombinedDays({})).toEqual({});
  });
});

describe("game time helpers", () => {
  test("getAverageGameTimeMinutes converts the total seconds into the average minutes", () => {
    // 10 games, 12 000 seconds in total = 20 minutes each
    expect(getAverageGameTimeMinutes({ gameTime: 12000, matchCount: 10 })).toBe(20);
  });

  test("getAverageGameTimeMinutes returns 0 without games", () => {
    expect(getAverageGameTimeMinutes({ gameTime: 0, matchCount: 0 })).toBe(0);
  });

  test("getTotalGameTimeHours converts seconds into hours", () => {
    expect(getTotalGameTimeHours({ gameTime: 7200 })).toBe(2);
  });

  test("getGameTimeBucketLabel labels the uneven buckets", () => {
    expect(getGameTimeBucketLabel("0")).toBe("0 - 5");
    expect(getGameTimeBucketLabel("5")).toBe("5 - 10");
    expect(getGameTimeBucketLabel("10")).toBe("10 - 20");
    expect(getGameTimeBucketLabel("50")).toBe("50 - 60");
    expect(getGameTimeBucketLabel("60")).toBe("60+");
  });
});

describe("misc helpers", () => {
  test("getFactionSlotsCount sums wins and losses of all the factions", () => {
    // 1+2+3+4+5+6+7+8
    expect(getFactionSlotsCount(modeAnalysis(1))).toBe(36);
  });

  test("getModeLabel", () => {
    expect(getModeLabel("all")).toBe("all modes");
    expect(getModeLabel("2v2")).toBe("2v2");
  });
});
