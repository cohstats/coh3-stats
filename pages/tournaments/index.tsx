import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import TournamentsScreen, { TournamentsPageProps } from "../../screens/tournaments";
import { getLadderHubResult } from "../../src/tournaments/ladder-tournament-data";

export default TournamentsScreen;

export const getStaticProps: GetStaticProps<TournamentsPageProps> = async ({ locale = "en" }) => {
  console.log(`ISR - /tournaments`);

  const { summary, revalidate } = await getLadderHubResult();

  return {
    props: {
      ladderSummary: summary,
      ...(await serverSideTranslations(locale, ["common", "tournaments", "players"])),
    },
    revalidate,
  };
};
