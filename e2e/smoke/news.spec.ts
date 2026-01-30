import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("News Page", () => {
  test("should load news page", async ({ page }) => {
    await navigateAndWait(page, "/news");
    await checkPageLoaded(page);
  });

  test("should display news content", async ({ page }) => {
    await navigateAndWait(page, "/news");
    
    // Check for main heading
    await expect(page.locator("h1, h2").first()).toBeVisible();
    
    // Check footer
    await checkFooterPresent(page);
  });
});

