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
        withTableBorder={true}
        borderRadius="md"
        highlightOnHover
        striped
        verticalSpacing={5}
        // provide data
        idAccessor={"type"}
        records={dataForTable}
        // define columns
        columns={[
          {
            accessor: "type",
            textAlign: "center",
          },
          {
            accessor: "rank",
            textAlign: "center",
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
            textAlign: "center",
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
            textAlign: "center",
            render: ({ rank, rating }: any) => {
              return <RankIcon size={28} rank={rank} rating={rating} />;
            },
          },
          {
            accessor: "streak",
            // sortable: true,
            textAlign: "center",
            // @ts-ignore
            render: ({ streak }) => {
              if (!streak) return "-";

              return streak > 0 ? (
                <Text span c={"green"}>
                  +{streak}
                </Text>
              ) : (
                <Text span c={"red"}>
                  {streak}
                </Text>
              );
            },
          },
          {
            accessor: "wins",
            // sortable: true,
            textAlign: "center",
            render: ({ wins }) => {
              if (!wins) {
                return "-";
              }

              return wins;
            },
          },
          {
            accessor: "losses",
            textAlign: "center",
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
            textAlign: "center",
            render: ({ wins, losses }: any) => {
              if (!wins && !losses) return "-";

              return `${Math.round((wins / (wins + losses)) * 100)}%`;
            },
          },
          {
            accessor: "total",
            // sortable: true,
            textAlign: "center",
            render: ({ wins, losses }: any) => {
              if (!wins && !losses) return "-";
              return `${wins + losses}`;
            },
          },
          {
            accessor: "lastmatchdate",
            title: "Last Match",
            textAlign: "right",
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
