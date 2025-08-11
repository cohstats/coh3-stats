import React, { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

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

import { Container, Space, useMantineTheme, Grid, Title, Flex } from "@mantine/core";
import { EbpsType, getEbpsStats } from "../../../src/unitStats/mappingEbps";
import { getWeaponStats, WeaponType } from "../../../src/unitStats/mappingWeapon";
import { getSbpsStats, SbpsType } from "../../../src/unitStats/mappingSbps";
import {
  CustomizableUnit,
  getDpsVsHealth,
  getWeaponDPSData,
  mapCustomizableUnit,
  updateHealth,
} from "../../../src/unitStats/dpsCommon";
import config from "../../../config";
import {
  AnalyticsDPSExplorerPatchSelection,
  AnalyticsDPSExplorerSquadSelection,
} from "../../../src/firebase/analytics";

// Sub-components
import { SettingsPanel } from "./components/SettingsPanel";
import { UnitSelectionPanel } from "./components/UnitSelectionPanel";
import { UnitCustomizationPanel } from "./components/UnitCustomizationPanel";
import { ChartPanel } from "./components/ChartPanel";

let unitSelectionList1: CustomizableUnit[] = [];
let unitSelectionList2: CustomizableUnit[] = [];

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
export const mapChartData = (data: any[], id?: string, isStaircase?: boolean) => {
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

const setScreenOptions = (_chartOptions: any, isLargeScreen: boolean) => {
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

const mapUnitSelection = (
  sbps: SbpsType[],
  units: CustomizableUnit[],
  unitFilter: string[] = [],
) => {
  const selectionFields = [];

  for (const squad of sbps) {
    if (
      squad.ui.symbolIconName != "" &&
      squad.faction != "british" &&
      (unitFilter.length == 0 || unitFilter.includes(squad.faction))
    ) {
      const custUnit = units.find((custUnit) => custUnit.id == squad.id);
      if (!custUnit) continue;
      if (custUnit.weapon_member.length > 0) selectionFields.push(custUnit);
    }
  }
  return selectionFields;
};

let units1: CustomizableUnit[] = [];
let units2: CustomizableUnit[] = [];

let ebpsData1: EbpsType[] = [];
let sbpsData1: SbpsType[] = [];
let weaponData1: WeaponType[] = [];

let ebpsData2: EbpsType[] = [];
let sbpsData2: SbpsType[] = [];
let weaponData2: WeaponType[] = [];

interface IDPSProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
}

export const init = (props: IDPSProps) => {
  ebpsData1 = props.ebpsData;
  sbpsData1 = props.sbpsData;
  weaponData1 = props.weaponData;
  ebpsData2 = props.ebpsData;
  sbpsData2 = props.sbpsData;
  weaponData2 = props.weaponData;

  // Get Customizable units
  for (const sbps of props.sbpsData)
    units1.push(mapCustomizableUnit(sbps, props.ebpsData, props.weaponData));
  units2 = [...units1];
};

export const DpsPageComponent = (props: IDPSProps) => {
  const filter_def1: string[] = [];
  const filter_def2: string[] = [];
  const searchData_default: CustomizableUnit[] = [];

  const [patchChangeIndex, setPatchChange] = useState(0);
  const [activeData] = useState(searchData_default);
  const [unitFilter1, setFilter1] = useState(filter_def1);
  const [unitFilter2, setFilter2] = useState(filter_def2);
  const [patchUnit1, setPatchUnit1] = useState("");
  const [patchUnit2, setPatchUnit2] = useState("");

  const [rerender, setRerender] = useState(false);
  // const [isStaircase, setStaircase] = useState(false);
  const [isStaircase] = useState(false);
  const [showDpsHealth, setShowDpsHealth] = useState(false);
  const [allowAllWeapons, setAllowAllWeapons] = useState(false);

  // const { classes } = useStyles();
  const theme = useMantineTheme();

  // We must init ONCE, otherwise the default will override any change.
  useEffect(() => {
    init(props);
  }, []);

  // if(config.isDevEnv())
  const patchList = [];
  for (const key in config.patches) {
    patchList.push(key);
  }

  const isLargeScreen = useMediaQuery("(min-width: 56.25em)");

  setScreenOptions(options, isLargeScreen);

  // create selection List
  if (unitSelectionList1.length == 0 && props.sbpsData.length > 0)
    unitSelectionList1 = mapUnitSelection(props.sbpsData, units1, unitFilter1);
  if (unitSelectionList2.length == 0 && props.sbpsData.length > 0)
    unitSelectionList2 = mapUnitSelection(props.sbpsData, units2, unitFilter2);

  const chartData = { datasets: [mapChartData([])] };

  // Squad configration has changed
  const onSquadConfigChange = () => {
    setRerender(!rerender);
  };

  // synchronize selection field with presented units
  const onSelectionChange = (selection: string | null, index: number) => {
    if (!selection) {
      // @ts-ignore Because we can not pass an empty object, otherwise we would
      // need to put `.?` safe accessor everywhere.
      activeData[index] = undefined;
      setRerender(!rerender);
      return;
    }

    AnalyticsDPSExplorerSquadSelection(selection);

    // check if unit is already selected
    if (activeData[index]?.id == selection) return;

    // get blueprint
    let unitBp = unitSelectionList1.find((unit) => unit.id == selection);
    if (index == 1) unitBp = unitSelectionList2.find((unit) => unit.id == selection);

    // add unit
    if (unitBp) {
      activeData[index] = { ...unitBp };
      activeData[index].weapon_member = []; // Clear loadout reference
      for (const loadout of unitBp.weapon_member)
        activeData[index].weapon_member.push({ ...loadout });
      setRerender(!rerender);
    }
  };

  const onPatchUnitChange = (value: string, index: number) => {
    AnalyticsDPSExplorerPatchSelection(value);

    if (index == 1) setPatchUnit1(value);
    else setPatchUnit2(value);
    setPatchChange(index);
  };

  const toggleFilter = (
    filterValue: string,
    unitIndex = 1,
    unitFilter: string[],
    unitSelectionList: CustomizableUnit[],
  ) => {
    const filterValueIndex = unitFilter.indexOf(filterValue);

    if (filterValueIndex < 0) unitFilter.push(filterValue);
    else unitFilter.splice(filterValueIndex, 1);

    unitSelectionList.splice(0, unitSelectionList.length);

    if (unitIndex == 1) setFilter1([...unitFilter]);
    else setFilter2([...unitFilter]);
  };

  useEffect(() => {
    const getPatchStats = async () => {
      // Get Patch data from cache or fetch
      if (patchChangeIndex == 1) {
        sbpsData1 = await getSbpsStats(patchUnit1);
        ebpsData1 = await getEbpsStats(patchUnit1);
        weaponData1 = await getWeaponStats(patchUnit1);
        units1 = [];
        for (const unitSbps of sbpsData1)
          units1.push(mapCustomizableUnit(unitSbps, ebpsData1, weaponData1));
        unitSelectionList1 = mapUnitSelection(sbpsData1, units1, unitFilter1);
        if (activeData[0]) {
          const id = activeData[0].id;
          activeData[0] = {} as CustomizableUnit;
          onSelectionChange(id, 0);
        }
      } else if (patchChangeIndex == 2) {
        sbpsData2 = await getSbpsStats(patchUnit2);
        ebpsData2 = await getEbpsStats(patchUnit2);
        weaponData2 = await getWeaponStats(patchUnit2);
        units2 = [];
        for (const unitSbps of sbpsData2)
          units2.push(mapCustomizableUnit(unitSbps, ebpsData2, weaponData2));
        unitSelectionList2 = mapUnitSelection(sbpsData2, units2, unitFilter2);
        if (activeData[1]) {
          const id = activeData[1].id;
          activeData[1] = {} as CustomizableUnit;
          onSelectionChange(id, 1);
        }
      }
      setPatchChange(0);
      // setRerender(!rerender);
    };
    if (patchChangeIndex > 0) getPatchStats();
  }, [
    patchUnit1,
    patchUnit2,
    unitFilter1,
    unitFilter2,
    activeData,
    patchChangeIndex,
    onSelectionChange,
  ]);

  let maxY = 1;
  let maxX = 1;

  for (const unit of activeData) if (unit) updateHealth(unit);
  options.scales.y.title.text = "Damage Per Second (DPS)";
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
      if (activeData[0]) dpsLines[0] = getDpsVsHealth(ebpsData1, activeData[0], activeData[1]);
      if (activeData[1]) dpsLines[1] = getDpsVsHealth(ebpsData2, activeData[1], activeData[0]);
    }

    //const selectItem = searchItems.searchData.find(item => item.value = activeData );

    if (activeData[0]) {
      const set = mapChartData(dpsLines[0], activeData[0].id, isStaircase);
      set.borderColor = theme.colors.blue[5];
      chartData.datasets.push(set);
      set.data.forEach((point: any) => {
        if (point.y > maxY) maxY = point.y;
        if (point.x > maxX) maxX = point.x;
      });
    }

    if (activeData[1]) {
      const set = mapChartData(dpsLines[1], activeData[1].id, isStaircase);
      set.borderColor = theme.colors.red[5];
      chartData.datasets.push(set);
      set.data.forEach((point: any) => {
        if (point.y > maxY) maxY = point.y;
        if (point.x > maxX) maxX = point.x;
      });
    }
  }
  // some scale buffer above the highest point
  maxY = (Math.floor(maxY / 10) + 1) * 10;

  options.scales.y.suggestedMax = maxY;
  options.scales.x.suggestedMax = maxX;

  return (
    <>
      <Container>
        <Grid>
          <Grid.Col span={10}>
            <Title order={2}>Company of Heroes 3 DPS Benchmark Tool </Title>
          </Grid.Col>
          <Grid.Col span={2}>
            <Flex justify="flex-end" wrap="wrap">
              <Space h="2rem" />
              <SettingsPanel
                showDpsHealth={showDpsHealth}
                allowAllWeapons={allowAllWeapons}
                onShowDpsHealthChange={setShowDpsHealth}
                onAllowAllWeaponsChange={setAllowAllWeapons}
                onResetUnits={() => {
                  onSelectionChange(null, 0);
                  onSelectionChange(null, 1);
                }}
              />
            </Flex>
          </Grid.Col>
        </Grid>

        <Space></Space>

        <Space h="xl" />
        <>
          <Grid>
            <Grid.Col span={{ md: 6, lg: 6 }}>
              <UnitSelectionPanel
                unitFilter={unitFilter1}
                unitSelectionList={unitSelectionList1}
                patchList={patchList}
                defaultPatch={config.latestPatch}
                position={1}
                onFilterToggle={toggleFilter}
                onPatchChange={onPatchUnitChange}
                onUnitSelect={onSelectionChange}
              />
              <UnitCustomizationPanel
                unit={activeData[0]}
                position={0}
                patchVersion={patchUnit1}
                ebpsData={ebpsData1}
                weaponData={weaponData1}
                allowAllWeapons={allowAllWeapons}
                onSquadConfigChange={onSquadConfigChange}
              />
            </Grid.Col>

            <Grid.Col span={{ md: 6, lg: 6 }}>
              <UnitSelectionPanel
                unitFilter={unitFilter2}
                unitSelectionList={unitSelectionList2}
                patchList={patchList}
                defaultPatch={config.latestPatch}
                position={2}
                onFilterToggle={toggleFilter}
                onPatchChange={onPatchUnitChange}
                onUnitSelect={onSelectionChange}
              />
              <UnitCustomizationPanel
                unit={activeData[1]}
                position={1}
                patchVersion={patchUnit2}
                ebpsData={ebpsData2}
                weaponData={weaponData2}
                allowAllWeapons={allowAllWeapons}
                onSquadConfigChange={onSquadConfigChange}
              />
            </Grid.Col>
          </Grid>
        </>
      </Container>

      <Space h="sm" />
      <ChartPanel chartData={chartData} chartOptions={options} isLoading={patchChangeIndex > 0} />
    </>
  );
};
