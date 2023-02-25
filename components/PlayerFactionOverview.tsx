import { Paper, Title, Group, Text, Avatar, createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.blue[5],
    color: theme.white,
  },
  inner: {
    backgroundColor: theme.colorScheme === "dark" ? theme.black : theme.white,
  },
}));

interface ModeOverviewProps {
  mode: string;
  rank: number;
  streak: number;
  wins: number;
  losses: number;
}

const ModeOverview: React.FC<ModeOverviewProps> = ({ mode, rank, streak, wins, losses }) => {
  const { classes } = useStyles();
  return (
    <>
      <Paper className={classes.inner} radius="md" px="sm" py="xs" mt="xs">
        <Group>
          <Text size="sm" pr="md">
            {mode}
          </Text>
          <Text size="sm" weight={700}>
            #{rank}
          </Text>
          <Text size="sm" weight={700}>
            {streak}
          </Text>
          <Text size="sm" weight={700}>
            {((wins / (wins + losses)) * 100).toFixed(0)}%
          </Text>
          <Text size="sm" weight={700} color="green">
            {wins}W
          </Text>
          <Text size="sm" weight={700} color="red">
            {losses}L
          </Text>
        </Group>
      </Paper>
    </>
  );
};

export const PlayerFactionOverview: React.FC = () => {
  const { classes } = useStyles();
  return (
    <>
      <Paper color="blue" className={classes.root} px="md" py="xs" radius="md">
        <Group>
          <Avatar />
          <Title size="h3">Americans</Title>
        </Group>
        <ModeOverview mode="1v1" rank={1} streak={4} wins={5} losses={10} />
        <ModeOverview mode="2v2" rank={1} streak={4} wins={5} losses={10} />
        <ModeOverview mode="3v3" rank={1} streak={4} wins={5} losses={10} />
        <ModeOverview mode="4v4" rank={1} streak={4} wins={5} losses={10} />
      </Paper>
    </>
  );
};
