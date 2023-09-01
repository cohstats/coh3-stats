import { Flex, Paper, Tabs, Title } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import LeaderboardsTable from "../../../leaderboards/leaderboards-table";
import { raceType, Top1v1LeaderboardsData } from "../../../../src/coh3/coh3-types";
import { useEffect, useState } from "react";

const TopLeaderboardsSection = ({
  initialData,
}: {
  initialData: Top1v1LeaderboardsData | null;
}) => {
  const [data, setData] = useState<Top1v1LeaderboardsData | null>(initialData);
  const [selectedRace, setSelectedRace] = useState<raceType>(initialData?.race ?? "british");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
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
    <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray">
      <Tabs
        variant="pills"
        defaultValue="british"
        onTabChange={(value) => setSelectedRace(value as raceType)}
        value={selectedRace}
      >
        <Flex gap="md" justify="space-between" align="center" direction="row" wrap="wrap">
          <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap">
            <IconTrophy></IconTrophy>{" "}
            <Title order={1} size="h2">
              1v1 Leaderboards
            </Title>
          </Flex>
          <Tabs.List>
            <Tabs.Tab value="british">British Forces</Tabs.Tab>
            <Tabs.Tab value="american">US Forces</Tabs.Tab>
            <Tabs.Tab value="german">Wehrmacht</Tabs.Tab>
            <Tabs.Tab value="dak">Deutsches Afrikakorps</Tabs.Tab>
          </Tabs.List>
        </Flex>

        <Tabs.Panel value="british" pt="xs">
          <LeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>

        <Tabs.Panel value="american" pt="xs">
          <LeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>

        <Tabs.Panel value="german" pt="xs">
          <LeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>
        <Tabs.Panel value="dak" pt="xs">
          <LeaderboardsTable
            key={data?.race}
            leaderBoardData={data}
            loading={loading}
            error={error}
          />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default TopLeaderboardsSection;
