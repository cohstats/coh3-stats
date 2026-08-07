import { test, expect } from "@playwright/test";

/**
 * SEO sweep - §2.16 of the e2e coverage report.
 *
 * `createPageSEO` is used on almost every page, but the title / description / canonical / OpenGraph
 * tags were only ever asserted on about, leaderboards, team-leaderboards, the unit view and Final
 * Stand. This walks the rest of the routes so a broken (or missing) `NextSeo` on any of them shows
 * up as a failing test rather than as a silent SEO regression.
 *
 * The dynamic routes (player, match, map detail, unit detail) assert their own SEO in their specs,
 * because the expected values come from the entity.
 */

/** Routes built with `createPageSEO` / an explicit `NextSeo`, with what their title has to say. */
const PAGES: Array<{ path: string; title: RegExp; canonical?: RegExp }> = [
  { path: "/", title: /COH3 Stats/i, canonical: /coh3stats\.com\/?$/ },
  { path: "/leaderboards", title: /Leaderboards/i },
  { path: "/leaderboards-teams", title: /Team/i },
  { path: "/search", title: /Search/i },
  { path: "/news", title: /News/i },
  { path: "/live-games", title: /Live Games/i, canonical: /\/live-games$/ },
  { path: "/desktop-app", title: /Companion|Desktop/i },
  { path: "/about", title: /About/i },
  { path: "/explorer", title: /Explorer|COH3/i, canonical: /\/explorer$/ },
  { path: "/explorer/maps", title: /Maps/i, canonical: /\/explorer\/maps$/ },
  { path: "/explorer/maps-table", title: /Maps/i, canonical: /\/explorer\/maps-table$/ },
  { path: "/explorer/dps", title: /DPS/i },
  { path: "/explorer/unit-browser", title: /Unit/i },
  { path: "/explorer/weapons", title: /Weapon/i },
  { path: "/explorer/challenges", title: /Challenge/i },
  { path: "/stats/games", title: /Stats|Games/i, canonical: /\/stats\/games$/ },
  { path: "/stats/maps", title: /Map Statistics/i, canonical: /\/stats\/maps$/ },
  { path: "/stats/players", title: /Player/i, canonical: /\/stats\/players$/ },
  { path: "/stats/leaderboards", title: /Leaderboards/i, canonical: /\/stats\/leaderboards$/ },
  { path: "/stats/achievements", title: /Achievement/i, canonical: /\/stats\/achievements$/ },
  { path: "/other/ranking-tiers", title: /Tiers|Ranking/i, canonical: /\/other\/ranking-tiers$/ },
  { path: "/other/open-data", title: /Data/i, canonical: /\/other\/open-data$/ },
  { path: "/other/player-export", title: /Export/i, canonical: /\/other\/player-export$/ },
  { path: "/other/relic-api", title: /API/i, canonical: /\/other\/relic-api$/ },
];

test.describe("SEO - page tags", () => {
  // These pages fetch live data on the server, a couple of them are heavy.
  test.describe.configure({ timeout: 60_000 });

  for (const { path, title, canonical } of PAGES) {
    test(`should set the SEO tags on ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), `${path} did not respond with 2xx`).toBeLessThan(400);

      await expect(page).toHaveTitle(title);

      const description = page.locator('meta[name="description"]').first();
      await expect(description).toHaveCount(1);
      const descriptionText = await description.getAttribute("content");
      expect(descriptionText?.length, `${path} has an empty meta description`).toBeGreaterThan(
        20,
      );

      if (canonical) {
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
      }

      // OpenGraph - what the Discord / social previews are built from.
      const ogTitle = page.locator('meta[property="og:title"]').first();
      await expect(ogTitle).toHaveAttribute("content", /.+/);
    });
  }
});

test.describe("SEO - indexability", () => {
  test("should keep the search page out of the index", async ({ page }) => {
    await page.goto("/search");

    // NextSeo emits its default `index,follow` first, the page's own override second.
    await expect(page.locator('meta[name="robots"][content*="nofollow"]')).toHaveCount(1);
  });

  test("should let the content pages be indexed", async ({ page }) => {
    await page.goto("/leaderboards");

    const robots = page.locator('meta[name="robots"]');
    if ((await robots.count()) > 0) {
      await expect(robots.first()).toHaveAttribute("content", /index/);
      await expect(robots.first()).not.toHaveAttribute("content", /noindex/);
    }
  });

  test("should expose a sitemap and a robots.txt", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<?xml");
  });
});
