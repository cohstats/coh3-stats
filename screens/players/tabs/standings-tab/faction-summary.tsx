import { leaderBoardType, raceType, RawLeaderboardStat } from "../../../../src/coh3/coh3-types";
import React from "react";
import { Group, Title, Card, Stack, ActionIcon, Space, Flex } from "@mantine/core";
import { localizedNames } from "../../../../src/coh3/coh3-data";
import { Text } from "@mantine/core";
import {
  findBestRankLeaderboardStat,
  findBestValueOnLeaderboardStat,
  findBestWinRateOnLeaderboardStat,
} from "../../../../src/players/utils";
import { IconCirclePlus } from "@tabler/icons-react";
import { calculateHighestRankTier } from "../../../../src/players/standings";
import Image from "next/image";

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
  const bestStreak = findBestValueOnLeaderboardStat(data, "streak");
  const { bestWinRate, bestWinRateMode } = findBestWinRateOnLeaderboardStat(data);

  const bestTier = calculateHighestRankTier(
    (Object.values(data) as Array<RawLeaderboardStat>) || [],
  );

  const averageElO = (() => {
    const totalElo = Object.values(data).reduce((acc, cur) => {
      return acc + (cur?.rating || 0);
    }, 0);
    const count = Object.values(data).filter((cur) => cur?.rating).length;
    return count === 0 ? "-" : (totalElo / count).toFixed(0);
  })();

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

  const bestWinRateElement =
    (bestWinRate || 0) > 0 ? `${Math.round(bestWinRate * 100)}% in ${bestWinRateMode}` : "-";

  const bestStreakElement =
    (bestStreak.bestValue || 0) > 0
      ? `+${bestStreak.bestValue} in ${bestStreak.bestValueKey}`
      : "-";

  const avgEloElement = averageElO;

  let cardTitle = faction.toUpperCase();

  if (faction === "british") {
    cardTitle = "British";
  } else if (faction === "german") {
    cardTitle = "Wehr";
  } else if (faction !== "dak") {
    cardTitle = localizedNames[faction];
  }

  return (
    <>
      <Card
        padding="lg"
        radius="md"
        withBorder
        style={{
          width: "230px",
          // height: "208px",
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
          <Stack gap="md">
            <div>
              <Flex justify="space-between">
                <Stack gap={0}>
                  <Text span fw={600}>
                    {bestTier.tier.name}
                  </Text>
                  <Text span size={"xs"}>
                    {bestTier.info && `in ${bestTier.info?.type}`}
                  </Text>
                </Stack>
                <Image
                  src={bestTier.tier.url}
                  width={38}
                  height={38}
                  alt={bestTier.tier.name}
                  loading="lazy"
                />
              </Flex>
              <Space h={"md"} />
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
              <Group justify="space-between">
                <span>Best Ratio</span>{" "}
                <Text span fw={600}>
                  {bestWinRateElement}
                </Text>
              </Group>
              <Group justify="space-between">
                <span>Best Streak</span>{" "}
                <Text span fw={600}>
                  {bestStreakElement}
                </Text>
              </Group>
            </div>
            <div>
              <Group justify="space-between">
                <span>AVG ELO</span>{" "}
                <Text span fw={600}>
                  {avgEloElement}
                </Text>
              </Group>
            </div>
          </Stack>
        </Text>
      </Card>
    </>
  );
};

export default PlayerStandingsFactionInfo;
