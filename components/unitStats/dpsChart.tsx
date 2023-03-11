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
import { Paper, createStyles, Container, Space, useMantineTheme, Grid } from "@mantine/core";
import { WeaponSearch } from "./weaponSearch";
import { WeaponStats, WeaponType } from "../../src/unitStats/mappingWeapon";
import { UnitSearch } from "./unitSearch";
import { getSingleWeaponDPS } from "../../src/unitStats/weaponLib";
import { resolveLocstring } from "../../src/unitStats/locstring";
import { CustomizableUnit, DpsUnitCustomizing } from "./dpsUnitCustomizing";
import { sbpsStats, SbpsType } from "../../src/unitStats/mappingSbps";
import { EbpsType } from "../../src/unitStats/mappingEbps";
import { UpgradesType } from "../../src/unitStats/mappingUpgrades";
import { getFactionIcon } from "../../src/unitStats/unitStatsLib";

type SelectedUnits = {
  units: CustomizableUnit[];
};

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
    //cubicInterpolationMode: "monotone" as const,
    stepped: "after",
    tension: 0.5,
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
  dpsSet.push(getCombatDps(units[0], units[1]));

  if (units.length == 2) dpsSet.push(getCombatDps(units[1], units[0]));

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
  let cover = weaponBag["tp_" + coverType + "_cover"];
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
  weapons?: WeaponType[],
): any => {
  // Initilaize
  const custUnit: any = {
    id: sbpsSelected.id, // filename  -> eg. panzergrenadier_ak
    screenName: sbpsSelected.screenName, // sbpextensions\squad_ui_ext\race_list\race_data\info\screen_name
    path: sbpsSelected.path, // path to object
    faction: sbpsSelected.faction, // from folder structure races\[factionName]
    loadout: [], // squad_loadout_ext.unit_list
    unitType: sbpsSelected.unitType, // folder Infantry | vehicles | team_weapons | buildings
    helpText: sbpsSelected.helpText, // sbpextensions\squad_ui_ext\race_list\race_data\info\help_text
    iconName: sbpsSelected.iconName, // sbpextensions\squad_ui_ext\race_list\race_data\info\icon_name
    factionIcon: getFactionIcon(sbpsSelected.faction),
    cover: "",
    isMoving: false,
    targetSize: 1,
    armor: 1,
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
    selectionFields.push(mapUnitDisplayData(squad));
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
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isLargeScreen = useMediaQuery("(min-width: 56.25em)");

  // create selection List
  if (unitSelectionList.length == 0 && props.sbpsData.length > 0)
    unitSelectionList = mapUnitSelection(props.sbpsData);

  setScreenOptions(options, isLargeScreen);

  function onSquadConfigChange(unit: CustomizableUnit) {
    const units = [...activeData];
    units.forEach((squad: CustomizableUnit, index: number) => {
      if (squad.id == unit.id) units[index] = unit;
    });
    setActiveData(units);
  }

  function onSelectionChange(selectionItem: any[]) {
    setActiveData(selectionItem);
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
    activeData.forEach((set, index) => {
      // add line to graph
      chartData.datasets.push(mapChartData(dpsLines[index], set.id));
    });

    // make lines beautifull
    chartData.datasets.forEach(function (set, i) {
      set.borderColor = theme.colors.blue[5];
      //set.backgroundColor = hexToRgbA(theme.colors.blue[5], "0.3");
      // set.fill = true;
      if (i > 0) {
        set.borderColor = theme.colors.red[5];
        //set.backgroundColor = hexToRgbA(theme.colors.red[5], "0.3");
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
      <Container>
        <Paper className={classes.inner} radius="md" px="lg" py={3} mt={6}>
          <Space h="sm" />

          <UnitSearch searchData={unitSelectionList} onSelect={onSelectionChange}></UnitSearch>
          <Space h="sm" />

          <>
            <Grid>
              {activeData.length > 0 && (
                <Grid.Col md={6} lg={6}>
                  <DpsUnitCustomizing
                    unit={activeData[0]}
                    onChange={onSquadConfigChange}
                  ></DpsUnitCustomizing>
                </Grid.Col>
              )}
              {activeData.length > 1 && (
                <Grid.Col md={6} lg={6}>
                  <DpsUnitCustomizing
                    unit={activeData[1]}
                    onChange={onSquadConfigChange}
                  ></DpsUnitCustomizing>
                </Grid.Col>
              )}
              <Space h="sm" />
            </Grid>

            <Space h="sm" />
          </>
        </Paper>
      </Container>
      <Container>
        <Paper className={classes.inner} radius="md" px="lg" py={3} mt={6}>
          <Line options={options as any} data={chartData as any} redraw={true} />
        </Paper>
      </Container>
    </>
  );
};
