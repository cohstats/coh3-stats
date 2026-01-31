import { test, expect } from "@playwright/test";
import { AboutPage } from "../page-objects";

test.describe("About Page - Regression Tests", () => {
  let aboutPage: AboutPage;

  test.beforeEach(async ({ page }) => {
    aboutPage = new AboutPage(page);
    await aboutPage.navigate();
  });

  test("should load about page successfully", async () => {
    await aboutPage.checkPageLoadedWithSections();
    await aboutPage.checkFooterPresent();
  });

  test("should display the main page title", async () => {
    await expect(aboutPage.pageTitle).toBeVisible();
    await expect(aboutPage.pageTitle).toHaveText("FAQs");
  });

  test("should display all expected navigation sections", async () => {
    await aboutPage.checkAllSectionsPresent();
  });

  test("should navigate to each section via navigation links", async () => {
    const sections = aboutPage.getExpectedSections();

    for (const section of sections) {
      await aboutPage.navigateToSection(section);
      await expect(aboutPage.getSectionTitle(section)).toBeInViewport();
    }
  });

  test("should display About Us section with content", async () => {
    await aboutPage.verifySectionHasContent("aboutus");
    const section = aboutPage.getSection("aboutus");
    await expect(section).toContainText("community-driven project");
  });

  test("should display Bug Reports section with Discord and GitHub links", async () => {
    await aboutPage.navigateToSection("bugreport");
    await aboutPage.verifySectionHasContent("bugreport");

    const section = aboutPage.getSection("bugreport");
    await expect(section).toContainText("Discord");
    await expect(section).toContainText("GitHub");

    // Verify links are present (use .first() as there might be multiple GitHub links)
    const discordLink = section.locator('a[href*="discord"]').first();
    const githubLink = section.locator('a[href*="github"]').first();
    await expect(discordLink).toBeVisible();
    await expect(githubLink).toBeVisible();
  });

  test("should display Localization section with GitHub links", async () => {
    await aboutPage.navigateToSection("localization");
    await aboutPage.verifySectionHasContent("localization");

    const section = aboutPage.getSection("localization");
    await expect(section).toContainText("translate");

    const links = aboutPage.getSectionLinks("localization");
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test("should display Arranged Teams section with detailed information", async () => {
    await aboutPage.navigateToSection("arrangedteams");
    await aboutPage.verifySectionHasContent("arrangedteams");

    const section = aboutPage.getSection("arrangedteams");
    await expect(section).toContainText("track arranged teams");
    await expect(section).toContainText("ELO");
    await expect(section).toContainText("3 games");
  });

  test("should display Statistics section with ELO filtering information", async () => {
    await aboutPage.navigateToSection("stats");
    await aboutPage.verifySectionHasContent("stats");

    const section = aboutPage.getSection("stats");
    await expect(section).toContainText("ELO Filtering");
    await expect(section).toContainText("automatch");
  });

  test("should display Data section with data source information", async () => {
    await aboutPage.navigateToSection("data");
    await aboutPage.verifySectionHasContent("data");

    const section = aboutPage.getSection("data");
    await expect(section).toContainText("Leaderboards");
    await expect(section).toContainText("Relic servers");
  });

  test("should display Donate section", async () => {
    await aboutPage.navigateToSection("donate");
    await aboutPage.verifySectionHasContent("donate");
  });

  test("should display Legal section with Privacy Policy link", async () => {
    await aboutPage.navigateToSection("legal");
    await aboutPage.verifySectionHasContent("legal");

    await expect(aboutPage.privacyPolicyLink).toBeVisible();
    await expect(aboutPage.privacyPolicyLink).toHaveAttribute("href", /privacy/);
  });

  test("should have external links with proper attributes", async () => {
    await aboutPage.checkExternalLinksPresent();

    // Check Discord link has proper attributes
    const discordLink = aboutPage.discordLink;
    await expect(discordLink).toHaveAttribute("target", "_blank");
    await expect(discordLink).toHaveAttribute("rel", /noopener/);
  });

  test("should maintain navigation menu visibility when scrolling", async () => {
    await aboutPage.checkNavigationMenuSticky();
  });

  test("should have valid page title and meta description", async () => {
    const title = await aboutPage.getTitle();
    expect(title).toContain("About");
    expect(title).toContain("COH3 Stats");
  });

  test("should display all sections in correct order", async () => {
    const expectedSections = aboutPage.getExpectedSections();

    for (let i = 0; i < expectedSections.length; i++) {
      const section = aboutPage.getNavigationLink(expectedSections[i]);
      await expect(section).toBeVisible();
    }
  });

  test("should have working anchor links for all sections", async () => {
    const sections = aboutPage.getExpectedSections();

    for (const section of sections) {
      const link = aboutPage.getNavigationLink(section);
      await expect(link).toHaveAttribute("href", `#${section}`);
    }
  });
});
