import { getTwitchStreams } from "../src/apis/coh3stats-api";
import { Top1v1LeaderboardsData, TwitchStream } from "../src/coh3/coh3-types";
import Home from "../screens/home";
import { getTop1v1LeaderBoards } from "../src/leaderboards/top-leaderboards";
import { getLatestCOH3RedditPosts, RedditPostType } from "../src/apis/reddit-api";
import { GetServerSideProps } from "next";
import { COH3SteamNewsType, getCOH3SteamNews, NewsItem } from "../src/apis/steam-api";

export default Home;

export const getServerSideProps: GetServerSideProps<any> = async ({ req }) => {
  const xff = `${req.headers["x-forwarded-for"]}`;

  let error: Error | null = null;
  let twitchStreams: TwitchStream[] | null = null;
  let topLeaderBoardsData: Top1v1LeaderboardsData | null = null;
  let redditPostsData: RedditPostType[] | null = null;
  let steamNewsData: COH3SteamNewsType | null = null;

  try {
    const [
      PromisedTwitchStreams,
      PromisedTopLeaderBoardsData,
      PromisedRedditPostsData,
      PromisedSteamNewsData,
    ] = await Promise.all([
      getTwitchStreams(xff),
      getTop1v1LeaderBoards("american"),
      getLatestCOH3RedditPosts(),
      getCOH3SteamNews(3),
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
  } catch (e: any) {
    console.error(`Failed getting data for home page`);
    console.error(e);
    error = e.message;
  }

  return { props: { twitchStreams, error, topLeaderBoardsData, redditPostsData, steamNewsData } };
};
