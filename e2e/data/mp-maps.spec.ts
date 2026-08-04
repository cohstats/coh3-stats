/**
 * Integration tests of the multiplayer maps mapping.
 *
 * These tests call `getMpMaps` / `parseMpMaps` directly in Node (no app, no browser, no API
 * endpoint) and download the real data packages from the coh3-data CDN. Because the downloads are
 * heavy (the locstring files especially), they live in the e2e suite and not in the unit tests.
 *
 * Run with `yarn test:e2e:data` (or `yarn test:e2e:data:windows`).
 */

import { test, expect } from "@playwright/test";
import config from "../../config";
import {
  clearMpMapsCache,
  getMpMaps,
  parseMpMaps,
  MP_MAPS_DATA_FILE,
} from "../../src/explorer/mp-maps";
import type { MpMap, MpMapsData, RawMpMapsFile } from "../../src/explorer/mp-maps-types";

/**
 * The data file was added to the coh3-data repo only recently, so it's not part of the older
 * data tags. Tests which need the file for a given patch are skipped when it's not there yet.
 */
const isDataFileAvailable = async (patch: string): Promise<boolean> => {
  const response = await fetch(config.getPatchDataUrl(MP_MAPS_DATA_FILE, patch), {
    method: "GET",
  });
  return response.ok;
};

/** Invariants which have to hold for every map, no matter the patch or the locale. */
const expectValidMap = (map: MpMap, { withPoints }: { withPoints: boolean }) => {
  expect(map.id).toBeTruthy();
  expect(map.name).toBeTruthy();
  expect(typeof map.name).toBe("string");
  // Locstring values must be resolved into plain strings, never left as objects.
  expect(typeof map.description === "string" || map.description === null).toBe(true);
  expect(map.folder).toContain("scenarios");
  expect(["mp", "hoff"]).toContain(map.category);
  expect(map.maxPlayers).toBeGreaterThan(0);
  expect(map.totalSlots).toBeGreaterThanOrEqual(map.enabledSlots);
  expect(map.mapSize.width).toBeGreaterThan(0);
  expect(map.mapSize.height).toBeGreaterThan(0);
  expect(map.resources.totalCapturable).toBeGreaterThanOrEqual(0);

  // The data has to be JSON serializable - it's passed to pages via getStaticProps.
  expect(() => JSON.stringify(map)).not.toThrow();
  expect(JSON.stringify(map)).not.toContain("undefined");

  if (!withPoints) {
    expect(map.points).toEqual([]);
    return;
  }

  for (const point of map.points) {
    expect(point.ebp).toBeTruthy();
    expect(point.kind).toBeTruthy();
    expect(Number.isFinite(point.x)).toBe(true);
    expect(Number.isFinite(point.y)).toBe(true);
  }
};

/** Amount of points of the given kind, as counted from the `points` array. */
const countPointsByKind = (map: MpMap, kind: string) =>
  map.points.filter((point) => point.kind === kind).length;

test.describe("mp-maps mapping - latest patch", () => {
  let available = false;

  test.beforeAll(async () => {
    available = await isDataFileAvailable("latest");
    if (!available) {
      console.warn(
        `[mp-maps.spec] ${MP_MAPS_DATA_FILE} is not part of the data tag of patch ${config.latestPatch} yet - skipping the tests which need it.`,
      );
    }
  });

  test.beforeEach(() => {
    clearMpMapsCache();
  });

  test("downloads and parses the maps for the latest patch", async () => {
    test.skip(!available, `${MP_MAPS_DATA_FILE} is not available for the latest patch yet`);

    const data = await getMpMaps();
    expect(data).not.toBeNull();

    const { meta, maps, patch, locale } = data as MpMapsData;

    expect(patch).toBe("latest");
    expect(locale).toBe("en");

    expect(meta.schemaVersion).toBeGreaterThanOrEqual(1);
    expect(meta.generatedFrom).toBeTruthy();
    expect(meta.mapCount).toBeGreaterThan(0);

    const mapIds = Object.keys(maps);
    // Every map of the file has to be parsed, and keyed by its own id.
    expect(mapIds.length).toBe(meta.mapCount);
    for (const mapId of mapIds) expect(maps[mapId].id).toBe(mapId);

    for (const map of Object.values(maps)) expectValidMap(map, { withPoints: true });

    // The aggregated resource counts have to match the points of the map.
    for (const map of Object.values(maps)) {
      for (const [kind, count] of Object.entries(map.resources.counts)) {
        expect(countPointsByKind(map, kind)).toBe(count);
      }
    }

    // Sanity check on the amount of the maps and on the categories.
    expect(mapIds.length).toBeGreaterThan(50);
    expect(meta.categories.mp).toBeGreaterThan(0);
    expect(Object.values(maps).filter((map) => map.isLobbyVisible).length).toBe(
      meta.lobbyVisibleCount,
    );
    expect(Object.values(maps).filter((map) => map.isCommunity).length).toBe(meta.communityCount);
  });

  test("resolves the texts for a non-english locale", async () => {
    test.skip(!available, `${MP_MAPS_DATA_FILE} is not available for the latest patch yet`);

    const [english, german] = await Promise.all([
      getMpMaps({ locale: "en", includePoints: false }),
      getMpMaps({ locale: "de", includePoints: false }),
    ]);

    expect(english).not.toBeNull();
    expect(german).not.toBeNull();

    const englishMaps = (english as MpMapsData).maps;
    const germanMaps = (german as MpMapsData).maps;

    expect(Object.keys(germanMaps)).toEqual(Object.keys(englishMaps));
    expect((german as MpMapsData).locale).toBe("de");

    for (const map of Object.values(germanMaps)) expectValidMap(map, { withPoints: false });

    // At least some of the names have to be actually translated.
    const translatedNames = Object.keys(germanMaps).filter(
      (mapId) => germanMaps[mapId].name !== englishMaps[mapId].name,
    );
    expect(translatedNames.length).toBeGreaterThan(0);

    // Maps without a locstring fall back to the English value from the data file.
    for (const map of Object.values(germanMaps)) {
      if (!map.locstringIds.name) expect(map.name).toBe(englishMaps[map.id].name);
    }
  });

  test("can skip the heavy points data", async () => {
    test.skip(!available, `${MP_MAPS_DATA_FILE} is not available for the latest patch yet`);

    const [withPoints, withoutPoints] = await Promise.all([
      getMpMaps({ includePoints: true }),
      getMpMaps({ includePoints: false }),
    ]);

    const withPointsMaps = (withPoints as MpMapsData).maps;
    const withoutPointsMaps = (withoutPoints as MpMapsData).maps;

    expect(Object.keys(withoutPointsMaps)).toEqual(Object.keys(withPointsMaps));

    // There has to be at least some points in the full version.
    expect(
      Object.values(withPointsMaps).reduce((sum, map) => sum + map.points.length, 0),
    ).toBeGreaterThan(0);

    for (const map of Object.values(withoutPointsMaps)) {
      expect(map.points).toEqual([]);
      // The aggregated data is kept.
      expect(map.resources.totalCapturable).toBe(
        withPointsMaps[map.id].resources.totalCapturable,
      );
      expect(map.resources.counts).toEqual(withPointsMaps[map.id].resources.counts);
    }

    // Dropping the points has to make the payload significantly smaller.
    expect(JSON.stringify(withoutPointsMaps).length).toBeLessThan(
      JSON.stringify(withPointsMaps).length,
    );
  });

  test("caches the parsed data per patch, locale and includePoints", async () => {
    test.skip(!available, `${MP_MAPS_DATA_FILE} is not available for the latest patch yet`);

    const first = await getMpMaps();
    const second = await getMpMaps();

    // Same instance - no second download.
    expect(second).toBe(first);

    // Different options must not be served from the same cache entry.
    const withoutPoints = await getMpMaps({ includePoints: false });
    expect(withoutPoints).not.toBe(first);

    clearMpMapsCache();
    const afterClear = await getMpMaps();
    expect(afterClear).not.toBe(first);
    expect(Object.keys((afterClear as MpMapsData).maps)).toEqual(
      Object.keys((first as MpMapsData).maps),
    );
  });
});

test.describe("mp-maps mapping - other patches", () => {
  test.beforeEach(() => {
    clearMpMapsCache();
  });

  test("returns null for an unknown patch", async () => {
    expect(await getMpMaps({ patch: "0.0.0-does-not-exist" })).toBeNull();
  });

  test("returns null instead of throwing when the file is missing for a patch", async () => {
    // Pick the oldest patch we know about - the data file certainly isn't part of that data tag.
    const oldestPatch = Object.keys(config.patches).slice(-1)[0];
    expect(oldestPatch).toBeTruthy();

    const available = await isDataFileAvailable(oldestPatch);
    const data = await getMpMaps({ patch: oldestPatch, includePoints: false });

    if (available) {
      // If the data ever gets backported into the old tag, it still has to parse correctly.
      expect(data).not.toBeNull();
      expect((data as MpMapsData).patch).toBe(oldestPatch);
    } else {
      expect(data).toBeNull();
    }
  });

  test("downloads the data for a specific patch when available", async () => {
    const patch = config.latestPatch;

    test.skip(
      !(await isDataFileAvailable(patch)),
      `${MP_MAPS_DATA_FILE} is not available for patch ${patch} yet`,
    );

    const data = await getMpMaps({ patch, locale: "en", includePoints: false });

    expect(data).not.toBeNull();
    expect((data as MpMapsData).patch).toBe(patch);
    expect(Object.keys((data as MpMapsData).maps).length).toBe(
      (data as MpMapsData).meta.mapCount,
    );
  });
});

/**
 * The data file currently lives only on the `master` branch of the coh3-data repo. Until it makes it
 * into a data tag, this keeps the parsing / localization covered against the real, live data.
 */
test.describe("mp-maps mapping - parsing of the live data from master", () => {
  const MASTER_DATA_URL = `https://raw.githubusercontent.com/cohstats/coh3-data/master/data/${MP_MAPS_DATA_FILE}`;

  test("parses the current data from master with the real locstrings", async () => {
    // The file can be renamed/moved/removed on master independently of this repo (eg. once it lands
    // in a data tag) - skip rather than fail CI for every PR when that happens.
    const probe = await fetch(MASTER_DATA_URL, { method: "HEAD" });
    test.skip(!probe.ok, `${MP_MAPS_DATA_FILE} is no longer on the master branch of coh3-data`);

    const [rawResponse, locstringResponse] = await Promise.all([
      fetch(MASTER_DATA_URL),
      fetch(config.getPatchDataLocaleUrl("en", "latest")),
    ]);

    expect(rawResponse.ok).toBe(true);
    expect(locstringResponse.ok).toBe(true);

    const rawFile = (await rawResponse.json()) as RawMpMapsFile;
    const locstring = (await locstringResponse.json()) as Record<string, string | null>;

    const { meta, maps } = parseMpMaps(rawFile, locstring);

    expect(Object.keys(maps).length).toBe(meta.mapCount);
    for (const map of Object.values(maps)) expectValidMap(map, { withPoints: true });

    // The locstring ids of the maps have to be resolvable in the locstring file.
    const mapsWithLocstring = Object.values(maps).filter((map) => map.locstringIds.name);
    expect(mapsWithLocstring.length).toBeGreaterThan(0);

    const resolved = mapsWithLocstring.filter(
      (map) => locstring[map.locstringIds.name as string] === map.name,
    );
    // The vast majority has to resolve through the locstring file, the rest falls back to English.
    expect(resolved.length).toBeGreaterThan(mapsWithLocstring.length * 0.8);
  });
});
