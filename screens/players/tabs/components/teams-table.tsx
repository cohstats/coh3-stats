import { TeamSummary } from "../../../../src/coh3/coh3-types";
import { Text, Title, Stack, Button } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import React from "react";
import { Anchor } from "@mantine/core";
import Link from "next/link";
import CountryFlag from "../../../../components/country-flag";
import DynamicTimeAgo from "../../../../components/other/dynamic-timeago";
import HelperIcon from "../../../../components/icon/helper";
import { Group } from "@mantine/core";
import MoreButton from "./more-button";
import { useRouter } from "next/router";
import { TFunction } from "next-i18next";
import { IconDatabaseOff } from "@tabler/icons-react";

interface TeamsTableProps {
  teams: TeamSummary[] | null;
  title: string;
  showMoreButton?: boolean;
  onMoreClick?: () => void;
  teamDetails?: boolean;
  profileID?: string;
  loading?: boolean;
  t: TFunction;
}

const TeamsTable = ({
  teams,
  title,
  showMoreButton = false,
  onMoreClick,
  teamDetails = true,
  profileID,
  loading = false,
  t,
}: TeamsTableProps) => {
  const router = useRouter();
  const teamsWithLastMatch = teams?.filter((team) => team.lmTS) || [];

  const navigateToTeamDetails = (teamId: string) => {
    router.push({
      query: { ...router.query, view: "teamDetails", team: teamId },
    });
  };

  return (
    <Stack gap={"xs"}>
      <Title order={4}>{title}</Title>
      <DataTable
        withTableBorder
        borderRadius="md"
        highlightOnHover
        verticalSpacing={5}
        horizontalSpacing={5}
        idAccessor={"id"}
        records={teamsWithLastMatch}
        minHeight={teamsWithLastMatch.length === 0 ? 130 : 50}
        fetching={loading}
        onRowClick={({ record, event }) => {
          if (event.target instanceof Element) {
            const clickedElement = event.target as Element;
            const isClickableElement = clickedElement.closest(
              "a, button, img, .mantine-Button-root",
            );

            if (isClickableElement) {
              // If it's a clickable element, don't open the drawer
              return;
            }
          }
          if (teamDetails) {
            navigateToTeamDetails(record.id);
          }
        }}
        noRecordsIcon={<IconDatabaseOff />}
        noRecordsText={t("teamsTable.noData", "No teams data available")}
        columns={[
          {
            title: t("teamsTable.columns.type", "Type"),
            accessor: "type",
            textAlign: "center",
            width: 70,
          },
          {
            title: t("teamsTable.columns.players", "Players"),
            accessor: "players",
            width: "50%",
            render: ({ players }: TeamSummary) => (
              <Stack gap="5">
                {players.map((player) => (
                  <Anchor
                    key={player.profile_id}
                    component={Link}
                    href={`/players/${player.profile_id}`}
                    inherit
                  >
                    <Group gap="xs">
                      <CountryFlag countryCode={player.country} />
                      <Text
                        size={"sm"}
                        fw={
                          profileID && player.profile_id.toString() === profileID
                            ? "bold"
                            : "normal"
                        }
                      >
                        {player.alias}
                      </Text>
                    </Group>
                  </Anchor>
                ))}
              </Stack>
            ),
          },
          {
            title: (
              <Group gap="7" justify={"center"}>
                <span>{t("teamsTable.columns.elo", "ELO")}</span>
                <HelperIcon
                  text={t(
                    "teamsTable.eloHelper",
                    "Unofficial ELO tracked by COH3 Stats only, see more info in the about page",
                  )}
                  iconSize={16}
                  iconStyle={{ marginBottom: 0 }}
                />
              </Group>
            ),
            accessor: "elo",
            textAlign: "center",
            width: 70,
            render: ({ elo, bestElo }: TeamSummary) => (
              <Stack gap={0}>
                <span>{elo}</span>
                {bestElo && bestElo > elo && (
                  <Text size="xs" c="dimmed">
                    {t("teamsTable.bestElo", "Best {{elo}}", { elo: bestElo })}
                  </Text>
                )}
              </Stack>
            ),
          },
          {
            title: t("teamsTable.columns.streak", "Streak"),
            accessor: "s",
            textAlign: "center",
            render: ({ s }: TeamSummary) => (
              <Text c={s > 0 ? "green" : s < 0 ? "red" : undefined}>{s > 0 ? `+${s}` : s}</Text>
            ),
          },
          {
            title: t("teamsTable.columns.wins", "Wins"),
            accessor: "w",
            textAlign: "center",
          },
          {
            title: t("teamsTable.columns.losses", "Losses"),
            accessor: "l",
            textAlign: "center",
          },
          {
            title: t("teamsTable.columns.ratio", "Ratio"),
            accessor: "ratio",
            textAlign: "center",
            render: ({ w, l }: TeamSummary) => `${Math.round((w / (w + l)) * 100)}%`,
          },
          {
            title: t("teamsTable.columns.total", "Total"),
            accessor: "totalGames",
            textAlign: "center",
            render: ({ w, l }: TeamSummary) => w + l,
          },
          {
            title: t("teamsTable.columns.lastMatch", "Last Match"),
            accessor: "lmTS",
            textAlign: "right",
            width: 120,
            render: ({ lmTS }: TeamSummary) => (lmTS ? <DynamicTimeAgo timestamp={lmTS} /> : "-"),
          },
          {
            title: "",
            hidden: !teamDetails,
            accessor: "actions",
            textAlign: "right",
            // width: 100,
            render: (team: TeamSummary) => (
              <Button
                variant="default"
                size="compact-sm"
                onClick={() => navigateToTeamDetails(team.id)}
              >
                {t("teamDetails.detailsButton", "Details")}
              </Button>
            ),
          },
        ]}
      />
      {showMoreButton && onMoreClick && teamsWithLastMatch.length > 0 && (
        <Group justify="flex-end" mt="0" gap={"xs"}>
          <Text size="xs" c="dimmed">
            {t("teamsStandings.limitedTeams", "Limited to 2 teams only")}
          </Text>
          <MoreButton onClick={onMoreClick} />
        </Group>
      )}
    </Stack>
  );
};

export default TeamsTable;
