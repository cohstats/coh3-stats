import { Container, Flex, Group, Select, Space, Text, Title } from "@mantine/core";
import React, { useEffect } from "react";
import { getFactionSide } from "../../../../src/coh3/helpers";
import { localizedGameTypes, localizedNames } from "../../../../src/coh3/coh3-data";
import {
  leaderBoardType,
  leaderBoardTypeArray,
  ProcessedCOHPlayerStats,
  raceType,
  raceTypeArray,
} from "../../../../src/coh3/coh3-types";
import InnerDetailedStats from "./inner-detailed-stats";
import FactionIcon from "../../../../components/faction-icon";
import { TFunction } from "next-i18next";
import { useRouter } from "next/router";

const DetailedStatsTab = ({
  playerStatsData,
  t,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  t: TFunction;
}) => {
  const { push, query } = useRouter();

  // Initialize state from URL query parameters or use defaults
  const factionFromQuery = query.faction as string;
  const typeFromQuery = query.type as string;

  const initialFaction =
    factionFromQuery && raceTypeArray.includes(factionFromQuery as raceType)
      ? (factionFromQuery as raceType)
      : "german";

  const initialGameMode =
    typeFromQuery && leaderBoardTypeArray.includes(typeFromQuery as leaderBoardType)
      ? (typeFromQuery as leaderBoardType)
      : "1v1";

  const [selectedFaction, setSelectedFaction] = React.useState<raceType>(initialFaction);
  const [selectedGameMode, setSelectedGameMode] =
    React.useState<leaderBoardType>(initialGameMode);

  // Update state when URL query parameters change
  useEffect(() => {
    if (factionFromQuery && raceTypeArray.includes(factionFromQuery as raceType)) {
      setSelectedFaction(factionFromQuery as raceType);
    }
    if (typeFromQuery && leaderBoardTypeArray.includes(typeFromQuery as leaderBoardType)) {
      setSelectedGameMode(typeFromQuery as leaderBoardType);
    }
  }, [factionFromQuery, typeFromQuery]);

  const FactionSide = getFactionSide(selectedFaction);

  const selectedStats = playerStatsData?.statGroups[selectedGameMode][selectedFaction] || null;
  const selectedLeaderboardStats =
    playerStatsData?.leaderBoardStats[selectedGameMode][selectedFaction] || null;

  return (
    <>
      <Container fluid p={0} pt={"md"}>
        <Flex gap="md" wrap="wrap" justify="space-between" align="center">
          <Title order={3} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Detailed Statistics for {localizedGameTypes[selectedGameMode]}{" "}
            <FactionIcon name={selectedFaction} width={30} />
          </Title>
          <Group justify="center">
            <Select
              value={selectedFaction}
              label="Faction"
              placeholder={"Select faction"}
              defaultValue={"german"}
              data={Object.entries(localizedNames).map(([key, value]) => ({
                value: key,
                label: value,
              }))}
              onChange={(value) => {
                const newFaction = (value as raceType) || "german";
                setSelectedFaction(newFaction);
                push({ query: { ...query, faction: newFaction } }, undefined, {
                  shallow: true,
                });
              }}
              w={200}
              withCheckIcon={false}
              allowDeselect={false}
            />
            <Select
              value={selectedGameMode}
              label="Game Type"
              placeholder={"Select Game Type"}
              defaultValue={"1v1"}
              data={Object.entries(localizedGameTypes).map(([key, value]) => ({
                value: key,
                label: value,
              }))}
              onChange={(value) => {
                const newGameMode = (value as leaderBoardType) || "1v1";
                setSelectedGameMode(newGameMode);
                push({ query: { ...query, type: newGameMode } }, undefined, {
                  shallow: true,
                });
              }}
              w={120}
              withCheckIcon={false}
              allowDeselect={false}
            />
          </Group>
        </Flex>
        <Space h={"lg"} />
        <InnerDetailedStats
          stats={selectedStats}
          leaderboardStats={selectedLeaderboardStats}
          factionSide={FactionSide}
          t={t}
        />
        <Space h={"lg"} />
        <Space h={"lg"} />
        <Flex justify="center">
          <Text span size={"sm"} c="dimmed" style={{ textAlign: "center" }}>
            Detailed stats are updated every 24 hours. It's possible that some games are not
            included in the stats.
            <br />
            Stats are being calculated from October 2023.
          </Text>
        </Flex>
      </Container>
    </>
  );
};

export default DetailedStatsTab;
