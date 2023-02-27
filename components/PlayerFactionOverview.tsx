import { Paper, Title, Group, Text, Avatar, Tooltip, createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.blue[5],
    color: theme.white,
  },
  inner: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[0],
  },
}));

export interface ModeOverviewProps {
  mode: string;
  rank?: number;
  streak?: number;
  wins?: number;
  losses?: number;
}

const ModeOverview: React.FC<ModeOverviewProps> = ({ mode, rank, streak, wins, losses }) => {
  const { classes } = useStyles();
  return (
    <>
      <Paper className={classes.inner} radius="md" px="lg" py={3} mt={6}>
        <Group position="apart">
          <Text size="sm" pr="md">
            {mode}
          </Text>
          <Tooltip label="Rank">
            <Text size="sm" weight={700}>
              {rank !== undefined && rank > -1 ? <>#{rank}</> : <>-</>}
            </Text>
          </Tooltip>
          <Tooltip label="Win/Lose Streak">
            {streak !== undefined ? (
              <Text size="sm" color={streak > 0 ? "green" : "red"} weight={700}>
                {streak > 0 ? "+" : null}
                {streak}
              </Text>
            ) : (
              <Text size="sm" weight={700}>
                -
              </Text>
            )}
          </Tooltip>
          <Tooltip label="Win ratio">
            <Text size="sm" weight={700}>
              {wins !== undefined && losses !== undefined ? (
                <>{((wins / (wins + losses)) * 100).toFixed(0)}%</>
              ) : (
                <>-</>
              )}
            </Text>
          </Tooltip>
          <Tooltip label="Wins">
            <Text size="sm" weight={700} color="green">
              {wins !== undefined ? <>{wins}W</> : <>-</>}
            </Text>
          </Tooltip>
          <Tooltip label="Losses">
            <Text size="sm" weight={700} color="red">
              {losses !== undefined ? <>{losses}L</> : <>-</>}
            </Text>
          </Tooltip>
        </Group>
      </Paper>
    </>
  );
};

export interface PlayerFactionOverviewProps {
  faction: string;
  ones: Omit<ModeOverviewProps, "mode">;
  twos: Omit<ModeOverviewProps, "mode">;
  threes: Omit<ModeOverviewProps, "mode">;
  fours: Omit<ModeOverviewProps, "mode">;
}

export const PlayerFactionOverview: React.FC<PlayerFactionOverviewProps> = ({
  faction,
  ones,
  twos,
  threes,
  fours,
}) => {
  const { classes } = useStyles();
  return (
    <>
      <Paper color="blue" className={classes.root} px="md" py="sm" radius="md">
        <Group>
          <Avatar />
          <Title size="h3">{faction}</Title>
        </Group>
        <ModeOverview mode="1v1" {...ones} />
        <ModeOverview mode="2v2" {...twos} />
        <ModeOverview mode="3v3" {...threes} />
        <ModeOverview mode="4v4" {...fours} />
      </Paper>
    </>
  );
};
