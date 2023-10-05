import { processPlayerInfoAPIResponse } from "../../src/players/standings";
import { getPlayerCardInfo, getPlayerRecentMatches, getPlayerCarStats } from "../../src/apis/coh3stats-api";
import { GetServerSideProps } from "next";
import { getReplaysForPlayer, ProcessReplaysData } from "../../src/apis/cohdb-api";

import PlayerCard from "../../screens/players";

export const getServerSideProps: GetServerSideProps<any, { playerID: string }> = async ({
  params,
  query,
  req,
}) => {
  const playerID = params?.playerID[0] || "";
  const { view, start } = query;
  const xff = `${req.headers["x-forwarded-for"]}`;

  const viewPlayerMatches = view === "recentMatches";
  const isReplaysPage = view === "replays";
  // const viewStandings = view === "standings";

  let playerData = null;
  let playerStatsData = null;
  let playerMatchesData = null;
  let error = null;
  let replaysData = null;

  // const prevPage = req.headers.referer;
  // const prevPlayerId = prevPage?.match(/.+players\/(\d+).+/)?.[1];
  // const isSamePlayer = prevPlayerId === playerID;
  // const isFromPlayerPage = isSamePlayer && Boolean(prevPage?.includes("/players/"));

  try {
    const PromisePlayerCardData = getPlayerCardInfo(playerID, true, xff);
    const PromisePlayerCardStatsData = getPlayerCarStats(playerID, xff);
    const PromiseReplaysData = isReplaysPage
      ? getReplaysForPlayer(playerID, start as string | undefined)
      : Promise.resolve();

    const PromisePlayerMatchesData = viewPlayerMatches
      ? getPlayerRecentMatches(playerID, xff)
      : Promise.resolve();

    const [playerAPIData, playerCardStatsData, PlayerMatchesAPIData, replaysAPIDAta] = await Promise.all([
      PromisePlayerCardData,
      PromisePlayerCardStatsData,
      PromisePlayerMatchesData,
      PromiseReplaysData,
    ]);

    playerStatsData = playerCardStatsData ? playerCardStatsData : null;
    playerData = playerAPIData ? processPlayerInfoAPIResponse(playerAPIData) : null;
    playerMatchesData = viewPlayerMatches ? PlayerMatchesAPIData : null;
    replaysData = isReplaysPage ? ProcessReplaysData(replaysAPIDAta) : null;
  } catch (e: any) {
    console.error(`Failed getting data for player id ${playerID}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: { playerID, playerDataAPI: playerData, error, playerMatchesData, replaysData }, // will be passed to the page component as props
  };
};

export default PlayerCard;
