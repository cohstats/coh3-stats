import React from "react";
import { Group, Stack, Text } from "@mantine/core";
import { IconTrophyFilled } from "@tabler/icons-react";
import type { IroncladDivisionSummary } from "../../../src/tournaments/ironclad-tournament";
import IroncladPlayerLink from "./ironclad-player-link";

/**
 * Champions of the decided divisions side by side, the division above the player.
 * Renders nothing when no division has a champion.
 */
const IroncladChampions = ({ divisions }: { divisions: IroncladDivisionSummary[] }) => {
  const decided = divisions.filter((division) => division.champion);
  if (decided.length === 0) return null;

  return (
    <Group
      gap="lg"
      style={{ rowGap: "var(--mantine-spacing-xs)" }}
      data-testid="ironclad-champions"
    >
      {decided.map((division) => (
        <Stack gap={0} key={division.key} style={{ minWidth: 0 }}>
          <Group gap={4} wrap="nowrap">
            <IconTrophyFilled size={12} color="var(--mantine-color-yellow-6)" />
            <Text size="xs" c="dimmed" truncate="end">
              {division.displayName}
            </Text>
          </Group>
          <IroncladPlayerLink player={division.champion!} />
        </Stack>
      ))}
    </Group>
  );
};

export default IroncladChampions;
