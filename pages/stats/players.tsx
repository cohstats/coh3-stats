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
import { AnalyticsStatsPlayerStatsPageView } from "../../src/firebase/analytics";

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
  const pageTitle = `Ranked Player Stats - Company of Heroes 3`;
  const description = `Overall information about all ranked players in Company of Heroes 3.\nCurrently tracking ${playerStats.count.toLocaleString()} ranked players.`;
  const keywords = generateKeywordsString([
    "coh3 players stats",
    "player stats",
    "player countries",
    "coh3 players history",
  ]);

  useEffect(() => {
    AnalyticsStatsPlayerStatsPageView();
  }, []);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Head>
      <Container size={"md"} p={0}>
        {error ? (
          <ErrorCard title={"Error getting the player stats"} body={JSON.stringify(error)} />
        ) : (
          <>
            <div style={{ textAlign: "center", paddingBottom: 5 }}>
              <Title order={1}>PC Ranked Players Stats</Title>
            </div>

            <Center>
              {" "}
              <Group>
                <Text fz="md">
                  <div
                    style={{
                      display: "grid",
                      // gridTemplateColumns: " [col1] 57% [col2] 40%",
                      gridColumnGap: "15px",
                      // paddingBottom: "20px",
                    }}
                  >
                    <div style={{ gridColumn: 1, justifySelf: "end" }}>
                      <Group spacing={5}>
                        <>Total number of tracked players</>{" "}
                        <HelperIcon
                          text={
                            "We can only track players who have been ranked at least once in any game mode since May 19th, 2023."
                          }
                        />
                      </Group>
                    </div>
                    <div style={{ gridColumn: 2 }}>
                      <Group spacing={4}>
                        <IconUser size={17} />
                        <Text fs={"xl"} fw={500}>
                          {playerStats.count.toLocaleString()}
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
                          {playerStats.last30days.toLocaleString()}
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
                          {playerStats.last7days.toLocaleString()}
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
                          {playerStats.last24hours.toLocaleString()}
                        </Text>
                      </Group>
                    </div>
                  </div>
                </Text>
                <Paper shadow="xs" p="xs" m={"xs"} maw={575}>
                  <Group spacing={"xs"}>
                    <IconAlertTriangle size={"1.5rem"} />
                    <Title order={6}>Disclaimer: </Title>
                  </Group>
                  <Group spacing={"xs"}>
                    <Text fz={"xs"}>
                      We are only able to track players who played &quot;ranked&quot; match in a
                      given day.
                    </Text>
                    <HelperIcon
                      text={
                        <>
                          We only track players who played match in a mode where they are ranked.
                          <br />
                          For example: <br />
                          Player is ranked only in 1v1 Wehrmacht, plays 1v1 match as Wehrmacht -
                          is counted. <br />
                          Player is ranked only in 1v1 Wehrmacht, plays 1v1 match as USF - is not
                          counted. <br />
                          Player is ranked only in 1v1 Wehrmacht, plays 2v2 match as Wehrmacht -
                          is not counted. <br />
                        </>
                      }
                      width={600}
                      position={"bottom"}
                    />
                  </Group>
                  <Text fz={"xs"}>
                    This doesn&apos;t show the real number of players who played the game on a
                    given day.
                  </Text>
                  <Text fz={"xs"}>
                    These numbers can&apos;t be compared with coh2stats numbers, they are tracked differently.
                  </Text>
                </Paper>
              </Group>
            </Center>

            <div style={{ minHeight: "840px" }}>
              <DynamicGeoWorldMap data={countries} />
              <DynamicPlayersLineChart data={historyData} />
            </div>
            <Text align={"center"} fs="italic" c="dimmed" fz="sm" pt={25}>
              Data updated on {dayjs(playerStats.timeStampMs).format("YYYY-MM-DD HH:mm")} UTC
              <br />
              We do not track XBOX and PS players here.
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
        // We subtract 1 day, because the analysis is run in 3 AM, but data are for the previous day
        x: dayjs(value.timeStamp.toMillis()).subtract(1, "day").format("YYYY-MM-DD"),
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
