import React, { useState } from "react";
import { DataTable } from "mantine-datatable";
import { Stack, Title, Group, Text, Button, Badge, Switch, Flex } from "@mantine/core";
import DynamicTimeAgo from "../../../../components/other/dynamic-timeago";

import { PlayerReport, ProcessedMatch, raceID } from "../../../../src/coh3/coh3-types";
import { raceIDs } from "../../../../src/coh3/coh3-data";
import RenderMap from "../recent-matches-tab/matches-table/render-map";
import RenderPlayers from "../recent-matches-tab/matches-table/render-players";
import { getMatchPlayersByFaction } from "../../../../src/coh3/helpers";
import FactionIcon from "../../../../components/faction-icon";
import { getPlayerMatchHistoryResult } from "../../../../src/players/utils";
import { IconEyePlus, IconInfoCircle } from "@tabler/icons-react";
import HelperIcon from "../../../../components/icon/helper";
import DownloadReplayButton from "../recent-matches-tab/matches-table/download-replay";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import MatchDetailDrawer from "../recent-matches-tab/match-detail-drawer";

interface TeamMatchesTableProps {
  matches: Array<
    ProcessedMatch & {
      w: boolean;
      eloChange: number;
      enemyElo: number;
      ts: number;
    }
  >;
  title: string;
  isLoadingMore: boolean;
  profileID: string;
}

const TeamMatchesTable = ({
  matches,
  title,
  isLoadingMore,
  profileID,
}: TeamMatchesTableProps) => {
  const [showCountryFlag, setShowCountryFlag] = useLocalStorage({
    key: "show-country-flag-matches",
    defaultValue: "false",
  });

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMatchRecord, setSelectedMatchRecord] = useState<ProcessedMatch | null>(null);
  return (
    <>
      <MatchDetailDrawer
        selectedMatchRecord={selectedMatchRecord}
        opened={opened}
        onClose={close}
      />
      <Stack gap={"xs"}>
        <Group justify="space-between">
          <Title order={4}>{title}</Title>
          <Switch
            checked={showCountryFlag === "true"}
            onChange={(event) => {
              setShowCountryFlag(`${event.currentTarget.checked}`);
            }}
            label="Show Player Flags"
            size="sm"
          />
        </Group>
        <Flex justify={"space-between"} pb={"xs"}>
          <Group gap={5} wrap={"nowrap"}>
            <IconInfoCircle size={18} />
            <Text span size={"sm"}>
              Click on the row for more details
            </Text>
          </Group>
        </Flex>
        <DataTable
          withTableBorder
          borderRadius="md"
          highlightOnHover
          verticalSpacing={5}
          horizontalSpacing={5}
          idAccessor={"id"}
          records={matches}
          minHeight={400}
          fetching={isLoadingMore}
          striped
          noRecordsText={"No match history available"}
          onRowClick={({ record, event }) => {
            if (event.target instanceof Element) {
              const clickedElement = event.target as Element;
              const isClickableElement = clickedElement.closest(
                "a, button, img, .mantine-Button-root",
              );

              if (isClickableElement) {
                // If it's a clickable element, don't open the drawer
                return;
              }
            }

            setSelectedMatchRecord(record as unknown as ProcessedMatch);
            open();
          }}
          columns={[
            {
              title: "Played",
              accessor: "played",
              textAlign: "center",
              width: 120,
              render: (record) => {
                const player = getPlayerMatchHistoryResult(
                  record as unknown as ProcessedMatch,
                  profileID,
                );
                return (
                  <>
                    <div>
                      <FactionIcon name={raceIDs[player?.race_id as raceID]} width={50} />
                    </div>
                    <DynamicTimeAgo timestamp={record.ts as number} />
                  </>
                );
              },
            },
            {
              title: (
                <Group gap="xs" justify="center">
                  <Text fw="bold">Result</Text>
                  <HelperIcon text="This shows TEAM ELO change tracked by COH3 Stats, this is different ELO then player standings ELO. COH3 Stats ELO is not used for matchmaking." />
                </Group>
              ),
              accessor: "result",
              textAlign: "center",
              width: 120,
              render: (match) => {
                if (match.w === undefined) return "-";

                const isVictory = match.w;
                const eloChange = match.eloChange;

                return (
                  <Badge color={isVictory ? "blue" : "red"} variant="filled" w={"16ch"}>
                    {isVictory
                      ? `VICTORY ${eloChange !== undefined ? (eloChange > 0 ? `+${eloChange}` : eloChange) : ""}`
                      : `DEFEAT ${eloChange !== undefined ? (eloChange > 0 ? `+${eloChange}` : eloChange) : ""}`}
                  </Badge>
                );
              },
            },
            {
              title: "Enemy ELO",
              accessor: "enemyElo",
              textAlign: "center",
              width: 100,
              render: (match) => {
                if (match.enemyElo === undefined) return "-";

                return Math.round(match.enemyElo);
              },
            },
            {
              title: (
                <Group gap="xs" justify="left">
                  <Text fw="bold">Axis Players</Text>
                  <HelperIcon text="The ELO showned here is the individual player standing ELO in the particular mode and faction." />
                </Group>
              ),
              accessor: "axis_players",
              textAlign: "left",
              width: "30%",
              render: (match) => {
                if (!match.matchhistoryreportresults) return "-";

                const axisPlayers = getMatchPlayersByFaction(
                  match.matchhistoryreportresults as PlayerReport[],
                  "axis",
                );

                return (
                  <RenderPlayers
                    playerReports={axisPlayers}
                    profileID={""} // No specific profile to highlight
                    matchType={match.matchtype_id as number}
                    renderFlag={showCountryFlag === "true"}
                  />
                );
              },
            },
            {
              title: (
                <Group gap="xs" justify="left">
                  <Text fw="bold">Allies Players</Text>
                  <HelperIcon text="The ELO showned here is the individual player standing ELO in the particular mode and faction." />
                </Group>
              ),
              accessor: "allies_players",
              textAlign: "left",
              width: "30%",
              render: (match) => {
                if (!match.matchhistoryreportresults) return "-";

                const alliesPlayers = getMatchPlayersByFaction(
                  match.matchhistoryreportresults as PlayerReport[],
                  "allies",
                );

                return (
                  <RenderPlayers
                    playerReports={alliesPlayers}
                    profileID={""} // No specific profile to highlight
                    matchType={match.matchtype_id as number}
                    renderFlag={showCountryFlag === "true"}
                  />
                );
              },
            },
            {
              title: "Map",
              accessor: "mapname",
              textAlign: "center",
              width: 150,
              render: (match) => {
                if (!match.mapname) return "-";

                return <RenderMap mapName={match.mapname} />;
              },
            },

            {
              title: "",
              accessor: "actions",
              textAlign: "center",
              render: (match) => (
                <Stack gap={"xs"}>
                  <Button
                    variant="default"
                    size="compact-md"
                    leftSection={<IconEyePlus size={18} />}
                    onClick={() => {
                      setSelectedMatchRecord(match as unknown as ProcessedMatch);
                      open();
                    }}
                  >
                    Details
                  </Button>
                  <DownloadReplayButton match={match as unknown as ProcessedMatch} />
                </Stack>
              ),
            },
          ]}
        />
      </Stack>
    </>
  );
};

export default TeamMatchesTable;
