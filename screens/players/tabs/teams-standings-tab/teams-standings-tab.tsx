import {
  Container,
  Space,
  Title,
  Text,
  Stack,
  Loader,
  Alert,
  Group,
  Anchor,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { TeamsFullSummary } from "../../../../src/coh3/coh3-types";
import { TFunction } from "next-i18next";
import FactionIcon from "../../../../components/faction-icon";
import TeamsTable from "../components/teams-table";
import { getTeamsFullSummary } from "../../../../src/apis/coh3stats-api";
import { IconAlertCircle } from "@tabler/icons-react";
import { AnalyticsTeamsStandingsTabView } from "../../../../src/firebase/analytics";
import Link from "next/link";
import { getTeamLeaderboardsRoute } from "../../../../src/routes";

interface TeamsStandingsTabProps {
  profileID: string;
  t: TFunction;
}

const TeamsStandingsTab = ({ profileID, t }: TeamsStandingsTabProps) => {
  const [teamsData, setTeamsData] = useState<TeamsFullSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AnalyticsTeamsStandingsTabView(profileID);

    (async () => {
      if (!profileID) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getTeamsFullSummary(profileID);
        setTeamsData(data);
      } catch (err) {
        console.error("Error fetching teams data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch teams data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [profileID]);

  if (isLoading) {
    return (
      <Container size="lg" p="md">
        <Space h="lg" />
        <Title order={2}>{t("teamsStandings.title")}</Title>
        <Space h="xs" />
        <Text size="sm" c="dimmed">
          {t("teamsStandings.checkTeamDetails")}
        </Text>
        <Group>
          <Text size="sm" c="dimmed">
            {t("teamsStandings.checkTeamLeaderboardsPrefix")}
          </Text>
          <Anchor component={Link} href={getTeamLeaderboardsRoute()} size="sm">
            {t("leaderboards.teams.title", "Team Leaderboards")}
          </Anchor>
          <Text size="sm" c="dimmed">
            {t("teamsStandings.checkTeamLeaderboardsSuffix")}
          </Text>
        </Group>
        <Space h="md" />
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>{t("common.loading", "Loading...")}</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" p="md">
        <Space h="lg" />
        <Title order={2}>{t("teamsStandings.title")}</Title>
        <Space h="xs" />
        <Text size="sm" c="dimmed">
          {t("teamsStandings.checkTeamDetails")}
        </Text>
        <Group>
          <Text size="sm" c="dimmed">
            {t("teamsStandings.checkTeamLeaderboardsPrefix")}
          </Text>
          <Anchor component={Link} href={getTeamLeaderboardsRoute()} size="sm">
            {t("leaderboards.teams.title", "Team Leaderboards")}
          </Anchor>
          <Text size="sm" c="dimmed">
            {t("teamsStandings.checkTeamLeaderboardsSuffix")}
          </Text>
        </Group>
        <Space h="md" />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("common.error", "Error")}
          color="red"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // If we don't have data, show no data message
  if (!teamsData) {
    return (
      <Container size="lg" p="md">
        <Space h="lg" />
        <Title order={2}>{t("teamsStandings.title")}</Title>
        <Space h="xs" />
        <Text size="sm" c="dimmed">
          {t("teamsStandings.checkTeamDetails")}
        </Text>
        <Group>
          <Text size="sm" c="dimmed">
            {t("teamsStandings.checkTeamLeaderboardsPrefix")}
          </Text>
          <Anchor component={Link} href={getTeamLeaderboardsRoute()} size="sm">
            {t("leaderboards.teams.title", "Team Leaderboards")}
          </Anchor>
          <Text size="sm" c="dimmed">
            {t("teamsStandings.checkTeamLeaderboardsSuffix")}
          </Text>
        </Group>
        <Space h="md" />
        <Text>{t("teamsStandings.noData")}</Text>
      </Container>
    );
  }

  // Prepare the teams data for display
  const displayData = {
    axisTeams: teamsData.axisTeams || [],
    alliesTeams: teamsData.alliesTeams || [],
  };

  return (
    <Container size="lg" p="md">
      <Space h="lg" />
      <Title order={2}>{t("teamsStandings.title")}</Title>
      <Space h="xs" />
      <Text size="sm" c="dimmed">
        {t("teamsStandings.checkTeamDetails")}
      </Text>
      <Space h="md" />

      <Stack gap="xl">
        <Stack gap={"xs"}>
          <Title order={3} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Axis
            <FactionIcon name="german" width={24} />
            <FactionIcon name="dak" width={24} />
          </Title>

          {/* Pass an empty string as title to hide it */}
          <TeamsTable teams={displayData.axisTeams} title="" profileID={profileID} />
          <Group gap={"4"} justify={"center"}>
            <Text size="sm" c="dimmed">
              {t("teamsStandings.checkTeamLeaderboardsPrefix")}
            </Text>
            <Anchor component={Link} href={getTeamLeaderboardsRoute()} size="sm">
              {t("leaderboards.teams.title", "Team Leaderboards")}
            </Anchor>
            <Text size="sm" c="dimmed">
              {t("teamsStandings.checkTeamLeaderboardsSuffix")}
            </Text>
          </Group>
        </Stack>

        <Stack gap={"xs"}>
          <Title order={3} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Allies
            <FactionIcon name="american" width={24} />
            <FactionIcon name="british" width={24} />
          </Title>

          {/* Pass an empty string as title to hide it */}
          <TeamsTable teams={displayData.alliesTeams} title="" profileID={profileID} />
          <Group gap={"4"} justify={"center"}>
            <Text size="sm" c="dimmed">
              {t("teamsStandings.checkTeamLeaderboardsPrefix")}
            </Text>
            <Anchor component={Link} href={getTeamLeaderboardsRoute()} size="sm">
              {t("leaderboards.teams.title", "Team Leaderboards")}
            </Anchor>
            <Text size="sm" c="dimmed">
              {t("teamsStandings.checkTeamLeaderboardsSuffix")}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
};

export default TeamsStandingsTab;
