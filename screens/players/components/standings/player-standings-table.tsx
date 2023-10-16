import {
  leaderBoardType,
  platformType,
  raceType,
  RawLeaderboardStat,
} from "../../../../src/coh3/coh3-types";
import { DataTable } from "mantine-datatable";
import { Text, Anchor } from "@mantine/core";

import React from "react";
import Link from "next/link";
import { getLeaderBoardRoute } from "../../../../src/routes";
import DynamicTimeAgo from "../../../../components/other/dynamic-timeago";
import RankIcon from "../../../../components/rank-icon";

const PlayerStandingsTable = ({
  faction,
  data,
  platform,
}: {
  faction: raceType;
  data: Record<"1v1" | "2v2" | "3v3" | "4v4", RawLeaderboardStat | null>;
  platform: platformType;
}) => {
  const dataForTable = [];

  for (const [key, value] of Object.entries(data)) {
    dataForTable.push({ ...value, ...{ type: key } });
  }

  return (
    <>
      <DataTable
        style={{
          flexGrow: 1,
          maxHeight: "inherit",
        }}
        withBorder
        borderRadius="md"
        highlightOnHover
        striped
        verticalSpacing="xs"
        // provide data
        idAccessor={"type"}
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
                  href={getLeaderBoardRoute(
                    faction,
                    type as leaderBoardType,
                    startPosition,
                    platform,
                  )}
                  rel="nofollow"
                  title={"Link to Leaderboard with current player standings"}
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
            title: "Tier",
            accessor: "ranklevel",
            textAlignment: "center",
            render: ({ rank, rating }: any) => {
              return <RankIcon size={28} rank={rank} rating={rating} />;
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
            title: "Last Match",
            textAlignment: "right",
            width: 125,
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
