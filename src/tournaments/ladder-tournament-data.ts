import {
  getLadderTournamentCasterVideos,
  getLadderTournamentFullRanking,
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
} from "../apis/ladder-tournament-api";
import { logger } from "../logger";
import {
  buildHubLadderSummary,
  buildLadderSeasonPageData,
  getLadderChampionIds,
  getLadderSeasonIds,
  LadderHubSummary,
  LadderSeasonPageData,
} from "./ladder-tournament";
import { getLadderPlayerNames } from "./ladder-tournament-names";

/**
 * Loads the Ladder Tournament data for the ISR pages. SERVER SIDE ONLY.
 */

// ISR revalidate times in seconds
export const LADDER_TOURNAMENT_REVALIDATE = 3600;
// Short revalidate after a failure, so the page recovers quickly
export const LADDER_TOURNAMENT_REVALIDATE_ON_ERROR = 60;

type LadderTournamentRawData = {
  // null when the ranking couldn't be loaded
  ranking: LadderTournamentRankingItem[] | null;
  // Empty when the videos couldn't be loaded, see `complete`
  videos: LadderTournamentCasterVideo[];
  // false when any part failed to load
  complete: boolean;
};

const loadRawData = async (): Promise<LadderTournamentRawData> => {
  const [rankingResult, videosResult] = await Promise.allSettled([
    getLadderTournamentFullRanking(),
    getLadderTournamentCasterVideos(),
  ]);

  if (rankingResult.status === "rejected") {
    logger.error("Failed getting the Ladder Tournament full ranking");
    logger.error(rankingResult.reason);
  }
  if (videosResult.status === "rejected") {
    logger.error("Failed getting the Ladder Tournament caster videos");
    logger.error(videosResult.reason);
  }

  return {
    ranking: rankingResult.status === "fulfilled" ? rankingResult.value : null,
    videos: videosResult.status === "fulfilled" ? videosResult.value : [],
    complete: rankingResult.status === "fulfilled" && videosResult.status === "fulfilled",
  };
};

export type LadderSeasonPageResult =
  | { status: "ok"; data: LadderSeasonPageData; revalidate: number }
  | { status: "notFound"; revalidate: number }
  | { status: "unavailable"; revalidate: number };

/**
 * @param seasonId Season to load, the latest season when not set
 */
export const getLadderSeasonPageResult = async (
  seasonId?: number,
): Promise<LadderSeasonPageResult> => {
  const { ranking, videos, complete } = await loadRawData();
  const revalidate = complete
    ? LADDER_TOURNAMENT_REVALIDATE
    : LADDER_TOURNAMENT_REVALIDATE_ON_ERROR;

  // Without the ranking we can't tell which seasons exist
  if (ranking === null) {
    return { status: "unavailable", revalidate: LADDER_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  const seasonIds = getLadderSeasonIds(ranking, videos);
  const resolvedSeasonId = seasonId ?? seasonIds[0];
  if (resolvedSeasonId === undefined) {
    // The API works, but has no data at all
    return { status: "unavailable", revalidate };
  }
  if (!seasonIds.includes(resolvedSeasonId)) {
    return { status: "notFound", revalidate };
  }

  // Everybody in the season + the champions of all seasons for the all seasons table
  const names = await getLadderPlayerNames([
    ...ranking.filter((item) => item.seasonid === resolvedSeasonId).map((item) => item.relicid),
    ...getLadderChampionIds(ranking),
  ]);

  return {
    status: "ok",
    data: buildLadderSeasonPageData(resolvedSeasonId, ranking, videos, names),
    revalidate,
  };
};

export type LadderHubResult = {
  // null when the data couldn't be loaded
  summary: LadderHubSummary | null;
  revalidate: number;
};

export const getLadderHubResult = async (): Promise<LadderHubResult> => {
  const { ranking, videos, complete } = await loadRawData();

  if (ranking === null) {
    return { summary: null, revalidate: LADDER_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  const seasonIds = getLadderSeasonIds(ranking, videos);
  const names = await getLadderPlayerNames(getLadderChampionIds(ranking, seasonIds.slice(0, 1)));

  return {
    summary: buildHubLadderSummary(ranking, videos, names),
    revalidate: complete ? LADDER_TOURNAMENT_REVALIDATE : LADDER_TOURNAMENT_REVALIDATE_ON_ERROR,
  };
};
