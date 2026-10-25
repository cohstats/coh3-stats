/**
 * Static identity of the community tournaments shown on the Tournaments page.
 * Only what doesn't change between seasons - NO seasons, status or registration info,
 * everything about a season must come from the tournament data.
 * The links are in config.tournaments.
 * This file is client safe.
 */

import config from "../../config";

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
  url: config.tournaments.ladderTournament.url,
  logo: ladderTournamentLogo.src,
  monogram: "LT",
  color: "green",
  hasLeaguePage: true,
};

// TODO: Confirm the description
export const IRONCLAD_TOURNAMENT: TournamentInfo = {
  id: "ironclad",
  nameKey: "tournaments.ironclad.name",
  descriptionKey: "tournaments.ironclad.description",
  url: config.tournaments.ironclad.url,
  logo: ironcladLogo.src,
  monogram: "IC",
  color: "gray",
  hasLeaguePage: false,
};

// TODO: Confirm the description
export const METAPLAYS_TOURNAMENT: TournamentInfo = {
  id: "metaplays",
  nameKey: "tournaments.metaplays.name",
  descriptionKey: "tournaments.metaplays.description",
  url: config.tournaments.metaplays.url,
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
