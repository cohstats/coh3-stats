import config from "../../config";
import { logger } from "../logger";
import { getGMTTimeStamp } from "../utils";
import { getStatsData } from "../apis/coh3stats-api";
import type {
  AnalysisObjectType,
  getAnalysisStatsHttpResponse,
  MapStatsDataObject,
} from "../analysis-types";
import type { mapStatsModeType } from "../routes";

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/** The part of the map stats the team composition chart needs. */
export type MapTeamComposition = Pick<AnalysisObjectType, "factionMatrix" | "matchCount">;

let cache: { data: getAnalysisStatsHttpResponse; timestamp: number } | null = null;
// Many map pages regenerate at the same time, they should all wait for a single request.
let inFlight: Promise<getAnalysisStatsHttpResponse> | null = null;

const fetchLatestPatchMapStats = async (): Promise<getAnalysisStatsHttpResponse> => {
  const fromTimeStamp = getGMTTimeStamp(
    new Date(config.statsPatchSelector[config.latestPatch].from),
  );

  const data = await getStatsData(
    fromTimeStamp,
    "now",
    "mapStats",
    "https://coh3stats.com",
    ["all"],
    {
      Origin: "https://coh3stats.com",
    },
  );

  // Remove the days object, we don't need it, lowers the amount of data
  // @ts-ignore
  data.analysis.days = undefined;

  return data;
};

/**
 * Map stats of the latest patch (without the per day breakdown).
 * Cached in memory, throws when the data can't be fetched.
 */
const getLatestPatchMapStats = async (): Promise<getAnalysisStatsHttpResponse> => {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
    return cache.data;
  }

  if (!inFlight) {
    inFlight = fetchLatestPatchMapStats()
      .then((data) => {
        cache = { data, timestamp: Date.now() };
        return data;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};

/**
 * Team composition of a single map in the latest patch.
 * Returns null when there are no games for the map or the data is not available.
 */
const getLatestPatchMapTeamComposition = async (
  mapId: string,
  mode: mapStatsModeType,
): Promise<MapTeamComposition | null> => {
  try {
    const data = await getLatestPatchMapStats();
    const mapStats = (data.analysis as MapStatsDataObject)[mode]?.[mapId];

    if (!mapStats?.factionMatrix || !mapStats.matchCount) {
      return null;
    }

    return { factionMatrix: mapStats.factionMatrix, matchCount: mapStats.matchCount };
  } catch (e) {
    logger.error(e);
    return null;
  }
};

export { getLatestPatchMapStats, getLatestPatchMapTeamComposition };
