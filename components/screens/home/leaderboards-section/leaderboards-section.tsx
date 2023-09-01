import { Flex, Paper, Tabs, Title } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import LeaderboardsTable from "../../../leaderboards/leaderboards-table";

const LeaderboardsSection = () => {
  return (
    <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray">
      <Tabs variant="pills" defaultValue="british">
        <Flex gap="md" justify="space-between" align="center" direction="row" wrap="wrap">
          <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap">
            <IconTrophy></IconTrophy>{" "}
            <Title order={1} size="h2">
              1v1 Leaderboards
            </Title>
          </Flex>
          <Tabs.List>
            <Tabs.Tab value="british">British Forces</Tabs.Tab>
            <Tabs.Tab value="us">US Forces</Tabs.Tab>
            <Tabs.Tab value="wehrmacht">Wehrmacht</Tabs.Tab>
            <Tabs.Tab value="afrikakorps">Deutsches Afrikakorps</Tabs.Tab>
          </Tabs.List>
        </Flex>

        <Tabs.Panel value="british" pt="xs">
          <LeaderboardsTable leaderBoardData={[]} error={null} />
        </Tabs.Panel>

        <Tabs.Panel value="us" pt="xs">
          <LeaderboardsTable leaderBoardData={[]} error={null} />
        </Tabs.Panel>

        <Tabs.Panel value="wehrmacht" pt="xs">
          <LeaderboardsTable leaderBoardData={[]} error={null} />
        </Tabs.Panel>
        <Tabs.Panel value="afrikakorps" pt="xs">
          <LeaderboardsTable leaderBoardData={[]} error={null} />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default LeaderboardsSection;
