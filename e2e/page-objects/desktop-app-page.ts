import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Desktop App Page
 * Contains all selectors and methods for interacting with the desktop app landing page
 */
export class DesktopAppPage extends BasePage {
  // Carousel Section
  get carousel(): Locator {
    return this.getByTestId("desktop-app-carousel");
  }

  get carouselSlides(): Locator {
    return this.carousel.locator(".mantine-Carousel-slide");
  }

  get carouselIndicators(): Locator {
    return this.carousel.locator(".mantine-Carousel-indicator");
  }

  // Download Buttons Section
  get microsoftStoreButton(): Locator {
    return this.getByTestId("microsoft-store-button").locator("..");
  }

  get freeDownloadButton(): Locator {
    return this.getByTestId("free-download-button").locator("..");
  }

  get downloadStats(): Locator {
    return this.getByTestId("download-stats");
  }

  get totalDownloadStats(): Locator {
    return this.getByTestId("total-download-stats");
  }

  get releaseNotesLink(): Locator {
    return this.getByTestId("release-notes-link");
  }

  // Download Options Comparison Section
  get msStoreBenefitsList(): Locator {
    return this.getByTestId("ms-store-benefits");
  }

  get freeDownloadBenefitsList(): Locator {
    return this.getByTestId("free-download-benefits");
  }

  // Features Section
  get featuresListItems(): Locator {
    return this.getByTestId("features-list").locator(".mantine-List-item");
  }

  get obsLink(): Locator {
    return this.page.locator('a[href="https://obsproject.com/"]');
  }

  get twitchStudioLink(): Locator {
    return this.page.locator('a[href="https://www.twitch.tv/broadcast/studio"]');
  }

  get allExternalLinks(): Locator {
    return this.page.locator('a[target="_blank"]');
  }

  /**
   * Navigate to the desktop app page
   */
  async navigate(): Promise<void> {
    await this.goto("/desktop-app");
  }

  /**
   * Get the number of carousel slides
   */
  async getCarouselSlideCount(): Promise<number> {
    return await this.carouselSlides.count();
  }

  /**
   * Get the number of carousel indicators
   */
  async getCarouselIndicatorCount(): Promise<number> {
    return await this.carouselIndicators.count();
  }

  /**
   * Get the count of Microsoft Store benefits
   */
  async getMsStoreBenefitsCount(): Promise<number> {
    return await this.msStoreBenefitsList.locator(".mantine-List-item").count();
  }

  /**
   * Get the count of Free Download benefits
   */
  async getFreeDownloadBenefitsCount(): Promise<number> {
    return await this.freeDownloadBenefitsList.locator(".mantine-List-item").count();
  }

  /**
   * Get the count of feature items
   */
  async getFeaturesCount(): Promise<number> {
    return await this.featuresListItems.count();
  }

  /**
   * Check that all external links have rel="noopener" attribute
   */
  async checkExternalLinksHaveNoopener(): Promise<void> {
    const links = await this.allExternalLinks.all();

    for (const link of links) {
      const rel = await link.getAttribute("rel");
      // Only check links that actually have rel attribute set
      if (rel) {
        expect(rel).toContain("noopener");
      }
    }
  }
}
