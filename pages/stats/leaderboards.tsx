import { Container, Space, Title, Text } from "@mantine/core";

import React, { useEffect } from "react";
import ErrorCard from "../../components/error-card";
import Head from "next/head";

import { GetServerSideProps } from "next";
import { calculateLeaderboardStats, LeaderboardStatsType } from "../../src/leaderboards/stats";
import { generateKeywordsString } from "../../src/head-utils";
import LeaderBoardStats from "../../components/leaderboards/leaderboard-stats";
import { AnalyticsStatsLeaderboardsPageView } from "../../src/firebase/analytics";

const Leaderboards = ({
  error,
  leaderBoardStats,
}: {
  error: string;
  leaderBoardStats: LeaderboardStatsType;
}) => {
  const pageTitle = `Global Leaderboards Stats - Company of Heroes 3`;
  const keywords = generateKeywordsString([
    "coh3 leaderboards",
    "live ladder",
    "overall leaderboards",
    "coh3 ladder stats",
  ]);

  useEffect(() => {
    AnalyticsStatsLeaderboardsPageView();
  }, []);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Overall information about all leaderboards in  Company of Heroes 3`}
        />
        <meta name="keywords" content={keywords} />
      </Head>
      <Container size={"md"} p={0}>
        {error ? (
          <ErrorCard title={"Error getting the leaderboards"} body={JSON.stringify(error)} />
        ) : (
          <>
            <div style={{ textAlign: "center" }}>
              <Title order={1}>Global Leaderboards Stats</Title>
            </div>
            <Text style={{ textAlign: "center" }}>
              Realtime statistics of PC only leaderboards
            </Text>
            <Space h={"xl"} />
            <LeaderBoardStats leaderBoardStats={leaderBoardStats} />
          </>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let error = null;
  let leaderBoardStats = null;

  console.log(`SSR - /stats/leaderboards`);

  try {
    leaderBoardStats = await calculateLeaderboardStats();

    res.setHeader(
      "Cache-Control",
      "public, max-age=600, s-maxage=3600, stale-while-revalidate=172800",
    );
  } catch (e: any) {
    console.error(`Error calculating all the leaderboard stats`);
    console.error(e);
    error = e.message;
  }

  return {
    props: {
      error,
      leaderBoardStats,
    },
  };
};

export default Leaderboards;
