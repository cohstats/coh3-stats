import {
  getLadderTournamentCasterVideos,
  getLadderTournamentFullRanking,
  getLadderTournamentSeasons,
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
  LadderTournamentSeason,
} from "../apis/ladder-tournament-api";
import { logger } from "../logger";
import {
  buildHubLadderSummary,
  buildLadderOverviewData,
  buildLadderSeasonPageData,
  getLadderChampionIds,
  getLadderSeasonIds,
  getLadderTopPlayerIds,
  LadderHubSummary,
  LadderOverviewData,
  LadderSeasonPageData,
  pickLadderFeaturedSeasonId,
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
  // Empty when the seasons couldn't be loaded, the pages then work without the season info
  seasons: LadderTournamentSeason[];
  // false when any part failed to load
  complete: boolean;
};

const loadRawData = async (): Promise<LadderTournamentRawData> => {
  const [rankingResult, videosResult, seasonsResult] = await Promise.allSettled([
    getLadderTournamentFullRanking(),
    getLadderTournamentCasterVideos(),
    getLadderTournamentSeasons(),
  ]);

  if (rankingResult.status === "rejected") {
    logger.error("Failed getting the Ladder Tournament full ranking");
    logger.error(rankingResult.reason);
  }
  if (videosResult.status === "rejected") {
    logger.error("Failed getting the Ladder Tournament caster videos");
    logger.error(videosResult.reason);
  }
  if (seasonsResult.status === "rejected") {
    logger.error("Failed getting the Ladder Tournament seasons");
    logger.error(seasonsResult.reason);
  }

  return {
    ranking: rankingResult.status === "fulfilled" ? rankingResult.value : null,
    videos: videosResult.status === "fulfilled" ? videosResult.value : [],
    seasons: seasonsResult.status === "fulfilled" ? seasonsResult.value : [],
    complete: [rankingResult, videosResult, seasonsResult].every(
      (result) => result.status === "fulfilled",
    ),
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
  const { ranking, videos, seasons, complete } = await loadRawData();
  const revalidate = complete
    ? LADDER_TOURNAMENT_REVALIDATE
    : LADDER_TOURNAMENT_REVALIDATE_ON_ERROR;

  // Without the ranking there are no standings to show
  if (ranking === null) {
    return { status: "unavailable", revalidate: LADDER_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  const seasonIds = getLadderSeasonIds(ranking, videos, seasons);
  const resolvedSeasonId = seasonId ?? seasonIds[0];
  if (resolvedSeasonId === undefined) {
    // The API works, but has no data at all
    return { status: "unavailable", revalidate };
  }
  if (!seasonIds.includes(resolvedSeasonId)) {
    return { status: "notFound", revalidate };
  }

  // Everybody in the season + the champions of all seasons for the season stats
  const names = await getLadderPlayerNames([
    ...ranking.filter((item) => item.seasonid === resolvedSeasonId).map((item) => item.relicid),
    ...getLadderChampionIds(ranking),
  ]);

  return {
    status: "ok",
    data: buildLadderSeasonPageData(resolvedSeasonId, ranking, videos, names, seasons),
    revalidate,
  };
};

export type LadderOverviewResult = {
  // null when the data couldn't be loaded
  data: LadderOverviewData | null;
  revalidate: number;
};

export const getLadderOverviewResult = async (): Promise<LadderOverviewResult> => {
  const { ranking, videos, seasons, complete } = await loadRawData();

  if (ranking === null) {
    return { data: null, revalidate: LADDER_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  // Champions of all seasons for the all seasons table + the top of the featured season
  const featuredSeasonId = pickLadderFeaturedSeasonId(
    getLadderSeasonIds(ranking, videos, seasons),
    seasons,
  );
  const names = await getLadderPlayerNames([
    ...getLadderChampionIds(ranking),
    ...(featuredSeasonId === undefined ? [] : getLadderTopPlayerIds(ranking, featuredSeasonId)),
  ]);

  return {
    data: buildLadderOverviewData(ranking, videos, names, seasons),
    revalidate: complete ? LADDER_TOURNAMENT_REVALIDATE : LADDER_TOURNAMENT_REVALIDATE_ON_ERROR,
  };
};

export type LadderHubResult = {
  // null when the data couldn't be loaded
  summary: LadderHubSummary | null;
  revalidate: number;
};

export const getLadderHubResult = async (): Promise<LadderHubResult> => {
  const { ranking, videos, seasons, complete } = await loadRawData();

  if (ranking === null) {
    return { summary: null, revalidate: LADDER_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  // Champions of the featured and the recent seasons, it's only a few players per season
  const names = await getLadderPlayerNames(getLadderChampionIds(ranking));

  return {
    summary: buildHubLadderSummary(ranking, videos, names, seasons),
    revalidate: complete ? LADDER_TOURNAMENT_REVALIDATE : LADDER_TOURNAMENT_REVALIDATE_ON_ERROR,
  };
};
