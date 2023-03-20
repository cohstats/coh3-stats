import { PlayerReport, ProcessedMatch } from "../../../src/coh3/coh3-types";
import { getPlayerMatchHistoryResult, isPlayerVictorious } from "../../../src/players/utils";

describe("getPlayerMatchHistoryResult", () => {
  const matchRecord = {
    id: 1,
    creator_profile_id: 1,
    mapname: "Map1",
    maxplayers: 2,
    matchtype_id: 1,
    description: "Match1",
    startgametime: 123456,
    completiontime: 123457,
    matchhistoryreportresults: [
      {
        profile_id: 1,
        resulttype: 1,
        teamid: 1,
        race_id: 1,
        counters: "",
        profile: {
          name: "Player1",
          alias: "P1",
          personal_statgroup_id: 1,
          xp: 100,
          level: 10,
          leaderboardregion_id: 1,
          country: "USA",
        },
        matchhistorymember: {
          statgroup_id: 1,
          wins: 1,
          losses: 0,
          streak: 1,
          arbitration: 0,
          outcome: 1,
          oldrating: 1000,
          newrating: 1100,
          reporttype: 1,
        },
      },
      {
        profile_id: 2,
        resulttype: 2,
        teamid: 2,
        race_id: 2,
        counters: "",
        profile: {
          name: "Player2",
          alias: "P2",
          personal_statgroup_id: 2,
          xp: 200,
          level: 20,
          leaderboardregion_id: 2,
          country: "Canada",
        },
        matchhistorymember: {
          statgroup_id: 2,
          wins: 0,
          losses: 1,
          streak: -1,
          arbitration: 0,
          outcome: 2,
          oldrating: 2000,
          newrating: 1900,
          reporttype: 2,
        },
      },
    ],
    matchhistoryitems: [],
    profile_ids: [1, 2],
  };

  test("returns the correct result for an existing player", () => {
    const result: PlayerReport | null = getPlayerMatchHistoryResult(matchRecord, "2");
    expect(result).toEqual(matchRecord.matchhistoryreportresults[1]);
  });

  test("returns the first result when no player ID is specified", () => {
    const result: PlayerReport | null = getPlayerMatchHistoryResult(matchRecord, "");
    expect(result).toBeNull();
  });

  test("returns undefined for a non-existent player", () => {
    const result: PlayerReport | null = getPlayerMatchHistoryResult(matchRecord, "3");
    expect(result).toBeNull();
  });
});

describe("isPlayerVictorious", () => {
  const matchRecord: ProcessedMatch = {
    id: 1,
    creator_profile_id: 1,
    mapname: "Map1",
    maxplayers: 2,
    matchtype_id: 1,
    description: "Match1",
    startgametime: 123456,
    completiontime: 123457,
    matchhistoryreportresults: [
      {
        profile_id: 1,
        resulttype: 1,
        teamid: 1,
        race_id: 1,
        counters: "",
        profile: {
          name: "Player1",
          alias: "P1",
          personal_statgroup_id: 1,
          xp: 100,
          level: 10,
          leaderboardregion_id: 1,
          country: "USA",
        },
        matchhistorymember: {
          statgroup_id: 1,
          wins: 1,
          losses: 0,
          streak: 1,
          arbitration: 0,
          outcome: 1,
          oldrating: 1000,
          newrating: 1100,
          reporttype: 1,
        },
      },
      {
        profile_id: 2,
        resulttype: 2,
        teamid: 2,
        race_id: 2,
        counters: "",
        profile: {
          name: "Player2",
          alias: "P2",
          personal_statgroup_id: 2,
          xp: 200,
          level: 20,
          leaderboardregion_id: 2,
          country: "Canada",
        },
        matchhistorymember: {
          statgroup_id: 2,
          wins: 0,
          losses: 1,
          streak: -1,
          arbitration: 0,
          outcome: 2,
          oldrating: 2000,
          newrating: 1900,
          reporttype: 2,
        },
      },
    ],
    matchhistoryitems: [],
    profile_ids: [1, 2],
  };

  test("returns true if the player is victorious", () => {
    const result = isPlayerVictorious(matchRecord, "1");
    expect(result).toBe(true);
  });

  test("returns false if the player is not victorious", () => {
    const result = isPlayerVictorious(matchRecord, "2");
    expect(result).toBe(false);
  });

  test("returns false if the player ID is not found in the match record", () => {
    const result = isPlayerVictorious(matchRecord, "3");
    expect(result).toBe(false);
  });
});
