import React from "react";
import Link from "next/link";
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
import { DivisionStateBadge, RegistrationBadge, TournamentStatusBadge } from "./ironclad-badges";
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

const LastChampions = ({ tournament }: { tournament: IroncladTournamentSummary }) => {
  const { t } = useTranslation("tournaments");
  const divisions = tournament.divisions.filter((division) => division.champion);
  if (divisions.length === 0) return null;

  return (
    <Stack gap={6} mt="xs" data-testid="ironclad-hub-last-champions">
      <Group gap={6} wrap="nowrap">
        <IconTrophyFilled size={16} color="var(--mantine-color-yellow-6)" />
        <Text size="sm" fw={700}>
          <Anchor
            component={Link}
            href={getIroncladTournamentRoute(tournament.slug)}
            inherit
            c="inherit"
          >
            {t("hub.lastChampions", { name: tournament.name })}
          </Anchor>
        </Text>
      </Group>
      <Group gap="lg">
        {divisions.map((division) => (
          <Stack gap={0} key={division.key} style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed">
              {division.displayName}
            </Text>
            <IroncladPlayerLink player={division.champion!} />
          </Stack>
        ))}
      </Group>
    </Stack>
  );
};

const FeaturedTournament = ({ summary }: { summary: IroncladHubSummary }) => {
  const { t } = useTranslation("tournaments");
  const { featured, lastCompleted, tournamentsCount } = summary;
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
      {lastCompleted && <LastChampions tournament={lastCompleted} />}
      {tournamentsCount > 1 && (
        <Text size="sm" c="dimmed" mt="xs">
          {t("hub.tournamentsCount", { count: tournamentsCount })}
        </Text>
      )}
    </Stack>
  );
};

/**
 * IronClad with the live data from the partner API - the current tournament, its divisions
 * and the latest champions. Without the data the hub shows the organiser card instead.
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
    </Paper>
  );
};

export default IroncladFeaturedCard;
