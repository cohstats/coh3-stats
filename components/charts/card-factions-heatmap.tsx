import React from "react";
import { Tooltip, Text, Card, Title, Radio, Group, Divider, Space } from "@mantine/core";
import { AnalysisObjectType } from "../../src/analysis-types";
import FactionIcon from "../faction-icon";
import dynamic from "next/dynamic";
import HelperIcon from "../icon/helper";
import { useMediaQuery } from "@mantine/hooks";

const DynamicHeatMapChart = dynamic(() => import("./factions-heatmap"), { ssr: false });

interface IProps {
  data: AnalysisObjectType;
  title: string;
  width?: number;
}

const extractFactionString = (factionString: string): Record<string, string> => {
  const match = factionString.match(/(.+)x(.+)/);

  return {
    axis: (match && match[1]) || "",
    allies: (match && match[2]) || "",
  };
};

const legend = (
  <div style={{ display: "inline-block", width: 140, verticalAlign: "top", paddingTop: 20 }}>
    <Tooltip label={"W - (Wehrmacht, German)"}>
      <Group spacing={4}>
        {" "}
        <FactionIcon name="german" width={20} />
        <Text fw={700}>W</Text>
        <Text> - Wehrmacht</Text>{" "}
      </Group>
    </Tooltip>
    <Tooltip label={"D - (Deutsches Afrikakorps)"}>
      <Group spacing={4}>
        {" "}
        <FactionIcon name="dak" width={20} />
        <Text fw={700}>D</Text>
        <Text> - DAK</Text>{" "}
      </Group>
    </Tooltip>
    <Space h={"xs"} />
    <Tooltip label={"B - (British)"}>
      <Group spacing={4}>
        {" "}
        <FactionIcon name="british" width={20} />
        <Text fw={700}>B</Text>
        <Text> - British</Text>{" "}
      </Group>
    </Tooltip>

    <Tooltip label={"U - (American, US Forces)"}>
      <Group spacing={4}>
        {" "}
        <FactionIcon name="american" width={20} />
        <Text fw={700}>U</Text>
        <Text> - US Forces</Text>{" "}
      </Group>
    </Tooltip>
  </div>
);

const _FactionVsFactionCard: React.FC<IProps> = ({ title, data, width = 780 }) => {
  const factionData = (data && data["factionMatrix"]) || {};
  const largeScreen = useMediaQuery("(min-width: 30em)");

  // Change all A (american) to U (US Forces)
  for (const key in factionData) {
    if (key.includes("A")) {
      const newKey = key.replace("A", "U");
      factionData[newKey] = factionData[key];
      delete factionData[key];
    }
  }

  // We should use useMemo for these values, there is lot of iterations which are recalculated "unnecessary"
  const factionDataByKey: Record<string, Record<string, any>> = {};

  const [SelectedSide, setSelectedSide] = React.useState("axis");
  const [SelectedType, setSelectedType] = React.useState<"amountOfGames" | "winRate">("winRate");

  const changeHeatMapStyle = (value: "amountOfGames" | "winRate") => {
    // firebaseAnalytics.teamCompositionUsed(factionWinRate, value);
    setSelectedType(value);
  };

  const changeFactionDisplay = (value: "amountOfGames" | "winRate") => {
    // firebaseAnalytics.teamCompositionUsed(value, heatmapValues);
    setSelectedSide(value);
  };

  // Follows the spaghetti code from coh2 stats. It would be best to completely
  // rewrite the data generation for the chart. But it works for now.

  // Prepare transformation
  for (const [key, value] of Object.entries(factionData)) {
    const { axis, allies } = extractFactionString(key);

    const leftAxisString = axis;
    const topAxisString = allies;

    if (!Object.prototype.hasOwnProperty.call(factionDataByKey, leftAxisString)) {
      factionDataByKey[leftAxisString] = {};
    }
    factionDataByKey[leftAxisString][topAxisString] = (() => {
      if (SelectedType !== "winRate") {
        return value["wins"] + value["losses"];
      } else {
        const winRate: number = value["wins"] / (value["wins"] + value["losses"]);
        if (SelectedSide === "axis") {
          return winRate.toFixed(2);
        } else {
          return (1 - winRate).toFixed(2);
        }
      }
    })();
  }

  // Add total summary for axis (on the right side of the heatmap)
  if (SelectedSide === "axis") {
    for (const [key, arrayOfValues] of Object.entries(factionDataByKey)) {
      let sumCounter = 0;
      const valuesOfArray = Object.values(arrayOfValues);
      for (const singleValue of valuesOfArray) {
        if (!isNaN(parseFloat(singleValue))) {
          sumCounter += parseFloat(singleValue);
        }
      }
      if (SelectedType === "winRate") {
        sumCounter /= valuesOfArray.length;
        factionDataByKey[key]["sum"] = sumCounter.toFixed(2);
      } else {
        factionDataByKey[key]["sum"] = sumCounter;
      }
    }
  }

  if (SelectedSide === "allies") {
    const alliesKeys: Record<string, number> = {};

    for (const value of Object.values(factionDataByKey)) {
      for (const [alliedKey, alliedValue] of Object.entries(value)) {
        if (!alliesKeys[alliedKey]) {
          alliesKeys[alliedKey] = 0;
        }

        if (!isNaN(parseFloat(alliedValue))) {
          alliesKeys[alliedKey] += parseFloat(alliedValue);
        }
      }
    }

    for (const key of Object.keys(alliesKeys)) {
      if (SelectedType === "winRate") {
        alliesKeys[key] = +(alliesKeys[key] / Object.keys(factionDataByKey).length).toFixed(2);
      }
    }

    factionDataByKey["sum"] = alliesKeys;
  }

  // Transform for the heatmap
  const dataForHeatmap: Array<Record<string, any>> = [];

  for (const [key, value] of Object.entries(factionDataByKey)) {
    dataForHeatmap.push({
      id: key,
      data: Object.entries(value).map(([key, value]) => {
        return {
          x: key,
          y: value,
        };
      }),
    });
  }

  dataForHeatmap.sort((firstObject, secondObject) => {
    // Sum should be always on the last
    if (firstObject["id"] === "sum") {
      return 1;
    }

    if (firstObject["id"] > secondObject["id"]) {
      return -1;
    }
    if (firstObject["id"] < secondObject["id"]) {
      return 1;
    }
    return 0;
  });

  return (
    <>
      {!largeScreen && (
        <Card p="md" shadow="sm" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Title order={3}>{title}</Title>
          </Card.Section>
          <Card.Section withBorder inheritPadding py="xs">
            <Text align={"center"}>
              Team composition chart is not available on small screens.
            </Text>
          </Card.Section>
        </Card>
      )}
      {largeScreen && (
        <Card p="md" shadow="sm" w={width} withBorder>
          {/* top, right, left margins are negative – -1 * theme.spacing.xl */}

          <Card.Section withBorder inheritPadding py="xs">
            <Group position={"apart"}>
              <Title order={3}>{title}</Title>
              <Group>
                <HelperIcon
                  width={360}
                  text={
                    "Check if winrate for the particular combination has enough games to provide valid results." +
                    " Preferably you need at least 1k games for the particular combination to be valid."
                  }
                />
                <Radio.Group onChange={changeHeatMapStyle} value={SelectedType}>
                  <Group mt={"xs"}>
                    <Radio value="winRate" label="Winrate" />
                    <Radio value="amountOfGames" label="Amount of games" />
                  </Group>
                </Radio.Group>
                <Divider orientation="vertical" />
                <Radio.Group onChange={changeFactionDisplay} value={SelectedSide}>
                  <Group mt={"xs"}>
                    <Radio value="axis" label="Axis" />
                    <Radio value="allies" label="Allies" />
                  </Group>
                </Radio.Group>
              </Group>
            </Group>
          </Card.Section>
          <Card.Section w={995} h={420} p="xs">
            <div>
              {legend}
              <div style={{ display: "inline-block" }}>
                <DynamicHeatMapChart
                  data={dataForHeatmap}
                  width={600}
                  height={380}
                  type={SelectedType}
                />
              </div>
            </div>
          </Card.Section>
        </Card>
      )}
    </>
  );
};

export const FactionVsFactionCard = _FactionVsFactionCard;
