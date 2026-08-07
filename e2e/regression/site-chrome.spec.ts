import { test, expect } from "@playwright/test";
import { SiteChromePage } from "../page-objects/site-chrome-page";

/**
 * Regression tests for the site chrome - the header and the footer, which every page renders.
 *
 * A broken header breaks every page of the site, but until now it was only ever asserted
 * incidentally on the home page. The header ships two separate trees (desktop / mobile), so the
 * suite runs this spec on both a desktop and a phone viewport and each describe below picks the one
 * it applies to.
 */

test.describe("Site chrome - header (desktop)", () => {
  test.skip(({ isMobile }) => !!isMobile, "Desktop header only");

  test("should render the logo, the nav and the tools", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await expect(chrome.header).toBeVisible();
    await expect(chrome.logoLink).toBeVisible();
    await expect(chrome.logoLink).toContainText("COH3 Stats");

    // The top level entries. `Statistics`, `Explorer` and `Other` are hover cards, not links.
    for (const href of ["/leaderboards", "/live-games?type=4v4", "/desktop-app", "/about"]) {
      await expect(chrome.menuLink(href)).toBeVisible();
    }
    for (const label of ["Statistics", "Explorer", "Other"]) {
      await expect(chrome.navMenu(label)).toBeVisible();
    }

    await expect(chrome.searchInput).toBeVisible();
    await expect(chrome.colorSchemeToggle).toBeVisible();
    await expect(chrome.languageSwitcher).toBeVisible();
  });

  test("should open the Statistics dropdown and navigate from it", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await chrome.navMenu("Statistics").hover();

    for (const href of [
      "/stats/games",
      "/stats/maps",
      "/stats/players",
      "/stats/leaderboards",
      "/stats/achievements",
    ]) {
      await expect(chrome.menuLink(href)).toBeVisible();
    }

    await chrome.menuLink("/stats/games").click();
    await page.waitForURL("**/stats/games**");
    await chrome.checkPageLoaded();
  });

  test("should open the Explorer dropdown with the faction and tool links", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await chrome.navMenu("Explorer").hover();

    for (const href of ["/explorer/maps", "/explorer/dps", "/explorer/unit-browser"]) {
      await expect(chrome.menuLink(href)).toBeVisible();
    }

    await chrome.menuLink("/explorer/maps").click();
    await page.waitForURL("**/explorer/maps");
    await chrome.checkPageLoaded();
  });

  test("should open the Other dropdown", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await chrome.navMenu("Other").hover();

    for (const href of [
      "/other/ranking-tiers",
      "/other/open-data",
      "/other/relic-api",
      "/news",
    ]) {
      await expect(chrome.menuLink(href)).toBeVisible();
    }
  });

  test("should open the Leaderboards dropdown", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await chrome.menuLink("/leaderboards").hover();

    // The dropdown lists the per-faction / per-mode leaderboard shortcuts.
    await expect(page.locator('a[href^="/leaderboards?race="]:visible').first()).toBeVisible();
  });

  test("should show the online players counter", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await expect(chrome.onlinePlayers).toBeVisible();
    // The badge is filled in by a Steam request after mount.
    await expect(chrome.header.locator(".mantine-Badge-root").first()).toContainText(/\d+/, {
      timeout: 30000,
    });
  });

  test("should link to the donation page in a new tab", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    const donate = chrome.header.locator('a[href*="ko-fi.com"]').first();
    await expect(donate).toBeVisible();
    await expect(donate).toContainText(/Support Us/i);
  });
});

test.describe("Site chrome - colour scheme toggle", () => {
  test("should switch the scheme and persist it across a navigation", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    // The dev-site dialog sits over the bottom left corner, which is where the drawer keeps both
    // of its tools.
    await chrome.dismissDevSiteNotification();
    // Mobile keeps the toggle inside the burger menu.
    if (page.viewportSize() && page.viewportSize()!.width < 800) {
      await chrome.openMobileMenu();
    }

    const before = await chrome.colorScheme();
    await chrome.colorSchemeToggle.click();

    const after = before === "dark" ? "light" : "dark";
    await expect.poll(() => chrome.colorScheme()).toBe(after);
    expect(await chrome.storedColorScheme()).toBe(after);

    // The choice lives in local storage, so it survives a full page load.
    await chrome.goto("/about");
    expect(await chrome.colorScheme()).toBe(after);
  });
});

test.describe("Site chrome - language switcher", () => {
  test("should offer the languages and keep the current one selected", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await chrome.dismissDevSiteNotification();
    if (page.viewportSize() && page.viewportSize()!.width < 800) {
      await chrome.openMobileMenu();
    }

    await expect(chrome.languageSwitcher).toHaveValue("English");

    await chrome.languageSwitcher.click();
    const options = page.locator('[role="option"]:visible');
    expect(await options.count()).toBeGreaterThan(5);
    await expect(options.filter({ hasText: "Deutsch" }).first()).toBeVisible();
    await expect(options.filter({ hasText: "Čeština" }).first()).toBeVisible();
  });
});

test.describe("Site chrome - mobile burger menu", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile header only");

  test("should open the drawer with the whole navigation", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await expect(chrome.burger).toBeVisible();
    await chrome.openMobileMenu();

    await expect(chrome.drawer).toContainText("Navigation");
    // The search box moves into the drawer on mobile.
    await expect(chrome.searchInput).toBeVisible();

    for (const label of ["Leaderboards", "Statistics", "Explorer", "Other"]) {
      await expect(chrome.drawerAccordion(label)).toBeVisible();
    }
    for (const href of ["/live-games?type=4v4", "/desktop-app", "/about", "/news"]) {
      await expect(chrome.drawer.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    // Both tools are at the bottom of the drawer.
    await expect(chrome.colorSchemeToggle).toBeVisible();
    await expect(chrome.languageSwitcher).toBeVisible();
  });

  test("should navigate from the drawer and close it", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");
    await chrome.openMobileMenu();

    await chrome.drawer.locator('a[href="/about"]').first().click();

    await page.waitForURL("**/about");
    await expect(chrome.drawer).toBeHidden();
    await chrome.checkPageLoaded();
  });

  test("should expand a collapsed section", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");
    await chrome.openMobileMenu();

    await chrome.drawerAccordion("Statistics").click();

    await expect(chrome.drawer.locator('a[href="/stats/games"]')).toBeVisible();
    await expect(chrome.drawer.locator('a[href="/stats/players"]')).toBeVisible();
  });

  test("should redirect to the search page from the drawer search box", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");
    await chrome.openMobileMenu();

    // Clicking the box already redirects to the empty search page on mobile.
    await chrome.searchInput.click();
    await page.waitForURL(/\/search/, { timeout: 15000 });
    await expect(page.getByTestId("search-input")).toBeVisible();
  });
});

test.describe("Site chrome - dev site notification", () => {
  test("should warn about the non-production host and be dismissable", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    // `config.isDevEnv()` is true for every hostname except `coh3stats.com`.
    await expect(chrome.devSiteNotification).toBeVisible();
    await expect(chrome.devSiteNotification).toContainText(/dev version of the site/i);
    await expect(
      chrome.devSiteNotification.locator('a[href="https://coh3stats.com"]'),
    ).toBeVisible();

    await chrome.dismissDevSiteNotification();
    await expect(chrome.devSiteNotification).toBeHidden();
  });
});

test.describe("Site chrome - footer", () => {
  test("should render the patch info and the external links", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await expect(chrome.footer).toBeVisible();
    await expect(chrome.footer).toContainText(/COH3stats\.com/i);
    await expect(chrome.footer).toContainText(/Game patch/i);
    // Unofficial-site + trademark disclaimers.
    await expect(chrome.footer).toContainText(/Relic Entertainment/i);

    for (const href of ["discord", "github.com", "ko-fi.com", "coh2stats.com"]) {
      await expect(chrome.footerLink(href)).toBeVisible();
    }
  });

  test("should be rendered on a content page too", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/leaderboards");

    await expect(chrome.header).toBeVisible();
    await expect(chrome.footer).toBeVisible();
  });
});
