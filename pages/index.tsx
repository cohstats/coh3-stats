import { getTwitchStreams, getYouTubeVideosHttp } from "../src/apis/coh3stats-api";
import Home from "../screens/home";
import { getTop1v1LeaderBoards } from "../src/leaderboards/top-leaderboards";
import { getLatestCOH3RedditPosts } from "../src/apis/reddit-api";
import { GetStaticProps } from "next";
import { NewsItem } from "../src/apis/steam-api";
import { getNews } from "../src/news/get-news";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

export default Home;

// Normal ISR interval (matching s-maxage from headers)
const REVALIDATE_OK = 600;
// When any section failed, regenerate quickly so the broken state is short-lived
const REVALIDATE_ON_FAILURE = 30;

export const getStaticProps: GetStaticProps<any> = async ({ locale = "en" }) => {
  console.log(`ISR - /, locale: ${locale}`);

  // Each source is fetched independently - one failing must not affect the others
  const [twitchResult, leaderboardsResult, redditResult, newsResult, youtubeResult] =
    await Promise.allSettled([
      getTwitchStreams(""),
      getTop1v1LeaderBoards("american"),
      getLatestCOH3RedditPosts(),
      getNews(3),
      getYouTubeVideosHttp(),
    ]);

  const failures: string[] = [];
  const valueOrNull = <T,>(name: string, result: PromiseSettledResult<T>): T | null => {
    if (result.status === "fulfilled") return result.value;
    console.error(`Failed getting ${name} data for home page`);
    console.error(result.reason);
    failures.push(name);
    return null;
  };

  const twitchStreams = valueOrNull("twitch", twitchResult);
  const topLeaderBoardsData = valueOrNull("leaderboards", leaderboardsResult);
  const redditPostsData = valueOrNull("reddit", redditResult);
  const steamNewsRaw = valueOrNull("news", newsResult);
  const youtubeData = valueOrNull("youtube", youtubeResult);

  // Reddit and YouTube swallow their errors and return [] - treat empty as a failure
  if (redditPostsData && redditPostsData.length === 0) failures.push("reddit");
  if (youtubeData && youtubeData.length === 0) failures.push("youtube");

  const steamNewsData = steamNewsRaw
    ? {
        ...steamNewsRaw,
        newsitems: steamNewsRaw.newsitems.map((news: NewsItem) => ({
          gid: news.gid,
          title: news.title,
          image: news.image,
          ...(typeof news.imageOnly === "boolean" ? { imageOnly: news.imageOnly } : {}),
        })),
      }
    : null;

  const error =
    twitchResult.status === "rejected" ? (twitchResult.reason?.message ?? "Unknown error") : null;

  if (failures.length > 0) {
    console.warn(
      `Home page generated with failed sections: ${failures.join(", ")} - revalidating in ${REVALIDATE_ON_FAILURE}s`,
    );
  }

  return {
    props: {
      twitchStreams,
      error,
      topLeaderBoardsData,
      redditPostsData,
      steamNewsData,
      youtubeData,
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
    revalidate: failures.length > 0 ? REVALIDATE_ON_FAILURE : REVALIDATE_OK,
  };
};
