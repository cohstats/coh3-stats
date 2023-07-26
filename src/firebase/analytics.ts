/** How to structure analytics events:
 * Try to format all the events with _ in between words.
 * Example:
 * - player_card_view
 * - player_card_search
 * - player_card_matches_view
 * - explorer_faction_view
 *
 * Always unify the events with the same name at the start, so we can easily filter them.
 * VIEW event is used for render! Aka when the page is rendered.
 *
 * We can pass extra parameters to the event. But it's little harder to see them / view them.
 * So in case you have "important" thing, try to pass it in as name of the event.
 *
 * Events should be used in useEffect hook. So they are not fired on re-render.
 * Events are available only on client side.
 */

import webFirebase from "./web-firebase";

const { logFBEvent } = webFirebase;

export const AnalyticsPlayerCardView = (profile_id?: number | string): void => {
  logFBEvent("player_card_view", { profile_id });
};

export const AnalyticsPlayerCardMatchView = (profile_id?: number | string): void => {
  logFBEvent("player_card_matches_view", { profile_id });
};

export const AnalyticsDesktopAppPageView = (): void => {
  logFBEvent("desktop_app_view");
};

export const AnalyticsAboutAppPageView = (): void => {
  logFBEvent("about_app_view");
};

export const AnalyticsRankingTiersPageView = (): void => {
  logFBEvent("ranking-tiers_view");
};

export const AnalyticsOpenDataPageView = (): void => {
  logFBEvent("open_data_view");
};

export const SearchPageView = (): void => {
  logFBEvent("search_view");
};

export const SearchPageUsed = (q: string): void => {
  logFBEvent("search_used", { q });
};

export const AnalyticsStatsLeaderboardsPageView = (): void => {
  logFBEvent("stats_leaderboards_view");
};

export const AnalyticsStatsPlayerStatsPageView = (): void => {
  logFBEvent("stats_players_view");
};

export const AnalyticsLeaderBoardsPageView = (faction: string, type: string): void => {
  logFBEvent("leaderboards_view");
  logFBEvent(`leaderboards_${faction}_${type}_view`);
};

export const AnalyticsDPSExplorerPageView = (): void => {
  logFBEvent("explorer_dps_view");
};

export const AnalyticsDPSExplorerSquadSelection = (unitId: string): void => {
  logFBEvent("explorer_dps_squad_selection", { unitId });
};

export const AnalyticsDPSExplorerPatchSelection = (patch: string): void => {
  logFBEvent("explorer_dps_patch_selection", { patch });
};

export const AnalyticsExplorerUnitBrowserView = (): void => {
  logFBEvent("explorer_unit_browser_view");
};

export const AnalyticsExplorerUnitDetailsView = (unitId: string): void => {
  logFBEvent("explorer_unit_details_view", { unitId });
};

export const AnalyticsExplorerFactionView = (faction: string): void => {
  logFBEvent(`explorer_faction_${faction}_view`);
};

export const AnalyticsExplorerFactionUnitsView = (faction: string): void => {
  logFBEvent(`explorer_faction_${faction}_units_view`);
};
