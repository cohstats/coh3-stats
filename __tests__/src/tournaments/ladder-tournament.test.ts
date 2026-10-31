import {
  buildHubLadderSummary,
  buildLadderOverviewData,
  buildLadderSeasonPageData,
  buildLadderSeasonSummaries,
  buildLadderStandings,
  formatLadderSeasonName,
  getLadderChampionIds,
  getLadderSeasonIds,
  getLadderTopPlayerIds,
  groupCastsByStage,
  isLadderSeasonCurrent,
  pickLadderFeaturedSeasonId,
} from "../../../src/tournaments/ladder-tournament";
import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
  LadderTournamentSeason,
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

const season = (
  id: number,
  overrides: Partial<LadderTournamentSeason> = {},
): LadderTournamentSeason => ({
  id,
  name: `Season#${id}`,
  status: "Finished",
  registrationStart: "2026-08-22T01:54:00",
  registrationEnd: "2026-09-03T01:54:00",
  ladderStart: "2026-09-08T13:51:00",
  ladderEnd: "2026-10-03T16:18:00",
  maxChallengePositions: 3,
  challengeResponseHours: 48,
  matchDeadlineDays: 5,
  inactivityDays: 20,
  rematchDays: 14,
  rematchOtherMatches: 2,
  playoffCut: 8,
  semifinalCut: 4,
  ladderBestOf: 3,
  funnelBestOf: 3,
  semifinalBestOf: 3,
  finalBestOf: 3,
  ...overrides,
});

describe("formatLadderSeasonName", () => {
  test("splits the camel case and keeps the small words lowercase", () => {
    expect(formatLadderSeasonName("BloodAndSteel")).toBe("Blood and Steel");
    expect(formatLadderSeasonName("Band_Of_Brothers")).toBe("Band of Brothers");
    expect(formatLadderSeasonName("Winter Of The Wolf")).toBe("Winter of the Wolf");
  });

  test("keeps the names which are already readable", () => {
    expect(formatLadderSeasonName("The Long Road")).toBe("The Long Road");
    expect(formatLadderSeasonName("HOLD THE LINE")).toBe("HOLD THE LINE");
  });

  test("returns null for the generic and the empty names", () => {
    expect(formatLadderSeasonName("Season#1")).toBeNull();
    expect(formatLadderSeasonName("Season 12")).toBeNull();
    expect(formatLadderSeasonName("  ")).toBeNull();
  });
});

describe("pickLadderFeaturedSeasonId", () => {
  test("picks the oldest season which is not finished", () => {
    const seasons = [season(1), season(2, { status: "Active" }), season(3, { status: "Draft" })];

    expect(pickLadderFeaturedSeasonId([3, 2, 1], seasons)).toBe(2);
    expect(pickLadderFeaturedSeasonId([3, 2, 1], seasons.slice(0, 1).concat(seasons[2]))).toBe(3);
  });

  test("picks the latest season when all are finished or unknown", () => {
    expect(pickLadderFeaturedSeasonId([2, 1], [season(1), season(2)])).toBe(2);
    expect(pickLadderFeaturedSeasonId([2, 1], [])).toBe(2);
    expect(pickLadderFeaturedSeasonId([], [])).toBeUndefined();
  });
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

  test("adds the seasons without standings and casts from the seasons endpoint", () => {
    const ranking = [item(1, { seasonid: 1 })];

    expect(getLadderSeasonIds(ranking, [], [season(2, { status: "Draft" }), season(1)])).toEqual([
      2, 1,
    ]);
  });

  test("returns an empty array without data", () => {
    expect(getLadderSeasonIds([], [])).toEqual([]);
  });
});

describe("buildLadderStandings", () => {
  test("sorts by score only, the same score keeps the API order", () => {
    const rows = buildLadderStandings(
      [
        item(1, { score: 5, rating: 0.5 }),
        item(2, { score: 9, rating: 0.4 }),
        // Better win rate, but the same score - no tie-break
        item(3, { score: 5, rating: 0.7, wins: 8 }),
        item(4, { score: 2 }),
      ],
      [],
      {},
    );

    expect(rows.map((row) => row.relicId)).toEqual([2, 1, 3, 4]);
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
      info: null,
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

  test("builds the hub summary from the latest season without the season info", () => {
    const summary = buildHubLadderSummary(ranking, videos, names);

    expect(summary?.featured.seasonId).toBe(3);
    expect(summary?.recent.map((recent) => recent.seasonId)).toEqual([2, 1]);
    expect(buildHubLadderSummary([], [], {})).toBeNull();
  });

  test("features the upcoming season on the hub and keeps the finished ones as recent", () => {
    const seasons = [
      season(1),
      season(2),
      season(3),
      season(4, { name: "BloodAndSteel", status: "Draft" }),
    ];

    const summary = buildHubLadderSummary(ranking, videos, names, seasons);

    expect(summary?.featured).toMatchObject({
      seasonId: 4,
      players: 0,
      info: { name: "Blood and Steel", status: "Draft" },
    });
    expect(isLadderSeasonCurrent(summary!.featured)).toBe(true);
    // Only the 2 newest past seasons
    expect(summary?.recent.map((recent) => recent.seasonId)).toEqual([3, 2]);
  });

  test("builds the overview data with the top of the latest season", () => {
    const latestRanking = [
      ...ranking,
      ...Array.from({ length: 7 }, (_, index) =>
        item(100 + index, { seasonid: 3, score: index % 2 === 0 ? 10 : 20 }),
      ),
    ];

    const data = buildLadderOverviewData(latestRanking, videos, names);

    expect(data?.seasons.map((season) => season.seasonId)).toEqual([3, 2, 1]);
    // Top 5 by score, the same score keeps the API order
    const top = [101, 103, 105, 100, 102];
    expect(data?.featured.seasonId).toBe(3);
    expect(data?.featuredStandings.map((row) => row.relicId)).toEqual(top);
    // The names are looked up for the same players
    expect(getLadderTopPlayerIds(latestRanking, 3)).toEqual(top);
    expect(data?.latestCasts).toHaveLength(3);
    expect(buildLadderOverviewData([], [], {})).toBeNull();
  });

  test("builds the overview with the 4 newest casts of all the seasons", () => {
    const manyVideos = [1, 5, 3, 2, 4].map((day) =>
      video({ title: `${day}`, publishedAt: `2026-09-0${day}T00:00:00`, seasonId: day % 2 }),
    );

    const data = buildLadderOverviewData(ranking, manyVideos, names);

    expect(data?.latestCasts.map((cast) => cast.title)).toEqual(["5", "4", "3", "2"]);
  });

  test("builds the overview without standings for a casts only latest season", () => {
    const data = buildLadderOverviewData(ranking, videos, names);

    expect(data?.featured.seasonId).toBe(3);
    expect(data?.featuredStandings).toEqual([]);
    expect(getLadderTopPlayerIds(ranking, 3)).toEqual([]);
  });

  test("builds the overview of the current season with the season info", () => {
    const seasons = [season(1), season(2, { status: "Active", ladderBestOf: 1, playoffCut: 6 })];

    const data = buildLadderOverviewData(ranking, videos, names, seasons);

    // Season 3 is only in the casts, season 2 is the current one
    expect(data?.seasons.map((summary) => summary.seasonId)).toEqual([3, 2, 1]);
    expect(data?.featured).toMatchObject({
      seasonId: 2,
      info: {
        name: null,
        status: "Active",
        ladderStart: "2026-09-08T13:51:00",
        playoffCut: 6,
        bestOf: { ladder: 1, funnel: 3, semifinal: 3, final: 3 },
        challenge: { maxPositions: 3, responseHours: 48, matchDeadlineDays: 5 },
      },
    });
    expect(data?.featuredStandings.map((row) => row.relicId)).toEqual([4]);
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
