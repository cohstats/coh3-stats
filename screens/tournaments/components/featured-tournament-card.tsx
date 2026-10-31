import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconExternalLink, IconTrophyFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import {
  formatRecord,
  isLadderSeasonCurrent,
  LadderHubSummary,
  LadderSeasonSummary,
} from "../../../src/tournaments/ladder-tournament";
import { TournamentInfo } from "../../../src/tournaments/tournaments-registry";
import { getLadderTournamentRoute } from "../../../src/routes";
import { AnalyticsTournamentExternalClick } from "../../../src/firebase/analytics";
import LadderPlayerLink from "./ladder-player-link";
import {
  formatLadderDateRange,
  getLadderSeasonTitle,
  LadderSeasonInfoRows,
  LadderSeasonStatusBadge,
} from "./ladder-season";
import classes from "../tournaments.module.css";

const SeasonChampions = ({ season }: { season: LadderSeasonSummary }) => {
  const { t } = useTranslation("tournaments");

  return (
    <Group gap="sm" data-testid="featured-champions">
      <Group gap={6} wrap="nowrap">
        <IconTrophyFilled size={16} color="var(--mantine-color-yellow-6)" />
        <Text size="sm" fw={700}>
          {t("hub.champions")}
        </Text>
        <Text size="sm" c="dimmed">
          {formatRecord(season.championsRecord)}
        </Text>
      </Group>
      {season.champions.map((champion) => (
        <LadderPlayerLink key={champion.relicId} {...champion} />
      ))}
    </Group>
  );
};

/**
 * Past season below the featured one - the champions of the season.
 */
const RecentSeasonCard = ({ season }: { season: LadderSeasonSummary }) => {
  const { t } = useTranslation("tournaments");

  return (
    <Paper
      radius="md"
      px="md"
      py="sm"
      className={classes.featuredData}
      data-testid={`ladder-hub-recent-${season.seasonId}`}
    >
      <Stack gap={6}>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Text fw={700} truncate="end">
            <Anchor
              component={Link}
              href={getLadderTournamentRoute(season.seasonId)}
              inherit
              c="inherit"
            >
              {getLadderSeasonTitle(t, season)}
            </Anchor>
          </Text>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
            {t("hub.playersCount", { count: season.players })}
          </Text>
        </Group>
        {season.champions.length > 0 && <SeasonChampions season={season} />}
      </Stack>
    </Paper>
  );
};

const FeaturedSeason = ({ season }: { season: LadderSeasonSummary }) => {
  const { t } = useTranslation("tournaments");
  const { locale = "en" } = useRouter();
  const isCurrent = isLadderSeasonCurrent(season);
  const hasResults = season.players > 0 || season.casts > 0;
  // The info rows of the current season have the dates already
  const showInfoRows = isCurrent && season.info !== null;

  return (
    <Stack gap="xs" data-testid="featured-latest-season">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
        {t(isCurrent ? "hub.currentSeason" : "hub.latestSeason")}
      </Text>
      <Title order={3} size="h3">
        <Anchor
          component={Link}
          href={getLadderTournamentRoute(season.seasonId)}
          inherit
          c="inherit"
          data-testid="featured-latest-season-link"
        >
          {getLadderSeasonTitle(t, season)}
        </Anchor>
      </Title>
      <Group gap={6}>
        {season.info && <LadderSeasonStatusBadge status={season.info.status} />}
        {(hasResults || !season.info) && (
          <Text size="sm" c="dimmed">
            {t("hub.playersCount", { count: season.players })}
            {" · "}
            {t("hub.castsCount", { count: season.casts })}
          </Text>
        )}
        {!hasResults && season.info && !showInfoRows && (
          <Text size="sm" c="dimmed">
            {t("hub.ladderDates", {
              dates: formatLadderDateRange(
                season.info.ladderStart,
                season.info.ladderEnd,
                locale,
              ),
            })}
          </Text>
        )}
      </Group>
      {season.champions.length > 0 && (
        <Box mt="xs">
          <SeasonChampions season={season} />
        </Box>
      )}
      {showInfoRows && season.info && (
        <Box mt="xs">
          <LadderSeasonInfoRows info={season.info} />
        </Box>
      )}
    </Stack>
  );
};

/**
 * Tournament with its own league page on COH3 Stats - the current season (or the latest one)
 * and the champions of the recent seasons.
 * @param summary null when the data couldn't be loaded
 */
const FeaturedTournamentCard = ({
  tournament,
  summary,
}: {
  tournament: TournamentInfo;
  summary: LadderHubSummary | null;
}) => {
  const { t } = useTranslation("tournaments");

  return (
    <Paper withBorder radius="md" p="lg" data-testid={`tournament-card-${tournament.id}`}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Stack gap="md">
          <Group gap="md" wrap="nowrap">
            <Avatar
              src={tournament.logo}
              alt={t(tournament.nameKey)}
              size={96}
              radius="md"
              color={tournament.color}
              variant="light"
            >
              {tournament.monogram}
            </Avatar>
            <Stack gap={4}>
              <Title order={2} size="h3">
                {t(tournament.nameKey)}
              </Title>
              <Badge color="green" variant="light" w="fit-content">
                {t("hub.statsBadge")}
              </Badge>
            </Stack>
          </Group>
          <Text size="sm">{t(tournament.descriptionKey)}</Text>
          <Group gap="sm">
            {summary && (
              <Button
                component={Link}
                href={getLadderTournamentRoute(summary.featured.seasonId)}
                rightSection={<IconArrowRight size={16} />}
                data-testid="featured-open-season"
              >
                {t("hub.openSeason")}
              </Button>
            )}
            <Button
              component={Link}
              href={getLadderTournamentRoute()}
              variant={summary ? "default" : "filled"}
              data-testid="featured-all-seasons"
            >
              {t("hub.allSeasons")}
            </Button>
            <Button
              component="a"
              href={tournament.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              rightSection={<IconExternalLink size={16} />}
              onClick={() => AnalyticsTournamentExternalClick(tournament.id)}
              data-testid="featured-external"
            >
              {t("hub.officialSite")}
            </Button>
          </Group>
        </Stack>
        <Paper radius="md" p="md" className={classes.featuredData}>
          {summary ? (
            <FeaturedSeason season={summary.featured} />
          ) : (
            <Text c="dimmed" data-testid="featured-unavailable">
              {t("hub.unavailable")}
            </Text>
          )}
        </Paper>
      </SimpleGrid>
      {summary && summary.recent.length > 0 && (
        <Stack gap="xs" mt="lg" data-testid="ladder-hub-recent">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
            {t("hub.recentSeasons")}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {summary.recent.map((season) => (
              <RecentSeasonCard season={season} key={season.seasonId} />
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </Paper>
  );
};

export default FeaturedTournamentCard;
