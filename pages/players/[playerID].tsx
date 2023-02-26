import config from "../../config";
import {
  Indicator,
  Image,
  Avatar,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Table,
  SimpleGrid,
} from "@mantine/core";
import { Steam } from "../../components/icon/steam";
import { PlayerFactionOverview } from "../../components/PlayerFactionOverview";

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
  const imageUrl =
    "https://avatars.akamai.steamstatic.com/d486a516597e3834c07a14cfd3afb89789bac1e9_medium.jpg";
  const name = "John";
  const country = "us";

  const modeData = { rank: 1, streak: -2, wins: 10, losses: 2 };
  const factionOverviewData = {
    faction: "Americans",
    ones: modeData,
    twos: modeData,
    threes: modeData,
    fours: modeData,
  };

  return (
    <>
      <Container size={"lg"}>
        <Group>
          <Avatar src={imageUrl} imageProps={{ loading: "lazy" }} alt={name} size="xl" />
          <Stack spacing={0}>
            <Group>
              <Image
                src={"/flags/4x3/" + country + ".svg"}
                imageProps={{ loading: "lazy" }}
                alt={country}
                width={40}
              />
              <Title> {name}</Title>
              <a href={config.GITHUB_LINK} target="_blank" rel="noopener noreferrer">
                <Steam label="Steam Profile" />
              </a>
            </Group>
            <Text>Last played:</Text>
            <Text>Play time:</Text>
            <Text>Rating: ?! what does it mean?</Text>
          </Stack>
        </Group>

        <SimpleGrid
          cols={3}
          mt="xl"
          breakpoints={[
            { maxWidth: 1300, cols: 2 },
            { maxWidth: 650, cols: 1 },
          ]}
        >
          <PlayerFactionOverview {...factionOverviewData} />
          <PlayerFactionOverview {...factionOverviewData} />
          <PlayerFactionOverview {...factionOverviewData} />
          <PlayerFactionOverview {...factionOverviewData} />
        </SimpleGrid>

        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Rank</th>
              <th>Rating</th>
              <th>Streak</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Ratio</th>
              <th>Total</th>
              <th>Drops</th>
              <th>Disputes</th>
              <th>Last Game</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>1v1</th>
              <td>Second</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <th>1v1</th>
              <td>Second</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Summary</th>
              <td></td>
              <td></td>
              <td></td>
              <td>10</td>
              <td>10</td>
              <td>60%</td>
              <td>100</td>
              <td>0</td>
              <td>0</td>
              <td>date</td>
            </tr>
          </tfoot>
        </Table>

        <p>playerID: {playerID}</p>
        <div>Error: |{error}|</div>
        {JSON.stringify(playerCardData)}
        <div>
          Player MATCHES
          <div>{JSON.stringify(playerMatchesData)}</div>
        </div>
      </Container>
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
