import { z } from "zod";
import config from "../../config";
import { logger } from "../logger";

/**
 * Client for the Ladder Tournament external API https://laddertournament.com.br/api/
 * The API is protected by a token (X-Api-Token header) - SERVER SIDE USAGE ONLY.
 */

// Responses are validated against these schemas (documented API contract),
// so a change of the response keys on the API side fails loudly instead of returning undefined fields.
const yesNoSchema = z.enum(["Yes", "No"]);

const rankingItemSchema = z.object({
  seasonid: z.number(),
  relicid: z.number(),
  matches: z.number(),
  wins: z.number(),
  losses: z.number(),
  score: z.number(),
  // Win rate as decimal, eg 0.86
  rating: z.number(),
  ladderwinner: yesNoSchema,
  ironcladwinner: yesNoSchema,
  metaplayswinner: yesNoSchema,
  championsOfheroeswinner: yesNoSchema,
  thelegend: yesNoSchema,
});

const rankingResponseSchema = z.object({
  items: z.array(rankingItemSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasPrevious: z.boolean(),
  hasNext: z.boolean(),
  count: z.number(),
});

const casterVideoSchema = z.object({
  // Documented, but not guaranteed - used only as a React key when present
  id: z.number().optional(),
  title: z.string(),
  castedBy: z.string(),
  // ISO 8601, eg 2026-09-07T00:00:00
  publishedAt: z.string(),
  stage: z.string(),
  // Empty string when not available
  videoUrlYoutube: z.string(),
  // Empty string when not available
  videoUrlTwitch: z.string(),
  seasonId: z.number(),
  // Comma separated relic IDs, eg "111,222,333,444"
  playerRelicId: z.string(),
});

const casterVideosResponseSchema = z.array(casterVideoSchema);

// eg "2026-10-02T15:00:00", the time and the offset are optional
const ISO_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const isValidIsoDate = (value: string) => {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match || Number.isNaN(Date.parse(value))) return false;
  // Date.parse rolls the overflowed days over (2026-02-30 is 2 Mar), the date must stay the same
  const [year, month, day] = match.slice(1, 4).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

// ISO 8601 date, a malformed one would render as an empty or a wrong date range
const isoDateSchema = z.string().refine(isValidIsoDate, {
  message: "Invalid ISO 8601 date",
});

// The docs say PascalCase keys, the API sends camelCase.
// The registration fee and the rules text are not used, so they are not part of the contract.
const seasonSchema = z.object({
  // Same value as seasonid in the ranking and seasonId in the caster videos,
  // a positive integer as the season page URL accepts only those
  id: z.number().int().positive(),
  // Eg "BloodAndSteel" or "Season#1"
  name: z.string(),
  // Values are not documented - seen "Draft" and "Finished", the docs example has "Active"
  status: z.string(),
  // ISO 8601 without the offset, UTC by the docs, eg 2026-11-03T10:00:00
  registrationStart: isoDateSchema,
  registrationEnd: isoDateSchema,
  ladderStart: isoDateSchema,
  ladderEnd: isoDateSchema,
  // How many positions above its own a team can challenge
  maxChallengePositions: z.number(),
  challengeResponseHours: z.number(),
  matchDeadlineDays: z.number(),
  inactivityDays: z.number(),
  rematchDays: z.number(),
  rematchOtherMatches: z.number(),
  // Number of the top teams going to the playoffs / the semifinals
  playoffCut: z.number(),
  semifinalCut: z.number(),
  // Games per match, eg 3 = best of 3
  ladderBestOf: z.number(),
  funnelBestOf: z.number(),
  semifinalBestOf: z.number(),
  finalBestOf: z.number(),
});

const seasonsResponseSchema = z.array(seasonSchema);

type LadderTournamentYesNo = z.infer<typeof yesNoSchema>;
type LadderTournamentRankingItem = z.infer<typeof rankingItemSchema>;
type LadderTournamentRankingResponse = z.infer<typeof rankingResponseSchema>;
type LadderTournamentCasterVideo = z.infer<typeof casterVideoSchema>;
type LadderTournamentSeason = z.infer<typeof seasonSchema>;

const parseLadderTournamentResponse = <T>(
  schema: z.ZodType<T>,
  data: unknown,
  name: string,
): T => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = `Invalid Ladder Tournament ${name} response: ${z.prettifyError(parsed.error)}`;
    logger.error(message);
    throw new Error(message);
  }
  return parsed.data;
};

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

// Partner API request timeout, so a hanging API doesn't stall the ISR / SSR pages
const REQUEST_TIMEOUT_MS = 30_000;

const isTimeoutError = (error: unknown) => (error as { name?: string })?.name === "TimeoutError";

/**
 * fetch with the API token and the timeout, a timeout is rethrown with a clear message.
 */
const fetchLadderTournament = async (url: string): Promise<Response> => {
  try {
    return await fetch(url, {
      headers: { "X-Api-Token": requireLadderTournamentApiToken() },
      // Don't store token protected responses in the shared Next fetch cache
      cache: "no-store",
      // A new signal per request, the timeout starts with the request
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      const message = `Ladder Tournament API timed out after ${REQUEST_TIMEOUT_MS / 1000}s`;
      logger.error(`${message}: ${url}`);
      throw new Error(message);
    }
    throw error;
  }
};

const getLadderTournamentRankingUrl = ({
  relicId,
  seasonId,
  page,
  pageSize,
}: {
  // All the players when not set
  relicId?: number;
  // All the seasons when not set
  seasonId?: number;
  page: number;
  pageSize: number;
}) => {
  const relicParam = relicId !== undefined ? `&relicid=${relicId}` : "";
  const seasonParam = seasonId !== undefined ? `&seasonid=${seasonId}` : "";
  return encodeURI(
    `${config.tournaments.ladderTournament.apiBaseUrl}/ranking_ladder?page=${page}&pageSize=${pageSize}${relicParam}${seasonParam}`,
  );
};

const getLadderTournamentCasterVideosUrl = () => {
  return encodeURI(`${config.tournaments.ladderTournament.apiBaseUrl}/casted_videos_ladder`);
};

const getLadderTournamentSeasonsUrl = () => {
  return encodeURI(`${config.tournaments.ladderTournament.apiBaseUrl}/seasons`);
};

/**
 * Returns all the Ladder Tournament seasons with their calendar, rules and match format.
 */
const getLadderTournamentSeasons = async (): Promise<LadderTournamentSeason[]> => {
  const response = await fetchLadderTournament(getLadderTournamentSeasonsUrl());

  if (response.ok) {
    return parseLadderTournamentResponse(seasonsResponseSchema, await response.json(), "seasons");
  } else {
    logger.error(`Error getting Ladder Tournament seasons, status code: ${response.status}`);
    throw new Error(`Error getting Ladder Tournament seasons, status code: ${response.status}`);
  }
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

  const response = await fetchLadderTournament(
    getLadderTournamentRankingUrl({ relicId: parsedRelicId.data, seasonId, page, pageSize }),
  );

  if (response.ok) {
    return parseLadderTournamentResponse(rankingResponseSchema, await response.json(), "ranking");
  } else {
    logger.error(
      `Error getting Ladder Tournament ranking for relicId ${relicId}, status code: ${response.status}`,
    );
    throw new Error(
      `Error getting Ladder Tournament ranking for relicId ${relicId}, status code: ${response.status}`,
    );
  }
};

// Max page size allowed by the API
const FULL_RANKING_PAGE_SIZE = 1000;
// Safety net against an API which keeps returning hasNext, 50k rows is way more than we expect
const FULL_RANKING_MAX_PAGES = 50;

/**
 * Returns all ranking items, optionally for one season, following the pagination.
 * Throws when any of the pages fails to load.
 */
const getLadderTournamentFullRanking = async (
  options: { seasonId?: number } = {},
): Promise<LadderTournamentRankingItem[]> => {
  const { seasonId } = options;
  const items: LadderTournamentRankingItem[] = [];

  for (let page = 1; page <= FULL_RANKING_MAX_PAGES; page++) {
    const response = await fetchLadderTournament(
      getLadderTournamentRankingUrl({ seasonId, page, pageSize: FULL_RANKING_PAGE_SIZE }),
    );

    if (!response.ok) {
      logger.error(
        `Error getting Ladder Tournament full ranking page ${page}, status code: ${response.status}`,
      );
      throw new Error(
        `Error getting Ladder Tournament full ranking page ${page}, status code: ${response.status}`,
      );
    }

    const data = parseLadderTournamentResponse(
      rankingResponseSchema,
      await response.json(),
      "ranking",
    );
    items.push(...data.items);

    if (!data.hasNext) {
      return items;
    }
  }

  logger.error(
    `Ladder Tournament full ranking has more than ${FULL_RANKING_MAX_PAGES} pages, returning the first ${items.length} items`,
  );
  return items;
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
  const response = await fetchLadderTournament(getLadderTournamentCasterVideosUrl());

  if (response.ok) {
    return parseLadderTournamentResponse(
      casterVideosResponseSchema,
      await response.json(),
      "caster videos",
    );
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

type LadderTournamentPlayerData = {
  // Sorted from the newest, null when the data couldn't be loaded
  videos: LadderTournamentCasterVideo[] | null;
  // In the API order, null when the data couldn't be loaded
  ladderRanking: LadderTournamentRankingItem[] | null;
};

// The player card shows all the casts grouped by season, the limit is only a safety net
const PLAYER_CARD_VIDEOS_LIMIT = 200;

/**
 * Loads all the Ladder Tournament data needed for the player card.
 * Never throws - the parts which fail to load are returned as null.
 * @param relicId Relic profile ID of the player
 */
const getLadderTournamentPlayerData = async (
  relicId: number | string,
): Promise<LadderTournamentPlayerData> => {
  const [videosResult, rankingResult] = await Promise.allSettled([
    getLadderTournamentCasterVideosForPlayer(relicId, PLAYER_CARD_VIDEOS_LIMIT),
    getLadderTournamentRanking(relicId),
  ]);

  if (videosResult.status === "rejected") {
    logger.error(`Failed getting Ladder Tournament videos for player ${relicId}`);
    logger.error(videosResult.reason);
  }
  if (rankingResult.status === "rejected") {
    logger.error(`Failed getting Ladder Tournament ranking for player ${relicId}`);
    logger.error(rankingResult.reason);
  }

  return {
    videos: videosResult.status === "fulfilled" ? videosResult.value : null,
    ladderRanking: rankingResult.status === "fulfilled" ? rankingResult.value.items : null,
  };
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
  LadderTournamentPlayerData,
  LadderTournamentSeason,
};
export {
  getLadderTournamentRankingUrl,
  getLadderTournamentCasterVideosUrl,
  getLadderTournamentSeasonsUrl,
  getLadderTournamentSeasons,
  getLadderTournamentRanking,
  getLadderTournamentFullRanking,
  getLadderTournamentCasterVideos,
  getLadderTournamentCasterVideosForPlayer,
  getLadderTournamentPlayerData,
  __resetLadderTournamentCasterVideosCache,
};
