import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { AnalyticsLeaderBoardsPageView } from "../../../src/firebase/analytics";
import { Container, Group, Select, Space, Title } from "@mantine/core";
import { localizedGameTypes, localizedNames } from "../../../src/coh3/coh3-data";
import { leaderBoardType, raceType } from "../../../src/coh3/coh3-types";
import Head from "next/head";
import FactionIcon from "../../faction-icon";
import LeaderboardsTable from "../../leaderboards/leaderboards-table";
import { calculatePositionNumber } from "../../../src/utils";

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
  const RECORD_PER_PAGE = 100;

  useEffect(() => {
    AnalyticsLeaderBoardsPageView(raceToFetch, typeToFetch);
  }, [raceToFetch, typeToFetch]);

  const onPageChange = (p: number) => {
    const startPositionNumber = calculatePositionNumber(p, RECORD_PER_PAGE);
    push({ query: { ...query, start: startPositionNumber } }, undefined);
  };

  const content = (() => {
    return (
      <LeaderboardsTable
        leaderBoardData={leaderBoardData}
        error={error}
        start={start}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        recordsPerPage={RECORD_PER_PAGE}
        withBorder={true}
      />
    );
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
