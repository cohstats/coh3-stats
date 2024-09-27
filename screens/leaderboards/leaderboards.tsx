import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { AnalyticsLeaderBoardsPageView } from "../../src/firebase/analytics";
import { calculatePageNumber, calculatePositionNumber } from "../../src/utils";
import ErrorCard from "../../components/error-card";
import { DataTable } from "mantine-datatable";
import RankIcon from "../../components/rank-icon";
import { Anchor, Container, Group, Select, Space, Text, Title } from "@mantine/core";
import Link from "next/link";
import CountryFlag from "../../components/country-flag";
import DynamicTimeAgo from "../../components/other/dynamic-timeago";
import { leaderboardRegions, localizedGameTypes, localizedNames } from "../../src/coh3/coh3-data";
import { leaderBoardType, raceType } from "../../src/coh3/coh3-types";
import Head from "next/head";
import FactionIcon from "../../components/faction-icon";

const RECORD_PER_PAGE = 100;

const Leaderboards = ({
  leaderBoardData,
  error,
  start,
  totalRecords,
  raceToFetch,
  platformToFetch,
  typeToFetch,
  regionToFetch,
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
          withTableBorder={true}
          borderRadius="md"
          highlightOnHover
          striped
          verticalSpacing={4}
          fz={"sm"}
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
              textAlign: "center",
              render: ({ rank, regionrank }: { rank: number; regionrank: number }) => {
                return regionToFetch ? `${regionrank}` : `${rank}`;
              },
            },
            {
              title: "ELO",
              accessor: "rating",
              textAlign: "center",
            },
            {
              title: "Tier",
              accessor: "tier",
              textAlign: "center",
              render: ({
                rank,
                rating,
                regionrank,
              }: {
                rank: number;
                rating: number;
                regionrank: number;
              }) => {
                return (
                  <RankIcon size={28} rank={regionToFetch ? regionrank : rank} rating={rating} />
                );
              },
            },
            // // {
            // //     accessor: "change",
            // //     textAlign: "center",
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
              render: ({ streak }) => {
                return streak > 0 ? (
                  <Text c={"green"}>+{streak}</Text>
                ) : (
                  <Text c={"red"}>{streak}</Text>
                );
              },
            },
            {
              accessor: "wins",
              // sortable: true,
              textAlign: "center",
            },
            {
              accessor: "losses",
              textAlign: "center",
            },
            {
              accessor: "ratio",
              // sortable: true,
              textAlign: "center",
              render: ({ wins, losses }: any) => {
                return `${Math.round((wins / (wins + losses)) * 100)}%`;
              },
            },
            {
              accessor: "total",
              // sortable: true,
              textAlign: "center",
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
        <Container fluid pl={0} pr={0}>
          <Group justify={"space-between"}>
            <Group>
              <FactionIcon name={raceToFetch} width={35} />
              <Title order={2}>Leaderboards for {localizedRace}</Title>
            </Group>
            <Group justify="right">
              <Select
                withCheckIcon={false}
                label="Region"
                style={{ width: 150 }}
                value={regionToFetch ? regionToFetch : "global"}
                data={[
                  { value: "global", label: "Global" },
                  ...Object.entries(leaderboardRegions).map(([key, region]) => {
                    return { value: key, label: region.name };
                  }),
                ]}
                onChange={(value) => {
                  if (value === "global") {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { region, ...rest } = query; // remove region from query
                    push({ query: rest }, undefined);
                  } else {
                    push({ query: { ...query, region: value } }, undefined);
                  }
                }}
              />
              <Select
                withCheckIcon={false}
                label="Platform"
                style={{ width: 90 }}
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
                withCheckIcon={false}
                label="Faction"
                style={{ width: 190 }}
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
                withCheckIcon={false}
                label="Type"
                style={{ width: 90 }}
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
