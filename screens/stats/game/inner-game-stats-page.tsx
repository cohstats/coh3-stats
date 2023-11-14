import React, { useEffect, useState } from "react";
import { getStatsData } from "../../../src/apis/coh3stats-api";
import {
  AnalysisObjectType,
  getAnalysisStatsHttpResponse,
  StatsDataObject,
} from "../../../src/analysis-types";
import { Card, Center, Flex, Loader, Space, Title, Text, Group } from "@mantine/core";
import ErrorCard from "../../../components/error-card";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { FactionVsFactionCard } from "../../../components/charts/card-factions-heatmap";
import HelperIcon from "../../../components/icon/helper";
import { buildOriginHeaderValue } from "../../../src/utils";

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
const DynamicWinRateLineChart = dynamic(() => import("./charts/win-rate-line-chart-card"), {
  ssr: false,
});

const DynamicGamesLineChart = dynamic(() => import("./charts/games-line-chart-card"), {
  ssr: false,
});

const DynamicGamesPercentageLineChartCard = dynamic(
  () => import("./charts/games-percentage-line-chart-card"),
  {
    ssr: false,
  },
);

// React component which accepts inner children. And accepts a title prop.
const ChartCard = ({
  title,
  size,
  children,
}: {
  title: string | React.ReactNode;
  size: "md" | "xl";
  children: React.ReactNode;
}) => {
  let width = 300;
  let chartHeight = 265;

  if (size === "xl") {
    width = 465;
    chartHeight = 390;
  }

  return (
    <Card p="md" shadow="sm" w={width} withBorder>
      {/* top, right, left margins are negative – -1 * theme.spacing.xl */}

      <Card.Section withBorder inheritPadding py="xs">
        <Title order={3}>{title}</Title>
      </Card.Section>
      {/* right, left margins are negative – -1 * theme.spacing.xl */}
      <Card.Section w={width} h={chartHeight} py="xs">
        {children}
      </Card.Section>
    </Card>
  );
};

function useDeepCompareMemo(timeStamps: { from: number | null; to: number | null }) {
  const [storedValue, setStoredValue] = useState(timeStamps);

  if (JSON.stringify(timeStamps) !== JSON.stringify(storedValue)) {
    setStoredValue(timeStamps);
  }

  return storedValue;
}

const InnerGameStatsPage = ({
  timeStamps,
  mode,
}: {
  timeStamps: { from: number | null; to: number | null };
  mode: "1v1" | "2v2" | "3v3" | "4v4" | "all";
}) => {
  const memoizedTimeStamps = useDeepCompareMemo(timeStamps);
  const [data, setData] = useState<null | getAnalysisStatsHttpResponse>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
  }, [memoizedTimeStamps]);

  let content = <></>;

  if (loading) {
    content = (
      <Center maw={400} h={250} mx="auto">
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

  if (data?.analysis["1v1"]) {
    const analysis = data.analysis as StatsDataObject;

    const matchCount = (() => {
      if (mode === "all") {
        return (
          analysis["1v1"].matchCount +
          analysis["2v2"].matchCount +
          analysis["3v3"].matchCount +
          analysis["4v4"].matchCount
        );
      } else {
        const typeAnalysis = analysis[mode as keyof typeof analysis] as AnalysisObjectType;
        return typeAnalysis.matchCount;
      }
    })();

    const analysisData: AnalysisObjectType =
      mode === "all"
        ? (analysis["1v1"] as AnalysisObjectType)
        : (analysis[mode as keyof typeof analysis] as AnalysisObjectType);

    content = (
      <>
        <Flex gap={"xl"} justify="center">
          <Group spacing={0}>
            <Title order={2} align="center" p={"md"}>
              Games analyzed {matchCount.toLocaleString()}
            </Title>
            <HelperIcon
              width={360}
              text={
                "We are tracking every game which has at least 1 ranked player. We are tracking only 'automatch' games."
              }
              iconSize={25}
            />
          </Group>
        </Flex>

        <Flex gap={"xl"} wrap="wrap" justify="center">
          <ChartCard title={`Factions Played ${mode}`} size={"md"}>
            <DynamicFactionsPlayedPieChart data={analysisData} />
          </ChartCard>

          <ChartCard title={`Games Results ${mode}`} size={"md"}>
            <DynamicGamesBarChart data={analysisData} />
          </ChartCard>

          <ChartCard title={`Faction Winrate ${mode}`} size={"md"}>
            <DynamicWinRateBarChart data={analysisData} />
          </ChartCard>

          <ChartCard
            title={
              <Group spacing={"xs"}>
                <Text>Maps {mode}</Text>
                <HelperIcon
                  width={280}
                  text={"This chart has no value until we get map bans as we have in coh2."}
                />
              </Group>
            }
            size={"md"}
          >
            <DynamicMapsPlayedBarChart data={analysisData} />
          </ChartCard>
        </Flex>

        <Space h="xl" />
        <Flex gap={"xl"} wrap="wrap" justify="center">
          <FactionVsFactionCard data={analysisData} title={`Team composition ${mode}`} />
          <ChartCard title={`Game Time ${mode}`} size={"xl"}>
            <DynamicPlayTimeHistogramChart data={analysisData} />
          </ChartCard>
        </Flex>
        <Space h="xl" />

        <Flex gap={"xl"} wrap="wrap" justify="center">
          <DynamicWinRateLineChart data={analysis.days} mode={mode} />
        </Flex>

        <Space h="xl" />
        <Flex gap={"xl"} wrap="wrap" justify="center">
          <DynamicGamesLineChart
            data={analysis.days}
            mode={mode}
            helperText={"However over the chart to see the amount of games for each faction."}
            stacked={false}
          />
        </Flex>
        <Space h="xl" />
        <Flex gap={"xl"} wrap="wrap" justify="center">
          <DynamicGamesLineChart
            data={analysis.days}
            mode={mode}
            helperText={
              "This is stacked area chart. It's summary for all factions. However over the chart to see the amount of games for each faction."
            }
            stacked={true}
          />
        </Flex>
        <Space h="xl" />
        <Flex gap={"xl"} wrap="wrap" justify="center">
          <DynamicGamesPercentageLineChartCard data={analysis.days} mode={mode} />
        </Flex>

        <Text fz="xs" align={"center"} pt={20} c="dimmed">
          Analysis type {data.type} from{" "}
          {dayjs.unix(data.fromTimeStampSeconds).format("YYYY-MM-DD")} to{" "}
          {dayjs.unix(data.toTimeStampSeconds).format("YYYY-MM-DD")}
        </Text>
      </>
    );
  } else if (!loading && !error) {
    content = (
      <Center maw={400} h={250} mx="auto">
        <h3>No data for the selected period</h3>
      </Center>
    );
  }

  return <div style={{ minHeight: 1600 }}>{content}</div>;
};

export default InnerGameStatsPage;
