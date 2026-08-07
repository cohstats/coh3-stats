import { test, expect } from "@playwright/test";
import { MISSING, TEST_MAP } from "../fixtures/test-data";

/**
 * Regression tests for the error and edge paths - §2.14 of the e2e coverage report.
 *
 * Two kinds of things are checked here:
 *  - **malformed input**: query params the app does not expect must be ignored, not crash the page;
 *  - **upstream failures**: when the API answers 5xx the page has to end up on the shared
 *    `error-card`, not on a blank body or a Next.js "Application error" screen.
 *
 * The per-page error paths that need the page's own fixtures (player profile, match detail, search)
 * live in their own specs; this one covers the pages that had none.
 */

/** Nothing on the page may have blown up. */
const expectNoAppCrash = async (page: import("@playwright/test").Page) => {
  await expect(page.locator("text=Application error")).not.toBeVisible();
  await expect(page.locator("header").first()).toBeVisible();
};

test.describe("Error paths - unknown routes", () => {
  test("should render the 404 page for an unknown route", async ({ page }) => {
    const response = await page.goto("/no-such-page-at-all");

    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toContainText("404");
    await expectNoAppCrash(page);
  });

  test("should render an empty faction page for an unknown faction", async ({ page }) => {
    const response = await page.goto("/explorer/races/no_such_faction");

    // Known gap (see the report §2.14): unlike `/explorer/maps/<id>`, this route does not validate
    // the `raceId`, so it answers `200` with an empty faction overview instead of a 404. Asserted
    // as it behaves today so a future fix shows up here.
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("Faction Overview");
    // There is nothing in it - a real faction lists its units.
    await expect(page.locator('a[href^="/explorer/races/no_such_faction/units/"]')).toHaveCount(
      0,
    );
    await expectNoAppCrash(page);
  });

  test("should 404 an unknown map", async ({ page }) => {
    const response = await page.goto(`/explorer/maps/${MISSING.mapId}`);

    expect(response?.status()).toBe(404);
    await expectNoAppCrash(page);
  });

  test("should 404 an unknown api route", async ({ request }) => {
    const response = await request.get("/api/noSuchRoute");

    expect(response.status()).toBe(404);
  });
});

test.describe("Error paths - malformed query parameters", () => {
  test("should ignore an unknown mode on the map explorer", async ({ page }) => {
    await page.goto("/explorer/maps?mode=not-a-mode&lobby=maybe");

    // Unknown modes are dropped, so the page falls back to "all multiplayer maps".
    await expect(page.locator('[data-testid^="map-card-"]').first()).toBeVisible();
    await expectNoAppCrash(page);
  });

  test("should ignore an unknown sort column on the maps table", async ({ page }) => {
    await page.goto("/explorer/maps-table?sort=not-a-column&dir=sideways");

    await expect(page.getByTestId("maps-table").locator("tbody tr").first()).toBeVisible();
    await expectNoAppCrash(page);
  });

  test("should show an error card for an unknown leaderboard faction and type", async ({
    page,
  }) => {
    await page.goto("/leaderboards?race=not-a-faction&type=9v9");

    // The values are passed straight to the API, which rejects them - the page renders the shared
    // error card instead of crashing or rendering an empty table.
    await expect(page.getByTestId("error-card").first()).toBeVisible({ timeout: 30000 });
    await expectNoAppCrash(page);
  });

  test("should handle an unknown live games type", async ({ page }) => {
    await page.goto("/live-games?type=not-a-type&order=sideways");

    await expectNoAppCrash(page);
    await expect(
      page.getByTestId("live-games-table").or(page.getByTestId("error-card")).first(),
    ).toBeVisible({ timeout: 60000 });
  });

  test("should handle a stats deep link pointing at a map that has no data", async ({ page }) => {
    await page.goto(`/stats/maps?mode=1v1&map=${MISSING.mapId}`);

    await expectNoAppCrash(page);
    // The selector falls back to the first map of the mode instead of rendering nothing.
    await expect(
      page
        .getByTestId("map-stats-map-select")
        .or(page.getByTestId("stats-no-data"))
        .or(page.getByTestId("error-card"))
        .first(),
    ).toBeVisible({ timeout: 60000 });
  });

  test("should handle an empty search query", async ({ page }) => {
    await page.goto("/search?q=");

    await expect(page.getByTestId("search-input")).toHaveValue("");
    await expectNoAppCrash(page);
  });
});

/**
 * Only the client side requests can be intercepted with `page.route` - the leaderboards, the player
 * profile and the match detail fetch their data in `getServerSideProps`, so their upstream-failure
 * paths are covered through invalid input instead (see above and the per-page specs).
 */
test.describe("Error paths - upstream API failures", () => {
  test("should show an error card when the live games summary fails", async ({ page }) => {
    await page.route(
      (url) => url.href.includes("/live/summary"),
      (route) => route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
    );

    await page.goto("/live-games");

    await expect(page.getByTestId("error-card").first()).toBeVisible({ timeout: 60000 });
    await expectNoAppCrash(page);
  });

  test("should show an error card when the stats analysis fails", async ({ page }) => {
    await page.route(
      (url) => url.href.includes("getAnalysisStatsHttp"),
      (route) => route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
    );

    await page.goto("/stats/games");

    await expect(page.getByTestId("error-card").first()).toBeVisible({ timeout: 60000 });
    await expectNoAppCrash(page);
  });

  test("should keep the map detail page working without the CDN minimap", async ({ page }) => {
    // The minimap is not on the CDN for every map - the page has to render regardless.
    await page.route(
      (url) => url.href.includes("cdn.coh3stats.com") && url.href.includes("/maps/"),
      (route) => route.abort(),
    );

    await page.goto(`/explorer/maps/${TEST_MAP.mapId}`);

    await expect(page.locator("h1").last()).toContainText(TEST_MAP.searchName);
    await expect(page.getByTestId(`map-minimap-${TEST_MAP.mapId}`)).toBeVisible();
    await expectNoAppCrash(page);
  });
});
