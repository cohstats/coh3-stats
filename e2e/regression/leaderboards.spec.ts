import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("Leaderboards Page", () => {
  test("should load leaderboards page", async ({ page }) => {
    await navigateAndWait(page, "/leaderboards");
    await checkPageLoaded(page);
  });

  test("should display leaderboard content", async ({ page }) => {
    await navigateAndWait(page, "/leaderboards");

    // Check for leaderboard table or content
    await expect(page.locator("table, [role='table']").first()).toBeVisible({ timeout: 10000 });

    // Check footer
    await checkFooterPresent(page);
  });

  test("should load leaderboards with race parameter", async ({ page }) => {
    await navigateAndWait(page, "/leaderboards?race=american&type=1v1");
    await checkPageLoaded(page);

    // Check that content is displayed
    await expect(page.locator("table, [role='table']").first()).toBeVisible({ timeout: 10000 });
  });

  test("should load team leaderboards", async ({ page }) => {
    await navigateAndWait(page, "/leaderboards-teams");
    await checkPageLoaded(page);

    // Check for content
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
