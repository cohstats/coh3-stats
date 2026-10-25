import React from "react";
import { Group, Paper, Text, ThemeIcon } from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconStarFilled,
  IconSwords,
  IconTrophyFilled,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { formatRecord, LadderSeasonSummary } from "../../../src/tournaments/ladder-tournament";
import LadderPlayerLink from "../components/ladder-player-link";

const SeasonStat = ({
  icon,
  label,
  value,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  testId: string;
}) => (
  <Group gap={8} wrap="nowrap" data-testid={testId}>
    <ThemeIcon variant="light" color="gray" size="md" radius="md">
      {icon}
    </ThemeIcon>
    <Text size="sm" style={{ whiteSpace: "nowrap" }}>
      <Text span fw={700} inherit>
        {value}
      </Text>{" "}
      <Text span c="dimmed" inherit>
        {label}
      </Text>
    </Text>
  </Group>
);

/**
 * One compact bar with the season numbers on the left and the champions on the right.
 */
const SeasonStatsBar = ({ summary }: { summary: LadderSeasonSummary }) => {
  const { t } = useTranslation("tournaments");

  return (
    <Paper withBorder radius="md" px="md" py="sm" data-testid="ladder-season-stats">
      <Group justify="space-between" gap="md" wrap="wrap">
        <Group gap="lg" wrap="wrap">
          <SeasonStat
            icon={<IconUsers size={16} />}
            label={t("league.tiles.players")}
            value={summary.players}
            testId="ladder-stat-players"
          />
          <SeasonStat
            icon={<IconPlayerPlayFilled size={14} />}
            label={t("league.tiles.casts")}
            value={summary.casts}
            testId="ladder-stat-casts"
          />
          <SeasonStat
            icon={<IconSwords size={16} />}
            label={t("league.tiles.championsRecord")}
            value={formatRecord(summary.championsRecord)}
            testId="ladder-stat-record"
          />
          <SeasonStat
            icon={<IconStarFilled size={14} />}
            label={t("league.tiles.topScore")}
            value={summary.topScore ?? "—"}
            testId="ladder-stat-top-score"
          />
        </Group>
        {summary.champions.length > 0 && (
          <Group gap="sm" wrap="wrap" data-testid="ladder-champions">
            <Group gap={6} wrap="nowrap">
              <IconTrophyFilled size={18} color="var(--mantine-color-yellow-6)" />
              <Text size="sm" fw={700}>
                {t("league.champions")}
              </Text>
            </Group>
            {summary.champions.map((champion) => (
              <LadderPlayerLink key={champion.relicId} {...champion} />
            ))}
          </Group>
        )}
      </Group>
    </Paper>
  );
};

export default SeasonStatsBar;
