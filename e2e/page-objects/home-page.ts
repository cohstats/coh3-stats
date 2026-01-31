import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Home Page
 * Contains all selectors and methods for interacting with the homepage
 */
export class HomePage extends BasePage {
  // News Section
  get newsCarousel(): Locator {
    return this.getByTestId("news-carousel");
  }

  get newsCarouselSlides(): Locator {
    return this.newsCarousel.locator(".mantine-Carousel-slide");
  }

  get newsCarouselIndicators(): Locator {
    return this.newsCarousel.locator(".mantine-Carousel-indicator");
  }

  // Info Cards Section
  get dpsCalculatorCard(): Locator {
    return this.getByTestId("dps-calculator-card");
  }

  get unitBrowserCard(): Locator {
    return this.getByTestId("unit-browser-card");
  }

  // Leaderboards Section
  get leaderboardsSection(): Locator {
    return this.getByTestId("leaderboards-section");
  }

  get leaderboardsTabs(): Locator {
    return this.leaderboardsSection.locator('[role="tab"]');
  }

  getLeaderboardTab(faction: "american" | "british" | "german" | "dak"): Locator {
    const tabNames = {
      american: "USF",
      british: "British",
      german: "Wehrmacht",
      dak: "DAK",
    };
    return this.leaderboardsSection.locator(`[role="tab"]:has-text("${tabNames[faction]}")`);
  }

  get leaderboardsTable(): Locator {
    return this.leaderboardsSection.locator("table");
  }

  get viewFullLeaderboardButton(): Locator {
    return this.leaderboardsSection.getByRole("link", { name: /view full leaderboard/i });
  }

  // Reddit Panel
  get redditPanel(): Locator {
    return this.getByTestId("reddit-panel");
  }

  get redditPosts(): Locator {
    return this.redditPanel.locator('[data-testid^="reddit-post-"]');
  }

  // YouTube Panel
  get youtubePanel(): Locator {
    return this.getByTestId("youtube-panel");
  }

  get youtubeVideos(): Locator {
    return this.youtubePanel.locator('[data-testid^="youtube-video-"]');
  }

  // Twitch Panel
  get twitchPanel(): Locator {
    return this.getByTestId("twitch-panel");
  }

  get twitchStreams(): Locator {
    return this.twitchPanel.locator('[data-testid^="twitch-stream-"]');
  }

  /**
   * Navigate to the homepage
   */
  async navigate(): Promise<void> {
    await this.goto("/");
  }

  /**
   * Check if all main sections are visible
   */
  async checkMainSectionsVisible(): Promise<void> {
    // Wait for page to be fully loaded first
    await this.page.waitForLoadState("networkidle");

    // Check for news section - either carousel or fallback image
    // The Mantine Image component renders as img inside a div
    const newsSection = this.newsCarousel
      .or(this.page.locator('img[alt="coh3-background"]'))
      .or(this.page.locator('img[src*="coh3-background"]'));
    await expect(newsSection).toBeVisible({ timeout: 10000 });

    await expect(this.dpsCalculatorCard).toBeVisible();
    await expect(this.unitBrowserCard).toBeVisible();
    await expect(this.leaderboardsSection).toBeVisible();
  }

  /**
   * Click on DPS Calculator card
   */
  async clickDPSCalculatorCard(): Promise<void> {
    await this.dpsCalculatorCard.click();
  }

  /**
   * Click on Unit Browser card
   */
  async clickUnitBrowserCard(): Promise<void> {
    await this.unitBrowserCard.click();
  }

  /**
   * Switch to a specific leaderboard faction tab
   */
  async switchLeaderboardTab(faction: "american" | "british" | "german" | "dak"): Promise<void> {
    await this.getLeaderboardTab(faction).click();
    // Wait for the table to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if leaderboards table has data
   */
  async checkLeaderboardsTableHasData(): Promise<void> {
    // Wait for the table to load data (it fetches from API)
    await this.page.waitForTimeout(1000);
    const rows = this.leaderboardsTable.locator("tbody tr");
    // Check that rows exist
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    // Check that at least one row is visible (not all rows may be visible due to scrolling)
    await expect(rows.first()).toBeAttached();
  }

  /**
   * Click on View Full Leaderboard button
   */
  async clickViewFullLeaderboard(): Promise<void> {
    await this.viewFullLeaderboardButton.click();
  }

  /**
   * Check if Reddit panel has posts
   */
  async checkRedditPanelHasPosts(): Promise<void> {
    const isVisible = await this.redditPanel.isVisible();
    if (isVisible) {
      const posts = await this.redditPosts.count();
      expect(posts).toBeGreaterThan(0);
    }
  }
}
