import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the About Page
 * Contains all selectors and methods for interacting with the about/FAQ page
 */
export class AboutPage extends BasePage {
  /**
   * Navigate to the about page
   */
  async navigate(): Promise<void> {
    await this.goto("/about");
  }

  /**
   * Get the main page title (FAQs)
   */
  get pageTitle(): Locator {
    return this.page.locator("h1").filter({ hasText: "FAQs" });
  }

  /**
   * Get the navigation menu (left sidebar)
   */
  get navigationMenu(): Locator {
    return this.page.locator('[href^="#"]').first().locator("..");
  }

  /**
   * Get all navigation links in the sidebar
   */
  get navigationLinks(): Locator {
    return this.page.locator('a[href^="#"]');
  }

  /**
   * Get a specific navigation link by section name
   */
  getNavigationLink(sectionName: string): Locator {
    return this.page.locator(`a[href="#${sectionName}"]`);
  }

  /**
   * Get a section by its ID
   * The section structure is: <div><span id="sectionId"></span><Title>...</Title>{content}</div>
   * So we get the parent div of the span anchor
   */
  getSection(sectionId: string): Locator {
    return this.page.locator(`#${sectionId}`).locator("..");
  }

  /**
   * Get section title by section ID
   * The Title component renders as h3 and is a sibling of the span#id
   */
  getSectionTitle(sectionId: string): Locator {
    // Find the span with the id, then get its parent div, then find the h3 within that div
    return this.page.locator(`#${sectionId}`).locator("..").locator("h3, h2, h1").first();
  }

  /**
   * Check if the page has loaded with all main sections
   */
  async checkPageLoadedWithSections(): Promise<void> {
    await this.checkPageLoaded();
    await expect(this.pageTitle).toBeVisible();
    await expect(this.navigationLinks.first()).toBeVisible();
  }

  /**
   * Click on a navigation link and verify the section is visible
   */
  async navigateToSection(sectionId: string): Promise<void> {
    await this.getNavigationLink(sectionId).click();
    // Wait for scroll to complete
    await this.page.waitForTimeout(500);
    // Verify section is in viewport
    await expect(this.getSectionTitle(sectionId)).toBeInViewport();
  }

  /**
   * Get all expected sections on the about page
   */
  getExpectedSections(): string[] {
    return [
      "aboutus",
      "bugreport",
      "localization",
      "arrangedteams",
      "stats",
      "data",
      "donate",
      "legal",
    ];
  }

  /**
   * Check if all expected sections are present
   */
  async checkAllSectionsPresent(): Promise<void> {
    const sections = this.getExpectedSections();
    for (const section of sections) {
      await expect(this.getNavigationLink(section)).toBeVisible();
    }
  }

  /**
   * Get Discord link
   */
  get discordLink(): Locator {
    return this.page.locator('a[href*="discord"]').first();
  }

  /**
   * Get GitHub link
   */
  get githubLink(): Locator {
    return this.page.locator('a[href*="github"]').first();
  }

  /**
   * Get Privacy Policy link
   */
  get privacyPolicyLink(): Locator {
    return this.page.locator('a[href*="privacy"]');
  }

  /**
   * Check if external links are present and valid
   */
  async checkExternalLinksPresent(): Promise<void> {
    await expect(this.discordLink).toBeVisible();
    await expect(this.githubLink).toBeVisible();
  }

  /**
   * Verify a section contains expected content
   */
  async verifySectionHasContent(sectionId: string): Promise<void> {
    const section = this.getSection(sectionId);
    await expect(section).toBeVisible();

    // Check that section has some text content
    const textContent = await section.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent!.length).toBeGreaterThan(10);
  }

  /**
   * Get all anchor links in a section
   */
  getSectionLinks(sectionId: string): Locator {
    return this.getSection(sectionId).locator("a");
  }

  /**
   * Check if navigation menu is sticky (visible when scrolling)
   */
  async checkNavigationMenuSticky(): Promise<void> {
    // Scroll down the page
    await this.page.evaluate(() => window.scrollBy(0, 500));
    await this.page.waitForTimeout(300);

    // Navigation should still be visible
    await expect(this.navigationLinks.first()).toBeVisible();
  }
}
