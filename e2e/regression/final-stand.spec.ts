import { test, expect } from "@playwright/test";
import { navigateAndWait } from "../helpers/test-utils";

/**
 * Final Stand (DLC / co-op vs AI, `hoff` in the game files) units are hidden by default everywhere
 * we list units, and marked with a badge when they are shown.
 */
test.describe("Final Stand units", () => {
  test("faction unit list excludes them and links to the dedicated Final Stand page", async ({
    page,
  }) => {
    await navigateAndWait(page, "/explorer/races/american/units");

    const unitTitles = page.getByTestId("unit-title");
    expect(await unitTitles.count()).toBeGreaterThan(0);
    await expect(page.getByTestId("final-stand-badge")).toHaveCount(0);

    await page.getByTestId("final-stand-view-finalstand").click();

    await expect(page).toHaveURL(/\/explorer\/fs\/races\/american\/units$/);
    expect(await unitTitles.count()).toBeGreaterThan(0);
  });

  test("Final Stand unit list only shows Final Stand units, badges them, and can switch back", async ({
    page,
  }) => {
    await navigateAndWait(page, "/explorer/fs/races/american/units");

    const unitTitles = page.getByTestId("unit-title");
    expect(await unitTitles.count()).toBeGreaterThan(0);
    await expect(page.getByTestId("final-stand-badge").first()).toBeVisible();

    await page.getByTestId("final-stand-view-standard").click();

    await expect(page).toHaveURL(/\/explorer\/races\/american\/units$/);
  });

  test("Final Stand unit list badges the AI-controlled enemy units", async ({ page }) => {
    await navigateAndWait(page, "/explorer/fs/races/german/units");

    await expect(page.getByTestId("final-stand-enemy-badge").first()).toBeVisible();
  });

  test("unit browser hides them until the toggle is switched on", async ({ page }) => {
    await navigateAndWait(page, "/explorer/unit-browser");

    await expect(page.getByTestId("final-stand-badge")).toHaveCount(0);

    await page.getByTestId("final-stand-toggle").check();

    await expect(page.getByTestId("final-stand-badge").first()).toBeVisible();
  });

  test("DPS calculator offers them only when enabled in the settings", async ({ page }) => {
    await navigateAndWait(page, "/explorer/dps");

    const unitSearch = page.getByPlaceholder("Choose unit").first();
    await unitSearch.click();
    await unitSearch.fill("hoff_");
    await expect(page.getByTestId("final-stand-badge")).toHaveCount(0);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Settings" }).first().hover();
    await page.getByTestId("final-stand-toggle").first().check();

    await unitSearch.click();
    await unitSearch.fill("hoff_");
    await expect(page.getByTestId("final-stand-badge").first()).toBeVisible();
  });

  test("unit detail page marks a Final Stand enemy unit", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/german/units/hoff_enemy_fallschirmjagers_ger");

    await expect(page.getByTestId("final-stand-badge")).toBeVisible();
    await expect(page.getByTestId("final-stand-enemy-badge")).toBeVisible();
  });

  test("unit detail page does not mark a regular unit", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/german/units/grenadier_ger");

    await expect(page.getByTestId("final-stand-badge")).toHaveCount(0);
    await expect(page.getByTestId("final-stand-enemy-badge")).toHaveCount(0);
  });

  test("unit detail page is not indexable and flags the DLC in Open Graph", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/german/units/hoff_enemy_fallschirmjagers_ger");

    await expect(page.locator('head > meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(page.locator('head > meta[property="og:type"]')).toHaveAttribute(
      "content",
      "article",
    );
    await expect(page.locator('head > meta[property="article:section"]')).toHaveAttribute(
      "content",
      "Final Stand",
    );
    await expect(page.locator('head > meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Final Stand/,
    );
    await expect(page.locator('head > meta[property="og:description"]')).toHaveAttribute(
      "content",
      /Final Stand/,
    );
  });

  test("regular unit detail page stays indexable", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/german/units/grenadier_ger");

    await expect(page.locator('head > meta[name="robots"]')).toHaveAttribute(
      "content",
      "index,follow",
    );
    await expect(page.locator('head > meta[property="article:section"]')).toHaveCount(0);
  });
});
