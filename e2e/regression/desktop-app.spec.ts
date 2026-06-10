import { test, expect } from "@playwright/test";
import { DesktopAppPage } from "../page-objects";

// Enable serial mode - all tests run in order, sharing the same page
test.describe.configure({ mode: "serial" });

test.describe("Desktop App Page", () => {
  let desktopAppPage: DesktopAppPage;

  // Load page once before all tests
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    desktopAppPage = new DesktopAppPage(page);
    await desktopAppPage.navigate();
    await desktopAppPage.waitForPageLoad();
  });

  // Close page after all tests
  test.afterAll(async () => {
    await desktopAppPage.page.close();
  });

  test.describe("Page Load Tests", () => {
    test("should load successfully without errors", async () => {
      await desktopAppPage.checkPageLoaded();
    });

    test("should have correct page title", async () => {
      const title = await desktopAppPage.getTitle();
      expect(title).toContain("Grenadier - COH3 Companion");
    });
  });

  test.describe("Carousel Section", () => {
    test("should have 6 carousel slides", async () => {
      const slideCount = await desktopAppPage.getCarouselSlideCount();
      expect(slideCount).toBe(6);
    });

    test("should have 6 carousel indicators", async () => {
      const indicatorCount = await desktopAppPage.getCarouselIndicatorCount();
      expect(indicatorCount).toBe(6);
    });
  });

  test.describe("Download Section", () => {
    test("Microsoft Store button should link to correct URL", async () => {
      await expect(desktopAppPage.microsoftStoreButton).toHaveAttribute(
        "href",
        "https://apps.microsoft.com/detail/9PBKK60PKDQS",
      );
    });

    test("Microsoft Store button should have accessibility label", async () => {
      const ariaLabel = await desktopAppPage.microsoftStoreButton.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain("Grenadier");
    });

    test("Free download button should link to GitHub releases", async () => {
      const href = await desktopAppPage.freeDownloadButton.getAttribute("href");
      expect(href).toContain("github.com");
      expect(href).toContain("cohstats/coh3-stats-desktop-app/releases");
    });

    test("Free download button should display version number", async () => {
      const buttonText = await desktopAppPage.freeDownloadButton.textContent();
      expect(buttonText).toMatch(/v?\d+\.\d+\.\d+/); // Matches version pattern
    });

    test("Download statistics should display version downloads count", async () => {
      await expect(desktopAppPage.downloadStats).toBeVisible();
      const statsText = await desktopAppPage.downloadStats.textContent();
      expect(statsText).toMatch(/\d+/); // Contains at least one number
    });

    test("Total download statistics should display across all versions", async () => {
      await expect(desktopAppPage.totalDownloadStats).toBeVisible();
      const totalStatsText = await desktopAppPage.totalDownloadStats.textContent();
      expect(totalStatsText).toMatch(/\d+/); // Contains at least one number
    });

    test("Release notes link should point to GitHub releases page", async () => {
      await expect(desktopAppPage.releaseNotesLink).toHaveAttribute(
        "href",
        "https://github.com/cohstats/coh3-stats-desktop-app/releases/latest",
      );
    });
  });

  test.describe("Download Options Comparison", () => {
    test("Microsoft Store benefits list should contain exactly 4 items", async () => {
      const count = await desktopAppPage.getMsStoreBenefitsCount();
      expect(count).toBe(4);
    });

    test("Free Download benefits list should contain exactly 2 items", async () => {
      const count = await desktopAppPage.getFreeDownloadBenefitsCount();
      expect(count).toBe(2);
    });
  });

  test.describe("Features Section", () => {
    test("Features list should contain exactly 8 items", async () => {
      const count = await desktopAppPage.getFeaturesCount();
      expect(count).toBe(8);
    });

    test("OBS link should point to obsproject.com with target='_blank'", async () => {
      await expect(desktopAppPage.obsLink).toHaveAttribute("href", "https://obsproject.com/");
      await expect(desktopAppPage.obsLink).toHaveAttribute("target", "_blank");
    });

    test("Twitch Studio link should point to twitch.tv with target='_blank'", async () => {
      await expect(desktopAppPage.twitchStudioLink).toHaveAttribute(
        "href",
        "https://www.twitch.tv/broadcast/studio",
      );
      await expect(desktopAppPage.twitchStudioLink).toHaveAttribute("target", "_blank");
    });
  });

  test.describe("Accessibility", () => {
    test("All external links should have rel='noopener' attribute", async () => {
      await desktopAppPage.checkExternalLinksHaveNoopener();
    });

    test("Both download buttons should have proper aria-labels", async () => {
      const msStoreLabel = await desktopAppPage.microsoftStoreButton.getAttribute("aria-label");
      const freeDownloadLabel =
        await desktopAppPage.freeDownloadButton.getAttribute("aria-label");

      expect(msStoreLabel).toBeTruthy();
      expect(freeDownloadLabel).toBeTruthy();
    });
  });

  test.describe("Responsive Design", () => {
    test("should render correctly on mobile viewport (375x667)", async () => {
      await desktopAppPage.page.setViewportSize({ width: 375, height: 667 });
      await desktopAppPage.navigate();
      await desktopAppPage.checkPageLoaded();
    });

    test("should render correctly on tablet viewport (768x1024)", async () => {
      await desktopAppPage.page.setViewportSize({ width: 768, height: 1024 });
      await desktopAppPage.navigate();
      await desktopAppPage.checkPageLoaded();
    });

    test("should render correctly on desktop viewport (1920x1080)", async () => {
      await desktopAppPage.page.setViewportSize({ width: 1920, height: 1080 });
      await desktopAppPage.navigate();
      await desktopAppPage.checkPageLoaded();
    });
  });
});
