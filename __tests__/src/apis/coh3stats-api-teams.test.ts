/**
 * @jest-environment node
 */

import {
  getTeamsFullSummary,
  getTeamDetails,
  getTeamMatches,
} from "../../../src/apis/coh3stats-api";
import { TeamsFullSummary, TeamDetails, ProcessedMatch } from "../../../src/coh3/coh3-types";

describe("Teams API functions", () => {
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

  describe("getTeamsFullSummary", () => {
    const mockProfileId = "123456";
    const mockTeamsData: TeamsFullSummary = {
      profileId: 123456,
      totalTeams: 4,
      axisTeams: [
        {
          id: "axis-team-1",
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
          lmTS: 1625097600,
        },
      ],
      alliesTeams: [
        {
          id: "allies-team-1",
          players: [
            { profile_id: 123456, alias: "Player1", country: "us" },
            { profile_id: 345678, alias: "Player3", country: "ca" },
          ],
          type: "2v2",
          side: "allies",
          elo: 1600,
          w: 15,
          l: 7,
          s: -2,
          lmTS: 1625184000,
        },
      ],
    };

    test("should fetch teams data successfully", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(mockTeamsData));

      const result = await getTeamsFullSummary(mockProfileId);

      expect(result).toEqual(mockTeamsData);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/sharedAPIGen2Http/players/${mockProfileId}/teams`),
      );
    });

    test("should throw error when API returns 500", async () => {
      const errorResponse = { error: "Internal server error" };
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(errorResponse, false, 500));

      await expect(getTeamsFullSummary(mockProfileId)).rejects.toThrow(
        `Error getting teams full summary: ${errorResponse.error}`,
      );
    });

    test("should throw generic error for other non-OK responses", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub({}, false, 404));

      await expect(getTeamsFullSummary(mockProfileId)).rejects.toThrow(
        "Error getting teams full summary",
      );
    });
  });

  describe("getTeamDetails", () => {
    const mockTeamId = "team-123";
    const mockTeamDetails: TeamDetails = {
      id: "team-123",
      player_ids: [123456, 789012],
      players: [
        { profile_id: 123456, alias: "Player1", country: "us" },
        { profile_id: 789012, alias: "Player2", country: "uk" },
      ],
      type: "2v2",
      side: "axis",
      elo: 1500,
      bestElo: 1600,
      w: 10,
      l: 5,
      s: 3,
      t: 15,
      lmTS: 1625097600,
      mh: [
        {
          m_id: 12345,
          w: true,
          eloChange: 15,
          enemyElo: 1450,
          ts: 1625097600,
        },
      ],
    };

    test("should fetch team details successfully", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(mockTeamDetails));

      const result = await getTeamDetails(mockTeamId);

      expect(result).toEqual(mockTeamDetails);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/sharedAPIGen2Http/teams/${mockTeamId}`),
      );
    });

    test("should throw 'Team not found' error when API returns 404", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub({}, false, 404));

      await expect(getTeamDetails(mockTeamId)).rejects.toThrow("Team not found");
    });

    test("should throw error with message when API returns 500", async () => {
      const errorResponse = { error: "Internal server error" };
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(errorResponse, false, 500));

      await expect(getTeamDetails(mockTeamId)).rejects.toThrow(
        `Error getting team details: ${errorResponse.error}`,
      );
    });
  });

  describe("getTeamMatches", () => {
    const mockMatchIds = ["12345", "67890"];
    const mockMatchData: Record<number, ProcessedMatch> = {
      12345: {
        id: 12345,
        matchhistoryreportresults: [
          {
            profile_id: 123456,
            alias: "Player1",
            counters: '{"kills":10,"deaths":5}',
          } as any,
        ],
      } as any,
      67890: {
        id: 67890,
        matchhistoryreportresults: [
          {
            profile_id: 789012,
            alias: "Player2",
            counters: '{"kills":15,"deaths":8}',
          } as any,
        ],
      } as any,
    };

    //TODO: Fix this test
    xtest("should fetch team matches successfully and parse counters", async () => {
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(mockMatchData));

      const result = await getTeamMatches(mockMatchIds);

      // Check that the counters were parsed from string to object
      expect(result[12345].matchhistoryreportresults[0].counters).toEqual({
        kills: 10,
        deaths: 5,
      });
      expect(result[67890].matchhistoryreportresults[0].counters).toEqual({
        kills: 15,
        deaths: 8,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/sharedAPIGen2Http/teams/matches?matchIDs=[${mockMatchIds.join(",")}]`,
        ),
      );
    });

    test("should throw error when too many match IDs are provided", async () => {
      const tooManyIds = Array(11)
        .fill(0)
        .map((_, i) => `${i}`);

      await expect(getTeamMatches(tooManyIds)).rejects.toThrow(
        "Must provide between 1 and 10 match IDs",
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw error when no match IDs are provided", async () => {
      await expect(getTeamMatches([])).rejects.toThrow("Must provide between 1 and 10 match IDs");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("should throw error with message when API returns 500", async () => {
      const errorResponse = { error: "Internal server error" };
      // @ts-ignore
      global.fetch.mockImplementation(setupFetchStub(errorResponse, false, 500));

      await expect(getTeamMatches(mockMatchIds)).rejects.toThrow(
        `Error getting team matches: ${errorResponse.error}`,
      );
    });
  });
});
