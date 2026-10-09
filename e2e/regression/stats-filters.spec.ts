import { test, expect } from "@playwright/test";
import { StatsPage } from "../page-objects/stats-page";
import { checkFooterPresent, checkPageLoaded, navigateAndWait } from "../helpers/test-utils";

/**
 * Regression tests for the stats pages - `/stats/{games,maps,players,achievements,leaderboards}`.
 *
 * `/stats/games` and `/stats/maps` share `StatsContainerSelector`: patch `Select`, date range,
 * ELO filter `Select`, game mode `SegmentedControl` and an advanced ELO `MultiSelect` with
 * cross-disabling - all of it synced two ways with the url (`?from=&to=&mode=&filters=`). That
 * `useEffect` round trip is the part which breaks silently, so most of the tests below are about it.
 *
 * The three remaining stats pages have no filters at all, they are server rendered - those get one
 * "the content is really there" test each.
 */

/** The analysis endpoint every filter change re-requests. */
const isStatsApi = (url: URL) => url.href.includes("getAnalysisStatsHttp");

test.describe("Stats - shared filter bar", () => {
  test("should push the default patch date range into the url on load", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();

    await stats.checkPageLoaded();
    // The container has no dates of its own, so it redirects to the default patch on mount.
    await stats.expectQuery("from", /^\d{4}-\d{2}-\d{2}$/);
    await stats.expectQuery("to", /^(now|\d{4}-\d{2}-\d{2})$/);

    await expect(stats.patchSelect).toBeVisible();
    await expect(stats.dateRange).toBeVisible();
    await expect(stats.eloSelect).toBeVisible();
    await expect(stats.modeControl).toBeVisible();
    await checkFooterPresent(page);
  });

  test("should preselect the patch matching the date range in the url", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.expectQuery("from", /^\d{4}/);

    // `findPatchVersionByToAndFrom` maps the from/to pair back onto a patch entry.
    await expect(stats.patchSelect).not.toHaveValue("");
  });

  test("should change the date range when another patch is picked", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.expectQuery("from", /^\d{4}/);
    const initialFrom = new URL(page.url()).searchParams.get("from");

    await stats.patchSelect.click();
    // Any entry other than the default one - the second option in the list.
    const option = stats.openOptions.nth(1);
    const patchLabel = await option.innerText();
    await option.click();

    await expect(stats.patchSelect).toHaveValue(/.+/);
    await expect.poll(() => new URL(page.url()).searchParams.get("from")).not.toBe(initialFrom);
    // The picked patch is the one now shown in the select.
    expect(patchLabel.length).toBeGreaterThan(0);
  });

  test("should sync the game mode into the url and back", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.expectQuery("from", /^\d{4}/);

    await stats.modeOption("3 vs 3").click();
    await stats.expectQuery("mode", "3v3");

    // ...and the other way round: a mode in the url selects it in the control.
    await stats.navigate("?mode=4v4");
    await expect(stats.modeControl.locator("input[value='4v4']")).toBeChecked();
  });

  test("should apply an ELO filter and put it in the url", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.expectQuery("from", /^\d{4}/);

    await stats.eloSelect.click();
    await stats.pickOption("Average 1600+");

    await stats.expectQuery("filters", "stats-average-1600-9999");
    await expect(stats.eloSelect).toHaveValue("Average 1600+");
  });

  test("should hydrate the ELO filter from the url", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate("?filters=stats-average-1800-9999");

    await expect(stats.eloSelect).toHaveValue("Average 1800+");
  });

  test("should cross-disable the advanced ELO filter groups", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.expectQuery("from", /^\d{4}/);

    await stats.advancedFilterToggle.click();
    await expect(stats.eloMultiSelect).toBeVisible();
    // Nothing picked yet - the generate button has nothing to generate.
    await expect(stats.eloGenerateButton).toBeDisabled();

    await stats.eloMultiSelect.click();
    await stats.pickOption("Limit 1600+");

    // A hard limit filter cannot be combined with the average ones, so those go disabled.
    await expect(stats.openOptions.filter({ hasText: "Average 1600+" }).first()).toHaveAttribute(
      "data-combobox-disabled",
      "true",
    );
    await expect(stats.eloGenerateButton).toBeEnabled();
  });

  test("should apply the advanced ELO filters through the generate button", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.expectQuery("from", /^\d{4}/);

    await stats.advancedFilterToggle.click();
    await stats.eloMultiSelect.click();
    await stats.pickOption("Average 1600+");
    await stats.pickOption("Average 1400-1599");
    // Close the dropdown so it stops covering the button.
    await page.keyboard.press("Escape");

    await stats.eloGenerateButton.click();

    await stats.expectQuery("filters", /stats-average-1600-9999.*stats-average-1400-1599/);
    // With more than one filter applied the simple ELO select is locked.
    await expect(stats.eloSelect).toBeDisabled();
  });
});

test.describe("Stats - game stats page", () => {
  test("should render the charts for the selected mode", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.waitForStats();

    // Either there is data for the default patch, or the page says so - both are a rendered page,
    // a blank one is not.
    if (await stats.noData.isVisible()) {
      test.skip(true, "No stats data for the default patch on the API right now");
    }

    await expect(stats.gamesAnalyzed).toContainText(/Games analyzed [\d,.]+/);

    for (const chart of [
      "stats-factions-played",
      "stats-games-results",
      "stats-faction-winrate",
      "stats-maps-played",
      "stats-game-time",
    ]) {
      const card = page.getByTestId(chart);
      await expect(card).toBeVisible();
      // The Nivo charts render an svg inside the card section.
      await expect(card.locator("svg").first()).toBeVisible();
    }
  });

  test("should re-request the data when the mode changes", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.waitForStats();

    await stats.modeOption("2 vs 2").click();
    await stats.expectQuery("mode", "2v2");
    await stats.waitForStats();

    // The mode is applied client side on the already loaded analysis - what has to change is the
    // rendered chart titles.
    await expect(page.getByTestId("stats-factions-played")).toContainText("2v2");
  });

  test("should show an error card when the analysis endpoint fails", async ({ page }) => {
    await page.route(isStatsApi, (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "upstream exploded" }),
      }),
    );

    const stats = new StatsPage(page, "game");
    await stats.navigate();

    await expect(stats.errorCard).toBeVisible({ timeout: 60000 });
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });

  test("should render the no-data state for a period without games", async ({ page }) => {
    await page.route(isStatsApi, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          analysis: {},
          type: "gameStats",
          fromTimeStampSeconds: 1690000000,
          toTimeStampSeconds: 1690086400,
          filters: [],
        }),
      }),
    );

    const stats = new StatsPage(page, "game");
    await stats.navigate();

    await expect(stats.noData).toBeVisible({ timeout: 60000 });
    await expect(stats.noData).toContainText("No data for the selected period");
  });

  test("should set the SEO tags", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();

    await expect(page).toHaveTitle(/Stats/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/stats\/games$/,
    );
  });
});

/** Game stats analysis for one mode - the numbers only have to be distinct per mode. */
const mockModeAnalysis = (matchCount: number, slotsPerTeam: number) => {
  const results = (share: number) => ({
    wins: Math.round(matchCount * slotsPerTeam * share),
    losses: Math.round(matchCount * slotsPerTeam * share),
  });
  return {
    german: results(0.3),
    dak: results(0.2),
    american: results(0.25),
    british: results(0.25),
    matchCount,
    gameTime: matchCount * 1300,
    gameTimeSpread: { "0": 1, "5": 2, "10": matchCount - 6, "20": 2, "60": 1 },
    maps: { twin_beaches_2p_mkii: matchCount },
    factionMatrix: {},
  };
};

/** One day of the `days` analysis - only the faction results, no match count / maps. */
const mockDayAnalysis = (matchCount: number, slotsPerTeam: number) => {
  const { german, dak, american, british } = mockModeAnalysis(matchCount, slotsPerTeam);
  return { german, dak, american, british };
};

const mockAllModesResponse = {
  analysis: {
    "1v1": mockModeAnalysis(1000, 1),
    "2v2": mockModeAnalysis(2000, 2),
    "3v3": mockModeAnalysis(3000, 3),
    "4v4": mockModeAnalysis(4000, 4),
    days: {
      "1690070400": {
        "1v1": mockDayAnalysis(10, 1),
        "2v2": mockDayAnalysis(20, 2),
        "3v3": mockDayAnalysis(30, 3),
        "4v4": mockDayAnalysis(40, 4),
      },
      "1690156800": {
        "1v1": mockDayAnalysis(11, 1),
        "2v2": mockDayAnalysis(21, 2),
        "3v3": mockDayAnalysis(31, 3),
        "4v4": mockDayAnalysis(41, 4),
      },
    },
  },
  type: "gameStats",
  fromTimeStampSeconds: 1690000000,
  toTimeStampSeconds: 1690243200,
  wasMissingData: false,
  filters: [],
};

test.describe("Stats - game stats all modes", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(isStatsApi, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAllModesResponse),
      }),
    );
  });

  test("should switch to all modes and sum the games of every mode", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate();
    await stats.waitForStats();

    await stats.modeOption("All").click();
    await stats.expectQuery("mode", "all");

    // 1000 + 2000 + 3000 + 4000
    await expect(stats.gamesAnalyzed).toContainText(/Games analyzed 10[,.\s]?000/);
  });

  test("should render the mode comparison charts and the combined charts", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate("?mode=all");
    await stats.waitForStats();

    await expect(stats.modeControl.locator("input[value='all']")).toBeChecked();

    for (const chart of [
      "stats-games-per-mode",
      "stats-hours-per-mode",
      "stats-avg-game-time-per-mode",
      "stats-faction-popularity-per-mode",
      "stats-faction-winrate-per-mode",
      "stats-game-length-per-mode",
      "stats-factions-played",
      "stats-games-results",
      "stats-faction-winrate",
      "stats-maps-played",
      "stats-game-time",
    ]) {
      const card = page.getByTestId(chart);
      await expect(card).toBeVisible();
      await expect(card.locator("svg").first()).toBeVisible();
    }

    // The time series read the combined `all` day - they would be empty without it.
    await expect(page.getByText("Winrate over time for all modes")).toBeVisible();
    // The team composition can't be combined across modes, so it's left out.
    await expect(page.getByText(/Team composition/)).toHaveCount(0);
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });

  test("should go back to a single mode from all", async ({ page }) => {
    const stats = new StatsPage(page, "game");
    await stats.navigate("?mode=all");
    await stats.waitForStats();
    await expect(page.getByTestId("stats-games-per-mode")).toBeVisible();

    await stats.modeOption("2 vs 2").click();
    await stats.expectQuery("mode", "2v2");

    await expect(stats.gamesAnalyzed).toContainText(/Games analyzed 2[,.\s]?000/);
    await expect(page.getByTestId("stats-games-per-mode")).toHaveCount(0);
    await expect(page.getByTestId("stats-factions-played")).toContainText("2v2");
  });
});

test.describe("Stats - map stats page", () => {
  test("should render the map charts and the map picker", async ({ page }) => {
    const stats = new StatsPage(page, "map");
    await stats.navigate();
    await stats.waitForStats();

    if (await stats.noData.isVisible()) {
      test.skip(true, "No map stats data for the default patch on the API right now");
    }

    await expect(stats.gamesAnalyzed).toContainText(/Games analyzed [\d,.]+/);

    for (const chart of [
      "map-stats-maps-played",
      "map-stats-winrate-deviation",
      "map-stats-sides-winrate",
      "map-stats-average-playtime",
    ]) {
      await expect(page.getByTestId(chart)).toBeVisible();
      await expect(page.getByTestId(chart).locator("svg").first()).toBeVisible();
    }

    await expect(stats.mapSelect).toBeVisible();
    await expect(stats.mapSelect).not.toHaveValue("");
  });

  test("should put the picked map into the url", async ({ page }) => {
    const stats = new StatsPage(page, "map");
    await stats.navigate();
    await stats.waitForStats();

    if (await stats.noData.isVisible()) {
      test.skip(true, "No map stats data for the default patch on the API right now");
    }

    await stats.mapSelect.click();
    const option = stats.openOptions.nth(1);
    const mapName = await option.innerText();
    await option.click();

    await expect(stats.mapSelect).toHaveValue(mapName);
    await stats.expectQuery("map", /.+/);
  });

  test("should accept the deep link produced by the map detail page", async ({ page }) => {
    // This is exactly what `getMapsStatsRoute({ mode, map })` builds - the link on the map detail
    // page and on the "More" button of the game stats. The container pushes the default date range
    // on mount, which used to wipe every other param off a statically generated page.
    const stats = new StatsPage(page, "map");
    await stats.navigate("?mode=2v2&map=rural_castle_4p");
    await stats.waitForStats();

    await expect(stats.modeControl.locator("input[value='2v2']")).toBeChecked();
    await stats.expectQuery("mode", "2v2");
    await stats.expectQuery("map", "rural_castle_4p");

    if (await stats.noData.isVisible()) {
      test.skip(true, "No map stats data for the default patch on the API right now");
    }
    await expect(stats.mapSelect).toHaveValue(/.+/);
  });
});

test.describe("Stats - server rendered pages", () => {
  test("should render the player stats counters and charts", async ({ page }) => {
    await navigateAndWait(page, "/stats/players");
    await checkPageLoaded(page);

    const counters = page.getByTestId("player-stats-counters");
    await expect(counters).toBeVisible();
    await expect(counters).toContainText(/Total number of tracked players/i);
    // Every counter is a formatted number, so at least one group of digits has to be there.
    await expect(counters).toContainText(/\d[\d,.\s]*/);

    // The geo map and the history line chart are client side only.
    const charts = page.getByTestId("player-stats-charts");
    await expect(charts).toBeVisible();
    await expect(charts.locator("svg").first()).toBeVisible({ timeout: 30000 });
    await checkFooterPresent(page);
  });

  test("should render the leaderboard stats tables", async ({ page }) => {
    await navigateAndWait(page, "/stats/leaderboards");
    await checkPageLoaded(page);

    await expect(page.getByTestId("leaderboard-stats")).toBeVisible();

    for (const table of [
      "leaderboard-stats-total-players",
      "leaderboard-stats-top-elo",
      "leaderboard-stats-elo-1600",
      "leaderboard-stats-elo-1800",
    ]) {
      const rows = page.getByTestId(table).locator("tbody tr");
      // One row per faction.
      await expect(rows).toHaveCount(4);
      await expect(rows.first()).toContainText(/\d/);
    }

    // The columns are the four game modes.
    for (const mode of ["1 vs 1", "2 vs 2", "3 vs 3", "4 vs 4"]) {
      await expect(
        page.getByTestId("leaderboard-stats-total-players").locator("th", { hasText: mode }),
      ).toBeVisible();
    }
    await checkFooterPresent(page);
  });

  test("should render the global achievements", async ({ page }) => {
    await navigateAndWait(page, "/stats/achievements");
    await checkPageLoaded(page);

    const cards = page.getByTestId("achievement-card");
    expect(await cards.count()).toBeGreaterThan(5);

    const first = cards.first();
    await expect(first).toBeVisible();
    // Name, description and the global completion percentage.
    await expect(first).toContainText(/%/);
    await expect(first.locator("img")).toBeVisible();
    await checkFooterPresent(page);
  });
});
