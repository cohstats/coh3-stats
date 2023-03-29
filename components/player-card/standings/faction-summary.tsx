import { leaderBoardType, raceType, RawLeaderboardStat } from "../../../src/coh3/coh3-types";
import React from "react";
import { Group, Space, Title, Card, createStyles } from "@mantine/core";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { Text } from "@mantine/core";
import {
  findBestRankLeaderboardStat,
  findBestValueOnLeaderboardStat,
} from "../../../src/players/utils";
import DynamicTimeAgo from "../../other/dynamic-timeago";

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

  const lastMatchDate: number = Object.values(data).reduce((acc, cur) => {
    return acc > (cur?.lastmatchdate || 0) ? acc : cur?.lastmatchdate || 0;
  }, 0);

  // Use only DAK for title, as it's too long
  const cardTitle = faction != "dak" ? localizedNames[faction] : faction.toUpperCase();

  const bestRankElement =
    (bestRank.bestValue || 0) != Infinity
      ? `${bestRank.bestValue} in ${bestRank.bestValueKey}`
      : "-";
  const bestLevelElement =
    (bestRankLevel.bestValue || 0) > 0
      ? `${bestRankLevel.bestValue} in ${bestRankLevel.bestValueKey}`
      : "-";
  const bestEloElement =
    (bestElo.bestValue || 0) > 0 ? `${bestElo.bestValue} in ${bestElo.bestValueKey}` : "-";
  const winRateElement = (winRate || 0) > 0 ? `${Math.round(winRate * 100)}%` : "-";
  const totalGamesElement = (totalGames || 0) > 0 ? `${totalGames}` : "-";

  return (
    <>
      <Card padding="lg" radius="md" withBorder className={classes.mainCard}>
        <Card.Section>
          <Group m="xs">
            <Title order={4}> Best of {cardTitle}</Title>
          </Group>
        </Card.Section>
        <Text size={"sm"}>
          <Group position="apart">
            <span>Best Rank</span> <Text fw={600}>{bestRankElement}</Text>
          </Group>
          <Group position="apart">
            <span>Best Level</span> <Text fw={600}>{bestLevelElement}</Text>
          </Group>
          <Group position="apart">
            <span>Best ELO</span> <Text fw={600}>{bestEloElement}</Text>
          </Group>
          <Space h="xl" />
          <Group position="apart">
            <span>Overall win Rate</span> <Text fw={600}>{winRateElement}</Text>
          </Group>
          <Group position="apart">
            <span>Total Games</span> <Text fw={600}>{totalGamesElement}</Text>
          </Group>
          <Group position="apart">
            <Text>Last match</Text> <DynamicTimeAgo timestamp={lastMatchDate} />
          </Group>
        </Text>
      </Card>
    </>
  );
};

export default PlayerStandingsFactionInfo;
