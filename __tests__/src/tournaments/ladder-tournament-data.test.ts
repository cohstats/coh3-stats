/**
 * @jest-environment node
 */

import {
  getLadderHubResult,
  getLadderOverviewResult,
  getLadderSeasonPageResult,
} from "../../../src/tournaments/ladder-tournament-data";
import {
  getLadderTournamentCasterVideos,
  getLadderTournamentFullRanking,
  getLadderTournamentSeasons,
} from "../../../src/apis/ladder-tournament-api";
import { getLadderPlayerNames } from "../../../src/tournaments/ladder-tournament-names";
import rankingResponse from "../../test-assets/ladder-tournament-ranking-response.json";
import casterVideosResponse from "../../test-assets/ladder-tournament-caster-videos-response.json";
import seasonsResponse from "../../test-assets/ladder-tournament-seasons-response.json";
import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
  LadderTournamentSeason,
} from "../../../src/apis/ladder-tournament-api";

jest.mock("../../../src/apis/ladder-tournament-api", () => ({
  getLadderTournamentFullRanking: jest.fn(),
  getLadderTournamentCasterVideos: jest.fn(),
  getLadderTournamentSeasons: jest.fn(),
}));
jest.mock("../../../src/tournaments/ladder-tournament-names", () => ({
  getLadderPlayerNames: jest.fn(),
}));

const mockedRanking = getLadderTournamentFullRanking as jest.Mock;
const mockedVideos = getLadderTournamentCasterVideos as jest.Mock;
const mockedSeasons = getLadderTournamentSeasons as jest.Mock;
const mockedNames = getLadderPlayerNames as jest.Mock;

// Season 1 and 2 in the ranking, the casts are season 1
const ranking = rankingResponse.items as LadderTournamentRankingItem[];
const videos = casterVideosResponse as LadderTournamentCasterVideo[];
// Season 2 "BloodAndSteel" is Draft, season 1 is Finished
const seasons = seasonsResponse as LadderTournamentSeason[];

describe("ladder-tournament-data", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockedRanking.mockResolvedValue(ranking);
    mockedVideos.mockResolvedValue(videos);
    mockedSeasons.mockResolvedValue(seasons);
    mockedNames.mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getLadderSeasonPageResult", () => {
    test("renders the latest season when no season is given", async () => {
      const result = await getLadderSeasonPageResult();

      expect(result.status).toBe("ok");
      expect(result.status === "ok" && result.data.seasonId).toBe(2);
      expect(result.revalidate).toBe(3600);
    });

    test("renders the given season and looks up the names of its players", async () => {
      const result = await getLadderSeasonPageResult(1);

      expect(result.status === "ok" && result.data.seasonId).toBe(1);
      expect(result.status === "ok" && result.data.stages.length).toBeGreaterThan(0);
      expect(mockedNames).toHaveBeenCalledWith(expect.arrayContaining([123456]));
    });

    test("returns notFound for an unknown season", async () => {
      expect(await getLadderSeasonPageResult(99)).toEqual({
        status: "notFound",
        revalidate: 3600,
      });
    });

    test("returns unavailable with a short revalidate when the ranking fails", async () => {
      mockedRanking.mockRejectedValue(new Error("down"));

      expect(await getLadderSeasonPageResult(1)).toEqual({
        status: "unavailable",
        revalidate: 60,
      });
    });

    test("renders a season which is only in the seasons endpoint", async () => {
      mockedSeasons.mockResolvedValue([{ ...seasons[0], id: 3 }, ...seasons]);

      const result = await getLadderSeasonPageResult(3);

      expect(result.status).toBe("ok");
      expect(result.status === "ok" && result.data.standings).toEqual([]);
      expect(
        result.status === "ok" && result.data.seasons.find((season) => season.seasonId === 3),
      ).toMatchObject({ info: { name: "Blood and Steel", status: "Draft" } });
    });

    test("renders the season without the info with a short revalidate when the seasons fail", async () => {
      mockedSeasons.mockRejectedValue(new Error("down"));

      const result = await getLadderSeasonPageResult(1);

      expect(result.status).toBe("ok");
      expect(result.status === "ok" && result.data.seasons.every((season) => !season.info)).toBe(
        true,
      );
      expect(result.revalidate).toBe(60);
    });

    test("keeps the standings with a short revalidate when the videos fail", async () => {
      mockedVideos.mockRejectedValue(new Error("down"));

      const result = await getLadderSeasonPageResult(1);

      expect(result.status).toBe("ok");
      expect(result.status === "ok" && result.data.stages).toEqual([]);
      expect(result.revalidate).toBe(60);
    });
  });

  describe("getLadderOverviewResult", () => {
    test("returns all the seasons with the current season featured", async () => {
      const result = await getLadderOverviewResult();

      expect(result.data?.seasons.map((season) => season.seasonId)).toEqual([2, 1]);
      expect(result.data?.featured).toMatchObject({ seasonId: 2, info: { status: "Draft" } });
      expect(result.data?.featuredStandings.length).toBeGreaterThan(0);
      expect(result.data?.featuredStandings.length).toBeLessThanOrEqual(5);
      expect(result.revalidate).toBe(3600);
      // The names of the top players of the featured season are looked up
      expect(mockedNames).toHaveBeenCalledWith(
        expect.arrayContaining(result.data?.featuredStandings.map((row) => row.relicId) ?? []),
      );
    });

    test("features the current season, not the newest one", async () => {
      mockedSeasons.mockResolvedValue([
        { ...seasons[0], status: "Finished" },
        { ...seasons[1], status: "Active" },
      ]);

      const result = await getLadderOverviewResult();

      expect(result.data?.featured.seasonId).toBe(1);
    });

    test("returns no data with a short revalidate when the ranking fails", async () => {
      mockedRanking.mockRejectedValue(new Error("down"));

      expect(await getLadderOverviewResult()).toEqual({ data: null, revalidate: 60 });
    });

    test("keeps the data with a short revalidate when the videos fail", async () => {
      mockedVideos.mockRejectedValue(new Error("down"));

      const result = await getLadderOverviewResult();

      expect(result.data).not.toBeNull();
      expect(result.revalidate).toBe(60);
    });
  });

  describe("getLadderHubResult", () => {
    test("returns the current season and the recent seasons", async () => {
      const result = await getLadderHubResult();

      expect(result.summary?.featured).toMatchObject({
        seasonId: 2,
        info: { name: "Blood and Steel" },
      });
      expect(result.summary?.recent.map((season) => season.seasonId)).toEqual([1]);
      expect(result.revalidate).toBe(3600);
    });

    test("returns no summary when the ranking fails", async () => {
      mockedRanking.mockRejectedValue(new Error("down"));

      expect(await getLadderHubResult()).toEqual({ summary: null, revalidate: 60 });
    });
  });
});
