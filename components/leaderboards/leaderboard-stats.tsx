import { leaderBoardType, raceType } from "../../src/coh3/coh3-types";
import { DataTable } from "mantine-datatable";
import { Container, Group, Space, Text, Title } from "@mantine/core";
import FactionIcon from "../faction-icon";
import { localizedNames } from "../../src/coh3/coh3-data";
import React from "react";
import { LeaderboardStatsType } from "../../src/leaderboards/stats";

interface Row {
  "1v1": number;
  "2v2": number;
  "3v3": number;
  "4v4": number;
  race: string;
  "1v1-max"?: boolean;
  "1v1-min"?: boolean;
  "2v2-max"?: boolean;
  "2v2-min"?: boolean;
  "3v3-max"?: boolean;
  "3v3-min"?: boolean;
  "4v4-max"?: boolean;
  "4v4-min"?: boolean;
}

const convertForTable = (data: Record<raceType, Record<leaderBoardType, number>>) => {
  const rows: Row[] = [];
  for (const [race, value] of Object.entries(data)) {
    rows.push({ ...{ race }, ...value });
  }

  const getMaxMin = (rows: any[], key: string) => {
    const values = rows.map((row) => row[key]);
    return {
      max: Math.max(...values),
      min: Math.min(...values),
    };
  };

  const keys = ["1v1", "2v2", "3v3", "4v4"];
  const maxMinMap = keys.reduce<{
    [key: string]: {
      max: number;
      min: number;
    };
  }>((acc, key) => {
    acc[key] = getMaxMin(rows, key);
    return acc;
  }, {});

  rows.forEach((row) => {
    keys.forEach((key) => {
      if (["1v1", "2v2", "3v3", "4v4"].includes(key)) {
        const rowKey = key as keyof Row;
        if (row[rowKey] === maxMinMap[key].max) {
          row[
            `${key}-max` as
              | "1v1-max"
              | "1v1-min"
              | "2v2-max"
              | "2v2-min"
              | "3v3-max"
              | "3v3-min"
              | "4v4-max"
              | "4v4-min"
          ] = true;
        }
        if (row[rowKey] === maxMinMap[key].min) {
          row[
            `${key}-min` as
              | "1v1-max"
              | "1v1-min"
              | "2v2-max"
              | "2v2-min"
              | "3v3-max"
              | "3v3-min"
              | "4v4-max"
              | "4v4-min"
          ] = true;
        }
      }
    });
  });

  // rows.push({
  //   ...{ race: "Summary" },
  //   ...{ "1v1": rows.reduce((acc, cur) => acc + cur["1v1"], 0) },
  //   ...{ "2v2": rows.reduce((acc, cur) => acc + cur["2v2"], 0) },
  //   ...{ "3v3": rows.reduce((acc, cur) => acc + cur["3v3"], 0) },
  //   ...{ "4v4": rows.reduce((acc, cur) => acc + cur["4v4"], 0) },
  // });

  return rows;
};

const StatsTable = ({ data }: { data: Record<raceType, Record<leaderBoardType, number>> }) => {
  return (
    <DataTable
      records={convertForTable(data)}
      idAccessor={"race"}
      columns={[
        {
          accessor: "race",
          textAlignment: "center",
          width: 200,
          title: "",
          render: (value) => {
            return (
              <Group spacing={"xs"}>
                <FactionIcon width={22} name={value.race as raceType} />
                <>{localizedNames[value.race as raceType]}</>
              </Group>
            );
          },
        },
        {
          accessor: "1v1",
          textAlignment: "center",
          title: "1 vs 1",
          render: (value) => {
            if (value["1v1-max"]) {
              return <Text color={"green"}>{value["1v1"]} </Text>;
            }
            if (value["1v1-min"]) {
              return <Text color={"red"}>{value["1v1"]} </Text>;
            }
            return <>{value["1v1"]}</>;
          },
        },
        {
          accessor: "2v2",
          textAlignment: "center",
          title: "2 vs 2",
          render: (value) => {
            if (value["2v2-max"]) {
              return <Text color={"green"}>{value["2v2"]} </Text>;
            }
            if (value["2v2-min"]) {
              return <Text color={"red"}>{value["2v2"]} </Text>;
            }
            return <>{value["2v2"]}</>;
          },
        },
        {
          accessor: "3v3",
          textAlignment: "center",
          title: "3 vs 3",
          render: (value) => {
            if (value["3v3-max"]) {
              return <Text color={"green"}>{value["3v3"]} </Text>;
            }
            if (value["3v3-min"]) {
              return <Text color={"red"}>{value["3v3"]} </Text>;
            }
            return <>{value["3v3"]}</>;
          },
        },
        {
          accessor: "4v4",
          textAlignment: "center",
          title: "4 vs 4",
          render: (value) => {
            if (value["4v4-max"]) {
              return <Text color={"green"}>{value["4v4"]} </Text>;
            }
            if (value["4v4-min"]) {
              return <Text color={"red"}>{value["4v4"]} </Text>;
            }
            return <>{value["4v4"]}</>;
          },
        },
      ]}
    />
  );
};

const LeaderBoardStats = ({ leaderBoardStats }: { leaderBoardStats: LeaderboardStatsType }) => {
  return (
    <Container size={"sm"}>
      <Title order={2}>Amount of players in leaderboards</Title>
      <StatsTable data={leaderBoardStats.totalPlayers} />
      <Text color={"dimmed"} fs="italic" pl={5} fz={"sm"}>
        * Keep in mind that one player is usually ranked in more modes. You can&apos;t sum up all
        numbers.{" "}
      </Text>
      <Space h={"xl"} />
      <Title order={2}>Players with level 16 - 20</Title>
      <StatsTable data={leaderBoardStats.topLevelPlayers} />
      <Space h={"xl"} />
      <Title order={2}>Highest ELO</Title>
      <StatsTable data={leaderBoardStats.topElo} />
    </Container>
  );
};

export default LeaderBoardStats;
