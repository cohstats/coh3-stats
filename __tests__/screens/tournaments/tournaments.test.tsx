/**
 * @jest-environment jsdom
 */

import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import TournamentsScreen from "../../../screens/tournaments";
import ExternalTournamentCard from "../../../screens/tournaments/components/external-tournament-card";
import {
  IRONCLAD_TOURNAMENT,
  METAPLAYS_TOURNAMENT,
} from "../../../src/tournaments/tournaments-registry";
import { AnalyticsTournamentExternalClick } from "../../../src/firebase/analytics";
import type {
  LadderHubSummary,
  LadderSeasonInfo,
  LadderSeasonSummary,
} from "../../../src/tournaments/ladder-tournament";

// Render the actual English copy; keep interpolated keys visible for the Ladder assertions.
jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options) return `${key} ${JSON.stringify(options)}`;
      const translations = jest.requireActual("../../../public/locales/en/tournaments.json");
      const value = key.split(".").reduce((current, part) => current?.[part], translations);
      return typeof value === "string" ? value : key;
    },
  }),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en" }),
}));

jest.mock("../../../src/firebase/analytics", () => ({
  AnalyticsTournamentsPageView: jest.fn(),
  AnalyticsTournamentExternalClick: jest.fn(),
}));

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

afterEach(() => {
  for (const { root, container } of renderedRoots) {
    act(() => root.unmount());
    container.remove();
  }
  renderedRoots.length = 0;
  jest.clearAllMocks();
});

const renderedRoots: { root: Root; container: HTMLDivElement }[] = [];

const renderDom = (element: React.ReactNode) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  renderedRoots.push({ root, container });
  act(() => root.render(element));
  return { container };
};

const getCard = (testId: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;

const findText = (element: HTMLElement, text: string) =>
  Array.from(element.querySelectorAll("*")).find((node) => node.textContent === text);

const finishedSeason: LadderSeasonSummary = {
  seasonId: 1,
  info: null,
  players: 31,
  casts: 12,
  champions: [
    { relicId: 1, alias: "lem22", country: "br" },
    { relicId: 2, alias: null, country: null },
  ],
  championsRecord: { wins: 13, losses: 2 },
  topScore: 13,
};

const summary: LadderHubSummary = { featured: finishedSeason, recent: [] };

const upcomingInfo: LadderSeasonInfo = {
  name: "Blood and Steel",
  status: "Draft",
  registrationStart: "2026-10-02T15:00:00",
  registrationEnd: "2026-10-18T00:00:00",
  ladderStart: "2026-11-03T10:00:00",
  ladderEnd: "2027-01-30T15:00:00",
  playoffCut: 8,
  semifinalCut: 4,
  bestOf: { ladder: 1, funnel: 3, semifinal: 3, final: 3 },
  challenge: {
    maxPositions: 3,
    responseHours: 48,
    matchDeadlineDays: 5,
    inactivityDays: 20,
    rematchDays: 14,
    rematchOtherMatches: 2,
  },
};

const upcomingSummary: LadderHubSummary = {
  featured: {
    seasonId: 2,
    info: upcomingInfo,
    players: 0,
    casts: 0,
    champions: [],
    championsRecord: null,
    topScore: null,
  },
  recent: [finishedSeason],
};

const render = (props: React.ComponentProps<typeof TournamentsScreen>) =>
  renderDom(
    <MantineProvider env="test">
      <TournamentsScreen {...props} />
    </MantineProvider>,
  ).container.innerHTML.replace(/&quot;/g, '"');

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
    expect(html).toContain("Latest season");
    // The latest season title and the open season button open the season page
    expect(getOpeningTag(html, "featured-latest-season-link")).toContain(
      'href="/tournaments/ladder-tournament/season/1"',
    );
    expect(getOpeningTag(html, "featured-open-season")).toContain(
      'href="/tournaments/ladder-tournament/season/1"',
    );
    expect(getOpeningTag(html, "featured-all-seasons")).toContain(
      'href="/tournaments/ladder-tournament"',
    );
    // Without the season info there is no status
    expect(html).not.toContain('data-testid="ladder-season-status"');
    expect(html).not.toContain('data-testid="ladder-hub-recent"');
    expect(html).not.toContain('data-testid="featured-unavailable"');
  });

  test("links the add your tournament note to Discord", () => {
    const html = render({ ladderSummary: null });

    const note = html.slice(html.indexOf('data-testid="tournaments-add-yours"'));
    expect(note).toContain('href="https://discord.com/invite/4Bj2y84WAR"');
    expect(note).toContain('target="_blank"');
    expect(note).toContain("Reach out to us on Discord to add your tournament here");
  });

  test("renders the upcoming season with its calendar and the recent seasons", () => {
    const html = render({ ladderSummary: upcomingSummary });

    expect(html).toContain("Current season");
    expect(html).toContain('league.seasonWithName {"season":2,"name":"Blood and Steel"}');
    expect(html).toContain("Upcoming");
    // The dates are in the info rows, not repeated next to the status
    expect(html).not.toContain("hub.ladderDates");
    expect(html).toContain('data-testid="ladder-season-info-rows"');
    expect(html).toContain("3 Nov 2026 – 30 Jan 2027");
    expect(html).toContain("2 Oct 2026 – 18 Oct 2026");
    expect(getOpeningTag(html, "featured-open-season")).toContain(
      'href="/tournaments/ladder-tournament/season/2"',
    );
    // The finished season below with its champions
    const recent = html.slice(html.indexOf('data-testid="ladder-hub-recent-1"'));
    expect(recent).toContain('href="/tournaments/ladder-tournament/season/1"');
    expect(recent).toContain('href="/players/1"');
    expect(recent).toContain("13–2");
  });

  test("renders the unavailable state, but keeps the official site link", () => {
    const html = render({ ladderSummary: null });

    expect(html).toContain('data-testid="featured-unavailable"');
    expect(html).toContain("Stats are unavailable right now");
    expect(html).toContain('href="https://laddertournament.com.br"');
    expect(html).not.toContain('data-testid="featured-latest-season"');
  });

  test("renders the whole external cards as secure new-tab links", () => {
    render({ ladderSummary: summary });

    for (const tournament of [IRONCLAD_TOURNAMENT, METAPLAYS_TOURNAMENT]) {
      const card = getCard(`tournament-card-${tournament.id}`);
      expect(card.tagName).toBe("A");
      expect(card.getAttribute("href")).toBe(tournament.url);
      expect(card.getAttribute("target")).toBe("_blank");
      expect(card.getAttribute("rel")).toBe("noopener noreferrer");
      expect(card.querySelectorAll("a, button")).toHaveLength(0);
      expect(card.querySelector("h2")).toBeTruthy();
    }
  });

  test("renders the approved IronClad identity and permanent tournament destination", () => {
    render({ ladderSummary: summary });
    const card = getCard("tournament-card-ironclad");

    expect(card.getAttribute("href")).toBe("https://www.ironcladtournaments.com/tournaments");
    expect(card.querySelector("h2")?.textContent).toBe("IronClad Tournaments");
    expect(
      findText(
        card,
        "Competitive Company of Heroes 3 tournaments where players compete in verified ELO divisions and build their competitive record across events.",
      ),
    ).toBeTruthy();
    expect(findText(card, "1v1")).toBeTruthy();
    expect(findText(card, "Verified ELO Divisions")).toBeTruthy();
    expect(findText(card, "View Official Website")).toBeTruthy();
    expect(findText(card, "Visit site")).toBeUndefined();
  });

  test("preserves MetaPlays content and the default CTA without metadata", () => {
    render({ ladderSummary: summary });
    const card = getCard("tournament-card-metaplays");

    expect(card.getAttribute("href")).toBe(METAPLAYS_TOURNAMENT.url);
    expect(card.querySelector("h2")?.textContent).toBe("MetaPlays");
    expect(
      findText(card, "Company of Heroes 3 tournaments hosted on the MetaPlays platform."),
    ).toBeTruthy();
    expect(findText(card, "Visit site")).toBeTruthy();
    expect(findText(card, "1v1")).toBeUndefined();
    expect(findText(card, "Verified ELO Divisions")).toBeUndefined();
    expect(findText(card, "View Official Website")).toBeUndefined();
  });

  test.each([IRONCLAD_TOURNAMENT, METAPLAYS_TOURNAMENT])(
    "tracks clicks from inside the $id card",
    (tournament) => {
      render({ ladderSummary: summary });
      const card = getCard(`tournament-card-${tournament.id}`);

      act(() => card.querySelector("h2")!.click());

      expect(AnalyticsTournamentExternalClick).toHaveBeenCalledTimes(1);
      expect(AnalyticsTournamentExternalClick).toHaveBeenCalledWith(tournament.id);
    },
  );

  test("supports optional metadata and a CTA override for another organiser", () => {
    renderDom(
      <MantineProvider env="test">
        <ExternalTournamentCard
          tournament={{
            ...METAPLAYS_TOURNAMENT,
            tags: IRONCLAD_TOURNAMENT.tags,
            ctaKey: IRONCLAD_TOURNAMENT.ctaKey,
          }}
        />
      </MantineProvider>,
    );
    const card = getCard("tournament-card-metaplays");

    expect(card.querySelector("h2")?.textContent).toBe("MetaPlays");
    expect(findText(card, "1v1")).toBeTruthy();
    expect(findText(card, "Verified ELO Divisions")).toBeTruthy();
    expect(findText(card, "View Official Website")).toBeTruthy();
    expect(card.getAttribute("href")).toBe(METAPLAYS_TOURNAMENT.url);
  });
});
