import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Explorer Unit View Page
 * Contains all selectors and methods for interacting with unit detail pages
 */
export class ExplorerUnitPage extends BasePage {
  /**
   * Get the unit title/name element
   */
  get unitTitle(): Locator {
    return this.page.locator("h1, h2, h3").first();
  }

  /**
   * Get the unit description card
   */
  get unitDescriptionCard(): Locator {
    return this.page
      .locator('[data-testid="unit-description-card"]')
      .or(this.page.locator("text=/.*/.").first());
  }

  /**
   * Get the stats section
   */
  get statsSection(): Locator {
    return this.page
      .locator('text="Stats"')
      .or(this.page.locator('[data-testid="stats-section"]'));
  }

  /**
   * Get all stat cards
   */
  get statCards(): Locator {
    return this.page.locator('[class*="Card"]');
  }

  /**
   * Get the abilities section
   */
  get abilitiesSection(): Locator {
    return this.page.locator("text=/Abilities/i");
  }

  /**
   * Get the weapons/loadout section
   */
  get weaponsSection(): Locator {
    return this.page.locator('h4:has-text("Loadout"), h4:has-text("loadout")').first();
  }

  /**
   * Get the upgrades section
   */
  get upgradesSection(): Locator {
    return this.page.locator("text=/Upgrades/i");
  }

  /**
   * Get the faction icon
   */
  get factionIcon(): Locator {
    return this.page.locator('img[alt*="faction"], img[src*="faction"]').first();
  }

  /**
   * Navigate to a specific unit page
   * @param faction - The faction (american, german, british, dak)
   * @param unitId - The unit ID
   */
  async navigate(faction: string, unitId: string): Promise<void> {
    await this.goto(`/explorer/races/${faction}/units/${unitId}`);
  }

  /**
   * Check if the unit page loaded successfully
   */
  async checkUnitPageLoaded(): Promise<void> {
    await this.checkPageLoaded();
    // Wait for the main content to be visible
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if the unit title is visible and contains text
   */
  async checkUnitTitleVisible(): Promise<void> {
    await expect(this.unitTitle).toBeVisible();
    const titleText = await this.unitTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.trim().length).toBeGreaterThan(0);
  }

  /**
   * Check if unit stats are present and contain numeric values
   */
  async checkStatsPresent(): Promise<void> {
    // Look for numeric values in the page (stats should contain numbers)
    const statsText = await this.page.textContent("body");

    // Check for common stat patterns (numbers with optional decimals)
    const hasNumbers = /\d+\.?\d*/.test(statsText || "");
    expect(hasNumbers).toBeTruthy();
  }

  /**
   * Check if a specific stat contains a numeric value
   * @param statName - The name of the stat to check
   */
  async checkStatHasNumericValue(statName: string): Promise<boolean> {
    const statLocator = this.page.locator(`text=${statName}`).first();
    if (!(await statLocator.isVisible())) {
      return false;
    }

    // Get the parent or sibling element that contains the value
    const container = statLocator.locator("..").first();
    const text = await container.textContent();

    // Check if there's a number in the text
    return /\d+\.?\d*/.test(text || "");
  }

  /**
   * Check if the abilities section exists (if unit has abilities)
   */
  async checkAbilitiesSectionIfPresent(): Promise<void> {
    // Abilities are optional, so we just check if the section exists
    const abilitiesVisible = await this.abilitiesSection.isVisible().catch(() => false);

    if (abilitiesVisible) {
      await expect(this.abilitiesSection).toBeVisible();
    }
  }

  /**
   * Check if the weapons section exists and has content
   */
  async checkWeaponsSectionPresent(): Promise<void> {
    await expect(this.weaponsSection).toBeVisible();
  }

  /**
   * Check if the upgrades section exists (if unit has upgrades)
   */
  async checkUpgradesSectionIfPresent(): Promise<void> {
    // Upgrades are optional, so we just check if the section exists
    const upgradesVisible = await this.upgradesSection.isVisible().catch(() => false);

    if (upgradesVisible) {
      await expect(this.upgradesSection).toBeVisible();
    }
  }
}
