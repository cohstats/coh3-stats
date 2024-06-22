import { leaderBoardType, raceType } from "./coh3/coh3-types";

export type analysisType = "gameStats" | "mapStats";

export type AnalysisObjectType = {
  german: { wins: number; losses: number };
  american: { wins: number; losses: number };
  dak: { wins: number; losses: number };
  british: { wins: number; losses: number };
  matchCount: number;
  gameTime: number;
  gameTimeSpread: Record<string, number>;
  maps: Record<string, number>;
  factionMatrix: Record<string, { wins: number; losses: number }>;
};

export const analysisFilterTypeArray = [
  "stats-limit-0-799",
  "stats-limit-800-1099",
  "stats-limit-1100-1249",
  "stats-limit-1250-1399",
  "stats-limit-1400-1599",
  "stats-limit-1600-9999",
  "stats-average-0-799",
  "stats-average-800-1099",
  "stats-average-1100-1249",
  "stats-average-1250-1399",
  "stats-average-1400-1599",
  "stats-average-1600-9999",
  "stats-average-ex-0-799",
  "stats-average-ex-800-1099",
  "stats-average-ex-1100-1249",
  "stats-average-ex-1250-1399",
  "stats-average-ex-1400-1599",
  "stats-average-ex-1600-9999",
] as const;

export type analysisFilterType = (typeof analysisFilterTypeArray)[number];

// In your types.ts file
export const analysisMapFilterTypeArray = [
  "mapStats-limit-0-799",
  "mapStats-limit-800-1099",
  "mapStats-limit-1100-1249",
  "mapStats-limit-1250-1399",
  "mapStats-limit-1400-1599",
  "mapStats-limit-1600-9999",
  "mapStats-average-0-799",
  "mapStats-average-800-1099",
  "mapStats-average-1100-1249",
  "mapStats-average-1250-1399",
  "mapStats-average-1400-1599",
  "mapStats-average-1600-9999",
  "mapStats-average-ex-0-799",
  "mapStats-average-ex-800-1099",
  "mapStats-average-ex-1100-1249",
  "mapStats-average-ex-1250-1399",
  "mapStats-average-ex-1400-1599",
  "mapStats-average-ex-1600-9999",
] as const;

export type analysisMapFilterType = (typeof analysisMapFilterTypeArray)[number];

export type MapAnalysisObjectType = Record<string, AnalysisObjectType>;

export type DayAnalysisObjectType = Record<raceType, { wins: number; losses: number }>;

export type DaysAnalysisObjectType = Record<
  string,
  Record<leaderBoardType, DayAnalysisObjectType>
>;

export type DaysMapsAnalysisObjectType = Record<
  string,
  Record<leaderBoardType, DayMapsAnalysisObjectType>
>;

export type DayMapsAnalysisObjectType = Record<string, DayMapAnalysisObjectType>;
export type DayMapAnalysisObjectType = Record<raceType, { wins: number; losses: number }>;

export interface StatsDataObject {
  "1v1": AnalysisObjectType;
  "2v2": AnalysisObjectType;
  "3v3": AnalysisObjectType;
  "4v4": AnalysisObjectType;
  days: DaysAnalysisObjectType;
}

export interface MapStatsDataObject {
  "1v1": MapAnalysisObjectType;
  "2v2": MapAnalysisObjectType;
  "3v3": MapAnalysisObjectType;
  "4v4": MapAnalysisObjectType;
  days: DaysMapsAnalysisObjectType;
}

export interface getAnalysisStatsHttpResponse {
  analysis: StatsDataObject | MapStatsDataObject;
  fromTimeStampSeconds: number;
  toTimeStampSeconds: number;
  type: analysisType;
  wasMissingData: boolean;
  filters?: Array<string>;
}
