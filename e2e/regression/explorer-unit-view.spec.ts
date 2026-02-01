import { test, expect } from "@playwright/test";
import { ExplorerUnitPage } from "../page-objects/explorer-unit-page";

/**
 * Regression tests for Explorer Unit View pages
 * Tests various units from different factions to ensure the unit detail pages work correctly
 */

// Test data: Different units from different factions
const testUnits = [
  {
    faction: "american",
    unitId: "riflemen_us",
    name: "Riflemen Squad",
    description: "American infantry unit",
  },
  {
    faction: "german",
    unitId: "grenadier_ger",
    name: "Grenadier Squad",
    description: "German infantry unit",
  },
  {
    faction: "british",
    unitId: "tommy_uk",
    name: "Infantry Section",
    description: "British infantry unit",
  },
  {
    faction: "american",
    unitId: "sherman_us",
    name: "M4A1 Sherman Medium Tank",
    description: "American tank unit",
  },
  {
    faction: "dak",
    unitId: "panzer_iii_ak",
    name: "Panzer III Medium Tank",
    description: "DAK tank unit",
  },
];

test.describe("Explorer Unit View Pages", () => {
  let unitPage: ExplorerUnitPage;

  test.beforeEach(async ({ page }) => {
    unitPage = new ExplorerUnitPage(page);
  });

  // Test each unit
  testUnits.forEach(({ faction, unitId, name }) => {
    test.describe(`${name} (${faction})`, () => {
      test.beforeEach(async () => {
        await unitPage.navigate(faction, unitId);
      });

      test("should load successfully without errors", async () => {
        await unitPage.checkUnitPageLoaded();
      });

      test("should display unit title", async () => {
        await unitPage.checkUnitTitleVisible();
      });

      test("should display unit stats with numeric values", async () => {
        await unitPage.checkStatsPresent();
      });

      test("should display weapons/loadout section", async () => {
        await unitPage.checkWeaponsSectionPresent();
      });

      test("should display abilities section if unit has abilities", async () => {
        await unitPage.checkAbilitiesSectionIfPresent();
      });

      test("should display upgrades section if unit has upgrades", async () => {
        await unitPage.checkUpgradesSectionIfPresent();
      });

      test("should display footer", async () => {
        await unitPage.checkFooterPresent();
      });
    });
  });

  // Additional comprehensive test for one unit
  test.describe("Comprehensive unit page validation (Riflemen)", () => {
    test.beforeEach(async () => {
      await unitPage.navigate("american", "riflemen_us");
    });

    test("should have all required page elements", async () => {
      // Check page loaded
      await unitPage.checkUnitPageLoaded();

      // Check header and footer
      await expect(unitPage.header).toBeVisible();
      await expect(unitPage.footer).toBeVisible();

      // Check main content
      await unitPage.checkUnitTitleVisible();
      await unitPage.checkStatsPresent();
      await unitPage.checkWeaponsSectionPresent();
    });

    test("should display numeric stat values", async () => {
      // Wait for page to load
      await unitPage.checkUnitPageLoaded();

      // Check that the page contains numeric values (stats)
      const bodyText = await unitPage.page.textContent("body");
      expect(bodyText).toBeTruthy();

      // Should contain numbers (stats like HP, armor, speed, etc.)
      const hasNumbers = /\d+\.?\d*/.test(bodyText || "");
      expect(hasNumbers).toBeTruthy();
    });

    test("should be responsive on mobile", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await unitPage.navigate("american", "riflemen_us");
      await unitPage.checkUnitPageLoaded();
      await unitPage.checkUnitTitleVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await unitPage.navigate("american", "riflemen_us");
      await unitPage.checkUnitPageLoaded();
      await unitPage.checkUnitTitleVisible();
    });
  });

  // Test navigation between units
  test("should navigate between different unit pages", async () => {
    // Navigate to first unit
    await unitPage.navigate("american", "riflemen_us");
    await unitPage.checkUnitPageLoaded();
    await unitPage.checkUnitTitleVisible();

    // Navigate to second unit
    await unitPage.navigate("german", "grenadier_ger");
    await unitPage.checkUnitPageLoaded();
    await unitPage.checkUnitTitleVisible();

    // Navigate to third unit
    await unitPage.navigate("british", "tommy_uk");
    await unitPage.checkUnitPageLoaded();
    await unitPage.checkUnitTitleVisible();
  });
});
