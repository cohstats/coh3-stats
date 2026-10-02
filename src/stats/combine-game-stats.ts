import {
  AnalysisObjectType,
  DayAnalysisObjectType,
  DaysAnalysisObjectType,
  StatsDataObject,
} from "../analysis-types";
import { leaderBoardType, leaderBoardTypeArray, raceTypeArray } from "../coh3/coh3-types";

export type gameStatsModeType = leaderBoardType | "all";

/** Days analysis where every day carries an extra `all` key - the sum of all the modes. */
export type DaysWithAllAnalysisObjectType = Record<
  string,
  Partial<Record<gameStatsModeType, DayAnalysisObjectType>>
>;

/**
 * Colors for the 1v1 - 4v4 series, shared by all the "across game modes" charts.
 * Picked to stay distinct from the faction colors and to read on both light and dark background.
 */
export const modeColors: Record<leaderBoardType, string> = {
  "1v1": "#4C9BE8",
  "2v2": "#E8A33D",
  "3v3": "#9B6FD6",
  "4v4": "#3FB39A",
};

/** Mode suffix for the chart titles - "2v2" or "all modes". */
export const getModeLabel = (mode: gameStatsModeType) => (mode === "all" ? "all modes" : mode);

const safeNumber = (value: unknown): number => {
  const number = Number(value);
  return isNaN(number) ? 0 : number;
};

const mergeCounts = (target: Record<string, number>, source?: Record<string, number>) => {
  for (const [key, value] of Object.entries(source || {})) {
    target[key] = (target[key] || 0) + safeNumber(value);
  }
};

const emptyFactions = () =>
  Object.fromEntries(
    raceTypeArray.map((faction) => [faction, { wins: 0, losses: 0 }]),
  ) as DayAnalysisObjectType;

/**
 * Sums all the game modes into one analysis object.
 *
 * Wins / losses are counted per player slot by the API (a 4v4 match adds 8 faction results),
 * so the summed faction numbers are dominated by the team games.
 * `factionMatrix` keys are different for every mode (`WxB` vs `WDxBA`), so they can't be summed.
 */
export const combineModesAnalysis = (analysis: StatsDataObject): AnalysisObjectType => {
  const combined: AnalysisObjectType = {
    ...emptyFactions(),
    matchCount: 0,
    gameTime: 0,
    gameTimeSpread: {},
    maps: {},
    factionMatrix: {},
  };

  for (const mode of leaderBoardTypeArray) {
    const modeAnalysis = analysis[mode];
    if (!modeAnalysis) continue;

    for (const faction of raceTypeArray) {
      combined[faction].wins += safeNumber(modeAnalysis[faction]?.wins);
      combined[faction].losses += safeNumber(modeAnalysis[faction]?.losses);
    }

    combined.matchCount += safeNumber(modeAnalysis.matchCount);
    combined.gameTime += safeNumber(modeAnalysis.gameTime);
    mergeCounts(combined.gameTimeSpread, modeAnalysis.gameTimeSpread);
    mergeCounts(combined.maps, modeAnalysis.maps);
  }

  return combined;
};

/**
 * Returns a copy of the days analysis where every day has an extra `all` key
 * with the faction results summed across all the modes.
 */
export const withCombinedDays = (days: DaysAnalysisObjectType): DaysWithAllAnalysisObjectType => {
  const result: DaysWithAllAnalysisObjectType = {};

  for (const [day, dayModes] of Object.entries(days || {})) {
    const all = emptyFactions();

    for (const mode of leaderBoardTypeArray) {
      const dayAnalysis = dayModes?.[mode];
      if (!dayAnalysis) continue;

      for (const faction of raceTypeArray) {
        all[faction].wins += safeNumber(dayAnalysis[faction]?.wins);
        all[faction].losses += safeNumber(dayAnalysis[faction]?.losses);
      }
    }

    result[day] = { ...dayModes, all };
  }

  return result;
};

/** `gameTime` from the API is the total of all the games in seconds. */
export const getAverageGameTimeMinutes = (
  data: Pick<AnalysisObjectType, "gameTime" | "matchCount">,
) => {
  const matchCount = safeNumber(data.matchCount);
  if (matchCount === 0) return 0;
  return safeNumber(data.gameTime) / matchCount / 60;
};

export const getTotalGameTimeHours = (data: Pick<AnalysisObjectType, "gameTime">) => {
  return safeNumber(data.gameTime) / 3600;
};

/** Total faction results (wins + losses) in one mode - the amount of player slots. */
export const getFactionSlotsCount = (data: AnalysisObjectType) => {
  return raceTypeArray.reduce(
    (sum, faction) => sum + safeNumber(data[faction]?.wins) + safeNumber(data[faction]?.losses),
    0,
  );
};

/** The `gameTimeSpread` keys are the start of the bucket in minutes - "0", "5", "10", "20" ... "60". */
export const getGameTimeBucketLabel = (key: string) => {
  const start = parseInt(key);
  if (start === 0) return "0 - 5";
  if (start === 5) return "5 - 10";
  if (start >= 60) return "60+";
  return `${start} - ${start + 10}`;
};
