import { Locator } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Tournaments hub (/tournaments) and the Ladder Tournament league page
 * (/tournaments/ladder-tournament[/season/N]).
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

  get openLeagueButton(): Locator {
    return this.getByTestId("featured-open-league");
  }

  // League page
  get leaguePage(): Locator {
    return this.getByTestId("ladder-tournament-page");
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

  async navigateToLeague(seasonId?: number): Promise<void> {
    await this.goto(
      seasonId === undefined
        ? "/tournaments/ladder-tournament"
        : `/tournaments/ladder-tournament/season/${seasonId}`,
    );
  }
}
