import React from "react";
import {
  Anchor,
  Badge,
  Container,
  Group,
  Loader,
  Space,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type {
  LadderTournamentPlayerData,
  LadderTournamentRankingItem,
} from "../../../../src/apis/ladder-tournament-api";
import TournamentVideosPanel from "../../../../components/tournament-videos/tournament-videos-panel";

const LADDER_TOURNAMENT_URL = "https://laddertournament.com.br";

const LADDER_TOURNAMENT_TITLES = [
  "ladderwinner",
  "ironcladwinner",
  "metaplayswinner",
  "championsOfheroeswinner",
  "thelegend",
] as const;

interface TournamentsTabProps {
  // null until the data are loaded with SSR
  tournamentData: LadderTournamentPlayerData | null;
  playerName: string;
}

const LadderTournamentTable = ({ ranking }: { ranking: LadderTournamentRankingItem[] }) => {
  const { t } = useTranslation("players");

  const rows = ranking.map((item) => {
    const titles = LADDER_TOURNAMENT_TITLES.filter((title) => item[title] === "Yes");

    return (
      <Table.Tr key={item.seasonid}>
        <Table.Td>
          <Text fw={500}>
            {t("tournaments.ladderTournament.season", { season: item.seasonid })}
          </Text>
        </Table.Td>
        <Table.Td>{item.matches}</Table.Td>
        <Table.Td>
          <Text span c="green">
            {item.wins}
          </Text>
          {" / "}
          <Text span c="red">
            {item.losses}
          </Text>
        </Table.Td>
        <Table.Td>{Math.round(item.rating * 100)}%</Table.Td>
        <Table.Td>{item.score}</Table.Td>
        <Table.Td>
          <Group gap={4}>
            {titles.map((title) => (
              <Badge
                key={title}
                color="yellow"
                variant="light"
                leftSection={<IconTrophy size={12} />}
              >
                {t(`tournaments.ladderTournament.titles.${title}`)}
              </Badge>
            ))}
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover verticalSpacing="xs" data-testid="ladder-tournament-table">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("tournaments.ladderTournament.columns.season")}</Table.Th>
            <Table.Th>{t("tournaments.ladderTournament.columns.matches")}</Table.Th>
            <Table.Th>{t("tournaments.ladderTournament.columns.winsLosses")}</Table.Th>
            <Table.Th>{t("tournaments.ladderTournament.columns.winRate")}</Table.Th>
            <Table.Th>{t("tournaments.ladderTournament.columns.score")}</Table.Th>
            <Table.Th>{t("tournaments.ladderTournament.columns.titles")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
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

  const { videos, ladderRanking } = tournamentData;

  let ladderContent: React.ReactNode;
  if (ladderRanking === null) {
    ladderContent = <Text c="dimmed">{t("tournaments.ladderTournament.unavailable")}</Text>;
  } else if (ladderRanking.length === 0) {
    ladderContent = (
      <Text c="dimmed">{t("tournaments.ladderTournament.noData", { name: playerName })}</Text>
    );
  } else {
    ladderContent = <LadderTournamentTable ranking={ladderRanking} />;
  }

  return (
    <Container
      size="lg"
      p="md"
      style={{ minHeight: "900px" }}
      data-testid="player-tournaments-tab"
    >
      <TournamentVideosPanel
        videos={videos}
        title={t("tournaments.videosTitle")}
        emptyText={t("tournaments.noVideos", { name: playerName })}
      />

      <Space h="xl" />
      <Title order={2} size="h2">
        {t("tournaments.title")}
      </Title>
      <Space h="md" />

      <Stack gap="xs" data-testid="ladder-tournament-section">
        <Title order={3} size="h3">
          {t("tournaments.ladderTournament.title")}
        </Title>
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {t("tournaments.ladderTournament.description")}
          </Text>
          <Anchor href={LADDER_TOURNAMENT_URL} target="_blank" size="sm">
            <Group gap={4} wrap="nowrap">
              {t("tournaments.ladderTournament.link")}
              <IconExternalLink size={14} />
            </Group>
          </Anchor>
        </Group>
        {ladderContent}
      </Stack>
    </Container>
  );
};

export default TournamentsTab;
