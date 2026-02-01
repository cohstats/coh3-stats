import { test, expect } from "@playwright/test";
import { LeaderboardsPage } from "../page-objects";

test.describe("Leaderboards Page", () => {
  let leaderboardsPage: LeaderboardsPage;

  test.beforeEach(async ({ page }) => {
    leaderboardsPage = new LeaderboardsPage(page);
  });

  test.describe("Page Load and Basic Functionality", () => {
    test("should load leaderboards page with default parameters", async () => {
      await leaderboardsPage.navigate();
      await leaderboardsPage.checkPageLoaded();
      await leaderboardsPage.checkTableHasData();
      await leaderboardsPage.checkFooterPresent();
    });

    test("should load leaderboards page with race parameter", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.checkPageLoaded();
      await leaderboardsPage.checkTableHasData();
    });

    test("should load leaderboards for all factions", async () => {
      const factions: Array<"american" | "british" | "german" | "dak"> = [
        "american",
        "british",
        "german",
        "dak",
      ];

      for (const faction of factions) {
        await leaderboardsPage.navigate({ race: faction, type: "1v1" });
        await leaderboardsPage.checkPageLoaded();
        await leaderboardsPage.checkTableHasData();
        const rowCount = await leaderboardsPage.getRowCount();
        expect(rowCount).toBeGreaterThan(0);
      }
    });

    test("should display correct table columns", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      const expectedColumns = [
        "Rank",
        "ELO",
        "Tier",
        "Alias",
        "Streak",
        "Wins",
        "Losses",
        "Ratio",
        "Total",
        "Last Game",
      ];

      await leaderboardsPage.checkTableColumns(expectedColumns);
    });
  });

  test.describe("Filter Functionality", () => {
    test("should change game type filter", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      // Change to 2v2
      await leaderboardsPage.selectType("2 vs 2");
      await leaderboardsPage.checkTableHasData();

      // Verify URL updated
      expect(leaderboardsPage.page.url()).toContain("type=2v2");
    });

    test("should change region filter", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      // Change to a specific region (if available)
      await leaderboardsPage.selectRegion("Global");
      await leaderboardsPage.checkTableHasData();
    });
  });

  test.describe("Pagination", () => {
    test("should navigate to next page", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      const firstRowPage1 = await leaderboardsPage.getRowData(0);

      await leaderboardsPage.goToNextPage();
      await leaderboardsPage.waitForTableLoad();

      const firstRowPage2 = await leaderboardsPage.getRowData(0);

      // First row should be different on page 2
      expect(firstRowPage1.rank).not.toBe(firstRowPage2.rank);
    });

    test("should navigate to previous page", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1", start: 101 });
      await leaderboardsPage.waitForTableLoad();

      const isPreviousEnabled = await leaderboardsPage.isPreviousPageEnabled();
      expect(isPreviousEnabled).toBeTruthy();

      await leaderboardsPage.goToPreviousPage();
      await leaderboardsPage.checkTableHasData();
    });

    test("should disable previous button on first page", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      const isPreviousEnabled = await leaderboardsPage.isPreviousPageEnabled();
      expect(isPreviousEnabled).toBeFalsy();
    });
  });

  test.describe("Table Data and Interactions", () => {
    test("should display player data correctly", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      const rowData = await leaderboardsPage.getRowData(0);

      // Verify data structure
      expect(rowData.rank).toBeTruthy();
      expect(rowData.elo).toBeTruthy();
      expect(rowData.alias).toBeTruthy();
    });
  });

  test.describe("Game Types", () => {
    test("should load 1v1 leaderboards", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.checkTableHasData();
      expect(leaderboardsPage.page.url()).toContain("type=1v1");
    });

    test("should load 2v2 leaderboards", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "2v2" });
      await leaderboardsPage.checkTableHasData();
      expect(leaderboardsPage.page.url()).toContain("type=2v2");
    });

    test("should load 3v3 leaderboards", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "3v3" });
      await leaderboardsPage.checkTableHasData();
      expect(leaderboardsPage.page.url()).toContain("type=3v3");
    });

    test("should load 4v4 leaderboards", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "4v4" });
      await leaderboardsPage.checkTableHasData();
      expect(leaderboardsPage.page.url()).toContain("type=4v4");
    });
  });

  test.describe("SEO and Metadata", () => {
    test("should have correct page title", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      const title = await leaderboardsPage.getTitle();
      expect(title).toBeTruthy();
      expect(title.toLowerCase()).toContain("leaderboard");
    });

    test("should have meta description", async () => {
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.waitForTableLoad();

      const metaDescription = await leaderboardsPage.page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute("content");
      expect(content).toBeTruthy();
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.checkTableHasData();

      // Table should still be visible
      await expect(leaderboardsPage.leaderboardTable).toBeVisible();
    });

    test("should display correctly on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await leaderboardsPage.navigate({ race: "american", type: "1v1" });
      await leaderboardsPage.checkTableHasData();

      await expect(leaderboardsPage.leaderboardTable).toBeVisible();
    });
  });
});
