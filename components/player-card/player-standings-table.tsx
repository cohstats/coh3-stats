import { leaderBoardType, raceType, RawLeaderboardStat } from "../../src/coh3/coh3-types";
import { DataTable } from "mantine-datatable";
import FactionIcon from "../faction-icon";
import { localizedNames } from "../../src/coh3/coh3-data";
import { Space, Group, Text, Title, Anchor } from "@mantine/core";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getLeaderBoardRoute } from "../../src/routes";

// We need to do this because of the SSR. It would have different time while the data reach FE
const DynamicTimeAgo = dynamic(() => import("../internal-timeago"), {
  ssr: false,
  // @ts-ignore
  loading: () => "Calculating...",
});

const PlayerStandingsTable = ({
  faction,
  data,
}: {
  faction: raceType;
  data: Record<"1v1" | "2v2" | "3v3" | "4v4", RawLeaderboardStat | null>;
}) => {
  const dataForTable = [];

  for (const [key, value] of Object.entries(data)) {
    dataForTable.push({ ...value, ...{ type: key } });
  }

  return (
    <>
      <Group>
        <FactionIcon name={faction} width={35} />{" "}
        <Title order={2}>{localizedNames[faction]}</Title>
      </Group>
      <Space h="xs" />

      <DataTable
        withBorder
        borderRadius="md"
        highlightOnHover
        striped
        verticalSpacing="xs"
        // minHeight={300}
        // provide data
        records={dataForTable}
        // define columns
        columns={[
          {
            accessor: "type",
            textAlignment: "center",
          },
          {
            accessor: "rank",
            textAlignment: "center",
            render: ({ rank, type }) => {
              if (!rank || rank < 0) {
                return "-";
              }
              const startPosition = Math.max(rank - 10, 0) + 1;

              return (
                <Anchor
                  component={Link}
                  href={getLeaderBoardRoute(faction, type as leaderBoardType, startPosition)}
                >
                  {rank}
                </Anchor>
              );
            },
          },
          {
            title: "ELO",
            accessor: "rating",
            textAlignment: "center",
            render: ({ rating }) => {
              if (!rating) {
                return "-";
              }

              return rating;
            },
          },
          {
            title: "Level",
            accessor: "ranklevel",
            textAlignment: "center",
            render: ({ ranklevel }) => {
              if (!ranklevel || ranklevel < 0) {
                return "-";
              }

              return ranklevel;
            },
          },
          {
            accessor: "streak",
            // sortable: true,
            textAlignment: "center",
            // @ts-ignore
            render: ({ streak }) => {
              if (!streak) return "-";

              return streak > 0 ? (
                <Text color={"green"}>+{streak}</Text>
              ) : (
                <Text color={"red"}>{streak}</Text>
              );
            },
          },
          {
            accessor: "wins",
            // sortable: true,
            textAlignment: "center",
            render: ({ wins }) => {
              if (!wins) {
                return "-";
              }

              return wins;
            },
          },
          {
            accessor: "losses",
            textAlignment: "center",
            render: ({ losses }) => {
              if (!losses) {
                return "-";
              }

              return losses;
            },
          },
          {
            accessor: "ratio",
            // sortable: true,
            textAlignment: "center",
            render: ({ wins, losses }: any) => {
              if (!wins && !losses) return "-";

              return `${Math.round((wins / (wins + losses)) * 100)}%`;
            },
          },
          {
            accessor: "total",
            // sortable: true,
            textAlignment: "center",
            render: ({ wins, losses }: any) => {
              if (!wins && !losses) return "-";
              return `${wins + losses}`;
            },
          },
          {
            accessor: "lastmatchdate",
            title: "Last Game",
            textAlignment: "right",
            width: 120,
            // @ts-ignore
            render: ({ lastmatchdate }) => {
              if (!lastmatchdate) {
                return "-";
              }
              return <DynamicTimeAgo timestamp={lastmatchdate} />;
            },
          },
        ]}
        // sortStatus={sortStatus}
        // onSortStatusChange={setSortStatus}
      />
    </>
  );
};

export default PlayerStandingsTable;
