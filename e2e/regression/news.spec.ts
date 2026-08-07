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

  test("should deep link a post through its anchor", async ({ page }) => {
    await navigateAndWait(page, "/news");

    // Every post gets an id and an anchor pointing at it, so a post can be linked directly.
    const anchor = page.locator('.mantine-Card-root a[href^="#"]').first();
    await expect(anchor).toBeVisible();

    const href = await anchor.getAttribute("href");
    expect(href).toMatch(/^#.+/);
    await expect(page.locator(`[id="${href!.slice(1)}"]`)).toHaveCount(1);
  });

  test("should page through the feed when there is more than one page", async ({ page }) => {
    await navigateAndWait(page, "/news");

    const pagination = page.locator(".mantine-Pagination-root");
    if ((await pagination.count()) === 0) {
      test.skip(true, "The feed currently fits on a single page");
    }

    const firstTitle = await page.locator(".mantine-Card-root h2").first().innerText();

    await pagination.getByRole("button", { name: "2" }).click();

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
