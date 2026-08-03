/**
 * Types for the multiplayer maps data file (`data/mp-maps.json`) from the coh3-data repo.
 *
 * There are two flavours of types here:
 *  - `Raw*` types describe the JSON file exactly as it's generated from `ScenariosMP.sga`.
 *  - The non-raw types describe the parsed / localized data we work with in the app.
 */

/** Map category. `mp` = regular multiplayer scenario, `hoff` = Hold Off / co-op vs AI. */
type MpMapCategory = "mp" | "hoff";

/**
 * Layout of the teams. Null for maps which don't have symmetrical teams (hoff).
 * Known values: `1v1`, `2v2`, `3v3`, `4v4`.
 */
type MpMapTeamLayout = string;

/**
 * Type of a capture point.
 * Known values: `victory`, `fuel`, `munitions`, `strategic`, `starting_position`, `other`.
 */
type MpMapPointKind = string;

/**
 * Size tier of a resource point. Null for points which don't have tiers (eg. victory points).
 * Known values: `extra_low`, `low`, `medium`, `extra_medium`, `high`, `default`.
 */
type MpMapPointTier = string;

/** Resources generated per minute. All fields are optional, only present resources are listed. */
type MpMapIncomePerMinute = {
  fuel?: number;
  manpower?: number;
  /** Note: the data file uses singular `munition` here (not `munitions`). */
  munition?: number;
};

type MpMapSize = {
  width: number;
  height: number;
};

type MpMapPlayableArea = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

type MpMapPoint = {
  /** Entity blueprint of the point, eg. `territory_fuel_point_medium`. */
  ebp: string;
  ownerId: number;
  x: number;
  y: number;
  kind: MpMapPointKind;
  /** Grouping category, usually the same as `kind`. Not always present. */
  category?: MpMapPointKind;
  tier: MpMapPointTier | null;
  /** Suffix of the point shape, eg. `_rect15x20`. */
  shape: string | null;
  /** Variant of the point, eg. `starting_position_no_hq`. */
  variant?: string;
  /** Player slot for `starting_position` points. */
  playerSlot?: number;
  captureTime: number;
  revertTime: number;
  secureRadius: number;
  incomePerMinute?: MpMapIncomePerMinute;
};

type MpMapResources = {
  /** Amount of points per kind, eg. `{ fuel: 6, victory: 3 }`. */
  counts: Partial<Record<MpMapPointKind, number>>;
  /** Amount of points per kind and tier, eg. `{ fuel: { low: 2, medium: 4 } }`. */
  countsByTier: Partial<Record<MpMapPointKind, Partial<Record<MpMapPointTier, number>>>>;
  /** Amount of points which can be captured by players. */
  totalCapturable: number;
  /** Total income of all the capturable points on the map. */
  incomePerMinute: MpMapIncomePerMinute;
};

/* -------------------------------------------------------------------------- */
/* Raw JSON shape                                                             */
/* -------------------------------------------------------------------------- */

/** A localizable text in the raw data - locstring id + the English value baked in at export. */
type RawMpMapLocalizedText = {
  /** Id into the locstring file. Null when the scenario has no locstring reference. */
  locstring: string | null;
  /** English value as exported from the game files. */
  en: string | null;
};

type RawMpMap = {
  id: string;
  folder: string;
  category: MpMapCategory;
  isLobbyVisible: boolean;
  isCommunity: boolean;
  scenarioType: number;
  mapOrigin: number | null;
  version: number;
  author: string | null;
  audioEnvironment: string | null;
  worldbp: string;
  name: RawMpMapLocalizedText;
  description: RawMpMapLocalizedText;
  mapSize: MpMapSize;
  playableAreaEstimate: MpMapPlayableArea;
  maxPlayers: number;
  teamLayout: MpMapTeamLayout | null;
  /** Amount of players per team index, eg. `{ "0": 3, "1": 3 }`. */
  teams: Record<string, number>;
  enabledSlots: number;
  aiSlots: number;
  totalSlots: number;
  resources: MpMapResources;
  points: MpMapPoint[];
  minimapFiles: string[];
  stylizedMinimapPipelinePath?: string;
  sortIndex?: number | null;
  winCondition?: string;
  winConditions?: string[];
  tuningVariant?: string;
  startLocation?: number;
  defaultLayerSetTags?: string[];
};

/** Metadata block of the data file - stored under the `__meta` key. */
type MpMapsMeta = {
  schemaVersion: number;
  /** Source archive the data was generated from, eg. `ScenariosMP.sga`. */
  generatedFrom: string;
  mapCount: number;
  /** Amount of maps per category. */
  categories: Partial<Record<MpMapCategory, number>>;
  lobbyVisibleCount: number;
  communityCount: number;
};

/** The raw data file - `__meta` plus one entry per map, keyed by map id. */
type RawMpMapsFile = {
  __meta: MpMapsMeta;
} & Record<string, RawMpMap | MpMapsMeta>;

/* -------------------------------------------------------------------------- */
/* Parsed shape                                                               */
/* -------------------------------------------------------------------------- */

/** A single map with the localized name / description resolved. */
type MpMap = Omit<RawMpMap, "name" | "description"> & {
  /** Localized name, falls back to the English value from the data file. */
  name: string;
  /** Localized description, falls back to the English value from the data file. */
  description: string | null;
  /** Locstring ids kept around in case a consumer needs to re-resolve the texts. */
  locstringIds: {
    name: string | null;
    description: string | null;
  };
};

/** The result of downloading and parsing the mp maps data. */
type MpMapsData = {
  meta: MpMapsMeta;
  /** Maps keyed by their map id, eg. `across_the_rhine_6p`. */
  maps: Record<string, MpMap>;
  /** The patch the data was downloaded for. */
  patch: string;
  /** The locale the texts were resolved for. */
  locale: string;
};

export type {
  MpMap,
  MpMapCategory,
  MpMapIncomePerMinute,
  MpMapPlayableArea,
  MpMapPoint,
  MpMapPointKind,
  MpMapPointTier,
  MpMapResources,
  MpMapSize,
  MpMapTeamLayout,
  MpMapsData,
  MpMapsMeta,
  RawMpMap,
  RawMpMapLocalizedText,
  RawMpMapsFile,
};
