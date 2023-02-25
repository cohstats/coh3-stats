import React, { useEffect, useState } from "react";
import { Text, Anchor, Container } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import { format } from "timeago.js";

interface StatGroupMember {
  profile_id: number;
  name: string;
  alias: string;
  personal_statgroup_id: number;
  xp: number;
  level: number;
  leaderboardregion_id: number;
  country: string;
}

interface StatGroup {
  id: number;
  name: string;
  type: number;
  members: StatGroupMember[];
}

interface LeaderboardStat {
  statgroup_id: number;
  leaderboard_id: number;
  wins: number;
  losses: number;
  streak: number;
  disputes: number;
  drops: number;
  rank: number;
  ranktotal: number;
  ranklevel: number;
  regionrank: number;
  regionranktotal: number;
  lastmatchdate: number;
}

interface LeaderboardResponse {
  result: {
    code: number;
    message: string;
  };
  statGroups: StatGroup[];
  leaderboardStats: LeaderboardStat[];
  rankTotal: number;
}

interface TableData {
  rank: number;
  level: number;
  members: StatGroupMember[];
  streak: number;
  wins: number;
  losses: number;
  ratio: number;
  total: number;
  drops: number;
  disputes: number;
  lastmatchdate: number;
}

const convertSteamNameToID = (name: string): string => {
  const res = name.match(/\/steam\/(\d+)/);

  return res !== null ? res[1] : "";
};

const leaderboardResponseToTableData = (response: LeaderboardResponse): TableData[] => {
  const { leaderboardStats, statGroups } = response;

  const tableData: TableData[] = leaderboardStats.map((leaderboardStat) => {
    const matchingGroup = statGroups.find(
      (statGroup) => statGroup.id === leaderboardStat.statgroup_id,
    );

    return {
      members: matchingGroup ? matchingGroup.members : [],
      disputes: leaderboardStat.disputes,
      drops: leaderboardStat.drops,
      lastmatchdate: leaderboardStat.lastmatchdate,
      level: leaderboardStat.ranklevel,
      losses: leaderboardStat.losses,
      rank: leaderboardStat.rank,
      ratio: Math.round(
        100 * Number(leaderboardStat.wins / (leaderboardStat.losses + leaderboardStat.wins)),
      ),
      streak: leaderboardStat.streak,
      total: leaderboardStat.losses + leaderboardStat.wins,
      wins: leaderboardStat.wins,
    };
  });

  return tableData;
};

const Old_leaderboards: React.FC = () => {
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "",
    direction: "asc",
  });
  const [data, setData] = useState<TableData[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    (async () => {
      try {
        const response = await fetch(
          `https://us-east4-coh2-ladders-prod.cloudfunctions.net/getCOHLaddersHttp?leaderBoardID=4&start=0`,
        );
        const leaderboardResponse = await response.json();
        const leaderboardTableData = leaderboardResponseToTableData(leaderboardResponse);
        setData(leaderboardTableData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const sortedData = sortBy(data, sortStatus.columnAccessor);
    const directedData = sortStatus.direction === "asc" ? sortedData.reverse() : sortedData;

    setData(directedData);
  }, [sortStatus]);

  return (
    <Container fluid={true}>
      <DataTable
        withBorder
        borderRadius="md"
        highlightOnHover
        verticalSpacing="md"
        minHeight={300}
        // provide data
        records={data || []}
        // define columns
        fetching={isLoading}
        columns={[
          {
            accessor: "rank",
            sortable: true,
            textAlignment: "center",
          },
          {
            accessor: "level",
            textAlignment: "center",
          },
          {
            accessor: "change",
            textAlignment: "center",
          },
          {
            accessor: "alias",
            render: ({ members }) => {
              const NameAnchors = members.map((member) => {
                const { name, alias } = member;
                const steamId = convertSteamNameToID(name);
                const path = `/players/${steamId}`;

                return (
                  <Anchor key={member.profile_id} href={path}>
                    {alias}
                  </Anchor>
                );
              });

              return NameAnchors;
            },
          },
          {
            accessor: "streak",
            sortable: true,
            textAlignment: "center",
            render: ({ streak }) => {
              return streak > 0 ? (
                <Text color={"green"}>+{streak}</Text>
              ) : (
                <Text color={"red"}>{streak}</Text>
              );
            },
          },
          {
            accessor: "wins",
            sortable: true,
            textAlignment: "center",
          },
          {
            accessor: "losses",
            sortable: true,
            textAlignment: "center",
          },
          {
            accessor: "ratio",
            sortable: true,
            textAlignment: "center",
            render: ({ ratio }) => {
              return `${ratio}%`;
            },
          },
          {
            accessor: "total",
            sortable: true,
            textAlignment: "center",
          },
          {
            accessor: "drops",
            sortable: true,
            textAlignment: "center",
          },
          {
            accessor: "disputes",
            sortable: true,
            textAlignment: "center",
          },
          {
            accessor: "lastmatchdate",
            title: "Last Game",
            sortable: true,
            textAlignment: "right",
            render: ({ lastmatchdate }) => {
              return <Text>{format(lastmatchdate * 1000)}</Text>;
            },
          },
        ]}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />
    </Container>
  );
};

export default Old_leaderboards;
