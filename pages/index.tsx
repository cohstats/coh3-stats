import { getTwitchStreams } from "../src/coh3stats-api";
import { TwitchStream } from "../src/coh3/coh3-types";
import Home from "../components/screens/home";

export default Home;

export async function getServerSideProps() {
  let error: Error | null = null;
  let twitchStreams: TwitchStream[] | null = null;

  try {
    twitchStreams = await getTwitchStreams();
  } catch (e: any) {
    console.error(`Failed getting data for twitch streams`);
    console.error(e);
    error = e.message;
  }

  return { props: { twitchStreams, error } };
}
