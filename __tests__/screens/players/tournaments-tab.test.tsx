/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import TournamentsTab from "../../../screens/players/tabs/tournaments-tab/tournaments-tab";
import rankingResponse from "../../test-assets/ladder-tournament-ranking-response.json";
import casterVideosResponse from "../../test-assets/ladder-tournament-caster-videos-response.json";
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
  useRouter: () => ({ locale: "en" }),
}));

const ranking = rankingResponse.items as LadderTournamentRankingItem[];
const videos = casterVideosResponse as LadderTournamentCasterVideo[];

const noTitles = {
  ladderwinner: "No",
  ironcladwinner: "No",
  metaplayswinner: "No",
  championsOfheroeswinner: "No",
  thelegend: "No",
} as const;

// Server side render, same as the page (the tab data are loaded with SSR)
const renderTab = (props: React.ComponentProps<typeof TournamentsTab>) =>
  renderToStaticMarkup(
    <MantineProvider>
      <TournamentsTab {...props} />
    </MantineProvider>,
  )
    // Text is HTML escaped in the markup
    .replace(/&quot;/g, '"');

// Returns the markup of the table row with the given test id and the markup after it
const getRow = (html: string, testId: string) => {
  const start = html.lastIndexOf("<tr", html.indexOf(`data-testid="${testId}"`));
  const end = html.indexOf("</tr>", start) + "</tr>".length;
  return { row: html.slice(start, end), after: html.slice(end) };
};

const count = (html: string, pattern: RegExp) => (html.match(pattern) || []).length;

describe("TournamentsTab", () => {
  test("renders a champion season with the casts row under it", () => {
    const html = renderTab({
      tournamentData: { videos, ladderRanking: [ranking[0]] },
      playerName: "lem22",
    });

    const { row, after } = getRow(html, "tournament-season-1");
    expect(row).toContain("tournaments.titles.ladderwinner");
    expect(row).toContain('tournaments.casts {"count":3}');
    // The casts row is right after the season row
    const castsRow = after.slice(0, after.indexOf("</tr>"));
    expect(count(castsRow, /data-testid="tournament-video-/g)).toBe(3);
    // Caster and the publish date formatted in the active locale
    expect(castsRow).toContain("HelpingHans · Sep 7, 2026");
    expect(html).toContain('tournaments.summary.titles {"count":1}');
  });

  test("renders a season without casts and titles with dashes and no casts row", () => {
    const html = renderTab({
      tournamentData: { videos: [], ladderRanking: [{ ...ranking[0], ...noTitles }] },
      playerName: "Player",
    });

    const { row, after } = getRow(html, "tournament-season-1");
    // Result and casts columns
    expect(count(row, /—/g)).toBe(2);
    expect(after).not.toContain("<tr");
    expect(count(html, /data-testid="tournament-video-/g)).toBe(0);
    expect(html).not.toContain("tournaments.summary.titles");
  });

  test("renders several seasons from the newest", () => {
    const html = renderTab({
      tournamentData: { videos: [], ladderRanking: ranking },
      playerName: "Player",
    });

    const seasonIds = [...html.matchAll(/data-testid="tournament-season-(\d+)"/g)].map(
      (match) => match[1],
    );
    expect(seasonIds).toEqual(["2", "1"]);
    expect(html).toContain('tournaments.summary.seasons {"count":2}');
  });

  test("renders the empty state for a player without tournaments", () => {
    const html = renderTab({
      tournamentData: { videos: [], ladderRanking: [] },
      playerName: "Thomas",
    });

    expect(html).toContain('tournaments.noData {"name":"Thomas"}');
    expect(html).not.toContain('data-testid="tournaments-summary"');
  });

  test("renders the unavailable state when the data failed to load", () => {
    const html = renderTab({
      tournamentData: { videos: null, ladderRanking: null },
      playerName: "Thomas",
    });

    expect(html).toContain("tournaments.unavailable");
  });
});
