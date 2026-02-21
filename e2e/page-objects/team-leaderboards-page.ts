import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Team Leaderboards Page
 * Contains all selectors and methods for interacting with the team leaderboards page
 */
export class TeamLeaderboardsPage extends BasePage {
  /**
   * Navigate to the team leaderboards page with optional parameters
   */
  async navigate(params?: {
    side?: "axis" | "allies";
    type?: "2v2" | "3v3" | "4v4";
    orderBy?: "elo" | "total";
  }): Promise<void> {
    const searchParams = new URLSearchParams();
    if (params?.side) searchParams.set("side", params.side);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.orderBy) searchParams.set("orderBy", params.orderBy);

    const queryString = searchParams.toString();
    const path = queryString ? `/leaderboards-teams?${queryString}` : "/leaderboards-teams";
    await this.goto(path);
  }

  // Page Title and Header
  get pageTitle(): Locator {
    return this.page.locator("h2").first();
  }

  // Filter Controls - using data-testid for stability
  get sideSelect(): Locator {
    return this.page.getByTestId("team-leaderboards-side-select");
  }

  get typeSelect(): Locator {
    return this.page.getByTestId("team-leaderboards-type-select");
  }

  get orderBySelect(): Locator {
    return this.page.getByTestId("team-leaderboards-orderby-select");
  }

  get recordsPerPageSelect(): Locator {
    return this.page.getByTestId("team-leaderboards-records-per-page");
  }

  // Content container - indicates data is loaded
  get contentContainer(): Locator {
    return this.page.getByTestId("team-leaderboards-content");
  }

  // Leaderboard Table
  get leaderboardTable(): Locator {
    return this.page.locator("table").first();
  }

  get tableRows(): Locator {
    return this.leaderboardTable.locator("tbody tr");
  }

  get tableHeaders(): Locator {
    return this.leaderboardTable.locator("thead th");
  }

  // Pagination Controls - using data-testid for stability
  get previousPageButton(): Locator {
    return this.page.getByTestId("team-leaderboards-previous-btn");
  }

  get nextPageButton(): Locator {
    return this.page.getByTestId("team-leaderboards-next-btn");
  }

  get paginationInfo(): Locator {
    return this.page.getByTestId("team-leaderboards-pagination-info");
  }

  get paginationContainer(): Locator {
    return this.page.getByTestId("team-leaderboards-pagination");
  }

  // Loading State
  get loader(): Locator {
    return this.page.getByTestId("team-leaderboards-loader");
  }

  /**
   * Wait for the leaderboard table to load with proper conditions
   * No hardcoded timeouts - uses actual element state
   */
  async waitForTableLoad(): Promise<void> {
    // Wait for network to be idle (API responses complete)
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for loader to disappear if it was present
    await this.loader.waitFor({ state: "hidden", timeout: 15000 }).catch(() => {
      // Loader might not appear if data loads quickly, that's OK
    });

    // Wait for the content container to be visible (indicates data loaded)
    await this.contentContainer.waitFor({ state: "visible", timeout: 15000 });

    // Wait for table to be visible
    await this.leaderboardTable.waitFor({ state: "visible", timeout: 10000 });

    // Wait for at least one row to appear (data is populated)
    await this.tableRows.first().waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Check if the table has data using Playwright's auto-retry assertions
   */
  async checkTableHasData(): Promise<void> {
    await this.waitForTableLoad();
    // Use Playwright's built-in retry mechanism for more stable assertions
    await expect(this.tableRows.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get the number of rows in the table
   */
  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Get data from a specific row
   */
  async getRowData(rowIndex: number): Promise<{
    rank: string;
    elo: string;
    teamPlayers: string[];
  }> {
    const row = this.tableRows.nth(rowIndex);
    const cells = row.locator("td");

    // Get team players (multiple links in the team column)
    const teamCell = cells.nth(2);
    const playerLinks = teamCell.locator("a");
    const playerCount = await playerLinks.count();
    const teamPlayers: string[] = [];
    for (let i = 0; i < playerCount; i++) {
      teamPlayers.push(await playerLinks.nth(i).innerText());
    }

    return {
      rank: await cells.nth(0).innerText(),
      elo: await cells.nth(1).innerText(),
      teamPlayers,
    };
  }

  /**
   * Wait for data to change after a filter/pagination action
   * Detects when the table content has actually changed
   */
  private async waitForDataChange(previousFirstRowText: string): Promise<void> {
    // Wait for network activity to complete
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for the first row content to change (or timeout if data is the same)
    await this.page
      .waitForFunction(
        (oldText) => {
          const firstRow = document.querySelector("table tbody tr");
          return firstRow && firstRow.textContent !== oldText;
        },
        previousFirstRowText,
        { timeout: 10000 },
      )
      .catch(() => {
        // Data might be the same after filter change, that's OK
      });

    // Ensure table is fully loaded
    await this.waitForTableLoad();
  }

  /**
   * Change the side filter with race condition handling
   */
  async selectSide(side: "Axis" | "Allies"): Promise<void> {
    const previousFirstRowText = await this.tableRows
      .first()
      .innerText()
      .catch(() => "");

    await this.sideSelect.click();
    await this.page.locator(`[role="option"]:has-text("${side}")`).click();

    await this.waitForDataChange(previousFirstRowText);
  }

  /**
   * Change the type filter with race condition handling
   */
  async selectType(type: string): Promise<void> {
    const previousFirstRowText = await this.tableRows
      .first()
      .innerText()
      .catch(() => "");

    await this.typeSelect.click();
    await this.page.locator(`[role="option"]:has-text("${type}")`).click();

    await this.waitForDataChange(previousFirstRowText);
  }

  /**
   * Change the order by filter with race condition handling
   */
  async selectOrderBy(orderBy: string): Promise<void> {
    const previousFirstRowText = await this.tableRows
      .first()
      .innerText()
      .catch(() => "");

    await this.orderBySelect.click();
    await this.page.locator(`[role="option"]:has-text("${orderBy}")`).click();

    await this.waitForDataChange(previousFirstRowText);
  }

  /**
   * Change the records per page with race condition handling
   */
  async selectRecordsPerPage(records: string): Promise<void> {
    const previousRowCount = await this.tableRows.count();

    await this.recordsPerPageSelect.click();
    await this.page.locator(`[role="option"]:has-text("${records}")`).click();

    // Wait for network activity
    await this.page.waitForLoadState("networkidle", { timeout: 15000 });

    // Wait for row count to potentially change
    await this.page
      .waitForFunction(
        (oldCount) => {
          const rows = document.querySelectorAll("table tbody tr");
          return rows.length !== oldCount;
        },
        previousRowCount,
        { timeout: 10000 },
      )
      .catch(() => {
        // Row count might be the same, that's OK
      });

    await this.waitForTableLoad();
  }

  /**
   * Go to next page with race condition handling
   */
  async goToNextPage(): Promise<void> {
    // Capture both the pagination info and first row text before clicking
    const previousPaginationText = await this.paginationInfo.innerText().catch(() => "");
    const previousFirstRowText = await this.tableRows
      .first()
      .innerText()
      .catch(() => "");

    // Explicitly scroll into view for Mobile Safari compatibility
    await this.nextPageButton.scrollIntoViewIfNeeded();
    await this.nextPageButton.click();

    // Wait for pagination info to change (more reliable than row content)
    await this.page
      .waitForFunction(
        (oldText) => {
          const paginationEl = document.querySelector(
            '[data-testid="team-leaderboards-pagination-info"]',
          );
          return paginationEl && paginationEl.textContent !== oldText;
        },
        previousPaginationText,
        { timeout: 10000 },
      )
      .catch(() => {
        // Fallback: pagination might not change if on last page
      });

    // Also wait for data change as a secondary check
    await this.waitForDataChange(previousFirstRowText);
  }

  /**
   * Go to previous page with race condition handling
   */
  async goToPreviousPage(): Promise<void> {
    // Capture both the pagination info and first row text before clicking
    const previousPaginationText = await this.paginationInfo.innerText().catch(() => "");
    const previousFirstRowText = await this.tableRows
      .first()
      .innerText()
      .catch(() => "");

    // Explicitly scroll into view for Mobile Safari compatibility
    await this.previousPageButton.scrollIntoViewIfNeeded();
    await this.previousPageButton.click();

    // Wait for pagination info to change (more reliable than row content)
    await this.page
      .waitForFunction(
        (oldText) => {
          const paginationEl = document.querySelector(
            '[data-testid="team-leaderboards-pagination-info"]',
          );
          return paginationEl && paginationEl.textContent !== oldText;
        },
        previousPaginationText,
        { timeout: 10000 },
      )
      .catch(() => {
        // Fallback: pagination might not change if on first page
      });

    // Also wait for data change as a secondary check
    await this.waitForDataChange(previousFirstRowText);
  }

  /**
   * Check if next page button is enabled
   */
  async isNextPageEnabled(): Promise<boolean> {
    return await this.nextPageButton.isEnabled();
  }

  /**
   * Check if previous page button is enabled
   */
  async isPreviousPageEnabled(): Promise<boolean> {
    return await this.previousPageButton.isEnabled();
  }

  /**
   * Get pagination info text
   */
  async getPaginationInfo(): Promise<string> {
    // Wait for pagination info to be visible before reading
    await this.paginationInfo.waitFor({ state: "visible", timeout: 10000 });
    return await this.paginationInfo.innerText();
  }

  /**
   * Get the total number of records from pagination info
   */
  async getTotalRecordCount(): Promise<number> {
    const paginationText = await this.getPaginationInfo();
    // Extract total from "Showing X - Y of Z teams"
    const match = paginationText.match(/of (\d+) teams/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get the currently selected records per page value
   */
  async getSelectedRecordsPerPage(): Promise<string> {
    // Wait for the select to be visible
    await this.recordsPerPageSelect.waitFor({ state: "visible", timeout: 10000 });

    // The data-testid is on the input element itself in Mantine Select
    // Use evaluate to get the value attribute directly
    const value = await this.recordsPerPageSelect.evaluate((el) => {
      // The element is the input itself, check if it has a value attribute
      if (el instanceof HTMLInputElement) {
        return el.value;
      }

      // If it's a wrapper, look for the input inside
      const input = el.querySelector("input") as HTMLInputElement;
      if (input?.value) {
        return input.value;
      }

      // Fallback: get the value attribute directly
      return el.getAttribute("value") || "";
    });

    return value;
  }

  /**
   * Check if table columns are correct
   */
  async checkTableColumns(expectedColumns: string[]): Promise<void> {
    // Wait for headers to be visible first
    await this.tableHeaders.first().waitFor({ state: "visible", timeout: 10000 });
    const headers = await this.tableHeaders.allInnerTexts();
    for (const column of expectedColumns) {
      expect(headers.some((h) => h.includes(column))).toBeTruthy();
    }
  }

  /**
   * Get all player names from a specific row
   */
  async getTeamPlayersFromRow(rowIndex: number): Promise<string[]> {
    const row = this.tableRows.nth(rowIndex);
    const teamCell = row.locator("td").nth(2);
    const playerLinks = teamCell.locator("a");
    const count = await playerLinks.count();
    const players: string[] = [];
    for (let i = 0; i < count; i++) {
      players.push(await playerLinks.nth(i).innerText());
    }
    return players;
  }
}
