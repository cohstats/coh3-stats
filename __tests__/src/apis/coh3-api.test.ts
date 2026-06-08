/**
 * @jest-environment node
 */

jest.mock("axios", () => {
  const mockGet = jest.fn();
  const mockInterceptors = {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  };

  const mockInstance = {
    get: mockGet,
    interceptors: mockInterceptors,
  };

  return {
    create: jest.fn(() => mockInstance),
    __mockInstance: mockInstance, // Export for test access
  };
});

jest.mock("axios-rate-limit", () => jest.fn((axiosInstance) => axiosInstance));

jest.mock("axios-retry", () => jest.fn());

import axios from "axios";
import { _getLeaderBoardsUrl, getLeaderBoardData } from "../../../src/coh3/coh3-api";

// Get the mocked instance
const mockAxios = axios as any;
const mockAxiosInstance = mockAxios.__mockInstance;

describe("coh3-api", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockAxiosInstance.get.mockClear();
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

    // Mock the axios response
    mockAxiosInstance.get.mockResolvedValue({ data: fakeData });

    const result = await getLeaderBoardData("american", "1v1", 0, 100, 1, "steam", "na");
    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeData);
  });
});
