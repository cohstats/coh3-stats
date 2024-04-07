import { Top1v1LeaderboardsData, TwitchStream } from "../../src/coh3/coh3-types";
import { NextPage } from "next";
import { Container, Grid, Paper, Stack } from "@mantine/core";
import { DPSCalculatorCard, UnitBrowserCard } from "./info-cards";
import React from "react";
import TwitchContainer from "./twitch-panel";
import Head from "next/head";
import TopLeaderboardsSection from "./leaderboards-section/top-leaderboards-section";
import { RedditPostType } from "../../src/apis/reddit-api";
import RedditPanel from "./reddit-panel";
import { NewsSection } from "./news-section/news-section";
import { COH3SteamNewsType } from "../../src/apis/steam-api";

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
  topLeaderBoardsData: Top1v1LeaderboardsData | null;
  redditPostsData: RedditPostType[] | null;
  steamNewsData: COH3SteamNewsType | null;
};
const Home: NextPage<Props> = ({
  twitchStreams,
  error,
  topLeaderBoardsData,
  redditPostsData,
  steamNewsData,
}) => {
  return (
    <>
      <Head>
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <Container fluid p={{ base: 0 }}>
        <Grid>
          <Grid.Col sm={7}>
            <NewsSection steamNewsData={steamNewsData} />
          </Grid.Col>
          <Grid.Col sm={5}>
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
