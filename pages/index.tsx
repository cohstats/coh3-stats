import { getTwitchStreams } from "../src/coh3stats-api";
import { Top1v1LeaderboardsData, TwitchStream } from "../src/coh3/coh3-types";
import Home from "../components/screens/home";
import { getTop1v1LeaderBoards } from "../src/leaderboards/top-leaderboards";

export default Home;

export async function getServerSideProps() {
  let error: Error | null = null;
  let twitchStreams: TwitchStream[] | null = null;
  let topLeaderBoardsData: Top1v1LeaderboardsData | null = null;

  try {
    const [PromisedTwitchStreams, PromisedTopLeaderBoardsData] = await Promise.all([
      getTwitchStreams(),
      getTop1v1LeaderBoards("british"),
    ]);

    twitchStreams = PromisedTwitchStreams;
    topLeaderBoardsData = PromisedTopLeaderBoardsData;
  } catch (e: any) {
    console.error(`Failed getting data for twitch streams`);
    console.error(e);
    error = e.message;
  }

  return { props: { twitchStreams, error, topLeaderBoardsData } };
}
