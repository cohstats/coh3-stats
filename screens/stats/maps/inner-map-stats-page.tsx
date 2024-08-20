import React, { useEffect, useState } from "react";
import { DaysMapsAnalysisObjectType, MapStatsDataObject } from "../../../src/analysis-types";
import { Center, Flex, Group, Select, Space, Text } from "@mantine/core";

import { getMapLocalizedName } from "../../../src/coh3/helpers";
import { FactionVsFactionCard } from "../../../components/charts/card-factions-heatmap";
import ImageWithModal from "../../../components/image-with-modal";
import { isOfficialMap, maps } from "../../../src/coh3/coh3-data";
import dynamic from "next/dynamic";
import MapChartCard from "./map-chart-card";
import { getIconsPathOnCDN } from "../../../src/utils";

const DynamicMapsWinRateLineChartCard = dynamic(
  () => import("./charts/maps-win-rate-line-chart-card"),
  {
    ssr: false,
  },
);

const DynamicMapsLineChartCard = dynamic(() => import("./charts/maps-line-chart-card"), {
  ssr: false,
});

const InnerMapStatsPage = ({
  data,
  mode,
}: {
  data: MapStatsDataObject;
  mode: "1v1" | "2v2" | "3v3" | "4v4";
}) => {
  const [selectedMap, setSelectedMap] = useState<string>(
    Object.keys(data[mode as keyof typeof data])[0],
  );

  useEffect(() => {
    setSelectedMap(Object.keys(data[mode as keyof typeof data])[0]);
  }, [mode]);

  return (
    <>
      <Space h="sm" />
      <Select
        value={selectedMap}
        label="Select Map"
        placeholder={"Select Map"}
        data={Object.keys(data[mode]).map((mapName) => {
          return { value: mapName, label: getMapLocalizedName(mapName) };
        })}
        onChange={(value) => setSelectedMap(value || "")}
        w={220}
        allowDeselect={false}
        withCheckIcon={false}
      />
      <Space h="sm" />
      <Flex gap={"xs"} wrap="wrap" justify="space-between">
        <FactionVsFactionCard
          data={data[mode][selectedMap]}
          title={`${getMapLocalizedName(selectedMap)} - ${mode} Team composition`}
          width={900}
        />
        <MapChartCard
          title={
            <Group gap={"xs"}>
              <Text inherit>
                {getMapLocalizedName(selectedMap)} {mode}
              </Text>
            </Group>
          }
          size={"md"}
          width={270}
          height={360}
        >
          <Center p={65}>
            <ImageWithModal
              height={245}
              width={245}
              alt={selectedMap}
              src={
                isOfficialMap(selectedMap)
                  ? getIconsPathOnCDN(maps[selectedMap]?.url, "maps")
                  : ""
              }
              title={isOfficialMap(selectedMap) ? maps[selectedMap]?.url : ""}
            />
          </Center>
        </MapChartCard>
      </Flex>
      <Space h="xl" />
      <Flex gap={"xl"} wrap="wrap" justify="center">
        <DynamicMapsWinRateLineChartCard
          data={data.days as DaysMapsAnalysisObjectType}
          mode={mode}
          mapName={selectedMap}
          width={1400}
        />
      </Flex>
      <Space h="xl" />
      <Flex gap={"xl"} wrap="wrap" justify="center">
        <DynamicMapsLineChartCard
          data={data.days as DaysMapsAnalysisObjectType}
          mode={mode}
          mapName={selectedMap}
          title={`${getMapLocalizedName(selectedMap)} - Factions played ${mode}`}
          helperText={"However over the chart to see the amount of games for each faction."}
          stacked={false}
        />
      </Flex>
      <Space h="xl" />
      <Flex gap={"xl"} wrap="wrap" justify="center">
        <DynamicMapsLineChartCard
          data={data.days as DaysMapsAnalysisObjectType}
          mode={mode}
          mapName={selectedMap}
          title={`${getMapLocalizedName(selectedMap)} - Factions played ${mode}`}
          helperText={
            "This is stacked area chart. It's summary for all factions. However over the chart to see the amount of games for each faction."
          }
          stacked={true}
        />
      </Flex>
    </>
  );
};

export default InnerMapStatsPage;
