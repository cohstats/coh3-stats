import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Leaderboards Page
 * Contains all selectors and methods for interacting with the leaderboards page
 */
export class LeaderboardsPage extends BasePage {
  /**
   * Navigate to the leaderboards page with optional parameters
   */
  async navigate(params?: {
    race?: "american" | "british" | "german" | "dak";
    type?: "1v1" | "2v2" | "3v3" | "4v4";
    platform?: "steam" | "xbox" | "psn";
    sortBy?: "elo" | "wins";
    region?: string;
    start?: number;
  }): Promise<void> {
    const searchParams = new URLSearchParams();
    if (params?.race) searchParams.set("race", params.race);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.platform) searchParams.set("platform", params.platform);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.region) searchParams.set("region", params.region);
    if (params?.start) searchParams.set("start", params.start.toString());

    const queryString = searchParams.toString();
    const path = queryString ? `/leaderboards?${queryString}` : "/leaderboards";
    await this.goto(path);
  }

  // Page Title and Header
  get pageTitle(): Locator {
    return this.page.locator("h2");
  }

  get factionIcon(): Locator {
    return this.page.locator("img[alt*='icon']").first();
  }

  // Filter Controls
  get regionSelect(): Locator {
    return this.page.locator('label:has-text("Region")').locator("..");
  }

  get platformSelect(): Locator {
    return this.page.locator('label:has-text("Platform")').locator("..");
  }

  get sortBySelect(): Locator {
    return this.page.locator('label:has-text("Sort by")').locator("..");
  }

  get typeSelect(): Locator {
    return this.page.locator('label:has-text("Type")').locator("..");
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
  get paginationControls(): Locator {
    return this.page.locator('[aria-label*="pagination"]');
  }

  get nextPageButton(): Locator {
    return this.page.locator('button[aria-label*="Next"]');
  }

  get previousPageButton(): Locator {
    return this.page.locator('button[aria-label*="Previous"]');
  }

  get pageNumbers(): Locator {
    return this.page.locator('[role="button"][aria-label*="Page"]');
  }

  // Error State
  get errorCard(): Locator {
    return this.page.locator('[role="alert"], .error-card');
  }

  /**
   * Wait for the leaderboard table to load
   */
  async waitForTableLoad(): Promise<void> {
    await this.leaderboardTable.waitFor({ state: "visible", timeout: 10000 });
    // Wait for data to populate
    await this.page.waitForTimeout(1000);
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
    alias: string;
  }> {
    const row = this.tableRows.nth(rowIndex);
    const cells = row.locator("td");

    return {
      rank: await cells.nth(0).innerText(),
      elo: await cells.nth(1).innerText(),
      alias: await cells.nth(3).innerText(),
    };
  }

  /**
   * Change the region filter
   */
  async selectRegion(region: string): Promise<void> {
    await this.regionSelect.click();
    await this.page.locator(`[role="option"]:has-text("${region}")`).click();
    await this.waitForTableLoad();
  }

  /**
   * Change the platform filter
   */
  async selectPlatform(platform: string): Promise<void> {
    await this.platformSelect.click();
    await this.page.locator(`[role="option"]:has-text("${platform}")`).click();
    await this.waitForTableLoad();
  }

  /**
   * Change the sort by filter
   */
  async selectSortBy(sortBy: string): Promise<void> {
    await this.sortBySelect.click();
    await this.page.locator(`[role="option"]:has-text("${sortBy}")`).click();
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
   * Go to next page
   */
  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    await this.waitForTableLoad();
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.previousPageButton.click();
    await this.waitForTableLoad();
  }

  /**
   * Go to a specific page number
   */
  async goToPage(pageNumber: number): Promise<void> {
    await this.page.locator(`button[aria-label="Page ${pageNumber}"]`).click();
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
   * Click on a player name in the table
   */
  async clickPlayerName(rowIndex: number): Promise<void> {
    const row = this.tableRows.nth(rowIndex);
    const playerLink = row.locator("a").first();
    await playerLink.click();
  }

  /**
   * Check if error is displayed
   */
  async checkErrorDisplayed(): Promise<void> {
    await expect(this.errorCard).toBeVisible();
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
   * Verify page title contains faction name
   */
  async checkPageTitleContainsFaction(faction: string): Promise<void> {
    const title = await this.pageTitle.innerText();
    expect(title.toLowerCase()).toContain(faction.toLowerCase());
  }
}
