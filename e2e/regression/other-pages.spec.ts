import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

/**
 * The remaining static content pages - `/other/*` and `/legal/privacy`.
 *
 * This used to be six "the page loads" tests, three of which are now covered in depth elsewhere
 * (`desktop-app.spec.ts`, `live-games.spec.ts`) and the 404 by `error-paths.spec.ts`. What is left
 * are the pages nothing else touches, and they assert their actual content rather than just a
 * header.
 */

test.describe("Other pages", () => {
  test("should render the ranking tiers table", async ({ page }) => {
    await navigateAndWait(page, "/other/ranking-tiers");
    await checkPageLoaded(page);

    // One row per rank tier, each with its ELO range.
    const rows = page.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(5);
    await expect(page.locator("body")).toContainText(/Challenger|Gold|Silver|Bronze/i);
    await checkFooterPresent(page);
  });

  test("should render the open data page with its download links", async ({ page }) => {
    await navigateAndWait(page, "/other/open-data");
    await checkPageLoaded(page);

    await expect(page.locator("h1").last()).toContainText(/Open Data/i);
    // The page documents the public data endpoints - it is nothing but links and code samples.
    expect(await page.locator("a[href^='http']").count()).toBeGreaterThan(3);
    await checkFooterPresent(page);
  });

  test("should render the player export tool", async ({ page }) => {
    await navigateAndWait(page, "/other/player-export");
    await checkPageLoaded(page);

    await expect(page.locator("body")).toContainText(/export/i);
    await checkFooterPresent(page);
  });

  test("should render the Relic API documentation", async ({ page }) => {
    await navigateAndWait(page, "/other/relic-api");
    await checkPageLoaded(page);

    await expect(page.locator("body")).toContainText(/API/i);
    await checkFooterPresent(page);
  });

  test("should render the privacy policy", async ({ page }) => {
    await navigateAndWait(page, "/legal/privacy");
    await checkPageLoaded(page);

    await expect(page.locator("h1").last()).toContainText(/Privacy/i);
    await expect(page.locator("body")).toContainText(/cookies|data/i);
    await checkFooterPresent(page);
  });
});
