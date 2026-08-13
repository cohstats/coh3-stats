/**
 * Final Stand is the co-op vs AI DLC. It ships with its own set of units, weapons and upgrades which
 * are not available in the standard skirmish / multiplayer game.
 *
 * The game files call Final Stand "hoff" (Hold Off) - all of its content lives in a top level `hoff`
 * folder in the data files, and every unit file inside it is prefixed with `hoff_`
 * (eg. `hoff_enemy_fallschirmjagers_ger`). Same as with the maps, we keep the raw data faithful to
 * the game files and use the in-game name in the app level types / UI.
 *
 * Because the DLC content roughly doubles the amount of units per faction (and duplicates most of
 * the multiplayer roster under `hoff_enemy_*` / `hoff_player_*` names), it's hidden by default
 * everywhere we list units and has to be opted into.
 */

/** Prefix of every Final Stand unit / entity ID. */
const FINAL_STAND_ID_PREFIX = "hoff_";

/** Prefix of the AI-controlled enemy side of the Final Stand roster (eg. `hoff_enemy_riflemen_us`). */
const FINAL_STAND_ENEMY_ID_PREFIX = "hoff_enemy_";

/** Folder Final Stand content lives in, which is also the mapped `faction` of its weapons. */
const FINAL_STAND_FOLDER = "hoff";

/**
 * Whether the given unit / entity ID belongs to the Final Stand DLC.
 *
 * Works for sbps (squads), ebps (entities) and any other ID which comes from the `hoff` folder.
 */
const isFinalStandUnitId = (id?: string | null): boolean =>
  !!id && id.startsWith(FINAL_STAND_ID_PREFIX);

/**
 * Whether the given unit belongs to the Final Stand DLC. Prefers the mapped `path` (the folder
 * structure of the data files) and falls back to the ID prefix.
 */
const isFinalStandUnit = (unit?: { id?: string; path?: string } | null): boolean => {
  if (!unit) return false;
  if (unit.path) return unit.path.split("/")[0] === FINAL_STAND_FOLDER;

  return isFinalStandUnitId(unit.id);
};

/**
 * Whether the given Final Stand unit / entity ID belongs to the AI-controlled enemy side of the
 * roster (`hoff_enemy_*`), as opposed to the player-controlled one (`hoff_player_*`).
 */
const isFinalStandEnemyUnitId = (id?: string | null): boolean =>
  !!id && id.startsWith(FINAL_STAND_ENEMY_ID_PREFIX);

/** Whether the given unit belongs to the AI-controlled enemy side of the Final Stand roster. */
const isFinalStandEnemyUnit = (unit?: { id?: string } | null): boolean =>
  isFinalStandEnemyUnitId(unit?.id);

/**
 * Whether the given faction folder name is the Final Stand one. Weapons and upgrades are mapped with
 * the top level folder as their faction, so Final Stand ones end up as `hoff`.
 */
const isFinalStandFaction = (faction?: string | null): boolean => faction === FINAL_STAND_FOLDER;

/**
 * Removes the Final Stand units from a list, unless they were asked for.
 *
 * @param units Units with an `id` (and optionally a `path`).
 * @param includeFinalStand When true the list is returned as is.
 */
const filterFinalStandUnits = <T extends { id?: string; path?: string }>(
  units: T[],
  includeFinalStand: boolean,
): T[] => (includeFinalStand ? units : units.filter((unit) => !isFinalStandUnit(unit)));

export {
  FINAL_STAND_ID_PREFIX,
  FINAL_STAND_ENEMY_ID_PREFIX,
  FINAL_STAND_FOLDER,
  isFinalStandUnitId,
  isFinalStandUnit,
  isFinalStandEnemyUnitId,
  isFinalStandEnemyUnit,
  isFinalStandFaction,
  filterFinalStandUnits,
};
