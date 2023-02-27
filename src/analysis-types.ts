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

export interface StatsDataObject {
  "1v1": AnalysisObjectType;
  "2v2": AnalysisObjectType;
  "3v3": AnalysisObjectType;
  "4v4": AnalysisObjectType;
}

export interface MapStatsDataObject {
  "1v1": MapAnalysisObjectType;
  "2v2": MapAnalysisObjectType;
  "3v3": MapAnalysisObjectType;
  "4v4": MapAnalysisObjectType;
}

export interface getAnalysisStatsHttpResponse {
  analysis: StatsDataObject;
  fromTimeStampSeconds: number;
  toTimeStampSeconds: number;
  type: analysisType;
  wasMissingData: boolean;
}