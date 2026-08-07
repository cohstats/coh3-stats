import { test, expect } from "@playwright/test";
import { checkFooterPresent, checkPageLoaded, navigateAndWait } from "../helpers/test-utils";
import { TEST_UNIT } from "../fixtures/test-data";

/**
 * Regression tests for the explorer tools which only had a "the page loads" smoke test:
 * `/explorer/challenges`, `/explorer/weapons`, `/explorer/unit-browser` and `/explorer` itself.
 *
 * Plus `/admin/custom-games`, which no test had ever opened. It is publicly reachable (the write
 * action behind it is password protected), so it gets a smoke test here.
 */

test.describe("Explorer - index", () => {
  test("should link to every explorer section", async ({ page }) => {
    await navigateAndWait(page, "/explorer");
    await checkPageLoaded(page);

    for (const href of [
      "/explorer/dps",
      "/explorer/dps-compare",
      "/explorer/unit-browser",
      "/explorer/weapons",
      "/explorer/challenges",
      "/explorer/maps",
      "/explorer/maps-table",
    ]) {
      // `:visible` keeps the header's (closed) Explorer dropdown, which links to the same routes,
      // out of the assertion.
      await expect(page.locator(`a[href="${href}"]:visible`).first()).toBeVisible();
    }
    await checkFooterPresent(page);
  });
});

test.describe("Explorer - challenges", () => {
  test.slow();

  test("should list the daily and weekly challenges", async ({ page }) => {
    await navigateAndWait(page, "/explorer/challenges");
    await checkPageLoaded(page);

    await expect(page.getByText("Daily", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Weekly", { exact: false }).first()).toBeVisible();

    // Every challenge is an accordion item with a reward.
    const items = page.locator(".mantine-Accordion-item");
    expect(await items.count()).toBeGreaterThan(5);
    await expect(items.first()).not.toBeEmpty();
    await checkFooterPresent(page);
  });

  test("should expand a challenge to show its details", async ({ page }) => {
    await navigateAndWait(page, "/explorer/challenges");

    const control = page.locator("button.mantine-Accordion-control:visible").first();
    await control.scrollIntoViewIfNeeded();
    await control.click();

    await expect(page.locator(".mantine-Accordion-panel:visible").first()).toBeVisible();
  });
});

test.describe("Explorer - weapons", () => {
  test.slow();

  test("should render the weapon table with rows", async ({ page }) => {
    await navigateAndWait(page, "/explorer/weapons");
    await checkPageLoaded(page);

    const rows = page.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(10);
    await checkFooterPresent(page);
  });

  test("should filter the weapons by the search box", async ({ page }) => {
    await navigateAndWait(page, "/explorer/weapons");

    const rows = page.locator("tbody tr");
    const all = await rows.count();
    expect(all).toBeGreaterThan(10);

    await page.getByPlaceholder("Search Weapon").fill("mg42");

    await expect.poll(() => rows.count(), { timeout: 15000 }).toBeLessThan(all);
    expect(await rows.count()).toBeGreaterThan(0);
    // The search matches the weapon id and its description, so every remaining row has to mention
    // the term somewhere - `42` is the part that survives both spellings (`mg42`, `mg_42`).
    await expect(rows.first()).toContainText(/42/);
  });
});

test.describe("Explorer - unit browser", () => {
  test.slow();

  test("should render the unit table with rows", async ({ page }) => {
    await navigateAndWait(page, "/explorer/unit-browser");
    await checkPageLoaded(page);

    const rows = page.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(10);
    await checkFooterPresent(page);
  });

  test("should filter the units by the search box", async ({ page }) => {
    await navigateAndWait(page, "/explorer/unit-browser");

    const rows = page.locator("tbody tr");
    const all = await rows.count();

    await page.getByPlaceholder("Search Unit").fill(TEST_UNIT.name);

    await expect.poll(() => rows.count(), { timeout: 15000 }).toBeLessThan(all);
    await expect(rows.first()).toContainText(new RegExp(TEST_UNIT.name, "i"));
  });

  test("should link a unit row to its detail page", async ({ page }) => {
    await navigateAndWait(page, "/explorer/unit-browser");
    await page.getByPlaceholder("Search Unit").fill(TEST_UNIT.name);

    const link = page
      .locator(`a[href="/explorer/races/${TEST_UNIT.race}/units/${TEST_UNIT.unitId}"]`)
      .first();
    await expect(link).toBeVisible();

    await link.click();
    await page.waitForURL(`**/explorer/races/${TEST_UNIT.race}/units/${TEST_UNIT.unitId}`);
    await checkPageLoaded(page);
  });
});

test.describe("Admin - custom games", () => {
  test("should render the custom games visibility form", async ({ page }) => {
    await navigateAndWait(page, "/admin/custom-games");
    await checkPageLoaded(page);

    // The page is publicly reachable; the change itself needs the admin password.
    await expect(page.getByText("Are custom games hidden")).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await checkFooterPresent(page);
  });
});
