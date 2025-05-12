import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import {
  Container,
  Title,
  Group,
  Select,
  Text,
  Loader,
  Center,
  Stack,
  Button,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { AnalyticsLeaderBoardsPageView } from "../../src/firebase/analytics";
import { getTeamLeaderboards } from "../../src/apis/coh3stats-api";
import { TeamLeaderboardResponse, leaderBoardType } from "../../src/coh3/coh3-types";
import { localizedGameTypes } from "../../src/coh3/coh3-data";
import ErrorCard from "../../components/error-card";
import CountryFlag from "../../components/country-flag";
import DynamicTimeAgo from "../../components/other/dynamic-timeago";
import Link from "next/link";
import { Anchor } from "@mantine/core";
import { getPlayerCardRoute } from "../../src/routes";
import HelperIcon from "../../components/icon/helper";
import FactionIcon from "../../components/faction-icon";

const TeamLeaderboards: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation(["common", "leaderboards"]);

  // Get query parameters with defaults
  const side = (router.query.side as "axis" | "allies") || "axis";
  const type = (router.query.type as leaderBoardType) || "2v2";
  const orderBy = (router.query.orderBy as "elo" | "total") || "elo";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<TeamLeaderboardResponse | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [previousCursor, setPreviousCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setStartIndex(0);

      try {
        // Initial load - no cursor or direction needed
        const data = await getTeamLeaderboards(side, type, orderBy, recordsPerPage);
        setLeaderboardData(data);
        setNextCursor(data.nextCursor);
        setPreviousCursor(data.previousCursor);
      } catch (err) {
        console.error("Error fetching team leaderboards:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Track page view
    AnalyticsLeaderBoardsPageView("team", type);
  }, [side, type, orderBy, recordsPerPage]);

  // Handle filter changes
  const handleSideChange = (value: string | null) => {
    if (value) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, side: value },
      });
    }
  };

  const handleTypeChange = (value: string | null) => {
    if (value) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, type: value },
      });
    }
  };

  const handleOrderByChange = (value: string | null) => {
    if (value) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, orderBy: value },
      });
    }
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (value: string | null) => {
    if (value) {
      setRecordsPerPage(Number(value));
    }
  };

  // Handle next page
  const handleNextPage = async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      // For next page, we use the nextCursor with "next" direction
      const data = await getTeamLeaderboards(
        side,
        type,
        orderBy,
        recordsPerPage,
        nextCursor,
        "next",
      );

      setLeaderboardData(data);
      setNextCursor(data.nextCursor);
      setPreviousCursor(data.previousCursor);
      setCurrentPage(currentPage + 1);
      setStartIndex(startIndex + recordsPerPage);
    } catch (err) {
      console.error("Error loading next page of team leaderboards:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle previous page
  const handlePreviousPage = async () => {
    if (!previousCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      // For previous page, we use the previousCursor with "previous" direction
      const data = await getTeamLeaderboards(
        side,
        type,
        orderBy,
        recordsPerPage,
        previousCursor,
        "previous",
      );

      setLeaderboardData(data);
      setNextCursor(data.nextCursor);
      setPreviousCursor(data.previousCursor);
      setCurrentPage(currentPage - 1);
      setStartIndex(Math.max(0, startIndex - recordsPerPage));
    } catch (err) {
      console.error("Error loading previous page of team leaderboards:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Calculate win rate
  const calculateWinRate = (wins: number, losses: number) => {
    if (wins + losses === 0) return "0%";
    return `${Math.round((wins / (wins + losses)) * 100)}%`;
  };

  const pageTitle = `${t("leaderboards:teams.title")} for ${side === "axis" ? "Axis" : "Allies"} ${localizedGameTypes[type as leaderBoardType]}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={t("leaderboards:teams.metaDescription", {
            side: side === "axis" ? "Axis" : "Allies",
            type: localizedGameTypes[type as leaderBoardType],
          })}
        />
        <meta
          name="keywords"
          content={`coh3, coh3 team leaderboards, coh3 ${side} teams, coh3 ${type} teams, coh3 stats`}
        />
      </Head>

      <Container size="lg" p={0}>
        <Container fluid pl={0} pr={0}>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              {side === "axis" ? (
                <>
                  <FactionIcon name="german" width={35} />
                  <FactionIcon name="dak" width={35} />
                </>
              ) : (
                <>
                  <FactionIcon name="american" width={35} />
                  <FactionIcon name="british" width={35} />
                </>
              )}
              <Title order={2}>
                {t("leaderboards:teams.title")} for {side === "axis" ? "Axis" : "Allies"}{" "}
                {localizedGameTypes[type as leaderBoardType]}
              </Title>
            </Group>

            <Group>
              <Select
                label={t("leaderboards:teams.filters.side")}
                value={side}
                onChange={handleSideChange}
                data={[
                  { value: "axis", label: "Axis" },
                  { value: "allies", label: "Allies" },
                ]}
                style={{ width: 120 }}
                allowDeselect={false}
                withCheckIcon={false}
              />

              <Select
                label={t("leaderboards:teams.filters.type")}
                value={type}
                onChange={handleTypeChange}
                data={[
                  { value: "2v2", label: "2 vs 2" },
                  { value: "3v3", label: "3 vs 3" },
                  { value: "4v4", label: "4 vs 4" },
                ]}
                style={{ width: 120 }}
                allowDeselect={false}
                withCheckIcon={false}
              />

              <Select
                label={t("leaderboards:teams.filters.orderBy")}
                value={orderBy}
                onChange={handleOrderByChange}
                data={[
                  { value: "elo", label: "ELO" },
                  { value: "total", label: "Total Games" },
                ]}
                style={{ width: 150 }}
                allowDeselect={false}
                withCheckIcon={false}
              />
            </Group>
          </Group>

          {error ? (
            <ErrorCard title={t("leaderboards:errorTitle")} body={error} />
          ) : loading ? (
            <Center style={{ height: 200 }}>
              <Loader size="lg" />
            </Center>
          ) : leaderboardData && leaderboardData.teams.length > 0 ? (
            <>
              <DataTable
                withTableBorder
                borderRadius="md"
                highlightOnHover
                striped
                verticalSpacing={4}
                fz="sm"
                minHeight={300}
                records={leaderboardData.teams}
                columns={[
                  {
                    title: t("common:columns.rank"),
                    accessor: "index",
                    textAlign: "center",
                    render: (_, index) => startIndex + index + 1,
                  },
                  {
                    title: (
                      <Group gap="7" justify="center">
                        <span>ELO</span>
                        <HelperIcon
                          text="Unofficial ELO tracked by COH3 Stats only, see more info in the about page"
                          iconSize={16}
                          iconStyle={{ marginBottom: 0 }}
                        />
                      </Group>
                    ),
                    accessor: "elo",
                    textAlign: "center",
                    width: 80,
                    render: ({ elo }) => Math.round(elo),
                  },
                  {
                    title: "Team",
                    accessor: "players",
                    width: "100%",
                    render: ({ players }) => (
                      <Stack gap="0" justify="center">
                        {players.map((player) => (
                          <Anchor
                            key={player.profile_id}
                            component={Link}
                            href={getPlayerCardRoute(player.profile_id)}
                          >
                            <Group gap="xs">
                              <CountryFlag countryCode={player.country} />
                              {player.alias}
                            </Group>
                          </Anchor>
                        ))}
                      </Stack>
                    ),
                  },
                  {
                    title: t("common:columns.streak"),
                    accessor: "s",
                    textAlign: "center",
                    render: ({ s }) => (
                      <Text c={s > 0 ? "green" : s < 0 ? "red" : undefined}>
                        {s > 0 ? `+${s}` : s}
                      </Text>
                    ),
                  },
                  {
                    title: t("common:columns.wins"),
                    accessor: "w",
                    textAlign: "center",
                  },
                  {
                    title: t("common:columns.losses"),
                    accessor: "l",
                    textAlign: "center",
                  },
                  {
                    title: t("common:columns.ratio"),
                    accessor: "ratio",
                    textAlign: "center",
                    render: ({ w, l }) => calculateWinRate(w, l),
                  },
                  {
                    title: t("common:columns.total"),
                    accessor: "t",
                    textAlign: "center",
                  },
                  {
                    title: t("common:columns.lastGame"),
                    accessor: "lmTS",
                    textAlign: "right",
                    width: 130,
                    render: ({ lmTS }) => (lmTS ? <DynamicTimeAgo timestamp={lmTS} /> : "N/A"),
                  },
                ]}
              />

              <Group justify="space-between" mt="xs">
                <Text size="sm">
                  {t("leaderboards:teams.pagination.showingRange", {
                    start: startIndex + 1,
                    end: Math.min(
                      startIndex + leaderboardData.teams.length,
                      leaderboardData.totalTeams,
                    ),
                    total: leaderboardData.totalTeams,
                  })}
                </Text>

                <Group align="flex-end">
                  <Select
                    label={t("leaderboards:teams.pagination.itemsPerPage")}
                    value={recordsPerPage.toString()}
                    onChange={handleRecordsPerPageChange}
                    data={[
                      { value: "25", label: "25" },
                      { value: "50", label: "50" },
                      { value: "100", label: "100" },
                    ]}
                    style={{ width: 100 }}
                    allowDeselect={false}
                    withCheckIcon={false}
                  />

                  <Group gap="xs">
                    <Button
                      variant="outline"
                      disabled={!previousCursor || loadingMore || currentPage === 1}
                      onClick={handlePreviousPage}
                    >
                      {t("leaderboards:teams.pagination.previous")}
                    </Button>

                    <Text size="sm" fw={500} style={{ minWidth: "30px", textAlign: "center" }}>
                      {currentPage}
                    </Text>

                    <Button
                      variant="outline"
                      disabled={!nextCursor || loadingMore}
                      onClick={handleNextPage}
                    >
                      {t("leaderboards:teams.pagination.next")}
                    </Button>
                  </Group>
                </Group>
              </Group>
            </>
          ) : (
            <Text>No team leaderboard data found.</Text>
          )}
        </Container>
      </Container>
    </>
  );
};

export default TeamLeaderboards;
