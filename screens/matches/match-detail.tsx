import { ProcessedMatch } from "../../src/coh3/coh3-types";
import { Container, Flex, Title, Text, Space, Card } from "@mantine/core";
import { maps, matchTypesAsObject } from "../../src/coh3/coh3-data";
import RenderMap from "../players/tabs/recent-matches-tab/matches-table/render-map";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";
import PlayerMatchesDataTable from "./PlayerMatchesDataTable";
import { IconSwords } from "@tabler/icons-react";
import React from "react";

const SmallInfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <Card p={10} m={10} shadow="sm" withBorder>
      <Title order={4}>{title}</Title>
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
      <Title order={2}>
        Match Detail - {matchType} - {mapName}
      </Title>
      <Text size="sm">
        Played on {new Date(matchData.startgametime * 1000).toLocaleString()} for{" "}
        {getMatchDuration(matchData.startgametime, matchData.completiontime)}
      </Text>
      <Space h="md" />

      <PlayerMatchesDataTable data={axisPlayers} />
      <Flex justify="center" align="center" my={"xs"}>
        <IconSwords size={30} />
      </Flex>
      <PlayerMatchesDataTable data={alliesPlayers} />
      <SmallInfoCard title={"Map"}>
        <RenderMap mapName={matchData.mapname as string} />
      </SmallInfoCard>
    </Container>
  );
}
