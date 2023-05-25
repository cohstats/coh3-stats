import { Container, Title, Text, Group, Paper, Center } from "@mantine/core";

import React, { useEffect } from "react";
import ErrorCard from "../../components/error-card";
import Head from "next/head";

import { GetServerSideProps } from "next";
import { generateKeywordsString } from "../../src/head-utils";

import { doc, getDoc, getFirestore } from "firebase/firestore";
import dynamic from "next/dynamic";
import { IconAlertTriangle, IconUser } from "@tabler/icons-react";
import HelperIcon from "../../components/icon/helper";
import dayjs from "dayjs";

//only render on client side
const DynamicGeoWorldMap = dynamic(
  () => import("../../components/charts/geo-map/geo-world-map"),
  {
    ssr: false,
  },
);

const DynamicPlayersLineChart = dynamic(
  () => import("../../components/charts/players-line/players-line-chart"),
  {
    ssr: false,
  },
);

type PlayerStatsType = {
  count: number;
  last24hours: number;
  last30days: number;
  last7days: number;
  timeStampMs: number;
};

const PlayerStats = ({
  error,
  playerStats,
  countries,
  historyData,
}: {
  error: string;
  playerStats: PlayerStatsType;
  countries: Array<{ id: string; value: number }>;
  historyData: Array<{ y: number; x: string }>;
}) => {
  const pageTitle = `Global Leaderboards Stats - Company of Heroes 3`;
  const keywords = generateKeywordsString([
    "coh3 players stats",
    "player stats",
    "player countries",
    "coh3 players history",
  ]);

  useEffect(() => {
    // AnalyticsStatsLeaderboardsPageView();
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
          <ErrorCard title={"Error getting the player stats"} body={JSON.stringify(error)} />
        ) : (
          <>
            <div style={{ textAlign: "center" }}>
              <Title order={1}>Players Stats</Title>
            </div>
            <Center>
              <Paper shadow="xs" p="md" m={"md"} maw={620}>
                <Group spacing={"xs"}>
                  <IconAlertTriangle size={"1.5rem"} />
                  <Title order={5}>Disclaimer: </Title>
                </Group>
                <Group spacing={"xs"}>
                  <Text fz={"sm"}>
                    We are able to track only players who played &quot;ranked&quot; match in a
                    given day.
                  </Text>
                  <HelperIcon
                    text={
                      <>
                        We track only players who played match in a mode where they are ranked.
                        <br />
                        For example: <br />
                        Player is ranked only in 1v1 Wehrmacht, plays 1v1 match as Wehrmacht - is
                        counted. <br />
                        Player is ranked only in 1v1 Wehrmacht, plays 1v1 match as USF - is not
                        counted. <br />
                        Player is ranked only in 1v1 Wehrmacht, plays 2v2 match as Wehrmacht - is
                        not counted. <br />
                      </>
                    }
                    width={600}
                    position={"bottom"}
                  />
                </Group>
                <Text fz={"sm"}>
                  This doesn&apos;t show the real amount of players who played the game in a given
                  day.
                </Text>
                <Text fz={"sm"}>
                  You can&apos;t compare these numbers with coh2stats numbers, they are tracked
                  differently.
                </Text>
              </Paper>
            </Center>

            <Text fz="md">
              <div
                style={{
                  display: "grid",
                  // gridTemplateColumns: " [col1] 57% [col2] 40%",
                  gridColumnGap: "15px",
                  paddingBottom: "20px",
                }}
              >
                <div style={{ gridColumn: 1, justifySelf: "end" }}>
                  <Group spacing={5}>
                    <>Total amount of tracked players</>{" "}
                    <HelperIcon
                      text={
                        "We can track only players who were ranked at least once in any mode. We are tracking from May 19th 2023."
                      }
                    />
                  </Group>
                </div>
                <div style={{ gridColumn: 2 }}>
                  <Group spacing={4}>
                    <IconUser size={17} />
                    <Text fs={"xl"} fw={500}>
                      {playerStats?.count.toLocaleString()}
                    </Text>
                  </Group>
                </div>
                <div style={{ gridColumn: 1, textAlign: "right" }}>
                  Ranked players in the last &nbsp;&nbsp;30 days
                </div>
                <div style={{ gridColumn: 2 }}>
                  <Group spacing={4}>
                    <IconUser size={17} />
                    <Text fs={"xl"} fw={500}>
                      {playerStats?.last30days.toLocaleString()}
                    </Text>
                  </Group>
                </div>
                <div style={{ gridColumn: 1, textAlign: "right" }}>
                  Ranked players in the last &nbsp;&nbsp;&nbsp;&nbsp;7 days
                </div>
                <div style={{ gridColumn: 2 }}>
                  <Group spacing={4}>
                    <IconUser size={17} />
                    <Text fs={"xl"} fw={500}>
                      {playerStats?.last7days.toLocaleString()}
                    </Text>
                  </Group>
                </div>
                <div style={{ gridColumn: 1, textAlign: "right" }}>
                  Ranked players in the last 24 hours
                </div>
                <div style={{ gridColumn: 2 }}>
                  <Group spacing={4}>
                    <IconUser size={17} />
                    <Text fs={"xl"} fw={500}>
                      {playerStats?.last24hours.toLocaleString()}
                    </Text>
                  </Group>
                </div>
              </div>
            </Text>
            <DynamicGeoWorldMap data={countries} />

            <DynamicPlayersLineChart data={historyData} />
            <Text align={"center"} fs="italic" c="dimmed" fz="sm" pt={25}>
              Data updated on {new Date(playerStats?.timeStampMs).toLocaleString()}.
            </Text>
          </>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({}) => {
  let error = null;
  let playerStats: PlayerStatsType | null = null;
  let countries = null;
  let historyData = null;

  try {
    const docRef = doc(getFirestore(), "stats", "player-stats");
    const docHistoryRef = doc(getFirestore(), "stats", "player-stats-history");
    const [docSnap, docHistorySnap] = await Promise.all([getDoc(docRef), getDoc(docHistoryRef)]);

    if (docSnap.exists()) {
      const playerStatsFirebase = docSnap.data();
      const timeStampMs = playerStatsFirebase.timeStamp.toMillis();

      countries = Object.entries(playerStatsFirebase.countries).map(([key, value]) => ({
        id: key,
        value: value,
      }));

      delete playerStatsFirebase.timeStamp;
      delete playerStatsFirebase.countries;
      playerStats = { ...playerStatsFirebase, ...{ timeStampMs } } as PlayerStatsType;
    }

    if (docHistorySnap.exists()) {
      let historyRawData = docHistorySnap.data();
      historyRawData = historyRawData["history"];

      // Already preparing the chart data
      historyData = Object.values(historyRawData).map((value) => ({
        y: value.count,
        x: dayjs(value.timeStamp.toMillis()).format("YYYY-MM-DD"),
      }));
    }
  } catch (e) {
    console.error(e);
    error = JSON.stringify(e);
  }

  return {
    props: {
      error,
      playerStats,
      countries,
      historyData,
    },
  };
};

export default PlayerStats;
