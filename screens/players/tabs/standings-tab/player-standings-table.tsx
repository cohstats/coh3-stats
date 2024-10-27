import {
  leaderBoardType,
  platformType,
  raceType,
  RawLeaderboardStat,
} from "../../../../src/coh3/coh3-types";
import { DataTable } from "mantine-datatable";
import { Anchor, Stack, Text } from "@mantine/core";

import React from "react";
import Link from "next/link";
import { getLeaderBoardRoute } from "../../../../src/routes";
import DynamicTimeAgo from "../../../../components/other/dynamic-timeago";
import RankIcon from "../../../../components/rank-icon";
import HelperIcon from "../../../../components/icon/helper";
import { IconArrowBigDown, IconArrowBigUp } from "@tabler/icons-react";

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
            render: ({ rank, type, highestrank }) => {
              const rankElement = (() => {
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
              })();

              return (
                <Stack gap={0}>
                  {rankElement}
                  {highestrank > 0 && (
                    <Text size={"xs"} c="dimmed">
                      Best {highestrank}
                    </Text>
                  )}
                </Stack>
              );
            },
            footer: (
              <>
                <Text size={"xs"} c="dimmed">
                  <IconArrowBigDown size={19} style={{ marginBottom: -4 }} />
                  <HelperIcon
                    text={
                      "Best Rank Achieved. Lower is better. The best Rank the player ever had. "
                    }
                  />
                </Text>
              </>
            ),
          },
          {
            title: "ELO",
            accessor: "rating",
            textAlign: "center",
            render: ({ rating, highestrating }) => {
              if (!rating) {
                return "-";
              }

              return (
                <Stack gap={0}>
                  <span>{rating}</span>
                  {highestrating > 0 && (
                    <Text size={"xs"} c="dimmed">
                      Best {highestrating > rating ? highestrating : rating}
                    </Text>
                  )}
                </Stack>
              );
            },
            footer: (
              <>
                <Text size={"xs"} c="dimmed">
                  <IconArrowBigUp size={19} style={{ marginBottom: -3 }} />
                  <HelperIcon
                    text={
                      "Best ELO Achieved. Higher is better. The best ELO the player ever had. "
                    }
                  />
                </Text>
              </>
            ),
          },
          {
            title: "Tier",
            accessor: "ranklevel",
            textAlign: "center",
            render: ({ rank, rating }: any) => {
              return <RankIcon size={31} rank={rank} rating={rating} />;
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
            textAlign: "center",
            render: ({ wins }) => {
              if (!wins) {
                return "-";
              }

              return wins;
            },
            footer: (
              <>
                {(() => {
                  const totalWins = Object.values(data).reduce((acc, cur) => {
                    return acc + (cur?.wins || 0);
                  }, 0);
                  return totalWins === 0 ? "-" : totalWins;
                })()}
              </>
            ),
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
            footer: (
              <>
                {(() => {
                  const totalLosses = Object.values(data).reduce((acc, cur) => {
                    return acc + (cur?.losses || 0);
                  }, 0);
                  return totalLosses === 0 ? "-" : totalLosses;
                })()}
              </>
            ),
          },
          {
            accessor: "ratio",
            // sortable: true,
            textAlign: "center",
            render: ({ wins, losses }: any) => {
              if (!wins && !losses) return "-";

              return `${Math.round((wins / (wins + losses)) * 100)}%`;
            },
            footer: (
              <>
                {(() => {
                  const totalWins = Object.values(data).reduce((acc, cur) => {
                    return acc + (cur?.wins || 0);
                  }, 0);
                  const totalGames = Object.values(data).reduce((acc, cur) => {
                    return acc + ((cur?.wins || 0) + (cur?.losses || 0));
                  }, 0);
                  return totalGames === 0
                    ? "-"
                    : `${Math.round((totalWins / totalGames) * 100)}%`;
                })()}
              </>
            ),
          },
          {
            accessor: "total",
            // sortable: true,
            textAlign: "center",
            render: ({ wins, losses }: any) => {
              if (!wins && !losses) return "-";
              return `${wins + losses}`;
            },
            footer: (
              <>
                {(() => {
                  const totalMatches = Object.values(data).reduce((acc, cur) => {
                    return acc + ((cur?.wins || 0) + (cur?.losses || 0));
                  }, 0);
                  return totalMatches === 0 ? "-" : totalMatches;
                })()}
              </>
            ),
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
            footer: (
              <>
                <DynamicTimeAgo
                  timestamp={Object.values(data).reduce((acc, cur) => {
                    return acc > (cur?.lastmatchdate || 0) ? acc : cur?.lastmatchdate || 0;
                  }, 0)}
                />
              </>
            ),
          },
        ]}
        // sortStatus={sortStatus}
        // onSortStatusChange={setSortStatus}
      />
    </>
  );
};

export default PlayerStandingsTable;
