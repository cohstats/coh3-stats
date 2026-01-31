import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("Other Pages", () => {
  test("should load desktop app page", async ({ page }) => {
    await navigateAndWait(page, "/desktop-app");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load live games page", async ({ page }) => {
    await navigateAndWait(page, "/live-games");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load open data page", async ({ page }) => {
    await navigateAndWait(page, "/other/open-data");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load player export page", async ({ page }) => {
    await navigateAndWait(page, "/other/player-export");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load ranking tiers page", async ({ page }) => {
    await navigateAndWait(page, "/other/ranking-tiers");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load privacy policy page", async ({ page }) => {
    await navigateAndWait(page, "/legal/privacy");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should handle 404 page", async ({ page }) => {
    await page.goto("/non-existent-page");
    await page.waitForLoadState("networkidle");

    // Should show 404 page
    await expect(page.locator("text=404")).toBeVisible();
  });
});
