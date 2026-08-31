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

  // Version Comparison Section
  get comparisonTable(): Locator {
    return this.getByTestId("comparison-table");
  }

  get comparisonFeatureRows(): Locator {
    return this.getByTestId("comparison-feature-row");
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
   * Get the number of feature rows in the comparison table
   */
  async getComparisonFeatureRowCount(): Promise<number> {
    return await this.comparisonFeatureRows.count();
  }

  /**
   * Get the number of features included in a given column of the comparison table.
   * Column 1 is the Free Download column, column 2 is the Microsoft Store column.
   */
  async getIncludedFeatureCount(column: 1 | 2): Promise<number> {
    return await this.comparisonFeatureRows
      .locator(`td:nth-child(${column + 1}) .tabler-icon-check`)
      .count();
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
