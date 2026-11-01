import { test, expect, Page } from "@playwright/test";
import { TEST_MAP, TEST_MATCH, TEST_PLAYER, TEST_UNIT } from "../fixtures/test-data";

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

/** The way to a unit in the Explorer, through its faction and its units. */
const UNIT_ANCESTORS = (race: string) => [
  "/explorer",
  `/explorer/races/${race}`,
  `/explorer/races/${race}/units`,
];

/**
 * Pages with the JSON-LD (`PageJsonLd`), with the links of their breadcrumb trail between the home
 * page and the page itself, and their WebPage type (WebPage by default). Every page with SEO tags
 * except the home page (checked on its own) and the news article (its own NewsArticle markup). The
 * tournaments pages are the ones that render the same with and without the tournament data.
 */
const STRUCTURED_DATA_PAGES: Array<{
  path: string;
  ancestors: string[];
  list?: boolean;
  type?: string;
}> = [
  { path: "/explorer", ancestors: [] },
  { path: "/explorer/races/american", ancestors: ["/explorer"] },
  {
    path: "/explorer/races/american/units",
    ancestors: ["/explorer", "/explorer/races/american"],
    list: true,
  },
  {
    path: `/explorer/races/${TEST_UNIT.race}/units/${TEST_UNIT.unitId}`,
    ancestors: UNIT_ANCESTORS(TEST_UNIT.race),
  },
  { path: "/explorer/maps", ancestors: ["/explorer"], list: true },
  { path: "/explorer/maps-table", ancestors: ["/explorer"] },
  { path: `/explorer/maps/${TEST_MAP.mapId}`, ancestors: ["/explorer", "/explorer/maps"] },
  { path: "/explorer/dps", ancestors: ["/explorer"] },
  { path: "/explorer/dps-compare", ancestors: ["/explorer"] },
  { path: "/explorer/unit-browser", ancestors: ["/explorer"] },
  { path: "/explorer/weapons", ancestors: ["/explorer"] },
  { path: "/explorer/challenges", ancestors: ["/explorer"] },
  { path: "/explorer/fs", ancestors: ["/explorer"] },
  { path: "/explorer/fs/races/american/perks", ancestors: ["/explorer", "/explorer/fs"] },
  { path: "/explorer/fs/races/american/tech", ancestors: ["/explorer", "/explorer/fs"] },
  {
    path: "/explorer/fs/races/american/units",
    ancestors: ["/explorer", "/explorer/fs"],
    list: true,
  },
  { path: "/tournaments", ancestors: [], list: true },
  { path: "/tournaments/ladder-tournament", ancestors: ["/tournaments"] },
  { path: "/tournaments/ironclad", ancestors: ["/tournaments"] },
  { path: "/leaderboards", ancestors: [] },
  { path: "/leaderboards-teams", ancestors: [] },
  { path: `/players/${TEST_PLAYER.profileId}`, ancestors: [], type: "ProfilePage" },
  { path: `/matches/${TEST_MATCH.matchId}`, ancestors: [] },
  { path: "/stats/games", ancestors: [] },
  { path: "/stats/maps", ancestors: [] },
  { path: "/stats/players", ancestors: [] },
  { path: "/stats/leaderboards", ancestors: [] },
  { path: "/stats/achievements", ancestors: [] },
  { path: "/live-games", ancestors: [] },
  { path: "/news", ancestors: [], list: true },
  { path: "/search", ancestors: [] },
  { path: "/desktop-app", ancestors: [] },
  { path: "/about", ancestors: [], type: "AboutPage" },
  { path: "/legal/privacy", ancestors: [] },
  { path: "/other/ranking-tiers", ancestors: [] },
  { path: "/other/open-data", ancestors: [] },
  { path: "/other/player-export", ancestors: [] },
  { path: "/other/relic-api", ancestors: [] },
];

/** Path of an absolute or a site relative url. */
const pathnameOf = (url: string) => new URL(url, "https://coh3stats.com").pathname;

/**
 * The JSON-LD, the canonical and the link paths of the server rendered HTML of a page. The JSON-LD
 * is server rendered, and reading the HTML keeps the check away from what the page does after the
 * load - e.g. the live games page reloads itself when its API answers with a Cloudflare challenge.
 */
const getServerSeo = async (page: Page, path: string) => {
  const response = await page.request.get(path);
  expect(response.status(), `${path} did not respond with 2xx`).toBeLessThan(400);
  const html = await response.text();

  // DOMParser runs no scripts and decodes the attributes (`&amp;` in the canonical queries).
  const { jsonLd, canonical, links } = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "text/html");
    return {
      jsonLd: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(
        (script) => script.textContent ?? "{}",
      ),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
      links: [...doc.querySelectorAll("a[href]")].map((link) => link.getAttribute("href") ?? ""),
    };
  }, html);

  return {
    jsonLd: jsonLd.map((json) => JSON.parse(json)),
    canonical,
    linkPaths: new Set(links.map(pathnameOf)),
  };
};

test.describe("SEO - structured data", () => {
  test.describe.configure({ timeout: 60_000 });

  for (const { path, ancestors, list, type } of STRUCTURED_DATA_PAGES) {
    test(`should mark up ${path} with JSON-LD`, async ({ page }) => {
      const { jsonLd, canonical, linkPaths } = await getServerSeo(page, path);
      const breadcrumbs = jsonLd.filter((data) => data["@type"] === "BreadcrumbList");
      const webPages = jsonLd.filter((data) => data["@type"]?.endsWith("Page"));
      expect(breadcrumbs).toHaveLength(1);
      expect(webPages).toHaveLength(1);

      // Home > ... > the page, which has no url (Google takes the page url).
      const trail = breadcrumbs[0].itemListElement;
      expect(trail[0]).toMatchObject({ position: 1, item: expect.stringMatching(/^https:\/\//) });
      expect(trail.slice(1, -1).map((item: { item: string }) => pathnameOf(item.item))).toEqual(
        ancestors,
      );
      expect(trail.at(-1).item).toBeUndefined();
      for (const item of trail) expect(item.name).toBeTruthy();

      // Same page as the canonical and the meta tags say, some canonicals have the default query.
      expect(pathnameOf(canonical)).toBe(path);
      const [webPage] = webPages;
      expect(webPage).toMatchObject({
        "@context": "https://schema.org",
        "@id": canonical,
        url: canonical,
        about: { "@type": "VideoGame", name: "Company of Heroes 3" },
      });
      expect(webPage.name).toBeTruthy();
      if (type) expect(webPage["@type"]).toBe(type);
      if (list) {
        // The listed items are links the page shows.
        expect(webPage["@type"]).toBe("CollectionPage");
        const items: Array<{ url: string }> = webPage.mainEntity.itemListElement;
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) expect(linkPaths).toContain(pathnameOf(item.url));
      }
    });
  }
});

test.describe("SEO - home page structured data", () => {
  test("should describe the site and the home page", async ({ page }) => {
    const { jsonLd, canonical } = await getServerSeo(page, "/");

    // No breadcrumb trail on the home page, it would have a single item.
    expect(jsonLd.filter((data) => data["@type"] === "BreadcrumbList")).toHaveLength(0);
    const site = jsonLd.find((data) => data["@graph"]);
    expect(site["@graph"].map((node: { "@type": string }) => node["@type"])).toEqual([
      "WebSite",
      "Organization",
    ]);

    const webPage = jsonLd.find((data) => data["@type"] === "WebPage");
    expect(webPage).toMatchObject({ "@id": canonical, url: canonical });
  });
});

test.describe("SEO - translated page structured data", () => {
  // A translated page is its own canonical, the same url as its JSON-LD
  for (const path of ["/de/explorer/races/american", "/de/leaderboards"]) {
    test(`should mark up ${path} with its localized url`, async ({ page }) => {
      // The slim build (FULL_BUILD=false) has only the English pages
      const response = await page.request.get(path);
      test.skip(response.status() === 404, "The build has no translated pages");

      const { jsonLd, canonical } = await getServerSeo(page, path);
      expect(pathnameOf(canonical)).toBe(path);
      const webPage = jsonLd.find((data) => data["@type"]?.endsWith("Page"));
      expect(webPage).toMatchObject({ "@id": canonical, url: canonical, inLanguage: "de" });

      const breadcrumbs = jsonLd.find((data) => data["@type"] === "BreadcrumbList");
      for (const { item } of breadcrumbs.itemListElement.slice(0, -1)) {
        expect(pathnameOf(item)).toMatch(/^\/de(\/|$)/);
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
