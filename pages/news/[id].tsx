import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { NewsItem } from "../../src/apis/steam-api";
import { getNews } from "../../src/news/get-news";
import { getNewsExcerpt } from "../../src/news/news-excerpt";
import NewsArticlePage, {
  NewsArticleLink,
  NewsArticlePageProps,
} from "../../screens/news/news-article-page";

const toArticleLink = (item?: NewsItem): NewsArticleLink | null =>
  item ? { gid: item.gid, title: item.title } : null;

export const getServerSideProps: GetServerSideProps<
  NewsArticlePageProps,
  { id: string }
> = async ({ res, locale = "en", params }) => {
  const id = params?.id ?? "";

  console.log(`SSR - /news/${id}`);

  // The same cached list as /news, so the newer and older articles match the overview.
  let allNews = await getNews();
  let index = allNews.newsitems.findIndex((item) => item.gid === id);

  // The home page lists news from its own fetch, which can be newer than this cached list.
  // Load the news again, so a fresh post doesn't show 404 until the cache expires.
  if (index === -1) {
    allNews = await getNews(undefined, true);
    index = allNews.newsitems.findIndex((item) => item.gid === id);
  }

  // Not cached, a Steam outage must not keep the article as a 404 in the CDN.
  if (index === -1) {
    return { notFound: true };
  }

  const item = allNews.newsitems[index];

  // Cache for 30 minutes, stale while revalidate 48 hours, same as /news
  res.setHeader(
    "Cache-Control",
    "public, max-age=600, s-maxage=1800, stale-while-revalidate=172800",
  );

  return {
    props: {
      item,
      description: getNewsExcerpt(item.contents),
      newerItem: toArticleLink(allNews.newsitems[index - 1]),
      olderItem: toArticleLink(allNews.newsitems[index + 1]),
      ...(await serverSideTranslations(locale, ["common", "news"])),
    },
  };
};

export default NewsArticlePage;
