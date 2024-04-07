import { GetServerSideProps } from "next";
import { getCOH3SteamNews } from "../src/apis/steam-api";
import SteamNewsPage from "../screens/news";

export const getServerSideProps: GetServerSideProps<any> = async () => {
  let COH3SteamNews = null;

  try {
    COH3SteamNews = await getCOH3SteamNews();
  } catch (e) {
    console.error(`Error getting the steam news`);
    console.error(e);
  }

  return {
    props: {
      COH3SteamNews,
    },
  };
};

export default SteamNewsPage;
