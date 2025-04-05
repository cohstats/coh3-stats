import { GetServerSideProps } from "next";
import { getGlobalAchievements } from "../../src/apis/coh3stats-api";
import GlobalAchievementsIndex from "../../screens/stats/achievements";
import { generateExpireTimeStamps } from "../../src/utils";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps: GetServerSideProps<any, { playerID: string }> = async ({
  req,
  res,
  locale = "en",
}) => {
  const xff = `${req.headers["x-forwarded-for"]}`;

  console.log(`SSR - /stats/achievements`);

  let error = null;
  let globalAchievements = null;

  try {
    globalAchievements = await getGlobalAchievements(xff);

    // Expire at 4 AM
    const expireTimeStamp = generateExpireTimeStamps(4);

    res.setHeader("Cache-Control", "public, stale-while-revalidate=604800");
    res.setHeader("Expires", `${new Date(expireTimeStamp).toUTCString()}`);
  } catch (e: any) {
    console.error(`Error calculating all the leaderboard stats`);
    console.error(e);
    error = e.message;
  }

  return {
    props: {
      error,
      globalAchievements,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default GlobalAchievementsIndex;
