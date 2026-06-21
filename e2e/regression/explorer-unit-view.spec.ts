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
    unitId: "tommy_africa_uk",
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

      test("should display all required page elements", async () => {
        // Check page loaded successfully without errors
        await unitPage.checkUnitPageLoaded();

        // Check unit title is visible
        await unitPage.checkUnitTitleVisible();

        // Check unit stats with numeric values are present
        await unitPage.checkStatsPresent();

        // Check weapons/loadout section is present
        await unitPage.checkWeaponsSectionPresent();

        // Check abilities section if unit has abilities
        await unitPage.checkAbilitiesSectionIfPresent();

        // Check upgrades section if unit has upgrades
        await unitPage.checkUpgradesSectionIfPresent();

        // Check footer is present
        await unitPage.checkFooterPresent();
      });
    });
  });

  // Additional comprehensive test for one unit
  test.describe("Comprehensive unit page validation (Riflemen)", () => {
    test.beforeEach(async () => {
      await unitPage.navigate("american", "riflemen_us");
    });

    test.describe("Page structure and layout", () => {
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

      test("should display unit header with all components", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check unit icon is visible
        await expect(unitPage.getUnitIcon("riflemen_us")).toBeVisible();

        // Check unit title
        await expect(unitPage.unitTitle).toBeVisible();

        // Check unit description is present
        await expect(unitPage.unitDescription).toBeVisible();

        // Check faction icon is visible
        await expect(unitPage.getFactionIcon("american")).toBeVisible();
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

    test.describe("Stats section", () => {
      test("should display all core stats with numeric values", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for Stats heading
        await expect(unitPage.statsHeading).toBeVisible();

        // Check specific stats are present
        const expectedStats = [
          "Sight Range",
          "Detection",
          "Max Range",
          "Speed",
          "Armor",
          "Capture Multiplier",
          "Target Size",
        ];

        await unitPage.checkCoreStatsVisible(expectedStats);
      });

      test("should display numeric stat values", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check body contains numbers
        await unitPage.checkBodyContainsNumbers();

        // Check for specific stat values we saw in the page
        await unitPage.checkBodyContains(["35", "3.6"]);
      });

      test("should display unit type information", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check unit ID and category exist in the page content
        await unitPage.checkBodyContains(["riflemen_us"]);
        await unitPage.checkBodyContainsText(["infantry"]);
      });
    });

    test.describe("Upgrades section", () => {
      test("should display upgrades heading", async () => {
        await unitPage.checkUnitPageLoaded();
        await expect(unitPage.upgradesHeading).toBeVisible();
      });

      test("should display all weapon upgrades", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for specific upgrades we saw on the page
        const upgrades = [
          "M1918 Browning Automatic Rifle",
          "M1941 Light Machine Gun Package",
          "M1919A6 Light Machine Gun",
          "M24/29 Chatellerault Light Machine Gun",
        ];

        await unitPage.checkUpgradesVisible(upgrades);
      });

      test("should display upgrade costs", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check that upgrades have costs section
        await expect(unitPage.getCostsSection(0)).toBeVisible();

        // Check for munition costs (specific values: 60, 75, 90, 70)
        await unitPage.checkBodyContains(["60", "75", "90"]);
      });

      test("should display upgrade icons", async () => {
        await unitPage.checkUnitPageLoaded();
        await unitPage.checkUpgradeIconsExist();
      });
    });

    test.describe("Abilities section", () => {
      test("should display abilities heading", async () => {
        await unitPage.checkUnitPageLoaded();
        await expect(unitPage.abilitiesSection).toBeVisible();
      });

      test("should display all unit abilities", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for specific abilities
        const abilities = [
          "Mk 2 Frag Grenade",
          "Pour it On 'em",
          "Sprint",
          "Sticky Bomb",
          "Breach",
          "F1 Grenade Assault",
        ];

        await unitPage.checkAbilitiesVisible(abilities);
      });

      test("should display ability types", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check that ability types exist in the page
        await unitPage.checkBodyContainsText(["offensive", "passive"]);
      });

      test("should display ability costs", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check that abilities have costs (25, 30, 15 munitions)
        await unitPage.checkBodyContains(["25", "30", "15"]);
      });

      test("should display ability icons", async () => {
        await unitPage.checkUnitPageLoaded();
        await unitPage.checkAbilityIconsExist();
      });
    });

    test.describe("Cost and production stats", () => {
      test("should display production costs", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for cost section
        await expect(unitPage.getCostsSection(1)).toBeVisible();

        // Check for specific values: 20s build time, 270 manpower, 8 popcap
        await unitPage.checkBodyContains(["20", "270", "8"]);
      });

      test("should display reinforce costs", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for reinforce section
        await expect(unitPage.reinforceSection).toBeVisible();

        // Check for reinforce cost (30 manpower, 3 seconds)
        await unitPage.checkBodyContains(["30", "3"]);
      });

      test("should display upkeep information", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for upkeep section
        await expect(unitPage.upkeepSection).toBeVisible();

        // Check for upkeep value (12 manpower)
        await unitPage.checkBodyContains(["12"]);
      });
    });

    test.describe("Hitpoints and squad composition", () => {
      test("should display hitpoints section", async () => {
        await unitPage.checkUnitPageLoaded();
        await expect(unitPage.hitpointsSection).toBeVisible();
      });

      test("should display squad health bars", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for health bars (6 members with 100 HP each = 600 total)
        await unitPage.checkSquadHealthBarsCount(6);

        // Check total HP
        await unitPage.checkBodyContains(["600"]);
      });
    });

    test.describe("Veterancy system", () => {
      test("should display veterancy section", async () => {
        await unitPage.checkUnitPageLoaded();
        await expect(unitPage.veterancySection).toBeVisible();
      });

      test("should display all veterancy levels", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for XP requirements (900, 2700, 5400)
        await unitPage.checkBodyContains(["900", "2700", "5400"]);
      });

      test("should display veterancy bonuses", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for specific bonus keywords
        const bonusKeywords = ["harder to hit", "accuracy", "health", "rate of fire"];
        await unitPage.checkBodyContainsText(bonusKeywords);
      });

      test("should display veterancy stars", async () => {
        await unitPage.checkUnitPageLoaded();
        await unitPage.checkVetStarsExist();
      });
    });

    test.describe("Buildable structures", () => {
      test("should display can construct section", async () => {
        await unitPage.checkUnitPageLoaded();
        await expect(unitPage.canConstructSection).toBeVisible();
      });

      test("should display buildable structures", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for specific structures
        const structures = [
          "M6 Heavy Anti-tank Mine",
          "High-explosive Demolition Charge",
          "Belgian Gate",
          "Fighting Position",
          "Concrete Bastion",
        ];

        await unitPage.checkStructuresVisible(structures);
      });

      test("should display structure costs", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for "Free" structures
        await unitPage.checkBodyContains(["Free"]);

        // Check for structures with costs (50 munitions, 100 manpower)
        await unitPage.checkBodyContains(["50", "100"]);
      });
    });

    test.describe("Loadout and weapons", () => {
      test("should display loadout section", async () => {
        await unitPage.checkUnitPageLoaded();
        await expect(unitPage.loadoutHeading).toBeVisible();
      });

      test("should display weapon statistics tables", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for weapon stat labels
        const weaponStats = [
          "Distance",
          "Accuracy",
          "Rounds per Minute",
          "Penetration",
          "Damage",
          "Range",
        ];

        await unitPage.checkWeaponStatsVisible(weaponStats);
      });

      test("should display range categories (Near/Medium/Far)", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for range category headers
        // Use non-exact match as the text might be styled or have extra whitespace
        const rangeHeaders = ["Near", "Medium", "Far"];
        for (const range of rangeHeaders) {
          const rangeElement = unitPage.page.getByText(range, { exact: false }).first();
          await expect(rangeElement).toBeVisible();
        }
      });

      test("should display AoE (Area of Effect) data", async () => {
        await unitPage.checkUnitPageLoaded();

        // AoE data is conditionally shown only for weapons with area of effect (like grenades)
        // Riflemen's default loadout (rifles) don't have AoE, but their grenade abilities do
        // Check if the page can display AoE stats when they exist
        const bodyText = await unitPage.page.textContent("body");
        expect(bodyText).toBeTruthy();

        // If there are any grenade abilities, they should show AoE stats
        // Otherwise, the absence of AoE stats is correct
        const hasGrenades = bodyText?.toLowerCase().includes("grenade");
        if (hasGrenades) {
          // If grenades exist, AoE-related text should be present somewhere
          const hasAoeRelatedText =
            bodyText?.includes("AoE") ||
            bodyText?.includes("Falloff") ||
            bodyText?.includes("Radius");
          expect(hasAoeRelatedText).toBeTruthy();
        }
      });

      test("should display cover modifiers", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for cover modifier section and types
        await unitPage.checkBodyContains(["VS Cover - Modifiers"]);
        await unitPage.checkWeaponStatsVisible(["Light", "Heavy", "Garrison"]);
      });

      test("should display target modifiers", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check for target modifiers section and types
        await unitPage.checkBodyContains(["VS Target - Modifiers"]);
        await unitPage.checkRangeCategoriesVisible([
          "Building",
          "Emplacement",
          "Sandbag",
          "Barbed Wire",
          "Mine",
        ]);
      });
    });

    test.describe("Navigation and links", () => {
      test("should have clickable faction link", async () => {
        await unitPage.checkUnitPageLoaded();

        // Check faction link exists in the page (may not be visible in viewport but should exist)
        await expect(unitPage.getFactionLink("american").first()).toBeAttached();
      });

      test("should have working header logo link", async () => {
        await unitPage.checkUnitPageLoaded();
        await expect(unitPage.headerLogoLink.first()).toBeVisible();
      });
    });

    test.describe("Content validation", () => {
      test("should not have any obvious broken images", async () => {
        await unitPage.checkUnitPageLoaded();
        await unitPage.checkImagesHaveSrc();
      });

      test("should have proper page title", async () => {
        await unitPage.checkUnitPageLoaded();
        await unitPage.checkPageTitleContains(["Riflemen Squad", "COH3"]);
      });

      test("should not display error messages", async () => {
        await unitPage.checkUnitPageLoaded();

        // Verify the page has actual unit content (not an error page)
        await unitPage.checkBodyContains(["Riflemen Squad", "Stats", "Upgrades", "Abilities"]);

        // Check for critical error indicator
        await unitPage.checkNoErrorMessages();
      });
    });

    test.describe("SEO and metadata", () => {
      test("should have meta description", async () => {
        await unitPage.checkUnitPageLoaded();
        await unitPage.checkMetaDescriptionExists();
      });
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
    await unitPage.navigate("british", "tommy_africa_uk");
    await unitPage.checkUnitPageLoaded();
    await unitPage.checkUnitTitleVisible();
  });
});
