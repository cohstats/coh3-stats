/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import TournamentsScreen from "../../../screens/tournaments";
import {
  IRONCLAD_TOURNAMENT,
  METAPLAYS_TOURNAMENT,
} from "../../../src/tournaments/tournaments-registry";
import type { LadderHubSummary } from "../../../src/tournaments/ladder-tournament";

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

jest.mock("../../../src/firebase/analytics", () => ({
  AnalyticsTournamentsPageView: jest.fn(),
  AnalyticsTournamentExternalClick: jest.fn(),
}));

const summary: LadderHubSummary = {
  latest: {
    seasonId: 1,
    players: 31,
    casts: 12,
    champions: [
      { relicId: 1, alias: "lem22", country: "br" },
      { relicId: 2, alias: null, country: null },
    ],
    championsRecord: { wins: 13, losses: 2 },
    topScore: 13,
  },
  seasonsCount: 1,
};

const render = (props: React.ComponentProps<typeof TournamentsScreen>) =>
  renderToStaticMarkup(
    <MantineProvider>
      <TournamentsScreen {...props} />
    </MantineProvider>,
  ).replace(/&quot;/g, '"');

// Returns the opening tag of the element with the given test id
const getOpeningTag = (html: string, testId: string) => {
  const index = html.indexOf(`data-testid="${testId}"`);
  return html.slice(html.lastIndexOf("<", index), html.indexOf(">", index) + 1);
};

describe("TournamentsScreen", () => {
  test("renders the featured Ladder Tournament card with the latest season", () => {
    const html = render({ ladderSummary: summary });

    expect(html).toContain('data-testid="tournament-card-ladderTournament"');
    expect(html).toContain('league.season {"season":1}');
    expect(html).toContain('hub.playersCount {"count":31}');
    expect(html).toContain('hub.castsCount {"count":12}');
    expect(html).toContain("13–2");
    expect(html).toContain('href="/players/1"');
    expect(html).toContain('league.playerFallback {"id":2}');
    expect(html).toContain('href="/tournaments/ladder-tournament"');
    // Single season - no seasons count
    expect(html).not.toContain("hub.seasonsCount");
    expect(html).not.toContain('data-testid="featured-unavailable"');
  });

  test("shows the seasons count with more seasons", () => {
    const html = render({ ladderSummary: { ...summary, seasonsCount: 3 } });

    expect(html).toContain('hub.seasonsCount {"count":3}');
  });

  test("renders the unavailable state, but keeps the official site link", () => {
    const html = render({ ladderSummary: null });

    expect(html).toContain('data-testid="featured-unavailable"');
    expect(html).toContain("hub.unavailable");
    expect(html).toContain('href="https://laddertournament.com.br"');
    expect(html).not.toContain('data-testid="featured-latest-season"');
  });

  test("renders the external cards linking out in a new tab", () => {
    const html = render({ ladderSummary: summary });

    for (const tournament of [IRONCLAD_TOURNAMENT, METAPLAYS_TOURNAMENT]) {
      const tag = getOpeningTag(html, `tournament-card-${tournament.id}`);
      expect(tag.startsWith("<a")).toBe(true);
      expect(tag).toContain(`href="${tournament.url}"`);
      expect(tag).toContain('target="_blank"');
      expect(tag).toContain('rel="noopener noreferrer"');
    }
  });
});
