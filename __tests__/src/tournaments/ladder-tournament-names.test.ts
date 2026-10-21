/**
 * @jest-environment node
 */

import { getLadderPlayerNames } from "../../../src/tournaments/ladder-tournament-names";
import { getMultiplePlayersStatsFromRelic } from "../../../src/coh3/coh3-players";

jest.mock("../../../src/coh3/coh3-players", () => ({
  getMultiplePlayersStatsFromRelic: jest.fn(),
}));

const mockedRelic = getMultiplePlayersStatsFromRelic as jest.MockedFunction<
  typeof getMultiplePlayersStatsFromRelic
>;

const relicResult = (members: Array<{ profile_id: number; alias: string; country: string }>) =>
  ({
    platform: "steam",
    statGroups: [{ id: 1, name: "", type: 1, members }],
    leaderboardStats: [],
  }) as any;

describe("getLadderPlayerNames", () => {
  beforeEach(() => {
    mockedRelic.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("maps the aliases and countries from the stat group members", async () => {
    mockedRelic.mockResolvedValue([
      relicResult([{ profile_id: 1, alias: "lem22", country: "br" }]),
      // Team stat group, the other member wasn't requested
      relicResult([
        { profile_id: 2, alias: "Hans", country: "" },
        { profile_id: 77, alias: "Other", country: "de" },
      ]),
    ]);

    const names = await getLadderPlayerNames([1, 2, 2, 3]);

    expect(mockedRelic).toHaveBeenCalledWith(["1", "2", "3"]);
    expect(names).toEqual({
      1: { alias: "lem22", country: "br" },
      2: { alias: "Hans", country: null },
    });
  });

  test("returns an empty object when Relic fails", async () => {
    mockedRelic.mockRejectedValue(new Error("Relic is down"));

    await expect(getLadderPlayerNames([1, 2])).resolves.toEqual({});
  });

  test("doesn't call Relic without ids", async () => {
    await expect(getLadderPlayerNames([])).resolves.toEqual({});
    expect(mockedRelic).not.toHaveBeenCalled();
  });
});
