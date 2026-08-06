import { test, expect } from "@playwright/test";
import { MatchDetailPage } from "../page-objects/match-detail-page";
import { PlayerPage } from "../page-objects/player-page";
import { matchRoute, MISSING, TEST_MATCH, TEST_PLAYER } from "../fixtures/test-data";

/**
 * Regression tests for the Match Detail page - `/matches/[matchId]`
 *
 * Driven by a pinned, real match from `e2e/fixtures/test-data.ts`.
 *
 * Note: matches are stored per participating profile, so `/matches/<id>` on its own resolves to
 * "No match found" - the `?profileIDs=[...]` param that `getMatchDetailRoute` adds is what makes
 * the lookup succeed. Both paths are covered below.
 */

test.describe("Match Detail - pinned match", () => {
  let matchPage: MatchDetailPage;

  test.beforeEach(async ({ page }) => {
    matchPage = new MatchDetailPage(page);
    await matchPage.navigate();
    await matchPage.waitForSettled();
  });

  test("should render the match header with type, map and timings", async () => {
    await matchPage.checkPageLoaded();
    await expect(matchPage.matchDetail).toBeVisible();
    await expect(matchPage.notFoundMessage).not.toBeVisible();
    await expect(matchPage.errorCard).not.toBeVisible();

    await expect(matchPage.title).toContainText("Match Detail");
    await expect(matchPage.title).toContainText(TEST_MATCH.mapName);
    // Played-on date and duration.
    await expect(matchPage.matchDetail).toContainText(/Played on/);
    await expect(matchPage.matchDetail).toContainText(/For \d+:\d{2}/);
    await matchPage.checkFooterPresent();
  });

  test("should render both team rosters with one row per player", async () => {
    await expect(matchPage.axisTable).toBeVisible();
    await expect(matchPage.alliesTable).toBeVisible();

    await expect(matchPage.axisRows()).toHaveCount(TEST_MATCH.axisAliases.length);
    await expect(matchPage.alliesRows()).toHaveCount(TEST_MATCH.alliesAliases.length);

    for (const alias of TEST_MATCH.axisAliases) {
      await expect(matchPage.axisTable).toContainText(alias);
    }
    for (const alias of TEST_MATCH.alliesAliases) {
      await expect(matchPage.alliesTable).toContainText(alias);
    }
  });

  test("should show the result badge for each team", async () => {
    await expect(matchPage.axisTable).toContainText("DEFEAT");
    await expect(matchPage.alliesTable).toContainText("VICTORY");
  });

  test("should render the per-player stat columns with numbers", async () => {
    for (const column of ["Damage Dealt", "K / D", "Abilities Used", "Game Time"]) {
      await expect(matchPage.alliesTable).toContainText(column);
    }

    // Every roster row must carry numeric stats, not blanks.
    const rows = matchPage.alliesRows();
    for (let i = 0; i < (await rows.count()); i++) {
      await expect(rows.nth(i)).toContainText(/\d/);
    }
  });

  test("should link every player to their profile", async () => {
    const playerLinks = matchPage.matchDetail.locator('a[href*="/players/"]');
    const expectedPlayers = TEST_MATCH.axisAliases.length + TEST_MATCH.alliesAliases.length;
    expect(await playerLinks.count()).toBeGreaterThanOrEqual(expectedPlayers);

    const firstHref = await playerLinks.first().getAttribute("href");
    expect(firstHref).toMatch(/^\/players\/\d+/);
  });

  test("should render the map card and all four charts", async () => {
    await expect(matchPage.mapCard).toBeVisible();
    await expect(matchPage.mapCard.locator("img")).toBeVisible();

    for (const card of matchPage.chartCards) {
      await expect(card).toBeVisible();
      // Nivo pies are client-side only - each chart must actually draw an svg with slices.
      await expect(card.locator("svg")).toBeVisible({ timeout: 20000 });
      expect(await card.locator("svg path").count()).toBeGreaterThan(0);
    }
  });

  test("should offer a replay download for a match that has replays", async () => {
    await expect(matchPage.replayCard).toBeVisible();
    await expect(matchPage.replayButton).toBeVisible();
    await expect(matchPage.replayButton).toBeEnabled();
  });

  test("should set the SEO title and canonical for the match", async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      "href",
      new RegExp(`/matches/${TEST_MATCH.matchId}$`),
    );
  });
});

test.describe("Match Detail - profileIDs handling", () => {
  test("should resolve the match from the profileIDs query param", async ({ page }) => {
    const matchPage = new MatchDetailPage(page);
    // A single participating profile is enough for the lookup.
    await matchPage.navigate(TEST_MATCH.matchId, [TEST_MATCH.profileIds[0]]);
    await matchPage.waitForSettled();

    await expect(matchPage.matchDetail).toBeVisible();
    await expect(matchPage.title).toContainText(TEST_MATCH.mapName);
  });

  test("should handle a match URL without profileIDs", async ({ page }) => {
    const matchPage = new MatchDetailPage(page);
    await matchPage.navigate(TEST_MATCH.matchId, null);
    await matchPage.waitForSettled();

    // Matches are indexed per participating profile; whether a bare id resolves depends on
    // whether the match has already been persisted upstream. Either outcome is acceptable - what
    // must never happen is a crash or a raw error.
    await expect(matchPage.matchDetail.or(matchPage.notFoundMessage).first()).toBeVisible();
    await expect(matchPage.errorCard).not.toBeVisible();
    await expect(page.locator("text=Application error")).not.toBeVisible();
    await matchPage.checkPageLoaded();
  });

  test("should not break on a malformed profileIDs param", async ({ page }) => {
    const matchPage = new MatchDetailPage(page);
    await page.goto(`/matches/${TEST_MATCH.matchId}?profileIDs=not-json`);
    await matchPage.waitForSettled();

    // `match-root.tsx` logs the parse error and falls back to a lookup without profile ids.
    await expect(matchPage.notFoundMessage.or(matchPage.matchDetail).first()).toBeVisible();
    await matchPage.checkPageLoaded();
  });
});

test.describe("Match Detail - reached from the player page", () => {
  /**
   * This is the real user path, and it is also what keeps the suite honest if the pinned match
   * above ever ages out of the API.
   */
  test("should open the latest match of the pinned player", async ({ page, context }) => {
    const playerPage = new PlayerPage(page);
    await playerPage.navigate(TEST_PLAYER.profileId, { view: "recentMatches" });
    await playerPage.waitForRecentMatches();
    await playerPage.openMatchDetails(0);

    const route = await playerPage.getDrawerMatchRoute();
    // `getMatchDetailRoute` runs the URL through `encodeURI`, so the brackets arrive percent-encoded.
    expect(route).toMatch(/^\/matches\/\d+\?profileIDs=(\[|%5B)/);

    const matchPageTab = await context.newPage();
    const matchPage = new MatchDetailPage(matchPageTab);
    await matchPageTab.goto(route);
    await matchPage.waitForSettled();

    await expect(matchPage.matchDetail).toBeVisible();
    await expect(matchPage.title).toContainText("Match Detail");
    await expect(matchPage.axisTable.or(matchPage.alliesTable).first()).toBeVisible();
    await matchPageTab.close();
  });
});

test.describe("Match Detail - error paths", () => {
  test("should show the empty state for a nonexistent match id", async ({ page }) => {
    const matchPage = new MatchDetailPage(page);
    await matchPage.navigate(MISSING.matchId, null);
    await matchPage.waitForSettled();

    await expect(matchPage.notFoundMessage).toBeVisible();
    await expect(matchPage.matchDetail).not.toBeVisible();
    await matchPage.checkPageLoaded();
    await matchPage.checkFooterPresent();
  });

  test("should show an error card for a match id the API rejects", async ({ page }) => {
    const matchPage = new MatchDetailPage(page);
    await matchPage.navigate(MISSING.invalidMatchId, null);
    await matchPage.waitForSettled();

    // The API answers 400 for ids like this, which `getMatch` surfaces as a generic error.
    await expect(matchPage.errorCard).toBeVisible();
    await expect(matchPage.matchDetail).not.toBeVisible();
    await matchPage.checkPageLoaded();
  });

  test("should show an error card when the match API fails", async ({ page }) => {
    await page.route("**/sharedAPIGen2Http/matches/**", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "upstream exploded" }),
      }),
    );

    const matchPage = new MatchDetailPage(page);
    await matchPage.navigate();
    await matchPage.waitForSettled();

    await expect(matchPage.errorCard).toBeVisible();
    await expect(matchPage.errorCard).toContainText(/error/i);
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });
});

test.describe("Match Detail - mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("should render the match on a small viewport", async ({ page }) => {
    const matchPage = new MatchDetailPage(page);
    await page.goto(matchRoute());
    await matchPage.waitForSettled();

    await expect(matchPage.matchDetail).toBeVisible();
    await expect(matchPage.title).toContainText("Match Detail");
    await expect(matchPage.axisTable).toBeVisible();
    await expect(matchPage.alliesTable).toBeVisible();
  });
});
