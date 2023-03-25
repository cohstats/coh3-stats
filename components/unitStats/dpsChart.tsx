import React, { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

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
  Container,
  Space,
  useMantineTheme,
  Grid,
  Flex,
  Box,
  Stack,
  Title,
  Switch,
  HoverCard,
  Text,
  Group,
} from "@mantine/core";
import { UnitSearch } from "./unitSearch";
import { getSingleWeaponDPS } from "../../src/unitStats/weaponLib";
import { DpsUnitCustomizing } from "./dpsUnitCustomizing";
import { EbpsType } from "../../src/unitStats/mappingEbps";
// import slash from "slash";
import { WeaponType } from "../../src/unitStats/mappingWeapon";
import { SbpsType } from "../../src/unitStats/mappingSbps";
import Head from "next/head";
import { IconAdjustments } from "@tabler/icons";
import { CustomizableUnit, mapCustomizableUnit } from "../../src/unitStats/dpsCommon";

// let unitSelectionList :  CustomizableUnit[] = [];
let unitSelectionList: CustomizableUnit[] = [];

// function hexToRgbA(hex: string, opacity: string) {
//   let c: any;
//   if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
//     c = hex.substring(1).split("");
//     if (c.length == 3) {
//       c = [c[0], c[0], c[1], c[1], c[2], c[2]];
//     }
//     c = "0x" + c.join("");
//     return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + "," + opacity + ")";
//   }
//   throw new Error("Bad Hex");
// }

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
      position: "top",
      display: true,
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
        display: true,
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
    },
  },
};

// description: item.ui_name || 'No Description Available',
const mapChartData = (data: any[], id?: string, isStaircase?: boolean) => {
  const chartLine = {
    label: "No Item Selected",
    data: data,
    borderWidth: 3,
    borderColor: "#4dabf7", // '#d048b6',
    //cubicInterpolationMode: "monotone" as const,
    //stepped: "after",
    stepped: "",
    tension: 0.1,
    pointStyle: "cross",
    fill: false,
    backgroundColor: "rgba(200, 200, 200, 0.2)",
    pointRadius: 0,
    pointHoverRadius: 30,
    pointHitRadius: 10,
    intersect: true,
  };

  if (id) chartLine.label = id;

  if (isStaircase) {
    //set.cubicInterpolationMode = "monotone";
    chartLine.stepped = "after";
  }

  return chartLine;
};

const getWeaponDPSData = (units: CustomizableUnit[]) => {
  const dpsSet: any[] = [];

  if (units.length == 0) return dpsSet;

  // we only have two units so we keep it simple -> No generic loop stuff
  if (units[0]) dpsSet[0] = getCombatDps(units[0], units[1]);

  if (units[1]) dpsSet[1] = getCombatDps(units[1], units[0]);

  return dpsSet;
};

const updateHealth = (unit: CustomizableUnit) => {
  let health = 0;
  if (unit.unit_type != "vehicles")
    for (const member of unit.weapon_member) {
      health += unit.hitpoints * member.num * Math.max(member.crew_size, 1);
    }
  // is vehicle
  else {
    health += unit.hitpoints;
  }
  unit.health = health;
};

const getDpsVsHealth = (ebps: EbpsType[], unit1: CustomizableUnit, unit2?: CustomizableUnit) => {
  const dpsData: any[] = getCombatDps(unit1, unit2);
  let health = unit1.health;

  // compute opponents health
  if (unit2) health = unit2.health;

  for (const dps of dpsData) dps.y = (dps.y / health) * 100;

  return dpsData;
};

const getCombatDps = (unit1: CustomizableUnit, unit2?: CustomizableUnit) => {
  // compute dps for first squad
  let dpsTotal: any[] = [];

  // compute total dps for complete loadout
  unit1.weapon_member.forEach((ldout) => {
    const weapon_member = ldout;
    const weaponDps = [];

    const range_min = weapon_member.weapon.weapon_bag.range_min;
    const range_max = weapon_member.weapon.weapon_bag.range_max;
    // opponent default values

    for (let distance = range_min; distance <= range_max; distance++) {
      const dps = getSingleWeaponDPS(weapon_member, distance, unit1.is_moving, unit2);
      weaponDps.push({ x: distance, y: dps });
    }

    dpsTotal = addDpsData(dpsTotal, weaponDps);
  });

  return dpsTotal;
};

// sums up two dps lines
const addDpsData = (dps1: any[], dps2: any[]) => {
  if (dps1.length == 0) return dps2;
  // set with {x,y} touples
  const newSet: any[] = [];

  let ind_2 = 0; // loop only once through second line
  for (let ind_1 = 0; ind_1 < dps1.length; ind_1++) {
    const point1 = dps1[ind_1];

    for (ind_2; ind_2 < dps2.length; ind_2++) {
      const point2 = dps2[ind_2];

      // ideal case. Both weapons address the same range. simply merge
      // and check the next points.
      if (point1.x == point2.x || point1.x < point2.x) {
        newSet.push(mergePoints(point1, point2));
        if (point1.x == point2.x) ind_2++;
        break;
      }

      // merge into range of weapon2
      if (point1.x > point2.x) newSet.push(mergePoints(point2, point1));
    }
  }

  return newSet;
};

const mergePoints = (xPoint: any, yPoint: any) => {
  return { x: xPoint.x, y: xPoint.y + yPoint.y };
};

const setScreenOptions = (chartOptions: any, isLargeScreen: boolean) => {
  if (!isLargeScreen) {
    options.scales.x.title.display = false;
    options.scales.y.title.display = false;
    options.plugins.legend.display = false;
  } else {
    options.scales.x.title.display = true;
    options.scales.y.title.display = true;
    options.plugins.legend.display = true;
  }
};

const mapUnitSelection = (sbps: SbpsType[], ebps: EbpsType[], weapons: WeaponType[]) => {
  const selectionFields = [];

  for (const squad of sbps) {
    if (squad.ui.symbolIconName != "" && squad.faction != "british") {
      const custUnit = mapCustomizableUnit(squad, ebps, weapons);
      if (custUnit.weapon_member.length > 0) selectionFields.push(custUnit);
    }
  }
  return selectionFields;
};

interface IDPSProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
}

export const DpsChart = (props: IDPSProps) => {
  const searchData_default: CustomizableUnit[] = [];
  const [activeData] = useState(searchData_default);
  const [rerender, setRerender] = useState(false);
  // const [isStaircase, setStaircase] = useState(false);
  const [isStaircase] = useState(false);
  const [showDpsHealth, setShowDpsHealth] = useState(false);
  // const { classes } = useStyles();
  const theme = useMantineTheme();
  const isLargeScreen = useMediaQuery("(min-width: 56.25em)");

  // create selection List
  if (unitSelectionList.length == 0 && props.sbpsData.length > 0)
    unitSelectionList = mapUnitSelection(props.sbpsData, props.ebpsData, props.weaponData);

  setScreenOptions(options, isLargeScreen);

  // Squad configration has changed
  function onSquadConfigChange() {
    setRerender(!rerender);
  }

  // synchronize selection field with presented units
  function onSelectionChange(selection: string, index: number) {
    // add new units

    // check if unit is already selected
    if (activeData[index]?.id == selection) return;

    // get blueprint
    const unitBp = unitSelectionList.find((unit) => unit.id == selection);

    // add unit
    if (unitBp) {
      activeData[index] = { ...unitBp };
      activeData[index].weapon_member = []; // Clear loadout reference
      for (const loadout of unitBp.weapon_member)
        activeData[index].weapon_member.push({ ...loadout });
      setRerender(!rerender);
    }
  }

  // default values
  const chartData = { datasets: [mapChartData([])] };
  let maxY = 1;

  for (const unit of activeData) if (unit) updateHealth(unit);

  if (activeData.length > 0) {
    chartData.datasets = [];

    // compute dps lines
    // should be an array of max two dps Lines;
    let dpsLines: any[] = [];
    if (!showDpsHealth) {
      dpsLines = getWeaponDPSData(activeData);
      options.scales.y.title.text = "Damage Per Second (DPS)";
    } else {
      options.scales.y.title.text = "DPS vs Health (%)";
      if (activeData[0])
        dpsLines[0] = getDpsVsHealth(props.ebpsData, activeData[0], activeData[1]);
      if (activeData[1])
        dpsLines[1] = getDpsVsHealth(props.ebpsData, activeData[1], activeData[0]);
    }

    //const selectItem = searchItems.searchData.find(item => item.value = activeData );

    if (activeData[0]) {
      const set = mapChartData(dpsLines[0], activeData[0].id, isStaircase);
      set.borderColor = theme.colors.blue[5];
      chartData.datasets.push(set);
      set.data.forEach((point: any) => {
        if (point.y > maxY) maxY = point.y;
      });
    }

    if (activeData[1]) {
      const set = mapChartData(dpsLines[1], activeData[1].id, isStaircase);
      set.borderColor = theme.colors.red[5];
      chartData.datasets.push(set);
      set.data.forEach((point: any) => {
        if (point.y > maxY) maxY = point.y;
      });
    }
  }
  // some scale buffer above the highest point
  maxY = maxY * 1.1;

  options.scales.y.suggestedMax = maxY;

  return (
    <>
      <Head>
        <title>DPS - Calculator</title>
        <meta name="Damage Per Second (DPS) Calculator " />
      </Head>

      <Container>
        {/* */}
        <Stack mb={12}>
          <Title order={2}>Company of Heroes 3 DPS Benchmark Tool </Title>
          <Space></Space>
          <Flex
            // mih={50}
            gap="xs"
            justify="flex-end"
            align="center"
            direction="row"
            wrap="wrap"
          >
            <Group position="center">
              <HoverCard width={400} shadow="md">
                <HoverCard.Target>
                  <div>
                    <IconAdjustments opacity={0.6} />
                  </div>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Stack mb={12}>
                    {/* <Text size="sm">
                      {isStaircase
                        ? "Staircase: Show changes at near/mid/far only"
                        : "Line: Applied damage changes linearly over distance"}
                    </Text>
                    <Switch
                      label={isStaircase ? "Staircase" : "Line"}
                      checked={isStaircase}
                      onChange={(event) => setStaircase(event.currentTarget.checked)}
                      size="xs"
                    /> */}
                    <Space></Space>
                    <Text size="sm">
                      {showDpsHealth
                        ? "DPS(%)  : Estimated damage per second in %, respecting enemies health"
                        : "DPS  : Estimated damage per second"}
                    </Text>
                    <Switch
                      label={showDpsHealth ? "DPS(%)" : "DPS Simple"}
                      checked={showDpsHealth}
                      onChange={(event) => setShowDpsHealth(event.currentTarget.checked)}
                      //onClick={() => setCurve(isCurve)}
                      size="xs"
                    />
                  </Stack>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          </Flex>
        </Stack>

        {/* <Space h="sm" /> */}
        <>
          <Grid>
            <Grid.Col md={6} lg={6}>
              <UnitSearch
                key="Search1"
                searchData={unitSelectionList}
                onSelect={onSelectionChange}
                position={0}
              ></UnitSearch>
              <Space h="sm" />
              {activeData[0] && (
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.white,
                    border:
                      theme.colorScheme === "dark"
                        ? "solid 1px " + theme.colors.dark[4]
                        : "solid 2px " + theme.colors.blue[4],
                    textAlign: "left",
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.md,
                  })}
                >
                  <DpsUnitCustomizing
                    key={activeData[0].id + "0"}
                    unit={activeData[0]}
                    onChange={onSquadConfigChange}
                    index={0}
                    ebps={props.ebpsData}
                  ></DpsUnitCustomizing>
                </Box>
              )}
            </Grid.Col>

            <Grid.Col md={6} lg={6}>
              <UnitSearch
                key="Search2"
                searchData={unitSelectionList}
                onSelect={onSelectionChange}
                position={1}
              ></UnitSearch>
              <Space h="sm" />
              {activeData[1] && (
                <Box
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.white,
                    border:
                      theme.colorScheme === "dark"
                        ? "solid 1px " + theme.colors.dark[4]
                        : "solid 2px " + theme.colors.red[6],
                    textAlign: "left",
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.md,
                  })}
                >
                  <DpsUnitCustomizing
                    key={activeData[1].id + "1"}
                    unit={activeData[1]}
                    onChange={onSquadConfigChange}
                    index={0}
                    ebps={props.ebpsData}
                  ></DpsUnitCustomizing>
                </Box>
              )}
            </Grid.Col>

            <Space h="sm" />
          </Grid>
        </>
      </Container>
      <Space h="sm" />
      <Container size="md">
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.white,
            border:
              theme.colorScheme === "dark"
                ? "solid 1px " + theme.colors.dark[4]
                : "solid 1px " + theme.colors.gray[4],
            textAlign: "left",
            // padding: theme.spacing.xs,
            borderRadius: theme.radius.md,
          })}
        >
          <Line options={options as any} data={chartData as any} redraw={true} />
        </Box>
        <Space h="sm" />
      </Container>
    </>
  );
};
