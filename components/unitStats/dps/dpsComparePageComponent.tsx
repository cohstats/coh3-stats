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

import {
  Container,
  Space,
  useMantineTheme,
  Grid,
  Title,
  Flex,
  Text,
  Group,
  Button,
  CloseButton,
  Box,
  SegmentedControl,
} from "@mantine/core";
import { useRouter } from "next/router";
import { getDPSCalculatorRoute } from "../../../src/routes";
import { IconPlus } from "@tabler/icons-react";
import { EbpsType, getEbpsStats } from "../../../src/unitStats/mappingEbps";
import { getWeaponStats, WeaponType } from "../../../src/unitStats/mappingWeapon";
import { getSbpsStats, SbpsType } from "../../../src/unitStats/mappingSbps";
import {
  CustomizableUnit,
  getCompareDpsData,
  mapCustomizableUnit,
  updateHealth,
  createDefaultCustomModifiers,
} from "../../../src/unitStats/dpsCommon";
import config from "../../../config";
import {
  AnalyticsDPSExplorerPatchSelection,
  AnalyticsDPSExplorerSquadSelection,
} from "../../../src/firebase/analytics";

import {
  CompareSettingsPanel,
  FactionFilter,
  PatchSelector,
} from "./components/CompareSettingsPanel";
import { UnitCustomizationPanel } from "./components/UnitCustomizationPanel";
import { ChartPanel } from "./components/ChartPanel";
import { UnitSearch } from "./unitSearch";
import { mapChartData, options } from "./dpsPageComponent";
import { DpsUnitCustomizing } from "./dpsUnitCustomizing";

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

// Chart colors for up to 6 attackers
const ATTACKER_COLORS = ["blue", "red", "green", "orange", "violet", "cyan"] as const;

interface IDPSCompareProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
}

// Module-level state for data caching
let cachedUnits: CustomizableUnit[] = [];
let cachedEbps: EbpsType[] = [];
let cachedSbps: SbpsType[] = [];
let cachedWeapons: WeaponType[] = [];

const initCompareData = (props: IDPSCompareProps) => {
  cachedEbps = props.ebpsData;
  cachedSbps = props.sbpsData;
  cachedWeapons = props.weaponData;
  cachedUnits = [];
  for (const sbps of props.sbpsData) {
    cachedUnits.push(mapCustomizableUnit(sbps, props.ebpsData, props.weaponData));
  }
};

const mapUnitSelection = (
  sbps: SbpsType[],
  units: CustomizableUnit[],
  unitFilter: string[] = [],
) => {
  const selectionFields: CustomizableUnit[] = [];
  for (const squad of sbps) {
    if (
      squad.ui.symbolIconName !== "" &&
      squad.faction !== "british" &&
      (unitFilter.length === 0 || unitFilter.includes(squad.faction))
    ) {
      const custUnit = units.find((u) => u.id === squad.id);
      if (custUnit && custUnit.weapon_member.length > 0) {
        selectionFields.push(custUnit);
      }
    }
  }
  return selectionFields;
};

const setScreenOptions = (isLargeScreen: boolean) => {
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

export const DpsComparePageComponent: React.FC<IDPSCompareProps> = (props) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const isLargeScreen = useMediaQuery("(min-width: 56.25em)");

  const handleModeChange = (value: string) => {
    if (value === "vs") {
      router.push(getDPSCalculatorRoute());
    }
  };

  // Shared state
  const [patchVersion, setPatchVersion] = useState(config.latestPatch);
  const [factionFilter, setFactionFilter] = useState<string[]>([]);
  const [allowAllWeapons, setAllowAllWeapons] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Target unit
  const [targetUnit, setTargetUnit] = useState<CustomizableUnit | undefined>();

  // Attacking units (dynamic array, max 6)
  const [attackingUnits, setAttackingUnits] = useState<CustomizableUnit[]>([]);

  // Selected unit in the dropdown (for adding)
  const [selectedUnitToAdd, setSelectedUnitToAdd] = useState<string | null>(null);

  // Unit selection list
  const [unitSelectionList, setUnitSelectionList] = useState<CustomizableUnit[]>([]);

  // Initialize data
  useEffect(() => {
    initCompareData(props);
    setUnitSelectionList(mapUnitSelection(cachedSbps, cachedUnits, factionFilter));
  }, []);

  // Update selection list when filter changes
  useEffect(() => {
    setUnitSelectionList(mapUnitSelection(cachedSbps, cachedUnits, factionFilter));
  }, [factionFilter]);

  // Patch list
  const patchList = Object.keys(config.patches);

  setScreenOptions(isLargeScreen ?? true);

  // Handle patch change
  const handlePatchChange = async (value: string) => {
    AnalyticsDPSExplorerPatchSelection(value);
    setPatchVersion(value);
    setIsLoading(true);

    try {
      const [newSbps, newEbps, newWeapons] = await Promise.all([
        getSbpsStats(value),
        getEbpsStats(value),
        getWeaponStats(value),
      ]);

      cachedSbps = newSbps;
      cachedEbps = newEbps;
      cachedWeapons = newWeapons;
      cachedUnits = [];
      for (const sbps of newSbps) {
        cachedUnits.push(mapCustomizableUnit(sbps, newEbps, newWeapons));
      }
      setUnitSelectionList(mapUnitSelection(cachedSbps, cachedUnits, factionFilter));

      // Re-select units with new patch data
      if (targetUnit) {
        const newTarget = cachedUnits.find((u) => u.id === targetUnit.id);
        if (newTarget) {
          setTargetUnit(cloneUnit(newTarget));
        }
      }

      const newAttackers = attackingUnits
        .map((attacker) => {
          const newAttacker = cachedUnits.find((u) => u.id === attacker.id);
          return newAttacker ? cloneUnit(newAttacker) : undefined;
        })
        .filter((u): u is CustomizableUnit => u !== undefined);
      setAttackingUnits(newAttackers);
    } finally {
      setIsLoading(false);
    }
  };

  // Clone a unit for selection
  const cloneUnit = (unit: CustomizableUnit): CustomizableUnit => {
    const cloned = { ...unit };
    cloned.weapon_member = unit.weapon_member.map((w) => ({ ...w }));
    cloned.custom_modifiers = createDefaultCustomModifiers();
    return cloned;
  };

  // Handle filter toggle
  const handleFilterToggle = (faction: string) => {
    const newFilter = factionFilter.includes(faction)
      ? factionFilter.filter((f) => f !== faction)
      : [...factionFilter, faction];
    setFactionFilter(newFilter);
  };

  // Handle target unit selection
  const handleTargetSelect = (selection: string | null) => {
    if (!selection) {
      setTargetUnit(undefined);
      return;
    }
    AnalyticsDPSExplorerSquadSelection(selection);
    const unitBp = unitSelectionList.find((u) => u.id === selection);
    if (unitBp) {
      setTargetUnit(cloneUnit(unitBp));
    }
  };

  // Add a new attacker unit from the dropdown
  const handleAddAttacker = () => {
    if (!selectedUnitToAdd || attackingUnits.length >= 6) return;

    AnalyticsDPSExplorerSquadSelection(selectedUnitToAdd);
    const unitBp = unitSelectionList.find((u) => u.id === selectedUnitToAdd);
    if (unitBp) {
      setAttackingUnits([...attackingUnits, cloneUnit(unitBp)]);
      setSelectedUnitToAdd(null);
    }
  };

  // Remove an attacker unit
  const handleRemoveAttacker = (index: number) => {
    const newAttackers = attackingUnits.filter((_, i) => i !== index);
    setAttackingUnits(newAttackers);
  };

  // Handle squad config change
  const onSquadConfigChange = () => {
    setRerender(!rerender);
  };

  // Reset all units
  const handleResetUnits = () => {
    setTargetUnit(undefined);
    setAttackingUnits([]);
    setSelectedUnitToAdd(null);
  };

  // Update health for all units
  if (targetUnit) updateHealth(targetUnit);
  attackingUnits.forEach((unit) => {
    updateHealth(unit);
  });

  // Calculate DPS data - pad array to match expected format
  const paddedAttackers: (CustomizableUnit | undefined)[] = [
    ...attackingUnits,
    ...Array(6 - attackingUnits.length).fill(undefined),
  ];
  const dpsLines = getCompareDpsData(paddedAttackers, targetUnit);

  // Build chart data
  const chartData = { datasets: [] as ReturnType<typeof mapChartData>[] };
  let maxY = 1;
  let maxX = 1;

  attackingUnits.forEach((attacker, index) => {
    if (dpsLines[index] && dpsLines[index].length > 0) {
      const set = mapChartData(dpsLines[index], attacker.screen_name || attacker.id, false);
      set.borderColor = theme.colors[ATTACKER_COLORS[index]][5];
      chartData.datasets.push(set);
      dpsLines[index].forEach((point) => {
        if (point.y > maxY) maxY = point.y;
        if (point.x > maxX) maxX = point.x;
      });
    }
  });

  maxY = (Math.floor(maxY / 10) + 1) * 10;
  options.scales.y.suggestedMax = maxY;
  options.scales.x.suggestedMax = maxX;
  options.scales.y.title.text = "Damage Per Second (DPS)";

  return (
    <>
      <Container size={"md"}>
        <Group justify="space-between" wrap="wrap">
          <Flex align="center" gap="md" wrap="wrap">
            <Title order={2}>Company of Heroes 3 DPS Benchmark Tool</Title>
            <SegmentedControl
              value="compare"
              onChange={handleModeChange}
              data={[
                { label: "VS Mode", value: "vs" },
                { label: "Compare Mode", value: "compare" },
              ]}
            />
          </Flex>
          <CompareSettingsPanel
            allowAllWeapons={allowAllWeapons}
            onAllowAllWeaponsChange={setAllowAllWeapons}
            onResetUnits={handleResetUnits}
          />
        </Group>

        <Space h="xl" />

        {/* Attacking Units Section */}
        <Flex justify="space-between" align="center" mb="sm" wrap="wrap" gap="sm">
          <Flex align="center" gap="md">
            <Title order={4}>Attacking Units</Title>
            <FactionFilter factionFilter={factionFilter} onFilterToggle={handleFilterToggle} />
          </Flex>
          <PatchSelector
            patchList={patchList}
            defaultPatch={config.latestPatch}
            onPatchChange={handlePatchChange}
          />
        </Flex>

        {/* Unit selector dropdown with Add button */}
        <Flex gap="sm" align="flex-end" mb="md">
          <Box style={{ flex: 1 }}>
            <UnitSearch
              key={`add-unit-search-${attackingUnits.length}`}
              searchData={unitSelectionList}
              onSelect={(selection) => setSelectedUnitToAdd(selection)}
              position={-1}
              disabled={attackingUnits.length >= 6}
            />
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddAttacker}
            disabled={!selectedUnitToAdd || attackingUnits.length >= 6}
          >
            Add Unit
          </Button>
        </Flex>

        {/* Attacker units grid */}
        <Grid>
          {attackingUnits.map((attacker, index) => (
            <Grid.Col key={`attacker-${index}`} span={{ base: 12, sm: 6 }}>
              <Box
                p="sm"
                pb={0}
                style={{
                  borderRadius: "var(--mantine-radius-md)",
                  border: `solid 2px ${theme.colors[ATTACKER_COLORS[index]][5]}`,
                  backgroundColor: `light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))`,
                  textAlign: "left" as const,
                  padding: "var(--mantine-spacing-xs)",
                }}
              >
                <Flex justify="space-between" align="center" mb="xs">
                  <Text size="sm" fw={500} c={ATTACKER_COLORS[index]}>
                    {attacker.screen_name || attacker.id}
                  </Text>
                  <CloseButton size="sm" onClick={() => handleRemoveAttacker(index)} />
                </Flex>
                <DpsUnitCustomizing
                  key={attacker.id + "." + (index + 1) + "." + patchVersion}
                  unit={attacker}
                  onChange={onSquadConfigChange}
                  index={index + 1}
                  ebps={cachedEbps}
                  weapons={cachedWeapons}
                  allowAllWeapons={allowAllWeapons}
                />
              </Box>
            </Grid.Col>
          ))}
        </Grid>

        <Space h="md" />

        {/* Target Unit Section - Optional */}
        <div>
          <Title order={4} mb="sm">
            Target Unit - Optional
          </Title>
          <UnitSearch
            key="target-search"
            searchData={unitSelectionList}
            onSelect={handleTargetSelect}
            position={0}
          />
          {targetUnit && (
            <UnitCustomizationPanel
              unit={targetUnit}
              position={0}
              patchVersion={patchVersion}
              ebpsData={cachedEbps}
              weaponData={cachedWeapons}
              allowAllWeapons={allowAllWeapons}
              onSquadConfigChange={onSquadConfigChange}
              borderColor="gray"
            />
          )}
        </div>
      </Container>

      <Space h="md" />
      <ChartPanel chartData={chartData} chartOptions={options} isLoading={isLoading} />
    </>
  );
};
