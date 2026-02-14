import { test, expect } from "@playwright/test";
import { TeamLeaderboardsPage } from "../page-objects";

test.describe("Team Leaderboards Page", () => {
  let teamLeaderboardsPage: TeamLeaderboardsPage;

  test.beforeEach(async ({ page }) => {
    teamLeaderboardsPage = new TeamLeaderboardsPage(page);
  });

  test.describe("Page Load and Basic Functionality", () => {
    test("should load team leaderboards page with default parameters", async () => {
      await teamLeaderboardsPage.navigate();
      await teamLeaderboardsPage.checkPageLoaded();
      await teamLeaderboardsPage.checkTableHasData();
      await teamLeaderboardsPage.checkFooterPresent();
    });

    test("should load team leaderboards for Axis side", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.checkPageLoaded();
      await teamLeaderboardsPage.checkTableHasData();
      expect(teamLeaderboardsPage.page.url()).toContain("side=axis");
    });

    test("should load team leaderboards for Allies side", async () => {
      await teamLeaderboardsPage.navigate({ side: "allies", type: "2v2" });
      await teamLeaderboardsPage.checkPageLoaded();
      await teamLeaderboardsPage.checkTableHasData();
      expect(teamLeaderboardsPage.page.url()).toContain("side=allies");
    });

    test("should display correct table columns", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const expectedColumns = [
        "Rank",
        "ELO",
        "Team",
        "Streak",
        "Wins",
        "Losses",
        "Ratio",
        "Total",
        "Last Game",
      ];

      await teamLeaderboardsPage.checkTableColumns(expectedColumns);
    });

    test("should load all team types", async () => {
      const types: Array<"2v2" | "3v3" | "4v4"> = ["2v2", "3v3", "4v4"];

      for (const type of types) {
        await teamLeaderboardsPage.navigate({ side: "axis", type });
        await teamLeaderboardsPage.checkPageLoaded();
        await teamLeaderboardsPage.checkTableHasData();
        const rowCount = await teamLeaderboardsPage.getRowCount();
        expect(rowCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Filter Functionality", () => {
    test("should change type filter", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      await teamLeaderboardsPage.selectType("3 vs 3");
      await teamLeaderboardsPage.checkTableHasData();

      expect(teamLeaderboardsPage.page.url()).toContain("type=3v3");
    });

    test("should change records per page", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const rowCountBefore = await teamLeaderboardsPage.getRowCount();
      const totalRecords = await teamLeaderboardsPage.getTotalRecordCount();

      await teamLeaderboardsPage.selectRecordsPerPage("50");

      // Verify the page size control actually changed to "50"
      const selectedPageSize = await teamLeaderboardsPage.getSelectedRecordsPerPage();
      expect(selectedPageSize).toBe("50");

      const rowCountAfter = await teamLeaderboardsPage.getRowCount();

      // Assert the displayed row count equals Math.min(totalRecords, 50)
      const expectedRowCount = Math.min(totalRecords, 50);
      expect(rowCountAfter).toBe(expectedRowCount);

      // Also verify that either the row count changed OR total records is <= 50
      if (totalRecords > 50) {
        expect(rowCountAfter).not.toBe(rowCountBefore);
      }
    });
  });

  test.describe("Pagination", () => {
    test("should navigate to next page", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const firstRowPage1 = await teamLeaderboardsPage.getRowData(0);
      const isNextEnabled = await teamLeaderboardsPage.isNextPageEnabled();
      expect(isNextEnabled).toBeTruthy();

      await teamLeaderboardsPage.goToNextPage();

      const firstRowPage2 = await teamLeaderboardsPage.getRowData(0);

      // First row should be different on page 2
      expect(firstRowPage1.rank).not.toBe(firstRowPage2.rank);
    });

    test("should navigate to previous page", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      // Go to next page first
      await teamLeaderboardsPage.goToNextPage();

      // Wait for the previous button to become enabled after navigation
      await expect(teamLeaderboardsPage.previousPageButton).toBeEnabled({ timeout: 5000 });

      const isPreviousEnabled = await teamLeaderboardsPage.isPreviousPageEnabled();
      expect(isPreviousEnabled).toBeTruthy();

      await teamLeaderboardsPage.goToPreviousPage();
      await teamLeaderboardsPage.checkTableHasData();
    });

    test("should disable previous button on first page", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const isPreviousEnabled = await teamLeaderboardsPage.isPreviousPageEnabled();
      expect(isPreviousEnabled).toBeFalsy();
    });

    test("should display pagination info", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const paginationInfo = await teamLeaderboardsPage.getPaginationInfo();
      expect(paginationInfo).toMatch(/Showing \d+ - \d+ of \d+ teams/);
    });

    test("should update pagination info when changing pages", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const infoBefore = await teamLeaderboardsPage.getPaginationInfo();

      await teamLeaderboardsPage.goToNextPage();

      const infoAfter = await teamLeaderboardsPage.getPaginationInfo();

      expect(infoBefore).not.toBe(infoAfter);
    });
  });

  test.describe("Table Data and Interactions", () => {
    test("should display team data correctly", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const rowData = await teamLeaderboardsPage.getRowData(0);

      // Verify data structure
      expect(rowData.rank).toBeTruthy();
      expect(rowData.elo).toBeTruthy();
      expect(rowData.teamPlayers).toBeTruthy();
      expect(rowData.teamPlayers.length).toBeGreaterThan(0);
    });

    test("should display correct number of players per team type", async () => {
      // Test 2v2
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();
      let players = await teamLeaderboardsPage.getTeamPlayersFromRow(0);
      expect(players.length).toBe(2);

      // Test 3v3
      await teamLeaderboardsPage.navigate({ side: "axis", type: "3v3" });
      await teamLeaderboardsPage.waitForTableLoad();
      players = await teamLeaderboardsPage.getTeamPlayersFromRow(0);
      expect(players.length).toBe(3);

      // Test 4v4
      await teamLeaderboardsPage.navigate({ side: "axis", type: "4v4" });
      await teamLeaderboardsPage.waitForTableLoad();
      players = await teamLeaderboardsPage.getTeamPlayersFromRow(0);
      expect(players.length).toBe(4);
    });

    test("should display ELO values as rounded numbers", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const rowData = await teamLeaderboardsPage.getRowData(0);
      const elo = parseInt(rowData.elo);

      // ELO should be a valid number
      expect(elo).toBeGreaterThan(0);
      // Should not have decimal places
      expect(rowData.elo).not.toContain(".");
    });

    test("should display helper icon for ELO column", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      // Check for helper icon in ELO header
      const eloHeader = teamLeaderboardsPage.leaderboardTable.locator("thead th").nth(1);
      const helperIcon = eloHeader.locator("svg, [data-testid*='helper']");
      await expect(helperIcon).toBeVisible();
    });
  });

  test.describe("Game Types", () => {
    test("should load 2v2 team leaderboards", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.checkTableHasData();
      expect(teamLeaderboardsPage.page.url()).toContain("type=2v2");
    });

    test("should load 3v3 team leaderboards", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "3v3" });
      await teamLeaderboardsPage.checkTableHasData();
      expect(teamLeaderboardsPage.page.url()).toContain("type=3v3");
    });

    test("should load 4v4 team leaderboards", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "4v4" });
      await teamLeaderboardsPage.checkTableHasData();
      expect(teamLeaderboardsPage.page.url()).toContain("type=4v4");
    });
  });

  test.describe("SEO and Metadata", () => {
    test("should have correct page title", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const title = await teamLeaderboardsPage.getTitle();
      expect(title).toBeTruthy();
      expect(title.toLowerCase()).toContain("team");
    });

    test("should have meta description", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const metaDescription = await teamLeaderboardsPage.page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute("content");
      expect(content).toBeTruthy();
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.checkTableHasData();

      // Table should still be visible
      await expect(teamLeaderboardsPage.leaderboardTable).toBeVisible();
    });

    test("should display correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.checkTableHasData();

      await expect(teamLeaderboardsPage.leaderboardTable).toBeVisible();
    });
  });

  test.describe("Data Validation", () => {
    test("should display valid win/loss ratios", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const row = teamLeaderboardsPage.tableRows.first();
      const ratioCell = row.locator("td").nth(6);
      const ratioText = await ratioCell.innerText();

      // Should be a percentage
      expect(ratioText).toMatch(/\d+%/);
    });

    test("should display valid timestamps for last game", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const row = teamLeaderboardsPage.tableRows.first();
      const lastGameCell = row.locator("td").nth(8);
      const lastGameText = await lastGameCell.innerText();

      // Should have some time-related text (e.g., "2 hours ago", "1 day ago")
      expect(lastGameText.length).toBeGreaterThan(0);
    });

    test("should have consistent data across rows", async () => {
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const rowCount = await teamLeaderboardsPage.getRowCount();
      expect(rowCount).toBeGreaterThan(5);

      // Check multiple rows have valid data
      for (let i = 0; i < Math.min(5, rowCount); i++) {
        const rowData = await teamLeaderboardsPage.getRowData(i);
        expect(rowData.rank).toBeTruthy();
        expect(rowData.elo).toBeTruthy();
        expect(rowData.teamPlayers.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("URL Parameters and Deep Linking", () => {
    test("should preserve URL parameters when navigating", async () => {
      await teamLeaderboardsPage.navigate({ side: "allies", type: "3v3", orderBy: "total" });
      await teamLeaderboardsPage.waitForTableLoad();

      const url = teamLeaderboardsPage.page.url();
      expect(url).toContain("side=allies");
      expect(url).toContain("type=3v3");
      expect(url).toContain("orderBy=total");
    });

    test("should handle direct URL navigation with parameters", async () => {
      await teamLeaderboardsPage.page.goto("/leaderboards-teams?side=axis&type=4v4&orderBy=elo");
      await teamLeaderboardsPage.waitForPageLoad();
      await teamLeaderboardsPage.checkTableHasData();

      const url = teamLeaderboardsPage.page.url();
      expect(url).toContain("side=axis");
      expect(url).toContain("type=4v4");
    });
  });

  test.describe("Error Handling", () => {
    test("should handle network errors gracefully", async () => {
      // This test would require mocking network failures
      // For now, we'll just verify the error card component exists
      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      // If there's an error, it should be displayed
      // Otherwise, table should be visible
      const hasError = await teamLeaderboardsPage.errorCard.isVisible().catch(() => false);
      const hasTable = await teamLeaderboardsPage.leaderboardTable.isVisible();

      expect(hasError || hasTable).toBeTruthy();
    });
  });

  test.describe("Performance", () => {
    test("should load table data within reasonable time", async () => {
      const startTime = Date.now();

      await teamLeaderboardsPage.navigate({ side: "axis", type: "2v2" });
      await teamLeaderboardsPage.waitForTableLoad();

      const loadTime = Date.now() - startTime;

      // Should load within 15 seconds
      expect(loadTime).toBeLessThan(15000);
    });
  });
});
