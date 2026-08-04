import {
  filterMpMaps,
  getMpMapImageUrl,
  getMpMapMode,
  groupMpMapsByMode,
  sortMpMapsByName,
  stripMpMapNamePrefix,
} from "../../../src/explorer/mp-maps-helpers";
import type { MpMapListItem } from "../../../src/explorer/mp-maps-helpers";

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
