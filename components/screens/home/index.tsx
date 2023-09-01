//only render on client side
import { TwitchStream } from "../../../src/coh3/coh3-types";
import { NextPage } from "next";
import {
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { DPSCalculatorCard, UnitBrowserCard } from "./info-cards";
import { IconTrophy } from "@tabler/icons-react";
import React from "react";
import TwitchContainer from "./twitch-panel";
import Head from "next/head";
import LeaderboardsTable from "../../leaderboards/leaderboards-table";

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
};
const Home: NextPage<Props> = ({ twitchStreams, error }) => {
  return (
    <>
      <Head>
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <Container fluid px={"xs"}>
        <Grid>
          <Grid.Col sm={8}>
            <Image
              src="/images/coh3-background.webp"
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
          <Tabs variant="pills" defaultValue="british">
            <Flex gap="md" justify="space-between" align="center" direction="row" wrap="wrap">
              <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap">
                <IconTrophy></IconTrophy>{" "}
                <Title order={1} size="h2">
                  1v1 Leaderboards
                </Title>
              </Flex>
              <Tabs.List>
                <Tabs.Tab value="british">British Forces</Tabs.Tab>
                <Tabs.Tab value="us">US Forces</Tabs.Tab>
                <Tabs.Tab value="wehrmacht">Wehrmacht</Tabs.Tab>
                <Tabs.Tab value="afrikakorps">Deutsches Afrikakorps</Tabs.Tab>
              </Tabs.List>
            </Flex>

            <Tabs.Panel value="british" pt="xs">
              <LeaderboardsTable withBorder={false} />
            </Tabs.Panel>

            <Tabs.Panel value="us" pt="xs">
              Messages tab content
            </Tabs.Panel>

            <Tabs.Panel value="wehrmacht" pt="xs">
              Settings tab content
            </Tabs.Panel>
            <Tabs.Panel value="afrikakorps" pt="xs">
              Settings tab content
            </Tabs.Panel>
          </Tabs>
        </Paper>
        <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray" style={{ padding: 0 }}>
          <TwitchContainer twitchStreams={twitchStreams} error={error} />
        </Paper>
      </Container>
    </>
  );
};

export default Home;
