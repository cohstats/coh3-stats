import { GetServerSideProps } from "next";
import { getNews } from "../src/news/get-news";
import { isNewsCategory, NEWS_CATEGORIES, NewsCategory } from "../src/news/news-categories";
import SteamNewsPage from "../screens/news";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

const NEWS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps<any> = async ({
  res,
  locale = "en",
  query,
}) => {
  let COH3SteamNews = null;
  let categoryCounts: Record<NewsCategory | "all", number> | null = null;
  const pageParam = Math.max(1, parseInt(query.page as string, 10) || 1);
  const category: NewsCategory | null = isNewsCategory(query.category) ? query.category : null;

  console.log(`SSR - /news page: ${pageParam}, category: ${category ?? "all"}`);

  try {
    const allNews = await getNews();
    const filteredNews = category
      ? allNews.newsitems.filter((item) => item.category === category)
      : allNews.newsitems;

    // Counts come from the news already loaded for the page, no extra requests.
    categoryCounts = {
      all: allNews.newsitems.length,
      ...(Object.fromEntries(NEWS_CATEGORIES.map((c) => [c, 0])) as Record<NewsCategory, number>),
    };
    for (const item of allNews.newsitems) {
      if (item.category) categoryCounts[item.category]++;
    }

    const totalItems = filteredNews.length;
    const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);
    const currentPage = Math.min(Math.max(pageParam, 1), totalPages || 1);

    const start = (currentPage - 1) * NEWS_PER_PAGE;
    const end = start + NEWS_PER_PAGE;

    COH3SteamNews = {
      ...allNews,
      newsitems: filteredNews.slice(start, end),
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
    if (!COH3SteamNews) {
      COH3SteamNews = {
        count: 0,
        newsitems: [],
        currentPage: 1,
        totalPages: 1,
      };
    }
  }

  return {
    props: {
      COH3SteamNews,
      category,
      categoryCounts,
      ...(await serverSideTranslations(locale, ["common", "news"])),
    },
  };
};

export default SteamNewsPage;
