import { leaderBoardType, raceType, RawLeaderboardStat } from "../../../src/coh3/coh3-types";
import React from "react";
import { Group, Space, Title, Card, createStyles } from "@mantine/core";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { Text } from "@mantine/core";

const findBestValueOnLeaderboardStat = (
  data: Record<leaderBoardType, RawLeaderboardStat | null>,
  rating: "rating" | "ranklevel",
) => {
  let bestValue: number | null = 0;
  let bestValueKey = "";

  for (const [key, value] of Object.entries(data)) {
    if (value?.[rating] && value[rating] > (bestValue || 0)) {
      bestValue = value[rating] || null;
      bestValueKey = key;
    }
  }

  return {
    bestValue,
    bestValueKey,
  };
};

const findBestRankLeaderboardStat = (
  data: Record<leaderBoardType, RawLeaderboardStat | null>,
  rating: "rank",
) => {
  let bestValue: number | null = Infinity;
  let bestValueKey = "";

  for (const [key, value] of Object.entries(data)) {
    if (value?.[rating] && value[rating] < (bestValue || Infinity) && value[rating] > 0) {
      bestValue = value[rating] || null;
      bestValueKey = key;
    }
  }

  return {
    bestValue,
    bestValueKey,
  };
};

const useStyles = createStyles((theme, { faction }: { faction: string }) => ({
  mainCard:
    theme.colorScheme === "light"
      ? {
          width: "230px",
          height: "212px",
          backgroundImage: `url('/icons/general/${faction}.webp')`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "overlay",
          // This should be a color from the theme, but I can't find out right now the colors
          backgroundColor: "rgba(255,255,255,0.85)",
        }
      : {
          width: "230px",
          height: "212px",
        },
}));

const PlayerStandingsFactionInfo = ({
  faction,
  data,
}: {
  faction: raceType;
  data: Record<leaderBoardType, RawLeaderboardStat | null>;
}) => {
  const { classes } = useStyles({ faction });

  const bestElo = findBestValueOnLeaderboardStat(data, "rating");
  const bestRank = findBestRankLeaderboardStat(data, "rank");
  const bestRankLevel = findBestValueOnLeaderboardStat(data, "ranklevel");

  const totalGames = Object.values(data).reduce((acc, cur) => {
    return acc + ((cur?.wins || 0) + (cur?.losses || 0));
  }, 0);

  const totalWins = Object.values(data).reduce((acc, cur) => {
    return acc + (cur?.wins || 0);
  }, 0);

  const winRate = totalWins / totalGames;

  // Use only DAK for title, as it's too long
  const cardTitle = faction != "dak" ? localizedNames[faction] : faction.toUpperCase();

  return (
    <>
      <Card padding="lg" radius="md" withBorder className={classes.mainCard}>
        <Card.Section>
          <Group m="xs">
            {/*<FactionIcon name={faction} width={24} />*/}
            <Title order={4}> Best of {cardTitle}</Title>
          </Group>
        </Card.Section>
        <Group position="apart">
          <span>Best Rank</span>{" "}
          <Text fw={600}>
            {bestRank.bestValue} in {bestRank.bestValueKey}
          </Text>
        </Group>
        <Group position="apart">
          <span>Best Level</span>{" "}
          <Text fw={600}>
            {bestRankLevel.bestValue} in {bestRankLevel.bestValueKey}
          </Text>
        </Group>
        <Group position="apart">
          <span>Best ELO</span>{" "}
          <Text fw={600}>
            {bestElo.bestValue} in {bestElo.bestValueKey}
          </Text>
        </Group>
        <Space h="xl" />
        <Group position="apart">
          <span>Overall win Rate</span> <Text fw={600}>{Math.round(winRate * 100)}%</Text>
        </Group>
        <Group position="apart">
          <span>Total Games</span> <Text fw={600}>{totalGames}</Text>
        </Group>
      </Card>
    </>
  );
};

export default PlayerStandingsFactionInfo;
