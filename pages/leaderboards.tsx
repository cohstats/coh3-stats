import { getLeaderBoardData } from "../src/coh3/coh3-api";
import { findAndMergeStatGroups } from "../src/coh3/helpers";
import { Container, Group, Select, Space, Text, Title } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import Link from "next/link";

import React from "react";
import dynamic from "next/dynamic";
import { calculatePageNumber, calculatePositionNumber } from "../src/utils";
import ErrorCard from "../components/error-card";

/**
 * Timeago is causing issues with SSR, move to clinet side
 */
const DynamicTimeAgo = dynamic(() => import("../components/internal-timeago"), {
  ssr: false,
  // @ts-ignore
  loading: () => "Calculating...",
});

const RECORD_PER_PAGE = 100;

const Leaderboards = ({
  leaderBoardData,
  error,
  start,
  totalRecords,
  raceToFetch,
  typeToFetch,
}: any) => {
  const { push, query } = useRouter();

  const onPageChange = (p: number) => {
    const startPositionNumber = calculatePositionNumber(p);
    push({ query: { ...query, start: startPositionNumber } }, undefined);
  };

  const content = (() => {
    if (error) {
      return <ErrorCard title={"Error getting the leaderboards"} body={JSON.stringify(error)} />;
    } else {
      return (
        <DataTable
          withBorder
          borderRadius="md"
          highlightOnHover
          striped
          verticalSpacing="sm"
          minHeight={300}
          // provide data
          records={leaderBoardData || []}
          page={calculatePageNumber(start)}
          totalRecords={totalRecords}
          recordsPerPage={RECORD_PER_PAGE}
          onPageChange={onPageChange}
          // define columns
          columns={[
            {
              accessor: "rank",
              textAlignment: "center",
            },
            {
              title: "ELO",
              accessor: "rating",
              textAlignment: "center",
            },
            {
              title: "Level",
              accessor: "ranklevel",
              textAlignment: "center",
            },
            // // {
            // //     accessor: "change",
            // //     textAlignment: "center",
            // // },
            {
              accessor: "alias",
              width: "100%",
              // @ts-ignore
              render: ({ members }) => {
                return members.map((member: any) => {
                  const { alias, profile_id } = member;
                  const path = `/players/${profile_id}`;

                  return (
                    <Link href={path} key={profile_id} passHref>
                      {/*//   <Anchor component="a">*/}
                      {alias}
                      {/*//   </Anchor>*/}
                    </Link>
                  );
                });
              },
            },
            {
              accessor: "streak",
              // sortable: true,
              textAlignment: "center",
              // @ts-ignore
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
              // sortable: true,
              textAlignment: "center",
            },
            {
              accessor: "losses",
              textAlignment: "center",
            },
            {
              accessor: "ratio",
              // sortable: true,
              textAlignment: "center",
              render: ({ wins, losses }: any) => {
                return `${Math.round((wins / (wins + losses)) * 100)}%`;
              },
            },
            {
              accessor: "total",
              // sortable: true,
              textAlignment: "center",
              render: ({ wins, losses }: any) => {
                return `${wins + losses}`;
              },
            },
            // // {
            // //     accessor: "drops",
            // //     sortable: true,
            // //     textAlignment: "center",
            // // },
            // // {
            // //     accessor: "disputes",
            // //     sortable: true,
            // //     textAlignment: "center",
            // // },
            {
              accessor: "lastmatchdate",
              title: "Last Game",
              textAlignment: "right",
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
      );
    }
  })();

  return (
    <>
      <Container size={"lg"}>
        <Container fluid>
          <Group position={"apart"}>
            <Title order={1}>Leaderboards</Title>
            <Group position="right">
              <Select
                label="Race"
                defaultValue={raceToFetch}
                data={[
                  { value: "american", label: "US Forces" },
                  { value: "german", label: "Wehrmacht" },
                  { value: "dak", label: "Deutsches Afrikakorps" },
                  { value: "british", label: "British Forces" },
                ]}
                onChange={(value) => {
                  push({ query: { ...query, race: value } }, undefined);
                }}
              />

              <Select
                label="Type"
                defaultValue={typeToFetch}
                data={[
                  { value: "1v1", label: "1 vs 1" },
                  { value: "2v2", label: "2 vs 2" },
                  { value: "3v3", label: "3 vs 3" },
                  { value: "4v4", label: "4 vs 4" },
                ]}
                onChange={(value) => {
                  push({ query: { ...query, type: value } }, undefined);
                }}
              />
            </Group>
          </Group>
        </Container>
        <Space h="md" />
        {content}
      </Container>
    </>
  );
};

const sortById = {
  wins: 0,
  elo: 1,
};

export async function getServerSideProps({ query }: any) {
  const { race, type, sortBy, start } = query;

  const raceToFetch = race || "american";
  const typeToFetch = type || "1v1";
  const sortByToFetch = sortById[sortBy as "wins" | "elo"] || 1;
  const startToFetch = start || 1;

  let leaderBoardData = null;
  let error = null;
  let totalRecords = 1;

  try {
    const leaderBoardDataRaw = await getLeaderBoardData(
      raceToFetch,
      typeToFetch,
      sortByToFetch,
      100,
      startToFetch,
    );
    totalRecords = leaderBoardDataRaw.rankTotal;
    leaderBoardData = findAndMergeStatGroups(leaderBoardDataRaw, null);
  } catch (e: any) {
    console.error(`Error getting the leaderboards`);
    console.error(e);
    error = e.message;
  }

  return {
    props: {
      leaderBoardData,
      error,
      start: startToFetch,
      totalRecords,
      raceToFetch,
      typeToFetch,
    }, // will be passed to the page component as props
  };
}

export default Leaderboards;
