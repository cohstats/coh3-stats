import React, { useState } from "react";
//import { LevelContext } from './LevelContext.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as CTitle,
  Tooltip as CTooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import {
  Paper,
  createStyles,
  Container,
  Space,
  useMantineTheme,
  SimpleGrid,
  Rating,
  Avatar,
  Group,
  Image,
  Text,
  NumberInput,
  ActionIcon,
  Box,
  Stack,
} from "@mantine/core";
import { WeaponSearch } from "./weaponSearch";
import { resolveLocstring } from "../../pages/unitCard";
import { WeaponStats } from "../../src/unitStats/mappingWeapon";
import { UnitSearch } from "./unitSearch";
import { getSingleWeaponDPS } from "../../src/unitStats/weaponLib";

type UnitType = {
  id: string;
  text: string;
  unitSymbol: string;
  unitIcon: string;
  sizeMax: number;
  loadout: UnitEntityType[];
  defaultWeapon: string;
  slots: number;
  cover: boolean;
  moving: boolean;
  vet: number;
};

type UnitEntityType = {
  id: string;
  text: string;
  numMax: number;
  number: number;
  weaponSymbol: string;
  replaceDefault: boolean;
};

const mapUnitData = (fileName: string, spbs: any) => {
  const uiInfo = spbs.squad_ui_ext.race_data[0].info;
  return {
    id: fileName,
    briefText: resolveLocstring(uiInfo.brief_text),
    symbolIconName: uiInfo.symbol_icon_name,
    iconName: uiInfo.icon_name,
    weaponSymbol: "",
    squadType: spbs.squad_type_ext,
    loadout: [
      {
        id: "panzergrenadier_ak",
        text: "Panzergrenadier",
        numMax: 5,
        currentWeapon: "kar98k_panzergrenadier_ak",
        weaponSymbol: "/unitStats/weaponClass/weapon_dp_28_lmg.png",
        unitSymbol: "",
        active: true,
      },
    ],
    defaultWeapon: "kar98k_panzergrenadier_ak",
    slots: 5,
    cover: false,
    moving: false,
  };
};

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.blue[5],
    color: theme.white,
  },
  inner: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[0],
  },
}));

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  CTitle,
  CTooltip,
  Legend,
  Filler,
);

// Line Chart Options
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      min: 0,
      suggestedMax: 35,
      title: {
        display: true,
        text: "Distance",
      },

      grid: {
        lineWidth: 0.5,
        // color: "#6a6a6a",
        display: true,
      },
      ticks: {
        padding: 20,
        //    color: "#9a9a9a",
        font: {
          size: 12,
        },
      },
    },
    y: {
      type: "linear" as const,
      suggestedMin: 0,
      suggestedMax: 35,
      grid: {
        lineWidth: 0.5,
        //  color: "#6a6a6a",
        display: false,
      },
      title: {
        display: true,
        text: "DPS",
      },
      ticks: {
        padding: 20,
        //  color: "#9a9a9a",
        font: {
          size: 12,
        },
      },
    },
  },
};

// image: item.icon_name,
// label: item.id,
// value: item.id,
// data : item.weapon_bag,
// description: item.ui_name || 'No Description Available',
const mapChartData = (searchItem: any) => {
  const noData: any[] = [];

  const chartLine = {
    label: "No Item Selected",
    data: noData,
    borderWidth: 2,
    borderColor: "#4dabf7", // '#d048b6',
    //cubicInterpolationMode: "monotone" as const,
    stepped: "after",
    tension: 0.5,
    pointStyle: "rect",
    fill: false,
    backgroundColor: "rgba(0, 100, 150, 0.3)",
    pointRadius: 5,
    intersect: true,
  };

  if (searchItem) {
    (chartLine.label = searchItem.value), (chartLine.data = getWeaponDPSData(searchItem.data)); // no clue
  }
  return chartLine;
};

function hexToRgbA(hex: string, opacity: string) {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + "," + opacity + ")";
  }
  throw new Error("Bad Hex");
}

const getWeaponDPSData = (weapon_bag: any) => {
  if (!weapon_bag || !weapon_bag.accuracy) return [];

  return getSingleWeaponDPS(weapon_bag);
};

interface IDPSProps {
  searchData: any[];
}

export const DpsChart = () => {
  const searchData_default: any[] = [];
  const [activeData, setActiveData] = useState(searchData_default);
  const { classes } = useStyles();

  function onSelectionChange(selectionItem: any[]) {
    setActiveData(selectionItem);
  }

  // default values
  const chartData = { datasets: [mapChartData(null)] };
  let maxY = 1;

  const colorIndex = [];
  const theme = useMantineTheme();
  for (const c in theme.colors) colorIndex.push(c);

  if (activeData.length > 0) {
    chartData.datasets = [];
    //const selectItem = searchItems.searchData.find(item => item.value = activeData );
    activeData.forEach((set) => {
      chartData.datasets.push(mapChartData(set));
    });

    chartData.datasets.forEach(function (set, i) {
      set.borderColor = theme.colors.blue[5];
      set.backgroundColor = hexToRgbA(theme.colors.blue[5], "0.3");
      // set.fill = true;
      if (i > 0) {
        set.borderColor = theme.colors.red[5];
        set.backgroundColor = hexToRgbA(theme.colors.red[5], "0.3");
        //set.fill = false;
      }

      set.data.forEach((point: any) => {
        if (point.y > maxY) maxY = point.y;
      });
    });
  }
  // some scale buffer above the highest point
  maxY = maxY * 1.1;

  options.scales.y.suggestedMax = maxY;

  return (
    <>
      <Container size="md">
        <Paper className={classes.inner} radius="md" px="lg" py={3} mt={6}>
          <Space h="sm" />
          <UnitSearch searchData={WeaponStats} onSelect={onSelectionChange}></UnitSearch>
          <Space h="sm" />
          {false && (
            <>
              <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
                <Stack align="left" justify="flex-start" spacing="xs">
                  <Box
                    sx={(theme) => ({
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[9]
                          : theme.colors.gray[0],
                      border: "solid 1px " + theme.colors.dark[6],
                      textAlign: "left",
                      padding: theme.spacing.xs,
                      borderRadius: theme.radius.md,
                    })}
                  >
                    <Group>
                      <Avatar
                        src="/icons/races/afrika_corps/infantry/panzergrenadier_ak.png"
                        alt="Panzergrenadier"
                        radius="xs"
                        size="md"
                      />
                      <Rating defaultValue={0} size="sm" count={3} />

                      <ActionIcon size="lg">
                        <Image src="\icons\common\abilities\tactical_movement_riflemen_us.png">
                          {" "}
                        </Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/cover/heavy.png"></Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/cover/light.png"></Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/cover/negative.png"></Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/units/garrisoned.png"></Image>
                      </ActionIcon>
                    </Group>
                  </Box>
                  <WeaponSearch
                    searchData={WeaponStats}
                    onSelect={onSelectionChange}
                  ></WeaponSearch>
                  <Group spacing="xs">
                    <Box
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.colors.gray[0],
                        border: "solid 1px " + theme.colors.dark[4],
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                      })}
                    >
                      <Image
                        width={60}
                        height={30}
                        src="\unitStats\weaponClass\weapon_lmg_mg34.png"
                        fit="contain"
                        alt="K98"
                      />
                      <Text size="xs">weapon_lmg_mg34</Text>
                      <Space h="xs"></Space>
                      <Box
                        sx={(theme) => ({
                          width: "60px",
                        })}
                      >
                        <NumberInput defaultValue={5} size="xs" />
                      </Box>
                    </Box>

                    <Box
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.colors.gray[0],
                        border: "solid 1px " + theme.colors.dark[4],
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                      })}
                    >
                      <Image
                        width={60}
                        height={30}
                        src="\unitStats\weaponClass\weapon_lmg_mg34.png"
                        fit="contain"
                        alt="K98"
                      />
                      <Text size="xs">weapon_lmg_mg34</Text>
                      <Space h="xs"></Space>
                      <Box
                        sx={(theme) => ({
                          width: "60px",
                        })}
                      >
                        <NumberInput defaultValue={5} size="xs" />
                      </Box>
                    </Box>

                    <Box
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[9]
                            : theme.colors.gray[0],
                        border: "solid 1px " + theme.colors.dark[4],
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                      })}
                    >
                      <Image
                        width={60}
                        height={30}
                        src="\unitStats\weaponClass\weapon_lmg_mg34.png"
                        fit="contain"
                        alt="K98"
                      />
                      <Text size="xs">weapon_lmg_mg34</Text>
                      <Space h="xs"></Space>
                      <Box
                        sx={(theme) => ({
                          border:
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[9]
                              : theme.colors.gray[0],
                          width: "60px",
                        })}
                      >
                        <NumberInput defaultValue={5} size="xs" />
                      </Box>
                    </Box>
                  </Group>
                </Stack>

                <Stack align="left" justify="flex-start" spacing="xs">
                  <Box
                    sx={(theme) => ({
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[9]
                          : theme.colors.gray[0],
                      border: "solid 1px " + theme.colors.dark[6],
                      textAlign: "left",
                      padding: theme.spacing.xs,
                      borderRadius: theme.radius.md,
                    })}
                  >
                    <Group>
                      <Avatar
                        src="/icons/races/british/infantry/tommy_uk.png"
                        alt="Panzergrenadier"
                        radius="xs"
                        size="md"
                      />
                      <Rating defaultValue={0} size="sm" count={3} />

                      <ActionIcon size="lg">
                        <Image src="\icons\common\abilities\tactical_movement_riflemen_us.png">
                          {" "}
                        </Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/cover/heavy.png"></Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/cover/light.png"></Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/cover/negative.png"></Image>
                      </ActionIcon>
                      <ActionIcon size="lg">
                        <Image src="/icons/common/units/garrisoned.png"></Image>
                      </ActionIcon>
                    </Group>
                  </Box>

                  <Group spacing="xs">
                    <Box
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.colors.gray[0],
                        border: "solid 1px " + theme.colors.dark[4],
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                      })}
                    >
                      <Image
                        width={60}
                        height={30}
                        src="/unitStats/weaponClass/weapon_dp_28_lmg.png"
                        fit="contain"
                        alt="K98"
                      />
                      <Text size="xs">weapon_lmg_mg34</Text>
                      <Space h="xs"></Space>
                      <Box
                        sx={(theme) => ({
                          width: "60px",
                        })}
                      >
                        <NumberInput defaultValue={5} size="xs" />
                      </Box>
                    </Box>

                    <Box
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[7]
                            : theme.colors.gray[0],
                        border: "solid 1px " + theme.colors.dark[4],
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                      })}
                    >
                      <Image
                        width={60}
                        height={30}
                        src="/unitStats/weaponClass/weapon_dp_28_lmg.png"
                        fit="contain"
                        alt="K98"
                      />
                      <Text size="xs">weapon_lmg_mg34</Text>
                      <Space h="xs"></Space>
                      <Box
                        sx={(theme) => ({
                          width: "60px",
                        })}
                      >
                        <NumberInput defaultValue={5} size="xs" />
                      </Box>
                    </Box>
                  </Group>
                </Stack>

                <Space h="sm" />
              </SimpleGrid>
              <Space h="sm" />
            </>
          )}
        </Paper>
      </Container>
      <Container size="md">
        <Paper className={classes.inner} radius="md" px="lg" py={3} mt={6}>
          <Line options={options} data={chartData as any} redraw={true} />
        </Paper>
      </Container>
    </>
  );
};
