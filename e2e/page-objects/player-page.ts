import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";
import { PlayerTab, TEST_PLAYER } from "../fixtures/test-data";

/**
 * Page Object for the Player Profile page - `/players/[...playerID]`
 *
 * The page is server-rendered from the Relic + COH3 Stats APIs, and every tab except
 * `standings` / `standingsDetails` / `activity` / `nemesis` loads its data client side, so most
 * getters here are paired with an explicit wait.
 */
export class PlayerPage extends BasePage {
  /**
   * Navigate to a player profile, optionally straight into one of the tabs.
   */
  async navigate(
    profileId: string = TEST_PLAYER.profileId,
    options?: { view?: PlayerTab; extraParams?: Record<string, string> },
  ): Promise<void> {
    const params = new URLSearchParams();
    if (options?.view) params.set("view", options.view);
    for (const [key, value] of Object.entries(options?.extraParams || {})) {
      params.set(key, value);
    }

    const query = params.toString();
    await this.goto(`/players/${profileId}${query ? `?${query}` : ""}`);
  }

  // ------------------------------------------------------------------- header

  get playerCard(): Locator {
    return this.getByTestId("player-card");
  }

  get playerName(): Locator {
    return this.getByTestId("player-name");
  }

  get playerAvatar(): Locator {
    return this.getByTestId("player-avatar");
  }

  get playerSummary(): Locator {
    return this.getByTestId("player-summary");
  }

  get errorCard(): Locator {
    return this.getByTestId("error-card");
  }

  // --------------------------------------------------------------------- tabs

  get tabsList(): Locator {
    return this.getByTestId("player-tabs");
  }

  tab(view: PlayerTab): Locator {
    return this.getByTestId(`player-tab-${view}`);
  }

  /**
   * Click a tab and wait for the `?view=` param to be pushed into the URL.
   */
  async switchToTab(view: PlayerTab): Promise<void> {
    await this.tab(view).click();
    await this.page.waitForURL(new RegExp(`view=${view}`));
  }

  /**
   * The currently selected tab, as Mantine marks it.
   */
  get activeTab(): Locator {
    return this.tabsList.locator('[data-active="true"]');
  }

  // ----------------------------------------------------------- standings tab

  get standingsTab(): Locator {
    return this.getByTestId("player-standings-tab");
  }

  get summaryCharts(): Locator {
    return this.getByTestId("standings-summary-charts");
  }

  factionSection(faction: "german" | "american" | "dak" | "british"): Locator {
    return this.getByTestId(`standings-faction-${faction}`);
  }

  factionTable(faction: "german" | "american" | "dak" | "british"): Locator {
    return this.getByTestId(`standings-table-${faction}`);
  }

  /** The "+" action in a faction summary card, which jumps to the detailed stats tab. */
  factionMoreButton(faction: "german" | "american" | "dak" | "british"): Locator {
    return this.getByTestId(`standings-faction-more-${faction}`);
  }

  get countersWidget(): Locator {
    return this.getByTestId("counters-widget");
  }

  get mapsWidget(): Locator {
    return this.getByTestId("maps-widget");
  }

  get nemesisWidget(): Locator {
    return this.getByTestId("nemesis-widget");
  }

  get aliasHistoryWidget(): Locator {
    return this.getByTestId("alias-history-widget");
  }

  get topTeamsInfo(): Locator {
    return this.getByTestId("top-teams-info");
  }

  /** Top teams only render once the container scrolls into view. */
  async scrollToTopTeams(): Promise<void> {
    await this.getByTestId("top-teams-info-container").scrollIntoViewIfNeeded();
  }

  // ----------------------------------------------------- recent matches tab

  get recentMatchesTable(): Locator {
    return this.getByTestId("recent-matches-table");
  }

  get recentMatchesRows(): Locator {
    return this.recentMatchesTable.locator("tbody tr");
  }

  /** The recent matches table is fetched client side - wait for the rows. */
  async waitForRecentMatches(): Promise<void> {
    await expect(this.recentMatchesTable).toBeVisible({ timeout: 30000 });
    await expect(this.recentMatchesRows.first()).toBeVisible({ timeout: 30000 });
  }

  get matchDetailDrawer(): Locator {
    return this.page.locator('[role="dialog"]', {
      has: this.getByTestId("match-drawer-open-in-new-tab"),
    });
  }

  get drawerOpenInNewTabButton(): Locator {
    return this.getByTestId("match-drawer-open-in-new-tab");
  }

  /**
   * Open the match detail drawer for a row via its "Details" button.
   */
  async openMatchDetails(rowIndex = 0): Promise<void> {
    await this.recentMatchesRows.nth(rowIndex).getByRole("button", { name: "Details" }).click();
    await expect(this.drawerOpenInNewTabButton).toBeVisible();
  }

  /**
   * The route (`/matches/<id>?profileIDs=[...]`) of the match opened in the drawer.
   */
  async getDrawerMatchRoute(): Promise<string> {
    const href = await this.drawerOpenInNewTabButton.getAttribute("href");
    expect(href, "drawer should link to the full match detail page").toBeTruthy();
    return href as string;
  }

  get replayButtons(): Locator {
    return this.recentMatchesTable.getByRole("button", { name: "Replay" });
  }

  // ------------------------------------------------------------ other tabs

  get detailedStatsTab(): Locator {
    return this.getByTestId("player-detailed-stats-tab");
  }

  get detailedStatsFactionSelect(): Locator {
    return this.getByTestId("detailed-stats-faction-select");
  }

  get detailedStatsGameTypeSelect(): Locator {
    return this.getByTestId("detailed-stats-game-type-select");
  }

  get activityTab(): Locator {
    return this.getByTestId("player-activity-tab");
  }

  get activityCalendarChart(): Locator {
    return this.getByTestId("activity-calendar-chart");
  }

  get activityHourChart(): Locator {
    return this.getByTestId("activity-hour-chart");
  }

  get activityWeekDayChart(): Locator {
    return this.getByTestId("activity-weekday-chart");
  }

  get nemesisTab(): Locator {
    return this.getByTestId("player-nemesis-tab");
  }

  get teamsStandingsTab(): Locator {
    return this.getByTestId("player-teams-standings-tab");
  }

  get replaysTable(): Locator {
    return this.getByTestId("player-replays-table");
  }
}
