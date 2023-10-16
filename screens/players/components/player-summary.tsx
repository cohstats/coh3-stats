import { Group, Paper, Text, Tooltip } from "@mantine/core";

import DynamicTimeAgo from "../../../components/other/dynamic-timeago";
import React from "react";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { PlayerSummaryType } from "../../../src/players/utils";

const PlayerSummary = ({
  playerSummary: { bestAlliesElo, bestAxisElo, totalGames, lastMatchDate, winRate },
}: {
  playerSummary: PlayerSummaryType;
}) => {
  const bestAxisEloText = bestAxisElo.bestElo ? bestAxisElo.bestElo : "-";
  const bestAlliesEloText = bestAlliesElo.bestElo ? bestAlliesElo.bestElo : "-";

  return (
    <Paper
      style={{
        textAlign: "right",
      }}
    >
      <Text fz={"sm"}>
        <Tooltip
          label={
            <>
              {bestAxisElo.bestElo} in {bestAxisElo.inMode} as{" "}
              {localizedNames[bestAxisElo.inFaction]}
            </>
          }
        >
          <Group position={"right"} spacing={"xs"}>
            <>
              Best AXIS ELO <Text fw={600}>{bestAxisEloText}</Text>
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
          <Group position={"right"} spacing={"xs"}>
            Best ALLIES ELO <Text fw={600}>{bestAlliesEloText}</Text>
          </Group>
        </Tooltip>
        <Tooltip label={"Win Ratio in leaderboard games only."}>
          <Group spacing={5} position={"right"}>
            WR <Text fw={600}>{Math.round(winRate * 100)}%</Text> in{" "}
            <Text fw={600}>{totalGames}</Text>games
          </Group>
        </Tooltip>
        <Group spacing={4} position="right">
          <Text>Last match</Text> <DynamicTimeAgo timestamp={lastMatchDate} />
        </Group>
      </Text>
    </Paper>
  );
};

export default PlayerSummary;
