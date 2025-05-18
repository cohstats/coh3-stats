import {
  Container,
  Space,
  Title,
  Text,
  Stack,
  Loader,
  Alert,
  Group,
  Button,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { TeamDetails, ProcessedMatch } from "../../../../src/coh3/coh3-types";
import FactionIcon from "../../../../components/faction-icon";
import TeamsTable from "../components/teams-table";
import TeamMatchesTable from "../components/team-matches-table";
import { getTeamDetails, getTeamMatches } from "../../../../src/apis/coh3stats-api";
import { IconAlertCircle, IconCirclePlus } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import classes from "../Players.module.css";
import { AnalyticsTeamDetailsTabView } from "../../../../src/firebase/analytics";
import dynamic from "next/dynamic";

// Dynamically import chart components to avoid SSR issues with Nivo
const DynamicTeamEloHistoryChart = dynamic(() => import("./charts/team-elo-history-chart"), {
  ssr: false,
});

interface TeamDetailsTabProps {
  profileID: string;
}

const TeamDetailsTab = ({ profileID }: TeamDetailsTabProps) => {
  const [teamData, setTeamData] = useState<TeamDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchLoadError, setMatchLoadError] = useState<string | null>(null);
  const [combinedMatches, setCombinedMatches] = useState<
    Array<
      ProcessedMatch & {
        w: boolean;
        eloChange: number;
        enemyElo: number;
        ts: number;
      }
    >
  >([]);
  const [fetchedMatchIds, setFetchedMatchIds] = useState<number[]>([]);
  const { t } = useTranslation("players");
  const router = useRouter();
  const { team: teamId } = router.query;

  // Function to load match data using getTeamMatches
  const loadMatchData = async (matchIndices: number[]) => {
    if (!teamData?.mh || matchIndices.length === 0) return;

    try {
      setIsLoadingMatches(true);
      setMatchLoadError(null); // Reset any previous error

      // Get the basic match info from the teamData.mh array
      const newMatchesBasicInfo = matchIndices.map((index) => teamData.mh[index]);

      // Get the match IDs to fetch detailed data
      const matchIds = matchIndices.map((index) => teamData.mh[index].m_id);

      // Fetch detailed match data using getTeamMatches
      // The response is a Record<number, ProcessedMatch> where keys are match IDs and values are match data
      const response = await getTeamMatches(matchIds);

      // Create a map of match IDs to basic info for quick lookup
      const basicInfoMap = newMatchesBasicInfo.reduce(
        (map, info) => {
          map[info.m_id] = info;
          return map;
        },
        {} as Record<number, (typeof newMatchesBasicInfo)[0]>,
      );

      // Array to hold the combined match data
      const newCombinedMatches: Array<
        ProcessedMatch & {
          w: boolean;
          eloChange: number;
          enemyElo: number;
          ts: number;
        }
      > = [];

      // Process the response object (keys are match IDs, values are match data)
      if (response && typeof response === "object") {
        // Iterate through each match in the response
        Object.entries(response).forEach(([id, matchData]) => {
          const matchId = parseInt(id);
          const basicInfo = basicInfoMap[matchId];

          // If we have basic info for this match, combine it with the match data
          if (basicInfo) {
            newCombinedMatches.push({
              ...matchData,
              id: matchId,
              w: basicInfo.w,
              eloChange: basicInfo.eloChange,
              enemyElo: basicInfo.enemyElo,
              ts: basicInfo.ts,
            });
          } else {
            // Otherwise just add the match data with the ID
            newCombinedMatches.push({ ...matchData, id: matchId } as any);
          }
        });
      } else {
        console.error("Unexpected getTeamMatches response format:", response);
        setError("Failed to load match data: unexpected response format");
      }

      // Update combined matches with duplicate checking
      setCombinedMatches((prevMatches) => {
        // Create a map of existing match IDs for quick lookup
        const existingMatchIds = new Set(prevMatches.map((match) => match.id));

        // Filter out matches that already exist in prevMatches
        const uniqueNewMatches = newCombinedMatches.filter(
          (match) => !existingMatchIds.has(match.id),
        );

        // Combine previous matches with unique new matches and sort by timestamp
        return [...prevMatches, ...uniqueNewMatches].sort((a, b) => b.ts - a.ts);
      });

      // Update fetched match indices based on the actual matches received
      // Only count matches that were successfully loaded
      const successfullyLoadedMatchIds = newCombinedMatches.map((match) => match.id);

      setFetchedMatchIds((prevIds) => {
        // Create a set of all match IDs we've fetched so far
        const allFetchedIds = new Set([...prevIds, ...successfullyLoadedMatchIds]);
        return Array.from(allFetchedIds);
      });
    } catch (err) {
      console.error("Error fetching team matches:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load match data";
      setMatchLoadError(errorMessage);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Load initial match data when team data is loaded
  useEffect(() => {
    if (teamData?.mh && teamData.mh.length > 0) {
      // Get indices for the first 10 matches or less if there are fewer
      const initialMatchIndices = Array.from(
        { length: Math.min(10, teamData.mh.length) },
        (_, i) => i,
      );

      loadMatchData(initialMatchIndices);
    }
  }, [teamData]);

  // Track page view for analytics
  useEffect(() => {
    AnalyticsTeamDetailsTabView(profileID, teamId as string);
  }, [profileID, teamId]);

  useEffect(() => {
    // Fetch team details data
    const fetchData = async () => {
      if (!teamId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch specific team details
        const data = await getTeamDetails(teamId as string);

        // Sort matches by timestamp (newest first) if matches exist
        if (data.mh && Array.isArray(data.mh)) {
          data.mh = [...data.mh].sort((a, b) => b.ts - a.ts);
        }

        setTeamData(data);
      } catch (err) {
        console.error("Error fetching team details:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team details";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  if (isLoading) {
    return (
      <Container size="lg" p="md">
        <Space h="lg" />
        <Title order={2}>{t("teamDetails.title", "Team Details")}</Title>
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
        <Title order={2}>{t("teamDetails.title", "Team Details")}</Title>
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

  // If we don't have data and there's no error, show no data message
  if (!teamData && !error && !isLoading) {
    return (
      <Container size="lg" p="md">
        <Space h="lg" />
        <Title order={2}>{t("teamDetails.title", "Team Details")}</Title>
        <Space h="md" />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t("common.notFound", "Not Found")}
          color="yellow"
        >
          {t(
            "teamDetails.teamNotFound",
            "Team not found. Please check the team ID and try again.",
          )}
        </Alert>
      </Container>
    );
  }

  // Handle loading more matches
  const handleLoadMoreMatches = () => {
    if (!teamData?.mh) return;

    // Calculate the next batch of indices to load
    const nextStartIndex = fetchedMatchIds.length;
    const remainingCount = teamData.mh.length - nextStartIndex;

    if (remainingCount <= 0) return;

    // Get the next batch of indices (up to 10)
    const nextBatchIndices = Array.from(
      { length: Math.min(10, remainingCount) },
      (_, i) => nextStartIndex + i,
    );

    if (nextBatchIndices.length > 0) {
      loadMatchData(nextBatchIndices);
    }
  };

  // If we have team data, show the team details
  if (teamData) {
    // Check if there are more matches to load
    // Only show the button if we have successfully loaded matches before and there are more to load
    const totalMatches = teamData.mh?.length || 0;
    const hasMoreMatches = fetchedMatchIds.length > 0 && fetchedMatchIds.length < totalMatches;

    return (
      <Container size="fluid" p="md">
        <Space h="lg" />
        <Title order={2}>{t("teamDetails.specificTeamTitle", "Team Details")}</Title>
        <Space h="md" />

        <Stack gap="xl">
          <Stack>
            <Title order={3} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {teamData.side === "axis" ? (
                <>
                  {t("teamsStandings.axisTeam", "Axis Team")}
                  <FactionIcon name="german" width={24} />
                  <FactionIcon name="dak" width={24} />
                </>
              ) : (
                <>
                  {t("teamsStandings.alliesTeam", "Allies Team")}
                  <FactionIcon name="american" width={24} />
                  <FactionIcon name="british" width={24} />
                </>
              )}
            </Title>

            {/* Display the specific team */}
            <TeamsTable teams={[teamData]} title="" teamDetails={false} profileID={profileID} />
          </Stack>

          {/* Team ELO History Chart */}
          {teamData.mh && teamData.mh.length > 0 && (
            <DynamicTeamEloHistoryChart
              matchHistory={teamData.mh}
              title={t("teamDetails.eloHistory", "Team ELO History")}
              startingElo={
                teamData.elo - teamData.mh.reduce((sum, match) => sum + match.eloChange, 0)
              }
            />
          )}

          {/* Team Win/Loss Chart */}

          {/* Match history table */}
          <Stack>
            <TeamMatchesTable
              matches={combinedMatches}
              title={t("teamDetails.matchHistory", "Match History")}
              isLoadingMore={isLoadingMatches}
              profileID={profileID}
            />

            {/* Match count information */}
            <Group justify="center" mt="xs">
              <Text size="xs" c="dimmed">
                Showing {combinedMatches.length} of {teamData.mh?.length || 0} matches
              </Text>
            </Group>

            {/* Error message if there was an error loading matches */}
            {matchLoadError && (
              <Group justify="center" mt="xs">
                <Text size="sm" c="red">
                  Error loading matches: {matchLoadError}
                </Text>
              </Group>
            )}

            {/* Load More Matches button */}
            {hasMoreMatches && !isLoadingMatches && (
              <Group justify="center" mt="xs">
                <Button
                  // w={"140px"}
                  variant={"default"}
                  size={"compact"}
                  className={classes.moreButton}
                  onClick={handleLoadMoreMatches}
                >
                  <Group gap={4}>
                    <IconCirclePlus size={"15"} style={{ marginBottom: -1 }} />
                    Load More Matches
                  </Group>
                </Button>
              </Group>
            )}
          </Stack>
        </Stack>
      </Container>
    );
  }

  // Default return (should never reach here due to the conditions above)
  return null;
};

export default TeamDetailsTab;
