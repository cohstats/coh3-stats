/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import LadderTournamentScreen from "../../../screens/tournaments/ladder-tournament";
import { buildLadderSeasonPageData } from "../../../src/tournaments/ladder-tournament";
import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
  LadderTournamentSeason,
} from "../../../src/apis/ladder-tournament-api";
import seasonsResponse from "../../test-assets/ladder-tournament-seasons-response.json";

// Returns the key with the interpolation values, so we can assert on them
jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en", push: jest.fn() }),
}));

jest.mock("../../../src/firebase/analytics", () => ({
  AnalyticsLadderTournamentSeasonView: jest.fn(),
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
  playerRelicId: "1,2",
  ...overrides,
});

const ranking = [champion(1), champion(2, { metaplayswinner: "Yes" }), item(3), item(4)];
const videos = [
  video({ stage: "SEMI-FINALS", title: "Semi" }),
  video({ stage: "FINAL", title: "Final" }),
  video({ stage: "", title: "No stage" }),
];
const names = { 1: { alias: "lem22", country: "br" } };

const render = (props: React.ComponentProps<typeof LadderTournamentScreen>) =>
  renderToStaticMarkup(
    <MantineProvider>
      <LadderTournamentScreen {...props} />
    </MantineProvider>,
  )
    // Text is HTML escaped in the markup
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");

// Returns the markup of the element with the given test id (up to the next closing tag of its type)
const getElement = (html: string, testId: string, tag = "tr") => {
  const start = html.lastIndexOf(`<${tag}`, html.indexOf(`data-testid="${testId}"`));
  const end = html.indexOf(`</${tag}>`, start) + `</${tag}>`.length;
  return html.slice(start, end);
};

const count = (html: string, pattern: RegExp) => (html.match(pattern) || []).length;

describe("LadderTournamentScreen", () => {
  test("renders the standings rows with the champion highlight and titles", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data });

    expect(count(html, /data-testid="ladder-standing-/g)).toBe(4);

    const championRow = getElement(html, "ladder-standing-1");
    expect(championRow).toContain('data-champion="true"');
    expect(championRow).toContain("lem22");
    expect(championRow).toContain('href="/players/1"');
    expect(championRow).toContain("tournaments.titles.ladderwinner");
    expect(championRow).toContain("86%");
    // Casts open the player card tournaments tab in a new tab
    // Casts are the last column, so the last link of the row
    const castsLink = championRow.slice(championRow.lastIndexOf("<a"));
    expect(castsLink).toContain('href="/players/1?view=tournaments"');
    expect(castsLink).toContain('target="_blank"');
    expect(castsLink).toContain("<span>3</span>");

    // Unknown name falls back to "Player #<id>"
    const secondChampion = getElement(html, "ladder-standing-2");
    expect(secondChampion).toContain('league.playerFallback {"id":2}');
    expect(secondChampion).toContain("tournaments.titles.metaplayswinner");

    const otherRow = getElement(html, "ladder-standing-3");
    expect(otherRow).not.toContain("data-champion");
    expect(otherRow).not.toContain("view=tournaments");
  });

  test("renders the season stats bar with the champions", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data });

    expect(html).toContain('league.season {"season":1}');
    const stats = html.slice(html.indexOf('data-testid="ladder-season-stats"'));
    expect(stats).toMatch(/data-testid="ladder-stat-players"[\s\S]*?>4<\/span>/);
    expect(stats).toMatch(/data-testid="ladder-stat-casts"[\s\S]*?>3<\/span>/);
    expect(stats).toMatch(/data-testid="ladder-stat-record"[\s\S]*?>13–2<\/span>/);
    expect(stats).toMatch(/data-testid="ladder-stat-top-score"[\s\S]*?>13<\/span>/);
    expect(stats).toContain('data-testid="ladder-champions"');
  });

  test("shows the top 10 standings with a button to show all the players", () => {
    const manyPlayers = Array.from({ length: 12 }, (_, index) =>
      item(index + 1, { score: 20 - index }),
    );
    const html = render({
      data: buildLadderSeasonPageData(1, manyPlayers, [], {}),
    });

    // All the rows are in the HTML, the ones after the top 10 are hidden
    expect(count(html, /data-testid="ladder-standing-/g)).toBe(12);
    expect(getElement(html, "ladder-standing-10")).not.toContain("collapsedRow");
    expect(getElement(html, "ladder-standing-11")).toContain("collapsedRow");
    expect(getElement(html, "ladder-standing-12")).toContain("collapsedRow");
    expect(html).toContain('league.standings.showAll {"count":12}');
    expect(html).toContain('aria-expanded="false"');
  });

  test("doesn't show the button with 10 players or less", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data });

    expect(html).not.toContain('data-testid="ladder-standings-toggle"');
    expect(html).not.toContain("collapsedRow");
  });

  test("has the season as the title without a season picker or the all seasons table", () => {
    const manySeasons = Array.from({ length: 12 }, (_, index) =>
      champion(100 + index, { seasonid: index + 1 }),
    );
    const html = render({ data: buildLadderSeasonPageData(5, manySeasons, [], {}) });

    expect(getElement(html, "ladder-league-title", "h1")).toContain('league.season {"season":5}');
    expect(html).not.toContain('data-testid="ladder-season-picker"');
    // The all seasons table is on the overview only, the breadcrumb leads there
    expect(html).not.toContain('data-testid="ladder-all-seasons-table"');
    expect(getElement(html, "ladder-breadcrumb-league", "a")).toContain(
      'href="/tournaments/ladder-tournament"',
    );
  });

  test("groups the casts by stage in the stage order", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data });

    expect(count(html, /data-testid="ladder-cast-stage"/g)).toBe(3);
    const final = html.indexOf(">FINAL<");
    const semi = html.indexOf(">SEMI-FINALS<");
    const other = html.indexOf(">league.casts.otherStage<");
    expect(final).toBeGreaterThan(-1);
    expect(final).toBeLessThan(semi);
    expect(semi).toBeLessThan(other);
  });

  test("renders the upcoming season with its name, status and info, without the stats", () => {
    // Season 2 "BloodAndSteel" is Draft and only in the seasons endpoint
    const seasons = seasonsResponse as LadderTournamentSeason[];
    const html = render({ data: buildLadderSeasonPageData(2, ranking, videos, names, seasons) });

    expect(html).toContain('league.seasonWithName {"season":2,"name":"Blood and Steel"}');
    expect(html).toContain("league.status.draft");
    expect(html).not.toContain('data-testid="ladder-season-stats"');
    expect(html).toContain('data-testid="ladder-standings-not-available"');

    const info = html.slice(html.indexOf('data-testid="ladder-season-info"'));
    expect(info).toContain("2 Oct 2026 – 18 Oct 2026");
    expect(info).toContain("3 Nov 2026 – 30 Jan 2027");
    expect(info).toContain('league.info.playoffsValue {"playoffCut":8,"semifinalCut":4}');
    // All the playoff stages are Bo3, so the short format
    expect(info).toContain('league.info.formatShortValue {"ladder":1,"playoffs":3}');
    expect(info).toContain('league.info.challenge {"positions":3,"hours":48,"days":5}');
    // The name is the page title, with the status below the links
    const title = getElement(html, "ladder-league-title", "h1");
    expect(title).toContain('league.seasonWithName {"season":2,"name":"Blood and Steel"}');
    expect(html.indexOf("league.communityLadder")).toBeLessThan(
      html.indexOf('data-testid="ladder-season-status"'),
    );
  });

  test.each(["Paused", "constructor", "__proto__"])(
    "renders the unknown status %s as it is in gray",
    (status) => {
      const seasons = (seasonsResponse as LadderTournamentSeason[]).map((season) => ({
        ...season,
        status,
      }));
      const html = render({
        data: buildLadderSeasonPageData(1, ranking, videos, names, seasons),
      });
      const badge = getElement(html, "ladder-season-status", "div");

      expect(badge).toContain(`>${status}<`);
      expect(badge).toContain("gray");
      expect(badge).not.toContain("league.status.");
    },
  );

  test("renders a finished season with the stats and the info", () => {
    // Bo5 final, so the full format
    const seasons = (seasonsResponse as LadderTournamentSeason[]).map((season) => ({
      ...season,
      finalBestOf: 5,
    }));
    const html = render({ data: buildLadderSeasonPageData(1, ranking, videos, names, seasons) });

    expect(html).toContain(
      'league.info.formatValue {"ladder":3,"funnel":3,"semifinal":3,"final":5}',
    );

    expect(html).toContain('league.season {"season":1}');
    expect(html).toContain("league.status.finished");
    expect(html).toContain('data-testid="ladder-season-stats"');
    expect(html).toContain('data-testid="ladder-season-info"');
  });

  test("hides the casts without videos and shows the standings notice without ranking", () => {
    // Casts only season - the casts were published before the standings
    const data = buildLadderSeasonPageData(2, ranking, [video({ seasonId: 2 })], names);
    const html = render({ data });

    expect(html).toContain('data-testid="ladder-standings-not-available"');
    expect(html).toContain('data-testid="ladder-casts"');

    const withoutCasts = render({
      data: buildLadderSeasonPageData(1, ranking, [], names),
    });
    expect(withoutCasts).not.toContain('data-testid="ladder-casts"');
  });

  test("shows the season in the breadcrumb with the link to the overview", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data });
    // The breadcrumbs are everything between their test id and the page title
    const breadcrumbs = html.slice(
      html.indexOf('data-testid="ladder-breadcrumbs"'),
      html.indexOf("<h1"),
    );

    expect(breadcrumbs).toContain('href="/tournaments"');
    expect(breadcrumbs).toContain('href="/tournaments/ladder-tournament"');
    expect(breadcrumbs).toContain('league.season {"season":1}');
  });

  test("renders the intro video card in the header, also when the data is unavailable", () => {
    for (const data of [buildLadderSeasonPageData(1, ranking, videos, names), null]) {
      const card = getElement(render({ data }), "tournament-intro-video", "a");
      expect(card).toContain('href="https://www.youtube.com/watch?v=tD6naKtPCWU"');
      expect(card).toContain('target="_blank"');
      expect(card).toContain('aria-label="league.introVideo"');
      expect(card).toContain("i.ytimg.com/vi_webp/tD6naKtPCWU/hqdefault.webp");
    }
  });

  test("renders the unavailable state with the official site link", () => {
    const html = render({ data: null });

    expect(html).toContain('data-testid="ladder-tournament-unavailable"');
    expect(html).toContain("league.unavailable");
    expect(html).toContain('href="https://laddertournament.com.br"');
    expect(html).not.toContain('data-testid="ladder-standings-table"');
  });
});
