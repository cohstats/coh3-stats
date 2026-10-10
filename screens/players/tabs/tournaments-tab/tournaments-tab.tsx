import React from "react";
import {
  Anchor,
  Avatar,
  Badge,
  Box,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconPlayerPlayFilled, IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type { LadderTournamentPlayerData } from "../../../../src/apis/ladder-tournament-api";
import {
  buildLadderTournament,
  getTournamentAggregate,
  PlayerTournament,
  PlayerTournamentAggregate,
  PlayerTournamentSeason,
} from "../../../../src/players/tournaments";
import TournamentVideoCard from "../../../../components/tournament-videos/tournament-video-card";
import classes from "./tournaments-tab.module.css";

const COLUMNS_COUNT = 7;

interface TournamentsTabProps {
  // null until the data are loaded with SSR
  tournamentData: LadderTournamentPlayerData | null;
  playerName: string;
}

const Dash = () => <Text c="dimmed">—</Text>;

const formatWinRate = (winRate: number) => `${Math.round(winRate * 100)}%`;

const SeasonRows = ({ season }: { season: PlayerTournamentSeason }) => {
  const { t } = useTranslation("players");
  const { stats, titles, casts } = season;

  return (
    <>
      <Table.Tr data-testid={`tournament-season-${season.seasonId}`}>
        <Table.Td>
          <Text fw={600}>{t("tournaments.season", { season: season.seasonId })}</Text>
        </Table.Td>
        <Table.Td>
          {titles.length > 0 ? (
            <Group gap={4}>
              {titles.map((title) => (
                <Badge
                  key={title}
                  color="yellow"
                  variant="light"
                  leftSection={<IconTrophy size={13} />}
                >
                  {t(`tournaments.titles.${title}`)}
                </Badge>
              ))}
            </Group>
          ) : (
            <Dash />
          )}
        </Table.Td>
        <Table.Td>{stats ? stats.matches : <Dash />}</Table.Td>
        <Table.Td>
          {stats ? (
            <>
              <Text span c="green">
                {stats.wins}
              </Text>
              <Text span c="dimmed">
                {" / "}
              </Text>
              <Text span c="red">
                {stats.losses}
              </Text>
            </>
          ) : (
            <Dash />
          )}
        </Table.Td>
        <Table.Td>{stats ? formatWinRate(stats.winRate) : <Dash />}</Table.Td>
        <Table.Td>{stats ? stats.score : <Dash />}</Table.Td>
        <Table.Td>
          {casts.length > 0 ? (
            <Group gap={6} wrap="nowrap" className={classes.castsLabel}>
              <IconPlayerPlayFilled size={12} />
              <Text span fw={600} size="sm">
                {t("tournaments.casts", { count: casts.length })}
              </Text>
            </Group>
          ) : (
            <Dash />
          )}
        </Table.Td>
      </Table.Tr>
      {casts.length > 0 && (
        <Table.Tr className={classes.castsRow}>
          <Table.Td colSpan={COLUMNS_COUNT} py="md">
            <ScrollArea type="auto" offsetScrollbars scrollbarSize={8}>
              <Group gap="sm" wrap="nowrap" align="stretch">
                {casts.map((video, index) => (
                  <Box
                    className={classes.castCard}
                    key={`${video.videoUrlYoutube || video.videoUrlTwitch}-${index}`}
                  >
                    <TournamentVideoCard video={video} index={index} />
                  </Box>
                ))}
              </Group>
            </ScrollArea>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
};

const TournamentSection = ({
  tournament,
  aggregate,
  playerName,
}: {
  tournament: PlayerTournament;
  aggregate: PlayerTournamentAggregate;
  playerName: string;
}) => {
  const { t } = useTranslation("players");

  const aggregateParts = [
    t("tournaments.aggregate.seasons", { count: aggregate.seasons }),
    t("tournaments.aggregate.matches", { count: aggregate.matches }),
  ];
  if (aggregate.winRate !== null) {
    aggregateParts.push(
      t("tournaments.aggregate.winRate", { winRate: formatWinRate(aggregate.winRate) }),
    );
  }

  // Without the ranking we can't say the player hasn't played, the casts (if any) are still shown
  const unavailableNotice = tournament.unavailable && (
    <Text c="dimmed" px="lg" pb="md">
      {t("tournaments.unavailable")}
    </Text>
  );

  let content: React.ReactNode;
  if (tournament.seasons.length === 0) {
    content = unavailableNotice || (
      <Text c="dimmed" px="lg" pb="md">
        {t("tournaments.noData", { name: playerName })}
      </Text>
    );
  } else {
    content = (
      <>
        {unavailableNotice}
        <Table.ScrollContainer minWidth={820} type="native">
          <Table layout="fixed" verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead className={classes.head}>
              <Table.Tr>
                <Table.Th w="13%" className={classes.headCell}>
                  {t("tournaments.columns.season")}
                </Table.Th>
                <Table.Th className={classes.headCell}>
                  {t("tournaments.columns.result")}
                </Table.Th>
                <Table.Th w="10%" className={classes.headCell}>
                  {t("tournaments.columns.matches")}
                </Table.Th>
                <Table.Th w="11%" className={classes.headCell}>
                  {t("tournaments.columns.winsLosses")}
                </Table.Th>
                <Table.Th w="11%" className={classes.headCell}>
                  {t("tournaments.columns.winRate")}
                </Table.Th>
                <Table.Th w="9%" className={classes.headCell}>
                  {t("tournaments.columns.score")}
                </Table.Th>
                <Table.Th w="15%" className={classes.headCell}>
                  {t("tournaments.columns.casts")}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tournament.seasons.map((season) => (
                <SeasonRows season={season} key={season.seasonId} />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </>
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
        {aggregate.seasons > 0 && (
          <Text size="sm" c="dimmed">
            {aggregateParts.join(" · ")}
          </Text>
        )}
      </Group>
      {content}
    </Paper>
  );
};

const TournamentsTab = ({ tournamentData, playerName }: TournamentsTabProps) => {
  const { t } = useTranslation("players");

  if (!tournamentData) {
    return (
      <Stack align="center" gap="md" style={{ minHeight: "900px" }}>
        <Loader size="lg" pt={"150px"} />
      </Stack>
    );
  }

  // More tournaments can be added here, they share the same shape
  const tournaments = [buildLadderTournament(tournamentData)].map((tournament) => ({
    tournament,
    aggregate: getTournamentAggregate(tournament.seasons),
  }));

  const playedTournamentsCount = tournaments.filter(
    ({ aggregate }) => aggregate.seasons > 0,
  ).length;
  const totals = tournaments.reduce(
    (acc, { aggregate }) => ({
      seasons: acc.seasons + aggregate.seasons,
      titles: acc.titles + aggregate.titles,
    }),
    { seasons: 0, titles: 0 },
  );

  return (
    <Container
      size="lg"
      p="md"
      style={{ minHeight: "900px" }}
      data-testid="player-tournaments-tab"
    >
      <Stack gap="lg">
        <Group gap="md" align="baseline" wrap="wrap">
          <Title order={1} size="h2">
            {t("tournaments.title")}
          </Title>
          {totals.seasons > 0 && (
            <Text size="sm" c="dimmed" data-testid="tournaments-summary">
              {t("tournaments.summary.tournaments", { count: playedTournamentsCount })}
              {" · "}
              {t("tournaments.summary.seasons", { count: totals.seasons })}
              {totals.titles > 0 && (
                <>
                  {" · "}
                  <Text span c="yellow" fw={600} inherit>
                    {t("tournaments.summary.titles", { count: totals.titles })}
                  </Text>
                </>
              )}
            </Text>
          )}
        </Group>

        {tournaments.map(({ tournament, aggregate }) => (
          <TournamentSection
            tournament={tournament}
            aggregate={aggregate}
            playerName={playerName}
            key={tournament.id}
          />
        ))}
      </Stack>
    </Container>
  );
};

export default TournamentsTab;
