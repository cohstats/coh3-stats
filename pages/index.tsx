import { getTwitchStreams, getYouTubeVideosHttp } from "../src/apis/coh3stats-api";
import { Top1v1LeaderboardsData, TwitchStream, YouTubeVideo } from "../src/coh3/coh3-types";
import Home from "../screens/home";
import { getTop1v1LeaderBoards } from "../src/leaderboards/top-leaderboards";
import { getLatestCOH3RedditPosts, RedditPostType } from "../src/apis/reddit-api";
import { GetStaticProps } from "next";
import { COH3SteamNewsType, getCOH3SteamNews, NewsItem } from "../src/apis/steam-api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default Home;

export const getStaticProps: GetStaticProps<any> = async ({ locale = "en" }) => {
  let error: Error | null = null;
  let twitchStreams: TwitchStream[] | null = null;
  let topLeaderBoardsData: Top1v1LeaderboardsData | null = null;
  let redditPostsData: RedditPostType[] | null = null;
  let steamNewsData: COH3SteamNewsType | null = null;
  let youtubeData: YouTubeVideo[] | null = null;

  console.log(`ISR - /, locale: ${locale}`);

  try {
    const [
      PromisedTwitchStreams,
      PromisedTopLeaderBoardsData,
      PromisedRedditPostsData,
      PromisedSteamNewsData,
      PromisedYoutubeData,
    ] = await Promise.all([
      getTwitchStreams(""),
      getTop1v1LeaderBoards("american"),
      getLatestCOH3RedditPosts(),
      getCOH3SteamNews(3),
      getYouTubeVideosHttp(),
    ]);

    twitchStreams = PromisedTwitchStreams;
    topLeaderBoardsData = PromisedTopLeaderBoardsData;
    redditPostsData = PromisedRedditPostsData;
    PromisedSteamNewsData.newsitems = PromisedSteamNewsData.newsitems.map((news: NewsItem) => {
      return {
        gid: news.gid,
        title: news.title,
        image: news.image,
      };
    });
    steamNewsData = PromisedSteamNewsData;
    youtubeData = PromisedYoutubeData;
  } catch (e: any) {
    console.error(`Failed getting data for home page`);
    console.error(e);
    error = e.message;
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
    revalidate: 600, // Revalidate every 10 minutes (matching s-maxage from headers)
  };
};
