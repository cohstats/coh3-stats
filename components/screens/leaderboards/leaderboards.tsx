import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { AnalyticsLeaderBoardsPageView } from "../../../src/firebase/analytics";
import { calculatePageNumber, calculatePositionNumber } from "../../../src/utils";
import ErrorCard from "../../error-card";
import { DataTable } from "mantine-datatable";
import RankIcon from "../../rank-icon";
import { Anchor, Container, Group, Select, Space, Text, Title } from "@mantine/core";
import Link from "next/link";
import CountryFlag from "../../country-flag";
import DynamicTimeAgo from "../../other/dynamic-timeago";
import { localizedGameTypes, localizedNames } from "../../../src/coh3/coh3-data";
import { leaderBoardType, raceType } from "../../../src/coh3/coh3-types";
import Head from "next/head";
import FactionIcon from "../../faction-icon";

const RECORD_PER_PAGE = 100;

const Leaderboards = ({
  leaderBoardData,
  error,
  start,
  totalRecords,
  raceToFetch,
  platformToFetch,
  typeToFetch,
}: any) => {
  const { push, query } = useRouter();

  useEffect(() => {
    AnalyticsLeaderBoardsPageView(raceToFetch, typeToFetch);
  }, [raceToFetch, typeToFetch]);

  const onPageChange = (p: number) => {
    const startPositionNumber = calculatePositionNumber(p, RECORD_PER_PAGE);
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
          // verticalSpacing="xs"
          minHeight={300}
          // provide data
          idAccessor={"statgroup_id"}
          records={leaderBoardData || []}
          page={calculatePageNumber(start, RECORD_PER_PAGE)}
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
              render: ({ ranklevel }: any) => {
                return <RankIcon size={32} race={raceToFetch} rank={ranklevel}></RankIcon>;
              },
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
                  const { alias, profile_id, country } = member;
                  const path = `/players/${profile_id}`;

                  return (
                    <Anchor key={profile_id} component={Link} href={path}>
                      <Group spacing="xs">
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
              width: 125,
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

  const localizedRace = localizedNames[raceToFetch as raceType];
  const localizedType = localizedGameTypes[typeToFetch as leaderBoardType];
  const pageTitle = `Leaderboards for ${localizedRace} ${localizedType}`;
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Ranked leaderboards for faction ${localizedRace} and game type ${localizedType}. Company of Heroes 3`}
        />
        <meta
          name="keywords"
          content={`coh3, coh3 leaderboards, coh3 ${raceToFetch} leaderboards, coh3 live leaderboards, coh3 stats`}
        />
        <meta property="og:image" content={`/icons/general/${raceToFetch}.webp`} />
      </Head>
      <Container size={"lg"} p={0}>
        <Container fluid>
          <Group position={"apart"}>
            <Group>
              <FactionIcon name={raceToFetch} width={35} />
              <Title order={2}>Leaderboards for {localizedRace}</Title>
            </Group>
            <Group position="right">
              <Select
                label="Platform"
                style={{ width: 100 }}
                defaultValue={platformToFetch}
                value={platformToFetch}
                data={[
                  { value: "steam", label: "PC" },
                  { value: "xbox", label: "XBOX" },
                  { value: "psn", label: "PSN" },
                ]}
                onChange={(value) => {
                  push({ query: { ...query, platform: value } }, undefined);
                }}
              />
              <Select
                label="Race"
                // style={{width: 200}}
                defaultValue={raceToFetch}
                value={raceToFetch}
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
                style={{ width: 100 }}
                defaultValue={typeToFetch}
                value={typeToFetch}
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

export default Leaderboards;
