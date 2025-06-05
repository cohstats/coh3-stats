import React, { useEffect, useState } from "react";
import { getStatsData } from "../../../src/apis/coh3stats-api";
import {
  analysisFilterType,
  analysisMapFilterType,
  AnalysisObjectType,
  getAnalysisStatsHttpResponse,
  MapAnalysisObjectType,
  MapStatsDataObject,
} from "../../../src/analysis-types";
import {
  Card,
  Center,
  Flex,
  Loader,
  Space,
  Title,
  Text,
  Group,
  Container,
  Tooltip,
} from "@mantine/core";
import ErrorCard from "../../../components/error-card";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import HelperIcon from "../../../components/icon/helper";
import { buildOriginHeaderValue } from "../../../src/utils";
import Link from "next/link";

import MapChartCard from "./map-chart-card";
import InnerMapStatsPage from "./inner-map-stats-page";
import { useMediaQuery } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";

const DynamicMapsPlayedBarChart = dynamic(() => import("./charts/maps-played-bar"), {
  ssr: false,
});

const MapsWinRateDiffChart = dynamic(() => import("./charts/maps-winrate-bar"), {
  ssr: false,
});

const DynamicMapsWinRateRMSChart = dynamic(() => import("./charts/maps-rms-bar"), {
  ssr: false,
});
const DynamicMapsFactionWinRateChart = dynamic(
  () => import("./charts/maps-faction-winrate-bar"),
  {
    ssr: false,
  },
);

const DynamicMapsPlayTimeBarChart = dynamic(() => import("./charts/maps-playtime-bar"), {
  ssr: false,
});

// Sort all maps by their match count.
const _sortMapAnalysisData = (data: MapAnalysisObjectType) => {
  const sortedData = Object.entries(data).sort((a, b) => {
    return a[1].matchCount - b[1].matchCount;
  });

  const sortedDataObject: Record<string, AnalysisObjectType> = {};

  for (const [mapName, mapData] of sortedData) {
    sortedDataObject[mapName] = mapData;
  }

  return sortedDataObject as MapAnalysisObjectType;
};

// React component which accepts inner children. And accepts a title prop.

function useDeepCompareMemo(
  timeStamps: {
    from: number | null;
    to: number | null;
  },
  filters: Array<analysisFilterType | analysisMapFilterType | "all">,
) {
  const [storedValue, setStoredValue] = useState({ timeStamps, filters });

  if (JSON.stringify({ timeStamps, filters }) !== JSON.stringify(storedValue)) {
    setStoredValue({ timeStamps, filters });
  }

  return storedValue;
}

const InnerMapsStatsPage = ({
  timeStamps,
  mode,
  filters,
}: {
  timeStamps: { from: number | null; to: number | null };
  mode: "1v1" | "2v2" | "3v3" | "4v4";
  filters: Array<analysisFilterType | analysisMapFilterType | "all">;
}) => {
  const memoizedTimeStampsAndFilters = useDeepCompareMemo(timeStamps, filters);
  const [data, setData] = useState<null | getAnalysisStatsHttpResponse>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const largeScreen = useMediaQuery("(min-width: 30em)");

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
          "mapStats",
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

  if (
    data &&
    data.analysis &&
    data.analysis[mode] &&
    Object.keys(data.analysis[mode]).length > 0
  ) {
    const analysis = data.analysis as MapStatsDataObject;

    const matchCount = (() => {
      const typeAnalysis = data.analysis[
        mode as keyof typeof data.analysis
      ] as MapAnalysisObjectType;
      return Object.values(typeAnalysis).reduce((acc, curr) => {
        return acc + curr.matchCount;
      }, 0);
    })();

    const analysisData: MapAnalysisObjectType = analysis[
      mode as keyof typeof analysis
    ] as MapAnalysisObjectType;
    const sortedAnalysisData = _sortMapAnalysisData(analysisData);

    content = (
      <Container size={1230}>
        <Flex gap={"md"} justify="center">
          <Group gap={0}>
            <Title order={2} style={{ textAlign: "center" }} p={"md"}>
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
        <Group gap={"md"} justify={"space-between"}>
          <MapChartCard
            title={
              <Group gap={"xs"}>
                <Text inherit>Maps {mode}</Text>
              </Group>
            }
            size={"md"}
          >
            <DynamicMapsPlayedBarChart data={sortedAnalysisData} />
          </MapChartCard>
          <MapChartCard
            title={
              <Group gap={"xs"}>
                <Text inherit>Winrate deviation {mode}</Text>
                <HelperIcon
                  width={280}
                  text={
                    <>
                      <b>The lesser the more balanced map for all factions.</b> It shows the
                      difference from 50% Win Rate for all factions on the map. It&apos;s
                      calculated using{" "}
                      <Link
                        href={"https://en.wikipedia.org/wiki/Root_mean_square"}
                        target="_blank"
                      >
                        RMS formula.
                      </Link>{" "}
                      RMS = Sqrt[ (1/4) * Sum of (winrate% - 50%)^2 ]
                    </>
                  }
                />
              </Group>
            }
            size={"md"}
          >
            <DynamicMapsWinRateRMSChart data={sortedAnalysisData} />
          </MapChartCard>
          <MapChartCard
            title={
              <Group gap={"xs"}>
                <Text inherit>Sides Winrate - diff {mode}</Text>
                <HelperIcon
                  width={280}
                  text={"Shows the difference from 50% winrate for each side."}
                />
              </Group>
            }
            size={"md"}
          >
            <MapsWinRateDiffChart data={sortedAnalysisData} />
          </MapChartCard>
        </Group>
        <Space h="xl" />
        <Flex gap={"md"} wrap="wrap" justify={"space-between"}>
          <Card p="md" shadow="sm" w={785} withBorder style={{ overflow: "visible" }}>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={3}>{`Winrate diff per factions on maps ${mode}`}</Title>
            </Card.Section>

            {largeScreen && (
              <Card.Section w={785} h={330} py="xs">
                <DynamicMapsFactionWinRateChart data={sortedAnalysisData} />
              </Card.Section>
            )}

            {!largeScreen && (
              <Card.Section withBorder inheritPadding py="xs">
                <Text style={{ textAlign: "center" }}>
                  Winrate diff chart is not available on small screens.
                </Text>
              </Card.Section>
            )}
          </Card>
          <MapChartCard
            title={
              <Group gap={"xs"}>
                <Text inherit>Average Playtime {mode}</Text>
              </Group>
            }
            size={"md"}
            height={320}
          >
            <DynamicMapsPlayTimeBarChart data={sortedAnalysisData} />
          </MapChartCard>
        </Flex>
        <InnerMapStatsPage mode={mode} data={analysis} />

        <Text fz="xs" style={{ textAlign: "center" }} pt={20} c="dimmed">
          Analysis type {data.type} from{" "}
          {dayjs.unix(data.fromTimeStampSeconds).format("YYYY-MM-DD")} to{" "}
          {dayjs.unix(data.toTimeStampSeconds).format("YYYY-MM-DD")}
        </Text>
        <Text fz="xs" style={{ textAlign: "center" }} c="dimmed">
          Applied ELO filters {data.filters ? data.filters?.join(", ") : "none"}
        </Text>
      </Container>
    );
  } else if (!loading && !error) {
    content = (
      <Center maw={400} h={250} mx="auto">
        <h3>No data for the selected period</h3>
      </Center>
    );
  }

  return <div style={{ minHeight: 2300 }}>{content}</div>;
};

export default InnerMapsStatsPage;
