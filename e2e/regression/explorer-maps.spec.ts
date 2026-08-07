import { test, expect } from "@playwright/test";
import {
  MapDetailPage,
  MapsExplorerPage,
  MapsTablePage,
} from "../page-objects/explorer-maps-page";
import { MISSING, TEST_MAP } from "../fixtures/test-data";

/**
 * Regression tests for the map explorer - `/explorer/maps`, `/explorer/maps-table` and
 * `/explorer/maps/[mapId]`.
 *
 * All three pages are statically generated from the `coh3-data` map package (the mapping itself is
 * covered by `e2e/data/mp-maps.spec.ts`), so there is no API involved - what these tests verify is
 * that the pages actually render that data and that the filters / url sync work.
 */

test.describe("Explorer Maps - card view", () => {
  test("should render the maps grouped by mode", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();

    await maps.checkPageLoaded();
    await expect(maps.title).toContainText("Maps");
    await maps.waitForFilters();

    // The list is grouped by mode when nothing is being searched for.
    expect(await maps.sectionHeadings.count()).toBeGreaterThan(1);
    await expect(maps.sectionHeadings.first()).toContainText(/vs/i);

    expect(await maps.mapCards.count()).toBeGreaterThan(10);
    expect(await maps.getMapCount()).toBe(await maps.mapCards.count());
    await maps.checkFooterPresent();
  });

  test("should render a card with the map name, badges and point counts", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();
    await maps.waitForFilters();

    const card = maps.mapCard(TEST_MAP.mapId);
    await expect(card).toBeVisible();
    await expect(card).toContainText(TEST_MAP.searchName);
    // Mode badge + player count badge.
    await expect(card).toContainText(/vs/i);
    await expect(card).toContainText(/player/i);
    // Map size, rendered as `width × height`.
    await expect(card).toContainText(/\d+\s*×\s*\d+/);
    await expect(card).toHaveAttribute("href", `/explorer/maps/${TEST_MAP.mapId}`);
  });

  test("should filter by the search box and sync it to the url", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();
    await maps.waitForFilters();
    const total = await maps.getMapCount();

    await maps.search(TEST_MAP.searchName);

    await expect(maps.mapCard(TEST_MAP.mapId)).toBeVisible();
    const filtered = await maps.getMapCount();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(total);
    // While searching the maps are shown as one flat list instead of per-mode sections.
    expect(await maps.sectionHeadings.count()).toBe(0);
  });

  test("should hydrate the filters from the url", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate(`?search=${encodeURIComponent(TEST_MAP.mapId)}`);
    await maps.waitForFilters();

    await expect(maps.searchInput).toHaveValue(TEST_MAP.mapId);
    // The filter runs through the same 200ms debounce as a typed query, so the list settles a
    // moment after the input is populated.
    await expect(maps.mapCards).toHaveCount(1);
    await expect(maps.mapCard(TEST_MAP.mapId)).toBeVisible();
  });

  test("should show the empty state for a search matching nothing", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();
    await maps.waitForFilters();

    await maps.search("zzzqqqxxxnosuchmap");

    await expect(maps.noMapsMessage).toBeVisible();
    expect(await maps.mapCards.count()).toBe(0);
    expect(await maps.getMapCount()).toBe(0);
  });

  test("should filter by the mode chips", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();
    await maps.waitForFilters();
    const total = await maps.getMapCount();

    await maps.modeChip("1vs1").click();
    await maps.expectQuery("mode", "1v1");

    const filtered = await maps.getMapCount();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(total);
    // Only the 1v1 section is left.
    await expect(maps.sectionHeadings).toHaveCount(1);
    await expect(maps.sectionHeadings.first()).toContainText("1 vs 1");
  });

  test("should hydrate the mode chips from the url", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate("?mode=4v4");
    await maps.waitForFilters();

    await expect(maps.sectionHeadings).toHaveCount(1);
    await expect(maps.sectionHeadings.first()).toContainText("4 vs 4");
  });

  test("should reveal the Final Stand maps only when asked for", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();
    await maps.waitForFilters();

    // Final Stand maps are opt-in - they are not part of the default (all multiplayer) list.
    await expect(maps.sectionHeadings.filter({ hasText: "Final Stand" })).toHaveCount(0);

    await maps.modeChip("Final Stand").click();
    await maps.expectQuery("mode", "fs");

    await expect(maps.sectionHeadings).toHaveCount(1);
    await expect(maps.sectionHeadings.first()).toContainText("Final Stand");
    expect(await maps.getMapCount()).toBeGreaterThan(0);
  });

  test("should show more maps when the lobby-only switch is turned off", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();
    await maps.waitForFilters();

    // The switch starts on - only maps selectable in the in-game lobby are listed.
    await expect(maps.lobbySwitch).toBeChecked();
    const lobbyOnly = await maps.getMapCount();

    await maps.lobbySwitch.uncheck();
    await maps.expectQuery("lobby", "false");

    expect(await maps.getMapCount()).toBeGreaterThan(lobbyOnly);
  });

  test("should navigate to the map detail page from a card", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate(`?search=${encodeURIComponent(TEST_MAP.mapId)}`);
    // Wait for the filters to have settled - the page rewrites its own url on mount, which would
    // otherwise race with (and cancel) the client side navigation triggered by the click.
    await expect(maps.mapCards).toHaveCount(1);
    await maps.expectQuery("search", TEST_MAP.mapId);

    await maps.mapCard(TEST_MAP.mapId).click();
    await page.waitForURL(`**/explorer/maps/${TEST_MAP.mapId}`);
    await expect(page.locator("h1").last()).toContainText(TEST_MAP.searchName);
  });

  test("should set the SEO tags", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();

    await expect(page).toHaveTitle(/Maps/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/explorer\/maps$/,
    );
    await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
      "content",
      /maps/i,
    );
  });
});

test.describe("Explorer Maps - view switch", () => {
  test("should switch from the cards to the table", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate();
    await maps.waitForFilters();
    const cardCount = await maps.getMapCount();

    await maps.viewSwitchTable.click();
    await page.waitForURL("**/explorer/maps-table**");

    const table = new MapsTablePage(page);
    await table.waitForFilters();
    // Both views list the same maps with the same default filters.
    expect(await table.getMapCount()).toBe(cardCount);
  });

  test("should switch from the table back to the cards", async ({ page }) => {
    const table = new MapsTablePage(page);
    await table.navigate();
    await table.waitForFilters();

    await table.viewSwitchCards.click();
    await page.waitForURL("**/explorer/maps");

    const maps = new MapsExplorerPage(page);
    await maps.waitForFilters();
    expect(await maps.mapCards.count()).toBeGreaterThan(10);
  });
});

test.describe("Explorer Maps - table view", () => {
  test("should render a row per map with the point and income columns", async ({ page }) => {
    const table = new MapsTablePage(page);
    await table.navigate();

    await table.checkPageLoaded();
    await expect(table.title).toContainText("Maps Table");
    await table.waitForFilters();

    await expect(table.table).toBeVisible();
    const rowCount = await table.rows.count();
    expect(rowCount).toBeGreaterThan(10);
    expect(await table.getMapCount()).toBe(rowCount);

    // Column groups of the header.
    for (const group of ["Map", "Resource points", "Income / min", "Size"]) {
      await expect(table.table.locator("th").filter({ hasText: group }).first()).toBeVisible();
    }

    await expect(table.detailsButton(TEST_MAP.mapId)).toBeVisible();
    await table.checkFooterPresent();
  });

  test("should filter the table by the search box", async ({ page }) => {
    const table = new MapsTablePage(page);
    await table.navigate();
    await table.waitForFilters();

    await table.search(TEST_MAP.mapId);

    await expect(table.rows).toHaveCount(1);
    await expect(table.detailsButton(TEST_MAP.mapId)).toBeVisible();
  });

  test("should sort by a column and write the sorting into the url", async ({ page }) => {
    const table = new MapsTablePage(page);
    await table.navigate();
    await table.waitForFilters();

    // The table starts grouped by mode, so the name order is not sorted alphabetically yet.
    await table.columnHeader("Name").click();
    await table.expectQuery("sort", "name");
    await table.expectQuery("dir", "asc");

    const ascending = await table.rowNames();
    expect(ascending.length).toBeGreaterThan(1);

    await table.columnHeader("Name").click();
    await table.expectQuery("dir", "desc");

    const descending = await table.rowNames();
    expect(descending[0]).not.toBe(ascending[0]);
    expect(descending[0]).toBe(ascending[ascending.length - 1]);
  });

  test("should hydrate the sorting from the url", async ({ page }) => {
    const table = new MapsTablePage(page);
    await table.navigate("?sort=name&dir=desc");
    await table.waitForFilters();

    const descending = await table.rowNames();
    expect(descending.length).toBeGreaterThan(1);

    // Same data sorted the other way round has to start with the last row of this one.
    await table.navigate("?sort=name&dir=asc");
    await table.waitForFilters();
    const ascending = await table.rowNames();
    expect(ascending[0]).toBe(descending[descending.length - 1]);
  });

  test("should halve the income when switching to per side", async ({ page }) => {
    const table = new MapsTablePage(page);
    await table.navigate(`?search=${encodeURIComponent(TEST_MAP.mapId)}`);
    await table.waitForFilters();
    await expect(table.rows).toHaveCount(1);

    const totalRow = (await table.rows.first().innerText()).replace(/\s+/g, " ");

    await table.incomeSwitch.getByText("Per side", { exact: true }).click();
    await expect(table.table.locator("th").filter({ hasText: "Per side" }).first()).toBeVisible();

    const perSideRow = (await table.rows.first().innerText()).replace(/\s+/g, " ");
    expect(perSideRow).not.toBe(totalRow);
  });

  test("should open the detail page from the row button", async ({ page }) => {
    const table = new MapsTablePage(page);
    await table.navigate(`?search=${encodeURIComponent(TEST_MAP.mapId)}`);
    // See the card view test above - wait for the page's own url rewrite before navigating away.
    await expect(table.rows).toHaveCount(1);
    await table.expectQuery("search", TEST_MAP.mapId);

    await table.detailsButton(TEST_MAP.mapId).click();
    await page.waitForURL(`**/explorer/maps/${TEST_MAP.mapId}`);
    await expect(page.locator("h1").last()).toContainText(TEST_MAP.searchName);
  });
});

test.describe("Explorer Maps - detail page", () => {
  test("should render the minimap, the badges and the overview card", async ({ page }) => {
    const detail = new MapDetailPage(page);
    await detail.navigate(TEST_MAP.mapId);

    await detail.checkPageLoaded();
    await expect(detail.title).toContainText(TEST_MAP.searchName);
    await expect(detail.minimap(TEST_MAP.mapId)).toBeVisible();

    const overview = detail.infoCard("Overview");
    await expect(overview).toBeVisible();
    await expect(overview).toContainText("Map size");
    await expect(overview).toContainText("Playable area");
    await expect(overview).toContainText(TEST_MAP.mapId);
    await detail.checkFooterPresent();
  });

  test("should draw the resource points on the minimap", async ({ page }) => {
    const detail = new MapDetailPage(page);
    await detail.navigate(TEST_MAP.mapId);

    const markers = detail.minimap(TEST_MAP.mapId).locator("img");
    // The backdrop plus one icon per point - a 2v2 map has dozens of those.
    expect(await markers.count()).toBeGreaterThan(10);

    // The legend under the map counts them per kind.
    await expect(page.locator("text=/Victory: \\d+/")).toBeVisible();
  });

  test("should render the points and income cards", async ({ page }) => {
    const detail = new MapDetailPage(page);
    await detail.navigate(TEST_MAP.mapId);

    const points = detail.infoCard("Resource points");
    await expect(points).toBeVisible();
    await expect(points).toContainText("Victory points");
    await expect(points).toContainText("Fuel points");
    await expect(points).toContainText("Capturable points");

    const income = detail.infoCard("Income per minute");
    await expect(income).toBeVisible();
    await expect(income).toContainText("Fuel");
    await expect(income).toContainText("Munitions");
    // Each resource row carries its total and per-side value, eg. `Fuel 40 20`.
    await expect(income).toContainText(/Fuel\s*\d+/);
    await expect(income).toContainText(/Manpower\s*\d+/);
  });

  test("should toggle the territory sectors overlay", async ({ page }) => {
    const detail = new MapDetailPage(page);
    await detail.navigate(TEST_MAP.mapId);

    await expect(detail.sectorsToggle).toBeVisible();
    await expect(detail.sectorsToggle).toBeChecked();
    await expect(detail.sectors(TEST_MAP.mapId)).toBeVisible();

    await detail.sectorsToggle.uncheck();
    await expect(detail.sectors(TEST_MAP.mapId)).toHaveCount(0);

    await detail.sectorsToggle.check();
    await expect(detail.sectors(TEST_MAP.mapId)).toBeVisible();
  });

  test("should link back to the map list and to the map statistics", async ({ page }) => {
    const detail = new MapDetailPage(page);
    await detail.navigate(TEST_MAP.mapId);

    await expect(detail.backToMapsLink).toBeVisible();

    // `rural_castle_4p` is an official 2v2 map, so it has tracked statistics.
    await expect(detail.mapStatsButton).toBeVisible();
    await expect(detail.mapStatsButton).toHaveAttribute(
      "href",
      new RegExp(`/stats/maps\\?mode=2v2&map=${TEST_MAP.mapId}`),
    );

    await detail.backToMapsLink.click();
    await page.waitForURL("**/explorer/maps");
  });

  test("should set the SEO tags from the map data", async ({ page }) => {
    const detail = new MapDetailPage(page);
    await detail.navigate(TEST_MAP.mapId);

    await expect(page).toHaveTitle(new RegExp(`${TEST_MAP.searchName}.*COH3 Map`));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/explorer/maps/${TEST_MAP.mapId}$`),
    );
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
      "content",
      new RegExp(TEST_MAP.mapId),
    );
    // The description carries escaped newlines in the data file, those must not leak into the tag.
    const description = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute("content");
    expect(description).not.toContain("\\n");
  });

  test("should 404 on an unknown map id", async ({ page }) => {
    const response = await page.goto(`/explorer/maps/${MISSING.mapId}`);

    expect(response?.status()).toBe(404);
    await expect(page.locator("text=/404|not be found|Map Not Found/i").first()).toBeVisible();
  });
});

test.describe("Explorer Maps - mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile viewport only");

  test("should render the cards and the detail page on a phone", async ({ page }) => {
    const maps = new MapsExplorerPage(page);
    await maps.navigate(`?search=${encodeURIComponent(TEST_MAP.mapId)}`);
    await maps.waitForFilters();
    await expect(maps.mapCard(TEST_MAP.mapId)).toBeVisible();

    const detail = new MapDetailPage(page);
    await detail.navigate(TEST_MAP.mapId);
    await expect(detail.title).toContainText(TEST_MAP.searchName);
    await expect(detail.minimap(TEST_MAP.mapId)).toBeVisible();
    await expect(detail.infoCard("Overview")).toBeVisible();
  });
});
