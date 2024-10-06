import { PlayerReport, ProcessedMatch } from "../../src/coh3/coh3-types";
import { IconBulb } from "@tabler/icons-react";
import { Container, Flex, Group, Title, Text } from "@mantine/core";
import { matchTypesAsObject } from "../../src/coh3/coh3-data";
import RenderMap from "../players/tabs/recent-matches-tab/matches-table/render-map";
import { getMatchPlayersByFaction } from "../../src/coh3/helpers";
import { DataTable } from "mantine-datatable";

const parseCounters = (counter: string, key: string) => {
  try {
    const counters = JSON.parse(counter);
    return counters[key] !== undefined ? counters[key] : "N/A";
  } catch (error) {
    return "N/A";
  }
};

const MatchDetail = ({ matchData }: { matchData: ProcessedMatch }) => {
  const matchtype_id = matchData.matchtype_id;
  const matchType =
    matchTypesAsObject[matchtype_id as number]["localizedName"] ||
    matchTypesAsObject[matchtype_id as number]["name"] ||
    "unknown";

  const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const axisPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, "axis");
  const alliesPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, "allies");
  const matchDuration = matchData.completiontime - matchData.startgametime;
  const matchDurationFormatted = formatDuration(matchDuration);

  return (
    <Container>
      <Group>
        <Flex justify="space-between" align="center" direction="row">
          <Flex direction="column">
            <Title order={2}>Match Detail - {matchData.mapname}</Title>
            <Group align="center" mt="xs">
              <IconBulb size={20} />
              <Text size="sm">
                Click on the row to show players' Commanders and Bulletins in this match
              </Text>
            </Group>
          </Flex>
          <Flex direction="row">
            <Flex direction="column" align="flex-start" ml="lg" mr="sm">
              <Text size="sm">
                <strong>Match Type:</strong> {matchType}
              </Text>
              <Text size="sm">
                <strong>Map:</strong> {matchData.mapname}
              </Text>
              <Text size="sm">
                <strong>Match Duration:</strong> {matchDurationFormatted}
              </Text>
            </Flex>
            <RenderMap mapName={matchData.mapname as string} renderTitle={false} />
          </Flex>
        </Flex>

        <DataTable
          records={axisPlayers}
          rowStyle={() => ({
            backgroundColor: "#D1E4D0",
            color: "black",
          })}
          rowBackgroundColor={() => "#D1E4D0"}
          highlightOnHover
          styles={{
            root: {
              overflow: "hidden",

              // borderCollapse: "collapse",
            },
            header: {
              backgroundColor: "#f5f5f5", // header background color
              color: "black", // header text color
              padding: "8px", // header padding
              textAlign: "left", // left-align header text
              // borderBottom: "2px solid #ddd", // bottom border for header
            },
          }}
          columns={[
            {
              accessor: "playerName",
              title: "Player",
              textAlign: "left",
              width: "50%",
              render: (record: PlayerReport) => <Text>{record.profile_id}</Text>,
            },
            {
              accessor: "counters",
              title: "Damage Done",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "dmgdone")}</Text>,
            },
            {
              accessor: "ekills",
              title: "Units Killed",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "ekills")}</Text>,
            },
            {
              accessor: "edeaths",
              title: "Units Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "edeaths")}</Text>,
            },
            {
              accessor: "kd_ratio",
              title: "K/D",
              textAlign: "left",
              render: (record) => {
                const kills = parseCounters(record.counters, "ekills");
                const deaths = parseCounters(record.counters, "edeaths");
                return <Text>{deaths !== "0" ? (kills / deaths).toFixed(2) : "N/A"}</Text>;
              },
            },
            {
              accessor: "sqkilled",
              title: "Squads Killed",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "sqkilled")}</Text>,
            },
            {
              accessor: "sqprod",
              title: "Squads Made",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "sqprod")}</Text>,
            },
            {
              accessor: "sqlost",
              title: "Squads Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "sqlost")}</Text>,
            },
            {
              accessor: "vkill",
              title: "Vehicles Killed",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "vkill")}</Text>,
            },
            {
              accessor: "vprod",
              title: "Vehicles Prod",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "vprod")}</Text>,
            },
            {
              accessor: "vlost",
              title: "Vehicles Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "vlost")}</Text>,
            },
            {
              accessor: "pcap",
              title: "Points Captured",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "pcap")}</Text>,
            },
            {
              accessor: "plost",
              title: "Points Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "plost")}</Text>,
            },
            {
              accessor: "precap",
              title: "Points Recaptured",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "precap")}</Text>,
            },
            {
              accessor: "totalcmds",
              title: "Total Commands",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "totalcmds")}</Text>,
            },
            {
              accessor: "abil",
              title: "Abilities Used",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "abil")}</Text>,
            },
          ]}
        />

        <DataTable
          records={alliesPlayers}
          columns={[
            {
              accessor: "playerName",
              title: "Player",
              textAlign: "left",
              width: "50%",
              render: (record: PlayerReport) => <Text>{record.profile_id}</Text>,
            },
            {
              accessor: "counters",
              title: "Damage Done",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "dmgdone")}</Text>,
            },
            {
              accessor: "ekills",
              title: "Units Killed",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "ekills")}</Text>,
            },
            {
              accessor: "edeaths",
              title: "Units Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "edeaths")}</Text>,
            },
            {
              accessor: "kd_ratio",
              title: "K/D",
              textAlign: "left",
              render: (record) => {
                const kills = parseCounters(record.counters, "ekills");
                const deaths = parseCounters(record.counters, "edeaths");
                return <Text>{deaths !== "0" ? (kills / deaths).toFixed(2) : "N/A"}</Text>;
              },
            },
            {
              accessor: "sqkilled",
              title: "Squads Killed",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "sqkilled")}</Text>,
            },
            {
              accessor: "sqprod",
              title: "Squads Made",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "sqprod")}</Text>,
            },
            {
              accessor: "sqlost",
              title: "Squads Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "sqlost")}</Text>,
            },
            {
              accessor: "vkill",
              title: "Vehicles Killed",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "vkill")}</Text>,
            },
            {
              accessor: "vprod",
              title: "Vehicles Prod",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "vprod")}</Text>,
            },
            {
              accessor: "vlost",
              title: "Vehicles Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "vlost")}</Text>,
            },
            {
              accessor: "pcap",
              title: "Points Captured",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "pcap")}</Text>,
            },
            {
              accessor: "plost",
              title: "Points Lost",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "plost")}</Text>,
            },
            {
              accessor: "precap",
              title: "Points Recaptured",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "precap")}</Text>,
            },
            {
              accessor: "totalcmds",
              title: "Total Commands",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "totalcmds")}</Text>,
            },
            {
              accessor: "abil",
              title: "Abilities Used",
              textAlign: "left",
              render: (record) => <Text>{parseCounters(record.counters, "abil")}</Text>,
            },
          ]}
        />
      </Group>
    </Container>
  );
};

export default MatchDetail;
