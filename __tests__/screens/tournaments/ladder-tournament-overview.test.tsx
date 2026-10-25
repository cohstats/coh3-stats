/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import LadderTournamentOverviewScreen from "../../../screens/tournaments/ladder-tournament/overview";
import { buildLadderOverviewData } from "../../../src/tournaments/ladder-tournament";
import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
} from "../../../src/apis/ladder-tournament-api";

// Returns the key with the interpolation values, so we can assert on them
jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

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
  playerRelicId: "1",
  ...overrides,
});

// Season 1 with a champion, season 2 is the latest with 8 players
const ranking = [
  item(1, { ladderwinner: "Yes", score: 13 }),
  item(2),
  ...Array.from({ length: 8 }, (_, index) =>
    item(100 + index, { seasonid: 2, score: 20 - index }),
  ),
];
const videos = [video(), video({ seasonId: 2, playerRelicId: "100" })];

const render = (props: React.ComponentProps<typeof LadderTournamentOverviewScreen>) =>
  renderToStaticMarkup(
    <MantineProvider>
      <LadderTournamentOverviewScreen {...props} />
    </MantineProvider>,
  )
    // Text is HTML escaped in the markup
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

const count = (html: string, pattern: RegExp) => (html.match(pattern) || []).length;

describe("LadderTournamentOverviewScreen", () => {
  test("shows the latest season with its top 5 players linking to the season page", () => {
    const html = render({ data: buildLadderOverviewData(ranking, videos, {}) });

    expect(html).toContain('league.season {"season":2}');
    expect(html).toContain('data-testid="ladder-season-stats"');
    // Top 5 by score only
    const rows = [...html.matchAll(/data-testid="ladder-standing-(\d+)"/g)].map((m) => m[1]);
    expect(rows).toEqual(["100", "101", "102", "103", "104"]);

    expect(html).toContain('league.overview.openSeason {"season":2}');
    expect(html).toContain('league.standings.showAll {"count":8}');
    // Title, open button, full standings button and the all seasons row
    expect(count(html, /href="\/tournaments\/ladder-tournament\/season\/2"/g)).toBe(4);
  });

  test("doesn't link to the full standings when all the players are shown", () => {
    const html = render({ data: buildLadderOverviewData(ranking.slice(0, 2), [], {}) });

    expect(count(html, /data-testid="ladder-standing-/g)).toBe(2);
    expect(html).not.toContain('data-testid="ladder-latest-full-standings"');
  });

  test("lists all the seasons newest first without a highlighted season", () => {
    const html = render({ data: buildLadderOverviewData(ranking, videos, {}) });

    const rows = [...html.matchAll(/data-testid="ladder-season-row-(\d+)"/g)].map((m) => m[1]);
    expect(rows).toEqual(["2", "1"]);
    expect(html).not.toContain('aria-current="page"');
    expect(html).toContain('href="/tournaments/ladder-tournament/season/1"');
  });

  test("has no season in the breadcrumb and no season picker", () => {
    const html = render({ data: buildLadderOverviewData(ranking, videos, {}) });
    const breadcrumbs = html.slice(
      html.indexOf('data-testid="ladder-breadcrumbs"'),
      html.indexOf("<h1"),
    );

    expect(breadcrumbs).toContain('href="/tournaments"');
    expect(breadcrumbs).not.toContain("league.season");
    expect(html).not.toContain('data-testid="ladder-season-picker"');
  });

  test("shows the standings notice when the latest season has casts only", () => {
    const html = render({
      data: buildLadderOverviewData(ranking, [...videos, video({ seasonId: 3 })], {}),
    });

    expect(html).toContain('league.season {"season":3}');
    expect(html).toContain('data-testid="ladder-standings-not-available"');
  });

  test("renders the unavailable state with the official site link", () => {
    const html = render({ data: null });

    expect(html).toContain('data-testid="ladder-tournament-unavailable"');
    expect(html).toContain('href="https://laddertournament.com.br"');
    expect(html).not.toContain('data-testid="ladder-all-seasons-table"');
  });
});
