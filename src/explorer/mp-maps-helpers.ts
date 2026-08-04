/**
 * Helpers for the maps explorer pages.
 *
 * The maps data file (see `mp-maps.ts`) is quite heavy - it carries the full description and the
 * point layout of every map. The list page only needs a small projection of it, that's what
 * `toMpMapListItem` is for.
 */

import { getIconsPathOnCDN } from "../utils";
import type { MpMap } from "./mp-maps-types";

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

/**
 * Strips the player count prefix the game puts in front of the map names, eg.
 * `"(6) Across the Savio"` -> `"Across the Savio"`. We display the raw name, this is used for
 * sorting and searching so that the prefix doesn't get in the way.
 */
const stripMpMapNamePrefix = (name: string) => name.replace(/^\(\d+\)\s*/, "");

/**
 * Url of the minimap image on the CDN. Not all maps have one - Final Stand maps are missing.
 *
 * We use the `marked.colored` variant, which is the minimap with the resource points marked and
 * the team colors applied - the plain `<mapId>.webp` is the bare minimap without any points.
 */
const getMpMapImageUrl = (mapId: string) =>
  getIconsPathOnCDN(`/${mapId}/${mapId}.marked.colored.webp`, "maps");

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

const matchesMpMapSearch = (map: MpMapListItem, search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  return (
    map.name.toLowerCase().includes(term) ||
    stripMpMapNamePrefix(map.name).toLowerCase().includes(term) ||
    map.id.toLowerCase().includes(term)
  );
};

const filterMpMaps = (maps: MpMapListItem[], filters: MpMapFilters): MpMapListItem[] => {
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

export {
  MP_MAP_MODES,
  MP_MAP_TEAM_LAYOUTS,
  filterMpMaps,
  getMpMapImageUrl,
  getMpMapMode,
  groupMpMapsByMode,
  sortMpMapsByName,
  stripMpMapNamePrefix,
  toMpMapListItem,
};
export type { MpMapFilters, MpMapListItem, MpMapMode };
