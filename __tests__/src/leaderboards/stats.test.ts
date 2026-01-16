import { getLeaderBoardData } from "../../../src/coh3/coh3-api";
import { _fetchAllLeaderboardsData } from "../../../src/leaderboards/stats";
import { RawLaddersObject } from "../../../src/coh3/coh3-types";

// Example object of RawLaddersObject type
const exampleRawLaddersObject: RawLaddersObject = {
  leaderboardStats: [],
  statGroups: [],
  rankTotal: 2500,
  result: {
    code: 200,
    message: "OK",
  },
};

jest.mock("../../../src/coh3/coh3-api", () => {
  return {
    __esModule: true,
    getLeaderBoardData: jest.fn(() => Promise.resolve(exampleRawLaddersObject)),
  };
});

describe("_fetchAllLeaderboardsData", () => {
  // mock fetch with node-fetch
  global.fetch = jest.fn(
    () =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            leaderBoardData: {},
          }),
      }) as any,
  ) as any;

  afterAll(() => {
    jest.resetAllMocks();
  });

  // Tests which tests the output of the function _fetchAllLeaderboardsData
  // Mock the calls to getLeaderBoardData
  test("fetches all leaderboards data from 2 pages", async () => {
    const result = await _fetchAllLeaderboardsData();

    // Now fetches 2 pages per faction/gameMode combination: 4 factions * 4 game modes * 2 pages = 32 calls
    expect(getLeaderBoardData).toBeCalledTimes(32);

    // Check that page 1 calls are made (start=1)
    expect(getLeaderBoardData).toBeCalledWith("american", "1v1", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("american", "2v2", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("american", "3v3", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("american", "4v4", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "1v1", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "2v2", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "3v3", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "4v4", 1, 200, 1);

    // Check that page 2 calls are made (start=201)
    expect(getLeaderBoardData).toBeCalledWith("american", "1v1", 1, 200, 201);
    expect(getLeaderBoardData).toBeCalledWith("american", "2v2", 1, 200, 201);
    expect(getLeaderBoardData).toBeCalledWith("american", "3v3", 1, 200, 201);
    expect(getLeaderBoardData).toBeCalledWith("american", "4v4", 1, 200, 201);
    expect(getLeaderBoardData).toBeCalledWith("british", "1v1", 1, 200, 201);
    expect(getLeaderBoardData).toBeCalledWith("british", "2v2", 1, 200, 201);
    expect(getLeaderBoardData).toBeCalledWith("british", "3v3", 1, 200, 201);
    expect(getLeaderBoardData).toBeCalledWith("british", "4v4", 1, 200, 201);

    // The result should have merged leaderboardStats and statGroups from both pages
    // Each entry should have empty arrays merged ([] + [] = [])
    expect(result).toEqual({
      american: {
        "1v1": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "2v2": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "3v3": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "4v4": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
      },
      british: {
        "1v1": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "2v2": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "3v3": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "4v4": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
      },
      dak: {
        "1v1": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "2v2": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "3v3": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "4v4": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
      },
      german: {
        "1v1": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "2v2": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "3v3": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
        "4v4": {
          ...exampleRawLaddersObject,
          leaderboardStats: [],
          statGroups: [],
        },
      },
    });
  });
});
