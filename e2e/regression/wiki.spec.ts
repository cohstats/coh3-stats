import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

/**
 * `/wiki` - articles about the game mechanics, written in the code as BBCode.
 * Home -> category -> article, with breadcrumbs, a sidebar and an "On this page" list.
 */

test.describe("Wiki", () => {
  test("should list the categories and open an article from the home page", async ({ page }) => {
    await navigateAndWait(page, "/wiki");
    await checkPageLoaded(page);

    await expect(page.locator("h1").last()).toHaveText("COH3 Wiki");
    await expect(page.getByTestId("wiki-category-card-combat")).toBeVisible();
    await expect(page.getByTestId("wiki-category-card-veterancy")).toBeVisible();

    await page.getByTestId("wiki-article-card-unit-experience-gains").click();
    await expect(page).toHaveURL(/\/wiki\/veterancy\/unit-experience-gains$/);
    await expect(page.locator("h1").last()).toHaveText("How Units Gain Experience");
    await checkFooterPresent(page);
  });

  test("should go back to the category through the breadcrumbs", async ({ page }) => {
    await navigateAndWait(page, "/wiki/combat/scatter");

    const breadcrumbs = page.getByTestId("wiki-breadcrumbs");
    await expect(breadcrumbs).toContainText("Combat Mechanics");
    await breadcrumbs.getByRole("link", { name: "Combat Mechanics" }).click();

    await expect(page).toHaveURL(/\/wiki\/combat$/);
    await expect(page.getByTestId("wiki-group-firing")).toBeVisible();
    await expect(page.getByTestId("wiki-group-accuracy")).toBeVisible();
  });

  test("should mark up the article for search engines", async ({ page }) => {
    await page.goto("/wiki/combat/weapon-firing-cycle", { waitUntil: "domcontentloaded" });

    expect(await page.title()).toContain("The Weapon Firing Cycle");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').last().textContent()) ?? "{}",
    );
    const types = jsonLd["@graph"].map((node: { "@type": string }) => node["@type"]);
    expect(types).toEqual(["Article", "BreadcrumbList"]);
  });

  test("should show the series and move to the next part", async ({ page }) => {
    await navigateAndWait(page, "/wiki/combat/weapon-firing-cycle");

    await expect(page.getByTestId("wiki-series-part")).toHaveText("Part 1 of 3");
    await expect(page.getByTestId("wiki-previous")).toHaveCount(0);
    await page.getByTestId("wiki-next").click();
    await expect(page).toHaveURL(/\/wiki\/combat\/rate-of-fire-vs-attack-speed$/);
    await expect(page.getByTestId("wiki-series-part")).toHaveText("Part 2 of 3");
  });

  test("should jump to a section from the table of contents", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await navigateAndWait(page, "/wiki/combat/terrain-and-projectile-flight");

    const toc = page.getByTestId("wiki-toc");
    await expect(toc).toBeVisible();
    await toc.getByTestId("wiki-toc-constant-time").click();

    await expect(page).toHaveURL(/#constant-time$/);
    await expect(page.locator("#constant-time")).toBeInViewport();
  });

  test("should be reachable from the main menu", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await navigateAndWait(page, "/");

    await page.locator('header a[href="/wiki"]').first().click();
    await expect(page).toHaveURL(/\/wiki$/);
  });
});
