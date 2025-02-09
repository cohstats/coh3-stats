import { Timestamp } from "@firebase/firestore-types";
import { PlayerRank } from "./coh3-data";

export const raceTypeArray = ["german", "american", "dak", "british"] as const;

export type raceType = (typeof raceTypeArray)[number];

export const leaderBoardTypeArray = ["1v1", "2v2", "3v3", "4v4"] as const;

export type leaderBoardType = (typeof leaderBoardTypeArray)[number];

export type raceID = 129494 | 137123 | 197345 | 198437 | 203852;

export type platformType = "steam" | "xbox" | "psn";

export type WinLossPairType = { w: number; l: number };

export type FactionSide = "axis" | "allies";

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
  highestrank: number;
  highestranklevel: number;
  highestrating: number;
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
  platform: platformType;
  COH3PlayTime?: null;
  RelicProfile: {
    leaderboardStats: Array<RawLeaderboardStat>;
    statGroups: Array<RawStatGroup>;
  };
  SteamProfile?: Record<string, { steamid: string; profileurl: string; avatarmedium: string }>;
}

export type InternalStandings = Record<
  raceType,
  Record<leaderBoardType, RawLeaderboardStat | null>
>;

export type PlayerCardDataType = {
  platform: platformType;
  steamData: { steamid: string; profileurl: string; avatarmedium: string } | null;
  COH3PlayTime: null;
  standings: InternalStandings;
  info: {
    relicID: number;
    country: string;
    level: number;
    name: string;
    xp: number | undefined;
    steamID: string | null;
  };
  highestRankTier: {
    tier: PlayerRank;
    info: {
      type: "1v1" | "2v2" | "3v3" | "4v4";
      race: "german" | "american" | "dak" | "british";
    } | null;
  };
};

interface ProcessedMatchHistoryMember {
  statgroup_id: number;
  wins: number;
  losses: number;
  streak: number;
  arbitration: number;
  outcome: number;
  oldrating: number;
  newrating: number;
  reporttype: number;
}

interface ProcessedProfile {
  name: string;
  alias: string;
  personal_statgroup_id: number;
  xp: number;
  level: number;
  leaderboardregion_id: number;
  country: string;
}

export interface PlayerReportCounters {
  abil: number;
  addonkill: number;
  blost: number;
  bprod: number;
  cabil: number;
  cflags: number;
  cpearn: number;
  dmgdone: number;
  edeaths: number;
  ekills: number;
  elitekill: number;
  erein: number;
  gammaspnt: number;
  gt: number;
  inactperiod: number;
  lowintperiod: number;
  objdmh: number;
  pcap: number;
  plost: number;
  popmax: number;
  powearn: number;
  powmax: number;
  powspnt: number;
  precap: number;
  reqearn: number;
  reqmax: number;
  reqspnt: number;
  sqkill: number;
  sqlost: number;
  sqprod: number;
  structdmg: number;
  svetrank: number;
  svetxp: number;
  totalcmds: number;
  unitprod: number;
  upg: number;
  vabnd: number;
  vcap: number;
  vkill: number;
  vlost: number;
  vp0: number;
  vp1: number;
  vprod: number;
  vvetrank: number;
  vvetxp: number;
  wpnpu: number;
}

export interface PlayerReport {
  profile_id: number;
  resulttype: number;
  teamid: number;
  race_id: number;
  counters: PlayerReportCounters;
  profile: ProcessedProfile;
  matchhistorymember: ProcessedMatchHistoryMember;
}

export interface ProcessedMatchHistoryItem {
  profile_id: number;
  itemdefinition_id: number;
  itemlocation_id: number;
}

export interface ProcessedMatch {
  id: number;
  creator_profile_id: number;
  mapname: string;
  maxplayers: number;
  matchtype_id: number;
  description: string;
  platform: string;
  startgametime: number;
  completiontime: number;
  matchhistoryreportresults: Array<PlayerReport>;
  matchhistoryitems: Array<ProcessedMatchHistoryItem>;
  profile_ids: Array<number>;
  matchurls: Array<{ profile_id: number; key: string }>;
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

export interface SearchPlayerCardData {
  platform: platformType;
  avatar: string;
  relicProfileId: string;
  level: number;
  country: string;
  alias: string;
}

export interface Top1v1LeaderboardsData {
  race: raceType;
  data: Array<LaddersDataArrayObject>;
}

export interface GlobalAchievementsData {
  globalAchievements: Record<
    string,
    {
      defaultvalue: number;
      displayName: string;
      hidden: number;
      description: string;
      icon: string;
      icongray: string;
      globalPercent: string;
    }
  >;
  unixTimeStamp: number;
}

export interface PlayerPersonalCOHStats {
  // Let's store the dates in format YYYY-MM-DD
  activityByDate: Record<string, WinLossPairType>;
  activityByWeekDay: {
    Mo: WinLossPairType;
    Tu: WinLossPairType;
    We: WinLossPairType;
    Th: WinLossPairType;
    Fr: WinLossPairType;
    Sa: WinLossPairType;
    Su: WinLossPairType;
  };
  activityByHour: {
    0: WinLossPairType;
    1: WinLossPairType;
    2: WinLossPairType;
    3: WinLossPairType;
    4: WinLossPairType;
    5: WinLossPairType;
    6: WinLossPairType;
    7: WinLossPairType;
    8: WinLossPairType;
    9: WinLossPairType;
    10: WinLossPairType;
    11: WinLossPairType;
    12: WinLossPairType;
    13: WinLossPairType;
    14: WinLossPairType;
    15: WinLossPairType;
    16: WinLossPairType;
    17: WinLossPairType;
    18: WinLossPairType;
    19: WinLossPairType;
    20: WinLossPairType;
    21: WinLossPairType;
    22: WinLossPairType;
    23: WinLossPairType;
  };
  nemesis: Record<
    string,
    {
      w: number; // wins
      l: number; // losses
      alias: string;
    }
  >;
  // startGroup id is in format `race_id-matchtype_id-statgroup_id`
  statGroups: Record<
    string,
    {
      w: number; // wins
      l: number; // losses
      gameTime: number; // play time in seconds
      gameTimeSpread: Record<number, WinLossPairType>; // play time in seconds
      factionMatrix: Record<string, { wins: number; losses: number }>;
      maps: Record<string, WinLossPairType>;
      counters: Record<string, number>;
    }
  >;
}

export interface PlayerProfileCOHStats {
  alias: string;
  alias_lc: string;
  // This is Relic ID
  profile_id: number;
  level: number;
  steam_id: string;
  country: string;
  leaderboardStats?: Record<string, HistoricLeaderBoardStat>;
  updatedAt: Timestamp;
  stats?: PlayerPersonalCOHStats;
  customGamesHidden?: {
    hidden: boolean;
    updatedAt: Timestamp;
  };
}

export interface HistoryOfLeaderBoardStat {
  w: number; // wins
  l: number; // losses
  r: number; // ranks
  rl: number; // rank level
  rt: number; // rating
  ts: Timestamp; // timestamp
  date: string; // date
}

export interface HistoricLeaderBoardStat {
  leaderboard_id: number;
  wins: number;
  losses: number;
  rank: number;
  ranklevel: number;
  statgroup_id: number;
  history: Array<HistoryOfLeaderBoardStat>;
}

export interface ProcessedCOHPlayerStats {
  activityByDate: Array<{
    day: string;
    value: number;
    wins: number;
    losses: number;
  }>;
  activityByHour: Array<{
    hour: string;
    value: number;
    wins: number;
    losses: number;
  }>;
  activityByWeekDay: Array<{
    day: string;
    value: number;
    wins: number;
    losses: number;
  }>;
  customGamesHidden: boolean;
  nemesis:
    | Array<{
        profile_id: string;
        alias: string;
        w: number;
        l: number;
        c?: string;
      }>
    | [];
  statGroups: Record<
    leaderBoardType,
    Record<
      raceType,
      {
        w: number; // wins
        l: number; // losses
        gameTime: number; // play time in seconds
        gameTimeSpread: Record<number, WinLossPairType>; // play time in seconds
        factionMatrix: Record<string, { wins: number; losses: number }>;
        maps: Record<string, WinLossPairType>;
        counters: Record<string, number>;
      } | null
    >
  >;
  leaderBoardStats: Record<leaderBoardType, Record<raceType, HistoricLeaderBoardStat | null>>;
}

export interface YouTubeVideo {
  title: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  viewCount: string;
  videoId: string;
}

export interface LiveGameSummary {
  liveGameSummary: {
    "1v1": {
      games: number;
      players: number;
    };
    "2v2": {
      games: number;
      players: number;
    };
    "3v3": {
      games: number;
      players: number;
    };
    "4v4": {
      games: number;
      players: number;
    };
    ai: {
      games: number;
      players: number;
    };
    custom: {
      games: number;
      players: number;
    };
    totalAutomatch: {
      games: number;
      players: number;
    };
    total: {
      games: number;
      players: number;
    };
    unixTimeStamp: number;
  };
  liveGamesChart: {
    timeLine: Array<{
      ut: number;
      "1v1": number;
      "2v2": number;
      "3v3": number;
      "4v4": number;
      ai: number;
      custom: number;
    }>;
  };
}

export interface LivePlayerProfile {
  profile_id: number;
  alias: string;
  country: string;
  steamid: string;
  statgroup_id: number;
}

export interface ProcessedLiveGame {
  id: number;
  creator_profile_id: number;
  description: string;
  description2: string;
  mapname: string;
  maxplayers: number;
  matchtype_id: number;
  players: Array<Record<string, number | string>>;
  current_observers: number;
  startgametime: number;
  server: string;
}

export interface PlayersOnLiveGames {
  profile_id: number;
  race_id: number;
  rank: number;
  teamid: number;
  player_profile: LivePlayerProfile;
}

export interface LiveGame extends Omit<ProcessedLiveGame, "players"> {
  players: Array<PlayersOnLiveGames>;
}

export interface ResponseLiveGames {
  liveGames: Array<LiveGame>;
  totalGames: number;
  unixTimeStamp: number;
}

export type TypeOfLiveGame = "1v1" | "2v2" | "3v3" | "4v4" | "ai" | "custom";
