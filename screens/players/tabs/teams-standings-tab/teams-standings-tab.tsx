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

  // Team leaderboards link component
  const teamLeaderboardsLink = (
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
  );

  // Determine content based on current state
  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <Stack align="center" gap="md">
        <Loader size="lg" pt={"150px"} />
        <Text>{t("common.loading", "Loading...")}</Text>
      </Stack>
    );
  } else if (error) {
    content = (
      <>
        {teamLeaderboardsLink}
        <Space h="md" />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("common.error", "Error")}
          color="red"
        >
          {error}
        </Alert>
      </>
    );
  } else if (!teamsData) {
    content = (
      <>
        {teamLeaderboardsLink}
        <Space h="md" />
        <Text>{t("teamsStandings.noData")}</Text>
      </>
    );
  } else {
    // Prepare the teams data for display
    const displayData = {
      axisTeams: teamsData.axisTeams || [],
      alliesTeams: teamsData.alliesTeams || [],
    };

    content = (
      <Stack gap="xl">
        <Stack gap={"xs"}>
          <Title
            order={2}
            size={"h3"}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <>
              {t("teamsStandings.axisTeams", "Axis")}
              <FactionIcon name="german" width={24} />
              <FactionIcon name="dak" width={24} />
            </>
          </Title>

          {/* Pass an empty string as title to hide it */}
          <TeamsTable
            teams={displayData.axisTeams}
            title=""
            profileID={profileID}
            loading={isLoading}
            t={t}
          />
          {teamLeaderboardsLink}
        </Stack>

        <Stack gap={"xs"}>
          <Title
            order={2}
            size={"h3"}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <>
              {t("teamsStandings.alliesTeams", "Allies")}
              <FactionIcon name="american" width={24} />
              <FactionIcon name="british" width={24} />
            </>
          </Title>

          {/* Pass an empty string as title to hide it */}
          <TeamsTable
            teams={displayData.alliesTeams}
            title=""
            profileID={profileID}
            loading={isLoading}
            t={t}
          />
          {teamLeaderboardsLink}
        </Stack>
      </Stack>
    );
  }

  return (
    <Container size="lg" p="md" style={{ minHeight: "900px" }}>
      <Space h="lg" />
      <Title order={isLoading ? 2 : 1} size={"h2"}>
        {t("teamsStandings.title")}
      </Title>
      <Space h="xs" />
      <Text size="sm" c="dimmed">
        {t("teamsStandings.checkTeamDetails")}
      </Text>
      <Space h="md" />
      {content}
    </Container>
  );
};

export default TeamsStandingsTab;
