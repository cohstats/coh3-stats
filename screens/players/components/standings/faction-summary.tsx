import { leaderBoardType, raceType, RawLeaderboardStat } from "../../../../src/coh3/coh3-types";
import React from "react";
import { Group, Space, Title, Card, Stack, ActionIcon } from "@mantine/core";
import { localizedNames } from "../../../../src/coh3/coh3-data";
import { Text } from "@mantine/core";
//import { createStyles } from '@mantine/emotion';
import {
  findBestRankLeaderboardStat,
  findBestValueOnLeaderboardStat,
} from "../../../../src/players/utils";
import DynamicTimeAgo from "../../../../components/other/dynamic-timeago";
import { IconCirclePlus } from "@tabler/icons-react";

const useStyles = createStyles((theme, { faction }: { faction: string }) => ({
  mainCard:
    theme.colorScheme === "light"
      ? {
          width: "230px",
          height: "235px",
          backgroundImage: `url('/icons/general/${faction}.webp')`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundBlendMode: "overlay",
          // This should be a color from the theme, but I can't find out right now the colors
          backgroundColor: "rgba(255,255,255,0.85)",
        }
      : {
          width: "230px",
          height: "235px",
        },
}));

const PlayerStandingsFactionInfo = ({
  faction,
  data,
  moreButtonOnClick,
}: {
  faction: raceType;
  data: Record<leaderBoardType, RawLeaderboardStat | null>;
  moreButtonOnClick: () => Promise<void>;
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

  let cardTitle = faction.toUpperCase();

  if (faction === "british") {
    cardTitle = "British";
  } else if (faction === "german") {
    cardTitle = "Wehr";
  } else if (faction !== "dak") {
    cardTitle = localizedNames[faction];
  }

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
          <Group m="xs" justify={"apart"}>
            <Title order={4}> Best of {cardTitle}</Title>

            <ActionIcon onClick={moreButtonOnClick}>
              <IconCirclePlus size={"20"} />
            </ActionIcon>
          </Group>
        </Card.Section>
        <Text size={"sm"}>
          <Stack gap="md">
            <div>
              <Group justify="apart">
                <span>Best Rank</span> <Text fw={600}>{bestRankElement}</Text>
              </Group>
              <Group justify="apart">
                <span>Best Level</span> <Text fw={600}>{bestLevelElement}</Text>
              </Group>
              <Group justify="apart">
                <span>Best ELO</span> <Text fw={600}>{bestEloElement}</Text>
              </Group>
            </div>
            <Space h="xs" />
            <div>
              <Group justify="apart">
                <span>Overall win Rate</span> <Text fw={600}>{winRateElement}</Text>
              </Group>
              <Group justify="apart">
                <span>Total Games</span> <Text fw={600}>{totalGamesElement}</Text>
              </Group>
              <Group justify="apart">
                <Text>Last match</Text> <DynamicTimeAgo timestamp={lastMatchDate} />
              </Group>
            </div>
          </Stack>
        </Text>
      </Card>
    </>
  );
};

export default PlayerStandingsFactionInfo;
