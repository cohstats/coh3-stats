/**
 * Static identity of the community tournaments shown on the Tournaments page.
 * Only what doesn't change between seasons - NO seasons, status or registration info,
 * everything about a season must come from the tournament data.
 * This file is client safe.
 */

// Imported, so the build serves it with a content hash in the name and it can be cached forever
import ladderTournamentLogo from "../../public/images/tournaments/ladder-tournament-logo.webp";

export type TournamentId = "ladderTournament" | "ironclad" | "metaplays";

export type TournamentInfo = {
  id: TournamentId;
  // Translation key in the tournaments namespace
  nameKey: string;
  // Translation key in the tournaments namespace
  descriptionKey: string;
  // Official site
  url: string;
  // URL of the imported logo, the monogram is used when not available
  logo?: string;
  monogram: string;
  // Mantine colour
  color: string;
  // true when we have the data and our own league page for the tournament
  hasLeaguePage: boolean;
};

export const LADDER_TOURNAMENT: TournamentInfo = {
  id: "ladderTournament",
  nameKey: "tournaments.ladderTournament.name",
  descriptionKey: "tournaments.ladderTournament.description",
  url: "https://laddertournament.com.br",
  logo: ladderTournamentLogo.src,
  monogram: "LT",
  color: "green",
  hasLeaguePage: true,
};

export const LADDER_TOURNAMENT_DISCORD_URL = "https://discord.gg/HQxUnjcrNd";

// Intro to the tournament - how it works
export const LADDER_TOURNAMENT_INTRO_VIDEO_URL = "https://www.youtube.com/watch?v=tD6naKtPCWU";

// TODO: Confirm the official URL, logo and description
export const IRONCLAD_TOURNAMENT: TournamentInfo = {
  id: "ironclad",
  nameKey: "tournaments.ironclad.name",
  descriptionKey: "tournaments.ironclad.description",
  url: "https://ironclad-tournaments.example.com",
  monogram: "IC",
  color: "gray",
  hasLeaguePage: false,
};

// TODO: Confirm the official URL, logo and description
export const METAPLAYS_TOURNAMENT: TournamentInfo = {
  id: "metaplays",
  nameKey: "tournaments.metaplays.name",
  descriptionKey: "tournaments.metaplays.description",
  url: "https://meta-plays.com/tournaments/company-of-heroes-3",
  monogram: "MP",
  color: "violet",
  hasLeaguePage: false,
};

export const TOURNAMENTS: TournamentInfo[] = [
  LADDER_TOURNAMENT,
  IRONCLAD_TOURNAMENT,
  METAPLAYS_TOURNAMENT,
];
