import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import LadderTournamentScreen, {
  LadderTournamentPageProps,
} from "../../../../screens/tournaments/ladder-tournament";
import {
  getLadderSeasonPageResult,
  LADDER_TOURNAMENT_REVALIDATE,
} from "../../../../src/tournaments/ladder-tournament-data";

export default LadderTournamentScreen;

export const getStaticProps: GetStaticProps<
  LadderTournamentPageProps,
  { seasonId: string }
> = async ({ locale = "en", params }) => {
  const seasonParam = params?.seasonId ?? "";

  // Only plain positive integers, so there is one URL per season
  if (!/^[1-9]\d*$/.test(seasonParam)) {
    return { notFound: true, revalidate: LADDER_TOURNAMENT_REVALIDATE };
  }

  console.log(`ISR - /tournaments/ladder-tournament/season/${seasonParam}`);

  const result = await getLadderSeasonPageResult(Number(seasonParam));

  // Revalidated, so a new season appears once the API has it
  if (result.status === "notFound") {
    return { notFound: true, revalidate: result.revalidate };
  }

  return {
    props: {
      data: result.status === "ok" ? result.data : null,
      ...(await serverSideTranslations(locale, ["common", "tournaments", "players"])),
    },
    revalidate: result.revalidate,
  };
};

// Nothing is fetched at build time, so the build works without the API token
export const getStaticPaths: GetStaticPaths<{ seasonId: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
