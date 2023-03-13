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
  createStyles,
  Container,
  Space,
  useMantineTheme,
  Grid,
  Flex,
  Box,
  Stack,
  Title,
  Switch,
} from "@mantine/core";
import { UnitSearch } from "./unitSearch";
import { getSingleWeaponDPS } from "../../src/unitStats/weaponLib";
import { CustomizableUnit, DpsUnitCustomizing } from "./dpsUnitCustomizing";
import { EbpsType } from "../../src/unitStats/mappingEbps";
import { getFactionIcon } from "../../src/unitStats/unitStatsLib";
import slash from "slash";
import { WeaponType } from "../../src/unitStats/mappingWeapon";
import { SbpsType } from "../../src/unitStats/mappingSbps";
import Head from "next/head";

// let unitSelectionList :  CustomizableUnit[] = [];
let unitSelectionList: CustomizableUnit[] = [];

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.blue[5],
    color: theme.white,
  },
  inner: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[0],
  },
}));

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

// image: item.icon_name,
// label: item.id,
// value: item.id,
// data : item.weapon_bag,
// description: item.ui_name || 'No Description Available',
const mapChartData = (data: any[], id?: string) => {
  const chartLine = {
    label: "No Item Selected",
    data: data,
    borderWidth: 2,
    borderColor: "#4dabf7", // '#d048b6',
    cubicInterpolationMode: "monotone" as const,
    //stepped: "after",
    stepped: "",
    tension: 0.1,
    pointStyle: "rect",
    fill: false,
    backgroundColor: "rgba(0, 100, 150, 0.3)",
    pointRadius: 5,
    intersect: true,
  };

  if (id) chartLine.label = id;

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

const getCombatDps = (unit1: CustomizableUnit, unit2?: CustomizableUnit) => {
  // compute dps for first squad
  let dpsTotal: any[] = [];

  // compute total dps for complete loadout
  unit1.loadout.forEach((ldout) => {
    const weapon = ldout as unknown as WeaponType;
    let weaponDps = [];
    // opponent default values
    let targetSize = 1;
    let armor = 1;
    let opponentCover = {
      accuracy_multiplier: 1,
      damage_multiplier: 1,
      penetration_multiplier: 1,
    };

    // Check if we also need to consider opponent multiplier
    if (unit2) {
      // get cover stats
      opponentCover = getCoverMultiplier(unit2.cover, weapon.weapon_bag);
      targetSize = unit2.targetSize;
      armor = unit2.armor;
    }

    weaponDps = getSingleWeaponDPS(
      weapon.weapon_bag,
      ldout.num,
      targetSize,
      armor,
      unit1.isMoving,
      opponentCover,
    );
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

      // weapon 2 has has a range which do not exist for weapon 1
      // eg. weapon1.mid = 22 != weapon2.mid = 20
      // merge into range of weapon2
      if (point1.x > point2.x) newSet.push(mergePoints(point2, point1));

      // // weapon2 range is more fare a way than
      // // current weapon1 range. We need to merge
      // // into weapon1 range and stop.
      // if(point1.x < point2.x)
      // {
      //   newSet.push(mergePoints(point1,point2))
      //   break;
      // }
    }
  }

  return newSet;
};

const mergePoints = (xPoint: any, yPoint: any) => {
  return { x: xPoint.x, y: xPoint.y + yPoint.y };
};

const getCoverMultiplier = (coverType: string, weaponBag: any) => {
  let cover = weaponBag.cover_table["tp_" + coverType + "_cover"];
  if (!cover) cover = weaponBag.tp_defcover;
  return cover;
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

const mapUnitDisplayData = (
  sbpsSelected: SbpsType,
  ebps?: EbpsType[],
  // weapons?: WeaponType[],
): any => {
  // Initilaize
  const custUnit: any = {
    id: sbpsSelected.id, // filename  -> eg. panzergrenadier_ak
    screenname: sbpsSelected.ui.screenName || "No text found", // sbpextensions\squad_ui_ext\race_list\race_data\info\screen_name
    path: sbpsSelected.path, // path to object
    faction: sbpsSelected.faction, // from folder structure races\[factionName]
    loadout: [], // squad_loadout_ext.unit_list
    unitType: sbpsSelected.unitType, // folder Infantry | vehicles | team_weapons | buildings
    helpText: sbpsSelected.ui.helpText, // sbpextensions\squad_ui_ext\race_list\race_data\info\help_text
    iconName: slash("/icons/" + sbpsSelected.ui.iconName + ".png") || "icon", // sbpextensions\squad_ui_ext\race_list\race_data\info\icon_name
    factionicon: getFactionIcon(sbpsSelected.faction),
    cover: "",
    isMoving: false,
    targetSize: 1,
    armor: 1,
    image: getFactionIcon(sbpsSelected.faction),
    description: sbpsSelected.ui.screenName,
    label: sbpsSelected.id,
    value: sbpsSelected.id,
  };

  // Get loadouts
  if (ebps) {
  }

  return custUnit;
};

const mapUnitSelection = (sbps: SbpsType[]) => {
  const selectionFields = [];

  for (const squad of sbps) {
    if (squad.unitType == "infantry") selectionFields.push(mapUnitDisplayData(squad));
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
  const [activeData, setActiveData] = useState(searchData_default);
  const [rerender, setRerender] = useState(false);
  const [isCurve, setCurve] = useState(true);
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isLargeScreen = useMediaQuery("(min-width: 56.25em)");

  // create selection List
  if (unitSelectionList.length == 0 && props.sbpsData.length > 0)
    unitSelectionList = mapUnitSelection(props.sbpsData);

  setScreenOptions(options, isLargeScreen);

  // Squad configration has changed
  function onSquadConfigChange(unit: CustomizableUnit) {
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
      activeData[index].loadout = []; // Clear loadout reference
      setRerender(!rerender);
    }
  }

  // default values
  const chartData = { datasets: [mapChartData([])] };
  let maxY = 1;

  if (activeData.length > 0) {
    chartData.datasets = [];

    // compute dps lines
    // should be an array of max two dps Lines;
    const dpsLines = getWeaponDPSData(activeData);

    //const selectItem = searchItems.searchData.find(item => item.value = activeData );

    if (activeData[0]) {
      const set = mapChartData(dpsLines[0], activeData[0].id);
      set.borderColor = theme.colors.blue[5];
      chartData.datasets.push(set);

      if (isCurve) {
        //set.cubicInterpolationMode = "monotone";
        set.stepped = "";
      } else {
        //@ts-ignore
        //set.cubicInterpolationMode = 'default';
        set.stepped = "after";
      }

      set.data.forEach((point: any) => {
        if (point.y > maxY) maxY = point.y;
      });
    }

    if (activeData[1]) {
      const set = mapChartData(dpsLines[1], activeData[1].id);
      set.borderColor = theme.colors.red[5];
      if (isCurve) {
        //set.cubicInterpolationMode = "monotone";
        set.stepped = "";
      } else {
        //@ts-ignore
        //set.cubicInterpolationMode = 'default';
        set.stepped = "after";
      }
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
        <Stack mb={24}>
          <Title order={2}>Company of Heroes 3 DPS Tool</Title>
        </Stack>

        <Flex
          // mih={50}
          gap="xs"
          justify="flex-end"
          align="center"
          direction="row"
          wrap="wrap"
        >
          <Switch
            label={isCurve ? "Curve" : "Staircase"}
            checked={isCurve}
            onChange={(event) => setCurve(event.currentTarget.checked)}
            //onClick={() => setCurve(isCurve)}
            size="xs"
          />
        </Flex>

        <Space h="sm" />
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
