import { test, expect } from "@playwright/test";
import { navigateAndWait } from "../helpers/test-utils";

/**
 * Final Stand (DLC / co-op vs AI, `hoff` in the game files) units are hidden by default everywhere
 * we list units, and marked with a badge when they are shown.
 */
test.describe("Final Stand units", () => {
  test("faction unit list hides them until the toggle is switched on", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/american/units");

    const unitTitles = page.getByTestId("unit-title");
    const regularUnits = await unitTitles.count();
    expect(regularUnits).toBeGreaterThan(0);
    await expect(page.getByTestId("final-stand-badge")).toHaveCount(0);

    await page.getByTestId("final-stand-toggle").check();

    expect(await unitTitles.count()).toBeGreaterThan(regularUnits);
    expect(await page.getByTestId("final-stand-badge").count()).toBeGreaterThan(0);
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

  test("unit detail page marks a Final Stand unit", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/german/units/hoff_enemy_fallschirmjagers_ger");

    await expect(page.getByTestId("final-stand-badge")).toBeVisible();
  });

  test("unit detail page does not mark a regular unit", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/german/units/grenadier_ger");

    await expect(page.getByTestId("final-stand-badge")).toHaveCount(0);
  });
});
