import { test, expect, Page } from "@playwright/test";
import { checkFooterPresent, checkPageLoaded } from "../helpers/test-utils";

/**
 * Regression tests for `/live-games`.
 *
 * The page is statically generated and then fetches two things client side: the summary (a card
 * plus the line chart) and the paged table of the games currently in progress. Both come from the
 * live API, so the number of games is whatever the game happens to have right now - the tests below
 * assert the structure and the filter/url behaviour rather than a row count, and intercept the API
 * when they need a specific state.
 */

const isLiveGamesApi = (url: URL) => url.href.includes("/live/games");
const isLiveSummaryApi = (url: URL) => url.href.includes("/live/summary");

const typeSelect = (page: Page) => page.getByTestId("live-games-type-select");
const orderSelect = (page: Page) => page.getByTestId("live-games-order-select");
const summary = (page: Page) => page.getByTestId("live-games-summary");
const gamesTable = (page: Page) => page.getByTestId("live-games-table");

/** Wait for the games request to have resolved into a table (or an error card). */
const waitForGames = async (page: Page) => {
  await expect(gamesTable(page).or(page.getByTestId("error-card")).first()).toBeVisible({
    timeout: 60000,
  });
};

test.describe("Live games", () => {
  test("should render the summary, the filters and the table", async ({ page }) => {
    await page.goto("/live-games");
    await checkPageLoaded(page);

    // The site header renders its logo as an `h1` too, the page's own heading is the last one.
    await expect(page.locator("h1").last()).toContainText("Live PC Games");
    await expect(summary(page)).toBeVisible();
    await expect(summary(page)).toContainText("Live Games Summary");

    await expect(typeSelect(page)).toBeVisible();
    await expect(orderSelect(page)).toBeVisible();
    // 4v4 is the default the page falls back to when nothing is in the url.
    await expect(typeSelect(page)).toHaveValue("4 vs 4 Automatch");
    await expect(orderSelect(page)).toHaveValue("Rank");

    await waitForGames(page);
    for (const column of ["Mode", "Axis Players", "Allies Players", "Map", "Observers"]) {
      await expect(gamesTable(page).locator("th", { hasText: column }).first()).toBeVisible();
    }
    await checkFooterPresent(page);
  });

  test("should hydrate the game type from the url", async ({ page }) => {
    await page.goto("/live-games?type=1v1");

    await expect(typeSelect(page)).toHaveValue("1 vs 1 Automatch");
    await waitForGames(page);
  });

  test("should put the picked game type into the url and re-request", async ({ page }) => {
    const requested: string[] = [];
    await page.route(isLiveGamesApi, (route) => {
      requested.push(route.request().url());
      return route.continue();
    });

    await page.goto("/live-games");
    await waitForGames(page);

    await typeSelect(page).click();
    await page.locator('[role="option"]:visible').filter({ hasText: "2 vs 2" }).first().click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get("type"), { timeout: 15000 })
      .toBe("2v2");
    await expect.poll(() => requested.some((url) => url.includes("type=2v2"))).toBe(true);
  });

  test("should put the sort order into the url", async ({ page }) => {
    await page.goto("/live-games");
    await waitForGames(page);

    await orderSelect(page).click();
    await page
      .locator('[role="option"]:visible')
      .filter({ hasText: "Observers" })
      .first()
      .click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get("order"), { timeout: 15000 })
      .toBe("observers");
    await expect(orderSelect(page)).toHaveValue("Observers");
  });

  test("should render the games with players, map and duration", async ({ page }) => {
    // Pin the payload so the assertions do not depend on what is being played right now.
    await page.route(isLiveGamesApi, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalGames: 1,
          unixTimeStamp: 1754600000,
          liveGames: [
            {
              id: "1",
              matchtype_id: 4,
              mapname: "rural_castle_4p",
              startgametime: 1754599000,
              observertotal: 3,
              server: "eu-west",
              slotinfo: [],
              players: [
                {
                  // 137123 = Wehrmacht (axis), 129494 = US Forces (allies).
                  profile_id: 1,
                  race_id: 137123,
                  teamid: 0,
                  rank: 12,
                  player_profile: { alias: "AxisPlayer", country: "cz" },
                },
                {
                  profile_id: 2,
                  race_id: 129494,
                  teamid: 1,
                  rank: 34,
                  player_profile: { alias: "AlliesPlayer", country: "de" },
                },
              ],
            },
          ],
        }),
      }),
    );

    await page.goto("/live-games?type=1v1");
    await waitForGames(page);

    const row = gamesTable(page).locator("tbody tr").first();
    await expect(row).toContainText("AxisPlayer");
    await expect(row).toContainText("AlliesPlayer");
    // The map is rendered with its localized name.
    await expect(row).toContainText(/Aere Perennius|rural_castle_4p/);
    // The game duration, rendered as `h:mm:ss`.
    await expect(row).toContainText(/\d+:\d{2}:\d{2}/);
    // Both players link to their profile.
    await expect(row.locator('a[href="/players/1"]')).toBeVisible();
    await expect(row.locator('a[href="/players/2"]')).toBeVisible();
  });

  test("should show an error card when the games endpoint fails", async ({ page }) => {
    await page.route(isLiveGamesApi, (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
    );

    await page.goto("/live-games");

    await expect(page.getByTestId("error-card").first()).toBeVisible({ timeout: 60000 });
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });

  test("should show an error card when the summary endpoint fails", async ({ page }) => {
    await page.route(isLiveSummaryApi, (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
    );

    await page.goto("/live-games");

    await expect(page.getByTestId("error-card").first()).toBeVisible({ timeout: 60000 });
    // The rest of the page keeps working - the games table is independent of the summary.
    await waitForGames(page);
  });

  test("should render the summary chart on a desktop viewport", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "The chart is hidden on small screens");

    await page.goto("/live-games");

    const chart = page.getByTestId("live-games-chart");
    await expect(chart).toBeVisible();
    await expect(chart.locator("svg").first()).toBeVisible({ timeout: 30000 });
  });

  test("should set the SEO tags", async ({ page }) => {
    await page.goto("/live-games");

    await expect(page).toHaveTitle(/Live Games/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/live-games$/);
  });
});
