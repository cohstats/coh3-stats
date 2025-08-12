import GameStats from "../../screens/stats/game";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "stats"])),
    },
  };
};

export default GameStats;
