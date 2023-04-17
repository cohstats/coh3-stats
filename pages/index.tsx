import type { NextPage } from "next";
import { getTwitchStreams } from "../src/coh3stats-api";
import {
  Container,
  Image,
  Paper,
  Title,
  Text,
  Group,
  Card,
  Stack,
  Anchor,
  Grid,
} from "@mantine/core";
import { Github } from "../components/icon/github";
import { Donate } from "../components/icon/donate";
import { Discord } from "../components/icon/discord";
import { TwitchStream } from "../src/coh3/coh3-types";
import dynamic from "next/dynamic";
import React from "react";
import { DPSCalculatorCard, UnitBrowserCard } from "../components/home-page/info-cards";

//only render on client side
const TwitchPanel = dynamic(() => import("../components/twitch-panel/twitch-panel"), {
  ssr: false,
});

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
};
const Home: NextPage<Props> = ({ twitchStreams, error }) => {
  return (
    <Container fluid px={"xs"}>
      <Grid>
        <Grid.Col sm={8}>
          <Image
            src="/coming-soon/coh3-background.jpg"
            alt={"coh3-background"}
            radius="md"
            height={"19rem"}
          />
        </Grid.Col>
        <Grid.Col sm={4}>
          <Stack>
            <DPSCalculatorCard />
            <UnitBrowserCard />
          </Stack>
        </Grid.Col>
      </Grid>

      <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray">
        <Title order={1}>Company of Heroes 3 is out🎉</Title>
        <Title order={2} size="h4" pt="md">
          Leaderboards, Player Cards, Player Matches are done. <br />
          But we want to do a lot more! All the help is welcome.
        </Title>
        <Text pt="sm">
          Find your player card using search or leaderboards.
          <br />
          Search now works only with exact name match (case-sensitive)
        </Text>
        <Text pt="sm">More info on Github or Discord</Text>
        <Group pt="md">
          <Discord />
          <Github />
          <Donate />
        </Group>
      </Paper>
      <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray" style={{ padding: 0 }}>
        <TwitchPanel twitchStreams={twitchStreams} error={error} />
      </Paper>
    </Container>
  );
};

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
