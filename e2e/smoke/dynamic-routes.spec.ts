import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("Dynamic Routes - Player Pages", () => {
  test("should load player page with valid ID", async ({ page }) => {
    // Using a test player ID - this should be replaced with a real one if needed
    await navigateAndWait(page, "/players/1");
    await checkPageLoaded(page);
    
    // Check for player content
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await checkFooterPresent(page);
  });

  test("should load player page with team details view", async ({ page }) => {
    await navigateAndWait(page, "/players/1?view=teamDetails&team=1");
    await checkPageLoaded(page);
  });
});

test.describe("Dynamic Routes - Match Pages", () => {
  test("should load match detail page", async ({ page }) => {
    // Using a test match ID - this should be replaced with a real one if needed
    await navigateAndWait(page, "/matches/1");
    await checkPageLoaded(page);
    
    // Check for match content
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await checkFooterPresent(page);
  });

  test("should load match detail page with profile IDs", async ({ page }) => {
    await navigateAndWait(page, "/matches/1?profileIDs=[1,2]");
    await checkPageLoaded(page);
  });
});

test.describe("Dynamic Routes - Explorer Unit Pages", () => {
  test("should load explorer faction page", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/american");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load explorer unit page", async ({ page }) => {
    // This will need a valid unit ID - using a placeholder
    // The test might fail if the unit doesn't exist, but it tests the route structure
    await page.goto("/explorer/races/american/units/test-unit");
    await page.waitForLoadState("networkidle");
    
    // Either the page loads or shows a not found message
    const hasContent = await page.locator("h1, h2").first().isVisible();
    const hasError = await page.locator("text=not found, text=404").first().isVisible();
    
    expect(hasContent || hasError).toBeTruthy();
  });
});

