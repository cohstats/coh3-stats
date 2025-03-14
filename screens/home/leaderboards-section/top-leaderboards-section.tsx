import { Flex, Paper, Tabs, Title, Space, Button } from "@mantine/core";
import { IconArrowRight, IconTrophy } from "@tabler/icons-react";
import TopLeaderboardsTable from "../../../components/leaderboards/top-leaderboards-table";
import { raceType, Top1v1LeaderboardsData } from "../../../src/coh3/coh3-types";
import React, { useEffect, useState } from "react";
import { getLeaderBoardRoute } from "../../../src/routes";
import Link from "next/link";

const TopLeaderboardsSection = ({
  initialData,
}: {
  initialData: Top1v1LeaderboardsData | null;
}) => {
  const [data, setData] = useState<Top1v1LeaderboardsData | null>(initialData);
  const [selectedRace, setSelectedRace] = useState<raceType>(initialData?.race || "american");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // We already have the data, do not fetch again
      if (data?.race === selectedRace) return;

      setLoading(true);
      try {
        // Because of CORS we can't go directly to relic and we need to fetch our own API
        const fetchData = await fetch(`/api/topLeaderboards?race=${selectedRace}`);
        setData(await fetchData.json());
      } catch (e) {
        console.error(`Error getting the leaderboards`);
        console.error(e);
        setError("Error getting the leaderboards");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedRace]);

  return (
    <Paper withBorder shadow="xs" radius="md" mt="md" p={{ base: "xs", sm: "md" }} color="gray">
      <Tabs
        variant="pills"
        onChange={(value: string | null) => setSelectedRace(value as raceType)}
        value={selectedRace}
      >
        <Flex gap="md" justify="space-between" align="center" direction="row" wrap="wrap">
          <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap">
            <IconTrophy /> <Title size="h3">1v1 Leaderboards</Title>
          </Flex>
          <Tabs.List>
            {/*TODO: We could maybe utilize icons ? Or on mobile it could be just icons*/}
            <Tabs.Tab value="american">USF</Tabs.Tab>
            <Tabs.Tab value="british">British</Tabs.Tab>
            <Tabs.Tab value="german">Wehrmacht</Tabs.Tab>
            <Tabs.Tab value="dak">DAK</Tabs.Tab>
          </Tabs.List>
        </Flex>

        <Tabs.Panel value="british" pt="xs">
          <TopLeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>

        <Tabs.Panel value="american" pt="xs">
          <TopLeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>

        <Tabs.Panel value="german" pt="xs">
          <TopLeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>
        <Tabs.Panel value="dak" pt="xs">
          <TopLeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>
      </Tabs>
      <Space h="xs" />
      <Flex gap="md" justify="flex-end" align="center" direction="row" wrap="wrap">
        {/*<Anchor*/}
        {/*  component={Link}*/}
        {/*  href={getLeaderBoardRoute(selectedRace)}*/}
        {/*//  className={classes.link}*/}
        {/*>*/}
        {/*  View Full Leaderboard*/}
        {/*  <IconArrowRight style={{ marginLeft: "5px" }} />*/}
        {/*</Anchor>*/}

        <Button
          component={Link}
          href={getLeaderBoardRoute(selectedRace)}
          style={{
            color: "inherit",
          }}
          // size="compact-md"
          variant="subtle"
          rightSection={<IconArrowRight style={{ marginLeft: "5px" }} />}
        >
          View Full Leaderboard
        </Button>
      </Flex>
    </Paper>
  );
};

export default TopLeaderboardsSection;
