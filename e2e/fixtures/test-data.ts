import { getMatchDetailRoute } from "../../src/routes";

/**
 * Shared, pinned test data for the e2e suite.
 *
 * The player / match / map / unit e2e tests need *real* entities - the site renders live data
 * from the COH3 Stats API, so there is no such thing as a "test player". Inventing IDs
 * (`/players/1`, `/matches/1`) produces tests that pass while the page is broken, which is why
 * everything below is pinned to entities that really exist.
 *
 * ---------------------------------------------------------------------------------------------
 * HOW TO REFRESH THIS FILE
 * ---------------------------------------------------------------------------------------------
 * Only needed when a test starts failing because an entity disappeared upstream.
 *
 * TEST_PLAYER
 *   Any profile with a long history and a decent amount of games. Open
 *   https://coh3stats.com/leaderboards, pick a top player, and copy the ID out of the URL.
 *   Prefer a *steam* player - the activity and nemesis tabs are only tracked for Steam.
 *
 * TEST_MATCH
 *   Matches are keyed by the profiles that took part in them, so `/matches/<id>` alone returns
 *   "No match found" - the `profileIDs` query param is required (that is what the links inside
 *   the app produce, see `getMatchDetailRoute`). To refresh:
 *     1. Open `/players/<TEST_PLAYER.profileId>?view=recentMatches`.
 *     2. Click any row to open the match detail drawer.
 *     3. Copy the URL out of the drawer - it already contains `matchId` + `profileIDs`.
 *   Then update the fields below to match the players shown in that match. Pick a *recent*
 *   match of that player; the API evicts the oldest matches of a profile first.
 *
 * TEST_MAP / TEST_UNIT
 *   Must exist in `screens/search/maps-search-data.json` / `units-search-data.json` and in
 *   `src/coh3/coh3-data.ts`. Those are shipped with the app, so they only change with a patch.
 */

/** Long-lived, high-activity Steam profile used by the player-page tests. */
export const TEST_PLAYER = {
  profileId: "26631",
  alias: "Thomas",
  /** The page rewrites the URL to `/players/<id>/<cleanAlias>` once it has the player data. */
  cleanAlias: "Thomas",
};

/**
 * A finished 2v2 automatch with 4 players, all of which have a replay available.
 * Axis lost, allies won - see the per-team expectations below.
 */
export const TEST_MATCH = {
  matchId: "76649318",
  profileIds: [239532, 63213, 368017, 26631],
  /** Rendered in the page title as `Match Detail - <type> - <mapName>`. */
  matchType: "2v2",
  mapId: "rural_castle_4p",
  mapName: "Aere Perennius",
  /** german + dak, `resulttype === 0` (defeat). */
  axisAliases: ["Uberwarlord", "dr.farsh"],
  /** american + american, `resulttype === 1` (victory). */
  alliesAliases: ["Chefferson", "Thomas"],
};

/** Official 2v2 map, present in the maps search data and in the explorer. */
export const TEST_MAP = {
  mapId: "rural_castle_4p",
  /** As listed in `maps-search-data.json` (the `(4) ` prefix is stripped when searching). */
  searchName: "Aere Perennius",
};

/** Unit that exists for the explorer and in the units search data. */
export const TEST_UNIT = {
  race: "german",
  unitId: "grenadier_ger",
  name: "Grenadier Squad",
};

/** Ids that are guaranteed *not* to resolve - used for the error-path tests. */
export const MISSING = {
  /** Numeric, so it passes the route's zod validation and reaches the API. */
  profileId: "999999999",
  /** Non-numeric - rejected by the route validation with a 400 before any API call. */
  invalidProfileId: "not-a-number",
  /** Well-formed but nonexistent - the API answers 404 and the page shows "No match found". */
  matchId: "999999999999",
  /** The API rejects ids this low with a 400, which surfaces as an error card instead. */
  invalidMatchId: "1",
  mapId: "no_such_map",
  unitId: "no_such_unit",
};

/** The player page tabs, keyed by their `?view=` value. Mirrors the tab list in `screens/players`. */
export const PLAYER_TABS = [
  "standings",
  "standingsDetails",
  "teamsStandings",
  "recentMatches",
  "activity",
  "nemesis",
  "replays",
] as const;

export type PlayerTab = (typeof PLAYER_TABS)[number];

/**
 * Build the match detail route. Delegates to the app's own route builder so the tests exercise
 * exactly the URLs the site produces (percent-encoded brackets included) and cannot drift from it.
 */
export const matchRoute = (
  matchId: string = TEST_MATCH.matchId,
  profileIds: Array<number | string> | null = TEST_MATCH.profileIds,
) =>
  profileIds && profileIds.length > 0
    ? getMatchDetailRoute(matchId, profileIds)
    : getMatchDetailRoute(matchId);
