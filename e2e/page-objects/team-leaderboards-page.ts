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
    return this.page.locator("h1, h2").first();
  }

  // Filter Controls
  get sideSelect(): Locator {
    return this.page.locator('label:has-text("Side")').locator("..");
  }

  get typeSelect(): Locator {
    return this.page.locator('label:has-text("Type")').locator("..");
  }

  get orderBySelect(): Locator {
    return this.page.locator('label:has-text("Sort by")').locator("..");
  }

  get recordsPerPageSelect(): Locator {
    return this.page.locator('label:has-text("Items per page")').locator("..");
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

  // Pagination Controls
  get previousPageButton(): Locator {
    return this.page.locator('button:has-text("Previous")');
  }

  get nextPageButton(): Locator {
    return this.page.locator('button:has-text("Next")');
  }

  get paginationInfo(): Locator {
    return this.page.locator("text=/Showing \\d+ - \\d+ of \\d+ teams/");
  }

  // Loading State
  get loader(): Locator {
    return this.page.locator('[data-loader="true"]');
  }

  get loadingIndicator(): Locator {
    return this.page.locator('[data-loading="true"]');
  }

  // Error State
  get errorCard(): Locator {
    return this.page.locator('[role="alert"], .error-card');
  }

  /**
   * Wait for the leaderboard table to load
   */
  async waitForTableLoad(): Promise<void> {
    // Wait for table to be visible
    await this.leaderboardTable.waitFor({ state: "visible", timeout: 10000 });

    // Wait for at least one row to be present
    await this.tableRows.first().waitFor({ state: "visible", timeout: 10000 });

    // Wait for loading indicator to be false if it exists
    await this.page.waitForSelector('[data-loading="false"]', { timeout: 5000 }).catch(() => {
      // Ignore if loading indicator doesn't exist
    });

    // Small delay to ensure React state has settled
    await this.page.waitForTimeout(100);
  }

  /**
   * Check if the table has data
   */
  async checkTableHasData(): Promise<void> {
    await this.waitForTableLoad();
    const rowCount = await this.tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
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
   * Change the side filter
   */
  async selectSide(side: "Axis" | "Allies"): Promise<void> {
    await this.sideSelect.click();
    await this.page.locator(`[role="option"]:has-text("${side}")`).click();
    await this.waitForTableLoad();
  }

  /**
   * Change the type filter
   */
  async selectType(type: string): Promise<void> {
    await this.typeSelect.click();
    await this.page.locator(`[role="option"]:has-text("${type}")`).click();
    await this.waitForTableLoad();
  }

  /**
   * Change the order by filter
   */
  async selectOrderBy(orderBy: string): Promise<void> {
    await this.orderBySelect.click();
    await this.page.locator(`[role="option"]:has-text("${orderBy}")`).click();
    await this.waitForTableLoad();
  }

  /**
   * Change the records per page
   */
  async selectRecordsPerPage(records: string): Promise<void> {
    await this.recordsPerPageSelect.click();
    await this.page.locator(`[role="option"]:has-text("${records}")`).click();
    await this.waitForTableLoad();
  }

  /**
   * Go to next page
   */
  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    // Wait a bit for the click to register
    await this.page.waitForTimeout(200);
    await this.waitForTableLoad();
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.previousPageButton.click();
    // Wait a bit for the click to register
    await this.page.waitForTimeout(200);
    await this.waitForTableLoad();
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
    // The select component shows the selected value in its button
    return await this.recordsPerPageSelect.locator("input").inputValue();
  }

  /**
   * Click on a player name in the table
   */
  async clickPlayerName(rowIndex: number, playerIndex: number = 0): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const teamCell = row.locator("td").nth(2);
    const playerLink = teamCell.locator("a").nth(playerIndex);
    await playerLink.click();
  }

  /**
   * Check if error is displayed
   */
  async checkErrorDisplayed(): Promise<void> {
    await expect(this.errorCard).toBeVisible();
  }

  /**
   * Check if loading state is displayed
   */
  async checkLoadingDisplayed(): Promise<void> {
    await expect(this.loader).toBeVisible();
  }

  /**
   * Check if table columns are correct
   */
  async checkTableColumns(expectedColumns: string[]): Promise<void> {
    const headers = await this.tableHeaders.allInnerTexts();
    for (const column of expectedColumns) {
      expect(headers.some((h) => h.includes(column))).toBeTruthy();
    }
  }

  /**
   * Verify page title contains side and type
   */
  async checkPageTitleContains(text: string): Promise<void> {
    const title = await this.pageTitle.innerText();
    expect(title.toLowerCase()).toContain(text.toLowerCase());
  }

  /**
   * Check if a specific team player is in the table
   */
  async checkPlayerInTable(playerName: string): Promise<boolean> {
    const tableText = await this.leaderboardTable.innerText();
    return tableText.includes(playerName);
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

  /**
   * Verify streak color (green for positive, red for negative)
   */
  async checkStreakColor(rowIndex: number, expectedColor: "green" | "red"): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const streakCell = row.locator("td").nth(3);
    const color = await streakCell
      .locator("div, span, p")
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

    // Normalize the computed color to RGB format for comparison
    // Expected colors: green = rgb(64, 192, 87) or similar, red = rgb(250, 82, 82) or similar
    // The actual RGB values may vary based on the theme, so we check the pattern
    const colorMapping = {
      green: /rgb\(\s*\d+,\s*1[5-9]\d|2\d\d,\s*\d+\s*\)/i, // Green has high G value (150+)
      red: /rgb\(\s*2[0-5]\d,\s*\d{1,2},\s*\d{1,2}\s*\)/i, // Red has high R value (200+)
    };

    expect(color).toMatch(colorMapping[expectedColor]);
  }
}
