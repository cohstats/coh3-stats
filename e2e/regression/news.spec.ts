import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

/**
 * `/news` - the COH3 Steam news feed, rendered from BBCode into Mantine cards and paginated.
 *
 * The feed is fetched server side, so a post is always there by the time the page responds.
 */

test.describe("News page", () => {
  test("should render the news posts", async ({ page }) => {
    await navigateAndWait(page, "/news");
    await checkPageLoaded(page);

    await expect(page.locator("h1").last()).toContainText(/News/i);

    // One card per post, each with a title and a "posted by <author> on <date>" line.
    const posts = page.locator(".mantine-Card-root");
    expect(await posts.count()).toBeGreaterThan(0);

    const first = posts.first();
    await expect(first.locator("h2").first()).not.toBeEmpty();
    await expect(first).toContainText(/on \d{2}\/\w{3}\/\d{4}/);
    await checkFooterPresent(page);
  });

  test("should open a post on its own page and go back to all news", async ({ page }) => {
    await navigateAndWait(page, "/news");

    // Every post title links to its article page, so a post can be linked directly.
    const titleLink = page.locator('.mantine-Card-root a[href^="/news/"]').first();
    await expect(titleLink).toBeVisible();
    const title = await titleLink.locator("h2").innerText();
    const href = await titleLink.getAttribute("href");

    await navigateAndWait(page, href!);
    await expect(page.locator("h1").last()).toHaveText(title);
    expect(await page.title()).toContain(title);

    await page.getByRole("link", { name: "All news" }).first().click();
    await expect(page).toHaveURL(/\/news$/);
  });

  test("should return 404 for an unknown post", async ({ page }) => {
    const response = await page.goto("/news/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("should page through the feed when there is more than one page", async ({ page }) => {
    await navigateAndWait(page, "/news");

    const pagination = page.locator(".mantine-Pagination-root");
    if ((await pagination.count()) === 0) {
      test.skip(true, "The feed currently fits on a single page");
    }

    const firstTitle = await page.locator(".mantine-Card-root h2").first().innerText();

    await pagination.getByRole("button", { name: "2", exact: true }).click();

    await expect
      .poll(async () => page.locator(".mantine-Card-root h2").first().innerText())
      .not.toBe(firstTitle);
  });

  test("should set the SEO tags", async ({ page }) => {
    await navigateAndWait(page, "/news");

    await expect(page).toHaveTitle(/News/i);
    await expect(page.locator('meta[name="description"]').first()).toHaveAttribute(
      "content",
      /.+/,
    );
  });
});
