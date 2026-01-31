import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home-page";

test.describe("Home Page - Page Object Pattern", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test("should load successfully", async () => {
    await homePage.checkPageLoaded();
    await homePage.checkFooterPresent();
  });

  test("should display all main sections", async () => {
    await homePage.checkMainSectionsVisible();
  });

  test("should have correct page title", async () => {
    const title = await homePage.getTitle();
    expect(title).toContain("COH3");
  });

  test.describe("News Section", () => {
    test("should display news carousel or fallback image", async () => {
      // Either the carousel or the fallback image should be visible
      const newsCarousel = homePage.newsCarousel;
      const fallbackImage = homePage.page.locator('img[alt="coh3-background"]');

      await expect(newsCarousel.or(fallbackImage)).toBeVisible();
    });

    test("should have carousel indicators when news data is available", async () => {
      const newsCarousel = homePage.newsCarousel;
      const isCarouselVisible = await newsCarousel.isVisible().catch(() => false);

      if (isCarouselVisible) {
        const indicators = homePage.newsCarouselIndicators;
        const indicatorCount = await indicators.count();
        expect(indicatorCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Info Cards Section", () => {
    test("should display DPS Calculator card", async () => {
      await expect(homePage.dpsCalculatorCard).toBeVisible();
      await expect(homePage.dpsCalculatorCard).toContainText(/DPS|Calculator/i);
    });

    test("should display Unit Browser card", async () => {
      await expect(homePage.unitBrowserCard).toBeVisible();
      await expect(homePage.unitBrowserCard).toContainText(/Unit|Browser/i);
    });

    test("should navigate to DPS Calculator when card is clicked", async ({ page }) => {
      await homePage.clickDPSCalculatorCard();
      await page.waitForURL(/.*\/explorer\/dps.*/);
      expect(page.url()).toContain("/explorer/dps");
    });

    test("should navigate to Unit Browser when card is clicked", async ({ page }) => {
      await homePage.clickUnitBrowserCard();
      await page.waitForURL(/.*unit-browser.*/);
      expect(page.url()).toContain("unit-browser");
    });
  });

  test.describe("Leaderboards Section", () => {
    test("should display leaderboards section with title", async () => {
      await expect(homePage.leaderboardsSection).toBeVisible();
      await expect(homePage.leaderboardsSection).toContainText(/Leaderboard/i);
    });

    test("should have all faction tabs", async () => {
      const tabs = homePage.leaderboardsTabs;
      const tabCount = await tabs.count();
      expect(tabCount).toBe(4);

      await expect(homePage.getLeaderboardTab("american")).toBeVisible();
      await expect(homePage.getLeaderboardTab("british")).toBeVisible();
      await expect(homePage.getLeaderboardTab("german")).toBeVisible();
      await expect(homePage.getLeaderboardTab("dak")).toBeVisible();
    });

    test("should display leaderboards table with data", async () => {
      await homePage.checkLeaderboardsTableHasData();
    });

    test("should switch between faction tabs", async () => {
      // Switch to British
      await homePage.switchLeaderboardTab("british");
      await expect(homePage.getLeaderboardTab("british")).toHaveAttribute(
        "aria-selected",
        "true",
      );

      // Switch to German
      await homePage.switchLeaderboardTab("german");
      await expect(homePage.getLeaderboardTab("german")).toHaveAttribute("aria-selected", "true");

      // Switch to DAK
      await homePage.switchLeaderboardTab("dak");
      await expect(homePage.getLeaderboardTab("dak")).toHaveAttribute("aria-selected", "true");

      // Switch back to American
      await homePage.switchLeaderboardTab("american");
      await expect(homePage.getLeaderboardTab("american")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    test("should have View Full Leaderboard button", async () => {
      await expect(homePage.viewFullLeaderboardButton).toBeVisible();
    });

    test("should navigate to full leaderboard when button is clicked", async ({ page }) => {
      await homePage.clickViewFullLeaderboard();
      await page.waitForURL(/.*leaderboards.*/);
      expect(page.url()).toContain("leaderboards");
    });
  });

  test.describe("Reddit Panel", () => {
    test("should display reddit panel", async () => {
      await expect(homePage.redditPanel).toBeVisible();
      await expect(homePage.redditPanel).toContainText(/Reddit/i);
    });

    test("should display reddit posts if available", async () => {
      const isVisible = await homePage.redditPanel.isVisible();
      if (isVisible) {
        await homePage.checkRedditPanelHasPosts();
      }
    });
  });

  test.describe("YouTube Panel", () => {
    test("should display youtube panel", async () => {
      await expect(homePage.youtubePanel).toBeVisible();
      await expect(homePage.youtubePanel).toContainText(/Last week's videos/i);
    });

    test("should display youtube videos if available", async () => {
      const videos = homePage.youtubeVideos;
      const videoCount = await videos.count();

      if (videoCount > 0) {
        expect(videoCount).toBeGreaterThan(0);
        await expect(videos.first()).toBeVisible();
      }
    });
  });

  test.describe("Twitch Panel", () => {
    test("should display twitch panel", async ({ page }) => {
      // Scroll to bottom to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      // Wait for the panel to be visible after lazy loading
      await expect(homePage.twitchPanel).toBeVisible({ timeout: 10000 });
      await expect(homePage.twitchPanel).toContainText(/Watch Live Streams/i);
    });

    test("should display twitch streams or no streams message", async ({ page }) => {
      // Scroll to bottom to trigger lazy loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      // Wait for the panel to be visible after lazy loading
      await expect(homePage.twitchPanel).toBeVisible({ timeout: 10000 });

      // Wait a bit for content to load
      await page.waitForTimeout(2000);

      const streams = homePage.twitchStreams;
      const streamCount = await streams.count();

      if (streamCount > 0) {
        // If there are streams, verify they are visible
        expect(streamCount).toBeGreaterThan(0);
        await expect(streams.first()).toBeVisible();
      } else {
        // If no streams, check for "no streams" message
        const panelText = await homePage.twitchPanel.textContent();
        expect(panelText).toMatch(/No English speaking streams|No streams/i);
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should be responsive on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.navigate();
      await homePage.checkPageLoaded();
      await homePage.checkMainSectionsVisible();
    });

    test("should be responsive on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await homePage.navigate();
      await homePage.checkPageLoaded();
      await homePage.checkMainSectionsVisible();
    });

    test("should be responsive on desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await homePage.navigate();
      await homePage.checkPageLoaded();
      await homePage.checkMainSectionsVisible();
    });
  });

  test.describe("Header and Footer", () => {
    test("should display header with logo and navigation", async () => {
      await expect(homePage.header).toBeVisible();
      await expect(homePage.header).toContainText(/COH3 Stats/i);
    });

    test("should display footer with copyright and links", async () => {
      await expect(homePage.footer).toBeVisible();
      await expect(homePage.footer).toContainText(/COH3stats.com/i);
    });
  });
});
