import React, { useEffect, useMemo, useRef, useState } from "react";
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

import {
  Container,
  Space,
  useMantineTheme,
  Grid,
  Title,
  Flex,
  SegmentedControl,
} from "@mantine/core";
import { useRouter } from "next/router";
import { getDPSCompareRoute } from "../../../src/routes";
import {
  createDpsUnitCatalog,
  fetchDpsData,
  filterDpsUnitOptions,
} from "../../../src/unitStats/dpsData";
import type { DpsData, DpsUnitCatalog } from "../../../src/unitStats/dpsData";
import {
  CustomizableUnit,
  getDpsVsHealth,
  getWeaponDPSData,
  updateHealth,
} from "../../../src/unitStats/dpsCommon";
import config from "../../../config";
import { isFinalStandUnit } from "../../../src/unitStats/finalStand";
import {
  AnalyticsDPSExplorerPatchSelection,
  AnalyticsDPSExplorerSquadSelection,
} from "../../../src/firebase/analytics";

// Sub-components
import { SettingsPanel } from "./components/SettingsPanel";
import { UnitSelectionPanel } from "./components/UnitSelectionPanel";
import { UnitCustomizationPanel } from "./components/UnitCustomizationPanel";
import { ChartPanel } from "./components/ChartPanel";

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
  // The chart box reserves the 2:1 size via CSS, so the canvas does not resize after mount.
  maintainAspectRatio: false,
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

interface IDPSProps extends DpsData {
  /** The squad data is still being fetched - the layout is rendered with disabled inputs. */
  isLoading?: boolean;
}

export const DpsPageComponent = (props: IDPSProps) => {
  const filter_def1: string[] = [];
  const filter_def2: string[] = [];
  const searchData_default: CustomizableUnit[] = [];

  const router = useRouter();

  const [catalogs, setCatalogs] = useState<[DpsUnitCatalog, DpsUnitCatalog]>(() => {
    const catalog = createDpsUnitCatalog(props);
    return [catalog, catalog];
  });
  const [catalog1, catalog2] = catalogs;
  const { ebpsData: ebpsData1, weaponData: weaponData1 } = catalog1.data;
  const { ebpsData: ebpsData2, weaponData: weaponData2 } = catalog2.data;
  const [loadingPatches, setLoadingPatches] = useState([false, false]);
  const patchRequests = useRef([0, 0]);
  const [activeData] = useState(searchData_default);
  const [unitFilter1, setFilter1] = useState(filter_def1);
  const [unitFilter2, setFilter2] = useState(filter_def2);
  const patchUnit1 = catalog1.data.patch;
  const patchUnit2 = catalog2.data.patch;

  const [rerender, setRerender] = useState(false);
  // const [isStaircase, setStaircase] = useState(false);
  const [isStaircase] = useState(false);
  const [showDpsHealth, setShowDpsHealth] = useState(false);
  const [allowAllWeapons, setAllowAllWeapons] = useState(false);
  // Final Stand (DLC / co-op vs AI) units are opt-in.
  const [showFinalStand, setShowFinalStand] = useState(false);

  // const { classes } = useStyles();
  const theme = useMantineTheme();

  const handleModeChange = (value: string) => {
    if (value === "compare") {
      router.push(getDPSCompareRoute());
    }
  };

  const unitSelectionList1 = useMemo(
    () => filterDpsUnitOptions(catalog1.unitOptions, unitFilter1, showFinalStand),
    [catalog1, unitFilter1, showFinalStand],
  );
  const unitSelectionList2 = useMemo(
    () => filterDpsUnitOptions(catalog2.unitOptions, unitFilter2, showFinalStand),
    [catalog2, unitFilter2, showFinalStand],
  );

  // The selected units are kept in the URL (`?unit1=...&unit2=...`), so the page can be linked to.
  // State, not a ref, so the URL is written only after the preselected units are rendered.
  const [urlUnitsApplied, setUrlUnitsApplied] = useState(false);
  const selectedUnit1 = activeData[0]?.id;
  const selectedUnit2 = activeData[1]?.id;

  useEffect(() => {
    if (!router.isReady || urlUnitsApplied || props.sbpsData.length == 0) return;
    const { unit1, unit2 } = router.query;
    if (typeof unit1 === "string") onSelectionChange(unit1, 0, true);
    if (typeof unit2 === "string") onSelectionChange(unit2, 1, true);
    setUrlUnitsApplied(true);
  }, [router.isReady, props.sbpsData]);

  useEffect(() => {
    if (!urlUnitsApplied) return;
    if (router.query.unit1 === selectedUnit1 && router.query.unit2 === selectedUnit2) return;
    const query: Record<string, string> = {};
    if (selectedUnit1) query.unit1 = selectedUnit1;
    if (selectedUnit2) query.unit2 = selectedUnit2;
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  }, [urlUnitsApplied, selectedUnit1, selectedUnit2]);

  // if(config.isDevEnv())
  const patchList = [];
  for (const key in config.patches) {
    patchList.push(key);
  }

  const isLargeScreen = useMediaQuery("(min-width: 56.25em)");

  setScreenOptions(options, isLargeScreen);

  const chartData = { datasets: [mapChartData([])] };

  // Squad configration has changed
  const onSquadConfigChange = () => {
    setRerender(!rerender);
  };

  // synchronize selection field with presented units
  const onSelectionChange = (
    selection: string | null,
    index: number,
    restoringFromUrl = false,
  ) => {
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
    const catalog = catalogs[index];
    const options = restoringFromUrl
      ? filterDpsUnitOptions(catalog.unitOptions, [], true)
      : index === 0
        ? unitSelectionList1
        : unitSelectionList2;
    const unitBp = options.some((unit) => unit.id === selection)
      ? catalog.createUnit(selection)
      : undefined;

    // add unit
    if (unitBp) {
      if (restoringFromUrl && isFinalStandUnit(unitBp)) setShowFinalStand(true);
      activeData[index] = unitBp;
      setRerender((previous) => !previous);
    }
  };

  const onPatchUnitChange = async (value: string, index: number) => {
    AnalyticsDPSExplorerPatchSelection(value);
    const slot = index - 1;
    const request = ++patchRequests.current[slot];
    setLoadingPatches((previous) => previous.map((loading, i) => (i === slot ? true : loading)));
    try {
      const data = await fetchDpsData(value);
      if (request !== patchRequests.current[slot]) return;
      const catalog = createDpsUnitCatalog(data);
      setCatalogs((previous) => {
        const next: [DpsUnitCatalog, DpsUnitCatalog] = [...previous];
        next[slot] = catalog;
        return next;
      });
      const selected = activeData[slot];
      if (selected) {
        const unit = catalog.createUnit(selected.id);
        if (unit) activeData[slot] = unit;
        else delete activeData[slot];
      }
    } catch (error) {
      console.error("Failed to load DPS patch:", error);
    } finally {
      if (request === patchRequests.current[slot])
        setLoadingPatches((previous) =>
          previous.map((loading, i) => (i === slot ? false : loading)),
        );
    }
  };

  const toggleFilter = (filterValue: string, unitIndex = 1, unitFilter: string[]) => {
    const next = unitFilter.includes(filterValue)
      ? unitFilter.filter((faction) => faction !== filterValue)
      : [...unitFilter, filterValue];
    if (unitIndex == 1) setFilter1(next);
    else setFilter2(next);
  };

  // Toggling Final Stand units rebuilds the lightweight pickers and clears selected units.
  const onShowFinalStandChange = (checked: boolean) => {
    onSelectionChange(null, 0);
    onSelectionChange(null, 1);
    setShowFinalStand(checked);
  };

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
          <Grid.Col span={{ base: 12, sm: 10 }}>
            <Flex align="center" gap="md" wrap="wrap">
              <Title order={2}>Company of Heroes 3 DPS Benchmark Tool</Title>
              <SegmentedControl
                value="vs"
                onChange={handleModeChange}
                data={[
                  { label: "VS Mode", value: "vs" },
                  { label: "Compare Mode", value: "compare" },
                ]}
                data-testid="dps-mode-control"
              />
            </Flex>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 2 }}>
            <Flex justify="flex-end" wrap="wrap">
              <Space h="2rem" />
              <SettingsPanel
                showDpsHealth={showDpsHealth}
                allowAllWeapons={allowAllWeapons}
                showFinalStand={showFinalStand}
                onShowDpsHealthChange={setShowDpsHealth}
                onAllowAllWeaponsChange={setAllowAllWeapons}
                onShowFinalStandChange={onShowFinalStandChange}
                onResetUnits={() => {
                  onSelectionChange(null, 0);
                  onSelectionChange(null, 1);
                }}
              />
            </Flex>
          </Grid.Col>
        </Grid>

        <Space />

        <Space h="xl" />
        <>
          <Grid>
            <Grid.Col span={{ md: 6, lg: 6 }}>
              <UnitSelectionPanel
                unitFilter={unitFilter1}
                unitSelectionList={unitSelectionList1}
                getUnit={catalog1.getUnit}
                ebpsData={ebpsData1}
                patchList={patchList}
                patchVersion={patchUnit1}
                position={1}
                disabled={props.isLoading || loadingPatches[0]}
                selectedUnitId={selectedUnit1}
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
                borderColor="blue"
              />
            </Grid.Col>

            <Grid.Col span={{ md: 6, lg: 6 }}>
              <UnitSelectionPanel
                unitFilter={unitFilter2}
                unitSelectionList={unitSelectionList2}
                getUnit={catalog2.getUnit}
                ebpsData={ebpsData2}
                patchList={patchList}
                patchVersion={patchUnit2}
                position={2}
                disabled={props.isLoading || loadingPatches[1]}
                selectedUnitId={selectedUnit2}
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
                borderColor="red"
              />
            </Grid.Col>
          </Grid>
        </>
      </Container>

      <Space h="sm" />
      <ChartPanel
        chartData={chartData}
        chartOptions={options}
        isLoading={!!props.isLoading || loadingPatches.some(Boolean)}
      />
    </>
  );
};
