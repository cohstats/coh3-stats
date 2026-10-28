import type {
  LadderTournamentCasterVideo,
  LadderTournamentPlayerData,
  LadderTournamentRankingItem,
} from "../apis/ladder-tournament-api";
import type {
  IroncladMatch,
  IroncladPlayerData,
  IroncladPlayerEntry,
} from "../apis/ironclad-tournament-api";
import { IRONCLAD_TOURNAMENT, LADDER_TOURNAMENT } from "../tournaments/tournaments-registry";
import { getDivisionKey, isForfeit, toRelicId } from "../tournaments/ironclad-tournament";

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
  // true when the ranking couldn't be loaded, the seasons then contain only the casts (if any)
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

// Win rate from the API as decimal, eg 0.86 -> 86%
export const formatWinRate = (winRate: number) => `${Math.round(winRate * 100)}%`;

export const LADDER_TOURNAMENT_TITLE_FLAGS = [
  "ladderwinner",
  "ironcladwinner",
  "metaplayswinner",
  "championsOfheroeswinner",
  "thelegend",
] as const satisfies ReadonlyArray<keyof LadderTournamentRankingItem>;

/**
 * Builds the Ladder Tournament section from the SSR data.
 * Expects the videos to be already filtered for the player and sorted from the newest
 * (as returned by getLadderTournamentCasterVideosForPlayer), the casts keep that order.
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

  return {
    id: LADDER_TOURNAMENT.id,
    nameKey: "tournaments.ladderTournament.title",
    url: LADDER_TOURNAMENT.url,
    logo: LADDER_TOURNAMENT.logo,
    monogram: LADDER_TOURNAMENT.monogram,
    color: LADDER_TOURNAMENT.color,
    seasons,
    // The ranking is the source of the seasons and the stats, without it we can't tell if the player played
    unavailable: data.ladderRanking === null,
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

// Player card tournament data loaded with SSR for the Tournaments tab
export type PlayerTournamentsData = {
  ladder: LadderTournamentPlayerData;
  ironclad: IroncladPlayerData;
};

export type PlayerIroncladResult =
  | "champion"
  | "runnerUp"
  | "eliminated"
  | "inProgress"
  | "registered";

export type PlayerIroncladMatch = {
  id: string;
  roundNumber: number;
  roundName: string;
  bestOf: number;
  status: string;
  playerScore: number | null;
  opponentScore: number | null;
  // null until the match is decided
  won: boolean | null;
  forfeit: boolean;
  decidedAt: string | null;
  // null while the opponent is not decided yet (TBD)
  opponent: { eventAlias: string; relicId: number | null } | null;
};

export type PlayerIroncladEntry = {
  registrationId: string;
  tournamentSlug: string;
  tournamentName: string;
  tournamentStatus: string;
  divisionKey: string;
  divisionName: string;
  eventAlias: string;
  eventElo: number | null;
  result: PlayerIroncladResult;
  // Round name of the lost match, only for the eliminated players
  eliminatedIn: string | null;
  wins: number;
  losses: number;
  // Sorted by the round
  matches: PlayerIroncladMatch[];
};

export type PlayerIroncladTournament = {
  id: string;
  // Translation key in the players namespace
  nameKey: string;
  url: string;
  logo?: string;
  monogram: string;
  color: string;
  // In the API order (from the newest)
  entries: PlayerIroncladEntry[];
  aggregate: {
    tournaments: number;
    matches: number;
    wins: number;
    losses: number;
    titles: number;
  };
  // true when the history couldn't be loaded
  unavailable: boolean;
};

const isLostMatch = (match: IroncladMatch, registrationId: string) =>
  match.completed &&
  match.winnerRegistrationId !== null &&
  match.winnerRegistrationId !== registrationId;

/**
 * Result of the player in the division, derived from the matches (the API has no placements yet).
 * @param finalRound Highest round of the division bracket, to tell the runner-up
 */
export const getIroncladEntryResult = (
  entry: IroncladPlayerEntry,
  finalRound: number | undefined,
): { result: PlayerIroncladResult; eliminatedIn: string | null } => {
  if (entry.champion) return { result: "champion", eliminatedIn: null };

  const lost = entry.matches.find((match) => isLostMatch(match, entry.registrationId));
  if (lost) {
    return lost.roundNumber === finalRound
      ? { result: "runnerUp", eliminatedIn: null }
      : { result: "eliminated", eliminatedIn: lost.roundName };
  }

  // Still in the bracket, or waiting for it
  return entry.generatedBracketId
    ? { result: "inProgress", eliminatedIn: null }
    : { result: "registered", eliminatedIn: null };
};

const buildIroncladMatch = (
  match: IroncladMatch,
  registrationId: string,
  registrations: IroncladPlayerData["registrations"],
): PlayerIroncladMatch => {
  const isPlayerOne = match.playerOneRegistrationId === registrationId;
  const opponentId = isPlayerOne ? match.playerTwoRegistrationId : match.playerOneRegistrationId;
  const opponent = opponentId ? registrations[opponentId] : undefined;

  return {
    id: match.id,
    roundNumber: match.roundNumber,
    roundName: match.roundName,
    bestOf: match.bestOf,
    status: match.status,
    playerScore: isPlayerOne ? match.playerOneScore : match.playerTwoScore,
    opponentScore: isPlayerOne ? match.playerTwoScore : match.playerOneScore,
    won: match.winnerRegistrationId ? match.winnerRegistrationId === registrationId : null,
    forfeit: isForfeit(match),
    decidedAt: match.decidedAt,
    opponent: opponentId
      ? {
          // Unknown registration (eg the tournaments couldn't be loaded) - we know only it's decided
          eventAlias: opponent?.eventAlias ?? "?",
          relicId: toRelicId(opponent?.relicProfileId ?? null),
        }
      : null,
  };
};

/**
 * Builds the IronClad section of the player card from the SSR data.
 */
export const buildIroncladTournament = (data: IroncladPlayerData): PlayerIroncladTournament => {
  const entries = (data.history?.entries ?? []).map((entry): PlayerIroncladEntry => {
    const finalRound = entry.generatedBracketId
      ? data.finalRounds[entry.generatedBracketId]
      : undefined;
    return {
      registrationId: entry.registrationId,
      tournamentSlug: entry.tournament.slug,
      tournamentName: entry.tournament.name,
      tournamentStatus: entry.tournament.status,
      divisionKey: getDivisionKey(entry.division),
      divisionName: entry.division.displayName,
      eventAlias: entry.eventAlias,
      eventElo: entry.eventElo,
      ...getIroncladEntryResult(entry, finalRound),
      wins: entry.record.wins,
      losses: entry.record.losses,
      matches: [...entry.matches]
        .sort((a, b) => a.roundNumber - b.roundNumber)
        .map((match) => buildIroncladMatch(match, entry.registrationId, data.registrations)),
    };
  });

  const aggregate = data.history?.aggregate;

  return {
    id: IRONCLAD_TOURNAMENT.id,
    nameKey: "tournaments.ironclad.title",
    url: IRONCLAD_TOURNAMENT.url,
    logo: IRONCLAD_TOURNAMENT.logo,
    monogram: IRONCLAD_TOURNAMENT.monogram,
    color: IRONCLAD_TOURNAMENT.color,
    entries,
    aggregate: {
      tournaments: aggregate?.tournamentsEntered ?? 0,
      matches: aggregate?.matchesPlayed ?? 0,
      wins: aggregate?.wins ?? 0,
      losses: aggregate?.losses ?? 0,
      titles: aggregate?.titles ?? 0,
    },
    unavailable: data.history === null,
  };
};
