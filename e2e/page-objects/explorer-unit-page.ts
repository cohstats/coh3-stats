import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Explorer Unit View Page
 * Contains all selectors and methods for interacting with unit detail pages
 */
export class ExplorerUnitPage extends BasePage {
  // ==================== Basic Elements ====================

  /**
   * Get the unit title/name element
   */
  get unitTitle(): Locator {
    return this.page.getByTestId("unit-title");
  }

  /**
   * Get the unit icon
   */
  getUnitIcon(): Locator {
    return this.page.getByTestId("unit-icon");
  }

  /**
   * Get the unit description
   */
  get unitDescription(): Locator {
    return this.page.getByTestId("unit-brief-text");
  }

  /**
   * Get the faction icon by faction name
   */
  getFactionIcon(): Locator {
    return this.page.getByTestId("faction-link");
  }

  // ==================== Sections ====================

  /**
   * Get the stats section heading
   */
  get statsHeading(): Locator {
    return this.page.getByTestId("stats-heading");
  }

  /**
   * Get the upgrades section heading
   */
  get upgradesHeading(): Locator {
    return this.page.getByTestId("upgrades-heading");
  }

  /**
   * Get the abilities section
   */
  get abilitiesSection(): Locator {
    return this.page.getByTestId("abilities-section");
  }

  /**
   * Get the weapons/loadout section
   */
  get weaponsSection(): Locator {
    return this.page.getByTestId("loadout-section");
  }

  /**
   * Get the loadout section heading
   */
  get loadoutHeading(): Locator {
    return this.page.getByTestId("loadout-heading");
  }

  /**
   * Get the veterancy section
   */
  get veterancySection(): Locator {
    return this.page.getByTestId("veterancy-section");
  }

  /**
   * Get the hitpoints section
   */
  get hitpointsSection(): Locator {
    return this.page.getByTestId("hitpoints-section");
  }

  /**
   * Get the can construct section
   */
  get canConstructSection(): Locator {
    return this.page.getByTestId("can-construct-section");
  }

  /**
   * Get costs section (nth parameter to select which one)
   */
  getCostsSection(nth: number = 0): Locator {
    return this.page.getByTestId("costs-section").nth(nth);
  }

  /**
   * Get reinforce section
   */
  get reinforceSection(): Locator {
    return this.page.getByTestId("reinforce-section");
  }

  /**
   * Get upkeep section
   */
  get upkeepSection(): Locator {
    return this.page.getByTestId("upkeep-card");
  }

  // ==================== Images and Icons ====================

  /**
   * Get all images on the page
   */
  get allImages(): Locator {
    return this.page.locator("img");
  }

  /**
   * Get upgrade icons
   */
  get upgradeIcons(): Locator {
    return this.page.getByTestId("upgrades-section").locator("img").first();
  }

  /**
   * Get ability icons
   */
  get abilityIcons(): Locator {
    return this.page.getByTestId("abilities-section").locator("img").first();
  }

  /**
   * Get veterancy star icons
   */
  get vetStars(): Locator {
    return this.page.getByTestId("vet-star");
  }

  // ==================== Health and Squad ====================

  /**
   * Get health bars for squad members
   */
  get squadHealthBars(): Locator {
    return this.page.getByTestId("squad-health-bars").locator('[role="progressbar"]');
  }

  // ==================== Navigation Links ====================

  /**
   * Get faction link
   */
  getFactionLink(): Locator {
    return this.page.getByTestId("faction-link");
  }

  /**
   * Get header logo link
   */
  get headerLogoLink(): Locator {
    return this.page.locator('a[href="/"]');
  }

  // ==================== Navigation Methods ====================

  /**
   * Navigate to a specific unit page
   * @param faction - The faction (american, german, british, dak)
   * @param unitId - The unit ID
   */
  async navigate(faction: string, unitId: string): Promise<void> {
    await this.goto(`/explorer/races/${faction}/units/${unitId}`);
  }

  // ==================== Check Methods ====================

  /**
   * Check if the unit page loaded successfully
   */
  async checkUnitPageLoaded(): Promise<void> {
    await this.checkPageLoaded();
    // Wait for the unit title to be visible instead of networkidle
    // This is more reliable, especially on mobile
    await expect(this.unitTitle).toBeVisible({ timeout: 10000 });
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
    const statsText = await this.page.textContent("body");
    const hasNumbers = /\d+\.?\d*/.test(statsText || "");
    expect(hasNumbers).toBeTruthy();
  }

  /**
   * Check if the abilities section exists (if unit has abilities)
   */
  async checkAbilitiesSectionIfPresent(): Promise<void> {
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
    const upgradesVisible = await this.upgradesHeading.isVisible().catch(() => false);
    if (upgradesVisible) {
      await expect(this.upgradesHeading).toBeVisible();
    }
  }

  /**
   * Check all core stats are visible
   */
  async checkCoreStatsVisible(stats: string[]): Promise<void> {
    for (const stat of stats) {
      const statElement = this.page.getByText(stat).first();
      await expect(statElement).toBeVisible();
    }
  }

  /**
   * Check body text contains specific values
   */
  async checkBodyContains(values: string[]): Promise<void> {
    const bodyText = await this.page.textContent("body");
    expect(bodyText).toBeTruthy();

    for (const value of values) {
      expect(bodyText).toContain(value);
    }
  }

  /**
   * Check body text contains numeric values
   */
  async checkBodyContainsNumbers(): Promise<void> {
    const bodyText = await this.page.textContent("body");
    const hasNumbers = /\d+\.?\d*/.test(bodyText || "");
    expect(hasNumbers).toBeTruthy();
  }

  /**
   * Check all upgrades are visible
   */
  async checkUpgradesVisible(upgrades: string[]): Promise<void> {
    for (const upgrade of upgrades) {
      const upgradeElement = this.page.getByText(upgrade).first();
      await expect(upgradeElement).toBeVisible();
    }
  }

  /**
   * Check all abilities are visible
   */
  async checkAbilitiesVisible(abilities: string[]): Promise<void> {
    for (const ability of abilities) {
      const abilityElement = this.page.getByText(ability).first();
      await expect(abilityElement).toBeVisible();
    }
  }

  /**
   * Check all structures are visible
   */
  async checkStructuresVisible(structures: string[]): Promise<void> {
    for (const structure of structures) {
      const structureElement = this.page.getByText(structure).first();
      await expect(structureElement).toBeVisible();
    }
  }

  /**
   * Check weapon stats are visible
   */
  async checkWeaponStatsVisible(stats: string[]): Promise<void> {
    for (const stat of stats) {
      const statElement = this.page.getByText(stat, { exact: false }).first();
      await expect(statElement).toBeVisible();
    }
  }

  /**
   * Check range categories are visible
   */
  async checkRangeCategoriesVisible(ranges: string[]): Promise<void> {
    for (const range of ranges) {
      const rangeElement = this.page.getByText(range, { exact: true }).first();
      await expect(rangeElement).toBeVisible();
    }
  }

  /**
   * Check if any images are broken (missing src)
   */
  async checkImagesHaveSrc(): Promise<void> {
    const images = this.allImages;
    const count = await images.count();

    expect(count).toBeGreaterThan(5);

    for (let i = 0; i < Math.min(5, count); i++) {
      const src = await images.nth(i).getAttribute("src");
      expect(src).toBeTruthy();
      expect(src?.length).toBeGreaterThan(0);
    }
  }

  /**
   * Check page title contains expected text
   */
  async checkPageTitleContains(texts: string[]): Promise<void> {
    const title = await this.page.title();
    for (const text of texts) {
      expect(title).toContain(text);
    }
  }

  /**
   * Check meta description exists
   */
  async checkMetaDescriptionExists(): Promise<void> {
    const metaDescription = this.page.locator('meta[name="description"]');
    const content = await metaDescription.getAttribute("content");
    expect(content).toBeTruthy();
  }

  /**
   * Check page has no error messages
   */
  async checkNoErrorMessages(): Promise<void> {
    const bodyText = await this.page.textContent("body");
    expect(bodyText?.toLowerCase()).not.toContain("something went wrong");
  }

  /**
   * Check if specific text appears in body (case insensitive)
   */
  async checkBodyContainsText(texts: string[], caseSensitive: boolean = false): Promise<void> {
    const bodyText = await this.page.textContent("body");
    expect(bodyText).toBeTruthy();

    for (const text of texts) {
      if (caseSensitive) {
        expect(bodyText).toContain(text);
      } else {
        expect(bodyText?.toLowerCase()).toContain(text.toLowerCase());
      }
    }
  }

  /**
   * Get the number of squad members displayed
   */
  async getSquadMemberCount(): Promise<number> {
    return await this.squadHealthBars.count();
  }

  /**
   * Check upgrade icons exist
   */
  async checkUpgradeIconsExist(): Promise<void> {
    const count = await this.upgradeIcons.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Check ability icons exist
   */
  async checkAbilityIconsExist(): Promise<void> {
    const count = await this.abilityIcons.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Check vet stars exist
   */
  async checkVetStarsExist(): Promise<void> {
    const count = await this.vetStars.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Check squad health bars count
   */
  async checkSquadHealthBarsCount(minCount: number): Promise<void> {
    const count = await this.squadHealthBars.count();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  /**
   * Check if a specific upgrade is present
   */
  async hasUpgrade(upgradeName: string): Promise<boolean> {
    const upgradeElement = this.page.getByText(upgradeName).first();
    return await upgradeElement.isVisible().catch(() => false);
  }

  /**
   * Check if a specific ability is present
   */
  async hasAbility(abilityName: string): Promise<boolean> {
    const abilityElement = this.page.getByText(abilityName).first();
    return await abilityElement.isVisible().catch(() => false);
  }

  /**
   * Check if a specific stat is visible
   */
  async isStatVisible(statName: string): Promise<boolean> {
    const statElement = this.page.getByText(statName).first();
    return await statElement.isVisible().catch(() => false);
  }
}
