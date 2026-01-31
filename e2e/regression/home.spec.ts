import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home-page";

test.describe("Home Page", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test("should load successfully", async () => {
    await homePage.checkPageLoaded();
    await homePage.checkFooterPresent();
  });

  test("should display main content", async () => {
    await homePage.checkMainSectionsVisible();
  });

  test("should have working navigation", async () => {
    await expect(homePage.header).toBeVisible();
    await expect(homePage.header).toContainText(/COH3 Stats/i);
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.navigate();
    await homePage.checkPageLoaded();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await homePage.navigate();
    await homePage.checkPageLoaded();
  });

  test("should display leaderboards with faction tabs", async () => {
    await expect(homePage.leaderboardsSection).toBeVisible();

    const tabs = homePage.leaderboardsTabs;
    const tabCount = await tabs.count();
    expect(tabCount).toBe(4);
  });

  test("should display info cards", async () => {
    await expect(homePage.dpsCalculatorCard).toBeVisible();
    await expect(homePage.unitBrowserCard).toBeVisible();
  });
});
