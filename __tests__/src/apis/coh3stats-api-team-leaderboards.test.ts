/**
 * @jest-environment node
 */

import { getTeamLeaderboards } from "../../../src/apis/coh3stats-api";
import { TeamLeaderboardResponse } from "../../../src/coh3/coh3-types";

describe("Team Leaderboards API functions", () => {
  // Mock the fetch function
  const setupFetchStub = (data: any, ok = true, status = 200) => {
    return () =>
      Promise.resolve({
        json: () => Promise.resolve(data),
        ok,
        status,
      });
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

  describe("getTeamLeaderboards", () => {
    const mockSide = "axis";
    const mockType = "2v2";
    const mockLeaderboardResponse: TeamLeaderboardResponse = {
      teams: [
        {
          id: "team-123",
          players: [
            { profile_id: 123456, alias: "Player1", country: "us" },
            { profile_id: 789012, alias: "Player2", country: "uk" },
          ],
          type: "2v2",
          side: "axis",
          elo: 1500,
          w: 10,
          l: 5,
          s: 3,
          t: 15,
          bestElo: 1600,
          lmTS: 1625097600,
        },
        {
          id: "team-456",
          players: [
            { profile_id: 345678, alias: "Player3", country: "ca" },
            { profile_id: 901234, alias: "Player4", country: "de" },
          ],
          type: "2v2",
          side: "axis",
          elo: 1450,
          w: 8,
          l: 7,
          s: -2,
          t: 15,
          bestElo: 1500,
          lmTS: 1625184000,
        },
      ],
      totalTeams: 2,
      nextCursor: "next-cursor-token",
      previousCursor: null,
    };

    test("should fetch team leaderboards successfully", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(mockLeaderboardResponse));

      const result = await getTeamLeaderboards(mockSide, mockType, "elo", 20);

      expect(result).toEqual(mockLeaderboardResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/sharedAPIGen2Http/teams/leaderboards?side=${mockSide}&type=${mockType}&orderBy=elo&limit=20`,
        ),
      );
    });

    test("should include optional parameters in the URL", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(mockLeaderboardResponse));

      await getTeamLeaderboards(mockSide, mockType, "total", 10, "cursor-token");

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/sharedAPIGen2Http/teams/leaderboards?side=${mockSide}&type=${mockType}&orderBy=total&limit=10&cursor=cursor-token`,
        ),
      );
    });

    test("should throw error when API returns 500", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub({ error: "Server error" }, false, 500));

      await expect(getTeamLeaderboards(mockSide, mockType, "elo", 20)).rejects.toThrow(
        "Error getting team leaderboards: Server error",
      );
    });

    test("should throw generic error for other failures", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub({}, false, 400));

      await expect(getTeamLeaderboards(mockSide, mockType, "total", 15)).rejects.toThrow(
        "Error getting team leaderboards",
      );
    });
  });
});
