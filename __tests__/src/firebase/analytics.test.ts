import {
  AnalyticsTeamsStandingsTabView,
  AnalyticsTeamDetailsTabView,
  AnalyticsPlayerCardView,
  AnalyticsPlayerCardMatchView,
  AnalyticsPlayerCardReplaysView,
  AnalyticsPlayerCardNemesisView,
  AnalyticsPlayerCardActivityView,
  AnalyticsPlayerCardDetailedStatsView,
  AnalyticsTeamLeaderBoardsPageView,
} from "../../../src/firebase/analytics";
import webFirebase from "../../../src/firebase/web-firebase";

// Mock the web-firebase module
jest.mock("../../../src/firebase/web-firebase", () => ({
  logFBEvent: jest.fn(),
}));

describe("Firebase Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("AnalyticsTeamsStandingsTabView should log correct event", () => {
    const profileId = "123456";
    AnalyticsTeamsStandingsTabView(profileId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_teams_standings_view", {
      profile_id: profileId,
    });
  });

  test("AnalyticsTeamDetailsTabView should log correct event with profile and team IDs", () => {
    const profileId = "123456";
    const teamId = "team-123";
    AnalyticsTeamDetailsTabView(profileId, teamId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_team_details_view", {
      profile_id: profileId,
      team_id: teamId,
    });
  });

  test("AnalyticsPlayerCardView should log correct event", () => {
    const profileId = "123456";
    AnalyticsPlayerCardView(profileId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_view", {
      profile_id: profileId,
    });
  });

  test("AnalyticsPlayerCardMatchView should log correct event", () => {
    const profileId = "123456";
    AnalyticsPlayerCardMatchView(profileId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_matches_view", {
      profile_id: profileId,
    });
  });

  test("AnalyticsPlayerCardReplaysView should log correct event", () => {
    const profileId = "123456";
    AnalyticsPlayerCardReplaysView(profileId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_replays_view", {
      profile_id: profileId,
    });
  });

  test("AnalyticsPlayerCardNemesisView should log correct event", () => {
    const profileId = "123456";
    AnalyticsPlayerCardNemesisView(profileId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_nemesis_view", {
      profile_id: profileId,
    });
  });

  test("AnalyticsPlayerCardActivityView should log correct event", () => {
    const profileId = "123456";
    AnalyticsPlayerCardActivityView(profileId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_activity_view", {
      profile_id: profileId,
    });
  });

  test("AnalyticsPlayerCardDetailedStatsView should log correct event", () => {
    const profileId = "123456";
    AnalyticsPlayerCardDetailedStatsView(profileId);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("player_card_detailed_stats_view", {
      profile_id: profileId,
    });
  });

  test("AnalyticsTeamLeaderBoardsPageView should log correct events", () => {
    const side = "axis";
    const type = "2v2";
    AnalyticsTeamLeaderBoardsPageView(side, type);

    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("team_leaderboards_view");
    expect(webFirebase.logFBEvent).toHaveBeenCalledWith("team_leaderboards_axis_2v2_view");
  });
});
