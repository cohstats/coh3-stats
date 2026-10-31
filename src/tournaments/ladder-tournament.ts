import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
  LadderTournamentSeason,
} from "../apis/ladder-tournament-api";
import { LADDER_TOURNAMENT_TITLE_FLAGS } from "../players/tournaments";

/**
 * View model of the Ladder Tournament league pages and the Tournaments hub.
 * The seasons come from the ranking, the casts and the seasons endpoint (calendar, format, status).
 * This file is client safe - it imports only types from the API client.
 */

export type LadderPlayerName = { alias: string; country: string | null };

// Keyed by the relic ID
export type LadderPlayerNames = Record<number, LadderPlayerName>;

export type LadderStandingRow = {
  relicId: number;
  // null when we don't know the name, rendered as "Player #<relicId>"
  alias: string | null;
  country: string | null;
  matches: number;
  wins: number;
  losses: number;
  // Win rate as decimal from the API, eg 0.86 - never recomputed
  winRate: number;
  score: number;
  // Keys of won titles, translated with players:tournaments.titles.<key>
  titles: string[];
  // ladderwinner === "Yes"
  isChampion: boolean;
  // Number of the season casts which include the player
  castsCount: number;
};

export type LadderStageGroup = {
  // Empty string for the casts without a stage, rendered as "Other"
  stage: string;
  // Sorted from the newest
  videos: LadderTournamentCasterVideo[];
};

export type LadderChampion = { relicId: number; alias: string | null; country: string | null };

export type LadderSeasonInfo = {
  // Readable name, eg "Blood and Steel", null for the generic names like "Season#1"
  name: string | null;
  // As sent by the API, eg "Draft", "Active" or "Finished"
  status: string;
  // ISO 8601 in UTC, only the date part is shown
  registrationStart: string;
  registrationEnd: string;
  ladderStart: string;
  ladderEnd: string;
  // Number of the top teams going to the playoffs / the semifinals
  playoffCut: number;
  semifinalCut: number;
  // Games per match in each stage
  bestOf: { ladder: number; funnel: number; semifinal: number; final: number };
  challenge: {
    // How many positions above its own a team can challenge
    maxPositions: number;
    responseHours: number;
    matchDeadlineDays: number;
    inactivityDays: number;
    rematchDays: number;
    rematchOtherMatches: number;
  };
};

export type LadderSeasonSummary = {
  seasonId: number;
  // null when the season is not in the seasons endpoint, or it couldn't be loaded
  info: LadderSeasonInfo | null;
  players: number;
  casts: number;
  // In the standings order
  champions: LadderChampion[];
  // Record of the best ranked champion, null when the season has no winner (yet)
  championsRecord: { wins: number; losses: number } | null;
  topScore: number | null;
};

export type LadderSeasonPageData = {
  seasonId: number;
  // Sorted from the newest, for the season picker and the season stats
  seasons: LadderSeasonSummary[];
  standings: LadderStandingRow[];
  stages: LadderStageGroup[];
};

export type LadderOverviewData = {
  // Sorted from the newest
  seasons: LadderSeasonSummary[];
  // The current season, or the latest one when all are finished, see pickLadderFeaturedSeasonId
  featured: LadderSeasonSummary;
  // Top of the featured season standings
  featuredStandings: LadderStandingRow[];
  // Newest casts of all the seasons
  latestCasts: LadderTournamentCasterVideo[];
};

// Players of the latest season shown on the overview
export const OVERVIEW_TOP_PLAYERS = 5;
// Casts shown on the overview
export const OVERVIEW_LATEST_CASTS = 4;

// Number of the past seasons shown on the hub below the featured one
export const HUB_RECENT_SEASONS = 2;

export type LadderHubSummary = {
  // The current season, or the latest one when all are finished
  featured: LadderSeasonSummary;
  // Past seasons from the newest, without the featured one
  recent: LadderSeasonSummary[];
};

// Wins–losses, eg 13–2, a dash when there is no record
export const formatRecord = (record: { wins: number; losses: number } | null) =>
  record ? `${record.wins}–${record.losses}` : "—";

// Words kept lowercase inside a season name, eg "Blood and Steel"
const NAME_SMALL_WORDS = new Set(["a", "an", "and", "at", "for", "in", "of", "on", "the", "to"]);

/**
 * Readable season name from the API name, eg "BloodAndSteel" -> "Blood and Steel".
 * Returns null for the generic names, eg "Season#1", which say nothing more than the number.
 */
export const formatLadderSeasonName = (name: string): string | null => {
  const readable = name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && /^[A-Z]?[a-z]+$/.test(word) && NAME_SMALL_WORDS.has(word.toLowerCase())
        ? word.toLowerCase()
        : word,
    )
    .join(" ");

  if (readable === "" || /^season\s*#?\s*\d*$/i.test(readable)) return null;
  return readable;
};

const buildLadderSeasonInfo = (season: LadderTournamentSeason): LadderSeasonInfo => ({
  name: formatLadderSeasonName(season.name),
  status: season.status,
  registrationStart: season.registrationStart,
  registrationEnd: season.registrationEnd,
  ladderStart: season.ladderStart,
  ladderEnd: season.ladderEnd,
  playoffCut: season.playoffCut,
  semifinalCut: season.semifinalCut,
  bestOf: {
    ladder: season.ladderBestOf,
    funnel: season.funnelBestOf,
    semifinal: season.semifinalBestOf,
    final: season.finalBestOf,
  },
  challenge: {
    maxPositions: season.maxChallengePositions,
    responseHours: season.challengeResponseHours,
    matchDeadlineDays: season.matchDeadlineDays,
    inactivityDays: season.inactivityDays,
    rematchDays: season.rematchDays,
    rematchOtherMatches: season.rematchOtherMatches,
  },
});

const isFinishedStatus = (status: string) => status.trim().toLowerCase() === "finished";

/**
 * The season is current (upcoming or in progress) by its API status.
 * Without the season info we don't know, so it's not current.
 */
export const isLadderSeasonCurrent = (summary: LadderSeasonSummary) =>
  summary.info !== null && !isFinishedStatus(summary.info.status);

/**
 * The season shown first on the overview and the hub - the oldest season which is not finished
 * (an ongoing season wins over the next upcoming one), the latest season when all are finished.
 * @param seasonIds Sorted from the newest
 */
export const pickLadderFeaturedSeasonId = (
  seasonIds: number[],
  seasons: LadderTournamentSeason[],
): number | undefined => {
  const statusById = new Map(seasons.map((season) => [season.id, season.status]));
  const current = seasonIds.filter((id) => {
    const status = statusById.get(id);
    return status !== undefined && !isFinishedStatus(status);
  });
  return current.length > 0 ? current[current.length - 1] : seasonIds[0];
};

// Known stages in the display order, the rest goes after them alphabetically
const STAGE_ORDER = [["FINAL", "FINALS"], ["THIRD PLACE"], ["SEMI-FINALS"], ["QUARTER-FINALS"]];

const normalizeStage = (stage: string) => stage.trim().toUpperCase();

const getStageOrder = (normalizedStage: string) => {
  if (normalizedStage === "") return Number.MAX_SAFE_INTEGER;
  const index = STAGE_ORDER.findIndex((stages) => stages.includes(normalizedStage));
  return index === -1 ? STAGE_ORDER.length : index;
};

const byNewest = (a: LadderTournamentCasterVideo, b: LadderTournamentCasterVideo) =>
  (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0);

export const getVideoRelicIds = (video: LadderTournamentCasterVideo): number[] =>
  `${video.playerRelicId ?? ""}`
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

/**
 * Distinct season IDs from the ranking, the casts and the seasons endpoint (a season is there
 * before it has any standings or casts), sorted from the newest.
 */
export const getLadderSeasonIds = (
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  seasons: LadderTournamentSeason[] = [],
): number[] => {
  const ids = new Set<number>();
  ranking.forEach((item) => ids.add(item.seasonid));
  videos.forEach((video) => ids.add(video.seasonId));
  seasons.forEach((season) => ids.add(season.id));
  return [...ids].sort((a, b) => b - a);
};

/**
 * Builds the standings of a single season, sorted by score only.
 * Players with the same score keep the API order (the sort is stable).
 * @param items Ranking items of the season
 * @param videos Casts of the season
 * @param names Player names, players without a name get alias null
 */
export const buildLadderStandings = (
  items: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  names: LadderPlayerNames,
): LadderStandingRow[] => {
  const castsCountByPlayer = new Map<number, number>();
  for (const video of videos) {
    for (const relicId of new Set(getVideoRelicIds(video))) {
      castsCountByPlayer.set(relicId, (castsCountByPlayer.get(relicId) ?? 0) + 1);
    }
  }

  const sorted = [...items].sort((a, b) => b.score - a.score);

  return sorted.map((item) => {
    return {
      relicId: item.relicid,
      alias: names[item.relicid]?.alias ?? null,
      country: names[item.relicid]?.country ?? null,
      matches: item.matches,
      wins: item.wins,
      losses: item.losses,
      winRate: item.rating,
      score: item.score,
      titles: LADDER_TOURNAMENT_TITLE_FLAGS.filter((flag) => item[flag] === "Yes"),
      isChampion: item.ladderwinner === "Yes",
      castsCount: castsCountByPlayer.get(item.relicid) ?? 0,
    };
  });
};

/**
 * Groups the casts by stage. Finals first, then third place, semi-finals, quarter-finals,
 * then the other stages alphabetically and the casts without a stage at the end.
 * Casts inside a stage are sorted from the newest.
 */
export const groupCastsByStage = (videos: LadderTournamentCasterVideo[]): LadderStageGroup[] => {
  const groups = new Map<string, LadderStageGroup>();

  for (const video of videos) {
    const key = normalizeStage(video.stage ?? "");
    let group = groups.get(key);
    if (!group) {
      group = { stage: (video.stage ?? "").trim(), videos: [] };
      groups.set(key, group);
    }
    group.videos.push(video);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => getStageOrder(a) - getStageOrder(b) || a.localeCompare(b, "en"))
    .map(([, group]) => ({ ...group, videos: [...group.videos].sort(byNewest) }));
};

const buildSeasonSummary = (
  seasonId: number,
  season: LadderTournamentSeason | undefined,
  standings: LadderStandingRow[],
  castsCount: number,
): LadderSeasonSummary => {
  const champions = standings.filter((row) => row.isChampion);

  return {
    seasonId,
    info: season ? buildLadderSeasonInfo(season) : null,
    players: standings.length,
    casts: castsCount,
    champions: champions.map(({ relicId, alias, country }) => ({ relicId, alias, country })),
    championsRecord:
      champions.length > 0 ? { wins: champions[0].wins, losses: champions[0].losses } : null,
    topScore: standings.length > 0 ? Math.max(...standings.map((row) => row.score)) : null,
  };
};

/**
 * Summaries of all the seasons, sorted from the newest.
 */
export const buildLadderSeasonSummaries = (
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  names: LadderPlayerNames,
  seasons: LadderTournamentSeason[] = [],
): LadderSeasonSummary[] =>
  getLadderSeasonIds(ranking, videos, seasons).map((seasonId) => {
    const seasonVideos = videos.filter((video) => video.seasonId === seasonId);
    const standings = buildLadderStandings(
      ranking.filter((item) => item.seasonid === seasonId),
      seasonVideos,
      names,
    );
    const season = seasons.find((item) => item.id === seasonId);
    return buildSeasonSummary(seasonId, season, standings, seasonVideos.length);
  });

const findFeaturedSeason = (
  summaries: LadderSeasonSummary[],
  seasons: LadderTournamentSeason[],
): LadderSeasonSummary | undefined => {
  const featuredSeasonId = pickLadderFeaturedSeasonId(
    summaries.map((summary) => summary.seasonId),
    seasons,
  );
  return summaries.find((summary) => summary.seasonId === featuredSeasonId);
};

/**
 * Builds the data of a single season page, the season must be one of the getLadderSeasonIds.
 */
export const buildLadderSeasonPageData = (
  seasonId: number,
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  names: LadderPlayerNames,
  seasons: LadderTournamentSeason[] = [],
): LadderSeasonPageData => {
  const seasonVideos = videos.filter((video) => video.seasonId === seasonId);

  return {
    seasonId,
    seasons: buildLadderSeasonSummaries(ranking, videos, names, seasons),
    standings: buildLadderStandings(
      ranking.filter((item) => item.seasonid === seasonId),
      seasonVideos,
      names,
    ),
    stages: groupCastsByStage(seasonVideos),
  };
};

/**
 * Relic IDs of the top players of the season, the same players as in the overview standings.
 */
export const getLadderTopPlayerIds = (
  ranking: LadderTournamentRankingItem[],
  seasonId: number,
): number[] =>
  ranking
    .filter((item) => item.seasonid === seasonId)
    .sort((a, b) => b.score - a.score)
    .slice(0, OVERVIEW_TOP_PLAYERS)
    .map((item) => item.relicid);

/**
 * Builds the data of the league overview page, null when there is no data at all.
 */
export const buildLadderOverviewData = (
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  names: LadderPlayerNames,
  seasons: LadderTournamentSeason[] = [],
): LadderOverviewData | null => {
  const summaries = buildLadderSeasonSummaries(ranking, videos, names, seasons);
  const featured = findFeaturedSeason(summaries, seasons);
  if (!featured) return null;

  const featuredStandings = buildLadderStandings(
    ranking.filter((item) => item.seasonid === featured.seasonId),
    videos.filter((video) => video.seasonId === featured.seasonId),
    names,
  ).slice(0, OVERVIEW_TOP_PLAYERS);
  const latestCasts = [...videos].sort(byNewest).slice(0, OVERVIEW_LATEST_CASTS);

  return { seasons: summaries, featured, featuredStandings, latestCasts };
};

/**
 * The featured season and the past seasons for the Tournaments hub, null when there is no data at all.
 */
export const buildHubLadderSummary = (
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  names: LadderPlayerNames,
  seasons: LadderTournamentSeason[] = [],
): LadderHubSummary | null => {
  const summaries = buildLadderSeasonSummaries(ranking, videos, names, seasons);
  const featured = findFeaturedSeason(summaries, seasons);
  if (!featured) return null;

  return {
    featured,
    // Summaries are from the newest, so these are the latest past seasons. A past season can
    // be newer than the featured one, eg when an older season is stuck in Draft
    recent: summaries
      .filter(
        (summary) => summary.seasonId !== featured.seasonId && !isLadderSeasonCurrent(summary),
      )
      .slice(0, HUB_RECENT_SEASONS),
  };
};

/**
 * Relic IDs of the champions of the given seasons (all seasons when not set).
 */
export const getLadderChampionIds = (
  ranking: LadderTournamentRankingItem[],
  seasonIds?: number[],
): number[] => [
  ...new Set(
    ranking
      .filter(
        (item) =>
          item.ladderwinner === "Yes" && (!seasonIds || seasonIds.includes(item.seasonid)),
      )
      .map((item) => item.relicid),
  ),
];
