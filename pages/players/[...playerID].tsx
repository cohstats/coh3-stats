import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import { getPlayerCardInfo, getPlayerRecentMatches } from "../../src/coh3stats-api";
import { GetServerSideProps } from "next";
import PlayerCard from "../../components/screens/players";

export const getServerSideProps: GetServerSideProps<any, { playerID: string }> = async ({
  params,
  query,
}) => {
  const playerID = params?.playerID[0] || "";
  const { view } = query;

  const viewPlayerMatches = view === "recentMatches";
  // const viewStandings = view === "standings";

  let playerData = null;
  let playerMatchesData = null;
  let error = null;

  // const prevPage = req.headers.referer;
  // const prevPlayerId = prevPage?.match(/.+players\/(\d+).+/)?.[1];
  // const isSamePlayer = prevPlayerId === playerID;
  // const isFromPlayerPage = isSamePlayer && Boolean(prevPage?.includes("/players/"));

  try {
    const PromisePlayerCardData = getPlayerCardInfo(playerID, true);

    const PromisePlayerMatchesData = viewPlayerMatches
      ? getPlayerRecentMatches(playerID)
      : Promise.resolve();

    const [playerAPIData, PlayerMatchesAPIData] = await Promise.all([
      PromisePlayerCardData,
      PromisePlayerMatchesData,
    ]);

    playerData = playerAPIData ? processPlayerInfoAPIResponse(playerAPIData) : null;
    playerMatchesData = viewPlayerMatches ? PlayerMatchesAPIData : null;
  } catch (e: any) {
    console.error(`Failed getting data for player id ${playerID}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: { playerID, playerDataAPI: playerData, error, playerMatchesData }, // will be passed to the page component as props
  };
};

export default PlayerCard;
