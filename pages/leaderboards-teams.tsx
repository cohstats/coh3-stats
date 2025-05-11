import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import TeamLeaderboards from "../screens/leaderboards-teams/team-leaderboards";

export const getServerSideProps: GetServerSideProps = async ({ locale = "en" }) => {
  console.log(`SSR - /leaderboards-teams`);

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "leaderboards"])),
    },
  };
};

export default TeamLeaderboards;
