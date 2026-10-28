import type {
  IroncladBracket,
  IroncladDivision,
  IroncladMatch,
  IroncladParticipant,
  IroncladTournament,
} from "../apis/ironclad-tournament-api";
import type { LadderPlayerNames } from "./ladder-tournament";

/**
 * View model of the IronClad tournament pages and the Tournaments hub.
 * Everything here is derived from the API data only.
 * This file is client safe - it imports only types from the API client.
 */

// Current Relic names keyed by the relic ID, same shape as the Ladder Tournament names
export type IroncladPlayerNames = LadderPlayerNames;

export type IroncladPlayer = {
  registrationId: string;
  // Alias used for the event
  eventAlias: string;
  eventElo: number | null;
  // null when the player didn't link the Relic profile, we can't link our player card then
  relicId: number | null;
  // Current Relic alias, null when unknown
  alias: string | null;
  country: string | null;
  // Player profile on the IronClad website
  profileUrl: string | null;
};

export type IroncladBracketSlot = {
  // null while the slot is not decided yet (TBD)
  player: IroncladPlayer | null;
  score: number | null;
  isWinner: boolean;
};

export type IroncladBracketMatch = {
  id: string;
  matchNumber: number;
  bestOf: number;
  status: string;
  completed: boolean;
  // Completed without being played - forfeit / walkover
  forfeit: boolean;
  decidedAt: string | null;
  slots: [IroncladBracketSlot, IroncladBracketSlot];
};

export type IroncladBracketRound = {
  roundNumber: number;
  roundName: string;
  // Sorted by the match number
  matches: IroncladBracketMatch[];
};

export type IroncladDivisionView = {
  id: string;
  // URL key, eg "academy"
  key: string;
  displayName: string;
  state: string;
  approvedCount: number;
  capacity: number;
  eloRule: string;
  registrationOpen: boolean;
  // Sorted by the event ELO, the highest first
  participants: IroncladPlayer[];
  // Sorted by the round number, null until the bracket is published
  rounds: IroncladBracketRound[] | null;
  bracketCompleted: boolean;
  champion: IroncladPlayer | null;
};

export type IroncladTournamentView = {
  id: string;
  slug: string;
  name: string;
  status: string;
  format: string;
  publicUrl: string;
  registrationOpen: boolean;
  approvedPlayers: number;
  firstCompletedAt: string | null;
  divisions: IroncladDivisionView[];
};

export type IroncladDivisionSummary = {
  key: string;
  displayName: string;
  state: string;
  approvedCount: number;
  capacity: number;
  eloRule: string;
  bracketPublished: boolean;
  champion: IroncladPlayer | null;
};

export type IroncladTournamentSummary = {
  slug: string;
  name: string;
  status: string;
  format: string;
  publicUrl: string;
  registrationOpen: boolean;
  approvedPlayers: number;
  firstCompletedAt: string | null;
  divisions: IroncladDivisionSummary[];
};

export type IroncladHubSummary = {
  // The tournament to show on the hub, see pickFeaturedTournament
  featured: IroncladTournamentSummary;
  // Latest completed tournaments with their champions, without the featured one
  recent: IroncladTournamentSummary[];
};

export type IroncladOverviewData = {
  // Running / upcoming first, then the completed from the newest
  tournaments: IroncladTournamentSummary[];
};

// Display priority of the tournament statuses, the unknown ones go just before the completed
const STATUS_ORDER = ["in_progress", "registration_open", "upcoming"];

const getStatusOrder = (status: string) => {
  if (status === "completed") return STATUS_ORDER.length + 1;
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? STATUS_ORDER.length : index;
};

const byNewestCompleted = (a: IroncladTournament, b: IroncladTournament) =>
  (Date.parse(b.firstCompletedAt ?? "") || 0) - (Date.parse(a.firstCompletedAt ?? "") || 0);

/**
 * Tournaments in the display order - running / upcoming first, then the completed from the newest.
 * The API order is kept otherwise (the sort is stable).
 */
export const sortIroncladTournaments = (tournaments: IroncladTournament[]) =>
  [...tournaments].sort((a, b) => {
    const byStatus = getStatusOrder(a.status) - getStatusOrder(b.status);
    if (byStatus !== 0) return byStatus;
    return a.status === "completed" ? byNewestCompleted(a, b) : 0;
  });

/**
 * The tournament to show on the hub - in progress, then open for registration, then upcoming,
 * then the latest completed. null when there are no tournaments.
 */
export const pickFeaturedTournament = (
  tournaments: IroncladTournament[],
): IroncladTournament | null => sortIroncladTournaments(tournaments)[0] ?? null;

// Number of the completed tournaments shown on the hub below the featured one
export const IRONCLAD_HUB_RECENT_TOURNAMENTS = 2;

/**
 * Latest completed tournaments for the hub, from the newest, without the featured one.
 */
export const getRecentCompletedTournaments = (
  tournaments: IroncladTournament[],
): IroncladTournament[] => {
  const featured = pickFeaturedTournament(tournaments);
  return tournaments
    .filter((tournament) => tournament.status === "completed" && tournament !== featured)
    .sort(byNewestCompleted)
    .slice(0, IRONCLAD_HUB_RECENT_TOURNAMENTS);
};

// Divisions from the highest tier, the unknown ones at the end in the API order
const DIVISION_TIERS = ["pro", "main", "challenge", "academy"];

const getDivisionTier = (division: { canonicalName: string }) => {
  const index = DIVISION_TIERS.indexOf(division.canonicalName.toLowerCase());
  return index === -1 ? DIVISION_TIERS.length : index;
};

export const sortDivisionsByTier = <T extends { canonicalName: string }>(divisions: T[]) =>
  [...divisions].sort((a, b) => getDivisionTier(a) - getDivisionTier(b));

// URL key of the division, eg "Main / Pro" -> "main-pro"
export const getDivisionKey = (division: { canonicalName: string }) =>
  division.canonicalName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Relic profile ID from the API (string) as number, null when not set or invalid
export const toRelicId = (relicProfileId: string | null): number | null => {
  if (!relicProfileId) return null;
  const id = Number(relicProfileId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const isForfeit = (match: Pick<IroncladMatch, "completed" | "played">) =>
  match.completed && !match.played;

export const buildIroncladPlayer = (
  participant: IroncladParticipant,
  names: IroncladPlayerNames,
): IroncladPlayer => {
  const relicId = toRelicId(participant.relicProfileId);
  const name = relicId !== null ? names[relicId] : undefined;
  return {
    registrationId: participant.registrationId,
    eventAlias: participant.eventAlias,
    eventElo: participant.eventElo,
    relicId,
    alias: name?.alias ?? null,
    country: name?.country ?? null,
    profileUrl: participant.profileUrl,
  };
};

const buildBracketSlot = (
  registrationId: string | null,
  score: number | null,
  match: IroncladMatch,
  players: Map<string, IroncladPlayer>,
): IroncladBracketSlot => ({
  player: registrationId ? (players.get(registrationId) ?? null) : null,
  score,
  isWinner: registrationId !== null && match.winnerRegistrationId === registrationId,
});

/**
 * Groups the bracket matches by round, both sorted from the first.
 * @param players Division players keyed by the registration ID
 */
export const buildBracketRounds = (
  bracket: IroncladBracket,
  players: Map<string, IroncladPlayer>,
): IroncladBracketRound[] => {
  const roundsByNumber = new Map<number, IroncladBracketRound>();

  for (const match of bracket.matches) {
    let round = roundsByNumber.get(match.roundNumber);
    if (!round) {
      round = { roundNumber: match.roundNumber, roundName: match.roundName, matches: [] };
      roundsByNumber.set(match.roundNumber, round);
    }
    round.matches.push({
      id: match.id,
      matchNumber: match.matchNumber,
      bestOf: match.bestOf,
      status: match.status,
      completed: match.completed,
      forfeit: isForfeit(match),
      decidedAt: match.decidedAt,
      slots: [
        buildBracketSlot(match.playerOneRegistrationId, match.playerOneScore, match, players),
        buildBracketSlot(match.playerTwoRegistrationId, match.playerTwoScore, match, players),
      ],
    });
  }

  const rounds = [...roundsByNumber.values()].sort((a, b) => a.roundNumber - b.roundNumber);
  rounds.forEach((round) => round.matches.sort((a, b) => a.matchNumber - b.matchNumber));
  return rounds;
};

const getDivisionPlayers = (division: IroncladDivision, names: IroncladPlayerNames) =>
  new Map(
    division.participants.map((participant) => [
      participant.registrationId,
      buildIroncladPlayer(participant, names),
    ]),
  );

export const getDivisionChampion = (
  division: IroncladDivision,
  names: IroncladPlayerNames,
): IroncladPlayer | null => {
  const championId = division.bracket?.championRegistrationId;
  if (!championId) return null;
  const participant = division.participants.find((p) => p.registrationId === championId);
  return participant ? buildIroncladPlayer(participant, names) : null;
};

const byEventElo = (a: IroncladPlayer, b: IroncladPlayer) =>
  (b.eventElo ?? -1) - (a.eventElo ?? -1);

export const buildIroncladDivisionView = (
  division: IroncladDivision,
  names: IroncladPlayerNames,
): IroncladDivisionView => {
  const players = getDivisionPlayers(division, names);
  return {
    id: division.id,
    key: getDivisionKey(division),
    displayName: division.displayName,
    state: division.effectiveState,
    approvedCount: division.approvedCount,
    capacity: division.capacity,
    eloRule: division.eloRule,
    registrationOpen: division.registrationOpen,
    participants: [...players.values()].sort(byEventElo),
    rounds: division.bracket ? buildBracketRounds(division.bracket, players) : null,
    bracketCompleted: division.bracket?.completed ?? false,
    champion: getDivisionChampion(division, names),
  };
};

export const buildIroncladTournamentView = (
  tournament: IroncladTournament,
  names: IroncladPlayerNames,
): IroncladTournamentView => ({
  id: tournament.id,
  slug: tournament.slug,
  name: tournament.name,
  status: tournament.status,
  format: tournament.format,
  publicUrl: tournament.publicUrl,
  registrationOpen: tournament.registration.open,
  approvedPlayers: tournament.approvedPlayers,
  firstCompletedAt: tournament.firstCompletedAt,
  divisions: sortDivisionsByTier(tournament.divisions).map((division) =>
    buildIroncladDivisionView(division, names),
  ),
});

export const buildIroncladTournamentSummary = (
  tournament: IroncladTournament,
  names: IroncladPlayerNames,
): IroncladTournamentSummary => ({
  slug: tournament.slug,
  name: tournament.name,
  status: tournament.status,
  format: tournament.format,
  publicUrl: tournament.publicUrl,
  registrationOpen: tournament.registration.open,
  approvedPlayers: tournament.approvedPlayers,
  firstCompletedAt: tournament.firstCompletedAt,
  divisions: sortDivisionsByTier(tournament.divisions).map((division) => ({
    key: getDivisionKey(division),
    displayName: division.displayName,
    state: division.effectiveState,
    approvedCount: division.approvedCount,
    capacity: division.capacity,
    eloRule: division.eloRule,
    bracketPublished: division.bracket !== null,
    champion: getDivisionChampion(division, names),
  })),
});

/**
 * Summary for the Tournaments hub, null when there are no tournaments.
 */
export const buildIroncladHubSummary = (
  tournaments: IroncladTournament[],
  names: IroncladPlayerNames,
): IroncladHubSummary | null => {
  const featured = pickFeaturedTournament(tournaments);
  if (!featured) return null;

  return {
    featured: buildIroncladTournamentSummary(featured, names),
    recent: getRecentCompletedTournaments(tournaments).map((tournament) =>
      buildIroncladTournamentSummary(tournament, names),
    ),
  };
};

export const buildIroncladOverviewData = (
  tournaments: IroncladTournament[],
  names: IroncladPlayerNames,
): IroncladOverviewData => ({
  tournaments: sortIroncladTournaments(tournaments).map((tournament) =>
    buildIroncladTournamentSummary(tournament, names),
  ),
});

/**
 * Relic IDs of all the participants of the tournaments.
 */
export const getIroncladParticipantRelicIds = (tournaments: IroncladTournament[]): number[] => [
  ...new Set(
    tournaments
      .flatMap((tournament) => tournament.divisions)
      .flatMap((division) => division.participants)
      .map((participant) => toRelicId(participant.relicProfileId))
      .filter((id): id is number => id !== null),
  ),
];

/**
 * Relic IDs of the division champions of the tournaments.
 */
export const getIroncladChampionRelicIds = (tournaments: IroncladTournament[]): number[] => [
  ...new Set(
    tournaments
      .flatMap((tournament) => tournament.divisions)
      .map((division) => getDivisionChampion(division, {})?.relicId ?? null)
      .filter((id): id is number => id !== null),
  ),
];
