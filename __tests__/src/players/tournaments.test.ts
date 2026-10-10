import { buildLadderTournament, getTournamentAggregate } from "../../../src/players/tournaments";
import rankingResponse from "../../test-assets/ladder-tournament-ranking-response.json";
import casterVideosResponse from "../../test-assets/ladder-tournament-caster-videos-response.json";
import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
} from "../../../src/apis/ladder-tournament-api";

const ranking = rankingResponse.items as LadderTournamentRankingItem[];
const videos = casterVideosResponse as LadderTournamentCasterVideo[];

describe("buildLadderTournament", () => {
  test("creates one season per ranking item sorted from the newest", () => {
    const tournament = buildLadderTournament({ videos: [], ladderRanking: ranking });

    expect(tournament.seasons.map((season) => season.seasonId)).toEqual([2, 1]);
    expect(tournament.seasons[1].stats).toEqual({
      matches: ranking[0].matches,
      wins: ranking[0].wins,
      losses: ranking[0].losses,
      winRate: ranking[0].rating,
      score: ranking[0].score,
    });
    expect(tournament.unavailable).toBe(false);
  });

  test("maps the Yes flags to title keys", () => {
    const tournament = buildLadderTournament({
      videos: [],
      ladderRanking: [
        { ...ranking[0], ladderwinner: "Yes", thelegend: "Yes", ironcladwinner: "No" },
      ],
    });

    expect(tournament.seasons[0].titles).toEqual(["ladderwinner", "thelegend"]);
  });

  test("assigns the casts to their season sorted from the newest", () => {
    const olderFirst = [...videos].reverse();
    const tournament = buildLadderTournament({ videos: olderFirst, ladderRanking: ranking });

    const season1 = tournament.seasons.find((season) => season.seasonId === 1);
    const season2 = tournament.seasons.find((season) => season.seasonId === 2);
    expect(season1?.casts.map((video) => video.publishedAt)).toEqual([
      "2026-09-07T00:00:00",
      "2026-08-29T00:00:00",
      "2026-08-13T00:00:00",
    ]);
    expect(season2?.casts).toEqual([]);
  });

  test("creates a season without stats when there are casts but no ranking entry", () => {
    const tournament = buildLadderTournament({ videos, ladderRanking: [] });

    expect(tournament.seasons).toHaveLength(1);
    expect(tournament.seasons[0]).toMatchObject({ seasonId: 1, stats: null, titles: [] });
    expect(tournament.seasons[0].casts).toHaveLength(3);
  });

  test("is unavailable only when all the data failed to load", () => {
    expect(buildLadderTournament({ videos: null, ladderRanking: null }).unavailable).toBe(true);
    expect(buildLadderTournament({ videos: null, ladderRanking: [] }).unavailable).toBe(false);
  });
});

describe("getTournamentAggregate", () => {
  test("sums the seasons and calculates the overall win rate", () => {
    const tournament = buildLadderTournament({
      videos: [],
      ladderRanking: [
        {
          ...ranking[0],
          seasonid: 1,
          matches: 15,
          wins: 13,
          losses: 2,
          rating: 0.86,
          ladderwinner: "Yes",
        },
        {
          ...ranking[0],
          seasonid: 2,
          matches: 9,
          wins: 6,
          losses: 3,
          rating: 0.67,
          ladderwinner: "No",
        },
      ],
    });

    expect(getTournamentAggregate(tournament.seasons)).toEqual({
      seasons: 2,
      matches: 24,
      wins: 19,
      losses: 5,
      winRate: (0.86 * 15 + 0.67 * 9) / 24,
      titles: 1,
    });
  });

  test("equals the season win rate for a single season", () => {
    const tournament = buildLadderTournament({
      videos: [],
      ladderRanking: [{ ...ranking[0], matches: 15, wins: 13, losses: 2, rating: 0.86 }],
    });

    expect(getTournamentAggregate(tournament.seasons).winRate).toBe(0.86);
  });

  test("returns null win rate when there are no matches", () => {
    expect(getTournamentAggregate([]).winRate).toBeNull();
  });
});
