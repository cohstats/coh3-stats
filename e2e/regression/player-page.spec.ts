import { test, expect } from "@playwright/test";
import { PlayerPage } from "../page-objects/player-page";
import { MISSING, PLAYER_TABS, TEST_PLAYER } from "../fixtures/test-data";

/**
 * Regression tests for the Player Profile page - `/players/[...playerID]`
 *
 * The most visited page of the site. Driven by a pinned, real profile from
 * `e2e/fixtures/test-data.ts` - see that file for how to refresh it.
 *
 * Replaces the previous `/players/1` "some heading is visible" test, which passed even when the
 * page failed to load any data at all.
 */

test.describe("Player Page - profile header", () => {
  let playerPage: PlayerPage;

  test.beforeEach(async ({ page }) => {
    playerPage = new PlayerPage(page);
    await playerPage.navigate();
  });

  test("should render the profile of the pinned player", async () => {
    await playerPage.checkPageLoaded();
    await expect(playerPage.playerCard).toBeVisible();
    await expect(playerPage.errorCard).not.toBeVisible();
    await expect(playerPage.playerName).toHaveText(TEST_PLAYER.alias);
    await expect(playerPage.playerAvatar).toBeVisible();
    await playerPage.checkFooterPresent();
  });

  test("should render the player summary with ELO and total games", async () => {
    await expect(playerPage.playerSummary).toBeVisible();
    // Best AXIS / ALLIES ELO plus the total games + win rate block.
    await expect(playerPage.playerSummary).toContainText(/AXIS/i);
    await expect(playerPage.playerSummary).toContainText(/ALLIES/i);
    await expect(playerPage.playerSummary).toContainText(/\d/);
  });

  test("should link to the Steam profile of the player", async ({ page }) => {
    const steamLink = page.locator('a[href*="steamcommunity.com"]').first();
    await expect(steamLink).toBeVisible();
    await expect(steamLink).toHaveAttribute("target", "_blank");
  });

  test("should rewrite the URL to include the player alias", async ({ page }) => {
    // `screens/players/index.tsx` replaces the URL with /players/<id>/<cleanAlias>.
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 10000 })
      .toBe(`/players/${TEST_PLAYER.profileId}/${TEST_PLAYER.cleanAlias}`);
  });

  test("should set the SEO title and description for the player", async ({ page }) => {
    await expect(page).toHaveTitle(new RegExp(TEST_PLAYER.alias));

    const description = page.locator('meta[name="description"]');
    await expect(description.first()).toHaveAttribute("content", new RegExp(TEST_PLAYER.alias));
  });
});

test.describe("Player Page - response headers", () => {
  // Outside the describe above on purpose: this one needs the navigation response itself, so it
  // must not pay for a second page load on top of a `beforeEach` navigation.
  test("should send the nofollow robots header", async ({ page }) => {
    // The route sets `x-robots-tag: nofollow` in `getServerSideProps` - player pages are live
    // user data and must not be crawled.
    const response = await page.goto(`/players/${TEST_PLAYER.profileId}`);
    expect(response?.headers()["x-robots-tag"]).toContain("nofollow");
  });
});

test.describe("Player Page - tabs", () => {
  test("should show every tab in the tab list", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate();

    await expect(playerPage.tabsList).toBeVisible();
    for (const view of PLAYER_TABS) {
      await expect(playerPage.tab(view)).toBeVisible();
    }
  });

  test("should default to the standings tab", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate();

    await expect(playerPage.standingsTab).toBeVisible();
    await expect(playerPage.tab("standings")).toHaveAttribute("data-active", "true");
  });

  test("should push ?view= into the URL when switching tabs", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate();

    await playerPage.switchToTab("nemesis");
    expect(page.url()).toContain("view=nemesis");
    await expect(playerPage.tab("nemesis")).toHaveAttribute("data-active", "true");
    await expect(playerPage.nemesisTab).toBeVisible();

    await playerPage.switchToTab("activity");
    expect(page.url()).toContain("view=activity");
    await expect(playerPage.activityTab).toBeVisible();
  });

  /**
   * Deep links are the links the rest of the site produces, so each `?view=` must render its
   * own tab content on a cold load - not just when clicked from the standings tab.
   */
  for (const view of PLAYER_TABS) {
    test(`should deep link into the ${view} tab`, async ({ page }) => {
      const playerPage = new PlayerPage(page);
      await playerPage.navigate(TEST_PLAYER.profileId, { view });

      await playerPage.checkPageLoaded();
      await expect(playerPage.tab(view)).toHaveAttribute("data-active", "true");
      await expect(playerPage.playerName).toHaveText(TEST_PLAYER.alias);
    });
  }
});

test.describe("Player Page - standings tab", () => {
  let playerPage: PlayerPage;

  test.beforeEach(async ({ page }) => {
    playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "standings" });
  });

  test("should render a standings table for all four factions", async () => {
    for (const faction of ["german", "american", "dak", "british"] as const) {
      await expect(playerPage.factionSection(faction)).toBeVisible();
      const table = playerPage.factionTable(faction);
      await expect(table).toBeVisible();
      // One row per game mode.
      await expect(table.locator("tbody tr")).toHaveCount(4);
      for (const mode of ["1v1", "2v2", "3v3", "4v4"]) {
        await expect(table).toContainText(mode);
      }
    }
  });

  test("should render the summary charts", async () => {
    await expect(playerPage.summaryCharts).toBeVisible();
    for (const testId of [
      "chart-factions-pie",
      "chart-faction-summary-sunburst",
      "chart-game-types-pie",
      "chart-activity-last-months",
    ]) {
      // Nivo renders client-side into an svg.
      await expect(playerPage.getByTestId(testId).locator("svg")).toBeVisible({
        timeout: 20000,
      });
    }
  });

  test("should render the side widgets", async () => {
    await expect(playerPage.countersWidget).toBeVisible();
    await expect(playerPage.mapsWidget).toBeVisible();
    await expect(playerPage.nemesisWidget).toBeVisible();
    await expect(playerPage.aliasHistoryWidget).toBeVisible();
  });

  test("should lazy-render the top teams section on scroll", async () => {
    await playerPage.scrollToTopTeams();
    await expect(playerPage.topTeamsInfo).toBeVisible({ timeout: 30000 });
  });

  test("should navigate to the detailed stats tab from a faction More button", async ({
    page,
  }) => {
    await playerPage.factionMoreButton("german").click();

    await page.waitForURL(/view=standingsDetails/);
    expect(page.url()).toContain("faction=german");
    await expect(playerPage.detailedStatsTab).toBeVisible();
  });
});

test.describe("Player Page - recent matches tab", () => {
  let playerPage: PlayerPage;

  test.beforeEach(async ({ page }) => {
    playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "recentMatches" });
    await playerPage.waitForRecentMatches();
  });

  test("should render match rows with players, map and mode", async () => {
    const rowCount = await playerPage.recentMatchesRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = playerPage.recentMatchesRows.first();
    // Result badge - on mobile it collapses to just the rating change.
    await expect(firstRow).toContainText(/VICTORY|DEFEAT|DE-SYNC|ERROR|[+-]\d+/);
    // Both team columns render player links.
    await expect(firstRow.locator('a[href*="/players/"]').first()).toBeVisible();
    // Duration in the mode column.
    await expect(firstRow).toContainText(/\d+:\d{2}/);
  });

  test("should render a replay button per match", async () => {
    await expect(playerPage.replayButtons.first()).toBeVisible();
    expect(await playerPage.replayButtons.count()).toBe(
      await playerPage.recentMatchesRows.count(),
    );
  });

  test("should open the match detail drawer from the Details button", async () => {
    await playerPage.openMatchDetails(0);

    // The drawer embeds the full match detail screen.
    await expect(playerPage.getByTestId("match-detail")).toBeVisible();
    await expect(playerPage.getByTestId("match-detail-title")).toContainText("Match Detail");

    const route = await playerPage.getDrawerMatchRoute();
    // `getMatchDetailRoute` percent-encodes the brackets via `encodeURI`.
    expect(route).toMatch(/^\/matches\/\d+\?profileIDs=(\[|%5B)/);
  });

  test("should open the match detail drawer by clicking the row", async ({ page }) => {
    // The row handler deliberately ignores clicks on links, buttons and images, so click the
    // mode / duration cell.
    await playerPage.recentMatchesRows.first().locator("td").nth(5).click();
    await expect(page.getByTestId("match-drawer-open-in-new-tab")).toBeVisible();
    await expect(page.getByTestId("match-detail")).toBeVisible();
  });

  test("should filter matches by result", async ({ page }) => {
    const before = await playerPage.recentMatchesRows.count();

    // The Result column header carries a filter popover.
    await playerPage.recentMatchesTable.getByText("Result", { exact: true }).click();
    await page.getByRole("checkbox", { name: "Defeat" }).click();
    // Close the popover.
    await page.keyboard.press("Escape");

    await expect
      .poll(() => playerPage.recentMatchesRows.count(), { timeout: 10000 })
      .toBeLessThan(before);
    for (const badge of await playerPage.recentMatchesTable
      .getByText(/VICTORY|DEFEAT/)
      .allTextContents()) {
      expect(badge).toContain("VICTORY");
    }
  });

  test("should show the flags switch and toggle it", async ({ page }) => {
    const flagSwitch = page.getByLabel("Show Player Flags");
    await expect(flagSwitch).toBeVisible();
    await flagSwitch.click();
    await expect(flagSwitch).toBeChecked();
  });
});

test.describe("Player Page - activity tab", () => {
  test("should render all three activity charts", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "activity" });

    await expect(playerPage.activityTab).toBeVisible();

    // The calendar uses Nivo's *Canvas* variant, the other two render svg.
    await expect(playerPage.activityCalendarChart.locator("canvas")).toBeVisible({
      timeout: 20000,
    });
    // Nivo sets an explicit role on its own svg - the containers also hold icon svgs.
    for (const chart of [playerPage.activityHourChart, playerPage.activityWeekDayChart]) {
      await expect(chart.locator('svg[role="img"]')).toBeVisible({ timeout: 20000 });
    }
  });

  test("should offer a timezone selector for the per-hour chart", async ({ page, isMobile }) => {
    // On a phone viewport the chart overlaps the select, so this interaction is desktop only.
    test.skip(!!isMobile, "Timezone select is not reachable on the mobile layout");

    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "activity" });

    const timezoneSelect = playerPage.activityHourChart.locator("input").first();
    await expect(timezoneSelect).toBeVisible();
    await timezoneSelect.click();
    await page.getByRole("option", { name: "GMT+00:00 (UTC)" }).click();
    await expect(timezoneSelect).toHaveValue("GMT+00:00 (UTC)");
  });
});

test.describe("Player Page - detailed stats tab", () => {
  test("should render the detailed stats for the selected faction and mode", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "standingsDetails" });

    await expect(playerPage.detailedStatsTab).toBeVisible();
    await expect(playerPage.detailedStatsTab).toContainText("Detailed Statistics for");
    await expect(playerPage.detailedStatsFactionSelect).toBeVisible();
    await expect(playerPage.detailedStatsGameTypeSelect).toBeVisible();
  });

  test("should sync the faction selector with the URL", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, {
      view: "standingsDetails",
      extraParams: { faction: "american", type: "2v2" },
    });

    await expect(playerPage.detailedStatsFactionSelect).toHaveValue("US Forces");
    await expect(playerPage.detailedStatsGameTypeSelect).toHaveValue("2 vs 2");

    await playerPage.detailedStatsFactionSelect.click();
    await page.getByRole("option", { name: "Wehrmacht" }).click();
    await page.waitForURL(/faction=german/);
    await expect(playerPage.detailedStatsFactionSelect).toHaveValue("Wehrmacht");
  });
});

test.describe("Player Page - nemesis, teams and replays tabs", () => {
  test("should render the nemesis tab", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "nemesis" });

    await expect(playerPage.nemesisTab).toBeVisible();
    await expect(playerPage.nemesisTab.locator("table").first()).toBeVisible();
  });

  test("should render the teams standings tab", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "teamsStandings" });

    await expect(playerPage.teamsStandingsTab).toBeVisible({ timeout: 30000 });
    await expect(playerPage.teamsStandingsTab).toContainText(/team/i);
  });

  test("should render the replays tab", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "replays" });

    // Replays come from COHDB and can legitimately be empty or unavailable, but the tab must
    // render either the table or a proper error card - never a blank panel.
    await expect(playerPage.replaysTable.or(playerPage.errorCard).first()).toBeVisible({
      timeout: 30000,
    });
  });
});

test.describe("Player Page - team details view", () => {
  /**
   * The `teamDetails` tab is commented out in `screens/players/index.tsx`, but the panel is still
   * mounted, so `?view=teamDetails` remains reachable from team links.
   */
  test("should still render the team details panel when deep linked", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "teamDetails" as never });

    await playerPage.checkPageLoaded();
    await expect(playerPage.playerName).toHaveText(TEST_PLAYER.alias);
    // No tab is highlighted, because the tab itself is hidden.
    await expect(playerPage.tabsList).toBeVisible();
    await expect(page).toHaveTitle(/Team Details/);
  });
});

test.describe("Player Page - error paths", () => {
  test("should render an error card for a nonexistent profile", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(MISSING.profileId);

    await expect(playerPage.errorCard).toBeVisible();
    await expect(playerPage.errorCard).toContainText(/error/i);
    // Not a blank page and not a crash.
    await expect(page.locator("text=Application error")).not.toBeVisible();
    await playerPage.checkFooterPresent();
  });

  test("should reject a non-numeric profile id with a 400 and an error card", async ({
    page,
  }) => {
    const response = await page.goto(`/players/${MISSING.invalidProfileId}`);
    expect(response?.status()).toBe(400);

    const playerPage = new PlayerPage(page);
    await expect(playerPage.errorCard).toBeVisible();
    await expect(playerPage.errorCard).toContainText(/error/i);
  });
});

test.describe("Player Page - mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("should render the profile and the tabs on a small viewport", async ({ page }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate();

    await playerPage.checkPageLoaded();
    await expect(playerPage.playerName).toHaveText(TEST_PLAYER.alias);
    await expect(playerPage.tabsList).toBeVisible();
    await expect(playerPage.standingsTab).toBeVisible();
  });
});
