import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconExternalLink, IconTrophyFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type {
  IroncladDivisionSummary,
  IroncladHubSummary,
  IroncladTournamentSummary,
} from "../../../src/tournaments/ironclad-tournament";
import { TournamentInfo } from "../../../src/tournaments/tournaments-registry";
import { getIroncladTournamentRoute, getIroncladTournamentsRoute } from "../../../src/routes";
import { AnalyticsTournamentExternalClick } from "../../../src/firebase/analytics";
import IroncladPlayerLink from "./ironclad-player-link";
import IroncladChampions from "./ironclad-champions";
import {
  DivisionStateBadge,
  formatTournamentDate,
  RegistrationBadge,
  TournamentStatusBadge,
} from "./ironclad-badges";
import classes from "../tournaments.module.css";

const DivisionFillRow = ({ division }: { division: IroncladDivisionSummary }) => {
  const { t } = useTranslation("tournaments");
  const fill = division.capacity > 0 ? (division.approvedCount / division.capacity) * 100 : 0;

  return (
    <Stack gap={4} data-testid={`ironclad-hub-division-${division.key}`}>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
          <Text size="sm" fw={700} truncate="end">
            {division.displayName}
          </Text>
          <Text size="xs" c="dimmed" truncate="end">
            {division.eloRule}
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          {division.champion ? (
            <Group gap={4} wrap="nowrap">
              <IconTrophyFilled size={14} color="var(--mantine-color-yellow-6)" />
              <IroncladPlayerLink player={division.champion} />
            </Group>
          ) : (
            <Text size="xs" c="dimmed">
              {t("ironclad.divisionFill", {
                count: division.approvedCount,
                capacity: division.capacity,
              })}
            </Text>
          )}
          <DivisionStateBadge state={division.state} />
        </Group>
      </Group>
      {!division.champion && (
        <Progress
          value={fill}
          size="sm"
          radius="xl"
          color={division.state === "in_progress" ? "orange" : "blue"}
          aria-label={division.displayName}
        />
      )}
    </Stack>
  );
};

/**
 * Completed tournament below the current one - the champions of each division.
 */
const RecentTournamentCard = ({ tournament }: { tournament: IroncladTournamentSummary }) => {
  const { t } = useTranslation("tournaments");
  const { locale = "en" } = useRouter();
  const completedAt = formatTournamentDate(tournament.firstCompletedAt, locale);

  return (
    <Paper
      radius="md"
      px="md"
      py="sm"
      className={classes.featuredData}
      data-testid={`ironclad-hub-recent-${tournament.slug}`}
    >
      <Stack gap={6}>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Text fw={700} truncate="end">
            <Anchor
              component={Link}
              href={getIroncladTournamentRoute(tournament.slug)}
              inherit
              c="inherit"
            >
              {tournament.name}
            </Anchor>
          </Text>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
            {completedAt
              ? t("ironclad.completedAt", { date: completedAt })
              : t("ironclad.playersCount", { count: tournament.approvedPlayers })}
          </Text>
        </Group>
        <IroncladChampions divisions={tournament.divisions} />
      </Stack>
    </Paper>
  );
};

const FeaturedTournament = ({ summary }: { summary: IroncladHubSummary }) => {
  const { t } = useTranslation("tournaments");
  const { featured } = summary;
  const isCurrent = featured.status !== "completed";

  return (
    <Stack gap="xs" data-testid="ironclad-hub-featured">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
        {t(isCurrent ? "hub.currentTournament" : "hub.latestTournament")}
      </Text>
      <Title order={3} size="h3">
        <Anchor
          component={Link}
          href={getIroncladTournamentRoute(featured.slug)}
          inherit
          c="inherit"
          data-testid="ironclad-hub-featured-link"
        >
          {featured.name}
        </Anchor>
      </Title>
      <Group gap={6}>
        <TournamentStatusBadge status={featured.status} />
        {isCurrent && <RegistrationBadge open={featured.registrationOpen} />}
        <Text size="sm" c="dimmed">
          {featured.format}
          {" · "}
          {t("ironclad.playersCount", { count: featured.approvedPlayers })}
        </Text>
      </Group>
      <Stack gap="sm" mt="xs">
        {featured.divisions.map((division) => (
          <DivisionFillRow division={division} key={division.key} />
        ))}
      </Stack>
    </Stack>
  );
};

/**
 * IronClad with the live data from the partner API - the current tournament with its divisions
 * and the champions of the latest completed tournaments. Without the data the hub shows the organiser card instead.
 */
const IroncladFeaturedCard = ({
  tournament,
  summary,
}: {
  tournament: TournamentInfo;
  summary: IroncladHubSummary;
}) => {
  const { t } = useTranslation("tournaments");
  const registerUrl = summary.featured.registrationOpen ? summary.featured.publicUrl : null;

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
              styles={{ image: { objectFit: "contain" } }}
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
          {!!tournament.tags?.length && (
            <Group gap={6}>
              {tournament.tags.map((tag) => (
                <Badge
                  key={tag.labelKey}
                  size="md"
                  radius="sm"
                  color={tag.emphasized ? tournament.color : "gray"}
                  variant="light"
                  tt="none"
                >
                  {t(tag.labelKey)}
                </Badge>
              ))}
            </Group>
          )}
          <Group gap="sm">
            <Button
              component={Link}
              href={getIroncladTournamentRoute(summary.featured.slug)}
              rightSection={<IconArrowRight size={16} />}
              data-testid="ironclad-hub-open-tournament"
            >
              {t("hub.openTournament")}
            </Button>
            <Button
              component={Link}
              href={getIroncladTournamentsRoute()}
              variant="default"
              data-testid="ironclad-hub-all-tournaments"
            >
              {t("hub.allTournaments")}
            </Button>
            <Button
              component="a"
              href={registerUrl ?? tournament.url}
              target="_blank"
              rel="noopener noreferrer"
              variant={registerUrl ? "light" : "subtle"}
              color={registerUrl ? "green" : undefined}
              rightSection={<IconExternalLink size={16} />}
              onClick={() => AnalyticsTournamentExternalClick(tournament.id)}
              data-testid="ironclad-hub-external"
            >
              {t(registerUrl ? "hub.register" : (tournament.ctaKey ?? "hub.officialSite"))}
            </Button>
          </Group>
        </Stack>
        <Paper radius="md" p="md" className={classes.featuredData}>
          <FeaturedTournament summary={summary} />
        </Paper>
      </SimpleGrid>
      {summary.recent.length > 0 && (
        <Stack gap="xs" mt="lg" data-testid="ironclad-hub-recent">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
            {t("hub.recentTournaments")}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {summary.recent.map((recent) => (
              <RecentTournamentCard tournament={recent} key={recent.slug} />
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </Paper>
  );
};

export default IroncladFeaturedCard;
