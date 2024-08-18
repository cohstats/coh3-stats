import { leaderBoardType, raceType, RawLeaderboardStat } from "../../../../src/coh3/coh3-types";
import React from "react";
import { Group, Title, Card, Stack, ActionIcon } from "@mantine/core";
import { localizedNames } from "../../../../src/coh3/coh3-data";
import { Text } from "@mantine/core";
import {
  findBestRankLeaderboardStat,
  findBestValueOnLeaderboardStat,
} from "../../../../src/players/utils";
import DynamicTimeAgo from "../../../../components/other/dynamic-timeago";
import { IconCirclePlus } from "@tabler/icons-react";

const PlayerStandingsFactionInfo = ({
  faction,
  data,
  moreButtonOnClick,
}: {
  faction: raceType;
  data: Record<leaderBoardType, RawLeaderboardStat | null>;
  moreButtonOnClick: () => Promise<void>;
}) => {
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
      <Card
        padding="lg"
        radius="md"
        withBorder
        style={{
          width: "230px",
          height: "208px",
        }}
      >
        <Card.Section>
          <Group m="xs" justify={"space-between"}>
            <Title order={4}> Best of {cardTitle}</Title>

            <ActionIcon onClick={moreButtonOnClick} variant="default">
              <IconCirclePlus size={"20"} />
            </ActionIcon>
          </Group>
        </Card.Section>
        <Text span size={"sm"}>
          <Stack gap="xl">
            <div>
              <Group justify="space-between">
                <span>Best Rank</span>{" "}
                <Text span fw={600}>
                  {bestRankElement}
                </Text>
              </Group>
              <Group justify="space-between">
                <span>Best Level</span>{" "}
                <Text span fw={600}>
                  {bestLevelElement}
                </Text>
              </Group>
              <Group justify="space-between">
                <span>Best ELO</span>{" "}
                <Text span fw={600}>
                  {bestEloElement}
                </Text>
              </Group>
            </div>
            <div>
              <Group justify="space-between">
                <span>Overall win Rate</span>{" "}
                <Text span fw={600}>
                  {winRateElement}
                </Text>
              </Group>
              <Group justify="space-between">
                <span>Total Games</span>{" "}
                <Text span fw={600}>
                  {totalGamesElement}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text span>Last match</Text> <DynamicTimeAgo timestamp={lastMatchDate} />
              </Group>
            </div>
          </Stack>
        </Text>
      </Card>
    </>
  );
};

export default PlayerStandingsFactionInfo;
