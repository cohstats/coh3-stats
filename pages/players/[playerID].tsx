import config from "../../config";

/**
 *
 * Example url http://localhost:3000/players/26631
 * For player card ^^
 *
 * For player card with matches http://localhost:3000/players/26631?view=recentMatches
 *
 * @param playerID
 * @param data
 * @param error
 * @constructor
 */

// @ts-ignore
const PlayerCard = ({ playerID, playerCardData, error, playerMatchesData }) => {
  return (
    <>
      <p>playerID: {playerID}</p>
      <div>Error: |{error}|</div>
      {JSON.stringify(playerCardData)}
      <div>
        Player MATCHES
        <div>{JSON.stringify(playerMatchesData)}</div>
      </div>
    </>
  );
};

// THIS code is super dirty to get the things done, needs to be fixed
// I am not sure if it's a good idea to have it as query parameter
// I am counting with the old url setup as we had on coh2stats https://coh2stats.com/players/76561198051168720-F3riG?view=recentMatches
// @ts-ignore
export async function getServerSideProps({ params, query }) {
  const { playerID } = params;
  const { view } = query;

  let playerCardData = null;
  let playerMatchesData = null;
  let error = null;

  try {
    const PromisePlayerCardFetch = fetch(
      `${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerCardInfoHttp?relicId=${playerID}`,
    );

    const PromisePlayerMatchesFetch =
      view == "recentMatches"
        ? fetch(`${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerMatchesHttp?relicId=${playerID}`)
        : Promise.resolve();

    const [PlayerCardRes, PlayerMatchesRes] = await Promise.all([
      PromisePlayerCardFetch,
      PromisePlayerMatchesFetch,
    ]);

    // Also check status code if not 200
    playerCardData = await PlayerCardRes.json();

    if (view === "recentMatches") {
      // @ts-ignore
      playerMatchesData = await PlayerMatchesRes.json();
    }
  } catch (e: any) {
    console.error(`Failed getting data for player id ${playerID}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: { playerID, playerCardData, error, playerMatchesData }, // will be passed to the page component as props
  };
}

export default PlayerCard;
