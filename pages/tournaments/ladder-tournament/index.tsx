import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import LadderTournamentOverviewScreen, {
  LadderTournamentOverviewPageProps,
} from "../../../screens/tournaments/ladder-tournament/overview";
import { getLadderOverviewResult } from "../../../src/tournaments/ladder-tournament-data";

export default LadderTournamentOverviewScreen;

// The league overview - the latest season and all the seasons, the menu and the hub link here
export const getStaticProps: GetStaticProps<LadderTournamentOverviewPageProps> = async ({
  locale = "en",
}) => {
  console.log(`ISR - /tournaments/ladder-tournament`);

  const { data, revalidate } = await getLadderOverviewResult();

  return {
    props: {
      data,
      ...(await serverSideTranslations(locale, ["common", "tournaments", "players"])),
    },
    revalidate,
  };
};
