import { ProcessedMatch } from "../../src/coh3/coh3-types";
import { Container, Flex, Title, Text, Space, Card, Stack } from "@mantine/core";
import { maps, matchTypesAsObject } from "../../src/coh3/coh3-data";
import RenderMap from "../players/tabs/recent-matches-tab/matches-table/render-map";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";
import PlayerMatchesDataTable from "./PlayerMatchesDataTable";
import { IconCalendar, IconStopwatch, IconSwords, IconVideo } from "@tabler/icons-react";
import React from "react";
import dynamic from "next/dynamic";
import config from "../../config";
import DownloadReplayButton from "../players/tabs/recent-matches-tab/matches-table/download-replay";

const DynamicDmgDonePieChart = dynamic(() => import("./match-charts/dmg-done-pie-chart"), {
  ssr: false,
});
const DynamicUnitsKilledPieChart = dynamic(
  () => import("./match-charts/units-killed-pie-chart"),
  {
    ssr: false,
  },
);
const DynamicVehiclesKilledPieChart = dynamic(
  () => import("./match-charts/vehicles-killed-pie-chart"),
  {
    ssr: false,
  },
);
const DynamicCapturedPointsPieChart = dynamic(
  () => import("./match-charts/captured-points-pie-chart"),
  {
    ssr: false,
  },
);

const SmallInfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <Card
      p={{ base: 5, sm: 10 }}
      pt={{ base: 3, sm: 5 }}
      m={{ base: 5, sm: 10 }}
      shadow="sm"
      withBorder
      w={{ base: 160, sm: 190 }}
      h={{ base: 180, sm: 220 }}
    >
      <Title order={4} ta="center">
        {title}
      </Title>
      <Space h={{ base: "xs", sm: "xs" }} />
      {children}
    </Card>
  );
};

export default function MatchDetail({ matchData }: { matchData: ProcessedMatch | null }) {
  if (!matchData) {
    return <></>;
  }

  const matchtype_id = matchData.matchtype_id;
  const matchType =
    matchTypesAsObject[matchtype_id as number]["localizedName"] ||
    matchTypesAsObject[matchtype_id as number]["name"] ||
    "unknown";

  const mapName = maps[matchData.mapname as keyof typeof maps]?.name || matchData.mapname;

  const axisPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, "axis");
  const alliesPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, "allies");

  return (
    <Container size={config.mainContainerSize} pl={0} pr={0}>
      <Flex justify="space-between" wrap="wrap">
        <Title order={2}>
          Match Detail - {matchType} - {mapName}
        </Title>
        <Stack gap="0">
          <Text size="sm" span>
            Played on {new Date(matchData.startgametime * 1000).toLocaleString()}{" "}
            <IconCalendar size={20} style={{ marginBottom: -3 }} />
          </Text>
          <Text size="sm" span ta="right">
            For {getMatchDuration(matchData.startgametime, matchData.completiontime)}{" "}
            <IconStopwatch size={20} style={{ marginBottom: -3 }} />
          </Text>
        </Stack>
      </Flex>
      <Space h="md" />

      <PlayerMatchesDataTable data={axisPlayers} />
      <Flex justify="center" align="center" my={"xs"}>
        <IconSwords size={30} />
      </Flex>
      <PlayerMatchesDataTable data={alliesPlayers} />
      <Space h="md" />
      <Flex wrap={"wrap"} justify={"center"}>
        <SmallInfoCard title={"Map"}>
          <RenderMap mapName={matchData.mapname as string} width={200} height={140} />
        </SmallInfoCard>
        <SmallInfoCard title={"Damage Done"}>
          <DynamicDmgDonePieChart alliesPlayers={alliesPlayers} axisPlayers={axisPlayers} />
        </SmallInfoCard>
        <SmallInfoCard title={"Units Killed"}>
          <DynamicUnitsKilledPieChart alliesPlayers={alliesPlayers} axisPlayers={axisPlayers} />
        </SmallInfoCard>
        <SmallInfoCard title={"Vehicles Killed"}>
          <DynamicVehiclesKilledPieChart
            alliesPlayers={alliesPlayers}
            axisPlayers={axisPlayers}
          />
        </SmallInfoCard>
        <SmallInfoCard title={"Captured Points"}>
          <DynamicCapturedPointsPieChart
            alliesPlayers={alliesPlayers}
            axisPlayers={axisPlayers}
          />
        </SmallInfoCard>
        <SmallInfoCard title={"Replay"}>
          <Stack align="center" justify="center">
            <IconVideo size={80} />
            <DownloadReplayButton match={matchData} />
          </Stack>
        </SmallInfoCard>
      </Flex>
    </Container>
  );
}
