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
  Anchor,
} from "@mantine/core";
import { Steam } from "../../components/icon/steam";
import { PlayerFactionOverview } from "../../components/PlayerFactionOverview";
import Link from "next/link";
import PlayerRecentMatches from "../../components/player-matches/player-recent-matches";
import { leaderboardsIDAsObject, localizedNames } from "../../src/coh3/coh3-data";
import { raceType } from "../../src/coh3/coh3-types";

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
const PlayerCard = ({ playerID, playerCardData, playerData, error, playerMatchesData }) => {
  console.log(playerCardData);
  console.log(playerMatchesData);
  console.log(error);
  console.log(playerID);
  console.log(playerData);

  if (error) {
    return <Container size="lg">{error}</Container>;
  }

  return (
    <>
      <Container size={"lg"}>
        <Group>
          <Avatar
            src={playerData.avatarURL}
            imageProps={{ loading: "lazy" }}
            alt={playerData.name}
            size="xl"
          />
          <Stack spacing={0}>
            <Group>
              <Image
                src={"/flags/4x3/" + playerData.country + ".svg"}
                imageProps={{ loading: "lazy" }}
                alt={playerData.country}
                width={40}
              />
              <Title> {playerData.name}</Title>
              <Anchor component={Link} href={playerData.steamURL} target="_blank">
                <Steam label="Steam Profile" />
              </Anchor>
            </Group>
            {/*<Text>Last played:</Text>
            <Text>Play time:</Text>*/}
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
          <PlayerFactionOverview faction={localizedNames.american} {...playerData.american} />
          <PlayerFactionOverview faction={localizedNames.german} {...playerData.german} />
          <PlayerFactionOverview faction={localizedNames.dak} {...playerData.dak} />
          <PlayerFactionOverview faction={localizedNames.british} {...playerData.british} />
        </SimpleGrid>
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
  let playerData = null;
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
    if (playerCardData.errors) {
      throw Error(playerCardData.errors[0].msg + " " + playerCardData.errors[0].param);
    }
    console.log(playerCardData);
    const { RelicProfile, SteamProfile } = playerCardData;
    const leaderboardStats = RelicProfile.leaderboardStats as any[];
    const member = RelicProfile.statGroups[0].members[0];

    const steamID = (member.name as string).split("/").at(-1)!;
    const { avatarmedium, profileurl } = SteamProfile[steamID];
    const getFactionLeaderboards = (faction: raceType) => {
      const intermediate = {
        ones: leaderboardStats.find(
          (stats) => stats.leaderboard_id === leaderboardsIDAsObject["1v1"][faction],
        ),
        twos: leaderboardStats.find(
          (stats) => stats.leaderboard_id === leaderboardsIDAsObject["2v2"][faction],
        ),
        threes: leaderboardStats.find(
          (stats) => stats.leaderboard_id === leaderboardsIDAsObject["3v3"][faction],
        ),
        fours: leaderboardStats.find(
          (stats) => stats.leaderboard_id === leaderboardsIDAsObject["4v4"][faction],
        ),
      };
      return {
        ones: intermediate.ones ? intermediate.ones : null,
        twos: intermediate.twos ? intermediate.twos : null,
        threes: intermediate.threes ? intermediate.threes : null,
        fours: intermediate.fours ? intermediate.fours : null,
      };
    };
    playerData = {
      name: member.alias,
      country: member.country,
      level: member.level,
      xp: member.xp,
      steamURL: profileurl,
      avatarURL: avatarmedium,
      american: getFactionLeaderboards("american"),
      british: getFactionLeaderboards("british"),
      german: getFactionLeaderboards("german"),
      dak: getFactionLeaderboards("dak"),
    };
    console.log(playerData);

    if (view === "recentMatches") {
      // @ts-ignore
      playerMatchesData = (await PlayerMatchesRes.json()).playerMatches;
    }
  } catch (e: any) {
    console.error(`Failed getting data for player id ${playerID}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: { playerID, playerCardData, playerData, error, playerMatchesData }, // will be passed to the page component as props
  };
}

export default PlayerCard;
