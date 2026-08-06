import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";
import { MISSING, TEST_UNIT } from "../fixtures/test-data";

/**
 * Regression tests for the dynamic explorer routes.
 *
 * The player (`/players/[...playerID]`) and match (`/matches/[matchId]`) routes used to be
 * "covered" here with nonexistent ids (`/players/1`, `/matches/1`) and an assertion that *some*
 * heading was visible - which passed even when the pages rendered nothing but an error card.
 * They now have real coverage in `player-page.spec.ts` and `match-detail.spec.ts`.
 */

test.describe("Dynamic Routes - Explorer faction pages", () => {
  // The faction pages render every unit of a faction and are the heaviest routes of the site.
  test.slow();

  for (const race of ["american", "german", "british", "dak"] as const) {
    test(`should load the ${race} faction page`, async ({ page }) => {
      await navigateAndWait(page, `/explorer/races/${race}`);
      await checkPageLoaded(page);

      // The faction page lists unit links into the unit detail pages. They live inside
      // collapsible sections, so assert they exist rather than that they are on screen.
      const unitLinks = page.locator(`a[href^="/explorer/races/${race}/units/"]`);
      expect(await unitLinks.count()).toBeGreaterThan(0);
      await checkFooterPresent(page);
    });
  }
});

test.describe("Dynamic Routes - Explorer unit pages", () => {
  test.slow();

  test("should load a real unit page", async ({ page }) => {
    await navigateAndWait(page, `/explorer/races/${TEST_UNIT.race}/units/${TEST_UNIT.unitId}`);
    await checkPageLoaded(page);

    await expect(page.getByRole("heading", { name: TEST_UNIT.name }).first()).toBeVisible();
    await checkFooterPresent(page);
  });

  test("should render the 404 page for a nonexistent unit", async ({ page }) => {
    await navigateAndWait(page, `/explorer/races/american/units/${MISSING.unitId}`);

    await expect(page.locator("body")).toContainText("404");
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });
});
