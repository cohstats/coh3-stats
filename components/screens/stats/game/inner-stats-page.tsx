import React, { useEffect, useState } from "react";
import { getStatsData } from "../../../../src/coh3stats-api";
import { getAnalysisStatsHttpResponse } from "../../../../src/analysis-types";
import { Card, Center, Flex, Loader, Space, Title, Text } from "@mantine/core";
import ErrorCard from "../../../error-card";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { FactionVsFactionCard } from "../../../charts/card-factions-heatmap";

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

// React component which accepts inner children. And accepts a title prop.
const ChartCard = ({
  title,
  size,
  children,
}: {
  title: string;
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

const InnerStatsPage = ({
  timeStamps,
  mode,
}: {
  timeStamps: { from: number | null; to: number | null };
  mode: string;
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

        const data = await getStatsData(timeStamps.from, timeStamps.to);
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

  if (data) {
    const analysis = data.analysis;

    const matchCount = (() => {
      if (mode === "all") {
        return (
          data.analysis["1v1"].matchCount +
          data.analysis["2v2"].matchCount +
          data.analysis["3v3"].matchCount +
          data.analysis["4v4"].matchCount
        );
      } else {
        return data.analysis[mode as keyof typeof data.analysis].matchCount;
      }
    })();

    const analysisData =
      mode === "all" ? analysis["1v1"] : analysis[mode as keyof typeof analysis];

    content = (
      <>
        <Title order={2} align="center" p={"md"}>
          Games analyzed {matchCount.toLocaleString()}
        </Title>

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
        </Flex>

        <Space h="xl" />
        <Flex gap={"xl"} wrap="wrap" justify="center">
          <FactionVsFactionCard
            data={analysisData}
            title={`Team composition matrix ${mode}`}
            style={{}}
          />
        </Flex>
        <Space h="xl" />

        <Flex gap={"xl"} wrap="wrap" justify="center">
          <ChartCard title={`Game Time ${mode}`} size={"xl"}>
            <DynamicPlayTimeHistogramChart data={analysisData} />
          </ChartCard>

          <ChartCard title={`Maps ${mode}`} size={"xl"}>
            <DynamicMapsPlayedBarChart data={analysisData} />
          </ChartCard>
        </Flex>

        <Text fz="xs" align={"center"} pt={20} c="dimmed">
          Analysis type {data.type} from{" "}
          {dayjs.unix(data.fromTimeStampSeconds).format("YYYY-MM-DD")} to{" "}
          {dayjs.unix(data.toTimeStampSeconds).format("YYYY-MM-DD")}
        </Text>
      </>
    );
  }

  return <div style={{ minHeight: 800 }}>{content}</div>;
};

export default InnerStatsPage;
