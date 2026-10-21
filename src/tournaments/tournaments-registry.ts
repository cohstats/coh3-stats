/**
 * Static identity of the community tournaments shown on the Tournaments page.
 * Only what doesn't change between seasons - NO seasons, status or registration info,
 * everything about a season must come from the tournament data.
 * This file is client safe.
 */

// Imported, so the build serves them with a content hash in the name and they can be cached forever.
// 256x256 with a transparent background - sharp up to 128px on 2x screens.
import ladderTournamentLogo from "../../public/images/tournaments/ladder-tournament-logo.webp";
import ironcladLogo from "../../public/images/tournaments/ironclad-logo.webp";
import metaplaysLogo from "../../public/images/tournaments/metaplays-logo.webp";

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

// TODO: Confirm the description
export const IRONCLAD_TOURNAMENT: TournamentInfo = {
  id: "ironclad",
  nameKey: "tournaments.ironclad.name",
  descriptionKey: "tournaments.ironclad.description",
  url: "https://www.ironcladtournaments.com",
  logo: ironcladLogo.src,
  monogram: "IC",
  color: "gray",
  hasLeaguePage: false,
};

// TODO: Confirm the official URL and description
export const METAPLAYS_TOURNAMENT: TournamentInfo = {
  id: "metaplays",
  nameKey: "tournaments.metaplays.name",
  descriptionKey: "tournaments.metaplays.description",
  url: "https://meta-plays.com/tournaments/company-of-heroes-3",
  // Only the shield of their logo, without the text
  logo: metaplaysLogo.src,
  monogram: "MP",
  color: "teal",
  hasLeaguePage: false,
};

export const TOURNAMENTS: TournamentInfo[] = [
  LADDER_TOURNAMENT,
  IRONCLAD_TOURNAMENT,
  METAPLAYS_TOURNAMENT,
];
