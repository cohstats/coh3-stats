import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("Search Page", () => {
  test("should load search page", async ({ page }) => {
    await navigateAndWait(page, "/search");
    await checkPageLoaded(page);
  });

  test("should display search interface", async ({ page }) => {
    await navigateAndWait(page, "/search");

    // Check for search input - look for the main content input (not the one in header)
    // The search page input is in main content, not in the header/banner
    const searchInput = page
      .locator('main input[placeholder*="Players"], input[placeholder*="Players"]')
      .last();
    await expect(searchInput).toBeVisible();

    // Check footer
    await checkFooterPresent(page);
  });

  test("should load search with query parameter", async ({ page }) => {
    await navigateAndWait(page, "/search?q=test");
    await checkPageLoaded(page);
  });
});
