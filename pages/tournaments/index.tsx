import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import TournamentsScreen, { TournamentsPageProps } from "../../screens/tournaments";
import { getLadderHubResult } from "../../src/tournaments/ladder-tournament-data";
import { getIroncladHubResult } from "../../src/tournaments/ironclad-tournament-data";

export default TournamentsScreen;

export const getStaticProps: GetStaticProps<TournamentsPageProps> = async ({ locale = "en" }) => {
  console.log(`ISR - /tournaments`);

  // Both never throw, a failed part is returned as null summary
  const [ladder, ironclad] = await Promise.all([getLadderHubResult(), getIroncladHubResult()]);

  return {
    props: {
      ladderSummary: ladder.summary,
      ironcladSummary: ironclad.summary,
      ...(await serverSideTranslations(locale, ["common", "tournaments", "players"])),
    },
    revalidate: Math.min(ladder.revalidate, ironclad.revalidate),
  };
};
