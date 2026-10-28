/**
 * @jest-environment node
 */

import {
  __resetIroncladTournamentsCache,
  getIroncladPlayerData,
  getIroncladPlayerTournaments,
  getIroncladPlayerTournamentsUrl,
  getIroncladTournament,
  getIroncladTournaments,
  getIroncladTournamentsCached,
  getIroncladTournamentsUrl,
  getIroncladTournamentUrl,
} from "../../../src/apis/ironclad-tournament-api";
import tournamentsResponse from "../../test-assets/ironclad-tournaments-response.json";
import playerTournamentsResponse from "../../test-assets/ironclad-player-tournaments-response.json";

const BASE_URL = "https://www.ironcladtournaments.com/api/partners/v1";
const FIVE_MINUTES = 5 * 60 * 1000;
const SCHEMA_VERSION = "ironclad.competition.v1";

const okResponse = (data: any) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as unknown as Response);

const errorResponse = (status = 500, body: any = {}) =>
  Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response);

const timeoutError = () =>
  Promise.reject(new DOMException("The operation timed out.", "TimeoutError"));
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const tournamentsPage = (
  data: any[],
  pagination: { offset: number; hasMore: boolean; nextOffset: number | null },
) => ({
  schemaVersion: SCHEMA_VERSION,
  data,
  pagination: { limit: 10, truncated: false, ...pagination },
});

const playerPage = (entries: any[], offset = 0) => ({
  ...playerTournamentsResponse,
  data: { ...playerTournamentsResponse.data, entries },
  pagination: { limit: 10, offset },
});

const [holdTheLine, theNewFront] = tournamentsResponse.data;
const playerEntries = playerTournamentsResponse.data.entries;

describe("ironclad-tournament-api", () => {
  const originalToken = process.env.IRONCLAD_TOURNAMENT_API_TOKEN;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.IRONCLAD_TOURNAMENT_API_TOKEN = "test-token";
    __resetIroncladTournamentsCache();
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
      delete process.env.IRONCLAD_TOURNAMENT_API_TOKEN;
    } else {
      process.env.IRONCLAD_TOURNAMENT_API_TOKEN = originalToken;
    }
  });

  describe("URL builders", () => {
    it("builds the tournaments URL", () => {
      expect(getIroncladTournamentsUrl({ offset: 0, limit: 10 })).toBe(
        `${BASE_URL}/tournaments?limit=10&offset=0`,
      );
      expect(getIroncladTournamentsUrl({ status: "completed", offset: 10, limit: 10 })).toBe(
        `${BASE_URL}/tournaments?limit=10&offset=10&status=completed`,
      );
    });

    it("builds the tournament URL", () => {
      expect(getIroncladTournamentUrl("hold-the-line")).toBe(
        `${BASE_URL}/tournaments/hold-the-line`,
      );
    });

    it("builds the player tournaments URL", () => {
      expect(getIroncladPlayerTournamentsUrl({ relicId: 1188298, offset: 20, limit: 10 })).toBe(
        `${BASE_URL}/players/1188298/tournaments?limit=10&offset=20`,
      );
    });
  });

  describe("getIroncladTournaments", () => {
    it("calls the API with the token header and without the Next fetch cache", async () => {
      fetchSpy.mockReturnValueOnce(okResponse(tournamentsResponse));

      const tournaments = await getIroncladTournaments();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/tournaments?limit=10&offset=0`, {
        headers: { "X-Api-Token": "test-token" },
        cache: "no-store",
        signal: expect.any(AbortSignal),
      });
      expect(tournaments.map((tournament) => tournament.slug)).toEqual([
        "hold-the-line",
        "the-new-front",
      ]);
      expect(tournaments[1].divisions[0].bracket?.matches).toHaveLength(7);
    });

    it("passes the status", async () => {
      fetchSpy.mockReturnValueOnce(okResponse(tournamentsResponse));

      await getIroncladTournaments({ status: "in_progress" });

      expect(fetchSpy.mock.calls[0][0]).toBe(
        `${BASE_URL}/tournaments?limit=10&offset=0&status=in_progress`,
      );
    });

    it("follows nextOffset across the pages", async () => {
      fetchSpy
        .mockReturnValueOnce(
          okResponse(
            tournamentsPage([holdTheLine], { offset: 0, hasMore: true, nextOffset: 10 }),
          ),
        )
        .mockReturnValueOnce(
          okResponse(
            tournamentsPage([theNewFront], { offset: 10, hasMore: false, nextOffset: null }),
          ),
        );

      const tournaments = await getIroncladTournaments();

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy.mock.calls[1][0]).toBe(`${BASE_URL}/tournaments?limit=10&offset=10`);
      expect(tournaments.map((tournament) => tournament.slug)).toEqual([
        "hold-the-line",
        "the-new-front",
      ]);
    });

    it("stops at the safety cap when the API keeps returning hasMore", async () => {
      fetchSpy.mockImplementation(() =>
        okResponse(tournamentsPage([holdTheLine], { offset: 0, hasMore: true, nextOffset: 10 })),
      );

      const tournaments = await getIroncladTournaments();

      expect(fetchSpy).toHaveBeenCalledTimes(20);
      expect(tournaments).toHaveLength(20);
    });

    it("accepts an unknown status value", async () => {
      fetchSpy.mockReturnValueOnce(
        okResponse(
          tournamentsPage([{ ...holdTheLine, status: "paused" }], {
            offset: 0,
            hasMore: false,
            nextOffset: null,
          }),
        ),
      );

      const [tournament] = await getIroncladTournaments();

      expect(tournament.status).toBe("paused");
    });

    it("throws when a key is missing", async () => {
      const { divisions, ...withoutDivisions } = holdTheLine;
      fetchSpy.mockReturnValueOnce(
        okResponse(
          tournamentsPage([withoutDivisions], { offset: 0, hasMore: false, nextOffset: null }),
        ),
      );

      await expect(getIroncladTournaments()).rejects.toThrow(
        "Invalid IronClad tournaments response",
      );
      expect(divisions).toBeDefined();
    });

    it("throws on an unexpected schema version", async () => {
      fetchSpy.mockReturnValueOnce(
        okResponse({ ...tournamentsResponse, schemaVersion: "ironclad.competition.v2" }),
      );

      await expect(getIroncladTournaments()).rejects.toThrow(
        "Invalid IronClad tournaments response",
      );
    });

    it("throws when the API returns a non-ok response", async () => {
      fetchSpy.mockReturnValueOnce(errorResponse(401));

      await expect(getIroncladTournaments()).rejects.toThrow("status code: 401");
    });

    it("throws when the token is not set without calling fetch", async () => {
      delete process.env.IRONCLAD_TOURNAMENT_API_TOKEN;

      await expect(getIroncladTournaments()).rejects.toThrow(
        "IRONCLAD_TOURNAMENT_API_TOKEN is not set",
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("getIroncladTournament", () => {
    it("returns the tournament", async () => {
      fetchSpy.mockReturnValueOnce(
        okResponse({ schemaVersion: SCHEMA_VERSION, data: theNewFront }),
      );

      const tournament = await getIroncladTournament("the-new-front");

      expect(fetchSpy.mock.calls[0][0]).toBe(`${BASE_URL}/tournaments/the-new-front`);
      expect(tournament?.name).toBe("THE NEW FRONT");
    });

    it("returns null when the tournament doesn't exist", async () => {
      fetchSpy.mockReturnValueOnce(
        errorResponse(404, { schemaVersion: SCHEMA_VERSION, error: "tournament_not_available" }),
      );

      await expect(getIroncladTournament("nope")).resolves.toBeNull();
    });

    it("returns null for an invalid slug without calling the API", async () => {
      await expect(getIroncladTournament("../players")).resolves.toBeNull();
      await expect(getIroncladTournament("Hold The Line")).resolves.toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("throws on a 404 without the not available error code", async () => {
      fetchSpy.mockReturnValueOnce(errorResponse(404, "Not found"));

      await expect(getIroncladTournament("hold-the-line")).rejects.toThrow("status code: 404");
    });

    it("throws on a server error", async () => {
      fetchSpy.mockReturnValueOnce(errorResponse(500));

      await expect(getIroncladTournament("hold-the-line")).rejects.toThrow("status code: 500");
    });
  });

  describe("getIroncladPlayerTournaments", () => {
    it("returns the player history and the aggregate", async () => {
      fetchSpy.mockReturnValueOnce(okResponse(playerTournamentsResponse));

      const history = await getIroncladPlayerTournaments("1188298");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        `${BASE_URL}/players/1188298/tournaments?limit=10&offset=0`,
        {
          headers: { "X-Api-Token": "test-token" },
          cache: "no-store",
          signal: expect.any(AbortSignal),
        },
      );
      expect(history.currentIdentity?.alias).toBe("CartelCub");
      expect(history.entries).toHaveLength(2);
      // Same as the API aggregate for a single page
      expect(history.aggregate).toEqual({
        tournamentsEntered: 2,
        matchesPlayed: 1,
        wins: 0,
        losses: 1,
        titles: 0,
      });
    });

    it("follows the pages while they are full and aggregates all of them", async () => {
      const fullPage = Array.from({ length: 10 }, (_, index) => ({
        ...playerEntries[1],
        registrationId: `registration-${index}`,
        tournament: { ...playerEntries[1].tournament, id: `tournament-${index}` },
        champion: index === 0,
      }));
      fetchSpy
        .mockReturnValueOnce(okResponse(playerPage(fullPage)))
        .mockReturnValueOnce(okResponse(playerPage([playerEntries[0]], 10)));

      const history = await getIroncladPlayerTournaments(1188298);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy.mock.calls[1][0]).toBe(
        `${BASE_URL}/players/1188298/tournaments?limit=10&offset=10`,
      );
      expect(history.entries).toHaveLength(11);
      expect(history.aggregate).toEqual({
        tournamentsEntered: 11,
        matchesPlayed: 10,
        wins: 0,
        losses: 10,
        titles: 1,
      });
    });

    it("returns an empty history for a player without IronClad tournaments", async () => {
      fetchSpy.mockReturnValueOnce(
        errorResponse(404, { schemaVersion: SCHEMA_VERSION, error: "player_not_available" }),
      );

      await expect(getIroncladPlayerTournaments(1)).resolves.toEqual({
        relicProfileId: "1",
        currentIdentity: null,
        entries: [],
        aggregate: { tournamentsEntered: 0, matchesPlayed: 0, wins: 0, losses: 0, titles: 0 },
      });
    });

    it("throws for an invalid relicId without calling the API", async () => {
      await expect(getIroncladPlayerTournaments("abc")).rejects.toThrow("Invalid relicId");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("throws on a server error", async () => {
      fetchSpy.mockReturnValueOnce(errorResponse(500));

      await expect(getIroncladPlayerTournaments(1188298)).rejects.toThrow("status code: 500");
    });

    it("throws on a response with a missing key", async () => {
      const { record, ...withoutRecord } = playerEntries[0];
      fetchSpy.mockReturnValueOnce(okResponse(playerPage([withoutRecord])));

      await expect(getIroncladPlayerTournaments(1188298)).rejects.toThrow(
        "Invalid IronClad player tournaments response",
      );
      expect(record).toBeDefined();
    });
  });

  describe("getIroncladTournamentsCached", () => {
    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ["setImmediate"] });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("returns cached data on subsequent calls within 5 minutes", async () => {
      fetchSpy.mockReturnValue(okResponse(tournamentsResponse));

      await getIroncladTournamentsCached();
      jest.advanceTimersByTime(FIVE_MINUTES - 1000);
      const tournaments = await getIroncladTournamentsCached();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(tournaments).toHaveLength(2);
    });

    it("returns stale data after 5 minutes and refreshes in the background", async () => {
      fetchSpy.mockReturnValueOnce(okResponse(tournamentsResponse));
      await getIroncladTournamentsCached();

      jest.advanceTimersByTime(FIVE_MINUTES + 1000);
      fetchSpy.mockReturnValueOnce(
        okResponse(
          tournamentsPage([holdTheLine], { offset: 0, hasMore: false, nextOffset: null }),
        ),
      );

      const stale = await getIroncladTournamentsCached();
      expect(stale).toHaveLength(2);

      await flushPromises();
      const fresh = await getIroncladTournamentsCached();
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fresh).toHaveLength(1);
    });

    it("makes a single API call for concurrent cold-start calls", async () => {
      fetchSpy.mockReturnValue(okResponse(tournamentsResponse));

      await Promise.all([getIroncladTournamentsCached(), getIroncladTournamentsCached()]);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("throws on cold-start failure and does not cache anything", async () => {
      fetchSpy.mockReturnValueOnce(errorResponse(500));
      await expect(getIroncladTournamentsCached()).rejects.toThrow("status code: 500");

      fetchSpy.mockReturnValueOnce(okResponse(tournamentsResponse));
      await expect(getIroncladTournamentsCached()).resolves.toHaveLength(2);
    });

    it("keeps stale data when the background refresh fails", async () => {
      fetchSpy.mockReturnValueOnce(okResponse(tournamentsResponse));
      await getIroncladTournamentsCached();

      jest.advanceTimersByTime(FIVE_MINUTES + 1000);
      fetchSpy.mockReturnValueOnce(errorResponse(500));
      await getIroncladTournamentsCached();
      await flushPromises();

      await expect(getIroncladTournamentsCached()).resolves.toHaveLength(2);
    });

    it("keeps the stale cache when the background refresh times out, then recovers", async () => {
      fetchSpy.mockReturnValueOnce(okResponse(tournamentsResponse));
      await getIroncladTournamentsCached();

      jest.advanceTimersByTime(FIVE_MINUTES + 1000);
      fetchSpy.mockImplementationOnce(timeoutError);
      await expect(getIroncladTournamentsCached()).resolves.toHaveLength(2);
      await flushPromises();

      // The refresh is retried, not stuck in the updating state
      fetchSpy.mockReturnValueOnce(
        okResponse(
          tournamentsPage([holdTheLine], { offset: 0, hasMore: false, nextOffset: null }),
        ),
      );
      await getIroncladTournamentsCached();
      await flushPromises();
      await expect(getIroncladTournamentsCached()).resolves.toHaveLength(1);
    });
  });

  describe("request timeout", () => {
    it("rejects with a clear message when the API times out", async () => {
      fetchSpy.mockImplementation(timeoutError);

      await expect(getIroncladTournaments()).rejects.toThrow("IronClad API timed out after 30s");
      await expect(getIroncladTournament("the-new-front")).rejects.toThrow(
        "IronClad API timed out after 30s",
      );
      await expect(getIroncladPlayerTournaments("1188298")).rejects.toThrow(
        "IronClad API timed out after 30s",
      );
    });

    it("returns the unavailable player data when the API times out", async () => {
      fetchSpy.mockImplementation(timeoutError);

      await expect(getIroncladPlayerData("1188298")).resolves.toEqual({
        history: null,
        registrations: {},
        finalRounds: {},
      });
    });
  });

  describe("getIroncladPlayerData", () => {
    const mockApi = (player: Promise<Response>, tournaments: Promise<Response>) => {
      fetchSpy.mockImplementation((url: string) =>
        url.includes("/players/") ? player : tournaments,
      );
    };

    it("returns the history with the registrations and final rounds of the played divisions", async () => {
      mockApi(okResponse(playerTournamentsResponse), okResponse(tournamentsResponse));

      const data = await getIroncladPlayerData("1188298");

      expect(data.history?.entries).toHaveLength(2);
      // HOLD THE LINE Academy (6) + THE NEW FRONT Academy (8)
      expect(Object.keys(data.registrations)).toHaveLength(14);
      // Highcammax beat the player in the quarter finals
      expect(data.registrations["dac7a3b0-4b1f-4ff7-b893-0dc50d8ed097"]).toEqual({
        eventAlias: "Highcammax",
        relicProfileId: null,
      });
      // Only THE NEW FRONT Academy has a bracket
      expect(data.finalRounds).toEqual({ "2f69c609-b876-45e1-ba48-561717d19b4f": 3 });
    });

    it("loads fresh the tournaments where the cached list misses the bracket", async () => {
      // The cached list is from before THE NEW FRONT Academy bracket was generated
      const staleNewFront = {
        ...theNewFront,
        divisions: theNewFront.divisions.map((division) => ({ ...division, bracket: null })),
      };
      fetchSpy.mockImplementation((url: string) => {
        if (url.includes("/players/")) return okResponse(playerTournamentsResponse);
        if (url.endsWith("/tournaments/the-new-front")) {
          return okResponse({ schemaVersion: SCHEMA_VERSION, data: theNewFront });
        }
        return okResponse(
          tournamentsPage([holdTheLine, staleNewFront], {
            offset: 0,
            hasMore: false,
            nextOffset: null,
          }),
        );
      });

      const data = await getIroncladPlayerData("1188298");

      const detailCalls = fetchSpy.mock.calls.filter(([url]) =>
        String(url).endsWith("/tournaments/the-new-front"),
      );
      expect(detailCalls).toHaveLength(1);
      expect(data.finalRounds).toEqual({ "2f69c609-b876-45e1-ba48-561717d19b4f": 3 });
      expect(Object.keys(data.registrations)).toHaveLength(14);
    });

    it("loads the played tournaments one by one when the list fails", async () => {
      fetchSpy.mockImplementation((url: string) => {
        if (url.includes("/players/")) return okResponse(playerTournamentsResponse);
        if (url.endsWith("/tournaments/the-new-front")) {
          return okResponse({ schemaVersion: SCHEMA_VERSION, data: theNewFront });
        }
        if (url.endsWith("/tournaments/hold-the-line")) {
          return okResponse({ schemaVersion: SCHEMA_VERSION, data: holdTheLine });
        }
        return errorResponse(500);
      });

      const data = await getIroncladPlayerData("1188298");

      expect(Object.keys(data.registrations)).toHaveLength(14);
      expect(data.finalRounds).toEqual({ "2f69c609-b876-45e1-ba48-561717d19b4f": 3 });
    });

    it("returns null history when it fails, but keeps the registrations", async () => {
      mockApi(errorResponse(500), okResponse(tournamentsResponse));

      const data = await getIroncladPlayerData("1188298");

      expect(data.history).toBeNull();
      // Without the history we don't know the played divisions
      expect(data.registrations).toEqual({});
    });

    it("returns empty registrations when the tournaments fail, but keeps the history", async () => {
      mockApi(okResponse(playerTournamentsResponse), errorResponse(500));

      const data = await getIroncladPlayerData("1188298");

      expect(data.history?.entries).toHaveLength(2);
      expect(data.registrations).toEqual({});
      expect(data.finalRounds).toEqual({});
    });

    it("never throws, even without the token", async () => {
      delete process.env.IRONCLAD_TOURNAMENT_API_TOKEN;

      await expect(getIroncladPlayerData("1188298")).resolves.toEqual({
        history: null,
        registrations: {},
        finalRounds: {},
      });
    });
  });
});
