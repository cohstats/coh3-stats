/**
 * @jest-environment node
 */

import {
  __resetLadderTournamentCasterVideosCache,
  getLadderTournamentCasterVideos,
  getLadderTournamentCasterVideosForPlayer,
  getLadderTournamentCasterVideosUrl,
  getLadderTournamentFullRanking,
  getLadderTournamentPlayerData,
  getLadderTournamentRanking,
  getLadderTournamentRankingUrl,
  getLadderTournamentSeasons,
  getLadderTournamentSeasonsUrl,
} from "../../../src/apis/ladder-tournament-api";
import rankingResponse from "../../test-assets/ladder-tournament-ranking-response.json";
import casterVideosResponse from "../../test-assets/ladder-tournament-caster-videos-response.json";
import seasonsResponse from "../../test-assets/ladder-tournament-seasons-response.json";

const BASE_URL = "https://laddertournament.com.br:8099/api/external";
const TWO_HOURS = 2 * 60 * 60 * 1000;

const okResponse = (data: any) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as unknown as Response);

const errorResponse = (status = 500) =>
  Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  } as unknown as Response);

const timeoutError = () =>
  Promise.reject(new DOMException("The operation timed out.", "TimeoutError"));
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("ladder-tournament-api", () => {
  const originalToken = process.env.LADDER_TOURNAMENT_API_TOKEN;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.LADDER_TOURNAMENT_API_TOKEN = "test-token";
    __resetLadderTournamentCasterVideosCache();
    fetchSpy = jest.spyOn(global, "fetch");
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalToken === undefined) {
      delete process.env.LADDER_TOURNAMENT_API_TOKEN;
    } else {
      process.env.LADDER_TOURNAMENT_API_TOKEN = originalToken;
    }
  });

  describe("URL builders", () => {
    it("builds the ranking URL without seasonid", () => {
      expect(getLadderTournamentRankingUrl({ relicId: 123456, page: 1, pageSize: 500 })).toBe(
        `${BASE_URL}/ranking_ladder?page=1&pageSize=500&relicid=123456`,
      );
    });

    it("builds the ranking URL with seasonid", () => {
      expect(
        getLadderTournamentRankingUrl({ relicId: 123456, seasonId: 2, page: 3, pageSize: 100 }),
      ).toBe(`${BASE_URL}/ranking_ladder?page=3&pageSize=100&relicid=123456&seasonid=2`);
    });

    it("builds the ranking URL without relicid for all the players", () => {
      expect(getLadderTournamentRankingUrl({ page: 1, pageSize: 1000 })).toBe(
        `${BASE_URL}/ranking_ladder?page=1&pageSize=1000`,
      );
      expect(getLadderTournamentRankingUrl({ seasonId: 3, page: 2, pageSize: 1000 })).toBe(
        `${BASE_URL}/ranking_ladder?page=2&pageSize=1000&seasonid=3`,
      );
    });

    it("builds the caster videos URL", () => {
      expect(getLadderTournamentCasterVideosUrl()).toBe(`${BASE_URL}/casted_videos_ladder`);
    });

    it("builds the seasons URL", () => {
      expect(getLadderTournamentSeasonsUrl()).toBe(`${BASE_URL}/seasons`);
    });
  });

  describe("getLadderTournamentRanking", () => {
    it("calls the API with relicid, default paging and the token header", async () => {
      fetchSpy.mockImplementation(() => okResponse(rankingResponse));

      await getLadderTournamentRanking(123456);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${BASE_URL}/ranking_ladder?page=1&pageSize=500&relicid=123456`,
        {
          headers: { "X-Api-Token": "test-token" },
          cache: "no-store",
          signal: expect.any(AbortSignal),
        },
      );
    });

    it("passes seasonId, page and pageSize when provided", async () => {
      fetchSpy.mockImplementation(() => okResponse(rankingResponse));

      await getLadderTournamentRanking("123456", { seasonId: 2, page: 2, pageSize: 50 });

      expect(fetchSpy.mock.calls[0][0]).toBe(
        `${BASE_URL}/ranking_ladder?page=2&pageSize=50&relicid=123456&seasonid=2`,
      );
    });

    it("returns the parsed response", async () => {
      fetchSpy.mockImplementation(() => okResponse(rankingResponse));

      const result = await getLadderTournamentRanking(123456);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toMatchObject({
        seasonid: 1,
        relicid: 123456,
        rating: 0.86,
        ladderwinner: "Yes",
      });
      expect(result.hasNext).toBe(false);
      expect(result.total).toBe(2);
    });

    it("throws when the API returns a non-ok response", async () => {
      fetchSpy.mockImplementation(() => errorResponse(500));

      await expect(getLadderTournamentRanking(123456)).rejects.toThrow("status code: 500");
    });

    it("throws when a winner flag has an unexpected value", async () => {
      const response = {
        ...rankingResponse,
        items: [{ ...rankingResponse.items[0], ladderwinner: "Maybe" }],
      };
      fetchSpy.mockImplementation(() => okResponse(response));

      await expect(getLadderTournamentRanking(123456)).rejects.toThrow(
        "Invalid Ladder Tournament ranking response",
      );
    });

    it("throws when the pagination fields are missing", async () => {
      fetchSpy.mockImplementation(() => okResponse({ items: rankingResponse.items }));

      await expect(getLadderTournamentRanking(123456)).rejects.toThrow(
        "Invalid Ladder Tournament ranking response",
      );
    });

    it.each([0, -1, "abc", 1.5, ""])(
      "throws on invalid relicId %p without calling fetch",
      async (id) => {
        await expect(getLadderTournamentRanking(id as any)).rejects.toThrow("Invalid relicId");
        expect(fetchSpy).not.toHaveBeenCalled();
      },
    );

    it("throws when the token is not set without calling fetch", async () => {
      delete process.env.LADDER_TOURNAMENT_API_TOKEN;

      await expect(getLadderTournamentRanking(123456)).rejects.toThrow(
        "LADDER_TOURNAMENT_API_TOKEN is not set",
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("getLadderTournamentFullRanking", () => {
    const page = (pageNumber: number, hasNext: boolean, relicid: number) => ({
      ...rankingResponse,
      items: [{ ...rankingResponse.items[0], relicid }],
      page: pageNumber,
      pageSize: 1000,
      hasPrevious: pageNumber > 1,
      hasNext,
    });

    it("follows hasNext across the pages and returns all the items", async () => {
      fetchSpy
        .mockImplementationOnce(() => okResponse(page(1, true, 1)))
        .mockImplementationOnce(() => okResponse(page(2, true, 2)))
        .mockImplementationOnce(() => okResponse(page(3, false, 3)));

      const items = await getLadderTournamentFullRanking();

      expect(items.map((item) => item.relicid)).toEqual([1, 2, 3]);
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(fetchSpy.mock.calls.map((call) => call[0])).toEqual([
        `${BASE_URL}/ranking_ladder?page=1&pageSize=1000`,
        `${BASE_URL}/ranking_ladder?page=2&pageSize=1000`,
        `${BASE_URL}/ranking_ladder?page=3&pageSize=1000`,
      ]);
      expect(fetchSpy.mock.calls[0][1]).toEqual({
        headers: { "X-Api-Token": "test-token" },
        cache: "no-store",
        signal: expect.any(AbortSignal),
      });
    });

    it("passes the seasonId", async () => {
      fetchSpy.mockImplementation(() => okResponse(page(1, false, 1)));

      await getLadderTournamentFullRanking({ seasonId: 2 });

      expect(fetchSpy.mock.calls[0][0]).toBe(
        `${BASE_URL}/ranking_ladder?page=1&pageSize=1000&seasonid=2`,
      );
    });

    it("stops at the safety cap when the API keeps returning hasNext", async () => {
      fetchSpy.mockImplementation(() => okResponse(page(1, true, 1)));

      const items = await getLadderTournamentFullRanking();

      expect(fetchSpy).toHaveBeenCalledTimes(50);
      expect(items).toHaveLength(50);
      expect(console.error).toHaveBeenCalled();
    });

    it("throws when a page response is invalid", async () => {
      fetchSpy
        .mockImplementationOnce(() => okResponse(page(1, true, 1)))
        .mockImplementationOnce(() => okResponse({ items: [] }));

      await expect(getLadderTournamentFullRanking()).rejects.toThrow(
        "Invalid Ladder Tournament ranking response",
      );
    });

    it("throws when a page returns a non-ok response", async () => {
      fetchSpy.mockImplementation(() => errorResponse(502));

      await expect(getLadderTournamentFullRanking()).rejects.toThrow("status code: 502");
    });
  });

  describe("getLadderTournamentCasterVideos", () => {
    let now: number;

    beforeEach(() => {
      now = new Date("2026-10-01T12:00:00Z").getTime();
      jest.spyOn(Date, "now").mockImplementation(() => now);
    });

    it("fetches the videos with the token header on the first call", async () => {
      fetchSpy.mockImplementation(() => okResponse(casterVideosResponse));

      const result = await getLadderTournamentCasterVideos();

      expect(result).toEqual(casterVideosResponse);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/casted_videos_ladder`, {
        headers: { "X-Api-Token": "test-token" },
        cache: "no-store",
        signal: expect.any(AbortSignal),
      });
    });

    it("returns cached data on subsequent calls within 2 hours", async () => {
      fetchSpy.mockImplementation(() => okResponse(casterVideosResponse));

      await getLadderTournamentCasterVideos();
      now += 60 * 1000;
      const second = await getLadderTournamentCasterVideos();
      now += TWO_HOURS - 2 * 60 * 1000; // 1h59m after first fetch
      const third = await getLadderTournamentCasterVideos();

      expect(second).toEqual(casterVideosResponse);
      expect(third).toEqual(casterVideosResponse);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("returns stale data after 2 hours and refreshes in the background", async () => {
      const freshVideos = [{ ...casterVideosResponse[0], title: "New video" }];
      fetchSpy
        .mockImplementationOnce(() => okResponse(casterVideosResponse))
        .mockImplementationOnce(() => okResponse(freshVideos));

      await getLadderTournamentCasterVideos();
      now += TWO_HOURS + 1;

      const stale = await getLadderTournamentCasterVideos();
      expect(stale).toEqual(casterVideosResponse);
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      await flushPromises();

      const fresh = await getLadderTournamentCasterVideos();
      expect(fresh).toEqual(freshVideos);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("does not start multiple background refreshes at once", async () => {
      let resolveRefresh: (value: Response) => void = () => {};
      fetchSpy
        .mockImplementationOnce(() => okResponse(casterVideosResponse))
        .mockImplementationOnce(
          () => new Promise<Response>((resolve) => (resolveRefresh = resolve)),
        );

      await getLadderTournamentCasterVideos();
      now += TWO_HOURS + 1;

      await getLadderTournamentCasterVideos();
      await getLadderTournamentCasterVideos();
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      resolveRefresh(await okResponse(casterVideosResponse));
      await flushPromises();
    });

    it.each([
      ["non-ok response", () => errorResponse(503)],
      ["rejected fetch", () => Promise.reject(new Error("network down"))],
      ["timeout", timeoutError],
    ])(
      "keeps stale data when the background refresh fails (%s) and retries later",
      async (_, failure) => {
        fetchSpy
          .mockImplementationOnce(() => okResponse(casterVideosResponse))
          .mockImplementationOnce(failure)
          .mockImplementationOnce(() => okResponse([]));

        await getLadderTournamentCasterVideos();
        now += TWO_HOURS + 1;

        expect(await getLadderTournamentCasterVideos()).toEqual(casterVideosResponse);
        await flushPromises();

        // Still stale data, a new refresh attempt is triggered
        expect(await getLadderTournamentCasterVideos()).toEqual(casterVideosResponse);
        expect(fetchSpy).toHaveBeenCalledTimes(3);
        await flushPromises();

        // Empty array is a valid response and gets cached
        expect(await getLadderTournamentCasterVideos()).toEqual([]);
        expect(fetchSpy).toHaveBeenCalledTimes(3);
      },
    );

    it("makes a single API call for concurrent cold-start calls", async () => {
      fetchSpy.mockImplementation(() => okResponse(casterVideosResponse));

      const results = await Promise.all([
        getLadderTournamentCasterVideos(),
        getLadderTournamentCasterVideos(),
        getLadderTournamentCasterVideos(),
      ]);

      results.forEach((result) => expect(result).toEqual(casterVideosResponse));
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("throws on cold-start failure and does not cache anything", async () => {
      fetchSpy
        .mockImplementationOnce(() => errorResponse(500))
        .mockImplementationOnce(() => okResponse(casterVideosResponse));

      await expect(getLadderTournamentCasterVideos()).rejects.toThrow("status code: 500");

      const result = await getLadderTournamentCasterVideos();
      expect(result).toEqual(casterVideosResponse);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("accepts and keeps the optional video id", async () => {
      fetchSpy.mockImplementation(() =>
        okResponse([{ ...casterVideosResponse[0], id: 42 }, casterVideosResponse[1]]),
      );

      const videos = await getLadderTournamentCasterVideos();

      expect(videos[0].id).toBe(42);
      expect(videos[1].id).toBeUndefined();
    });

    it("throws on a response with unexpected keys and does not cache it", async () => {
      const { playerRelicId, ...withoutPlayers } = casterVideosResponse[0];
      fetchSpy
        .mockImplementationOnce(() => okResponse([{ ...withoutPlayers, players: playerRelicId }]))
        .mockImplementationOnce(() => okResponse(casterVideosResponse));

      await expect(getLadderTournamentCasterVideos()).rejects.toThrow(
        "Invalid Ladder Tournament caster videos response",
      );

      expect(await getLadderTournamentCasterVideos()).toEqual(casterVideosResponse);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("keeps stale data when the background refresh returns an invalid response", async () => {
      fetchSpy
        .mockImplementationOnce(() => okResponse(casterVideosResponse))
        .mockImplementationOnce(() => okResponse({ videos: casterVideosResponse }));

      await getLadderTournamentCasterVideos();
      now += TWO_HOURS + 1;

      expect(await getLadderTournamentCasterVideos()).toEqual(casterVideosResponse);
      await flushPromises();
      expect(await getLadderTournamentCasterVideos()).toEqual(casterVideosResponse);
    });

    it("throws when the token is not set", async () => {
      delete process.env.LADDER_TOURNAMENT_API_TOKEN;

      await expect(getLadderTournamentCasterVideos()).rejects.toThrow(
        "LADDER_TOURNAMENT_API_TOKEN is not set",
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("getLadderTournamentSeasons", () => {
    it("calls the API with the token header", async () => {
      fetchSpy.mockReturnValue(okResponse(seasonsResponse));

      await getLadderTournamentSeasons();

      expect(fetchSpy).toHaveBeenCalledWith(
        `${BASE_URL}/seasons`,
        expect.objectContaining({ headers: { "X-Api-Token": "test-token" } }),
      );
    });

    it("returns the seasons without the unused fields", async () => {
      fetchSpy.mockReturnValue(okResponse(seasonsResponse));

      const seasons = await getLadderTournamentSeasons();

      expect(seasons.map((season) => season.id)).toEqual([2, 1]);
      expect(seasons[0]).toMatchObject({
        name: "BloodAndSteel",
        status: "Draft",
        ladderStart: "2026-11-03T10:00:00",
        playoffCut: 8,
        ladderBestOf: 1,
      });
      expect(seasons[0]).not.toHaveProperty("registrationFee");
      expect(seasons[0]).not.toHaveProperty("rules");
    });

    it("throws on the PascalCase keys from the docs", async () => {
      fetchSpy.mockReturnValue(okResponse([{ Id: 1, Name: "Season 1", Status: "Active" }]));

      await expect(getLadderTournamentSeasons()).rejects.toThrow(
        "Invalid Ladder Tournament seasons response",
      );
    });

    it("throws when the API returns a non-ok response", async () => {
      fetchSpy.mockReturnValue(errorResponse(503));

      await expect(getLadderTournamentSeasons()).rejects.toThrow("status code: 503");
    });

    it("throws when the token is not set without calling fetch", async () => {
      delete process.env.LADDER_TOURNAMENT_API_TOKEN;

      await expect(getLadderTournamentSeasons()).rejects.toThrow(
        "LADDER_TOURNAMENT_API_TOKEN is not set",
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("getLadderTournamentCasterVideosForPlayer", () => {
    const video = (title: string, publishedAt: string, playerRelicId: string) => ({
      ...casterVideosResponse[0],
      title,
      publishedAt,
      playerRelicId,
    });

    const videos = [
      video("v1", "2026-08-01T00:00:00", "111,222"),
      video("v2", "2026-09-07T00:00:00", "333, 111"),
      video("v3", "2026-07-15T00:00:00", "1111,2222"),
      video("v4", "2026-08-20T00:00:00", "111"),
      video("v5", "2026-09-01T00:00:00", "444"),
    ];

    beforeEach(() => {
      fetchSpy.mockImplementation(() => okResponse(videos));
    });

    it("returns only the player's videos sorted from the newest", async () => {
      const result = await getLadderTournamentCasterVideosForPlayer(111, 10);

      // v3 contains "1111" which must not match "111"
      expect(result.map((v) => v.title)).toEqual(["v2", "v4", "v1"]);
    });

    it("respects the limit", async () => {
      const result = await getLadderTournamentCasterVideosForPlayer("111", 2);

      expect(result.map((v) => v.title)).toEqual(["v2", "v4"]);
    });

    it("uses default limit of 10", async () => {
      const many = Array.from({ length: 15 }, (_, i) =>
        video(`v${i}`, `2026-09-${String(i + 1).padStart(2, "0")}T00:00:00`, "111"),
      );
      fetchSpy.mockImplementation(() => okResponse(many));

      const result = await getLadderTournamentCasterVideosForPlayer(111);

      expect(result).toHaveLength(10);
      expect(result[0].title).toBe("v14");
    });

    it("returns an empty array when the player has no videos", async () => {
      expect(await getLadderTournamentCasterVideosForPlayer(999, 5)).toEqual([]);
    });

    it("uses the cached videos and does not mutate the cache order", async () => {
      await getLadderTournamentCasterVideosForPlayer(111, 5);
      await getLadderTournamentCasterVideosForPlayer(222, 5);
      const all = await getLadderTournamentCasterVideos();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(all.map((v) => v.title)).toEqual(["v1", "v2", "v3", "v4", "v5"]);
    });

    it.each([0, -1, "abc"])("throws on invalid relicId %p", async (id) => {
      await expect(getLadderTournamentCasterVideosForPlayer(id as any, 5)).rejects.toThrow(
        "Invalid relicId",
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it.each([0, -1, 1.5])("throws on invalid limit %p", async (limit) => {
      await expect(getLadderTournamentCasterVideosForPlayer(111, limit)).rejects.toThrow(
        "Invalid limit",
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
  describe("getLadderTournamentPlayerData", () => {
    const mockByUrl = (rankingFails = false, videosFail = false) =>
      fetchSpy.mockImplementation((url: string) => {
        if (url.includes("ranking_ladder")) {
          return rankingFails ? errorResponse(500) : okResponse(rankingResponse);
        }
        return videosFail ? errorResponse(500) : okResponse(casterVideosResponse);
      });

    it("returns the player videos and the ranking", async () => {
      mockByUrl();

      const result = await getLadderTournamentPlayerData(991764);

      expect(result.videos?.map((video) => video.title)).toEqual([
        "A Bad Day to Be An Aussie G2",
        "Desert Armour Clash!",
      ]);
      expect(result.ladderRanking).toEqual(rankingResponse.items);
    });

    it("returns null for the ranking when it fails, but keeps the videos", async () => {
      mockByUrl(true, false);

      const result = await getLadderTournamentPlayerData(991764);

      expect(result.ladderRanking).toBeNull();
      expect(result.videos).toHaveLength(2);
    });

    it("returns null for the videos when they fail, but keeps the ranking", async () => {
      mockByUrl(false, true);

      const result = await getLadderTournamentPlayerData(991764);

      expect(result.videos).toBeNull();
      expect(result.ladderRanking).toHaveLength(2);
    });

    it("returns null for both when the API times out", async () => {
      fetchSpy.mockImplementation(timeoutError);

      await expect(getLadderTournamentRanking(123456)).rejects.toThrow(
        "Ladder Tournament API timed out after 30s",
      );
      await expect(getLadderTournamentPlayerData(991764)).resolves.toEqual({
        videos: null,
        ladderRanking: null,
      });
    });

    it("never throws, even without the token", async () => {
      delete process.env.LADDER_TOURNAMENT_API_TOKEN;

      await expect(getLadderTournamentPlayerData(991764)).resolves.toEqual({
        videos: null,
        ladderRanking: null,
      });
    });
  });
});
