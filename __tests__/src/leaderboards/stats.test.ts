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
  test("fetches all leaderboards data", async () => {
    const result = await _fetchAllLeaderboardsData();

    // I am getting 0 calls. Why?
    expect(getLeaderBoardData).toBeCalledTimes(16);
    expect(getLeaderBoardData).toBeCalledWith("american", "1v1", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("american", "2v2", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("american", "3v3", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("american", "4v4", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "1v1", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "2v2", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "3v3", 1, 200, 1);
    expect(getLeaderBoardData).toBeCalledWith("british", "4v4", 1, 200, 1);

    expect(result).toEqual({
      american: {
        "1v1": exampleRawLaddersObject,
        "2v2": exampleRawLaddersObject,
        "3v3": exampleRawLaddersObject,
        "4v4": exampleRawLaddersObject,
      },
      british: {
        "1v1": exampleRawLaddersObject,
        "2v2": exampleRawLaddersObject,
        "3v3": exampleRawLaddersObject,
        "4v4": exampleRawLaddersObject,
      },
      dak: {
        "1v1": exampleRawLaddersObject,
        "2v2": exampleRawLaddersObject,
        "3v3": exampleRawLaddersObject,
        "4v4": exampleRawLaddersObject,
      },
      german: {
        "1v1": exampleRawLaddersObject,
        "2v2": exampleRawLaddersObject,
        "3v3": exampleRawLaddersObject,
        "4v4": exampleRawLaddersObject,
      },
    });
  });
});
