import { test, expect } from "@playwright/test";

/**
 * Regression tests for the remaining `pages/api` routes - `appUpdateRouteV2`,
 * `getBattlegroupInfo` and `getLatestPatchMapStats`.
 *
 * These three had neither a Jest nor an e2e test. `appUpdateRoute` (v1), `getNodeVersion`,
 * `topLeaderboards` and `playerExport` are covered elsewhere (`playerExport` by
 * `player-export-api.spec.ts`).
 *
 * They all reach out to a third party (the GitHub releases API, the coh3-data CDN, the stats API),
 * so the tests are written against the contract of the response rather than its values, and each of
 * them runs once per browser project - which is why they only use the `request` fixture.
 */

// These hit external services and map a lot of data, the default 30s is not always enough.
test.describe.configure({ timeout: 90_000 });

test.describe("API - /api/appUpdateRouteV2", () => {
  test("should return the latest desktop app release for the updater", async ({ request }) => {
    const response = await request.get("/api/appUpdateRouteV2");

    // GitHub rate-limits unauthenticated requests; a 5xx here is the upstream, not our route.
    if (response.status() >= 500) {
      test.skip(true, `GitHub API unavailable (status ${response.status()})`);
    }

    expect(response.status()).toBe(200);
    const data = await response.json();

    // This is the shape the Tauri updater of the desktop app expects.
    expect(data.version).toMatch(/^v\d+\.\d+\.\d+/);
    expect(typeof data.notes).toBe("string");
    expect(new Date(data.pub_date).toString()).not.toBe("Invalid Date");

    const platform = data.platforms["windows-x86_64"];
    expect(platform).toBeTruthy();
    expect(platform.url).toMatch(/^https:\/\/github\.com\/.*\.zip$/);
    // The signature is the content of the `.sig` asset, never the url of it.
    expect(platform.signature.length).toBeGreaterThan(0);
    expect(platform.signature).not.toMatch(/^https?:\/\//);

    expect(response.headers()["cache-control"]).toContain("max-age");
  });

  test("should only offer releases from 2.0.0 up", async ({ request }) => {
    const response = await request.get("/api/appUpdateRouteV2");
    if (response.status() >= 500) {
      test.skip(true, `GitHub API unavailable (status ${response.status()})`);
    }

    const { version } = await response.json();
    const major = Number.parseInt(version.replace(/^v/, "").split(".")[0], 10);
    expect(major).toBeGreaterThanOrEqual(2);
  });
});

test.describe("API - /api/getBattlegroupInfo", () => {
  test("should return the battlegroups keyed by their pbgid", async ({ request }) => {
    const response = await request.get("/api/getBattlegroupInfo");

    expect(response.status()).toBe(200);
    const data = await response.json();

    const entries = Object.entries<any>(data);
    expect(entries.length).toBeGreaterThan(10);

    for (const [key, battlegroup] of entries) {
      expect(Number.isNaN(Number(key))).toBe(false);
      expect(battlegroup.pbgid).toBe(Number(key));
      expect(typeof battlegroup.name).toBe("string");
      expect(battlegroup.name.length).toBeGreaterThan(0);
      expect(["german", "american", "british", "dak"]).toContain(battlegroup.faction);
    }

    // The incomplete `defense` battlegroup is filtered out.
    expect(entries.some(([, bg]) => bg.name === "defense")).toBe(false);
    expect(response.headers()["cache-control"]).toContain("max-age");
  });

  test("should accept a locale parameter", async ({ request }) => {
    const response = await request.get("/api/getBattlegroupInfo?locale=de");

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Object.keys(data).length).toBeGreaterThan(10);
  });
});

test.describe("API - /api/getLatestPatchMapStats", () => {
  test("should return the map stats of the latest patch", async ({ request }) => {
    const response = await request.get("/api/getLatestPatchMapStats");

    if (response.status() >= 500) {
      test.skip(true, "Stats API unavailable");
    }

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.latestPatchInfo.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof data.latestPatchDataTag).toBe("string");
    expect(data.mapStats).toBeTruthy();
    // The per-day breakdown is dropped from this response on purpose - it is a lot of data.
    expect(data.mapStats.analysis.days).toBeUndefined();
    // `mapInfo` is the static map metadata shipped with the app.
    expect(Object.keys(data.mapInfo).length).toBeGreaterThan(10);

    expect(response.headers()["cache-control"]).toContain("public");
    expect(response.headers()["expires"]).toBeTruthy();
  });
});
