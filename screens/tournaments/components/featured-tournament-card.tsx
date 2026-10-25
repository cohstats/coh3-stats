import React from "react";
import Link from "next/link";
import {
  Anchor,
  Avatar,
  Badge,
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
import { formatRecord, LadderHubSummary } from "../../../src/tournaments/ladder-tournament";
import { TournamentInfo } from "../../../src/tournaments/tournaments-registry";
import { getLadderTournamentRoute } from "../../../src/routes";
import { AnalyticsTournamentExternalClick } from "../../../src/firebase/analytics";
import LadderPlayerLink from "./ladder-player-link";
import classes from "../tournaments.module.css";

const LatestSeason = ({ summary }: { summary: LadderHubSummary }) => {
  const { t } = useTranslation("tournaments");
  const { latest, seasonsCount } = summary;

  return (
    <Stack gap="xs" data-testid="featured-latest-season">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
        {t("hub.latestSeason")}
      </Text>
      <Title order={3} size="h3">
        <Anchor
          component={Link}
          href={getLadderTournamentRoute(latest.seasonId)}
          inherit
          c="inherit"
          data-testid="featured-latest-season-link"
        >
          {t("league.season", { season: latest.seasonId })}
        </Anchor>
      </Title>
      <Text size="sm" c="dimmed">
        {t("hub.playersCount", { count: latest.players })}
        {" · "}
        {t("hub.castsCount", { count: latest.casts })}
      </Text>
      {latest.champions.length > 0 && (
        <Stack gap={6} mt="xs" data-testid="featured-champions">
          <Group gap={6} wrap="nowrap">
            <IconTrophyFilled size={16} color="var(--mantine-color-yellow-6)" />
            <Text size="sm" fw={700}>
              {t("hub.champions")}
            </Text>
            <Text size="sm" c="dimmed">
              {formatRecord(latest.championsRecord)}
            </Text>
          </Group>
          <Group gap="md">
            {latest.champions.map((champion) => (
              <LadderPlayerLink key={champion.relicId} {...champion} />
            ))}
          </Group>
        </Stack>
      )}
      {seasonsCount > 1 && (
        <Text size="sm" c="dimmed" mt="xs">
          {t("hub.seasonsCount", { count: seasonsCount })}
        </Text>
      )}
    </Stack>
  );
};

/**
 * Tournament with its own league page on COH3 Stats, with the latest season from the data.
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
            <Button
              component={Link}
              href={getLadderTournamentRoute()}
              rightSection={<IconArrowRight size={16} />}
              data-testid="featured-open-league"
            >
              {t("hub.openLeague")}
            </Button>
            <Button
              component="a"
              href={tournament.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="default"
              rightSection={<IconExternalLink size={16} />}
              onClick={() => AnalyticsTournamentExternalClick(tournament.id)}
            >
              {t("hub.officialSite")}
            </Button>
          </Group>
        </Stack>
        <Paper radius="md" p="md" className={classes.featuredData}>
          {summary ? (
            <LatestSeason summary={summary} />
          ) : (
            <Text c="dimmed" data-testid="featured-unavailable">
              {t("hub.unavailable")}
            </Text>
          )}
        </Paper>
      </SimpleGrid>
    </Paper>
  );
};

export default FeaturedTournamentCard;
