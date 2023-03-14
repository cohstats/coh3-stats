export const raceTypeArray = ["german", "american", "dak", "british"] as const;

export type raceType = (typeof raceTypeArray)[number];

/** The british is different for multiplayer. */
export const raceMultiplayer = ["german", "american", "british_africa", "afrika_korps"] as const;
export type raceMultiplayer = (typeof raceMultiplayer)[number];

export const leaderBoardTypeArray = ["1v1", "2v2", "3v3", "4v4"] as const;

export type leaderBoardType = (typeof leaderBoardTypeArray)[number];

export type raceID = 129494 | 137123 | 197345 | 198437 | 203852;

type RelicAPIResult = {
  code: number;
  message: string;
};

type RawPlayerProfile = {
  profile_id: number;
  name: string; // /steam/bulshit
  alias: string;
  personal_statgroup_id?: number;
  xp?: number;
  level: number;
  leaderboardregion_id?: number;
  country: string;
};

export type RawStatGroup = {
  id: number;
  name?: string; // empty
  type?: number;
  members: Array<RawPlayerProfile>;
};

export type RawLeaderboardStat = {
  statgroup_id: number;
  leaderboard_id: number;
  wins: number;
  losses: number;
  streak: number;
  disputes: number;
  drops: number;
  rank: number;
  ranktotal?: number;
  regionrank?: number;
  ranklevel: number;
  rating: number;
  regionranktotal?: number;
  lastmatchdate: number;
};

export interface RawLaddersObject extends LaddersDataObject {
  result?: RelicAPIResult;
}

export interface LaddersDataObject {
  leaderboardStats: Array<RawLeaderboardStat>;
  statGroups: Array<RawStatGroup>;
  rankTotal: number;
}

export interface LaddersDataArrayObject extends RawLeaderboardStat {
  change: number | string;
  members: Array<Record<string, any>>;
}

export interface COH3StatsPlayerInfoAPI {
  COH3PlayTime: null;
  RelicProfile: {
    leaderboardStats: Array<RawLeaderboardStat>;
    statGroups: Array<RawStatGroup>;
  };
  SteamProfile: Record<string, { steamid: string; profileurl: string; avatarmedium: string }>;
}

export type InternalStandings = Record<
  "german" | "american" | "dak" | "british",
  Record<"1v1" | "2v2" | "3v3" | "4v4", RawLeaderboardStat | null>
>;

export type PlayerCardDataType = {
  steamData: { steamid: string; profileurl: string; avatarmedium: string };
  COH3PlayTime: null;
  standings: InternalStandings;
  info: { country: string; level: number; name: string; xp: number | undefined };
};

export interface Matchhistoryreportresult {
  matchhistory_id: number;
  profile_id: number;
  resulttype: number;
  teamid: number;
  race_id: number;
  counters: string;
  profile: RawPlayerProfile;
}

export interface Matchhistoryitem {
  profile_id: number;
  iteminstance_id: number;
  itemdefinition_id: number;
  itemlocation_id: number;
}

export interface Matchhistorymember {
  matchhistory_id: number;
  profile_id: number;
  race_id: number;
  statgroup_id: number;
  teamid: number;
  wins: number;
  losses: number;
  streak: number;
  arbitration: number;
  outcome: number;
  oldrating: number;
  newrating: number;
  reporttype: number;
}

export interface MatchHistory {
  id: number;
  creator_profile_id: number;
  mapname: string;
  maxplayers: number;
  matchtype_id: number;
  description: string;
  startgametime: number;
  completiontime: number;
  matchhistoryreportresults: Matchhistoryreportresult[];
  matchhistoryitems: Matchhistoryitem[];
  matchhistorymember: Matchhistorymember[];
  profile_ids: number[];
  steam_ids: string[];
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  tags: string[];
  is_mature: boolean;
}
