import { DataTable } from "mantine-datatable";
import ErrorCard from "../error-card";
import { Anchor, Group, Text, rem } from "@mantine/core";
import CountryFlag from "../country-flag";
import DynamicTimeAgo from "../other/dynamic-timeago";
import Link from "next/link";
import React from "react";
import { Top1v1LeaderboardsData } from "../../src/coh3/coh3-types";

interface Props {
  leaderBoardData: Top1v1LeaderboardsData | null;
  loading: boolean;
  error: any;
}

const TopLeaderboardsTable = ({ leaderBoardData, loading, error }: Props) => {
  if (error) {
    return <ErrorCard title={"Error getting the leaderboards"} body={JSON.stringify(error)} />;
  } else {
    return (
      <div>
        <DataTable
          highlightOnHover
          striped={true}
          // striped
          // Make it little bit more compact for the front page
          verticalSpacing={5}
          fz={rem("0.875rem")}
          minHeight={300}
          // provide data
          idAccessor={"statgroup_id"}
          records={leaderBoardData?.data || []}
          fetching={loading}
          // define columns
          columns={[
            {
              accessor: "rank",
              textAlign: "center",
            },
            {
              title: "RC",
              accessor: "change",
              textAlign: "center",
              render: ({ change }: { change: number | string }) => {
                if (typeof change === "string") {
                  return change;
                } else {
                  return change > 0 ? (
                    <Text c={"green"} inherit>
                      +{change}
                    </Text>
                  ) : change < 0 ? (
                    <Text c={"red"} inherit>
                      {change}
                    </Text>
                  ) : (
                    <></>
                  );
                }
              },
            },
            {
              title: "ELO",
              accessor: "rating",
              textAlign: "center",
            },
            {
              accessor: "alias",
              width: "100%",
              // @ts-ignore
              render: ({ members }) => {
                return members.map((member: any) => {
                  const { alias, profile_id, country } = member;
                  const path = `/players/${profile_id}`;

                  return (
                    <Anchor key={profile_id} component={Link} href={path} inherit>
                      <Group gap="xs">
                        <CountryFlag countryCode={country} />
                        {alias}
                      </Group>
                    </Anchor>
                  );
                });
              },
            },
            {
              accessor: "streak",
              // sortable: true,
              textAlign: "center",
              // @ts-ignore
              render: ({ streak }) =>
                streak > 0 ? (
                  <Text c={"green"} inherit>
                    +{streak}
                  </Text>
                ) : (
                  <Text c={"red"} inherit>
                    {streak}
                  </Text>
                ),
            },
            // // Hide this when we need to make the table shorter
            // {
            //   accessor: "wins",
            //   textAlign: "center",
            // },
            // // Hide this when we need to make the table shorter
            // {
            //   accessor: "losses",
            //   textAlign: "center",
            // },
            {
              accessor: "ratio",
              textAlign: "center",
              render: ({ wins, losses }: any) => {
                return `${Math.round((wins / (wins + losses)) * 100)}%`;
              },
            },
            {
              accessor: "total",
              // sortable: true,
              textAlign: "right",
              render: ({ wins, losses }: any) => {
                return `${wins + losses}`;
              },
            },
            // // {
            // //     accessor: "drops",
            // //     sortable: true,
            // //     textAlign: "center",
            // // },
            // // {
            // //     accessor: "disputes",
            // //     sortable: true,
            // //     textAlign: "center",
            // // },
            {
              accessor: "lastmatchdate",
              title: "Last Game",
              textAlign: "right",
              width: 120,
              // @ts-ignore
              render: ({ lastmatchdate }) => {
                return <DynamicTimeAgo timestamp={lastmatchdate} />;
              },
            },
          ]}
          // sortStatus={sortStatus}
          // onSortStatusChange={setSortStatus}
        />
      </div>
    );
  }
};

export default TopLeaderboardsTable;
