import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("About Page", () => {
  test("should load about page", async ({ page }) => {
    await navigateAndWait(page, "/about");
    await checkPageLoaded(page);
  });

  test("should display about content", async ({ page }) => {
    await navigateAndWait(page, "/about");
    
    // Check for main heading
    await expect(page.locator("h1, h2").first()).toBeVisible();
    
    // Check footer
    await checkFooterPresent(page);
  });
});

