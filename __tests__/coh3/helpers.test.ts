import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";

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

describe("getMatchPlayersByFaction", () => {
  const reportedPlayerResults = [
    { race_id: 129494, name: "Player 1", score: 100 },
    { race_id: 137123, name: "Player 2", score: 200 },
    { race_id: 203852, name: "Player 3", score: 300 },
    { race_id: 198437, name: "Player 4", score: 400 },
    { race_id: 129494, name: "Player 5", score: 500 },
  ];

  it('should return all axis players when "axis" is passed as the faction', () => {
    const result = getMatchPlayersByFaction(reportedPlayerResults, "axis");
    expect(result).toEqual([
      { race_id: 137123, name: "Player 2", score: 200 },
      { race_id: 198437, name: "Player 4", score: 400 },
    ]);
  });

  it('should return all allies players when "allies" is passed as the faction', () => {
    const result = getMatchPlayersByFaction(reportedPlayerResults, "allies");
    expect(result).toEqual([
      { race_id: 129494, name: "Player 1", score: 100 },
      { race_id: 203852, name: "Player 3", score: 300 },
      { race_id: 129494, name: "Player 5", score: 500 },
    ]);
  });
});
