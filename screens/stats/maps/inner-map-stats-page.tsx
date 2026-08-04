import React, { useEffect } from "react";
import { DaysMapsAnalysisObjectType, MapStatsDataObject } from "../../../src/analysis-types";
import { Button, Flex, Group, Select, Space, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import Link from "next/link";
import { IconExternalLink } from "@tabler/icons-react";

import { getMapLocalizedName } from "../../../src/coh3/helpers";
import { FactionVsFactionCard } from "../../../components/charts/card-factions-heatmap";
import ImageWithModal from "../../../components/image-with-modal";
import { isOfficialMap, maps } from "../../../src/coh3/coh3-data";
import dynamic from "next/dynamic";
import MapChartCard from "./map-chart-card";
import { getIconsPathOnCDN } from "../../../src/utils";
import { getExplorerMapRoute } from "../../../src/routes";

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
  const router = useRouter();
  const { query } = router;

  const availableMaps = Object.keys(data[mode]);
  const mapFromQuery = typeof query.map === "string" ? query.map : null;
  // The map is driven by the URL, fallback to the first map of the mode when it's missing/invalid.
  const selectedMap =
    mapFromQuery && availableMaps.includes(mapFromQuery) ? mapFromQuery : availableMaps[0];

  /**
   * Only the `map` param is ours, all the other params (mode, from, to, filters) are owned by the
   * stats container. We read them back from the live URL instead of the `query` of this render,
   * otherwise a param pushed by the container right before this update (eg. the mode) would be
   * dropped from the URL.
   */
  const pushMapToUrl = (value: string, method: "push" | "replace") => {
    const params = new URLSearchParams(window.location.search);
    params.set("map", value);

    router[method]({ query: Object.fromEntries(params) }, undefined, { shallow: true });
  };

  // Changing the mode can make the map in the URL invalid, keep the URL in sync with what's shown.
  useEffect(() => {
    if (mapFromQuery && selectedMap && mapFromQuery !== selectedMap) {
      pushMapToUrl(selectedMap, "replace");
    }
  }, [mapFromQuery, selectedMap]);

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
        onChange={(value) => value && pushMapToUrl(value, "push")}
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
          <Stack align="center" gap="xs" pt={20}>
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
            {isOfficialMap(selectedMap) && (
              <Button
                component={Link}
                href={getExplorerMapRoute(selectedMap)}
                variant="default"
                size="compact-sm"
                rightSection={<IconExternalLink size={16} />}
              >
                Map details
              </Button>
            )}
          </Stack>
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
