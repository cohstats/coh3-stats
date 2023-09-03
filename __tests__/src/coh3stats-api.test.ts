import { ProcessedMatch } from "../../src/coh3/coh3-types";
import {
  getPlayerCardInfo,
  getPlayerRecentMatches,
  getTwitchStreams,
  getStatsData,
} from "../../src/coh3stats-api";

describe("coh3stats-api", () => {
  // Mock the fetch function
  const setupFetchStub =
    (data: any, ok = true, status = 200) =>
    () =>
      Promise.resolve({ json: () => Promise.resolve(data), ok, status });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub({}));
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test("getPlayerCardInfo should return player card info", async () => {
    // Define the fake data
    const fakeData = { response: { player_count: 5 } };

    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeData));

    const result = await getPlayerCardInfo(12345);
    expect(global.fetch).toBeCalledWith(
      "https://us-east4-coh3-stats-prod.cloudfunctions.net/getPlayerCardInfoHttp?relicId=12345",
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeData);
  });

  test("getPlayerCardInfo should return error 500", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 500));

    try {
      await getPlayerCardInfo(12345);
    } catch (error) {
      expect(error).toEqual(new Error("Error getting player card info: test error"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getPlayerCardInfo should return error on other status codes", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 400));

    try {
      await getPlayerCardInfo(12345);
    } catch (error) {
      expect(error).toEqual(new Error("Error getting player card info"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getPlayerRecentMatches should return player recent matches", async () => {
    const fakeMatchesData: Array<ProcessedMatch> = [
      {
        id: 1,
        creator_profile_id: 12345,
        mapname: "Test Map",
        maxplayers: 2,
        matchtype_id: 1,
        description: "Test Match 1 ",
        platform: "steam",
        startgametime: 1616161616,
        completiontime: 500,
        matchhistoryreportresults: [
          {
            profile_id: 12345,
            resulttype: 1,
            teamid: 1,
            race_id: 129494,
            counters: "test",
            profile: {
              name: "Test Player",
              alias: "Test",
              personal_statgroup_id: 1,
              xp: 1000,
              level: 1,
              leaderboardregion_id: 1,
              country: "US",
            },
            matchhistorymember: {
              statgroup_id: 1,
              wins: 10,
              losses: 5,
              streak: 5,
              arbitration: 1,
              outcome: 1,
              oldrating: 1000,
              newrating: 1100,
              reporttype: 1,
            },
          },
        ],
        matchhistoryitems: [],
        profile_ids: [12345],
      },
      {
        id: 2,
        creator_profile_id: 12345,
        mapname: "Test Map",
        maxplayers: 2,
        matchtype_id: 1,
        description: "Test Match 2",
        platform: "steam",
        startgametime: 1616161616,
        completiontime: 900,
        matchhistoryreportresults: [
          {
            profile_id: 12345,
            resulttype: 1,
            teamid: 1,
            race_id: 129494,
            counters: "test",
            profile: {
              name: "Test Player",
              alias: "Test",
              personal_statgroup_id: 1,
              xp: 1000,
              level: 1,
              leaderboardregion_id: 1,
              country: "US",
            },
            matchhistorymember: {
              statgroup_id: 1,
              wins: 10,
              losses: 5,
              streak: 5,
              arbitration: 1,
              outcome: 1,
              oldrating: 1000,
              newrating: 1100,
              reporttype: 1,
            },
          },
        ],
        matchhistoryitems: [],
        profile_ids: [12345],
      },
      {
        id: 3,
        creator_profile_id: 12345,
        mapname: "Test Map",
        maxplayers: 2,
        matchtype_id: 1,
        description: "Test Match 2",
        platform: "steam",
        startgametime: 1616161616,
        completiontime: 300,
        matchhistoryreportresults: [
          {
            profile_id: 12345,
            resulttype: 1,
            teamid: 1,
            race_id: 129494,
            counters: "test",
            profile: {
              name: "Test Player",
              alias: "Test",
              personal_statgroup_id: 1,
              xp: 1000,
              level: 1,
              leaderboardregion_id: 1,
              country: "US",
            },
            matchhistorymember: {
              statgroup_id: 1,
              wins: 10,
              losses: 5,
              streak: 5,
              arbitration: 1,
              outcome: 1,
              oldrating: 1000,
              newrating: 1100,
              reporttype: 1,
            },
          },
        ],
        matchhistoryitems: [],
        profile_ids: [12345],
      },
    ];

    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ playerMatches: fakeMatchesData }));

    const response = await getPlayerRecentMatches(12345);

    expect(global.fetch).toBeCalledWith(
      "https://us-east4-coh3-stats-prod.cloudfunctions.net/getPlayerMatchesHttp?relicId=12345",
    );
    expect(response[0].id).toBe(2);
    expect(response[1].id).toBe(1);
  });

  test("getPlayerRecentMatches should return error 500", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 500));

    try {
      await getPlayerRecentMatches(12345);
    } catch (error) {
      expect(error).toEqual(new Error("Error getting player recent matches: test error"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getPlayerRecentMatches should return error on 400", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 400));

    try {
      await getPlayerRecentMatches(12345);
    } catch (error) {
      expect(error).toEqual(new Error("Error getting player recent matches"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getTwitchStreams should return streams data", async () => {
    const fakeStreamData = { twitchStreams: "fake stream data" };
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeStreamData));

    const response = await getTwitchStreams();

    expect(response).toEqual("fake stream data");
    expect(global.fetch).toBeCalledWith(
      "https://us-east4-coh3-stats-prod.cloudfunctions.net/getTwitchStreamsHttp",
    );
  });

  test("getTwitchStreams should return error 500", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 500));

    try {
      await getTwitchStreams();
    } catch (error) {
      expect(error).toEqual(new Error("Error getting Twitch streams: test error"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getTwitchStreams should return error on 400", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 400));

    try {
      await getTwitchStreams();
    } catch (error) {
      expect(error).toEqual(new Error("Error getting Twitch streams"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getStatsData should return stats data", async () => {
    const fakeStatsData = { stats: "fake stats data" };
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeStatsData));

    const response = await getStatsData(123, "now", "gameStats", "cache-key-4");
    expect(global.fetch).toBeCalledWith(
      "https://cache.coh3stats.com/getAnalysisStatsHttp?startDate=123&endDate=now&type=gameStats&v=v7&ock=cache-key-4",
    );

    expect(response).toEqual(fakeStatsData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getStatsData should return error 500", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 500));

    try {
      await getStatsData(123, "now", "gameStats", "cache-key-4");
    } catch (error) {
      expect(error).toEqual(new Error("Error getting the stats data: test error"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("getStatsData should return error on 400", async () => {
    // @ts-ignore
    global.fetch.mockClear();
    // @ts-ignore
    jest
      .spyOn(global, "fetch")
      .mockImplementation(setupFetchStub({ error: "test error" }, false, 400));

    try {
      await getStatsData(123, "now", "gameStats", "cache-key-4");
    } catch (error) {
      expect(error).toEqual(new Error("Error getting the stats data"));
    }

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
