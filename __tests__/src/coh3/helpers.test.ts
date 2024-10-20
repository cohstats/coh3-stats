import {
  calculatePlayerTier,
  getMatchDuration,
  getMatchDurationGameTime,
  getMatchPlayersByFaction,
} from "../../../src/coh3/helpers";
import { PlayerRanks } from "../../../src/coh3/coh3-data";
import { PlayerReport } from "../../../src/coh3/coh3-types";

describe("getMatchDurationGameTime", () => {
  test("calculates the game duration", () => {
    const gameTime = 1062;

    const duration = getMatchDurationGameTime(gameTime);
    expect(duration).toBe("00:17:42");
  });

  test("max game duration", () => {
    const gameTime = 86399;

    const duration = getMatchDurationGameTime(gameTime);
    expect(duration).toBe("23:59:59");
  });
});

describe("getMatchDuration", () => {
  test("calculates the duration between start and end times (1 hour)", () => {
    const startTime = 1645968000; // Feb 28, 2022 12:00:00 AM UTC
    const endTime = 1645971600; // Feb 28, 2022 1:00:00 AM UTC

    const duration = getMatchDuration(startTime, endTime);

    expect(duration).toBe("01:00:00");
  });

  test("calculates the duration between start and end times (30 minutes)", () => {
    const startTime = 1645968000; // Feb 28, 2022 12:00:00 AM UTC
    const endTime = 1645970100; // Feb 28, 2022 12:35:00 AM UTC

    const duration = getMatchDuration(startTime, endTime);

    expect(duration).toBe("00:35:00");
  });

  test("calculates the duration between start and end times (1 minute)", () => {
    const startTime = 1645968000; // Feb 28, 2022 12:00:00 AM UTC
    const endTime = 1645968060; // Feb 28, 2022 12:01:00 AM UTC

    const duration = getMatchDuration(startTime, endTime);

    expect(duration).toBe("00:01:00");
  });

  test("calculates the duration between start and end times (0 seconds)", () => {
    const startTime = 1645968000; // Feb 28, 2022 12:00:00 AM UTC
    const endTime = 1645968000; // Feb 28, 2022 12:00:00 AM UTC

    const duration = getMatchDuration(startTime, endTime);

    expect(duration).toBe("00:00:00");
  });
});

// German
const playerReport1 = {
  profile_id: 307276,
  resulttype: 0,
  teamid: 0,
  race_id: 137123,
  counters: "",
  profile: {
    profile_id: 307276,
    name: "/steam/76561197993870136",
    alias: "Gaz",
    personal_statgroup_id: 196427,
    xp: 861,
    level: 861,
    leaderboardregion_id: 2074389,
    country: "gb",
  },
  matchhistorymember: {
    profile_id: 307276,
    race_id: 137123,
    statgroup_id: 196427,
    teamid: 0,
    wins: 4,
    losses: 5,
    streak: -1,
    arbitration: 2,
    outcome: 0,
    oldrating: 1022,
    newrating: 986,
    reporttype: 3,
  },
};

// British
const playerReport2 = {
  profile_id: 816,
  resulttype: 1,
  teamid: 1,
  race_id: 203852,
  counters: "",
  profile: {
    profile_id: 816,
    name: "/steam/76561198046481660",
    alias: "SoE-Sturmpanther",
    personal_statgroup_id: 2331,
    xp: 1851,
    level: 1851,
    leaderboardregion_id: 2074389,
    country: "de",
  },
  matchhistorymember: {
    profile_id: 816,
    race_id: 203852,
    statgroup_id: 2331,
    teamid: 1,
    wins: 1,
    losses: 0,
    streak: 1,
    arbitration: 1,
    outcome: 1,
    oldrating: 1000,
    newrating: 1049,
    reporttype: 1,
  },
};

// German
const playerReport3 = {
  profile_id: 180818,
  resulttype: 0,
  teamid: 0,
  race_id: 137123,
  counters: "",
  profile: {
    profile_id: 180818,
    name: "/steam/76561198067153567",
    alias: "Ket00",
    personal_statgroup_id: 37991,
    xp: 431,
    level: 431,
    leaderboardregion_id: 2074389,
    country: "nl",
  },
  matchhistorymember: {
    profile_id: 180818,
    race_id: 137123,
    statgroup_id: 37991,
    teamid: 0,
    wins: 9,
    losses: 9,
    streak: -2,
    arbitration: 2,
    outcome: 0,
    oldrating: 1044,
    newrating: 1023,
    reporttype: 3,
  },
};

// British
const playerReport4 = {
  profile_id: 114534,
  resulttype: 1,
  teamid: 1,
  race_id: 203852,
  counters: "",
  profile: {
    profile_id: 114534,
    name: "/steam/76561197997634975",
    alias: "Gorobag",
    personal_statgroup_id: 242385,
    xp: 321,
    level: 321,
    leaderboardregion_id: 2074389,
    country: "fr",
  },
  matchhistorymember: {
    profile_id: 114534,
    race_id: 203852,
    statgroup_id: 242385,
    teamid: 1,
    wins: 5,
    losses: 3,
    streak: 1,
    arbitration: 1,
    outcome: 1,
    oldrating: 1043,
    newrating: 1081,
    reporttype: 1,
  },
};

describe("getMatchPlayersByFaction", () => {
  const reportedPlayerResults = [playerReport1, playerReport2, playerReport3, playerReport4];

  test('should return all axis players when "axis" is passed as the faction', () => {
    const result = getMatchPlayersByFaction(
      reportedPlayerResults as unknown as PlayerReport[],
      "axis",
    );
    expect(result).toEqual([playerReport1, playerReport3]);
  });

  test('should return all allies players when "allies" is passed as the faction', () => {
    const result = getMatchPlayersByFaction(
      reportedPlayerResults as unknown as PlayerReport[],
      "allies",
    );
    expect(result).toEqual([playerReport2, playerReport4]);
  });
});

describe("calculatePlayerTier", () => {
  test("should return NO_RANK when rank is 0", () => {
    expect(calculatePlayerTier(0, 0)).toBe(PlayerRanks.NO_RANK);
  });

  test("should return BRASS_3 when rating is 150", () => {
    expect(calculatePlayerTier(12341, 150)).toBe(PlayerRanks.BRASS_3);
  });

  //Additional tests
  test("should return BRASS_2 when rating is 350", () => {
    expect(calculatePlayerTier(12341, 350)).toBe(PlayerRanks.BRASS_2);
  });

  test("should return BRASS_1 when rating is 650", () => {
    expect(calculatePlayerTier(12341, 650)).toBe(PlayerRanks.BRASS_1);
  });

  test("should return BRONZE_3 when rating is 850", () => {
    expect(calculatePlayerTier(12341, 850)).toBe(PlayerRanks.BRONZE_3);
  });

  test("should return BRONZE_2 when rating is 1000", () => {
    expect(calculatePlayerTier(12341, 1000)).toBe(PlayerRanks.BRONZE_2);
  });

  test("should return BRONZE_1 when rating is 1050", () => {
    expect(calculatePlayerTier(12341, 1050)).toBe(PlayerRanks.BRONZE_1);
  });

  test("should return IRON_3 when rating is 1100", () => {
    expect(calculatePlayerTier(12341, 1100)).toBe(PlayerRanks.IRON_3);
  });

  test("should return IRON_2 when rating is 1150", () => {
    expect(calculatePlayerTier(12341, 1150)).toBe(PlayerRanks.IRON_2);
  });

  test("should return IRON_1 when rating is 1200", () => {
    expect(calculatePlayerTier(12341, 1200)).toBe(PlayerRanks.IRON_1);
  });

  test("should return SILVER_3 when rating is 1250", () => {
    expect(calculatePlayerTier(12341, 1250)).toBe(PlayerRanks.SILVER_3);
  });

  test("should return SILVER_2 when rating is 1300", () => {
    expect(calculatePlayerTier(12341, 1300)).toBe(PlayerRanks.SILVER_2);
  });

  test("should return SILVER_1 when rating is 1350", () => {
    expect(calculatePlayerTier(12341, 1350)).toBe(PlayerRanks.SILVER_1);
  });

  test("should return GOLD_3 when rating is 1450", () => {
    expect(calculatePlayerTier(12341, 1450)).toBe(PlayerRanks.GOLD_3);
  });

  test("should return GOLD_2 when rating is 1500", () => {
    expect(calculatePlayerTier(12341, 1500)).toBe(PlayerRanks.GOLD_2);
  });

  test("should return GOLD_1 when rating is 1601", () => {
    expect(calculatePlayerTier(60, 1601)).toBe(PlayerRanks.GOLD_1);
  });

  test("should return CHALLENGER_5 when rating is 1601 and rank is in top 50", () => {
    expect(calculatePlayerTier(49, 1601)).toBe(PlayerRanks.CHALLENGER_5);
  });

  test("should return CHALLENGER_4 when rating is 1601", () => {
    expect(calculatePlayerTier(24, 1601)).toBe(PlayerRanks.CHALLENGER_4);
  });

  test("should return CHALLENGER_3 when rating is 1601", () => {
    expect(calculatePlayerTier(9, 1601)).toBe(PlayerRanks.CHALLENGER_3);
  });

  test("should return CHALLENGER_2 when rating is 1601", () => {
    expect(calculatePlayerTier(4, 1601)).toBe(PlayerRanks.CHALLENGER_2);
  });

  test("should return CHALLENGER_1 when rating is 1601", () => {
    expect(calculatePlayerTier(1, 1601)).toBe(PlayerRanks.CHALLENGER_1);
  });
});
