import { z } from "zod";
import config from "../../config";
import { logger } from "../logger";

/**
 * Client for the Ladder Tournament external API https://laddertournament.com.br/api/
 * The API is protected by a token (X-Api-Token header) - SERVER SIDE USAGE ONLY.
 */

type LadderTournamentYesNo = "Yes" | "No";

interface LadderTournamentRankingItem {
  seasonid: number;
  relicid: number;
  matches: number;
  wins: number;
  losses: number;
  score: number;
  // Win rate as decimal, eg 0.86
  rating: number;
  ladderwinner: LadderTournamentYesNo;
  ironcladwinner: LadderTournamentYesNo;
  metaplayswinner: LadderTournamentYesNo;
  championsOfheroeswinner: LadderTournamentYesNo;
  thelegend: LadderTournamentYesNo;
}

interface LadderTournamentRankingResponse {
  items: LadderTournamentRankingItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  count: number;
}

interface LadderTournamentCasterVideo {
  title: string;
  castedBy: string;
  // ISO 8601, eg 2026-09-07T00:00:00
  publishedAt: string;
  stage: string;
  // Empty string when not available
  videoUrlYoutube: string;
  // Empty string when not available
  videoUrlTwitch: string;
  seasonId: number;
  // Comma separated relic IDs, eg "111,222,333,444"
  playerRelicId: string;
}

const DEFAULT_RANKING_PAGE_SIZE = 500;

const relicIdSchema = z.coerce.number().int().positive();

const requireLadderTournamentApiToken = (): string => {
  const token = config.getLadderTournamentApiToken();
  if (!token) {
    logger.error("LADDER_TOURNAMENT_API_TOKEN is not set");
    throw new Error("LADDER_TOURNAMENT_API_TOKEN is not set");
  }
  return token;
};

const getLadderTournamentRequestInit = (): RequestInit => ({
  headers: { "X-Api-Token": requireLadderTournamentApiToken() },
  // Don't store token protected responses in the shared Next fetch cache
  cache: "no-store",
});

const getLadderTournamentRankingUrl = ({
  relicId,
  seasonId,
  page,
  pageSize,
}: {
  relicId: number;
  seasonId?: number;
  page: number;
  pageSize: number;
}) => {
  const seasonParam = seasonId !== undefined ? `&seasonid=${seasonId}` : "";
  return encodeURI(
    `${config.LADDER_TOURNAMENT_API_BASE_URL}/ranking_ladder?page=${page}&pageSize=${pageSize}&relicid=${relicId}${seasonParam}`,
  );
};

const getLadderTournamentCasterVideosUrl = () => {
  return encodeURI(`${config.LADDER_TOURNAMENT_API_BASE_URL}/casted_videos_ladder`);
};

/**
 * Returns the Ladder Tournament ranking for a single player.
 * @param relicId Relic profile ID of the player - required
 */
const getLadderTournamentRanking = async (
  relicId: number | string,
  options: { seasonId?: number; page?: number; pageSize?: number } = {},
): Promise<LadderTournamentRankingResponse> => {
  const parsedRelicId = relicIdSchema.safeParse(relicId);
  if (!parsedRelicId.success) {
    throw new Error(`Invalid relicId: ${relicId}`);
  }

  const { seasonId, page = 1, pageSize = DEFAULT_RANKING_PAGE_SIZE } = options;

  const response = await fetch(
    getLadderTournamentRankingUrl({ relicId: parsedRelicId.data, seasonId, page, pageSize }),
    getLadderTournamentRequestInit(),
  );

  if (response.ok) {
    return await response.json();
  } else {
    logger.error(
      `Error getting Ladder Tournament ranking for relicId ${relicId}, status code: ${response.status}`,
    );
    throw new Error(
      `Error getting Ladder Tournament ranking for relicId ${relicId}, status code: ${response.status}`,
    );
  }
};

interface CasterVideosCacheEntry {
  data: LadderTournamentCasterVideo[];
  timestamp: number;
  isUpdating: boolean;
}

// In-memory cache with 2-hour TTL (2 * 60 * 60 * 1000 ms)
const CASTER_VIDEOS_CACHE_TTL = 2 * 60 * 60 * 1000;
let casterVideosCache: CasterVideosCacheEntry | null = null;
// Shared promise for the initial fetch, so concurrent cold-start calls hit the API only once
let casterVideosInitialFetch: Promise<LadderTournamentCasterVideo[]> | null = null;

const fetchCasterVideos = async (): Promise<LadderTournamentCasterVideo[]> => {
  const response = await fetch(
    getLadderTournamentCasterVideosUrl(),
    getLadderTournamentRequestInit(),
  );

  if (response.ok) {
    return await response.json();
  } else {
    logger.error(
      `Error getting Ladder Tournament caster videos, status code: ${response.status}`,
    );
    throw new Error(
      `Error getting Ladder Tournament caster videos, status code: ${response.status}`,
    );
  }
};

/**
 * Returns the Ladder Tournament caster videos.
 * Cached in memory for 2 hours with stale-while-revalidate behaviour.
 * Throws when there is no cached data and the API call fails.
 */
const getLadderTournamentCasterVideos = async (): Promise<LadderTournamentCasterVideo[]> => {
  // If no cached data exists, fetch fresh data
  if (!casterVideosCache) {
    if (!casterVideosInitialFetch) {
      casterVideosInitialFetch = fetchCasterVideos()
        .then((freshData) => {
          casterVideosCache = {
            data: freshData,
            timestamp: Date.now(),
            isUpdating: false,
          };
          logger.info(`Fetched fresh Ladder Tournament caster videos ${freshData.length}`);
          return freshData;
        })
        .finally(() => {
          casterVideosInitialFetch = null;
        });
    }
    return casterVideosInitialFetch;
  }

  const isExpired = Date.now() - casterVideosCache.timestamp > CASTER_VIDEOS_CACHE_TTL;

  // If cache is still fresh, return cached data
  if (!isExpired) {
    return casterVideosCache.data;
  }

  // Cache is expired - return stale data immediately and update in background
  if (!casterVideosCache.isUpdating) {
    // Mark as updating to prevent multiple concurrent updates
    casterVideosCache.isUpdating = true;

    fetchCasterVideos()
      .then((freshData) => {
        casterVideosCache = {
          data: freshData,
          timestamp: Date.now(),
          isUpdating: false,
        };
        logger.info(`Refreshed Ladder Tournament caster videos ${freshData.length}`);
      })
      .catch((error) => {
        logger.error(
          `Error refreshing Ladder Tournament caster videos, keeping stale cache: ${error}`,
        );
        // Reset updating flag on error so we can try again next time
        if (casterVideosCache) {
          casterVideosCache.isUpdating = false;
        }
      });
  }

  // Return stale data immediately
  return casterVideosCache.data;
};

const DEFAULT_PLAYER_CASTER_VIDEOS_LIMIT = 10;

const limitSchema = z.coerce.number().int().positive();

/**
 * Returns caster videos in which the player participated, sorted from the newest.
 * Uses the cached caster videos from getLadderTournamentCasterVideos.
 * @param relicId Relic profile ID of the player
 * @param limit Maximum number of videos to return
 */
const getLadderTournamentCasterVideosForPlayer = async (
  relicId: number | string,
  limit: number = DEFAULT_PLAYER_CASTER_VIDEOS_LIMIT,
): Promise<LadderTournamentCasterVideo[]> => {
  const parsedRelicId = relicIdSchema.safeParse(relicId);
  if (!parsedRelicId.success) {
    throw new Error(`Invalid relicId: ${relicId}`);
  }
  const parsedLimit = limitSchema.safeParse(limit);
  if (!parsedLimit.success) {
    throw new Error(`Invalid limit: ${limit}`);
  }

  const playerId = `${parsedRelicId.data}`;
  const videos = await getLadderTournamentCasterVideos();

  return videos
    .filter((video) =>
      `${video.playerRelicId ?? ""}`
        .split(",")
        .map((id) => id.trim())
        .includes(playerId),
    )
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
    .slice(0, parsedLimit.data);
};

/**
 * Only for unit tests - resets the in-memory caster videos cache.
 */
const __resetLadderTournamentCasterVideosCache = () => {
  casterVideosCache = null;
  casterVideosInitialFetch = null;
};

export type {
  LadderTournamentYesNo,
  LadderTournamentRankingItem,
  LadderTournamentRankingResponse,
  LadderTournamentCasterVideo,
};
export {
  getLadderTournamentRankingUrl,
  getLadderTournamentCasterVideosUrl,
  getLadderTournamentRanking,
  getLadderTournamentCasterVideos,
  getLadderTournamentCasterVideosForPlayer,
  __resetLadderTournamentCasterVideosCache,
};
