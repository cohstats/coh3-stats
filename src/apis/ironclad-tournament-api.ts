import { z } from "zod";
import config from "../../config";
import { logger } from "../logger";

/**
 * Client for the IronClad Tournaments partner API https://www.ironcladtournaments.com/api/partners/v1
 * The API is protected by a token (X-Api-Token header) - SERVER SIDE USAGE ONLY.
 */

// Responses are validated against these schemas, so a change of the response keys on the API side
// fails loudly instead of returning undefined fields.
const SCHEMA_VERSION = "ironclad.competition.v1";

// Status like fields - the known values are listed for documentation, but an unknown value
// (eg a new state added by IronClad) is accepted so it doesn't take the pages down.
const knownValues = <const T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.string()]);

const tournamentStatusSchema = knownValues([
  "upcoming",
  "registration_open",
  "in_progress",
  "completed",
]);
const divisionStateSchema = knownValues(["filling", "ready", "in_progress", "completed"]);
const matchStatusSchema = knownValues(["scheduled", "in_progress", "completed"]);

const registrationSchema = z.object({
  open: z.boolean(),
  enabled: z.boolean(),
  opensAt: z.string().nullable(),
  closesAt: z.string().nullable(),
  // eg "open", "status_closed"
  availability: z.string(),
});

const eloRangeSchema = z.object({
  // null when the division has no lower / upper bound
  min: z.number().nullable(),
  minInclusive: z.boolean(),
  max: z.number().nullable(),
  maxInclusive: z.boolean(),
});

const participantSchema = z.object({
  registrationId: z.string(),
  // Alias used for the event, can differ from the current Relic alias
  eventAlias: z.string(),
  // ELO verified at the registration
  eventElo: z.number().nullable(),
  registrationStatus: z.string(),
  // Player profile on the IronClad website
  profileUrl: z.string().nullable(),
  // Relic profile ID as string, null when the player didn't link the Relic profile
  relicProfileId: z.string().nullable(),
});

const matchSchema = z.object({
  id: z.string(),
  roundNumber: z.number(),
  // eg "Quarter Finals", "Semi Finals", "Grand Final"
  roundName: z.string(),
  matchNumber: z.number(),
  bestOf: z.number(),
  status: matchStatusSchema,
  outcomeType: z.string().nullable(),
  // null while the slot is not decided yet (TBD)
  playerOneRegistrationId: z.string().nullable(),
  playerTwoRegistrationId: z.string().nullable(),
  playerOneScore: z.number().nullable(),
  playerTwoScore: z.number().nullable(),
  winnerRegistrationId: z.string().nullable(),
  completed: z.boolean(),
  // false for a completed match means a forfeit / walkover
  played: z.boolean(),
  // ISO 8601
  decidedAt: z.string().nullable(),
});

const bracketSchema = z.object({
  id: z.string(),
  // eg "single_elimination"
  format: z.string(),
  completed: z.boolean(),
  matches: z.array(matchSchema),
  // Not filled by the API yet, the shape is unknown - the placement is derived from the matches
  placements: z.array(z.unknown()),
  championRegistrationId: z.string().nullable(),
});

const divisionSchema = z.object({
  id: z.string(),
  // eg "Academy", "Challenge", "Main", "Pro"
  canonicalName: z.string(),
  // eg "Main / Pro" for the older tournaments
  displayName: z.string(),
  state: divisionStateSchema,
  effectiveState: divisionStateSchema,
  approvedCount: z.number(),
  capacity: z.number(),
  ready: z.boolean(),
  capacityReached: z.boolean(),
  bracketGenerated: z.boolean(),
  bracketPublished: z.boolean(),
  launchedAt: z.string().nullable(),
  registrationOpen: z.boolean(),
  // Human readable, eg "1100-1399 ELO"
  eloRule: z.string(),
  eloRange: eloRangeSchema,
  participants: z.array(participantSchema),
  // null until the bracket is published
  bracket: bracketSchema.nullable(),
});

const tournamentSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  // eg "four_division_v1", "legacy_three_v1"
  divisionModelVersion: z.string(),
  status: tournamentStatusSchema,
  // eg "1v1"
  format: z.string(),
  game: z.string(),
  publicUrl: z.string(),
  registration: registrationSchema,
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  firstCompletedAt: z.string().nullable(),
  approvedPlayers: z.number(),
  divisions: z.array(divisionSchema),
});

const tournamentsResponseSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  data: z.array(tournamentSchema),
  pagination: z.object({
    offset: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
    nextOffset: z.number().nullable(),
    truncated: z.boolean(),
  }),
});

const tournamentResponseSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  data: tournamentSchema,
});

const playerEntrySchema = z.object({
  registrationId: z.string(),
  eventAlias: z.string(),
  eventElo: z.number().nullable(),
  registrationStatus: z.string(),
  tournament: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    divisionModelVersion: z.string(),
    status: tournamentStatusSchema,
    publicUrl: z.string(),
  }),
  division: z.object({
    id: z.string(),
    canonicalName: z.string(),
    displayName: z.string(),
    effectiveState: divisionStateSchema,
  }),
  generatedBracketId: z.string().nullable(),
  divisionCompleted: z.boolean().nullable(),
  // Only the matches of the player, the opponents are only registration IDs
  matches: z.array(matchSchema),
  record: z.object({
    matchesPlayed: z.number(),
    wins: z.number(),
    losses: z.number(),
  }),
  // Not filled by the API yet, the shape is unknown
  placement: z.unknown(),
  champion: z.boolean(),
});

const playerAggregateSchema = z.object({
  // "returned_entries" - the aggregate covers only the returned page
  scope: z.string(),
  tournamentsEntered: z.number(),
  matchesPlayed: z.number(),
  wins: z.number(),
  losses: z.number(),
  titles: z.number(),
});

const playerTournamentsResponseSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  data: z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    relicProfileId: z.string(),
    currentIdentity: z
      .object({
        alias: z.string(),
        profileUrl: z.string().nullable(),
      })
      .nullable(),
    entries: z.array(playerEntrySchema),
    aggregate: playerAggregateSchema,
  }),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
  }),
});

const errorResponseSchema = z.object({
  error: z.string(),
});

type IroncladTournamentStatus = z.infer<typeof tournamentStatusSchema>;
type IroncladRegistration = z.infer<typeof registrationSchema>;
type IroncladEloRange = z.infer<typeof eloRangeSchema>;
type IroncladParticipant = z.infer<typeof participantSchema>;
type IroncladMatch = z.infer<typeof matchSchema>;
type IroncladBracket = z.infer<typeof bracketSchema>;
type IroncladDivision = z.infer<typeof divisionSchema>;
type IroncladTournament = z.infer<typeof tournamentSchema>;
type IroncladPlayerEntry = z.infer<typeof playerEntrySchema>;

type IroncladPlayerAggregate = {
  tournamentsEntered: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  titles: number;
};

type IroncladPlayerHistory = {
  relicProfileId: string;
  // null when the player has no IronClad history
  currentIdentity: { alias: string; profileUrl: string | null } | null;
  // In the API order (from the newest)
  entries: IroncladPlayerEntry[];
  // Computed from all the entries, not only from the first page as the API does
  aggregate: IroncladPlayerAggregate;
};

const parseIroncladResponse = <T>(schema: z.ZodType<T>, data: unknown, name: string): T => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = `Invalid IronClad ${name} response: ${z.prettifyError(parsed.error)}`;
    logger.error(message);
    throw new Error(message);
  }
  return parsed.data;
};

// The API returns { error: "<code>" } on errors, eg "tournament_not_available"
const getIroncladErrorCode = async (response: Response): Promise<string | null> => {
  try {
    const parsed = errorResponseSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.error : null;
  } catch {
    return null;
  }
};

const relicIdSchema = z.coerce.number().int().positive();
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// Only lowercase slugs, so there is one URL per tournament
const isIroncladSlug = (slug: string) => slugSchema.safeParse(slug).success;

// Max page size allowed by the API, for both the tournaments and the player tournaments
const PAGE_SIZE = 10;
// Safety net against an API which keeps returning more pages
const MAX_PAGES = 20;

const requireIroncladTournamentApiToken = (): string => {
  const token = config.getIroncladTournamentApiToken();
  if (!token) {
    logger.error("IRONCLAD_TOURNAMENT_API_TOKEN is not set");
    throw new Error("IRONCLAD_TOURNAMENT_API_TOKEN is not set");
  }
  return token;
};

// Partner API request timeout, so a hanging API doesn't stall the ISR / SSR pages
const REQUEST_TIMEOUT_MS = 30_000;

const isTimeoutError = (error: unknown) => (error as { name?: string })?.name === "TimeoutError";

/**
 * fetch with the API token and the timeout, a timeout is rethrown with a clear message.
 */
const fetchIronclad = async (url: string): Promise<Response> => {
  try {
    return await fetch(url, {
      headers: { "X-Api-Token": requireIroncladTournamentApiToken() },
      // Don't store token protected responses in the shared Next fetch cache
      cache: "no-store",
      // A new signal per request, the timeout starts with the request
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      const message = `IronClad API timed out after ${REQUEST_TIMEOUT_MS / 1000}s`;
      logger.error(`${message}: ${url}`);
      throw new Error(message);
    }
    throw error;
  }
};

const getIroncladTournamentsUrl = ({
  status,
  offset,
  limit,
}: {
  // All the tournaments when not set
  status?: IroncladTournamentStatus;
  offset: number;
  limit: number;
}) => {
  const statusParam = status !== undefined ? `&status=${encodeURIComponent(status)}` : "";
  return `${config.tournaments.ironclad.apiBaseUrl}/tournaments?limit=${limit}&offset=${offset}${statusParam}`;
};

const getIroncladTournamentUrl = (slug: string) => {
  return `${config.tournaments.ironclad.apiBaseUrl}/tournaments/${encodeURIComponent(slug)}`;
};

const getIroncladPlayerTournamentsUrl = ({
  relicId,
  offset,
  limit,
}: {
  relicId: number;
  offset: number;
  limit: number;
}) => {
  return `${config.tournaments.ironclad.apiBaseUrl}/players/${relicId}/tournaments?limit=${limit}&offset=${offset}`;
};

/**
 * Returns all the IronClad tournaments (with divisions, participants and brackets), following the pagination.
 * Throws when any of the pages fails to load.
 * @param options.status Only the tournaments in this status, all when not set
 */
const getIroncladTournaments = async (
  options: { status?: IroncladTournamentStatus } = {},
): Promise<IroncladTournament[]> => {
  const { status } = options;
  const tournaments: IroncladTournament[] = [];
  let offset = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetchIronclad(
      getIroncladTournamentsUrl({ status, offset, limit: PAGE_SIZE }),
    );

    if (!response.ok) {
      logger.error(
        `Error getting IronClad tournaments offset ${offset}, status code: ${response.status}`,
      );
      throw new Error(
        `Error getting IronClad tournaments offset ${offset}, status code: ${response.status}`,
      );
    }

    const data = parseIroncladResponse(
      tournamentsResponseSchema,
      await response.json(),
      "tournaments",
    );
    tournaments.push(...data.data);

    if (data.pagination.truncated) {
      logger.warn(`IronClad tournaments response offset ${offset} is truncated`);
    }
    if (!data.pagination.hasMore || data.pagination.nextOffset === null) {
      return tournaments;
    }
    offset = data.pagination.nextOffset;
  }

  logger.error(
    `IronClad tournaments have more than ${MAX_PAGES} pages, returning the first ${tournaments.length} tournaments`,
  );
  return tournaments;
};

/**
 * Returns a single IronClad tournament, null when it doesn't exist.
 * Throws on any other API error.
 * @param slug Slug of the tournament, eg "hold-the-line"
 */
const getIroncladTournament = async (slug: string): Promise<IroncladTournament | null> => {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) {
    // Can't exist on the API side, no need to call it
    return null;
  }

  const response = await fetchIronclad(getIroncladTournamentUrl(parsedSlug.data));

  if (response.ok) {
    return parseIroncladResponse(tournamentResponseSchema, await response.json(), "tournament")
      .data;
  }

  if (response.status === 404) {
    const errorCode = await getIroncladErrorCode(response);
    if (errorCode === "tournament_not_available") {
      return null;
    }
  }

  logger.error(`Error getting IronClad tournament ${slug}, status code: ${response.status}`);
  throw new Error(`Error getting IronClad tournament ${slug}, status code: ${response.status}`);
};

const getIroncladPlayerAggregate = (entries: IroncladPlayerEntry[]): IroncladPlayerAggregate => {
  return entries.reduce(
    (acc, entry) => {
      acc.matchesPlayed += entry.record.matchesPlayed;
      acc.wins += entry.record.wins;
      acc.losses += entry.record.losses;
      if (entry.champion) acc.titles += 1;
      return acc;
    },
    {
      tournamentsEntered: new Set(entries.map((entry) => entry.tournament.id)).size,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      titles: 0,
    },
  );
};

/**
 * Returns the IronClad tournament history of a player, following the pagination.
 * A player without any IronClad history returns empty entries.
 * Throws on any other API error.
 * @param relicId Relic profile ID of the player
 */
const getIroncladPlayerTournaments = async (
  relicId: number | string,
): Promise<IroncladPlayerHistory> => {
  const parsedRelicId = relicIdSchema.safeParse(relicId);
  if (!parsedRelicId.success) {
    throw new Error(`Invalid relicId: ${relicId}`);
  }

  const entries: IroncladPlayerEntry[] = [];
  let currentIdentity: IroncladPlayerHistory["currentIdentity"] = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const response = await fetchIronclad(
      getIroncladPlayerTournamentsUrl({ relicId: parsedRelicId.data, offset, limit: PAGE_SIZE }),
    );

    if (!response.ok) {
      // The API returns 404 for the players without any IronClad history
      if (
        response.status === 404 &&
        (await getIroncladErrorCode(response)) === "player_not_available"
      ) {
        break;
      }
      logger.error(
        `Error getting IronClad tournaments for relicId ${relicId}, status code: ${response.status}`,
      );
      throw new Error(
        `Error getting IronClad tournaments for relicId ${relicId}, status code: ${response.status}`,
      );
    }

    const data = parseIroncladResponse(
      playerTournamentsResponseSchema,
      await response.json(),
      "player tournaments",
    );
    currentIdentity ??= data.data.currentIdentity;
    entries.push(...data.data.entries);

    // The player pagination has no hasMore, a short page is the last one
    if (data.data.entries.length < PAGE_SIZE) {
      break;
    }
  }

  return {
    relicProfileId: `${parsedRelicId.data}`,
    currentIdentity,
    entries,
    aggregate: getIroncladPlayerAggregate(entries),
  };
};

interface TournamentsCacheEntry {
  data: IroncladTournament[];
  timestamp: number;
  isUpdating: boolean;
}

// In-memory cache with 5-minute TTL (5 * 60 * 1000 ms), the brackets change during a running tournament
const TOURNAMENTS_CACHE_TTL = 5 * 60 * 1000;
let tournamentsCache: TournamentsCacheEntry | null = null;
// Shared promise for the initial fetch, so concurrent cold-start calls hit the API only once
let tournamentsInitialFetch: Promise<IroncladTournament[]> | null = null;

/**
 * Returns all the IronClad tournaments.
 * Cached in memory for 5 minutes with stale-while-revalidate behaviour.
 * Throws when there is no cached data and the API call fails.
 */
const getIroncladTournamentsCached = async (): Promise<IroncladTournament[]> => {
  // If no cached data exists, fetch fresh data
  if (!tournamentsCache) {
    if (!tournamentsInitialFetch) {
      tournamentsInitialFetch = getIroncladTournaments()
        .then((freshData) => {
          tournamentsCache = {
            data: freshData,
            timestamp: Date.now(),
            isUpdating: false,
          };
          logger.info(`Fetched fresh IronClad tournaments ${freshData.length}`);
          return freshData;
        })
        .finally(() => {
          tournamentsInitialFetch = null;
        });
    }
    return tournamentsInitialFetch;
  }

  const isExpired = Date.now() - tournamentsCache.timestamp > TOURNAMENTS_CACHE_TTL;

  // If cache is still fresh, return cached data
  if (!isExpired) {
    return tournamentsCache.data;
  }

  // Cache is expired - return stale data immediately and update in background
  if (!tournamentsCache.isUpdating) {
    // Mark as updating to prevent multiple concurrent updates
    tournamentsCache.isUpdating = true;

    getIroncladTournaments()
      .then((freshData) => {
        tournamentsCache = {
          data: freshData,
          timestamp: Date.now(),
          isUpdating: false,
        };
        logger.info(`Refreshed IronClad tournaments ${freshData.length}`);
      })
      .catch((error) => {
        logger.error(`Error refreshing IronClad tournaments, keeping stale cache: ${error}`);
        // Reset updating flag on error so we can try again next time
        if (tournamentsCache) {
          tournamentsCache.isUpdating = false;
        }
      });
  }

  // Return stale data immediately
  return tournamentsCache.data;
};

type IroncladRegistrationInfo = {
  eventAlias: string;
  // Relic profile ID as string, null when not linked
  relicProfileId: string | null;
};

type IroncladPlayerData = {
  // null when the history couldn't be loaded
  history: IroncladPlayerHistory | null;
  // Registrations of everybody in the divisions the player played, keyed by the registration ID.
  // Used to resolve the opponents of the player matches. Empty when the tournaments couldn't be loaded.
  registrations: Record<string, IroncladRegistrationInfo>;
  // Highest round number of the division bracket, keyed by the bracket ID. Used to tell the runner-up.
  finalRounds: Record<string, number>;
};

/**
 * Slugs of the tournaments in the history which are missing in the tournaments list,
 * or where the list doesn't have the division bracket of the entry yet.
 */
const getStaleTournamentSlugs = (
  history: IroncladPlayerHistory | null,
  tournaments: IroncladTournament[],
): string[] => {
  const divisions = new Map(
    tournaments
      .flatMap((tournament) => tournament.divisions)
      .map((division) => [division.id, division]),
  );
  const stale = (history?.entries ?? []).filter((entry) => {
    const division = divisions.get(entry.division.id);
    return (
      !division ||
      (entry.generatedBracketId !== null && division.bracket?.id !== entry.generatedBracketId)
    );
  });
  return [...new Set(stale.map((entry) => entry.tournament.slug))];
};

/**
 * Loads all the IronClad data needed for the player card.
 * Never throws - the parts which fail to load are returned empty / as null.
 * @param relicId Relic profile ID of the player
 */
const getIroncladPlayerData = async (relicId: number | string): Promise<IroncladPlayerData> => {
  const [historyResult, tournamentsResult] = await Promise.allSettled([
    getIroncladPlayerTournaments(relicId),
    getIroncladTournamentsCached(),
  ]);

  if (historyResult.status === "rejected") {
    logger.error(`Failed getting IronClad tournaments for player ${relicId}`);
    logger.error(historyResult.reason);
  }
  if (tournamentsResult.status === "rejected") {
    logger.error(`Failed getting IronClad tournaments for player ${relicId} opponents`);
    logger.error(tournamentsResult.reason);
  }

  const history = historyResult.status === "fulfilled" ? historyResult.value : null;
  let tournaments = tournamentsResult.status === "fulfilled" ? tournamentsResult.value : [];

  // The cached list can be older than the history (eg a bracket generated since) or missing,
  // these tournaments are loaded fresh
  const staleSlugs = getStaleTournamentSlugs(history, tournaments);
  if (staleSlugs.length > 0) {
    const freshResults = await Promise.allSettled(staleSlugs.map(getIroncladTournament));
    const fresh: IroncladTournament[] = [];
    freshResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        if (result.value) fresh.push(result.value);
      } else {
        logger.error(
          `Failed getting IronClad tournament ${staleSlugs[index]} for the player card`,
        );
        logger.error(result.reason);
      }
    });
    const freshIds = new Set(fresh.map((tournament) => tournament.id));
    tournaments = [...tournaments.filter((tournament) => !freshIds.has(tournament.id)), ...fresh];
  }

  const registrations: IroncladPlayerData["registrations"] = {};
  const finalRounds: IroncladPlayerData["finalRounds"] = {};
  const playedDivisionIds = new Set(history?.entries.map((entry) => entry.division.id) ?? []);

  for (const tournament of tournaments) {
    for (const division of tournament.divisions) {
      if (!playedDivisionIds.has(division.id)) continue;

      for (const participant of division.participants) {
        registrations[participant.registrationId] = {
          eventAlias: participant.eventAlias,
          relicProfileId: participant.relicProfileId,
        };
      }
      if (division.bracket && division.bracket.matches.length > 0) {
        finalRounds[division.bracket.id] = Math.max(
          ...division.bracket.matches.map((match) => match.roundNumber),
        );
      }
    }
  }

  return { history, registrations, finalRounds };
};

/**
 * Only for unit tests - resets the in-memory tournaments cache.
 */
const __resetIroncladTournamentsCache = () => {
  tournamentsCache = null;
  tournamentsInitialFetch = null;
};

export type {
  IroncladTournamentStatus,
  IroncladRegistration,
  IroncladEloRange,
  IroncladParticipant,
  IroncladMatch,
  IroncladBracket,
  IroncladDivision,
  IroncladTournament,
  IroncladPlayerEntry,
  IroncladPlayerAggregate,
  IroncladPlayerHistory,
  IroncladRegistrationInfo,
  IroncladPlayerData,
};
export {
  getIroncladTournamentsUrl,
  getIroncladTournamentUrl,
  getIroncladPlayerTournamentsUrl,
  getIroncladTournaments,
  getIroncladTournament,
  getIroncladPlayerTournaments,
  getIroncladTournamentsCached,
  getIroncladPlayerData,
  isIroncladSlug,
  __resetIroncladTournamentsCache,
};
