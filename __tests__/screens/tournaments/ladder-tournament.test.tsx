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
} from "../../../src/apis/ladder-tournament-api";

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
    const html = render({ data, isLatestRoute: true });

    expect(count(html, /data-testid="ladder-standing-/g)).toBe(4);

    const championRow = getElement(html, "ladder-standing-1");
    expect(championRow).toContain('data-champion="true"');
    expect(championRow).toContain("lem22");
    expect(championRow).toContain('href="/players/1"');
    expect(championRow).toContain("tournaments.titles.ladderwinner");
    expect(championRow).toContain("86%");

    // Unknown name falls back to "Player #<id>"
    const secondChampion = getElement(html, "ladder-standing-2");
    expect(secondChampion).toContain('league.playerFallback {"id":2}');
    expect(secondChampion).toContain("tournaments.titles.metaplayswinner");

    const otherRow = getElement(html, "ladder-standing-3");
    expect(otherRow).not.toContain("data-champion");
    // Both champions share the first rank, the next player is 3rd
    expect(otherRow).toMatch(/<p[^>]*>3<\/p>/);
  });

  test("renders the summary tiles and the champions strip", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data, isLatestRoute: true });

    expect(html).toContain('league.season {"season":1}');
    expect(getElement(html, "ladder-tile-players", "div")).toBeDefined();
    expect(html).toContain("13–2");
    expect(html).toContain('data-testid="ladder-champions"');
  });

  test("hides the season picker when there is only one season", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data, isLatestRoute: true });

    expect(html).not.toContain('data-testid="ladder-season-picker"');
    expect(count(html, /data-testid="ladder-season-row-/g)).toBe(1);
  });

  test("shows the select with prev / next buttons and all the seasons with 12 seasons", () => {
    const manySeasons = Array.from({ length: 12 }, (_, index) =>
      champion(100 + index, { seasonid: index + 1 }),
    );
    const data = buildLadderSeasonPageData(5, manySeasons, [], {});
    const html = render({ data, isLatestRoute: false });

    expect(html).toContain('data-testid="ladder-season-picker"');
    expect(html).toContain('aria-label="league.seasonPicker"');
    expect(html).toContain('value="league.season {"season":5}"');
    // Both directions are available in the middle of the list
    expect(getElement(html, "ladder-season-previous", "button")).not.toContain("disabled");
    expect(getElement(html, "ladder-season-next", "button")).not.toContain("disabled");

    // All the seasons are listed, newest first, the current one is highlighted
    const rows = [...html.matchAll(/data-testid="ladder-season-row-(\d+)"/g)].map((m) => m[1]);
    expect(rows).toEqual(["12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"]);
    expect(getElement(html, "ladder-season-row-5")).toContain('aria-current="page"');
    expect(html).toContain('href="/tournaments/ladder-tournament/season/12"');
  });

  test("disables the buttons at the ends of the season list", () => {
    const seasons = [item(1, { seasonid: 1 }), item(2, { seasonid: 2 })];

    const oldest = render({
      data: buildLadderSeasonPageData(1, seasons, [], {}),
      isLatestRoute: false,
    });
    expect(getElement(oldest, "ladder-season-previous", "button")).toContain("disabled");
    expect(getElement(oldest, "ladder-season-next", "button")).not.toContain("disabled");

    const newest = render({
      data: buildLadderSeasonPageData(2, seasons, [], {}),
      isLatestRoute: true,
    });
    expect(getElement(newest, "ladder-season-previous", "button")).not.toContain("disabled");
    expect(getElement(newest, "ladder-season-next", "button")).toContain("disabled");
  });

  test("groups the casts by stage in the stage order", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    const html = render({ data, isLatestRoute: true });

    expect(count(html, /data-testid="ladder-cast-stage"/g)).toBe(3);
    const final = html.indexOf(">FINAL<");
    const semi = html.indexOf(">SEMI-FINALS<");
    const other = html.indexOf(">league.casts.otherStage<");
    expect(final).toBeGreaterThan(-1);
    expect(final).toBeLessThan(semi);
    expect(semi).toBeLessThan(other);
  });

  test("hides the casts without videos and shows the standings notice without ranking", () => {
    // Casts only season - the casts were published before the standings
    const data = buildLadderSeasonPageData(2, ranking, [video({ seasonId: 2 })], names);
    const html = render({ data, isLatestRoute: false });

    expect(html).toContain('data-testid="ladder-standings-not-available"');
    expect(html).toContain('data-testid="ladder-casts"');

    const withoutCasts = render({
      data: buildLadderSeasonPageData(1, ranking, [], names),
      isLatestRoute: true,
    });
    expect(withoutCasts).not.toContain('data-testid="ladder-casts"');
  });

  test("shows the season in the breadcrumb only on the season pages", () => {
    const data = buildLadderSeasonPageData(1, ranking, videos, names);
    // The breadcrumbs are everything between their test id and the page title
    const getBreadcrumbs = (html: string) =>
      html.slice(html.indexOf('data-testid="ladder-breadcrumbs"'), html.indexOf("<h1"));

    const seasonPage = getBreadcrumbs(render({ data, isLatestRoute: false }));
    expect(seasonPage).toContain('href="/tournaments"');
    expect(seasonPage).toContain('href="/tournaments/ladder-tournament"');
    expect(seasonPage).toContain('league.season {"season":1}');

    const latestPage = getBreadcrumbs(render({ data, isLatestRoute: true }));
    expect(latestPage).toContain('href="/tournaments"');
    expect(latestPage).not.toContain('href="/tournaments/ladder-tournament"');
    expect(latestPage).not.toContain("league.season");
  });

  test("renders the intro video card in the header, also when the data is unavailable", () => {
    for (const data of [buildLadderSeasonPageData(1, ranking, videos, names), null]) {
      const card = getElement(
        render({ data, isLatestRoute: true }),
        "tournament-intro-video",
        "a",
      );
      expect(card).toContain('href="https://www.youtube.com/watch?v=tD6naKtPCWU"');
      expect(card).toContain('target="_blank"');
      expect(card).toContain('aria-label="league.introVideo"');
      expect(card).toContain("i.ytimg.com/vi_webp/tD6naKtPCWU/hqdefault.webp");
    }
  });

  test("renders the unavailable state with the official site link", () => {
    const html = render({ data: null, isLatestRoute: true });

    expect(html).toContain('data-testid="ladder-tournament-unavailable"');
    expect(html).toContain("league.unavailable");
    expect(html).toContain('href="https://laddertournament.com.br"');
    expect(html).not.toContain('data-testid="ladder-standings-table"');
  });
});
