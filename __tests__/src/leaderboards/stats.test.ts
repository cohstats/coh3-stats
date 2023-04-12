import { calculateLeaderboardStats } from "../../../src/leaderboards/stats";

describe("calculateLeaderboardStats", () => {
  it("should return the correct stats", async () => {
    await calculateLeaderboardStats();
  });
});
