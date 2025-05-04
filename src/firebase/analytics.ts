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

export const AnalyticsPlayerCardReplaysView = (profile_id?: number | string): void => {
  logFBEvent("player_card_replays_view", { profile_id });
};

export const AnalyticsPlayerCardNemesisView = (profile_id?: number | string): void => {
  logFBEvent("player_card_nemesis_view", { profile_id });
};

export const AnalyticsPlayerCardActivityView = (profile_id?: number | string): void => {
  logFBEvent("player_card_activity_view", { profile_id });
};

export const AnalyticsPlayerCardDetailedStatsView = (profile_id?: number | string): void => {
  logFBEvent("player_card_detailed_stats_view", { profile_id });
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

export const AnalyticsPlayerExportPageView = (): void => {
  logFBEvent("player_export_view");
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

export const AnalyticsGameStatsPageView = (): void => {
  logFBEvent("stats_game_view");
};

export const AnalyticsGameStatsModeSelection = (mode: string): void => {
  logFBEvent(`stats_game_mode_selection`);
  logFBEvent(`stats_game_mode_${mode}_selection`);
};

// patch selection
export const AnalyticsGameStatsPatchSelection = (patch: string): void => {
  logFBEvent(`stats_game_patch_selection`);
  logFBEvent(`stats_game_patch_${patch}_selection`);
};

export const AnalyticsMapStatsPageView = (): void => {
  logFBEvent("stats_map_view");
};

export const AnalyticsMapStatsModeSelection = (mode: string): void => {
  logFBEvent(`stats_map_mode_selection`);
  logFBEvent(`stats_map_mode_${mode}_selection`);
};

export const AnalyticsMapStatsPatchSelection = (patch: string): void => {
  logFBEvent("stats_map_patch_selection");
  logFBEvent(`stats_map_patch_${patch}_selection`);
};

export const AnalyticsMapStatsMapSelection = (map: string): void => {
  logFBEvent("stats_map_map_selection", { map });
};

export const AnalyticsStatsPlayerStatsPageView = (): void => {
  logFBEvent("stats_players_view");
};

export const AnalyticsAchievementsStatsPageView = (): void => {
  logFBEvent("stats_achievements_view");
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

export const AnalyticsExplorerChallengesView = (): void => {
  logFBEvent("explorer_challenges_view");
};

export const AnalyticsExplorerWeaponsView = (): void => {
  logFBEvent("explorer_weapons_view");
};

export const AnalyticsLiveGamesView = (): void => {
  logFBEvent("live_games_view");
};

export const AnalyticsLiveGamesTypeSelection = (type: string): void => {
  logFBEvent("live_games_type_selection", { type });
};

export const AnalyticsLiveGamesOrderSelection = (order: string): void => {
  logFBEvent("live_games_order_selection", { order });
};

export const AnalyticsLiveGamesPage = (page: number): void => {
  logFBEvent("live_games_start_selection", { page });
};

export const AnalyticsNewsPageView = (): void => {
  logFBEvent("news_view");
};

export const AnalyticsTeamDetailsTabView = (
  profile_id?: number | string,
  team_id?: string,
): void => {
  logFBEvent("player_card_team_details_view", { profile_id, team_id });
};

export const AnalyticsTeamsStandingsTabView = (profile_id?: number | string): void => {
  logFBEvent("player_card_teams_standings_view", { profile_id });
};
