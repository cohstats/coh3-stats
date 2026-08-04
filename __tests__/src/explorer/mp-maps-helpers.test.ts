import {
  filterMpMaps,
  formatMpMapIncome,
  getMpMapImageUrl,
  getMpMapIncomeSummary,
  getMpMapLargeImageUrl,
  getMpMapMode,
  getMpMapPlainImageUrl,
  getMpMapPointIconUrl,
  getMpMapPointMarkers,
  groupMpMapsByMode,
  sortMpMapsByName,
  stripMpMapNamePrefix,
} from "../../../src/explorer/mp-maps-helpers";
import type { MpMapListItem } from "../../../src/explorer/mp-maps-helpers";
import type { MpMapPoint } from "../../../src/explorer/mp-maps-types";

const createMap = (overrides: Partial<MpMapListItem> = {}): MpMapListItem => ({
  id: "rural_town_4p",
  name: "(4) Pachino Farmlands",
  mode: "2v2",
  maxPlayers: 4,
  isLobbyVisible: true,
  isCommunity: false,
  author: "Relic",
  mapSize: { width: 448, height: 416 },
  pointCounts: { fuel: 8, munitions: 10, victory: 3 },
  ...overrides,
});

describe("getMpMapMode", () => {
  it("uses the team layout for multiplayer maps", () => {
    expect(getMpMapMode({ category: "mp", teamLayout: "3v3" })).toBe("3v3");
  });

  it("returns fs for final stand (hoff) maps, no matter the team layout", () => {
    expect(getMpMapMode({ category: "hoff", teamLayout: null })).toBe("fs");
    expect(getMpMapMode({ category: "hoff", teamLayout: "2v2" })).toBe("fs");
  });

  it("falls back to other for unknown team layouts", () => {
    expect(getMpMapMode({ category: "mp", teamLayout: null })).toBe("other");
    expect(getMpMapMode({ category: "mp", teamLayout: "5v5" })).toBe("other");
  });
});

describe("stripMpMapNamePrefix", () => {
  it("removes the player count prefix", () => {
    expect(stripMpMapNamePrefix("(6) Across the Savio")).toBe("Across the Savio");
    expect(stripMpMapNamePrefix("(2)Pachino")).toBe("Pachino");
  });

  it("keeps names without a prefix untouched", () => {
    expect(stripMpMapNamePrefix("Qattara Depression")).toBe("Qattara Depression");
  });
});

describe("getMpMapImageUrl", () => {
  it("points at the marked / colored variant in the maps folder on the CDN", () => {
    expect(getMpMapImageUrl("rural_town_4p")).toBe(
      "https://cdn.coh3stats.com/maps/rural_town_4p/rural_town_4p.marked.colored.webp",
    );
  });
});

describe("sortMpMapsByName", () => {
  it("sorts by the name without the player count prefix", () => {
    const sorted = sortMpMapsByName([
      createMap({ id: "b", name: "(8) Winter Line" }),
      createMap({ id: "a", name: "(2) Bologna" }),
      createMap({ id: "c", name: "(4) Aere Perennius" }),
    ]);

    expect(sorted.map(({ id }) => id)).toEqual(["c", "a", "b"]);
  });
});

describe("filterMpMaps", () => {
  const maps = [
    createMap({ id: "pachino_2p", name: "(2) Pachino Stalemate", mode: "1v1" }),
    createMap({ id: "rural_town_4p", name: "(4) Pachino Farmlands", mode: "2v2" }),
    createMap({ id: "hidden_8p", name: "(8) Hill 400", mode: "4v4", isLobbyVisible: false }),
    createMap({ id: "hoff_desert", name: "Qattara Depression", mode: "fs" }),
  ];

  const filters = { search: "", modes: [] as never[], lobbyOnly: true };

  it("hides final stand maps and hidden maps by default", () => {
    expect(filterMpMaps(maps, filters).map(({ id }) => id)).toEqual([
      "pachino_2p",
      "rural_town_4p",
    ]);
  });

  it("includes final stand maps once the mode is selected", () => {
    expect(filterMpMaps(maps, { ...filters, modes: ["fs"] }).map(({ id }) => id)).toEqual([
      "hoff_desert",
    ]);
  });

  it("reveals the maps which are not in the lobby", () => {
    expect(filterMpMaps(maps, { ...filters, lobbyOnly: false }).map(({ id }) => id)).toEqual([
      "pachino_2p",
      "rural_town_4p",
      "hidden_8p",
    ]);
  });

  it("searches the name, the name without prefix and the id", () => {
    expect(filterMpMaps(maps, { ...filters, search: "pachino" })).toHaveLength(2);
    expect(filterMpMaps(maps, { ...filters, search: "(2)" })).toHaveLength(1);
    expect(filterMpMaps(maps, { ...filters, search: "rural_town" })).toHaveLength(1);
    expect(filterMpMaps(maps, { ...filters, search: "nothing here" })).toHaveLength(0);
  });

  it("combines the mode filter with the search", () => {
    expect(
      filterMpMaps(maps, { ...filters, modes: ["1v1", "2v2"], search: "farmlands" }).map(
        ({ id }) => id,
      ),
    ).toEqual(["rural_town_4p"]);
  });
});

describe("getMpMapPlainImageUrl", () => {
  it("points at the bare minimap, without the baked in point icons", () => {
    expect(getMpMapPlainImageUrl("rural_town_4p")).toBe(
      "https://cdn.coh3stats.com/maps/rural_town_4p/rural_town_4p.webp",
    );
  });
});

describe("getMpMapLargeImageUrl", () => {
  it("points at the 800px render of the bare minimap", () => {
    expect(getMpMapLargeImageUrl("rural_town_4p")).toBe(
      "https://cdn.coh3stats.com/maps/rural_town_4p/rural_town_4p.800.webp",
    );
  });
});

describe("getMpMapPointIconUrl", () => {
  it("resolves the resource icons on the CDN", () => {
    expect(getMpMapPointIconUrl("fuel")).toBe(
      "https://cdn.coh3stats.com/export/icons/common/resources/resource_fuel.webp",
    );
    // The data file calls the manpower points `strategic`.
    expect(getMpMapPointIconUrl("strategic")).toBe(
      "https://cdn.coh3stats.com/export/icons/common/resources/resource_manpower.webp",
    );
  });

  it("resolves the victory point icon from the minimap symbols", () => {
    expect(getMpMapPointIconUrl("victory")).toBe(
      "https://cdn.coh3stats.com/export/icons/common/resources/symbols/mm_victory_point.webp",
    );
  });

  it("has no icon for the player starts, they are drawn as a numbered circle", () => {
    expect(getMpMapPointIconUrl("starting_position")).toBeNull();
  });
});

describe("getMpMapPointMarkers", () => {
  const createPoint = (overrides: Partial<MpMapPoint> = {}): MpMapPoint => ({
    ebp: "territory_fuel_point_medium",
    ownerId: 0,
    x: 0,
    y: 0,
    kind: "fuel",
    tier: "medium",
    shape: null,
    captureTime: 30,
    revertTime: 25,
    secureRadius: 6,
    incomePerMinute: { fuel: 10.002 },
    ...overrides,
  });

  it("maps the world coordinates onto the minimap, flipping the Y axis", () => {
    // A real victory point of El Alamein (416x416) - verified against the minimap the game ships.
    const [marker] = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 416, height: 416 },
      points: [createPoint({ kind: "victory", tier: null, x: 96.49699, y: -94.90893 })],
    });

    expect(marker.left).toBeCloseTo(0.732, 3);
    // Y grows northwards in the world and downwards on the image, so a negative Y is in the bottom
    // half of the minimap.
    expect(marker.top).toBeCloseTo(0.728, 3);
  });

  it("puts the centre of the map in the centre of the minimap", () => {
    const [marker] = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 512, height: 384 },
      points: [createPoint({ x: 0, y: 0 })],
    });

    expect(marker.left).toBe(0.5);
    expect(marker.top).toBe(0.5);
  });

  it("handles non square maps on both axes independently", () => {
    const [marker] = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 672, height: 544 },
      points: [createPoint({ x: 168, y: -136 })],
    });

    expect(marker.left).toBeCloseTo(0.75, 5);
    expect(marker.top).toBeCloseTo(0.75, 5);
  });

  it("picks up the income of the point, using the resource key of its kind", () => {
    const markers = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 416, height: 416 },
      points: [
        createPoint({ kind: "fuel", incomePerMinute: { fuel: 10.002 } }),
        // Munitions points are `munitions` but their income key is the singular `munition`.
        createPoint({
          kind: "munitions",
          incomePerMinute: { munition: 10.002 },
        }),
        createPoint({ kind: "strategic", tier: null, incomePerMinute: { manpower: 8 } }),
        createPoint({ kind: "victory", tier: null, incomePerMinute: undefined }),
      ],
    });

    expect(markers.map(({ income }) => income)).toEqual([10.002, 10.002, 8, null]);
  });

  it("derives the team and the in team player number from the player slot", () => {
    const markers = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 672, height: 544 },
      points: [0, 1, 2, 3, 4, 5, 6, 7].map((playerSlot) =>
        createPoint({
          kind: "starting_position",
          tier: null,
          playerSlot,
          incomePerMinute: undefined,
        }),
      ),
    });

    // Slots alternate between the teams, and the players are numbered per team in slot order.
    expect(markers.map(({ team }) => team)).toEqual([0, 1, 0, 1, 0, 1, 0, 1]);
    expect(markers.map(({ teamPosition }) => teamPosition)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("scales the markers by the tier of the point", () => {
    const markers = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 416, height: 416 },
      points: [
        createPoint({ tier: "extra_low" }),
        createPoint({ tier: "low" }),
        createPoint({ tier: "medium" }),
        createPoint({ tier: "extra_medium" }),
        createPoint({ tier: "high" }),
      ],
    });

    const scales = markers.map(({ sizeScale }) => sizeScale);
    expect(scales).toEqual([0.8, 0.85, 1, 1.1, 1.2]);
    // Whatever the exact numbers, a higher tier always has to draw at least as big as a lower one.
    expect([...scales].sort((a, b) => a - b)).toEqual(scales);
  });

  it("leaves the tierless points at the neutral scale", () => {
    const markers = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 416, height: 416 },
      points: [
        // Victory points have no tier, manpower points share a single `default` one.
        createPoint({ kind: "victory", tier: null, incomePerMinute: undefined }),
        createPoint({ kind: "strategic", tier: "default", incomePerMinute: { manpower: 8 } }),
        createPoint({
          kind: "starting_position",
          tier: null,
          playerSlot: 0,
          incomePerMinute: undefined,
        }),
      ],
    });

    expect(markers.map(({ sizeScale }) => sizeScale)).toEqual([1, 1, 1]);
  });

  it("numbers the player starts straight through when the map has no sides", () => {
    // Final Stand maps are co-op vs AI, every player sits on team 0.
    const markers = getMpMapPointMarkers({
      teams: { 0: 4 },
      mapSize: { width: 544, height: 512 },
      points: [0, 1, 2, 3].map((playerSlot) =>
        createPoint({
          kind: "starting_position",
          tier: null,
          playerSlot,
          incomePerMinute: undefined,
        }),
      ),
    });

    // No team to belong to, so nothing gets coloured as an opponent.
    expect(markers.map(({ team }) => team)).toEqual([null, null, null, null]);
    expect(markers.map(({ teamPosition }) => teamPosition)).toEqual([1, 2, 3, 4]);
  });

  it("leaves out the point kinds we have nothing to draw for", () => {
    const markers = getMpMapPointMarkers({
      teams: { 0: 2, 1: 2 },
      mapSize: { width: 416, height: 416 },
      points: [
        createPoint(),
        createPoint({ kind: "other", ebp: "hoff_territory_capture_area", tier: null }),
      ],
    });

    expect(markers.map(({ kind }) => kind)).toEqual(["fuel"]);
  });

  it("returns nothing instead of dividing by zero on a map without a size", () => {
    expect(
      getMpMapPointMarkers({
        teams: { 0: 2, 1: 2 },
        mapSize: { width: 0, height: 0 },
        points: [createPoint()],
      }),
    ).toEqual([]);
  });
});

describe("getMpMapIncomeSummary", () => {
  it("lists the income per resource, with half of it as the per side estimate", () => {
    // The real numbers of El Alamein.
    expect(
      getMpMapIncomeSummary({
        resources: {
          counts: { fuel: 7, munitions: 6, strategic: 4, victory: 3 },
          countsByTier: {},
          totalCapturable: 20,
          incomePerMinute: { fuel: 50.01, manpower: 32, munition: 66.03 },
        },
      }),
    ).toEqual([
      { resource: "fuel", pointCount: 7, total: 50.01, perSide: 25.005 },
      { resource: "munition", pointCount: 6, total: 66.03, perSide: 33.015 },
      { resource: "manpower", pointCount: 4, total: 32, perSide: 16 },
    ]);
  });

  it("leaves out resources the map generates nothing of", () => {
    expect(
      getMpMapIncomeSummary({
        resources: {
          counts: { fuel: 4, victory: 3 },
          countsByTier: {},
          totalCapturable: 7,
          incomePerMinute: { fuel: 20 },
        },
      }).map(({ resource }) => resource),
    ).toEqual(["fuel"]);
  });

  it("is empty for final stand maps, which have no resource points", () => {
    expect(
      getMpMapIncomeSummary({
        resources: {
          counts: { starting_position: 4 },
          countsByTier: {},
          totalCapturable: 0,
          incomePerMinute: {},
        },
      }),
    ).toEqual([]);
  });
});

describe("formatMpMapIncome", () => {
  it("hides the rounding error the data file carries", () => {
    // A low fuel point is `5.001` in the data, a medium one `10.002`.
    expect(formatMpMapIncome(5.001)).toBe("5");
    expect(formatMpMapIncome(10.002)).toBe("10");
    expect(formatMpMapIncome(50.01)).toBe("50");
  });

  it("keeps a single decimal for the halved values", () => {
    expect(formatMpMapIncome(25.005)).toBe("25");
    expect(formatMpMapIncome(33.015)).toBe("33");
    expect(formatMpMapIncome(12.5)).toBe("12.5");
  });
});

describe("groupMpMapsByMode", () => {
  it("groups in display order and leaves out empty modes", () => {
    const groups = groupMpMapsByMode([
      createMap({ id: "d", name: "(8) Winter Line", mode: "4v4" }),
      createMap({ id: "a", name: "(2) Bologna", mode: "1v1" }),
      createMap({ id: "b", name: "(2) Aere Perennius", mode: "1v1" }),
    ]);

    expect(groups.map(([mode]) => mode)).toEqual(["1v1", "4v4"]);
    // Maps within a group are sorted by name.
    expect(groups[0][1].map(({ id }) => id)).toEqual(["b", "a"]);
  });
});
