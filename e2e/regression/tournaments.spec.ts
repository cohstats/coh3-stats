import { test, expect } from "@playwright/test";
import { SiteChromePage, TournamentsPage } from "../page-objects";

/**
 * Regression tests for the Tournaments hub and the Ladder Tournament league page.
 *
 * The Ladder Tournament data needs a server side API token, which CI may not have - the league
 * page then renders the unavailable state, so the tests accept either of them.
 */

test.describe("Tournaments - menu link", () => {
  test("should navigate to the hub from the desktop menu", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Desktop header only");
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");

    await chrome.menuLink("/tournaments").click();

    await page.waitForURL("**/tournaments");
    await expect(new TournamentsPage(page).hub).toBeVisible();
  });

  test("should navigate to the hub from the mobile drawer", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile header only");
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");
    await chrome.openMobileMenu();

    await chrome.drawer.locator('a[href="/tournaments"]').first().click();

    await page.waitForURL("**/tournaments");
    await expect(chrome.drawer).toBeHidden();
    await expect(new TournamentsPage(page).hub).toBeVisible();
  });
});

test.describe("Tournaments - hub", () => {
  test("should show the three tournament cards", async ({ page }) => {
    const tournamentsPage = new TournamentsPage(page);
    await tournamentsPage.navigate();
    await tournamentsPage.checkPageLoaded();

    expect(await tournamentsPage.getTitle()).toContain("Tournaments");
    await expect(tournamentsPage.tournamentCards).toHaveCount(3);
    await expect(tournamentsPage.tournamentCard("ladderTournament")).toBeVisible();
  });

  test("should link the external tournaments out in a new tab", async ({ page }) => {
    const tournamentsPage = new TournamentsPage(page);
    await tournamentsPage.navigate();

    // The registry can't be imported here (it imports the logo image), so only the shape of the URL
    for (const id of ["ironclad", "metaplays"] as const) {
      const card = tournamentsPage.tournamentCard(id);
      await expect(card).toHaveAttribute("href", /^https:\/\/(?!coh3stats\.com)/);
      await expect(card).toHaveAttribute("target", "_blank");
      await expect(card).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("should open the league page from the featured card", async ({ page }) => {
    const tournamentsPage = new TournamentsPage(page);
    await tournamentsPage.navigate();

    await tournamentsPage.openLeagueButton.click();

    await page.waitForURL("**/tournaments/ladder-tournament");
    await expect(tournamentsPage.leaguePage).toBeVisible();
  });
});

test.describe("Tournaments - Ladder Tournament league page", () => {
  test("should load the standings or the unavailable state", async ({ page }) => {
    const tournamentsPage = new TournamentsPage(page);
    await tournamentsPage.navigateToLeague();
    await tournamentsPage.checkPageLoaded();

    expect(await tournamentsPage.getTitle()).toContain("Ladder Tournament");
    await expect(
      tournamentsPage.standingsTable.or(tournamentsPage.unavailableNotice),
    ).toBeVisible();

    if (await tournamentsPage.standingsTable.isVisible()) {
      await expect(tournamentsPage.allSeasonsTable).toBeVisible();
      await expect(tournamentsPage.standingsTable.locator("tbody tr").first()).toBeVisible();
    }
  });

  test("should return 404 for an invalid season", async ({ page }) => {
    const response = await page.goto("/tournaments/ladder-tournament/season/abc");

    expect(response?.status()).toBe(404);
  });

  test("should not scroll horizontally on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const tournamentsPage = new TournamentsPage(page);

    for (const path of ["/tournaments", "/tournaments/ladder-tournament"]) {
      await tournamentsPage.goto(path);
      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(hasHorizontalScroll).toBe(false);
    }
  });
});
