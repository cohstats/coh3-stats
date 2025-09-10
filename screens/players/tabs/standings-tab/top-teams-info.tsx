import { TopTeamsSummary } from "../../../../src/coh3/coh3-types";
import { Title, Stack, Group } from "@mantine/core";
import React, { useEffect } from "react";
import FactionIcon from "../../../../components/faction-icon";
import HelperIcon from "../../../../components/icon/helper";
import TeamsTable from "../components/teams-table";
import ErrorCard from "../../../../components/error-card";
import { TFunction } from "next-i18next";
import { useRouter } from "next/router";
import { getTopTeamsSummary } from "../../../../src/apis/coh3stats-api";

interface TopTeamsInfoProps {
  t: TFunction;
  profileID: string;
}

const TopTeamsInfo = ({ t, profileID }: TopTeamsInfoProps) => {
  const router = useRouter();
  if (!profileID) return null;

  const [topTeamsSummary, setTopTeamsSummary] = React.useState<TopTeamsSummary | null>(null);
  const [topTeamsSummaryError, setTopTeamsSummaryError] = React.useState<string | null>(null);
  const [topTeamsSummaryLoading, setTopTeamsSummaryLoading] = React.useState(false);

  useEffect(() => {
    (async () => {
      if (!profileID) return;
      setTopTeamsSummaryLoading(true);
      try {
        const data = await getTopTeamsSummary(profileID);
        setTopTeamsSummary(data);
        setTopTeamsSummaryError(null);
      } catch (err) {
        console.error("Error fetching top teams summary:", err);
        setTopTeamsSummaryError(
          err instanceof Error ? err.message : "Failed to fetch top teams summary",
        );
      } finally {
        setTopTeamsSummaryLoading(false);
      }
    })();
  }, [profileID]);

  const navigateToTeamsStandings = () => {
    router.push({ query: { ...router.query, view: "teamsStandings" } });
  };

  // Show error card if there's an error
  if (topTeamsSummaryError) {
    return (
      <ErrorCard
        title={t("teamsStandings.errorTitle", "Error loading teams data")}
        body={topTeamsSummaryError}
      />
    );
  }

  return (
    <Stack>
      <Group gap="7" align="center">
        <Title order={3}>{t("teamsStandings.title")}</Title>
        <HelperIcon
          text={t(
            "teamsStandings.helperText",
            "Arranged teams are tracked only by COH3 Stats, see more info in the about page",
          )}
          iconSize={24}
          iconStyle={{ marginBottom: 0 }}
        />
        <Title order={3}>{t("teamsStandings.axisTeams")}</Title>
        <FactionIcon name="german" width={24} />
        <FactionIcon name="dak" width={24} />
      </Group>

      <Stack>
        <TeamsTable
          teams={topTeamsSummary?.axisTeams?.mostTotal || null}
          title={`${t("teamsStandings.axisTeams")} - ${t("teamsStandings.mostPlayed")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
          profileID={profileID}
          loading={topTeamsSummaryLoading}
          t={t}
        />
        <TeamsTable
          teams={topTeamsSummary?.axisTeams?.mostRecent || null}
          title={`${t("teamsStandings.axisTeams")} - ${t("teamsStandings.mostRecent")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
          profileID={profileID}
          loading={topTeamsSummaryLoading}
          t={t}
        />
      </Stack>
      <Group gap="xs" align="center">
        <Title order={3}>{t("teamsStandings.title")}</Title>
        <HelperIcon
          text={t(
            "teamsStandings.helperText",
            "Arranged teams are tracked only by COH3 Stats, see more info in the about page",
          )}
          iconSize={24}
          iconStyle={{ marginBottom: 0 }}
        />
        <Title order={3}>{t("teamsStandings.alliesTeams")}</Title>
        <FactionIcon name="american" width={24} />
        <FactionIcon name="british" width={24} />
      </Group>
      <Stack>
        <TeamsTable
          teams={topTeamsSummary?.alliesTeams?.mostTotal || null}
          title={`${t("teamsStandings.alliesTeams")} - ${t("teamsStandings.mostPlayed")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
          profileID={profileID}
          loading={topTeamsSummaryLoading}
          t={t}
        />
        <TeamsTable
          teams={topTeamsSummary?.alliesTeams?.mostRecent || null}
          title={`${t("teamsStandings.alliesTeams")} - ${t("teamsStandings.mostRecent")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
          profileID={profileID}
          loading={topTeamsSummaryLoading}
          t={t}
        />
      </Stack>
    </Stack>
  );
};

export default TopTeamsInfo;
