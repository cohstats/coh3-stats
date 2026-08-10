import { parseMpMaps, resolveMpMapText } from "../../../src/explorer/maps/mp-maps";
import type { RawMpMapsFile } from "../../../src/explorer/maps/mp-maps-types";

const rawFile = {
  __meta: {
    schemaVersion: 1,
    generatedFrom: "ScenariosMP.sga",
    mapCount: 2,
    categories: { mp: 1, hoff: 1 },
    lobbyVisibleCount: 2,
    communityCount: 1,
  },
  across_the_rhine_6p: {
    id: "across_the_rhine_6p",
    folder: "scenarios/multiplayer/community/across_the_rhine_6p",
    category: "mp",
    isLobbyVisible: true,
    isCommunity: true,
    scenarioType: 1,
    mapOrigin: 2,
    version: 3001,
    author: "DutchToast and FoolishViceroy",
    audioEnvironment: "italy_winter",
    worldbp: "default",
    name: { locstring: "11275610", en: "(6) Across the Savio" },
    description: { locstring: "11275611", en: "English description" },
    mapSize: { width: 512, height: 448 },
    playableAreaEstimate: {
      minX: -195,
      maxX: 212,
      minY: -121,
      maxY: 145,
      width: 408,
      height: 267,
    },
    maxPlayers: 6,
    teamLayout: "3v3",
    teams: { "0": 3, "1": 3 },
    enabledSlots: 6,
    aiSlots: 0,
    totalSlots: 16,
    resources: {
      counts: { fuel: 6, victory: 3 },
      countsByTier: { fuel: { medium: 6 } },
      totalCapturable: 21,
      incomePerMinute: { fuel: 46, manpower: 32, munition: 82.05 },
    },
    points: [
      {
        ebp: "territory_victory_point_territory",
        x: 36.9,
        y: 65.5,
        kind: "victory",
        category: "victory",
        tier: null,
        shape: null,
        captureTime: 25,
        revertTime: 10,
        secureRadius: 6,
      },
    ],
    sectors: [
      {
        id: 1,
        isBase: true,
        neighbors: [3],
        points: [],
        area: 34803,
        rings: [
          [
            [-205, -72],
            [-104, -72],
            [-104, 160],
          ],
        ],
        bounds: { minX: -205, maxX: -104, minY: -72, maxY: 160 },
      },
    ],
    minimapFiles: ["across_the_rhine_6p_mm_generated.rrtex"],
  },
  hoff_map_2p: {
    id: "hoff_map_2p",
    folder: "scenarios/multiplayer/hoff/hoff_map_2p",
    category: "hoff",
    isLobbyVisible: true,
    isCommunity: false,
    scenarioType: 1,
    mapOrigin: null,
    version: 1,
    author: null,
    audioEnvironment: null,
    worldbp: "default",
    // No locstring for the name, only the baked in English value.
    name: { locstring: null, en: "(2) Hold Off Map" },
    description: { locstring: null, en: null },
    mapSize: { width: 256, height: 256 },
    playableAreaEstimate: { minX: 0, maxX: 1, minY: 0, maxY: 1, width: 1, height: 1 },
    maxPlayers: 2,
    teamLayout: null,
    teams: { "0": 2 },
    enabledSlots: 2,
    aiSlots: 0,
    totalSlots: 8,
    resources: {
      counts: { starting_position: 2 },
      countsByTier: {},
      totalCapturable: 0,
      incomePerMinute: {},
    },
    points: [
      {
        ebp: "starting_position",
        x: 0,
        y: 0,
        kind: "starting_position",
        tier: null,
        shape: null,
        playerSlot: 0,
        captureTime: 0,
        revertTime: 0,
        secureRadius: 0,
      },
    ],
    minimapFiles: [],
    tuningVariant: "hoff",
  },
} as unknown as RawMpMapsFile;

const locstring: Record<string, string | null> = {
  "11275610": "(6) Přes Savio",
  // 11275611 is missing on purpose - the parser has to fall back to the English value.
};

describe("parseMpMaps", () => {
  test("keys the maps by their map id and returns the meta block", () => {
    const { meta, maps } = parseMpMaps(rawFile, locstring);

    expect(meta.mapCount).toBe(2);
    expect(meta.generatedFrom).toBe("ScenariosMP.sga");
    expect(Object.keys(maps).sort()).toEqual(["across_the_rhine_6p", "hoff_map_2p"]);
  });

  test("resolves the localized name and keeps the locstring ids", () => {
    const { maps } = parseMpMaps(rawFile, locstring);
    const map = maps["across_the_rhine_6p"];

    expect(map.name).toBe("(6) Přes Savio");
    expect(map.locstringIds).toEqual({ name: "11275610", description: "11275611" });
  });

  test("falls back to the English value when the locstring is missing", () => {
    const { maps } = parseMpMaps(rawFile, locstring);

    expect(maps["across_the_rhine_6p"].description).toBe("English description");
    expect(maps["hoff_map_2p"].name).toBe("(2) Hold Off Map");
    expect(maps["hoff_map_2p"].description).toBeNull();
  });

  test("keeps the rest of the map data untouched", () => {
    const { maps } = parseMpMaps(rawFile, locstring);
    const map = maps["across_the_rhine_6p"];

    expect(map.teamLayout).toBe("3v3");
    expect(map.maxPlayers).toBe(6);
    expect(map.resources.incomePerMinute).toEqual({ fuel: 46, manpower: 32, munition: 82.05 });
    expect(map.resources.counts.fuel).toBe(6);
    expect(map.minimapFiles).toEqual(["across_the_rhine_6p_mm_generated.rrtex"]);
    expect(maps["hoff_map_2p"].tuningVariant).toBe("hoff");
  });

  test("includes the points and sectors by default and strips them when asked to", () => {
    const withPoints = parseMpMaps(rawFile, locstring).maps["across_the_rhine_6p"];
    expect(withPoints.points).toHaveLength(1);
    expect(withPoints.sectors).toHaveLength(1);

    const withoutPoints = parseMpMaps(rawFile, locstring, false);
    expect(withoutPoints.maps["across_the_rhine_6p"].points).toEqual([]);
    expect(withoutPoints.maps["across_the_rhine_6p"].sectors).toEqual([]);
    expect(withoutPoints.maps["hoff_map_2p"].points).toEqual([]);
    // Maps of older data files have no sectors at all - those end up with an empty list.
    expect(parseMpMaps(rawFile, locstring).maps["hoff_map_2p"].sectors).toEqual([]);
    // The aggregated resource data is still there.
    expect(withoutPoints.maps["across_the_rhine_6p"].resources.totalCapturable).toBe(21);
  });

  test("skips entries which are not maps", () => {
    const broken = { ...rawFile, someRandomKey: { foo: "bar" } } as unknown as RawMpMapsFile;

    expect(Object.keys(parseMpMaps(broken, locstring).maps)).toHaveLength(2);
  });
});

describe("resolveMpMapText", () => {
  test("prefers the localized value", () => {
    expect(resolveMpMapText({ locstring: "11275610", en: "English" }, locstring)).toBe(
      "(6) Přes Savio",
    );
  });

  test("falls back to English and then to null", () => {
    expect(resolveMpMapText({ locstring: "999", en: "English" }, locstring)).toBe("English");
    expect(resolveMpMapText({ locstring: null, en: null }, locstring)).toBeNull();
    expect(resolveMpMapText(null, locstring)).toBeNull();
  });
});
