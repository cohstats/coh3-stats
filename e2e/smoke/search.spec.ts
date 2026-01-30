import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("Search Page", () => {
  test("should load search page", async ({ page }) => {
    await navigateAndWait(page, "/search");
    await checkPageLoaded(page);
  });

  test("should display search interface", async ({ page }) => {
    await navigateAndWait(page, "/search");
    
    // Check for search input or content
    await expect(page.locator("input[type='search'], input[type='text']").first()).toBeVisible();
    
    // Check footer
    await checkFooterPresent(page);
  });

  test("should load search with query parameter", async ({ page }) => {
    await navigateAndWait(page, "/search?q=test");
    await checkPageLoaded(page);
  });
});

