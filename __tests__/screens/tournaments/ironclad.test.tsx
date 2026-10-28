/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import TournamentsScreen from "../../../screens/tournaments";
import IroncladTournamentScreen from "../../../screens/tournaments/ironclad";
import IroncladOverviewScreen from "../../../screens/tournaments/ironclad/overview";
import {
  buildIroncladHubSummary,
  buildIroncladOverviewData,
  buildIroncladTournamentView,
} from "../../../src/tournaments/ironclad-tournament";
import type { IroncladTournament } from "../../../src/apis/ironclad-tournament-api";
import tournamentsResponse from "../../test-assets/ironclad-tournaments-response.json";

// Returns the key with the interpolation values, so we can assert on them
jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

const mockRouter = { locale: "en", query: {} as Record<string, string>, replace: jest.fn() };
jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("../../../src/firebase/analytics", () => ({
  AnalyticsTournamentsPageView: jest.fn(),
  AnalyticsTournamentExternalClick: jest.fn(),
  AnalyticsIroncladTournamentView: jest.fn(),
}));

const tournaments = tournamentsResponse.data as IroncladTournament[];
const [holdTheLine, theNewFront] = tournaments;
const names = { 1188298: { alias: "CartelCub", country: "us" } };

// Server side render, same as the ISR pages
const renderHtml = (element: React.ReactNode) =>
  renderToStaticMarkup(<MantineProvider>{element}</MantineProvider>).replace(/&quot;/g, '"');

const getElement = (html: string, testId: string) => {
  const start = html.lastIndexOf("<", html.indexOf(`data-testid="${testId}"`));
  return html.slice(start);
};

const count = (html: string, pattern: RegExp) => (html.match(pattern) || []).length;

describe("IronClad on the Tournaments hub", () => {
  test("renders the live card with the current tournament and the last champions", () => {
    const html = renderHtml(
      <TournamentsScreen
        ladderSummary={null}
        ironcladSummary={buildIroncladHubSummary(tournaments, names)}
      />,
    );
    const card = getElement(html, "tournament-card-ironclad");

    // Not the external organiser card anymore
    expect(card.startsWith("<div")).toBe(true);
    expect(card).toContain("HOLD THE LINE");
    expect(card).toContain("ironclad.registrationOpen");
    expect(card).toContain('ironclad.playersCount {"count":22}');
    for (const division of ["academy", "challenge", "main", "pro"]) {
      expect(card).toContain(`data-testid="ironclad-hub-division-${division}"`);
    }
    expect(card).toContain('ironclad.divisionFill {"count":6,"capacity":8}');
    expect(card).toContain('hub.lastChampions {"name":"THE NEW FRONT"}');
    expect(card).toContain("DarthYukat");
    expect(card).toContain('href="/tournaments/ironclad/hold-the-line"');
    expect(card).toContain('href="/tournaments/ironclad"');
    // Registration is open, so the external button registers
    expect(card).toContain("hub.register");
    expect(card).toContain(
      'href="https://www.ironcladtournaments.com/tournaments?tournament=hold-the-line"',
    );
    // Only MetaPlays stays as an external card
    expect(count(html, /data-testid="tournament-card-/g)).toBe(3);
  });

  test("falls back to the organiser card without the data", () => {
    const html = renderHtml(<TournamentsScreen ladderSummary={null} ironcladSummary={null} />);

    expect(getElement(html, "tournament-card-ironclad").startsWith("<a")).toBe(true);
    expect(html).not.toContain('data-testid="ironclad-hub-featured"');
  });
});

describe("IroncladTournamentScreen", () => {
  beforeEach(() => {
    mockRouter.query = {};
  });

  test("renders the completed tournament with brackets, champions and forfeits", () => {
    const html = renderHtml(
      <IroncladTournamentScreen
        slug="the-new-front"
        data={buildIroncladTournamentView(theNewFront, names)}
      />,
    );

    expect(html).toContain("THE NEW FRONT");
    for (const division of ["academy", "challenge", "main"]) {
      expect(html).toContain(`data-testid="ironclad-division-tab-${division}"`);
    }
    // All the panels are in the HTML, so all the brackets are indexed
    expect(count(html, /data-testid="ironclad-bracket"/g)).toBeGreaterThanOrEqual(1);
    expect(html).toContain('data-testid="ironclad-bracket-champion"');
    expect(html).toContain("Quarter Finals");
    expect(html).toContain("Grand Final");
    expect(html).toContain('ironclad.bracket.bestOf {"count":5}');
    expect(html).toContain('data-testid="ironclad-match-forfeit"');
    // The linked player goes to our player card, the rest to their IronClad profile
    expect(html).toContain('href="/players/1188298"');
    expect(html).toContain('href="https://www.ironcladtournaments.com/players/');
    expect(html).not.toContain("ironclad.registrationOpen");
  });

  test("renders the running tournament with TBD slots and the not generated brackets", () => {
    const html = renderHtml(
      <IroncladTournamentScreen
        slug="hold-the-line"
        data={buildIroncladTournamentView(holdTheLine, {})}
      />,
    );

    // The running division is open by default
    expect(getElement(html, "ironclad-division-tab-pro")).toMatch(
      /^<button[^>]*aria-selected="true"/,
    );
    expect(html).toContain("ironclad.bracket.tbd");
    expect(html).toContain("ironclad.bracket.live");
    expect(html).toContain('data-testid="ironclad-bracket-not-generated"');
    expect(html).toContain("ironclad.registrationOpen");
    expect(html).not.toContain('data-testid="ironclad-bracket-champion"');
  });

  test("renders the unavailable state", () => {
    const html = renderHtml(<IroncladTournamentScreen slug="hold-the-line" data={null} />);

    expect(html).toContain('data-testid="ironclad-unavailable"');
    expect(html).toContain('href="https://www.ironcladtournaments.com/tournaments"');
  });
});

describe("IroncladOverviewScreen", () => {
  test("lists the tournaments with the division links and the latest champions", () => {
    const html = renderHtml(
      <IroncladOverviewScreen data={buildIroncladOverviewData(tournaments, names)} />,
    );

    expect(html.indexOf("HOLD THE LINE")).toBeLessThan(
      html.indexOf('data-testid="ironclad-tournament-the-new-front"'),
    );
    expect(html).toContain('href="/tournaments/ironclad/the-new-front?division=academy"');
    expect(html).toContain('href="/tournaments/ironclad/hold-the-line?division=pro"');
    expect(getElement(html, "ironclad-latest-champions")).toContain("DarthYukat");
  });

  test("renders the unavailable state", () => {
    const html = renderHtml(<IroncladOverviewScreen data={null} />);

    expect(html).toContain('data-testid="ironclad-unavailable"');
  });

  test("renders the empty state", () => {
    const html = renderHtml(<IroncladOverviewScreen data={{ tournaments: [] }} />);

    expect(html).toContain('data-testid="ironclad-no-tournaments"');
  });
});
