import { ProcessedMatch } from "../../src/coh3/coh3-types";
import { Container, Flex, Title, Text, Space, Card, Stack } from "@mantine/core";
import { maps, matchTypesAsObject } from "../../src/coh3/coh3-data";
import RenderMap from "../players/tabs/recent-matches-tab/matches-table/render-map";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";
import PlayerMatchesDataTable from "./PlayerMatchesDataTable";
import { IconCalendar, IconStopwatch, IconSwords } from "@tabler/icons-react";
import React from "react";

const DynamicDmgDonePieChart = React.lazy(() => import("./match-charts/dmg-done-pie-chart"));
const DynamicUnitsKilledPieChart = React.lazy(
  () => import("./match-charts/units-killed-pie-chart"),
);
const DynamicVehiclesKilledPieChart = React.lazy(
  () => import("./match-charts/vehicles-killed-pie-chart"),
);
const DynamicCapturedPointsPieChart = React.lazy(
  () => import("./match-charts/captured-points-pie-chart"),
);

const SmallInfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <Card p={10} pt={5} m={10} shadow="sm" withBorder w={200} h={220}>
      <Title order={4} ta="center">
        {title}
      </Title>
      <Space h="xs" />
      {children}
    </Card>
  );
};

export default function Component({ matchData }: { matchData: ProcessedMatch }) {
  const matchtype_id = matchData.matchtype_id;
  const matchType =
    matchTypesAsObject[matchtype_id as number]["localizedName"] ||
    matchTypesAsObject[matchtype_id as number]["name"] ||
    "unknown";

  const mapName = maps[matchData.mapname as keyof typeof maps]?.name || matchData.mapname;

  const axisPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, "axis");
  const alliesPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, "allies");

  return (
    <Container size="fluid" pl={0} pr={0}>
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
            for {getMatchDuration(matchData.startgametime, matchData.completiontime)}{" "}
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
      <Flex justify={"center"} wrap={"wrap"}>
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
      </Flex>
    </Container>
  );
}
