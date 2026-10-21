import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import LadderTournamentScreen, {
  LadderTournamentPageProps,
} from "../../../screens/tournaments/ladder-tournament";
import { getLadderSeasonPageResult } from "../../../src/tournaments/ladder-tournament-data";

export default LadderTournamentScreen;

// The latest season - the menu and the hub link here, so it always shows the current standings
export const getStaticProps: GetStaticProps<LadderTournamentPageProps> = async ({
  locale = "en",
}) => {
  console.log(`ISR - /tournaments/ladder-tournament`);

  const result = await getLadderSeasonPageResult();

  return {
    props: {
      data: result.status === "ok" ? result.data : null,
      isLatestRoute: true,
      ...(await serverSideTranslations(locale, ["common", "tournaments", "players"])),
    },
    revalidate: result.revalidate,
  };
};
