import React from "react";
import { useRouter } from "next/router";
import { Badge, BadgeProps, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { TFunction, useTranslation } from "next-i18next/pages";
import type {
  LadderSeasonInfo,
  LadderSeasonSummary,
} from "../../../src/tournaments/ladder-tournament";
import { formatTournamentDate } from "./ironclad-badges";

/**
 * Ladder Tournament season pieces shared by the hub and the league pages.
 */

// Keyed by the lowercase API status
const SEASON_STATUS_COLORS: Record<string, string> = {
  draft: "blue",
  active: "orange",
  finished: "gray",
};

/**
 * "Season 2 · Blood and Steel", or "Season 2" when the season has no name.
 */
export const getLadderSeasonTitle = (
  t: TFunction,
  summary: Pick<LadderSeasonSummary, "seasonId" | "info">,
) =>
  summary.info?.name
    ? t("league.seasonWithName", { season: summary.seasonId, name: summary.info.name })
    : t("league.season", { season: summary.seasonId });

export const formatLadderDateRange = (start: string, end: string, locale: string) =>
  `${formatTournamentDate(start, locale)} – ${formatTournamentDate(end, locale)}`;

/**
 * Status of the season as sent by the API, the unknown statuses are shown as they are.
 */
export const LadderSeasonStatusBadge = ({
  status,
  ...props
}: { status: string } & Omit<BadgeProps, "children" | "color">) => {
  const { t } = useTranslation("tournaments");
  const key = status.trim().toLowerCase();
  // Own keys only, "constructor" or "__proto__" must not resolve to a color
  const known = Object.prototype.hasOwnProperty.call(SEASON_STATUS_COLORS, key);

  return (
    <Badge
      color={known ? SEASON_STATUS_COLORS[key] : "gray"}
      variant="light"
      data-testid="ladder-season-status"
      {...props}
    >
      {known ? t(`league.status.${key}`) : status}
    </Badge>
  );
};

const useSeasonInfoItems = (info: LadderSeasonInfo) => {
  const { t } = useTranslation("tournaments");
  const { locale = "en" } = useRouter();

  return [
    {
      key: "registration",
      label: t("league.info.registration"),
      value: formatLadderDateRange(info.registrationStart, info.registrationEnd, locale),
    },
    {
      key: "ladder",
      label: t("league.info.ladder"),
      value: formatLadderDateRange(info.ladderStart, info.ladderEnd, locale),
    },
    {
      key: "playoffs",
      label: t("league.info.playoffs"),
      value: t("league.info.playoffsValue", {
        playoffCut: info.playoffCut,
        semifinalCut: info.semifinalCut,
      }),
    },
    {
      key: "format",
      label: t("league.info.format"),
      // Usually all the playoff stages have the same format
      value:
        info.bestOf.funnel === info.bestOf.semifinal && info.bestOf.funnel === info.bestOf.final
          ? t("league.info.formatShortValue", {
              ladder: info.bestOf.ladder,
              playoffs: info.bestOf.funnel,
            })
          : t("league.info.formatValue", info.bestOf),
    },
  ];
};

/**
 * Calendar, playoffs, match format and the challenge rules.
 */
export const LadderSeasonInfoCard = ({ info }: { info: LadderSeasonInfo }) => {
  const { t } = useTranslation("tournaments");
  const items = useSeasonInfoItems(info);

  return (
    <Paper withBorder radius="md" p="md" data-testid="ladder-season-info">
      <Stack gap="sm">
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
          {items.map((item) => (
            <Stack gap={2} key={item.key} data-testid={`ladder-season-info-${item.key}`}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
                {item.label}
              </Text>
              <Text size="sm" fw={600}>
                {item.value}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>
        <Text size="sm" c="dimmed" data-testid="ladder-season-info-challenge">
          {t("league.info.challenge", {
            positions: info.challenge.maxPositions,
            hours: info.challenge.responseHours,
            days: info.challenge.matchDeadlineDays,
          })}{" "}
          {t("league.info.rematch", {
            days: info.challenge.rematchDays,
            matches: info.challenge.rematchOtherMatches,
            inactivity: info.challenge.inactivityDays,
          })}
        </Text>
      </Stack>
    </Paper>
  );
};
