import type {
  LadderTournamentCasterVideo,
  LadderTournamentRankingItem,
} from "../apis/ladder-tournament-api";
import { LADDER_TOURNAMENT_TITLE_FLAGS } from "../players/tournaments";

/**
 * View model of the Ladder Tournament league pages and the Tournaments hub.
 * Everything here is derived from the API data only - there is no season metadata.
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

export type LadderSeasonSummary = {
  seasonId: number;
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
  // Sorted from the newest, the first one is the latest season
  seasons: LadderSeasonSummary[];
  // Top of the latest season standings
  latestStandings: LadderStandingRow[];
  // Newest casts of all the seasons
  latestCasts: LadderTournamentCasterVideo[];
};

// Players of the latest season shown on the overview
export const OVERVIEW_TOP_PLAYERS = 5;
// Casts shown on the overview
export const OVERVIEW_LATEST_CASTS = 4;

export type LadderHubSummary = {
  latest: LadderSeasonSummary;
  seasonsCount: number;
};

// Wins–losses, eg 13–2, a dash when there is no record
export const formatRecord = (record: { wins: number; losses: number } | null) =>
  record ? `${record.wins}–${record.losses}` : "—";

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
 * Distinct season IDs from both the ranking and the casts (casts can be published before
 * the standings), sorted from the newest.
 */
export const getLadderSeasonIds = (
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
): number[] => {
  const ids = new Set<number>();
  ranking.forEach((item) => ids.add(item.seasonid));
  videos.forEach((video) => ids.add(video.seasonId));
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
  standings: LadderStandingRow[],
  castsCount: number,
): LadderSeasonSummary => {
  const champions = standings.filter((row) => row.isChampion);

  return {
    seasonId,
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
): LadderSeasonSummary[] =>
  getLadderSeasonIds(ranking, videos).map((seasonId) => {
    const seasonVideos = videos.filter((video) => video.seasonId === seasonId);
    const standings = buildLadderStandings(
      ranking.filter((item) => item.seasonid === seasonId),
      seasonVideos,
      names,
    );
    return buildSeasonSummary(seasonId, standings, seasonVideos.length);
  });

/**
 * Builds the data of a single season page, the season must be one of the getLadderSeasonIds.
 */
export const buildLadderSeasonPageData = (
  seasonId: number,
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  names: LadderPlayerNames,
): LadderSeasonPageData => {
  const seasonVideos = videos.filter((video) => video.seasonId === seasonId);

  return {
    seasonId,
    seasons: buildLadderSeasonSummaries(ranking, videos, names),
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
): LadderOverviewData | null => {
  const seasons = buildLadderSeasonSummaries(ranking, videos, names);
  if (seasons.length === 0) return null;

  const latestSeasonId = seasons[0].seasonId;
  const latestStandings = buildLadderStandings(
    ranking.filter((item) => item.seasonid === latestSeasonId),
    videos.filter((video) => video.seasonId === latestSeasonId),
    names,
  ).slice(0, OVERVIEW_TOP_PLAYERS);
  const latestCasts = [...videos].sort(byNewest).slice(0, OVERVIEW_LATEST_CASTS);

  return { seasons, latestStandings, latestCasts };
};

/**
 * Summary of the latest season for the Tournaments hub, null when there is no data at all.
 */
export const buildHubLadderSummary = (
  ranking: LadderTournamentRankingItem[],
  videos: LadderTournamentCasterVideo[],
  names: LadderPlayerNames,
): LadderHubSummary | null => {
  const seasons = buildLadderSeasonSummaries(ranking, videos, names);
  if (seasons.length === 0) return null;
  return { latest: seasons[0], seasonsCount: seasons.length };
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
