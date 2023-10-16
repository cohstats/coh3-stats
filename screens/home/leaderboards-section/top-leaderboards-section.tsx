import { Flex, Paper, Tabs, Title, Space, Anchor, createStyles } from "@mantine/core";
import { IconArrowRight, IconTrophy } from "@tabler/icons-react";
import TopLeaderboardsTable from "../../../components/leaderboards/top-leaderboards-table";
import { raceType, Top1v1LeaderboardsData } from "../../../src/coh3/coh3-types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderBoardRoute } from "../../../src/routes";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
    borderRadius: theme.radius.md,

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
    },

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
      textDecoration: "none",
    }),
  },
}));

const TopLeaderboardsSection = ({
  initialData,
}: {
  initialData: Top1v1LeaderboardsData | null;
}) => {
  const { classes } = useStyles();
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
    <Paper withBorder shadow="xs" radius="md" mt="md" p="md" color="gray">
      <Tabs
        variant="pills"
        onTabChange={(value) => setSelectedRace(value as raceType)}
        value={selectedRace}
      >
        <Flex gap="md" justify="space-between" align="center" direction="row" wrap="wrap">
          <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap">
            <IconTrophy />{" "}
            <Title order={1} size="h2">
              1v1 Leaderboards
            </Title>
          </Flex>
          <Tabs.List>
            {/*TODO: We could maybe utilize icons ? Or on mobile it could be just icons*/}
            <Tabs.Tab value="american">US Forces</Tabs.Tab>
            <Tabs.Tab value="british">British Forces</Tabs.Tab>
            <Tabs.Tab value="german">Wehrmacht</Tabs.Tab>
            <Tabs.Tab value="dak">Deutsches Afrikakorps</Tabs.Tab>
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
        <Anchor
          component={Link}
          href={getLeaderBoardRoute(selectedRace)}
          className={classes.link}
        >
          View Full Leaderboard
          <IconArrowRight style={{ marginLeft: "5px" }} />
        </Anchor>
      </Flex>
    </Paper>
  );
};

export default TopLeaderboardsSection;
