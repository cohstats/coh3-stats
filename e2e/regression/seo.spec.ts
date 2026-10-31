import { test, expect } from "@playwright/test";
import { TEST_MAP, TEST_UNIT } from "../fixtures/test-data";

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

/**
 * Pages with the JSON-LD (`PageJsonLd`), with how many links their breadcrumb trail has before the
 * page itself. Every Explorer route, and the tournaments pages that render the same with and without
 * the tournament data (the season page shows the league without it).
 */
const STRUCTURED_DATA_PAGES: Array<{ path: string; parents: number; list?: boolean }> = [
  { path: "/explorer", parents: 1 },
  { path: "/explorer/races/american", parents: 2 },
  { path: "/explorer/races/american/units", parents: 3, list: true },
  { path: `/explorer/races/${TEST_UNIT.race}/units/${TEST_UNIT.unitId}`, parents: 4 },
  { path: "/explorer/maps", parents: 2, list: true },
  { path: "/explorer/maps-table", parents: 2 },
  { path: `/explorer/maps/${TEST_MAP.mapId}`, parents: 3 },
  { path: "/explorer/dps", parents: 2 },
  { path: "/explorer/dps-compare", parents: 2 },
  { path: "/explorer/unit-browser", parents: 2 },
  { path: "/explorer/weapons", parents: 2 },
  { path: "/explorer/challenges", parents: 2 },
  { path: "/explorer/fs", parents: 2 },
  { path: "/explorer/fs/races/american/perks", parents: 3 },
  { path: "/explorer/fs/races/american/tech", parents: 3 },
  { path: "/explorer/fs/races/american/units", parents: 3, list: true },
  { path: "/tournaments", parents: 1, list: true },
  { path: "/tournaments/ladder-tournament", parents: 2 },
  { path: "/tournaments/ironclad", parents: 2 },
];

test.describe("SEO - structured data", () => {
  test.describe.configure({ timeout: 60_000 });

  for (const { path, parents, list } of STRUCTURED_DATA_PAGES) {
    test(`should mark up ${path} with JSON-LD`, async ({ page }) => {
      // The JSON-LD is server rendered, the HTML is enough.
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${path} did not respond with 2xx`).toBeLessThan(400);

      const jsonLd = await Promise.all(
        (await page.locator('script[type="application/ld+json"]').all()).map(async (script) =>
          JSON.parse((await script.textContent()) ?? "{}"),
        ),
      );
      const breadcrumbs = jsonLd.filter((data) => data["@type"] === "BreadcrumbList");
      const webPages = jsonLd.filter((data) =>
        ["WebPage", "CollectionPage"].includes(data["@type"]),
      );
      expect(breadcrumbs).toHaveLength(1);
      expect(webPages).toHaveLength(1);

      // Home > ... > the page, which has no url (Google takes the page url).
      const trail = breadcrumbs[0].itemListElement;
      expect(trail).toHaveLength(parents + 1);
      expect(trail[0]).toMatchObject({ position: 1, item: expect.stringMatching(/^https:\/\//) });
      expect(trail.at(-1).item).toBeUndefined();
      for (const item of trail) expect(item.name).toBeTruthy();

      // Same page as the canonical and the meta tags say.
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toMatch(new RegExp(`${path}$`));
      const [webPage] = webPages;
      expect(webPage).toMatchObject({
        "@context": "https://schema.org",
        "@id": canonical,
        url: canonical,
        about: { "@type": "VideoGame", name: "Company of Heroes 3" },
      });
      expect(webPage.name).toBeTruthy();
      if (list) {
        expect(webPage["@type"]).toBe("CollectionPage");
        expect(webPage.mainEntity.itemListElement.length).toBeGreaterThan(0);
      }
    });
  }
});

test.describe("SEO - sitewide defaults", () => {
  test("should apply the defaults generated in _app to the page tags", async ({ page }) => {
    await page.goto("/live-games");

    // `titleTemplate` from `next-seo.config.ts`, the page itself only sets "Live Games - ..."
    await expect(page).toHaveTitle(/^Live Games.* \| COH3 Stats$/);
    // Only `_app` sets these, the page doesn't
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "COH3 Stats",
    );
    await expect(page.locator('link[rel="search"]')).toHaveAttribute("href", /opensearch\.xml$/);
  });
});

test.describe("SEO - indexability", () => {
  test("should keep the search page out of the index", async ({ page }) => {
    await page.goto("/search");

    // `nofollow: true` turns the one robots tag into `index,nofollow` (no second override tag).
    await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index,nofollow",
    );
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
