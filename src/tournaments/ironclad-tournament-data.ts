import {
  getIroncladTournament,
  getIroncladTournaments,
  IroncladTournament,
} from "../apis/ironclad-tournament-api";
import { logger } from "../logger";
import {
  buildIroncladHubSummary,
  buildIroncladOverviewData,
  buildIroncladTournamentView,
  getIroncladChampionRelicIds,
  getIroncladParticipantRelicIds,
  pickIroncladHubTournaments,
  IroncladHubSummary,
  IroncladOverviewData,
  IroncladTournamentView,
} from "./ironclad-tournament";
import { getLadderPlayerNames } from "./ladder-tournament-names";

/**
 * Loads the IronClad data for the ISR pages. SERVER SIDE ONLY.
 */

// ISR revalidate times in seconds
// While a tournament runs (or registration is open) the brackets and the division fills change often
export const IRONCLAD_TOURNAMENT_REVALIDATE_LIVE = 600;
export const IRONCLAD_TOURNAMENT_REVALIDATE = 3600;
// Short revalidate after a failure, so the page recovers quickly
export const IRONCLAD_TOURNAMENT_REVALIDATE_ON_ERROR = 60;

export const getIroncladRevalidate = (tournaments: IroncladTournament[]) =>
  tournaments.some((tournament) => tournament.status !== "completed")
    ? IRONCLAD_TOURNAMENT_REVALIDATE_LIVE
    : IRONCLAD_TOURNAMENT_REVALIDATE;

// null when the tournaments couldn't be loaded
const loadTournaments = async (): Promise<IroncladTournament[] | null> => {
  try {
    return await getIroncladTournaments();
  } catch (error) {
    logger.error("Failed getting the IronClad tournaments");
    logger.error(error);
    return null;
  }
};

export type IroncladHubResult = {
  // null when the data couldn't be loaded or there are no tournaments
  summary: IroncladHubSummary | null;
  revalidate: number;
};

export const getIroncladHubResult = async (): Promise<IroncladHubResult> => {
  const tournaments = await loadTournaments();
  if (tournaments === null) {
    return { summary: null, revalidate: IRONCLAD_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  const hub = pickIroncladHubTournaments(tournaments);
  // The hub shows only the champions of its tournaments
  const names = await getLadderPlayerNames(
    hub ? getIroncladChampionRelicIds([hub.featured, ...hub.recent]) : [],
  );

  return {
    summary: hub ? buildIroncladHubSummary(hub, names) : null,
    revalidate: getIroncladRevalidate(tournaments),
  };
};

export type IroncladOverviewResult = {
  // null when the data couldn't be loaded
  data: IroncladOverviewData | null;
  revalidate: number;
};

export const getIroncladOverviewResult = async (): Promise<IroncladOverviewResult> => {
  const tournaments = await loadTournaments();
  if (tournaments === null) {
    return { data: null, revalidate: IRONCLAD_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  const names = await getLadderPlayerNames(getIroncladChampionRelicIds(tournaments));

  return {
    data: buildIroncladOverviewData(tournaments, names),
    revalidate: getIroncladRevalidate(tournaments),
  };
};

export type IroncladTournamentPageResult =
  | { status: "ok"; data: IroncladTournamentView; revalidate: number }
  | { status: "notFound"; revalidate: number }
  | { status: "unavailable"; revalidate: number };

export const getIroncladTournamentPageResult = async (
  slug: string,
): Promise<IroncladTournamentPageResult> => {
  let tournament: IroncladTournament | null;
  try {
    tournament = await getIroncladTournament(slug);
  } catch (error) {
    logger.error(`Failed getting the IronClad tournament ${slug}`);
    logger.error(error);
    return { status: "unavailable", revalidate: IRONCLAD_TOURNAMENT_REVALIDATE_ON_ERROR };
  }

  if (tournament === null) {
    return { status: "notFound", revalidate: IRONCLAD_TOURNAMENT_REVALIDATE };
  }

  const names = await getLadderPlayerNames(getIroncladParticipantRelicIds([tournament]));

  return {
    status: "ok",
    data: buildIroncladTournamentView(tournament, names),
    revalidate: getIroncladRevalidate([tournament]),
  };
};
