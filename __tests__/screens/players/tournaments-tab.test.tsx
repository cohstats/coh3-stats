/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import TournamentsTab from "../../../screens/players/tabs/tournaments-tab/tournaments-tab";
import rankingResponse from "../../test-assets/ladder-tournament-ranking-response.json";
import casterVideosResponse from "../../test-assets/ladder-tournament-caster-videos-response.json";
import playerTournamentsResponse from "../../test-assets/ironclad-player-tournaments-response.json";
import tournamentsResponse from "../../test-assets/ironclad-tournaments-response.json";
import type {
  LadderTournamentCasterVideo,
  LadderTournamentPlayerData,
  LadderTournamentRankingItem,
} from "../../../src/apis/ladder-tournament-api";
import type {
  IroncladPlayerData,
  IroncladPlayerEntry,
} from "../../../src/apis/ironclad-tournament-api";
import type { PlayerTournamentsData } from "../../../src/players/tournaments";

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

// Player without any IronClad history
const NO_IRONCLAD: IroncladPlayerData = {
  history: {
    relicProfileId: "1",
    currentIdentity: null,
    entries: [],
    aggregate: { tournamentsEntered: 0, matchesPlayed: 0, wins: 0, losses: 0, titles: 0 },
  },
  registrations: {},
  finalRounds: {},
};

const data = (
  ladder: LadderTournamentPlayerData,
  ironclad: IroncladPlayerData = NO_IRONCLAD,
): PlayerTournamentsData => ({ ladder, ironclad });

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
      tournamentData: data({ videos, ladderRanking: [ranking[0]] }),
      playerName: "lem22",
    });

    const { row, after } = getRow(html, "tournament-season-1");
    expect(row).toContain("tournaments.titles.ladderwinner");
    expect(row).toContain('tournaments.casts {"count":3}');
    // The casts row is right after the season row
    const castsRow = after.slice(0, after.indexOf("</tr>"));
    expect(count(castsRow, /data-testid="tournament-video-/g)).toBe(3);
    // Caster and the publish date formatted in the active locale
    expect(castsRow).toContain("HelpingHans · 7 Sep 2026");
    expect(html).toContain('tournaments.summary.titles {"count":1}');
  });

  test("renders a season without casts and titles with dashes and no casts row", () => {
    const html = renderTab({
      tournamentData: data({ videos: [], ladderRanking: [{ ...ranking[0], ...noTitles }] }),
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
      tournamentData: data({ videos: [], ladderRanking: ranking }),
      playerName: "Player",
    });

    const seasonIds = [...html.matchAll(/data-testid="tournament-season-(\d+)"/g)].map(
      (match) => match[1],
    );
    expect(seasonIds).toEqual(["2", "1"]);
    expect(html).toContain('tournaments.summary.seasons {"count":2}');
  });

  test("links every season to its standings page", () => {
    const html = renderTab({
      tournamentData: data({ videos: [], ladderRanking: ranking }),
      playerName: "Player",
    });

    for (const seasonId of [1, 2]) {
      const { row } = getRow(html, `tournament-season-${seasonId}`);
      expect(row).toContain(`href="/tournaments/ladder-tournament/season/${seasonId}"`);
      expect(row).toContain("tournaments.seasonStandings");
    }
  });

  test("renders the empty state for a player without tournaments", () => {
    const html = renderTab({
      tournamentData: data({ videos: [], ladderRanking: [] }),
      playerName: "Thomas",
    });

    expect(html).toContain('tournaments.noData {"name":"Thomas"}');
    expect(html).not.toContain('data-testid="tournaments-summary"');
  });

  test("renders the unavailable state when the data failed to load", () => {
    const html = renderTab({
      tournamentData: data({ videos: null, ladderRanking: null }),
      playerName: "Thomas",
    });

    expect(html).toContain("tournaments.unavailable");
  });

  test("renders the unavailable state instead of the empty state when only the ranking failed", () => {
    const html = renderTab({
      tournamentData: data({ videos: [], ladderRanking: null }),
      playerName: "Thomas",
    });

    const ladderSection = html.slice(
      html.indexOf('data-testid="tournament-section-ladderTournament"'),
      html.indexOf('data-testid="tournament-section-ironclad"'),
    );
    expect(ladderSection).toContain("tournaments.unavailable");
    expect(ladderSection).not.toContain("tournaments.noData");
  });

  test("keeps the casts with the unavailable notice when only the ranking failed", () => {
    const html = renderTab({
      tournamentData: data({ videos, ladderRanking: null }),
      playerName: "Thomas",
    });

    expect(html).toContain("tournaments.unavailable");
    expect(count(html, /data-testid="tournament-video-/g)).toBe(3);
  });

  describe("IronClad section", () => {
    // Loaded the same way as getIroncladPlayerData returns it, see the API tests
    const academy = tournamentsResponse.data[1].divisions[0];
    const ironclad: IroncladPlayerData = {
      history: {
        relicProfileId: "1188298",
        currentIdentity: playerTournamentsResponse.data.currentIdentity,
        entries: playerTournamentsResponse.data.entries as IroncladPlayerEntry[],
        aggregate: { tournamentsEntered: 2, matchesPlayed: 1, wins: 0, losses: 1, titles: 0 },
      },
      registrations: Object.fromEntries(
        academy.participants.map((p) => [
          p.registrationId,
          { eventAlias: p.eventAlias, relicProfileId: p.relicProfileId },
        ]),
      ),
      finalRounds: { [academy.bracket!.id]: 3 },
    };
    const HOLD_THE_LINE_ENTRY = "eca75a0b-ede3-44a8-9636-0f4d2bd95124";
    const NEW_FRONT_ENTRY = "5a0d3a4d-2644-4d61-8421-387c9b38d8e1";

    test("renders every entry linking to the division bracket on COH3 Stats", () => {
      const html = renderTab({
        tournamentData: data({ videos: [], ladderRanking: [] }, ironclad),
        playerName: "CartelCub",
      });

      const { row: current } = getRow(html, `ironclad-entry-${HOLD_THE_LINE_ENTRY}`);
      expect(current).toContain('href="/tournaments/ironclad/hold-the-line?division=academy"');
      expect(current).toContain("HOLD THE LINE");
      expect(current).toContain("tournaments.ironclad.result.registered");

      const { row: past } = getRow(html, `ironclad-entry-${NEW_FRONT_ENTRY}`);
      expect(past).toContain('href="/tournaments/ironclad/the-new-front?division=academy"');
      expect(past).toContain('tournaments.ironclad.result.eliminated {"round":"Quarter Finals"}');
      expect(past).toContain('tournaments.ironclad.showMatches {"count":1}');
      // No external IronClad tournament links in the rows
      expect(past).not.toContain("ironcladtournaments.com");
    });

    test("counts IronClad in the tab summary", () => {
      const html = renderTab({
        tournamentData: data({ videos: [], ladderRanking: [] }, ironclad),
        playerName: "CartelCub",
      });

      expect(html).toContain('tournaments.summary.tournaments {"count":1}');
      expect(html).toContain('tournaments.ironclad.aggregate.tournaments {"count":2}');
    });

    test("renders the empty state for a player without IronClad history", () => {
      const html = renderTab({
        tournamentData: data({ videos: [], ladderRanking: ranking }),
        playerName: "Thomas",
      });
      const section = html.slice(html.indexOf('data-testid="tournament-section-ironclad"'));

      expect(section).toContain('tournaments.noData {"name":"Thomas"}');
    });

    test("renders the unavailable state when the history failed to load", () => {
      const html = renderTab({
        tournamentData: data(
          { videos: [], ladderRanking: ranking },
          { ...NO_IRONCLAD, history: null },
        ),
        playerName: "Thomas",
      });
      const section = html.slice(html.indexOf('data-testid="tournament-section-ironclad"'));

      expect(section).toContain("tournaments.unavailable");
      expect(section).not.toContain("tournaments.noData");
    });
  });
});
