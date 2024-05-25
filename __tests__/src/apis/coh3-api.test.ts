/**
 * @jest-environment node
 */

import { _getLeaderBoardsUrl, getLeaderBoardData } from "../../../src/coh3/coh3-api";

describe("coh3-api", () => {
  // Mock the fetch function
  const setupFetchStub = (data: any, ok = true, status = 200) => {
    return () => Promise.resolve({ json: () => Promise.resolve(data), ok, status });
  };

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub({}));
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // @ts-ignore
    global.fetch.mockClear();
  });

  test("getLeaderBoardsUrl should return correct URL", () => {
    const url = _getLeaderBoardsUrl(1, 0, 100, 1, "steam", "na");
    expect(url).toBe(
      "https://coh3-api.reliclink.com/community/leaderboard/getleaderboard2?count=100&leaderboard_id=1&start=1&sortBy=0&leaderboardRegion_id=2074390&title=coh3",
    );
  });

  test("getLeaderBoardsUrl should return correct URL without a region", () => {
    const url = _getLeaderBoardsUrl(1, 0, 100, 1, "steam");
    expect(url).toBe(
      "https://coh3-api.reliclink.com/community/leaderboard/getleaderboard2?count=100&leaderboard_id=1&start=1&sortBy=0&title=coh3",
    );
  });

  test("getLeaderBoardData should return leaderboard data", async () => {
    // Define the fake data
    const fakeData = { response: { leaderboard: [] } };

    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeData));

    const result = await getLeaderBoardData("american", "1v1", 0, 100, 1, "steam", "na");
    expect(global.fetch).toBeCalledTimes(1);
    expect(result).toEqual(fakeData);
  });
});
