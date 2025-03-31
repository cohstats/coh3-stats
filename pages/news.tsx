import { GetServerSideProps } from "next";
import { getCOH3SteamNews } from "../src/apis/steam-api";
import SteamNewsPage from "../screens/news";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps: GetServerSideProps<any> = async ({ res, locale = "en" }) => {
  let COH3SteamNews = null;

  console.log(`SSR - /news`);

  try {
    COH3SteamNews = await getCOH3SteamNews();

    // Cache for 30 minutes, stale while revalidate 48 hours
    res.setHeader(
      "Cache-Control",
      "public, max-age=600, s-maxage=1800, stale-while-revalidate=172800",
    );
  } catch (e) {
    console.error(`Error getting the steam news`);
    console.error(e);
  }

  return {
    props: {
      COH3SteamNews,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default SteamNewsPage;
