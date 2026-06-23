import LiveGamesIndex from "../screens/live-games/live-games-index";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "live-games"])),
    },
  };
};

export default LiveGamesIndex;
