import { getLeaderBoardData } from "../../../src/coh3/coh3-api";
import {
  calculateLeaderboardStats,
  _resetLeaderboardStatsCache,
} from "../../../src/leaderboards/stats";

jest.mock("../../../src/coh3/coh3-api", () => {
  return {
    __esModule: true,
    getLeaderBoardData: jest.fn(),
  };
});

const mockedGetLeaderBoardData = getLeaderBoardData as jest.Mock;

const rawLadder = {
  leaderboardStats: [{ rating: 1900 }, { rating: 1700 }],
  statGroups: [],
  rankTotal: 2500,
  result: { code: 200, message: "OK" },
};

describe("calculateLeaderboardStats cache", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    _resetLeaderboardStatsCache();
    mockedGetLeaderBoardData.mockReset();
    mockedGetLeaderBoardData.mockImplementation(() => Promise.resolve(rawLadder));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("reuses the result for subsequent and concurrent calls", async () => {
    const [a, b] = await Promise.all([calculateLeaderboardStats(), calculateLeaderboardStats()]);
    const c = await calculateLeaderboardStats();

    expect(mockedGetLeaderBoardData).toHaveBeenCalledTimes(32);
    expect(a).toBe(b);
    expect(a).toBe(c);
    expect(a.topElo.american["1v1"]).toBe(1900);
  });

  test("refetches after the cache expires", async () => {
    await calculateLeaderboardStats();
    jest.advanceTimersByTime(5 * 60 * 1000 + 1);
    await calculateLeaderboardStats();

    expect(mockedGetLeaderBoardData).toHaveBeenCalledTimes(64);
  });

  test("does not cache failures", async () => {
    mockedGetLeaderBoardData.mockImplementation(() => Promise.reject(new Error("Relic down")));
    await expect(calculateLeaderboardStats()).rejects.toThrow("Relic down");

    mockedGetLeaderBoardData.mockImplementation(() => Promise.resolve(rawLadder));
    await expect(calculateLeaderboardStats()).resolves.toBeDefined();
  });
});
