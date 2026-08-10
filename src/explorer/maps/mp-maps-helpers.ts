/**
 * Helpers for the maps explorer pages.
 *
 * The maps data file (see `mp-maps.ts`) is quite heavy - it carries the full description and the
 * point layout of every map. The list page only needs a small projection of it, that's what
 * `toMpMapListItem` is for.
 */

import { getIconsPathOnCDN } from "../../utils";
import type { MpMap, MpMapPoint, MpMapPointKind } from "./mp-maps-types";

/** Team layouts we group / filter by, in the order they should be displayed. */
const MP_MAP_TEAM_LAYOUTS = ["1v1", "2v2", "3v3", "4v4"] as const;

/**
 * Mode of a map as used by the filters. Regular multiplayer maps use their team layout, Final Stand
 * (co-op vs AI) maps have no symmetrical teams so they get their own mode.
 *
 * Note: the game files call Final Stand "hoff" (Hold Off) - that's the value of `category` in the
 * raw data. We keep the raw types faithful to the data file and use the in-game name here, in the
 * app level types.
 */
type MpMapMode = (typeof MP_MAP_TEAM_LAYOUTS)[number] | "fs" | "other";

/** All the modes in display order. */
const MP_MAP_MODES: MpMapMode[] = [...MP_MAP_TEAM_LAYOUTS, "fs", "other"];

/** Minimal shape of a map needed to render the list page. */
type MpMapListItem = {
  id: string;
  /** Localized name as the game shows it, including the `(6) ` player count prefix. */
  name: string;
  mode: MpMapMode;
  maxPlayers: number;
  isLobbyVisible: boolean;
  isCommunity: boolean;
  author: string | null;
  mapSize: MpMap["mapSize"];
  /** Amount of points per kind, eg. `{ fuel: 6, victory: 3 }`. */
  pointCounts: MpMap["resources"]["counts"];
};

/**
 * Everything the table page (`/explorer/maps-table`) shows. It is a superset of the list item - the
 * table displays every aggregated field of the data file, only the `points` array is left out (it is
 * by far the heaviest part of the data and the detail page is the one which needs it).
 */
type MpMapTableItem = MpMapListItem & {
  teamLayout: MpMap["teamLayout"];
  /** Amount of points per kind and tier, eg. `{ fuel: { low: 2, medium: 4 } }`. */
  pointCountsByTier: MpMap["resources"]["countsByTier"];
  /** Amount of points which can be captured by players. */
  totalCapturable: number;
  /** Income per minute of all the capturable points on the map combined. */
  incomePerMinute: MpMap["resources"]["incomePerMinute"];
  /** Bounding box of the points - the part of the map the fighting actually happens on. */
  playableArea: MpMap["playableAreaEstimate"];
  version: number;
  category: MpMap["category"];
};

const getMpMapMode = (map: Pick<MpMap, "category" | "teamLayout">): MpMapMode => {
  if (map.category === "hoff") return "fs";

  const teamLayout = map.teamLayout as MpMapMode | null;

  return teamLayout && MP_MAP_TEAM_LAYOUTS.includes(teamLayout as any) ? teamLayout : "other";
};

const toMpMapListItem = (map: MpMap): MpMapListItem => ({
  id: map.id,
  name: map.name,
  mode: getMpMapMode(map),
  maxPlayers: map.maxPlayers,
  isLobbyVisible: map.isLobbyVisible,
  isCommunity: map.isCommunity,
  author: map.author ?? null,
  mapSize: map.mapSize,
  pointCounts: map.resources.counts,
});

const toMpMapTableItem = (map: MpMap): MpMapTableItem => ({
  ...toMpMapListItem(map),
  teamLayout: map.teamLayout,
  pointCountsByTier: map.resources.countsByTier,
  totalCapturable: map.resources.totalCapturable,
  incomePerMinute: map.resources.incomePerMinute,
  playableArea: map.playableAreaEstimate,
  version: map.version,
  category: map.category,
});

/**
 * Strips the player count prefix the game puts in front of the map names, eg.
 * `"(6) Across the Savio"` -> `"Across the Savio"`. We display the raw name, this is used for
 * sorting and searching so that the prefix doesn't get in the way.
 */
const stripMpMapNamePrefix = (name: string) => name.replace(/^\(\d+\)\s*/, "");

/**
 * Url of the minimap image on the CDN. Not all maps have one - Final Stand maps are missing, and so
 * are the maps which were added to the game after the last CDN sync.
 *
 * We use the `marked.colored` variant, which is the minimap with the resource points marked and
 * the team colors applied - see `getMpMapPlainImageUrl` for the bare one.
 */
const getMpMapImageUrl = (mapId: string) =>
  getIconsPathOnCDN(`/${mapId}/${mapId}.marked.colored.webp`, "maps");

/**
 * Url of the bare minimap image on the CDN - just the terrain, without the resource point icons the
 * `marked` variants have baked in. This is the one to use as a backdrop for our own point overlay,
 * so that the icons don't end up drawn twice.
 *
 * Availability is worse than the marked variant: Final Stand maps don't have it at all, and a couple
 * of maps (currently `ancona_railyard_2p`, `hill_400_8p`, `pisa_central_4p`) have no minimap on the
 * CDN whatsoever. Callers need to handle the image failing to load.
 */
const getMpMapPlainImageUrl = (mapId: string) =>
  getIconsPathOnCDN(`/${mapId}/${mapId}.webp`, "maps");

/**
 * Url of the large (800px) bare minimap on the CDN. Same framing as `getMpMapPlainImageUrl`, just at
 * twice the resolution - worth it on the detail page, where the minimap is rendered big.
 *
 * Availability is a little worse again than the 400px one, so this is only ever the first choice of a
 * fallback chain, never the only source.
 */
const getMpMapLargeImageUrl = (mapId: string) =>
  getIconsPathOnCDN(`/${mapId}/${mapId}.800.webp`, "maps");

const sortMpMapsByName = <T extends { name: string }>(maps: T[]): T[] =>
  [...maps].sort((a, b) =>
    stripMpMapNamePrefix(a.name).localeCompare(stripMpMapNamePrefix(b.name)),
  );

type MpMapFilters = {
  search: string;
  /** Selected modes. Empty means "all multiplayer modes" - Final Stand maps are opt-in. */
  modes: MpMapMode[];
  /** When true, only maps which show up in the in-game lobby are listed. */
  lobbyOnly: boolean;
};

/** The fields the filters look at - both the list and the table item satisfy this. */
type MpMapFilterable = Pick<MpMapListItem, "id" | "name" | "mode" | "isLobbyVisible">;

const matchesMpMapSearch = (map: MpMapFilterable, search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  return (
    map.name.toLowerCase().includes(term) ||
    stripMpMapNamePrefix(map.name).toLowerCase().includes(term) ||
    map.id.toLowerCase().includes(term)
  );
};

const filterMpMaps = <T extends MpMapFilterable>(maps: T[], filters: MpMapFilters): T[] => {
  const { search, modes, lobbyOnly } = filters;

  return maps.filter((map) => {
    if (lobbyOnly && !map.isLobbyVisible) return false;

    // With no mode selected we show every multiplayer map, Final Stand maps have to be asked for.
    if (modes.length === 0) {
      if (map.mode === "fs") return false;
    } else if (!modes.includes(map.mode)) {
      return false;
    }

    return matchesMpMapSearch(map, search);
  });
};

/** Groups the maps by mode, in display order. Modes without any map are left out. */
const groupMpMapsByMode = (maps: MpMapListItem[]): Array<[MpMapMode, MpMapListItem[]]> =>
  MP_MAP_MODES.map(
    (mode) => [mode, sortMpMapsByName(maps.filter((map) => map.mode === mode))] as const,
  )
    .filter(([, modeMaps]) => modeMaps.length > 0)
    .map(([mode, modeMaps]) => [mode, modeMaps]);

/* -------------------------------------------------------------------------- */
/* Point layout                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Point kinds we render, in the order they should show up in the legend. Anything else in the data
 * (currently only the `other` Final Stand capture areas) is left out - we have nothing meaningful to
 * draw for those.
 */
const MP_MAP_POINT_KINDS = [
  "victory",
  "fuel",
  "munitions",
  "strategic",
  "starting_position",
] as const;

type MpMapRenderedPointKind = (typeof MP_MAP_POINT_KINDS)[number];

/** The resource a point kind generates. `victory` / `starting_position` generate nothing. */
const MP_MAP_POINT_RESOURCE: Partial<
  Record<MpMapRenderedPointKind, keyof MpMap["resources"]["incomePerMinute"]>
> = {
  fuel: "fuel",
  // The data file calls the manpower points `strategic`, and the income key `manpower`.
  strategic: "manpower",
  // Note the singular `munition` on the income side.
  munitions: "munition",
};

/**
 * Icon of a point kind on the CDN.
 *
 * The resource points use the `resource_*` icons the game shows in its own resource bar. Victory
 * points use `mm_victory_point`, the symbol the game stamps on its own minimap - there is also a
 * framed `loadout/victory_point_icn` star, but its outer ring leaves almost no room for the star
 * itself once scaled down to marker size.
 *
 * Player starts have no icon, they are drawn as a team coloured numbered circle instead.
 */
const MP_MAP_POINT_ICON: Record<MpMapRenderedPointKind, string | null> = {
  victory: "/icons/common/resources/symbols/mm_victory_point.png",
  fuel: "/icons/common/resources/resource_fuel.png",
  munitions: "/icons/common/resources/resource_munition.png",
  strategic: "/icons/common/resources/resource_manpower.png",
  starting_position: null,
};

/**
 * How much bigger or smaller a point is drawn based on its tier, so that a high yield point reads as
 * the more valuable one at a glance. Deliberately a narrow range - the marker still has to stay on
 * top of the spot it belongs to without swallowing its neighbours.
 *
 * `default` is the tier of points which have only one size (manpower), those stay neutral.
 */
const MP_MAP_POINT_TIER_SCALE: Record<string, number> = {
  extra_low: 0.8,
  low: 0.85,
  medium: 1,
  default: 1,
  extra_medium: 1.1,
  high: 1.2,
};

/** A point of the map, ready to be positioned on top of the minimap. */
type MpMapPointMarker = {
  /** Stable key for React - the data has no point ids. */
  key: string;
  kind: MpMapRenderedPointKind;
  tier: MpMapPoint["tier"];
  /** Horizontal position as a fraction of the minimap width, `0` = left edge, `1` = right edge. */
  left: number;
  /** Vertical position as a fraction of the minimap height, `0` = top edge, `1` = bottom edge. */
  top: number;
  /** Income per minute of this single point, `null` for points which generate nothing. */
  income: number | null;
  /** Factor to scale the marker by, so the tier of a point is visible on the map. `1` is neutral. */
  sizeScale: number;
  captureTime: number;
  revertTime: number;
  secureRadius: number;
  /**
   * Team index of a `starting_position` point. `null` for every other kind, and also for the player
   * starts of maps which have no sides to split them into (Final Stand).
   */
  team: number | null;
  /**
   * Number of the player at a `starting_position`, 1 based and counted within its team, the way the
   * game numbers them. `null` for every other kind.
   */
  teamPosition: number | null;
};

const isRenderedPointKind = (kind: MpMapPointKind): kind is MpMapRenderedPointKind =>
  MP_MAP_POINT_KINDS.includes(kind as MpMapRenderedPointKind);

/**
 * Converts the world coordinates of the points into positions relative to the minimap image.
 *
 * The point coordinates are world units centred on `0,0` and they span the full `mapSize`, which is
 * also the area the minimap image covers. So the only things to do are shifting the origin to the
 * corner and flipping the Y axis - in the game world Y grows northwards, on the image it grows
 * downwards.
 *
 * Note: `playableAreaEstimate` looks like it would be the right thing to map against, but it is only
 * the bounding box of the points themselves, so using it would stretch the layout to the edges.
 */
const getMpMapPointMarkers = (
  map: Pick<MpMap, "mapSize" | "points" | "teams">,
): MpMapPointMarker[] => {
  const { width, height } = map.mapSize;
  if (!width || !height) return [];

  // Final Stand maps put every player on the same team (co-op vs AI), so there are no sides to split
  // the player starts into - numbering them straight through in slot order is what the game does.
  const hasTwoTeams = Object.keys(map.teams ?? {}).length > 1;

  return map.points
    .filter((point) => isRenderedPointKind(point.kind))
    .map((point, index) => {
      const kind = point.kind as MpMapRenderedPointKind;
      const resource = MP_MAP_POINT_RESOURCE[kind];
      const slot = point.playerSlot;

      return {
        key: `${kind}-${index}-${point.x}-${point.y}`,
        kind,
        tier: point.tier ?? null,
        left: (point.x + width / 2) / width,
        top: (height / 2 - point.y) / height,
        income: resource ? (point.incomePerMinute?.[resource] ?? null) : null,
        // Only the resource points come in tiers - victory points and player starts are all the same.
        sizeScale: (point.tier && MP_MAP_POINT_TIER_SCALE[point.tier]) || 1,
        // Player starts are not capturable, so the data file exports none of these for them.
        captureTime: point.captureTime ?? 0,
        revertTime: point.revertTime ?? 0,
        secureRadius: point.secureRadius ?? 0,
        // Slots alternate between the teams - even slots are team 0, odd ones team 1 - and the game
        // numbers the players within a team in slot order.
        team: kind === "starting_position" && slot !== undefined && hasTwoTeams ? slot % 2 : null,
        teamPosition:
          kind === "starting_position" && slot !== undefined
            ? hasTwoTeams
              ? Math.floor(slot / 2) + 1
              : slot + 1
            : null,
      };
    });
};

/* -------------------------------------------------------------------------- */
/* Sectors                                                                    */
/* -------------------------------------------------------------------------- */

/** Outline of a single sector, ready to be dropped into the svg overlay of the minimap. */
type MpMapSectorPath = {
  id: number;
  isBase: boolean;
  /** `d` attribute of the outline - one closed subpath per ring of the sector. */
  d: string;
};

/**
 * Builds the outlines of the territory sectors in the coordinate system of the minimap image, ie. a
 * viewBox of `0 0 mapSize.width mapSize.height`.
 *
 * The rings are world coordinates centred on `0,0`, the same system the points use, so they are
 * converted the same way - shift the origin to the top left corner and flip the Y axis.
 *
 * Neighbouring sectors share their border, so every one of those is drawn twice. Not worth
 * de-duplicating: the rings don't line up vertex by vertex, and the strokes land on top of each other
 * anyway.
 */
const getMpMapSectorPaths = (map: Pick<MpMap, "mapSize" | "sectors">): MpMapSectorPath[] => {
  const { width, height } = map.mapSize;
  if (!width || !height) return [];

  return (map.sectors ?? [])
    .map((sector) => ({
      id: sector.id,
      isBase: sector.isBase,
      d: (sector.rings ?? [])
        // Anything with less than three vertices has no area to outline.
        .filter((ring) => ring.length > 2)
        .map(
          (ring) => `M${ring.map(([x, y]) => `${x + width / 2} ${height / 2 - y}`).join("L")}Z`,
        )
        .join(""),
    }))
    .filter(({ d }) => d.length > 0);
};

/** Icon url of a point kind, or `null` for the kinds the game doesn't export an icon for. */
const getMpMapPointIconUrl = (kind: MpMapRenderedPointKind): string | null => {
  const icon = MP_MAP_POINT_ICON[kind];

  return icon ? getIconsPathOnCDN(icon) : null;
};

/* -------------------------------------------------------------------------- */
/* Income                                                                     */
/* -------------------------------------------------------------------------- */

/** Income of a single resource, for the whole map and for one side of it. */
type MpMapIncomeEntry = {
  resource: "fuel" | "munition" | "manpower";
  /** Amount of points generating this resource. */
  pointCount: number;
  /** Income per minute of every point on the map combined. */
  total: number;
  /**
   * Income per minute available to one side. This is simply half of the total - the maps are close
   * enough to symmetrical for that to be a useful number, but it is an estimate: points sitting on
   * the middle of the map are contested, not split.
   */
  perSide: number;
};

/**
 * Total and per side income of the map, in the order the resources should be displayed. Resources
 * the map generates nothing of are left out - Final Stand maps have no resource points at all, so
 * those end up with an empty list.
 */
const getMpMapIncomeSummary = (map: Pick<MpMap, "resources">): MpMapIncomeEntry[] => {
  const { incomePerMinute, counts } = map.resources;

  const entries: Array<{ resource: MpMapIncomeEntry["resource"]; kind: MpMapPointKind }> = [
    { resource: "fuel", kind: "fuel" },
    { resource: "munition", kind: "munitions" },
    { resource: "manpower", kind: "strategic" },
  ];

  return entries
    .map(({ resource, kind }) => ({
      resource,
      pointCount: counts[kind] ?? 0,
      total: incomePerMinute[resource] ?? 0,
      perSide: (incomePerMinute[resource] ?? 0) / 2,
    }))
    .filter(({ total }) => total > 0);
};

/**
 * Formats an income value for display. The game values are whole numbers with a rounding error baked
 * into the data file (a low fuel point is `5.001`), so anything within a rounding error of an integer
 * is shown as one.
 */
const formatMpMapIncome = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;

  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

export {
  MP_MAP_MODES,
  MP_MAP_POINT_KINDS,
  MP_MAP_TEAM_LAYOUTS,
  filterMpMaps,
  formatMpMapIncome,
  getMpMapImageUrl,
  getMpMapIncomeSummary,
  getMpMapLargeImageUrl,
  getMpMapMode,
  getMpMapPlainImageUrl,
  getMpMapPointIconUrl,
  getMpMapPointMarkers,
  getMpMapSectorPaths,
  groupMpMapsByMode,
  sortMpMapsByName,
  stripMpMapNamePrefix,
  toMpMapListItem,
  toMpMapTableItem,
};
export type {
  MpMapFilterable,
  MpMapFilters,
  MpMapIncomeEntry,
  MpMapListItem,
  MpMapMode,
  MpMapTableItem,
  MpMapPointMarker,
  MpMapRenderedPointKind,
  MpMapSectorPath,
};
