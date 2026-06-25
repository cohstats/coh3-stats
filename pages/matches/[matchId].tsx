import MatchDetailRoot from "../../screens/matches/match-root";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "matches"])),
    },
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default MatchDetailRoot;
