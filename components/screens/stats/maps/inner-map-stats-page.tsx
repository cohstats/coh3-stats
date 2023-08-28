import React, { useEffect, useState } from "react";
import { getStatsData } from "../../../../src/coh3stats-api";
import {
  AnalysisObjectType,
  getAnalysisStatsHttpResponse,
  MapAnalysisObjectType,
} from "../../../../src/analysis-types";
import { Card, Center, Flex, Loader, Space, Title, Text, Group, Select } from "@mantine/core";
import ErrorCard from "../../../error-card";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { FactionVsFactionCard } from "../../../charts/card-factions-heatmap";
import HelperIcon from "../../../icon/helper";
import { buildOriginHeaderValue } from "../../../../src/utils";
import Link from "next/link";
import MapsPlayTimeBarChart from "./charts/maps-playtime-bar";
import config from "../../../../config";
import { getMapLocalizedName } from "../../../../src/coh3/helpers";

// const DynamicWinRateBarChart = dynamic(() => import("./charts/win-rate-bar"), { ssr: false });
// const DynamicGamesBarChart = dynamic(() => import("./charts/games-bar"), { ssr: false });
// const DynamicFactionsPlayedPieChart = dynamic(() => import("./charts/factions-played-pie"), {
//   ssr: false,
// });
// const DynamicPlayTimeHistogramChart = dynamic(() => import("./charts/playtime-histogram"), {
//   ssr: false,
// });
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

// const DynamicWinRateLineChart = dynamic(() => import("./charts/win-rate-line-chart-card"), {
//   ssr: false,
// });
//
// const DynamicGamesLineChart = dynamic(() => import("./charts/games-line-chart-card"), {
//   ssr: false,
// });
// const DynamicGamesPercentageLineChartCard = dynamic(
//   () => import("./charts/games-percentage-line-chart-card"),
//   {
//     ssr: false,
//   },
// );

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
const ChartCard = ({
  title,
  size,
  children,
  height = 280,
}: {
  title: string | React.ReactNode;
  size: "md" | "xl";
  children: React.ReactNode;
  height?: number;
}) => {
  let width = 380;
  let chartHeight = height;

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

const InnerMapStatsPage = ({
  timeStamps,
  mode,
}: {
  timeStamps: { from: number | null; to: number | null };
  mode: "1v1" | "2v2" | "3v3" | "4v4";
}) => {
  const memoizedTimeStamps = useDeepCompareMemo(timeStamps);
  const [data, setData] = useState<null | getAnalysisStatsHttpResponse>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMap, setSelectedMap] = useState<string>("");

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

  if (data) {
    const analysis = data.analysis;

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
            <DynamicMapsPlayedBarChart data={sortedAnalysisData} />
          </ChartCard>
          <ChartCard
            title={
              <Group spacing={"xs"}>
                <Text>Winrate deviation {mode}</Text>
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
          </ChartCard>
          <ChartCard
            title={
              <Group spacing={"xs"}>
                <Text>Sides Winrate - diff {mode}</Text>
                <HelperIcon
                  width={280}
                  text={"Shows the difference from 50% winrate for each side."}
                />
              </Group>
            }
            size={"md"}
          >
            <MapsWinRateDiffChart data={sortedAnalysisData} />
          </ChartCard>
        </Flex>
        <Space h="xl" />
        <Flex gap={"xl"} wrap="wrap" justify="center">
          <Card p="md" shadow="sm" w={785} withBorder>
            {/* top, right, left margins are negative – -1 * theme.spacing.xl */}

            <Card.Section withBorder inheritPadding py="xs">
              <Title order={3}>{`Winrate diff per factions on maps ${mode}`}</Title>
            </Card.Section>
            {/* right, left margins are negative – -1 * theme.spacing.xl */}
            <Card.Section w={785} h={370} py="xs">
              <DynamicMapsFactionWinRateChart data={analysisData} />
            </Card.Section>
          </Card>
          <ChartCard
            title={
              <Group spacing={"xs"}>
                <Text>Average Playtime {mode}</Text>
              </Group>
            }
            size={"md"}
            height={360}
          >
            <DynamicMapsPlayTimeBarChart data={sortedAnalysisData} />
          </ChartCard>
        </Flex>
        <Select
          value={selectedMap}
          label="Select Map"
          placeholder={"Select Map"}
          data={Object.keys(sortedAnalysisData).map((mapName) => {
            return { value: mapName, label: getMapLocalizedName(mapName) };
          })}
          onChange={(value) => setSelectedMap(value || "")}
          w={220}
        />
        <Space h="xl" />
        <Flex gap={"xl"} wrap="wrap" justify="center">
          <FactionVsFactionCard
            data={sortedAnalysisData[selectedMap]}
            title={`${getMapLocalizedName(selectedMap)} - ${mode} Team composition`}
            style={{}}
          />
        </Flex>

        {JSON.stringify(analysisData)}

        {/*<Flex gap={"xl"} wrap="wrap" justify="center">*/}
        {/*  <ChartCard title={`Factions Played ${mode}`} size={"md"}>*/}
        {/*    <DynamicFactionsPlayedPieChart data={analysisData} />*/}
        {/*  </ChartCard>*/}

        {/*  <ChartCard title={`Games Results ${mode}`} size={"md"}>*/}
        {/*    <DynamicGamesBarChart data={analysisData} />*/}
        {/*  </ChartCard>*/}

        {/*  <ChartCard title={`Faction Winrate ${mode}`} size={"md"}>*/}
        {/*    <DynamicWinRateBarChart data={analysisData} />*/}
        {/*  </ChartCard>*/}

        {/*  <ChartCard*/}
        {/*    title={*/}
        {/*      <Group spacing={"xs"}>*/}
        {/*        <Text>Maps {mode}</Text>*/}
        {/*        <HelperIcon*/}
        {/*          width={280}*/}
        {/*          text={"This chart has no value until we get map bans as we have in coh2."}*/}
        {/*        />*/}
        {/*      </Group>*/}
        {/*    }*/}
        {/*    size={"md"}*/}
        {/*  >*/}
        {/*    <DynamicMapsPlayedBarChart data={analysisData} />*/}
        {/*  </ChartCard>*/}
        {/*</Flex>*/}

        {/*<Space h="xl" />*/}
        {/*<Flex gap={"xl"} wrap="wrap" justify="center">*/}
        {/*  <FactionVsFactionCard*/}
        {/*    data={analysisData}*/}
        {/*    title={`Team composition ${mode}`}*/}
        {/*    style={{}}*/}
        {/*  />*/}
        {/*  <ChartCard title={`Game Time ${mode}`} size={"xl"}>*/}
        {/*    <DynamicPlayTimeHistogramChart data={analysisData} />*/}
        {/*  </ChartCard>*/}
        {/*</Flex>*/}
        {/*<Space h="xl" />*/}

        {/*<Flex gap={"xl"} wrap="wrap" justify="center">*/}
        {/*  <DynamicWinRateLineChart data={analysis.days} mode={mode} />*/}
        {/*</Flex>*/}

        {/*<Space h="xl" />*/}
        {/*<Flex gap={"xl"} wrap="wrap" justify="center">*/}
        {/*  <DynamicGamesLineChart data={analysis.days} mode={mode} />*/}
        {/*</Flex>*/}
        {/*<Space h="xl" />*/}
        {/*<Flex gap={"xl"} wrap="wrap" justify="center">*/}
        {/*  <DynamicGamesPercentageLineChartCard data={analysis.days} mode={mode} />*/}
        {/*</Flex>*/}

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

export default InnerMapStatsPage;
