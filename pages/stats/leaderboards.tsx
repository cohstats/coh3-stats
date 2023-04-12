import { Container, Space, Title } from "@mantine/core";

import React from "react";
import ErrorCard from "../../components/error-card";
import Head from "next/head";

import { GetServerSideProps } from "next";
import { calculateLeaderboardStats, LeaderboardStatsType } from "../../src/leaderboards/stats";
import { generateKeywordsString } from "../../src/head-utils";
import LeaderBoardStats from "../../components/leaderboards/leaderboard-stats";

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
            <Title order={1} align={"center"}>
              Global Leaderboards Stats
            </Title>
            <Space h={"xl"} />
            <LeaderBoardStats leaderBoardStats={leaderBoardStats} />
          </>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({}) => {
  let error = null;
  let leaderBoardStats = null;

  try {
    leaderBoardStats = await calculateLeaderboardStats();
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
