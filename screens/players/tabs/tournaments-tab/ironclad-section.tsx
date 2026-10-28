import React, { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconTrophy,
} from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type {
  PlayerIroncladEntry,
  PlayerIroncladMatch,
  PlayerIroncladTournament,
} from "../../../../src/players/tournaments";
import { getIroncladTournamentRoute, getPlayerCardRoute } from "../../../../src/routes";
import classes from "./tournaments-tab.module.css";

const COLUMNS_COUNT = 5;

const RESULT_COLORS: Record<PlayerIroncladEntry["result"], string> = {
  champion: "yellow",
  runnerUp: "gray",
  eliminated: "red",
  inProgress: "orange",
  registered: "blue",
};

const ResultBadge = ({ entry }: { entry: PlayerIroncladEntry }) => {
  const { t } = useTranslation("players");

  return (
    <Badge
      color={RESULT_COLORS[entry.result]}
      variant={entry.result === "eliminated" ? "outline" : "light"}
      leftSection={entry.result === "champion" ? <IconTrophy size={13} /> : undefined}
      tt="none"
      data-testid="ironclad-entry-result"
    >
      {t(`tournaments.ironclad.result.${entry.result}`, { round: entry.eliminatedIn })}
    </Badge>
  );
};

const MatchRow = ({ match }: { match: PlayerIroncladMatch }) => {
  const { t } = useTranslation("players");
  const opponent = match.opponent;

  let outcome: React.ReactNode;
  if (match.won === null) {
    outcome = (
      <Text span size="sm" c="dimmed">
        {t("tournaments.ironclad.match.pending")}
      </Text>
    );
  } else {
    outcome = (
      <Text span size="sm" fw={700} c={match.won ? "green" : "red"}>
        {t(match.won ? "tournaments.ironclad.match.won" : "tournaments.ironclad.match.lost")}
      </Text>
    );
  }

  return (
    <Group gap="sm" wrap="nowrap" data-testid={`ironclad-player-match-${match.id}`}>
      <Text size="sm" c="dimmed" w={120} style={{ flexShrink: 0 }}>
        {match.roundName}
      </Text>
      <Group w={28} justify="center" style={{ flexShrink: 0 }}>
        {outcome}
      </Group>
      <Text
        size="sm"
        fw={600}
        w={44}
        style={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {match.playerScore ?? "–"}–{match.opponentScore ?? "–"}
      </Text>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {t("tournaments.ironclad.match.vs")}
      </Text>
      {opponent ? (
        opponent.relicId !== null ? (
          <Anchor
            component={Link}
            href={getPlayerCardRoute(opponent.relicId)}
            size="sm"
            truncate="end"
          >
            {opponent.eventAlias}
          </Anchor>
        ) : (
          <Text size="sm" truncate="end">
            {opponent.eventAlias}
          </Text>
        )
      ) : (
        // Without an opponent a decided match is a bye
        <Text size="sm" c="dimmed" fs="italic">
          {t(
            match.won !== null
              ? "tournaments.ironclad.match.bye"
              : "tournaments.ironclad.match.tbd",
          )}
        </Text>
      )}
      {match.forfeit && (
        <Badge size="xs" color="gray" variant="outline" style={{ flexShrink: 0 }}>
          {t("tournaments.ironclad.match.forfeit")}
        </Badge>
      )}
    </Group>
  );
};

const EntryRows = ({ entry }: { entry: PlayerIroncladEntry }) => {
  const { t } = useTranslation("players");
  const [expanded, setExpanded] = useState(false);
  const route = getIroncladTournamentRoute(entry.tournamentSlug, entry.divisionKey);

  return (
    <>
      <Table.Tr data-testid={`ironclad-entry-${entry.registrationId}`}>
        <Table.Td>
          <Anchor
            component={Link}
            href={route}
            fw={600}
            data-testid={`ironclad-entry-link-${entry.registrationId}`}
          >
            {entry.tournamentName}
          </Anchor>
          {entry.matches.length > 0 && (
            <Button
              variant="subtle"
              size="compact-xs"
              display="block"
              px={0}
              onClick={() => setExpanded((value) => !value)}
              rightSection={
                expanded ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />
              }
              aria-expanded={expanded}
              data-testid={`ironclad-entry-toggle-${entry.registrationId}`}
            >
              {expanded
                ? t("tournaments.ironclad.hideMatches")
                : t("tournaments.ironclad.showMatches", { count: entry.matches.length })}
            </Button>
          )}
        </Table.Td>
        <Table.Td>
          <Text size="sm">{entry.divisionName}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{entry.eventElo ?? "—"}</Text>
        </Table.Td>
        <Table.Td>
          <ResultBadge entry={entry} />
        </Table.Td>
        <Table.Td>
          <Text span c="green">
            {entry.wins}
          </Text>
          <Text span c="dimmed">
            {" / "}
          </Text>
          <Text span c="red">
            {entry.losses}
          </Text>
        </Table.Td>
      </Table.Tr>
      {expanded && (
        <Table.Tr className={classes.castsRow}>
          <Table.Td colSpan={COLUMNS_COUNT} py="sm">
            <Stack gap={6}>
              {entry.matches.map((match) => (
                <MatchRow match={match} key={match.id} />
              ))}
            </Stack>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
};

/**
 * IronClad history of the player - one row per division the player registered in,
 * linking to the division bracket on COH3 Stats.
 */
const IroncladSection = ({
  tournament,
  playerName,
}: {
  tournament: PlayerIroncladTournament;
  playerName: string;
}) => {
  const { t } = useTranslation("players");
  const { aggregate } = tournament;

  const aggregateParts = [
    t("tournaments.ironclad.aggregate.tournaments", { count: aggregate.tournaments }),
    t("tournaments.aggregate.matches", { count: aggregate.matches }),
    `${aggregate.wins} / ${aggregate.losses}`,
  ];

  let content: React.ReactNode;
  if (tournament.entries.length === 0) {
    content = (
      <Text c="dimmed" px="lg" pb="md">
        {tournament.unavailable
          ? t("tournaments.unavailable")
          : t("tournaments.noData", { name: playerName })}
      </Text>
    );
  } else {
    content = (
      <Table.ScrollContainer minWidth={640} type="native">
        <Table layout="fixed" verticalSpacing="sm" horizontalSpacing="lg">
          <Table.Thead className={classes.head}>
            <Table.Tr>
              <Table.Th className={classes.headCell}>
                {t("tournaments.ironclad.columns.tournament")}
              </Table.Th>
              <Table.Th w="16%" className={classes.headCell}>
                {t("tournaments.ironclad.columns.division")}
              </Table.Th>
              <Table.Th w="13%" className={classes.headCell}>
                {t("tournaments.ironclad.columns.eventElo")}
              </Table.Th>
              <Table.Th w="22%" className={classes.headCell}>
                {t("tournaments.ironclad.columns.result")}
              </Table.Th>
              <Table.Th w="11%" className={classes.headCell}>
                {t("tournaments.ironclad.columns.winsLosses")}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tournament.entries.map((entry) => (
              <EntryRows entry={entry} key={entry.registrationId} />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  }

  return (
    <Paper
      withBorder
      radius="md"
      p={0}
      style={{ overflow: "hidden" }}
      data-testid={`tournament-section-${tournament.id}`}
    >
      <Group justify="space-between" wrap="wrap" gap="sm" px="lg" py="md">
        <Group gap="sm" wrap="nowrap">
          <Avatar
            src={tournament.logo}
            alt={t(tournament.nameKey)}
            size={40}
            radius="sm"
            color={tournament.color}
            variant="light"
            imageProps={{ loading: "lazy" }}
          >
            {tournament.monogram}
          </Avatar>
          <Stack gap={2}>
            <Title order={3} size="h4" fw={700}>
              {t(tournament.nameKey)}
            </Title>
            <Text size="sm" c="dimmed">
              {t("tournaments.communityTournament")}
              {" · "}
              <Anchor
                href={tournament.url}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
              >
                {t("tournaments.visitSite")}
                <IconExternalLink size={13} />
              </Anchor>
            </Text>
          </Stack>
        </Group>
        {tournament.entries.length > 0 && (
          <Text size="sm" c="dimmed">
            {aggregateParts.join(" · ")}
            {aggregate.titles > 0 && (
              <>
                {" · "}
                <Text span c="yellow" fw={600} inherit>
                  {t("tournaments.summary.titles", { count: aggregate.titles })}
                </Text>
              </>
            )}
          </Text>
        )}
      </Group>
      {content}
    </Paper>
  );
};

export default IroncladSection;
