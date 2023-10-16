import { GetServerSideProps } from "next";
import { getGlobalAchievements } from "../../src/coh3stats-api";
import GlobalAchievements from "../../screens/stats/achievements";

export const getServerSideProps: GetServerSideProps<any, { playerID: string }> = async ({
  req,
}) => {
  const xff = `${req.headers["x-forwarded-for"]}`;

  let error = null;
  let globalAchievements = null;

  try {
    globalAchievements = await getGlobalAchievements(xff);
  } catch (e: any) {
    console.error(`Error calculating all the leaderboard stats`);
    console.error(e);
    error = e.message;
  }

  return {
    props: {
      error,
      globalAchievements,
    },
  };
};

export default GlobalAchievements;
