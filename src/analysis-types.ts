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
}
