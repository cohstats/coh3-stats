import {
  buildHubLadderSummary,
  buildLadderSeasonPageData,
  buildLadderSeasonSummaries,
  buildLadderStandings,
  getLadderChampionIds,
  getLadderSeasonIds,
  groupCastsByStage,
} from "../../../src/tournaments/ladder-tournament";
import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
} from "../../../src/apis/ladder-tournament-api";

const item = (
  relicid: number,
  overrides: Partial<LadderTournamentRankingItem> = {},
): LadderTournamentRankingItem => ({
  seasonid: 1,
  relicid,
  matches: 10,
  wins: 5,
  losses: 5,
  score: 5,
  rating: 0.5,
  ladderwinner: "No",
  ironcladwinner: "No",
  metaplayswinner: "No",
  championsOfheroeswinner: "No",
  thelegend: "No",
  ...overrides,
});

const champion = (relicid: number, overrides: Partial<LadderTournamentRankingItem> = {}) =>
  item(relicid, {
    matches: 15,
    wins: 13,
    losses: 2,
    score: 13,
    rating: 0.86,
    ladderwinner: "Yes",
    ...overrides,
  });

const video = (
  overrides: Partial<LadderTournamentCasterVideo> = {},
): LadderTournamentCasterVideo => ({
  title: "Cast",
  castedBy: "HelpingHans",
  publishedAt: "2026-09-01T00:00:00",
  stage: "FINAL",
  videoUrlYoutube: "https://www.youtube.com/watch?v=abc",
  videoUrlTwitch: "",
  seasonId: 1,
  playerRelicId: "",
  ...overrides,
});

describe("getLadderSeasonIds", () => {
  test("returns distinct seasons from the ranking and the casts, newest first", () => {
    const ranking = [
      item(1, { seasonid: 1 }),
      item(2, { seasonid: 2 }),
      item(3, { seasonid: 2 }),
    ];
    // Season 3 has casts only - the casts were published before the standings
    const videos = [video({ seasonId: 3 }), video({ seasonId: 1 })];

    expect(getLadderSeasonIds(ranking, videos)).toEqual([3, 2, 1]);
  });

  test("returns an empty array without data", () => {
    expect(getLadderSeasonIds([], [])).toEqual([]);
  });
});

describe("buildLadderStandings", () => {
  test("sorts by score, then win rate, wins and matches", () => {
    const rows = buildLadderStandings(
      [
        item(1, { score: 5, rating: 0.5 }),
        item(2, { score: 9, rating: 0.4 }),
        item(3, { score: 5, rating: 0.7 }),
        item(4, { score: 5, rating: 0.5, wins: 7 }),
        item(5, { score: 5, rating: 0.5, wins: 7, matches: 12 }),
      ],
      [],
      {},
    );

    expect(rows.map((row) => row.relicId)).toEqual([2, 3, 5, 4, 1]);
  });

  test("uses competition ranking - three 13-2 players share rank 1, the next one is 4", () => {
    const rows = buildLadderStandings(
      [item(10, { score: 4 }), champion(1), champion(2), champion(3), item(11, { score: 2 })],
      [],
      {},
    );

    expect(rows.map((row) => row.rank)).toEqual([1, 1, 1, 4, 5]);
  });

  test("keeps the API values, marks the champions and maps the titles", () => {
    // wins + losses doesn't have to equal matches in the API data
    const [row] = buildLadderStandings(
      [champion(1, { matches: 15, wins: 10, losses: 4, rating: 0.71, thelegend: "Yes" })],
      [],
      {},
    );

    expect(row).toMatchObject({
      matches: 15,
      wins: 10,
      losses: 4,
      winRate: 0.71,
      score: 13,
      isChampion: true,
      titles: ["ladderwinner", "thelegend"],
    });
  });

  test("counts the casts which include the player", () => {
    const rows = buildLadderStandings(
      [item(1), item(2), item(3)],
      [
        video({ playerRelicId: "1, 2,999" }),
        video({ playerRelicId: "1" }),
        // Duplicate ids in a single cast count once
        video({ playerRelicId: "1,1" }),
      ],
      {},
    );

    const castsById = Object.fromEntries(rows.map((row) => [row.relicId, row.castsCount]));
    expect(castsById).toEqual({ 1: 3, 2: 1, 3: 0 });
  });

  test("fills the names and falls back to null when the name is unknown", () => {
    const rows = buildLadderStandings([item(1, { score: 9 }), item(2)], [], {
      1: { alias: "lem22", country: "br" },
    });

    expect(rows[0]).toMatchObject({ alias: "lem22", country: "br" });
    expect(rows[1]).toMatchObject({ alias: null, country: null });
  });
});

describe("groupCastsByStage", () => {
  test("orders the known stages, then the others alphabetically and the empty stage last", () => {
    const groups = groupCastsByStage([
      video({ stage: "" }),
      video({ stage: "QUARTER-FINALS" }),
      video({ stage: "Group B" }),
      video({ stage: "SEMI-FINALS" }),
      video({ stage: "GROUP A" }),
      video({ stage: "THIRD PLACE" }),
      video({ stage: "FINALS" }),
    ]);

    expect(groups.map((group) => group.stage)).toEqual([
      "FINALS",
      "THIRD PLACE",
      "SEMI-FINALS",
      "QUARTER-FINALS",
      "GROUP A",
      "Group B",
      "",
    ]);
  });

  test("groups the stages case insensitively and sorts the casts from the newest", () => {
    const groups = groupCastsByStage([
      video({ stage: "FINAL", title: "old", publishedAt: "2026-08-01T00:00:00" }),
      video({ stage: " final ", title: "new", publishedAt: "2026-09-01T00:00:00" }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].stage).toBe("FINAL");
    expect(groups[0].videos.map((v) => v.title)).toEqual(["new", "old"]);
  });
});

describe("season summaries", () => {
  const ranking = [
    champion(1),
    champion(2),
    item(3, { score: 15 }),
    item(4, { seasonid: 2, score: 3 }),
  ];
  const videos = [
    video({ seasonId: 1 }),
    video({ seasonId: 1 }),
    video({ seasonId: 3, stage: "SEMI-FINALS" }),
  ];
  const names = { 1: { alias: "lem22", country: "br" } };

  test("builds the summaries of all seasons, newest first", () => {
    const summaries = buildLadderSeasonSummaries(ranking, videos, names);

    expect(summaries.map((summary) => summary.seasonId)).toEqual([3, 2, 1]);
    expect(summaries[2]).toEqual({
      seasonId: 1,
      players: 3,
      casts: 2,
      champions: [
        { relicId: 1, alias: "lem22", country: "br" },
        { relicId: 2, alias: null, country: null },
      ],
      championsRecord: { wins: 13, losses: 2 },
      topScore: 15,
    });
    // Season without a winner yet
    expect(summaries[1]).toMatchObject({ players: 1, champions: [], championsRecord: null });
    // Casts only season
    expect(summaries[0]).toMatchObject({ players: 0, casts: 1, topScore: null });
  });

  test("builds the season page data", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);

    expect(data.seasonId).toBe(1);
    expect(data.seasons).toHaveLength(3);
    expect(data.standings.map((row) => row.relicId)).toEqual([3, 1, 2]);
    expect(data.stages).toHaveLength(1);
    expect(data.stages[0].videos).toHaveLength(2);
  });

  test("builds the hub summary from the latest season", () => {
    expect(buildHubLadderSummary(ranking, videos, names)).toMatchObject({
      latest: { seasonId: 3 },
      seasonsCount: 3,
    });
    expect(buildHubLadderSummary([], [], {})).toBeNull();
  });

  test("returns the champion ids, optionally for given seasons", () => {
    const withSeason2Champion = [
      ...ranking,
      champion(1, { seasonid: 2 }),
      champion(5, { seasonid: 2 }),
    ];

    expect(getLadderChampionIds(withSeason2Champion)).toEqual([1, 2, 5]);
    expect(getLadderChampionIds(withSeason2Champion, [2])).toEqual([1, 5]);
  });
});
