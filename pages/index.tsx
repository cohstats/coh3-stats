import { getTwitchStreams } from "../src/coh3stats-api";
import { Top1v1LeaderboardsData, TwitchStream } from "../src/coh3/coh3-types";
import Home from "../components/screens/home";
import { getTop1v1LeaderBoards } from "../src/leaderboards/top-leaderboards";
import { getLatestCOH3RedditPosts, RedditPostType } from "../src/reddit-api";
import { GetServerSideProps } from "next";

export default Home;

export const getServerSideProps: GetServerSideProps<any> = async ({ req }) => {
  const xff = `${req.headers["x-forwarded-for"]}`;

  let error: Error | null = null;
  let twitchStreams: TwitchStream[] | null = null;
  let topLeaderBoardsData: Top1v1LeaderboardsData | null = null;
  let redditPostsData: RedditPostType[] | null = null;

  try {
    const [PromisedTwitchStreams, PromisedTopLeaderBoardsData, PromisedRedditPostsData] =
      await Promise.all([
        getTwitchStreams(xff),
        getTop1v1LeaderBoards("american"),
        getLatestCOH3RedditPosts(),
      ]);

    twitchStreams = PromisedTwitchStreams;
    topLeaderBoardsData = PromisedTopLeaderBoardsData;
    redditPostsData = PromisedRedditPostsData;
  } catch (e: any) {
    console.error(`Failed getting data for twitch streams`);
    console.error(e);
    error = e.message;
  }

  return { props: { twitchStreams, error, topLeaderBoardsData, redditPostsData } };
};
