import { Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Tournaments hub (/tournaments), the Ladder Tournament overview
 * (/tournaments/ladder-tournament), the season pages (/tournaments/ladder-tournament/season/N)
 * and the IronClad pages (/tournaments/ironclad, /tournaments/ironclad/<slug>).
 */
export class TournamentsPage extends BasePage {
  // Hub
  get hub(): Locator {
    return this.getByTestId("tournaments-page");
  }

  get tournamentCards(): Locator {
    return this.page.locator('[data-testid^="tournament-card-"]');
  }

  tournamentCard(id: "ladderTournament" | "ironclad" | "metaplays"): Locator {
    return this.getByTestId(`tournament-card-${id}`);
  }

  get allSeasonsButton(): Locator {
    return this.getByTestId("featured-all-seasons");
  }

  // IronClad card with the live data, not shown when the data is unavailable
  get ironcladOpenTournamentButton(): Locator {
    return this.getByTestId("ironclad-hub-open-tournament");
  }

  // IronClad pages
  get ironcladOverviewPage(): Locator {
    return this.getByTestId("ironclad-overview");
  }

  get ironcladTournamentPage(): Locator {
    return this.getByTestId("ironclad-tournament");
  }

  get ironcladDivisionTabs(): Locator {
    return this.getByTestId("ironclad-divisions");
  }

  get ironcladUnavailableNotice(): Locator {
    return this.getByTestId("ironclad-unavailable");
  }

  // League overview
  get overviewPage(): Locator {
    return this.getByTestId("ladder-tournament-overview");
  }

  get openLatestSeasonButton(): Locator {
    return this.getByTestId("ladder-open-latest-season");
  }

  // Season page
  get seasonPage(): Locator {
    return this.getByTestId("ladder-tournament-page");
  }

  // The season is the page title on the season pages
  get seasonTitle(): Locator {
    return this.getByTestId("ladder-league-title");
  }

  // Breadcrumb back to the overview with all the seasons
  get allSeasonsLink(): Locator {
    return this.getByTestId("ladder-breadcrumb-league");
  }

  get standingsTable(): Locator {
    return this.getByTestId("ladder-standings-table");
  }

  get unavailableNotice(): Locator {
    return this.getByTestId("ladder-tournament-unavailable");
  }

  get allSeasonsTable(): Locator {
    return this.getByTestId("ladder-all-seasons-table");
  }

  async navigate(): Promise<void> {
    await this.goto("/tournaments");
  }

  async navigateToIronclad(): Promise<void> {
    await this.goto("/tournaments/ironclad");
  }

  async navigateToLeague(seasonId?: number): Promise<void> {
    await this.goto(
      seasonId === undefined
        ? "/tournaments/ladder-tournament"
        : `/tournaments/ladder-tournament/season/${seasonId}`,
    );
  }
}
