import { test, expect } from "@playwright/test";
import { SearchPage } from "../page-objects/search-page";
import { TEST_MAP, TEST_PLAYER, TEST_UNIT } from "../fixtures/test-data";

/**
 * Regression tests for the Search page - `/search`
 *
 * Players are fetched from the COH3 Stats API, units and maps are filtered locally out of
 * `screens/search/units-search-data.json` and `maps-search-data.json`.
 */

test.describe("Search Page - interface", () => {
  test("should load with a search input", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    await searchPage.checkPageLoaded();
    await expect(searchPage.searchInput).toBeVisible();
    await expect(searchPage.searchInput).toHaveValue("");
    await searchPage.checkFooterPresent();
  });

  test("should not show any result section before a query is typed", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    await expect(searchPage.playersResults).not.toBeVisible();
    await expect(searchPage.unitsResults).not.toBeVisible();
    await expect(searchPage.mapsResults).not.toBeVisible();
  });

  test("should not search for a single character", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    await searchPage.searchInput.fill("a");
    // Give the 700ms debounce a chance to fire.
    await page.waitForTimeout(1500);
    await expect(searchPage.playersResults).not.toBeVisible();
    await expect(searchPage.unitsResults).not.toBeVisible();
  });

  test("should set the SEO title and keep the page out of the index", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();

    await expect(page).toHaveTitle(/Search/i);
    // The page emits two robots tags - NextSeo's default `index,follow` plus the page's own
    // `nofollow` override - so assert that the nofollow one is present rather than picking an
    // arbitrary index.
    await expect(page.locator('meta[name="robots"][content*="nofollow"]')).toHaveCount(1);
  });
});

test.describe("Search Page - ?q= hydration", () => {
  test("should run the search from the query parameter on load", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_PLAYER.alias);

    await expect(searchPage.searchInput).toHaveValue(TEST_PLAYER.alias);
    await expect(searchPage.playersResults).toBeVisible({ timeout: 30000 });
    await expect(searchPage.unitsResults).toBeVisible();
    await expect(searchPage.mapsResults).toBeVisible();
  });

  test("should render all three sections for a query", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_PLAYER.alias);
    await expect(searchPage.playersResults).toBeVisible({ timeout: 30000 });

    for (const section of ["Players", "Units", "Maps"] as const) {
      await expect(searchPage.sectionDivider(section).first()).toBeVisible();
    }
  });
});

test.describe("Search Page - player results", () => {
  // The API answers with a capped list of the *recently active* profiles matching the alias, so
  // no single profile is guaranteed to be in it - a pinned id silently drops out of the response
  // once the player stops playing. These tests therefore assert on the first returned card.
  test("should find players matching the query and link to their profile", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_PLAYER.alias);
    await expect(searchPage.playersResults).toBeVisible({ timeout: 30000 });

    const card = searchPage.playerCards.first();
    await expect(card).toBeVisible();
    // Every returned alias contains the query (the API matches on a substring of the alias).
    await expect(card).toContainText(new RegExp(TEST_PLAYER.alias, "i"));
    // Last-active line.
    await expect(card).toContainText(/Last active/i);

    const profileId = await searchPage.profileIdOfCard(card);
    const link = page.locator(`a[href="/players/${profileId}"]`).first();
    await expect(link).toBeVisible();
  });

  test("should navigate to the player profile from a result card", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_PLAYER.alias);
    await expect(searchPage.playersResults).toBeVisible({ timeout: 30000 });

    const card = searchPage.playerCards.first();
    await expect(card).toBeVisible();
    const profileId = await searchPage.profileIdOfCard(card);

    await card.click();
    // The page rewrites the URL to `/players/<id>/<cleanAlias>` once it has the player data, so
    // anchor the id to a `/`, a query string or the end - `/players/1610` must not match
    // `/players/16100`.
    await page.waitForURL(new RegExp(`/players/${profileId}([/?]|$)`));
    // The card truncates long aliases, so assert on the query the API matched rather than on the
    // exact text of the card.
    await expect(page.getByTestId("player-name")).toContainText(
      new RegExp(TEST_PLAYER.alias, "i"),
    );
  });

  test("should show the no-players-found state for a nonsense query", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate("zzzqqqxxxnosuchplayer");

    await expect(searchPage.noPlayersFound).toBeVisible({ timeout: 30000 });
    await expect(searchPage.noPlayersFound).toContainText("No players found");
    await expect(searchPage.noUnitsFound).toBeVisible();
    await expect(searchPage.noMapsFound).toBeVisible();
  });

  test("should show an error card when the player search API fails", async ({ page }) => {
    await page.route("**/sharedAPIGen2Http/search/players", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "upstream exploded" }),
      }),
    );

    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_PLAYER.alias);

    await expect(searchPage.errorCard).toBeVisible({ timeout: 30000 });
    await expect(page.locator("text=Application error")).not.toBeVisible();
  });
});

test.describe("Search Page - unit results", () => {
  test("should find units by name and link to the explorer", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_UNIT.name);

    await expect(searchPage.unitsResults).toBeVisible({ timeout: 30000 });
    expect(await searchPage.unitCards.count()).toBeGreaterThan(0);

    const card = searchPage.unitCard(TEST_UNIT.unitId);
    await expect(card).toBeVisible();
    await expect(card).toContainText(TEST_UNIT.name);

    const link = page
      .locator(`a[href="/explorer/races/${TEST_UNIT.race}/units/${TEST_UNIT.unitId}"]`)
      .first();
    await expect(link).toBeVisible();
  });

  test("should navigate to the unit detail page from a result card", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_UNIT.name);
    await expect(searchPage.unitCard(TEST_UNIT.unitId)).toBeVisible({ timeout: 30000 });

    await searchPage.unitCard(TEST_UNIT.unitId).click();
    await page.waitForURL(new RegExp(`/explorer/races/${TEST_UNIT.race}/units/`));
    await searchPage.checkPageLoaded();
  });

  test("should show the units empty state with the English-only hint", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate("zzzqqqxxxnosuchunit");

    await expect(searchPage.noUnitsFound).toBeVisible({ timeout: 30000 });
    await expect(searchPage.noUnitsFound).toContainText("No Units Found");
    await expect(searchPage.noUnitsFound).toContainText("English");
  });
});

test.describe("Search Page - map results", () => {
  test("should find maps by name and link to the map detail page", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_MAP.searchName);

    await expect(searchPage.mapsResults).toBeVisible({ timeout: 30000 });
    const card = searchPage.mapCard(TEST_MAP.mapId);
    await expect(card).toBeVisible();
    await expect(card).toContainText(TEST_MAP.searchName);

    const link = page.locator(`a[href*="/explorer/maps/${TEST_MAP.mapId}"]`).first();
    await expect(link).toBeVisible();
  });

  test("should find maps by their internal id too", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_MAP.mapId);

    await expect(searchPage.mapCard(TEST_MAP.mapId)).toBeVisible({ timeout: 30000 });
  });

  test("should navigate to the map detail page from a result card", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_MAP.mapId);
    await expect(searchPage.mapCard(TEST_MAP.mapId)).toBeVisible({ timeout: 30000 });

    await searchPage.mapCard(TEST_MAP.mapId).click();
    await page.waitForURL(new RegExp(`/explorer/maps/${TEST_MAP.mapId}`));
    await searchPage.checkPageLoaded();
  });

  test("should show the maps empty state for a nonsense query", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate("zzzqqqxxxnosuchmap");

    await expect(searchPage.noMapsFound).toBeVisible({ timeout: 30000 });
    await expect(searchPage.noMapsFound).toContainText("No Maps Found");
  });
});

test.describe("Search Page - typing into the input", () => {
  test("should search as the user types", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate();
    await searchPage.search(TEST_UNIT.name);

    await expect(searchPage.unitsResults).toBeVisible();
    await expect(searchPage.unitCard(TEST_UNIT.unitId)).toBeVisible();
  });

  test("should clear the results when the query is emptied", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.navigate(TEST_UNIT.name);
    await expect(searchPage.unitsResults).toBeVisible({ timeout: 30000 });

    await searchPage.searchInput.fill("");
    await expect(searchPage.unitsResults).not.toBeVisible();
    await expect(searchPage.playersResults).not.toBeVisible();
  });
});

test.describe("Search - header search box", () => {
  // On mobile the header search lives inside the burger menu drawer, which is covered by the
  // site-chrome tests rather than here.
  test.skip(({ isMobile }) => !!isMobile, "Header search is behind the burger menu on mobile");

  test("should redirect to the search page from the header input", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto("/");

    await expect(searchPage.headerSearchInput).toBeVisible();
    await searchPage.headerSearchInput.fill(TEST_PLAYER.alias);

    await page.waitForURL(/\/search\?q=/, { timeout: 15000 });
    expect(new URL(page.url()).searchParams.get("q")).toBe(TEST_PLAYER.alias);
    await expect(searchPage.searchInput).toHaveValue(TEST_PLAYER.alias);
    await expect(searchPage.playersResults).toBeVisible({ timeout: 30000 });
  });

  test("should not redirect for a single character", async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto("/");

    await searchPage.headerSearchInput.fill("a");
    await page.waitForTimeout(1500);
    expect(page.url()).not.toContain("/search");
  });
});
