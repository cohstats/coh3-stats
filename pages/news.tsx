import { GetServerSideProps } from "next";
import { getCOH3SteamNews } from "../src/apis/steam-api";
import SteamNewsPage from "../screens/news";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const NEWS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps<any> = async ({
  res,
  locale = "en",
  query,
}) => {
  let COH3SteamNews = null;
  const pageParam = Math.max(1, parseInt(query.page as string, 10) || 1);

  console.log(`SSR - /news page: ${pageParam}`);

  try {
    const allNews = await getCOH3SteamNews();

    const totalItems = allNews.newsitems.length;
    const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);
    const currentPage = Math.min(Math.max(pageParam, 1), totalPages || 1);

    const start = (currentPage - 1) * NEWS_PER_PAGE;
    const end = start + NEWS_PER_PAGE;

    COH3SteamNews = {
      ...allNews,
      newsitems: allNews.newsitems.slice(start, end),
      currentPage,
      totalPages,
    };

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
      ...(await serverSideTranslations(locale, ["common", "news"])),
    },
  };
};

export default SteamNewsPage;
