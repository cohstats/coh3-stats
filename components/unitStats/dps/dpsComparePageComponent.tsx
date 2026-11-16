import React, { useEffect, useMemo, useRef, useState } from "react";
import { useIsomorphicEffect, useMediaQuery } from "@mantine/hooks";

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
  Stack,
} from "@mantine/core";
import { useRouter } from "next/router";
import { getDPSCalculatorRoute } from "../../../src/routes";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { isFinalStandEnemyUnit, isFinalStandUnit } from "../../../src/unitStats/finalStand";
import {
  createDpsUnitCatalog,
  fetchDpsData,
  filterDpsUnitOptions,
} from "../../../src/unitStats/dpsData";
import type { DpsData, DpsUnitCatalog } from "../../../src/unitStats/dpsData";
import {
  hasScatterAoe,
  simulateScatterShotDetails,
  simulateExpectedScatterShot,
} from "../../../src/unitStats/scatterSimulation";
import {
  getSingleWeaponScatterShotInputs,
  getWeaponScatterMultiplier,
} from "../../../src/unitStats/weaponLib";
import {
  CustomizableUnit,
  getCompareDpsData,
  updateHealth,
  getUnitModelCount,
  getDisplayedWeaponMaxRange,
  getBaseDistanceForDisplayedRange,
} from "../../../src/unitStats/dpsCommon";
import config from "../../../config";
import type { FormationData } from "../../../src/unitStats/mappingFormations";
import {
  getSquadWeaponEntity,
  resolveSquadFormation,
} from "../../../src/unitStats/squadFormations";
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
import {
  DEFAULT_SCATTER_FORMATION,
  ScatterFormationEditor,
  type ScatterFormationState,
  getScatterFormationModels,
} from "./components/ScatterFormationEditor";
import { ChartPanel } from "./components/ChartPanel";
import { UnitSearch } from "./unitSearch";
import { FinalStandBadge } from "../../final-stand-badge";
import { FinalStandEnemyBadge } from "../../final-stand-enemy-badge";
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

type CompareTargetType = "infantry" | "other";

// Change these IDs to swap the initial/reset defenders. The unit picker remains freely editable.
const DEFAULT_COMPARE_TARGET_IDS: Record<CompareTargetType, string> = {
  infantry: "panzergrenadier_ak",
  other: "halftrack_250_ak",
};

/** Crewed team weapons are infantry targets even though their SBPS folder is team_weapons. */
const isInfantryTarget = (unit: CustomizableUnit): boolean =>
  unit.unit_type === "infantry" ||
  (unit.unit_type === "team_weapons" &&
    unit.sbps.loadout.some(({ type }) => /(?:^|[\\/])infantry[\\/]/.test(type)));

/** A real squad/vehicle supplies the default defender stats and formation. */
const getDefaultTarget = (catalog: DpsUnitCatalog, type: CompareTargetType) => {
  const option = catalog.unitOptions.find(
    (unit) =>
      unit.id === DEFAULT_COMPARE_TARGET_IDS[type] &&
      unit.infantryTarget === (type === "infantry"),
  );
  return option ? catalog.createUnit(option.id) : undefined;
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

export const DpsComparePageComponent: React.FC<DpsData> = (props) => {
  const theme = useMantineTheme();
  const { t } = useTranslation("explorer");
  const router = useRouter();
  const isLargeScreen = useMediaQuery("(min-width: 56.25em)");

  const handleModeChange = (value: string) => {
    if (value === "vs") {
      router.push(getDPSCalculatorRoute());
    }
  };

  // Shared state
  const [factionFilter, setFactionFilter] = useState<string[]>([]);
  const [allowAllWeapons, setAllowAllWeapons] = useState(false);
  // Final Stand (DLC / co-op vs AI) units are opt-in.
  const [showFinalStand, setShowFinalStand] = useState(false);
  // Scatter starts enabled and requires a selected infantry defender.
  const [scatterFormation, setScatterFormation] = useState<ScatterFormationState>({
    ...DEFAULT_SCATTER_FORMATION,
    disabledModelIds: [],
  });
  const [formationData, setFormationData] = useState<FormationData>(props.formationData ?? {});
  const [scatterSamples, setScatterSamples] = useState(576);
  const [scatterFogOfWar, setScatterFogOfWar] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [catalog, setCatalog] = useState(() => createDpsUnitCatalog(props));
  const patchVersion = catalog.data.patch;
  const patchRequest = useRef(0);
  const { ebpsData: cachedEbps, weaponData: cachedWeapons } = catalog.data;

  // Target mode controls the defender search separately from the attacker search.
  const [targetType, setTargetType] = useState<CompareTargetType>("infantry");
  // Undefined means no matching defender is available; it never creates a generic target.
  const [targetUnit, setTargetUnit] = useState<CustomizableUnit | undefined>();
  const [targetResetVersion, setTargetResetVersion] = useState(0);

  // Attacking units (dynamic array, max 6)
  const [attackingUnits, setAttackingUnits] = useState<CustomizableUnit[]>([]);
  // Stable instance IDs distinguish e.g. two Shermans with different upgrades/veterancy.
  // Keep these aligned with attackingUnits, including when removing or reloading a unit.
  const [attackerPreviewIds, setAttackerPreviewIds] = useState<number[]>([]);
  const latestSelections = useRef({ targetType, targetUnit, attackingUnits, attackerPreviewIds });
  useIsomorphicEffect(() => {
    latestSelections.current = { targetType, targetUnit, attackingUnits, attackerPreviewIds };
  }, [targetType, targetUnit, attackingUnits, attackerPreviewIds]);
  const nextAttackerPreviewId = useRef(0);
  const [selectedPreviewWeaponId, setSelectedPreviewWeaponId] = useState<string | null>(null);
  // The preview has its own range, independent from the DPS graph. Reset to max
  // when the selected weapon changes or its previous range is no longer valid.
  const [previewRangeSelection, setPreviewRangeSelection] = useState<{
    weaponId: string;
    range: number;
  } | null>(null);

  // Selected unit in the dropdown (for adding)
  const [selectedUnitToAdd, setSelectedUnitToAdd] = useState<string | null>(null);

  // Unit selection list
  const unitSelectionList = useMemo(
    () => filterDpsUnitOptions(catalog.unitOptions, factionFilter, showFinalStand),
    [catalog, factionFilter, showFinalStand],
  );

  // Initialize data
  useEffect(() => {
    restoreDefaultTarget("infantry");
  }, []);

  // Unlike attackers, targets need not have weapons (e.g. an unarmed vehicle or bunker).
  // Preserve the current selection when the attacker faction filter changes.
  const targetSelectionList = useMemo(() => {
    const matches = filterDpsUnitOptions(
      catalog.unitOptions,
      factionFilter,
      showFinalStand,
      false,
    ).filter((unit) => unit.infantryTarget === (targetType === "infantry"));
    if (
      targetUnit &&
      isInfantryTarget(targetUnit) === (targetType === "infantry") &&
      !matches.some((unit) => unit.id === targetUnit.id)
    ) {
      const option = catalog.unitOptions.find((unit) => unit.id === targetUnit.id);
      if (option) matches.push(option);
    }
    return matches;
    // The attacker list changes after initial data load, patch changes, and faction changes.
  }, [catalog, unitSelectionList, targetType, targetUnit]);

  useEffect(() => {
    setScatterFormation((previous) => ({
      ...previous,
      disabledModelIds: [],
      targetModelId: 1,
      groundTarget: null,
    }));
  }, [targetUnit?.path, targetUnit?.id, patchVersion]);

  // Patch list
  const patchList = Object.keys(config.patches);

  setScreenOptions(isLargeScreen ?? true);

  // Handle patch change
  const handlePatchChange = async (value: string) => {
    const request = ++patchRequest.current;
    AnalyticsDPSExplorerPatchSelection(value);
    setIsLoading(true);

    try {
      const data = await fetchDpsData(value);
      if (request !== patchRequest.current) return;
      const nextCatalog = createDpsUnitCatalog(data);
      // Selections can change while the download is pending.
      const current = latestSelections.current;
      setCatalog(nextCatalog);
      setFormationData(data.formationData);

      // Re-select the current defender or restore the real default if that unit is unavailable.
      const newTarget =
        (current.targetUnit ? nextCatalog.createUnit(current.targetUnit.id) : undefined) ??
        getDefaultTarget(nextCatalog, current.targetType);
      setTargetUnit(
        newTarget && isInfantryTarget(newTarget) === (current.targetType === "infantry")
          ? newTarget
          : getDefaultTarget(nextCatalog, current.targetType),
      );

      const refreshedAttackers = current.attackingUnits
        .map((attacker, index) => {
          const newAttacker = nextCatalog.createUnit(attacker.id);
          return newAttacker
            ? {
                unit: newAttacker,
                previewId: current.attackerPreviewIds[index] ?? ++nextAttackerPreviewId.current,
              }
            : undefined;
        })
        .filter(
          (entry): entry is { unit: CustomizableUnit; previewId: number } => entry !== undefined,
        );
      setAttackingUnits(refreshedAttackers.map((entry) => entry.unit));
      setAttackerPreviewIds(refreshedAttackers.map((entry) => entry.previewId));
    } catch (error) {
      console.error("Failed to load DPS patch:", error);
    } finally {
      if (request === patchRequest.current) setIsLoading(false);
    }
  };

  const restoreDefaultTarget = (type: CompareTargetType) => {
    const fallback = getDefaultTarget(catalog, type);
    // Clearing an already selected default must also restore the Select's search text.
    setTargetResetVersion((version) => version + 1);
    setTargetUnit(fallback);
    setScatterFormation((previous) => ({
      ...previous,
      disabledModelIds: [],
      targetModelId: 1,
      groundTarget: null,
    }));
  };

  const handleTargetTypeChange = (nextType: string) => {
    if (nextType !== "infantry" && nextType !== "other") return;
    setTargetType(nextType);
    // Each category starts with its configured real defender.
    restoreDefaultTarget(nextType);
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
      // Clearing the search restores this category's configured defender.
      restoreDefaultTarget(targetType);
      return;
    }
    const unitBp = targetSelectionList.some((unit) => unit.id === selection)
      ? catalog.createUnit(selection)
      : undefined;
    // Search and selection use the same strict category filter.
    if (unitBp && isInfantryTarget(unitBp) === (targetType === "infantry")) {
      AnalyticsDPSExplorerSquadSelection(selection);
      setTargetUnit(unitBp);
    }
  };

  // Add a new attacker unit from the dropdown
  const handleAddAttacker = () => {
    if (!selectedUnitToAdd || attackingUnits.length >= 6) return;

    AnalyticsDPSExplorerSquadSelection(selectedUnitToAdd);
    const unitBp = unitSelectionList.some((unit) => unit.id === selectedUnitToAdd)
      ? catalog.createUnit(selectedUnitToAdd)
      : undefined;
    if (unitBp) {
      const previewId = ++nextAttackerPreviewId.current;
      setAttackingUnits([...attackingUnits, unitBp]);
      setAttackerPreviewIds((previous) => [...previous, previewId]);
      setSelectedUnitToAdd(null);
    }
  };

  // Remove an attacker unit
  const handleRemoveAttacker = (index: number) => {
    const newAttackers = attackingUnits.filter((_, i) => i !== index);
    setAttackingUnits(newAttackers);
    setAttackerPreviewIds((previous) => previous.filter((_, i) => i !== index));
  };

  // Handle squad config change
  const onSquadConfigChange = () => {
    setRerender(!rerender);
  };

  // Reset all units
  const handleResetUnits = () => {
    restoreDefaultTarget(targetType);
    setAttackingUnits([]);
    setAttackerPreviewIds([]);
    setSelectedUnitToAdd(null);
  };

  // Hiding Final Stand units again would leave already selected ones on the chart.
  const handleShowFinalStandChange = (checked: boolean) => {
    handleResetUnits();
    setShowFinalStand(checked);
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
  const scatterCompatibleTarget =
    targetType === "infantry" && !!targetUnit && isInfantryTarget(targetUnit);
  const humanCount = targetUnit ? Math.max(0, Math.floor(getUnitModelCount(targetUnit))) : 0;
  const squadLayout = useMemo(
    () =>
      targetUnit && scatterCompatibleTarget && humanCount > 0
        ? resolveSquadFormation(
            targetUnit.sbps,
            formationData,
            humanCount,
            targetUnit.cover,
            targetUnit.is_moving,
            getSquadWeaponEntity(targetUnit.sbps, cachedEbps),
          )
        : undefined,
    // Unit customizers mutate cover/movement in place.

    [targetUnit, formationData, humanCount, scatterCompatibleTarget, rerender],
  );
  const formationModels = useMemo(
    () =>
      (squadLayout?.models ?? getScatterFormationModels(scatterFormation, humanCount)).map(
        (model) => ({
          ...model,
          // Exported formations face +Y; face south toward the default gunner (-Y).
          x: -model.x,
          y: -model.y,
          enabled: !scatterFormation.disabledModelIds.includes(model.id),
        }),
      ),
    [squadLayout, scatterFormation, humanCount],
  );
  const effectiveFormation = {
    ...scatterFormation,
    targetModelId:
      scatterFormation.targetModelId === null
        ? null
        : formationModels.some((model) => model.id === scatterFormation.targetModelId)
          ? scatterFormation.targetModelId
          : (formationModels[0]?.id ?? null),
  };
  const weaponMarker = squadLayout?.weapon
    ? { x: -squadLayout.weapon.x, y: -squadLayout.weapon.y }
    : undefined;
  const scatterOptions = useMemo(
    () =>
      scatterFormation.enabled && scatterCompatibleTarget
        ? {
            models: formationModels,
            targetModelId: effectiveFormation.targetModelId,
            groundTarget: scatterFormation.groundTarget,
            gunnerAngleDeg: scatterFormation.gunnerAngleDeg,
            samplesPerShot: scatterSamples,
            inFogOfWar: scatterFogOfWar,
          }
        : undefined,
    [
      scatterFormation,
      formationModels,
      effectiveFormation.targetModelId,
      scatterSamples,
      scatterFogOfWar,
      scatterCompatibleTarget,
    ],
  );
  // Compare-mode scatter uses the same weapon fire timing and range as standard DPS.
  const dpsLines = useMemo(
    () =>
      !targetUnit
        ? // An unavailable defender must never silently use generic infantry stats.
          paddedAttackers.map(() => [])
        : getCompareDpsData(paddedAttackers, targetUnit, scatterOptions),
    // Customizing a unit can mutate its members in place, so rerender is a dependency.

    [attackingUnits, targetUnit, targetType, scatterOptions, rerender, patchVersion],
  );

  // Offer every enabled AoE weapon from every attacker, in comparison order.
  // Store the attacker *instance* ID in the option key so duplicate units don't
  // share a selection, and removing an earlier attacker doesn't change the key.
  const previewWeaponCandidates = useMemo(
    () =>
      attackingUnits.flatMap((attacker, index) =>
        attacker.weapon_member
          .filter((member) => member.num > 0 && hasScatterAoe(member.weapon.weapon_bag))
          .map((member) => ({
            value: `${attackerPreviewIds[index]}:${member.weapon_id}`,
            label: `${attacker.screen_name || attacker.id} (#${index + 1}) — ${member.weapon.ui_name || member.weapon.id}`,
            weaponName: member.weapon.ui_name || member.weapon.id,
            attackerName: `${attacker.screen_name || attacker.id} (#${index + 1})`,
            color: ATTACKER_COLORS[index],
            attacker,
            member,
          })),
      ),
    // Unit customizers can mutate an attacker's weapon list in place.

    [attackingUnits, attackerPreviewIds, rerender, patchVersion],
  );

  // Default to the first AoE weapon; if the selected one disappears or becomes
  // disabled, the visible selection immediately falls back to the first remaining.
  const selectedPreviewCandidate =
    previewWeaponCandidates.find((candidate) => candidate.value === selectedPreviewWeaponId) ??
    previewWeaponCandidates[0];

  const previewMaxRange = selectedPreviewCandidate
    ? getDisplayedWeaponMaxRange(
        selectedPreviewCandidate.attacker,
        selectedPreviewCandidate.member,
      )
    : 0;
  // Minimum firing range is not scaled/shifted by unit range modifiers.
  const previewMinRange = selectedPreviewCandidate
    ? Math.min(previewMaxRange, selectedPreviewCandidate.member.weapon.weapon_bag.range_min)
    : 0;
  const previewRange =
    selectedPreviewCandidate && previewRangeSelection?.weaponId === selectedPreviewCandidate.value
      ? Math.max(previewMinRange, Math.min(previewMaxRange, previewRangeSelection.range))
      : previewMaxRange;

  // Compare every weapon at the same range, aim point and formation. Only the
  // selected weapon needs per-model details; other rows use the cheaper total.
  const previewWeaponResults = useMemo(
    () =>
      previewWeaponCandidates.map((candidate) => {
        const { attacker, member } = candidate;
        const maxRange = getDisplayedWeaponMaxRange(attacker, member);
        const inRange =
          previewRange >= member.weapon.weapon_bag.range_min && previewRange <= maxRange;
        const shot =
          inRange && scatterOptions
            ? getSingleWeaponScatterShotInputs(
                member,
                getBaseDistanceForDisplayedRange(attacker, previewRange),
                scatterOptions,
                attacker.is_moving,
                targetUnit,
                attacker,
                previewRange,
              )
            : null;
        const details =
          shot && candidate.value === selectedPreviewCandidate?.value
            ? simulateScatterShotDetails(shot)
            : undefined;
        return {
          ...candidate,
          averageDamage: inRange
            ? (details?.totalExpectedDamage ?? (shot ? simulateExpectedScatterShot(shot) : 0))
            : null,
          modelStats: details?.models,
        };
      }),
    [
      previewWeaponCandidates,
      selectedPreviewCandidate,
      previewRange,
      scatterOptions,
      targetUnit,
      rerender,
    ],
  );

  // Hover stats and the scatter envelope use the chosen preview range.
  // This value never enters scatterOptions or the DPS chart calculation.
  const scatterPreview = useMemo(() => {
    if (!selectedPreviewCandidate) return undefined;
    const { attacker, member } = selectedPreviewCandidate;
    return {
      weapon: member.weapon.weapon_bag,
      label: selectedPreviewCandidate.label,
      range: previewRange,
      minRange: previewMinRange,
      maxRange: previewMaxRange,
      isMoving: attacker.is_moving,
      scatterMultiplier: getWeaponScatterMultiplier(attacker),
      inFogOfWar: scatterFogOfWar,
      modelStats: previewWeaponResults.find(
        ({ value }) => value === selectedPreviewCandidate.value,
      )?.modelStats,
    };
    // Unit customizers mutate members in place; rerender forces recalculation.
  }, [
    selectedPreviewCandidate,
    previewWeaponResults,
    previewRange,
    previewMinRange,
    previewMaxRange,
    targetUnit,
    scatterOptions,
    scatterFogOfWar,
    rerender,
    patchVersion,
  ]);

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
            <Title order={2}>{t("dpsCompareUi.compare.title")}</Title>
            <SegmentedControl
              value="compare"
              onChange={handleModeChange}
              data={[
                { label: t("dpsCompareUi.compare.vs"), value: "vs" },
                { label: t("dpsCompareUi.compare.compare"), value: "compare" },
              ]}
              data-testid="dps-mode-control"
            />
          </Flex>
          <CompareSettingsPanel
            allowAllWeapons={allowAllWeapons}
            showFinalStand={showFinalStand}
            scatterEnabled={scatterFormation.enabled}
            scatterAvailable={targetType === "infantry" && !!targetUnit}
            scatterSamples={scatterSamples}
            onScatterSamplesChange={setScatterSamples}
            onScatterEnabledChange={(enabled) =>
              setScatterFormation((previous) => ({ ...previous, enabled }))
            }
            onAllowAllWeaponsChange={(checked) => {
              setAllowAllWeapons(checked);
              if (!checked) {
                // Do not leave hidden cross-faction upgrade bonuses active.
                setAttackingUnits((previous) =>
                  previous.map((attacker) => ({
                    ...attacker,
                    heavyBarrelsEnabled:
                      attacker.faction === "american" && attacker.heavyBarrelsEnabled,
                    dakCoaxUpgradeEnabled:
                      attacker.faction === "afrika_korps" && attacker.dakCoaxUpgradeEnabled,
                  })),
                );
                setRerender((previous) => !previous);
              }
            }}
            onShowFinalStandChange={handleShowFinalStandChange}
            onResetUnits={handleResetUnits}
          />
        </Group>

        <Space h="xl" />

        {/* Attacking Units Section */}
        <Flex justify="space-between" align="center" mb="sm" wrap="wrap" gap="sm">
          <Flex align="center" gap="md">
            <Title order={4}>{t("dpsCompare.attackingUnits")}</Title>
            <FactionFilter factionFilter={factionFilter} onFilterToggle={handleFilterToggle} />
          </Flex>
          <PatchSelector
            patchList={patchList}
            patchVersion={patchVersion}
            disabled={isLoading}
            onPatchChange={handlePatchChange}
          />
        </Flex>

        {/* Unit selector dropdown with Add button */}
        <Flex gap="sm" align="flex-end" mb="md">
          <Box style={{ flex: 1 }}>
            <UnitSearch
              key={`add-unit-search-${attackingUnits.length}`}
              searchData={unitSelectionList}
              getUnit={catalog.getUnit}
              ebpsData={cachedEbps}
              onSelect={(selection) => setSelectedUnitToAdd(selection)}
              position={-1}
              disabled={attackingUnits.length >= 6}
              testId="dps-compare-add-search"
            />
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddAttacker}
            disabled={!selectedUnitToAdd || attackingUnits.length >= 6}
            data-testid="dps-compare-add-button"
          >
            {t("dpsCompareUi.compare.addUnit")}
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
                data-testid={`dps-attacker-${index}`}
              >
                <Flex justify="space-between" align="center" mb="xs">
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm" fw={500} c={ATTACKER_COLORS[index]}>
                      {attacker.screen_name || attacker.id}
                    </Text>
                    {isFinalStandUnit({ id: attacker.id }) && <FinalStandBadge size="xs" />}
                    {isFinalStandEnemyUnit({ id: attacker.id }) && (
                      <FinalStandEnemyBadge size="xs" />
                    )}
                  </Group>
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
                  modifierScope="offensive"
                />
              </Box>
            </Grid.Col>
          ))}
        </Grid>

        <Space h="md" />

        {/* Defender selection */}
        <div>
          <Stack gap="xs" mb="sm">
            <Title order={4}>{t("dpsCompare.targetUnit")}</Title>
            <SegmentedControl
              value={targetType}
              onChange={handleTargetTypeChange}
              data={[
                { label: t("dpsCompareUi.target.infantry"), value: "infantry" },
                { label: t("dpsCompareUi.target.other"), value: "other" },
              ]}
              data-testid="dps-compare-target-type"
            />
          </Stack>
          <UnitSearch
            key={`target-search-${targetType}-${targetResetVersion}`}
            searchData={targetSelectionList}
            getUnit={catalog.getUnit}
            ebpsData={cachedEbps}
            value={targetUnit?.id ?? null}
            onSelect={handleTargetSelect}
            position={0}
            testId="dps-compare-target-search"
          />
          {!targetUnit && (
            <Text size="sm" c="red" mt="xs">
              {t("dpsCompareUi.target.noTarget")}
            </Text>
          )}
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
              modifierScope="defensive"
              fogOfWar={
                targetType === "infantry" && scatterFormation.enabled
                  ? scatterFogOfWar
                  : undefined
              }
              onFogOfWarChange={
                targetType === "infantry" && scatterFormation.enabled
                  ? setScatterFogOfWar
                  : undefined
              }
            />
          )}
        </div>
        {scatterFormation.enabled && scatterCompatibleTarget && (
          <>
            <ScatterFormationEditor
              value={effectiveFormation}
              models={formationModels}
              unitFormation={
                targetUnit
                  ? {
                      available: !!squadLayout,
                      approximateCrew: squadLayout?.approximateCrew ?? false,
                      weapon: weaponMarker,
                    }
                  : undefined
              }
              onChange={setScatterFormation}
              previewWeapon={scatterPreview}
              previewWeaponOptions={previewWeaponResults.map(
                ({ value, label, weaponName, attackerName, averageDamage, color }) => ({
                  value,
                  label,
                  weaponName,
                  attackerName,
                  averageDamage,
                  color,
                }),
              )}
              selectedPreviewWeaponId={selectedPreviewCandidate?.value ?? null}
              onPreviewWeaponChange={(weaponId) => {
                setSelectedPreviewWeaponId(weaponId);
                setPreviewRangeSelection({ weaponId, range: previewRange });
              }}
              onPreviewRangeChange={(range) => {
                if (selectedPreviewCandidate) {
                  setPreviewRangeSelection({
                    weaponId: selectedPreviewCandidate.value,
                    range,
                  });
                }
              }}
            />
          </>
        )}
      </Container>

      <Space h="md" />
      <ChartPanel chartData={chartData} chartOptions={options} isLoading={isLoading} />
    </>
  );
};
