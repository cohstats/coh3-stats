import { TopTeamsSummary } from "../../../../src/coh3/coh3-types";
import { Title, Stack, Group } from "@mantine/core";
import React from "react";
import FactionIcon from "../../../../components/faction-icon";
import HelperIcon from "../../../../components/icon/helper";
import TeamsTable from "../components/teams-table";
import { TFunction } from "next-i18next";
import { useRouter } from "next/router";

interface TopTeamsInfoProps {
  topTeamsSummary: TopTeamsSummary | null;
  t: TFunction;
}

const TopTeamsInfo = ({ topTeamsSummary, t }: TopTeamsInfoProps) => {
  const router = useRouter();
  if (!topTeamsSummary) return null;

  const navigateToTeamsStandings = () => {
    router.push({ query: { ...router.query, view: "teamsStandings" } });
  };

  return (
    <Stack>
      <Group gap="7" align="center">
        <Title order={3}>{t("teamsStandings.title")}</Title>
        <HelperIcon
          text="Arranged teams are tracked only by COH3 Stats, see more info in the about page"
          iconSize={24}
          iconStyle={{ marginBottom: 0 }}
        />
        <Title order={3}>{t("teamsStandings.axisTeams")}</Title>
        <FactionIcon name="german" width={24} />
        <FactionIcon name="dak" width={24} />
      </Group>

      <Stack>
        <TeamsTable
          teams={topTeamsSummary.axisTeams.mostTotal}
          title={`${t("teamsStandings.axisTeams")} - ${t("teamsStandings.mostPlayed")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
        />
        <TeamsTable
          teams={topTeamsSummary.axisTeams.mostRecent}
          title={`${t("teamsStandings.axisTeams")} - ${t("teamsStandings.mostRecent")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
        />
      </Stack>
      <Group gap="xs" align="center">
        <Title order={3}>{t("teamsStandings.title")}</Title>
        <HelperIcon
          text="Arranged teams are tracked only by COH3 Stats, see more info in the about page"
          iconSize={24}
          iconStyle={{ marginBottom: 0 }}
        />
        <Title order={3}>{t("teamsStandings.alliesTeams")}</Title>
        <FactionIcon name="american" width={24} />
        <FactionIcon name="british" width={24} />
      </Group>
      <Stack>
        <TeamsTable
          teams={topTeamsSummary.alliesTeams.mostTotal}
          title={`${t("teamsStandings.alliesTeams")} - ${t("teamsStandings.mostPlayed")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
        />
        <TeamsTable
          teams={topTeamsSummary.alliesTeams.mostRecent}
          title={`${t("teamsStandings.alliesTeams")} - ${t("teamsStandings.mostRecent")}`}
          showMoreButton={true}
          onMoreClick={navigateToTeamsStandings}
        />
      </Stack>
    </Stack>
  );
};

export default TopTeamsInfo;
