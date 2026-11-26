/**
 * Types for the in-game tips data file (`data/ingame-tips.json`) from the coh3-data repo.
 *
 * The tips are the short hints the game shows on its loading screens (`load_tips/*` blueprints).
 *
 * There are two flavours of types here:
 *  - `Raw*` types describe the JSON file exactly as it is generated from the game files.
 *  - The non-raw types are the parsed / localized projection the frontend renders. The blueprint
 *    path is dropped, the locstring id is replaced by the localized text.
 */

/* -------------------------------------------------------------------------- */
/* Raw JSON shape                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Broad grouping of the tips as the data repo assigns it, eg. `combat`, `economy`, `vehicles`,
 * `final_stand`. Typed as a plain string, so a new topic in the data file can't break the build.
 */
type IngameTipTopic = string;

/**
 * Game mode a tip belongs to. `hoff` (Final Stand, see `src/unitStats/finalStand.ts`) for the tips
 * which only make sense there, `null` for the generic tips shown in every mode.
 */
type IngameTipGameMode = string | null;

type RawIngameTip = {
  /** Blueprint name, eg. `tipcover1`, `hoff_tipperks1`. Unique within the file. */
  id: string;
  /** Path of the blueprint in the game files, eg. `load_tips/hoff/hoff_tipperks1`. */
  path: string;
  pbgid: number;
  /** Locstring id of the tip text, eg. `"11182582"`. No English value is baked into the file. */
  locstring: string;
  /** Fine grained grouping derived from the blueprint name, eg. `cover`, `perks`, `engineer`. */
  category: string;
  topic: IngameTipTopic;
  gameMode: IngameTipGameMode;
};

/** The raw data file. Everything sits under `tips`, in the order of the game files. */
type RawIngameTipsFile = {
  tips: RawIngameTip[];
};

/* -------------------------------------------------------------------------- */
/* Parsed shape                                                               */
/* -------------------------------------------------------------------------- */

/** A single localized tip. */
type IngameTip = {
  id: string;
  pbgid: number;
  /** Localized text of the tip, with the escaped line breaks of the game turned into real ones. */
  text: string;
  category: string;
  topic: IngameTipTopic;
  gameMode: IngameTipGameMode;
};

/** The result of downloading and parsing the in-game tips data. */
type IngameTipsData = {
  /** Tips in the order of the data file. Tips whose text is missing in the locale are left out. */
  tips: IngameTip[];
  /** The patch the data was downloaded for. */
  patch: string;
  /** The locale the texts were resolved for (the app locale as passed in). */
  locale: string;
};

export type {
  IngameTip,
  IngameTipGameMode,
  IngameTipTopic,
  IngameTipsData,
  RawIngameTip,
  RawIngameTipsFile,
};
