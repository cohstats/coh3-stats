import type {
  LadderTournamentCasterVideo,
  LadderTournamentPlayerData,
  LadderTournamentRankingItem,
} from "../apis/ladder-tournament-api";

/**
 * Generic shape of a tournament on the player card, so more tournaments can be added later.
 * This file is client safe - it imports only types from the API client.
 */

export type PlayerTournamentSeasonStats = {
  matches: number;
  wins: number;
  losses: number;
  // Win rate as decimal, eg 0.86
  winRate: number;
  score: number;
};

export type PlayerTournamentSeason = {
  seasonId: number;
  // null when the player has casts in the season, but no ranking entry
  stats: PlayerTournamentSeasonStats | null;
  // Keys of won titles, translated with players:tournaments.titles.<key>
  titles: string[];
  // Sorted from the newest
  casts: LadderTournamentCasterVideo[];
};

export type PlayerTournament = {
  id: string;
  // Translation key in the players namespace
  nameKey: string;
  url: string;
  // Path to the logo in /public, the monogram is used when not available
  logo?: string;
  monogram: string;
  color: string;
  // Sorted from the newest season
  seasons: PlayerTournamentSeason[];
  // true when the tournament data couldn't be loaded
  unavailable: boolean;
};

export type PlayerTournamentAggregate = {
  seasons: number;
  matches: number;
  wins: number;
  losses: number;
  // Matches-weighted average of the API win rate (decimal), null when there are no matches.
  // Uses the API rating, so a single season aggregate equals the season row.
  winRate: number | null;
  titles: number;
};

const LADDER_TOURNAMENT_TITLE_FLAGS = [
  "ladderwinner",
  "ironcladwinner",
  "metaplayswinner",
  "championsOfheroeswinner",
  "thelegend",
] as const satisfies ReadonlyArray<keyof LadderTournamentRankingItem>;

const sortByPublishedAtDesc = (a: LadderTournamentCasterVideo, b: LadderTournamentCasterVideo) =>
  (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0);

/**
 * Builds the Ladder Tournament section from the SSR data.
 * Expects the videos to be already filtered for the player.
 */
export const buildLadderTournament = (data: LadderTournamentPlayerData): PlayerTournament => {
  const ranking = data.ladderRanking ?? [];
  const videos = data.videos ?? [];

  const seasonsById = new Map<number, PlayerTournamentSeason>();

  for (const item of ranking) {
    seasonsById.set(item.seasonid, {
      seasonId: item.seasonid,
      stats: {
        matches: item.matches,
        wins: item.wins,
        losses: item.losses,
        winRate: item.rating,
        score: item.score,
      },
      titles: LADDER_TOURNAMENT_TITLE_FLAGS.filter((flag) => item[flag] === "Yes"),
      casts: [],
    });
  }

  for (const video of videos) {
    let season = seasonsById.get(video.seasonId);
    if (!season) {
      season = { seasonId: video.seasonId, stats: null, titles: [], casts: [] };
      seasonsById.set(video.seasonId, season);
    }
    season.casts.push(video);
  }

  const seasons = [...seasonsById.values()].sort((a, b) => b.seasonId - a.seasonId);
  seasons.forEach((season) => season.casts.sort(sortByPublishedAtDesc));

  return {
    id: "ladderTournament",
    nameKey: "tournaments.ladderTournament.title",
    url: "https://laddertournament.com.br",
    logo: "/images/tournaments/ladder-tournament-logo.webp",
    monogram: "LT",
    color: "green",
    seasons,
    unavailable: data.ladderRanking === null && data.videos === null,
  };
};

export const getTournamentAggregate = (
  seasons: PlayerTournamentSeason[],
): PlayerTournamentAggregate => {
  let weightedWinRate = 0;
  const aggregate = seasons.reduce(
    (acc, season) => {
      acc.titles += season.titles.length;
      if (season.stats) {
        acc.seasons += 1;
        acc.matches += season.stats.matches;
        acc.wins += season.stats.wins;
        acc.losses += season.stats.losses;
        weightedWinRate += season.stats.winRate * season.stats.matches;
      }
      return acc;
    },
    { seasons: 0, matches: 0, wins: 0, losses: 0, titles: 0 },
  );

  return {
    ...aggregate,
    winRate: aggregate.matches > 0 ? weightedWinRate / aggregate.matches : null,
  };
};
