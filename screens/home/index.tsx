import { Top1v1LeaderboardsData, TwitchStream } from "../../src/coh3/coh3-types";
import { NextPage } from "next";
import { Container, Grid, Image, Paper, Stack } from "@mantine/core";
import { DPSCalculatorCard, UnitBrowserCard } from "./info-cards";
import React from "react";
import TwitchContainer from "./twitch-panel";
import Head from "next/head";
import TopLeaderboardsSection from "./leaderboards-section/top-leaderboards-section";
import { RedditPostType } from "../../src/reddit-api";
import RedditPanel from "./reddit-panel";

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
  topLeaderBoardsData: Top1v1LeaderboardsData | null;
  redditPostsData: RedditPostType[] | null;
};
const Home: NextPage<Props> = ({
  twitchStreams,
  error,
  topLeaderBoardsData,
  redditPostsData,
}) => {
  return (
    <>
      <Head>
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <Container fluid p={{ base: 0 }}>
        <Grid>
          <Grid.Col sm={8}>
            <Image
              src="/images/coh3-background-cropped.webp"
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

        <TopLeaderboardsSection initialData={topLeaderBoardsData} />
        <RedditPanel redditPostsData={redditPostsData} />

        <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray" style={{ padding: 0 }}>
          <TwitchContainer twitchStreams={twitchStreams} error={error} />
        </Paper>
      </Container>
    </>
  );
};

export default Home;
