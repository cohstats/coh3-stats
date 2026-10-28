import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import IroncladTournamentScreen from "../../../screens/tournaments/ironclad";
import IroncladSection from "../../../screens/players/tabs/tournaments-tab/ironclad-section";
import { buildIroncladTournamentView } from "../../../src/tournaments/ironclad-tournament";
import { buildIroncladTournament } from "../../../src/players/tournaments";
import type {
  IroncladPlayerEntry,
  IroncladTournament,
} from "../../../src/apis/ironclad-tournament-api";
import tournamentsResponse from "../../test-assets/ironclad-tournaments-response.json";
import playerTournamentsResponse from "../../test-assets/ironclad-player-tournaments-response.json";

jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockRouter = { locale: "en", query: {} as Record<string, string>, replace: jest.fn() };
jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("../../../src/firebase/analytics", () => ({
  AnalyticsIroncladTournamentView: jest.fn(),
}));

// Mantine needs these browser APIs, jsdom doesn't have them
beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia =
    window.matchMedia ||
    ((query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }) as unknown as MediaQueryList);
  window.ResizeObserver =
    window.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

const tournaments = tournamentsResponse.data as IroncladTournament[];
const [holdTheLine, theNewFront] = tournaments;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const render = (element: React.ReactNode) =>
  act(() => root.render(<MantineProvider>{element}</MantineProvider>));

const byTestId = (testId: string) => {
  const element = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!element) throw new Error(`No element ${testId}`);
  return element;
};

const click = (testId: string) => act(() => byTestId(testId).click());

describe("IroncladTournamentScreen division tabs", () => {
  test("opens the top division of the next tournament, not the one picked before", () => {
    render(
      <IroncladTournamentScreen
        slug="hold-the-line"
        data={buildIroncladTournamentView(holdTheLine, {})}
      />,
    );

    expect(byTestId("ironclad-division-tab-pro").getAttribute("aria-selected")).toBe("true");
    click("ironclad-division-tab-challenge");
    expect(byTestId("ironclad-division-tab-challenge").getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(mockRouter.replace).toHaveBeenCalledWith(
      "/tournaments/ironclad/hold-the-line?division=challenge",
      undefined,
      { shallow: true, scroll: false },
    );

    // Client side navigation keeps the page component mounted
    render(
      <IroncladTournamentScreen
        slug="the-new-front"
        data={buildIroncladTournamentView(theNewFront, {})}
      />,
    );

    expect(byTestId("ironclad-division-tab-main").getAttribute("aria-selected")).toBe("true");
  });
});

describe("IroncladSection matches", () => {
  test("shows a bye instead of TBD for a decided match without an opponent", () => {
    const entry = playerTournamentsResponse.data.entries[1] as IroncladPlayerEntry;
    const byeEntry: IroncladPlayerEntry = {
      ...entry,
      matches: [
        {
          ...entry.matches[0],
          playerOneRegistrationId: null,
          playerTwoRegistrationId: entry.registrationId,
          winnerRegistrationId: entry.registrationId,
          completed: true,
          played: false,
        },
      ],
    };
    const tournament = buildIroncladTournament({
      history: {
        relicProfileId: "1188298",
        currentIdentity: playerTournamentsResponse.data.currentIdentity,
        entries: [byeEntry],
        aggregate: { tournamentsEntered: 1, matchesPlayed: 0, wins: 1, losses: 0, titles: 0 },
      },
      registrations: {},
      finalRounds: {},
    });

    render(<IroncladSection tournament={tournament} playerName="CartelCub" />);
    click(`ironclad-entry-toggle-${entry.registrationId}`);

    const match = byTestId(`ironclad-player-match-${entry.matches[0].id}`).textContent;
    expect(match).toContain("tournaments.ironclad.match.bye");
    expect(match).not.toContain("tournaments.ironclad.match.tbd");
  });
});
