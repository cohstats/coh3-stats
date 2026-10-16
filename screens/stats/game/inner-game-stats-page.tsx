import React, { useEffect, useMemo, useState } from "react";
import { getStatsData } from "../../../src/apis/coh3stats-api";
import {
  analysisFilterType,
  analysisMapFilterType,
  AnalysisObjectType,
  getAnalysisStatsHttpResponse,
  StatsDataObject,
} from "../../../src/analysis-types";
import { Center, Flex, Loader, Space, Title, Text, Group, Button, Tooltip } from "@mantine/core";
import ErrorCard from "../../../components/error-card";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { FactionVsFactionCard } from "../../../components/charts/card-factions-heatmap";
import HelperIcon from "../../../components/icon/helper";
import { buildOriginHeaderValue } from "../../../src/utils";
import Link from "next/link";
import { getMapsStatsRoute } from "../../../src/routes";
import { IconAlertTriangle, IconCirclePlus } from "@tabler/icons-react";
import {
  combineModesAnalysis,
  gameStatsModeType,
  withCombinedDays,
} from "../../../src/stats/combine-game-stats";
import { leaderBoardType } from "../../../src/coh3/coh3-types";
import { ChartCard, TitleWithHelper } from "./chart-card";
import { TimeSeriesDisplayType } from "../../../components/charts/charts-components-utils";
import AllModesComparison, { GamesPerModeCard } from "./all-modes-comparison";

const DynamicWinRateBarChart = dynamic(() => import("./charts/win-rate-bar"), { ssr: false });
const DynamicGamesBarChart = dynamic(() => import("./charts/games-bar"), { ssr: false });
const DynamicFactionsPlayedPieChart = dynamic(() => import("./charts/factions-played-pie"), {
  ssr: false,
});
const DynamicPlayTimeHistogramChart = dynamic(() => import("./charts/playtime-histogram"), {
  ssr: false,
});
const DynamicMapsPlayedBarChart = dynamic(() => import("./charts/maps-played-bar"), {
  ssr: false,
});
const DynamicAxisVsAlliesBar = dynamic(() => import("./charts/modes/axis-vs-allies-bar"), {
  ssr: false,
});
const DynamicWinRateLineChart = dynamic(() => import("./charts/win-rate-line-chart-card"), {
  ssr: false,
});

const DynamicGamesLineChart = dynamic(() => import("./charts/games-line-chart-card"), {
  ssr: false,
});

const DynamicGamesAmountLineChart = dynamic(
  () => import("./charts/games-amount-line-chart-card"),
  {
    ssr: false,
  },
);

const DynamicGamesPercentageLineChartCard = dynamic(
  () => import("./charts/games-percentage-line-chart-card"),
  {
    ssr: false,
  },
);

const factionSlotsHelperText =
  "Combined for all the modes. Every player is counted - one 4v4 game adds 8 faction results, one 1v1 game only 2. Team games therefore have much bigger weight in these numbers.";

const useDeepCompareMemo = (
  timeStamps: {
    from: number | null;
    to: number | null;
  },
  filters: Array<analysisFilterType | analysisMapFilterType | "all">,
) => {
  const [storedValue, setStoredValue] = useState({ timeStamps, filters });

  if (JSON.stringify({ timeStamps, filters }) !== JSON.stringify(storedValue)) {
    setStoredValue({ timeStamps, filters });
  }

  return storedValue;
};

const InnerGameStatsPage = ({
  timeStamps,
  mode,
  filters,
}: {
  timeStamps: { from: number | null; to: number | null };
  mode: gameStatsModeType;
  filters: Array<analysisFilterType | analysisMapFilterType | "all">;
}) => {
  const memoizedTimeStampsAndFilters = useDeepCompareMemo(timeStamps, filters);
  const [data, setData] = useState<null | getAnalysisStatsHttpResponse>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // One "Display as" for all the time series charts - switching it on one switches all of them
  const [displayBy, setDisplayBy] = useState<TimeSeriesDisplayType>("days");
  const displayByProps = { displayBy, onDisplayByChange: setDisplayBy };

  useEffect(() => {
    (async () => {
      if (!timeStamps.from || !timeStamps.to) return;

      try {
        setLoading(true);
        setData(null);
        setError(null);

        const data = await getStatsData(
          timeStamps.from,
          timeStamps.to,
          "gameStats",
          buildOriginHeaderValue(),
          filters,
        );
        setData(data);
      } catch (e: any) {
        console.error(`Failed getting stats data`);
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [memoizedTimeStampsAndFilters]);

  const isAll = mode === "all";

  // Summing all the modes walks through every day, do it only once per loaded data
  const combinedAnalysis = useMemo(() => {
    if (!isAll || !data?.analysis["1v1"]) return null;
    const analysis = data.analysis as StatsDataObject;
    return {
      analysis: combineModesAnalysis(analysis),
      days: withCombinedDays(analysis.days),
    };
  }, [data, isAll]);

  let content = <></>;

  if (loading) {
    content = (
      <Center maw={400} h={250} mx="auto" data-testid="stats-loading">
        <Loader />
      </Center>
    );
  }

  if (error) {
    content = (
      <Center maw={400} h={250} mx="auto">
        <ErrorCard title={"Error loading the stats"} body={JSON.stringify(error)} />
      </Center>
    );
  }

  if (data?.analysis["1v1"] && (data?.analysis["1v1"].matchCount || isAll)) {
    const analysis = data.analysis as StatsDataObject;

    const analysisData: AnalysisObjectType =
      isAll && combinedAnalysis
        ? combinedAnalysis.analysis
        : (analysis[mode as leaderBoardType] as AnalysisObjectType);
    const daysData = isAll && combinedAnalysis ? combinedAnalysis.days : analysis.days;
    const matchCount = analysisData.matchCount || 0;
    // In "all" the section title already says it, the narrow cards have no space for it
    const titleSuffix = isAll ? "" : ` ${mode}`;

    // Faction results in "all" are counted per player, explain it in the chart titles
    const factionChartTitle = (title: string) =>
      isAll ? (
        <TitleWithHelper title={`${title}${titleSuffix}`} helper={factionSlotsHelperText} />
      ) : (
        `${title}${titleSuffix}`
      );

    // In the first row for a single mode, with the per mode charts on "all"
    const gamesResultsCard = (
      <ChartCard
        title={factionChartTitle("Games Results")}
        size={"md"}
        testId="stats-games-results"
      >
        <DynamicGamesBarChart data={analysisData} />
      </ChartCard>
    );

    content = (
      <>
        <Flex gap={"xl"} justify="center">
          <Group gap={0}>
            <Title
              order={2}
              style={{ textAlign: "center" }}
              p={"md"}
              data-testid="stats-games-analyzed"
            >
              Games analyzed {matchCount.toLocaleString()}
            </Title>
            {matchCount < 1000 && (
              <Tooltip
                w={400}
                label={
                  "Low amount of games. Please consider using Advanced Filters to increase the amount of games to get more accurate results."
                }
                withArrow
                multiline
              >
                <IconAlertTriangle size={25} style={{ marginBottom: -4 }} />
              </Tooltip>
            )}
            <HelperIcon
              width={300}
              text={"We are tracking only 'automatch' games."}
              iconSize={25}
            />
          </Group>
        </Flex>
        {matchCount > 0 && (
          <>
            {/* On "all" the games per mode and the axis vs allies sit next to the faction charts */}
            <Flex gap={"md"} wrap="wrap" justify="space-between">
              {isAll && <GamesPerModeCard analysis={analysis} />}

              <ChartCard
                title={factionChartTitle("Factions Played")}
                size={"md"}
                testId="stats-factions-played"
              >
                <DynamicFactionsPlayedPieChart data={analysisData} />
              </ChartCard>

              {!isAll && gamesResultsCard}

              <ChartCard
                title={factionChartTitle("Faction Winrate")}
                size={"md"}
                testId="stats-faction-winrate"
              >
                <DynamicWinRateBarChart data={analysisData} />
              </ChartCard>

              {isAll && (
                <ChartCard
                  title={
                    <TitleWithHelper
                      title={"Axis vs Allies"}
                      helper={
                        "Winrate of the Axis (Wehrmacht, DAK) and the Allies (US Forces, British). Every automatch game is Axis vs Allies. The All row counts every game once, no matter the game mode."
                      }
                    />
                  }
                  size={"md"}
                  testId="stats-axis-vs-allies"
                >
                  <DynamicAxisVsAlliesBar analysis={analysis} />
                </ChartCard>
              )}

              {/* Maps and game time don't add much on top of the per mode charts on "all" */}
              {!isAll && (
                <ChartCard
                  testId="stats-maps-played"
                  title={
                    <Group justify={"space-between"}>
                      <Group gap={"xs"}>
                        <Text inherit>Maps {mode}</Text>
                      </Group>
                      <Button
                        component={Link}
                        href={getMapsStatsRoute()}
                        variant={"default"}
                        size={"sm"}
                      >
                        <Group gap={4}>
                          <IconCirclePlus size={"18"} />
                          More
                        </Group>
                      </Button>
                    </Group>
                  }
                  size={"md"}
                >
                  <DynamicMapsPlayedBarChart data={analysisData} />
                </ChartCard>
              )}
            </Flex>

            <Space h="xl" />
            {isAll && (
              <>
                <AllModesComparison analysis={analysis}>{gamesResultsCard}</AllModesComparison>
                {/* The maps card with its link is shown only for a single mode */}
                <Flex justify="center">
                  <Button
                    component={Link}
                    href={getMapsStatsRoute()}
                    variant={"default"}
                    data-testid="stats-maps-link"
                  >
                    <Group gap={4}>
                      <IconCirclePlus size={"18"} />
                      Maps stats
                    </Group>
                  </Button>
                </Flex>
                <Space h="xl" />
              </>
            )}
            {!isAll && (
              <>
                <Flex gap={"md"} wrap="wrap" justify="space-between">
                  <FactionVsFactionCard data={analysisData} title={`Team composition ${mode}`} />
                  <ChartCard title={`Game Time ${mode}`} size={"xl"} testId="stats-game-time">
                    <DynamicPlayTimeHistogramChart data={analysisData} />
                  </ChartCard>
                </Flex>
                <Space h="xl" />
              </>
            )}

            <Flex gap={"xl"} wrap="wrap" justify="center">
              <DynamicWinRateLineChart data={daysData} mode={mode} {...displayByProps} />
            </Flex>

            <Space h="xl" />
            <Flex gap={"xl"} wrap="wrap" justify="center">
              <DynamicGamesAmountLineChart data={daysData} mode={mode} {...displayByProps} />
            </Flex>

            <Space h="xl" />
            <Flex gap={"xl"} wrap="wrap" justify="center">
              <DynamicGamesLineChart
                data={daysData}
                mode={mode}
                {...displayByProps}
                helperText={"However over the chart to see the amount of games for each faction."}
                stacked={false}
              />
            </Flex>
            <Space h="xl" />
            <Flex gap={"xl"} wrap="wrap" justify="center">
              <DynamicGamesLineChart
                data={daysData}
                mode={mode}
                {...displayByProps}
                helperText={
                  "This is stacked area chart. It's summary for all factions. However over the chart to see the amount of games for each faction."
                }
                stacked={true}
              />
            </Flex>
            <Space h="xl" />
            <Flex gap={"xl"} wrap="wrap" justify="center">
              <DynamicGamesPercentageLineChartCard
                data={daysData}
                mode={mode}
                {...displayByProps}
              />
            </Flex>
          </>
        )}

        <Text fz="xs" style={{ textAlign: "center" }} pt={20} c="dimmed">
          Analysis type {data.type} from{" "}
          {dayjs.unix(data.fromTimeStampSeconds).format("YYYY-MM-DD")} to{" "}
          {dayjs.unix(data.toTimeStampSeconds).format("YYYY-MM-DD")}
        </Text>
        <Text fz="xs" style={{ textAlign: "center" }} c="dimmed">
          Applied ELO filters {data.filters ? data.filters?.join(", ") : "none"}
        </Text>
      </>
    );
  } else if (!loading && !error) {
    content = (
      <Center maw={400} h={250} mx="auto" data-testid="stats-no-data">
        <h3>No data for the selected period</h3>
      </Center>
    );
  }

  return (
    <div style={{ minHeight: 1600 }} data-testid="game-stats-content">
      {content}
    </div>
  );
};

export default InnerGameStatsPage;
