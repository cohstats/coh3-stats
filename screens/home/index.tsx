import { Top1v1LeaderboardsData, TwitchStream, YouTubeVideo } from "../../src/coh3/coh3-types";
import { NextPage } from "next";
import { Container, Grid, Paper } from "@mantine/core";
import { DPSCalculatorCard, UnitBrowserCard } from "./info-cards";
import React, { useEffect, useRef, useState } from "react";
import TwitchContainer from "./twitch-panel";
import Head from "next/head";
import TopLeaderboardsSection from "./leaderboards-section/top-leaderboards-section";
import { RedditPostType } from "../../src/apis/reddit-api";
import RedditPanel from "./reddit-panel";
import { NewsSection } from "./news-section/news-section";
import { COH3SteamNewsType } from "../../src/apis/steam-api";
import YoutubePanel from "./youtube-panel/youtube-panel";
import { useIntersection } from "@mantine/hooks";
import { useTranslation } from "next-i18next";
import { generateAlternateLanguageLinks } from "../../src/head-utils";

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
  topLeaderBoardsData: Top1v1LeaderboardsData | null;
  redditPostsData: RedditPostType[] | null;
  steamNewsData: COH3SteamNewsType | null;
  youtubeData: YouTubeVideo[] | null;
};
const Home: NextPage<Props> = ({
  twitchStreams,
  error,
  topLeaderBoardsData,
  redditPostsData,
  steamNewsData,
  youtubeData,
}) => {
  const { t } = useTranslation(["home", "common"]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: containerRef.current,
    rootMargin: "250px",
    threshold: 0.1,
  });

  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (entry?.isIntersecting && !hasRendered) {
      setHasRendered(true);
    }
  }, [entry, hasRendered]);

  return (
    <>
      <Head>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
        {generateAlternateLanguageLinks("")}
      </Head>
      <Container fluid p={{ base: 0 }}>
        <Grid>
          <Grid.Col span={{ sm: 7 }}>
            <NewsSection steamNewsData={steamNewsData} t={t} />
            <Grid gutter="xs" pt={"md"} style={{ alignItems: "stretch" }}>
              <Grid.Col span={{ sm: 6 }} style={{ display: "flex" }}>
                <DPSCalculatorCard t={t} />
              </Grid.Col>
              <Grid.Col span={{ sm: 6 }} style={{ display: "flex" }}>
                <UnitBrowserCard t={t} />
              </Grid.Col>
            </Grid>
            <TopLeaderboardsSection initialData={topLeaderBoardsData} t={t} />
          </Grid.Col>
          <Grid.Col span={{ sm: 5 }}>
            <RedditPanel redditPostsData={redditPostsData} t={t} />
          </Grid.Col>
        </Grid>

        <YoutubePanel youtubeData={youtubeData} t={t} />

        <Paper shadow="xs" radius="md" pt={"xs"} p={0} color="gray" mih={600}>
          <div ref={ref}>
            {hasRendered && <TwitchContainer twitchStreams={twitchStreams} error={error} t={t} />}
          </div>
        </Paper>
      </Container>
    </>
  );
};

export default Home;
