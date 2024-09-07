import { Group, Paper, Text, Tooltip } from "@mantine/core";

import DynamicTimeAgo from "../../../../components/other/dynamic-timeago";
import React from "react";
import { localizedNames, PlayerRank } from "../../../../src/coh3/coh3-data";
import { PlayerSummaryType } from "../../../../src/players/utils";
import Image from "next/image";

const PlayerSummary = ({
  playerSummary: { bestAlliesElo, bestAxisElo, totalGames, lastMatchDate, winRate },
  highestRankTier,
}: {
  playerSummary: PlayerSummaryType;
  highestRankTier: {
    tier: PlayerRank;
    info: {
      type: "1v1" | "2v2" | "3v3" | "4v4";
      race: "german" | "american" | "dak" | "british";
    } | null;
  };
}) => {
  const bestAxisEloText = bestAxisElo.bestElo ? bestAxisElo.bestElo : "-";
  const bestAlliesEloText = bestAlliesElo.bestElo ? bestAlliesElo.bestElo : "-";

  const highestTierTooltip =
    highestRankTier.tier.order === 21
      ? "No Rank Tier"
      : `${highestRankTier.tier.name} in ${highestRankTier.info?.type} as ${highestRankTier.info?.race}`;

  return (
    <Paper
      style={{
        textAlign: "right",
      }}
    >
      <Group>
        <Text span fz={"sm"}>
          <Tooltip
            label={
              <>
                {bestAxisElo.bestElo} in {bestAxisElo.inMode} as{" "}
                {localizedNames[bestAxisElo.inFaction]}
              </>
            }
            position={"bottom"}
          >
            <Group justify={"right"} gap={"xs"}>
              <>
                <Text span fz={"sm"}>
                  Best AXIS ELO{" "}
                  <Text inherit span fw={600}>
                    {bestAxisEloText}
                  </Text>
                </Text>
              </>
            </Group>
          </Tooltip>

          <Tooltip
            label={
              <>
                {bestAlliesElo.bestElo} in {bestAlliesElo.inMode} as{" "}
                {localizedNames[bestAlliesElo.inFaction]}
              </>
            }
          >
            <Group justify={"right"} gap={"xs"}>
              <Text span fz={"sm"}>
                Best ALLIES ELO{" "}
                <Text inherit span fw={600}>
                  {bestAlliesEloText}
                </Text>
              </Text>
            </Group>
          </Tooltip>
          <Tooltip label={"Win Ratio in leaderboard games only."}>
            <Group gap={5} justify={"right"}>
              <Text span fz={"sm"}>
                WR{" "}
                <Text span inherit fw={600}>
                  {Math.round(winRate * 100)}%
                </Text>{" "}
                in{" "}
                <Text span inherit fw={600}>
                  {totalGames}
                </Text>{" "}
                games
              </Text>
            </Group>
          </Tooltip>
          <Group gap={4} justify="right">
            <Text span fz={"sm"}>
              Last match
            </Text>{" "}
            <DynamicTimeAgo timestamp={lastMatchDate} />
          </Group>
        </Text>
        <Tooltip label={highestTierTooltip} position={"bottom"}>
          <Image
            src={highestRankTier.tier.url}
            width={90}
            height={90}
            alt={highestRankTier.tier.name}
            loading="lazy"
          />
        </Tooltip>
      </Group>
    </Paper>
  );
};

export default PlayerSummary;
