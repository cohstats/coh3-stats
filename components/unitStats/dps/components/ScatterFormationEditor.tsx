import React, { useRef, useState } from "react";
import { useMergedRef, useResizeObserver } from "@mantine/hooks";
import {
  Box,
  Button,
  Card,
  Group,
  Grid,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  getInfantryFormationExample,
  DEFAULT_INFANTRY_FORMATION_PRESET,
  INFANTRY_FORMATION_PRESETS,
  type InfantryFormationPreset,
  type SquadFormationModel,
} from "../../../../src/unitStats/squadFormations";
import { IconTargetArrow } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type { WeaponStatsType } from "../../../../src/unitStats/mappingWeapon";
import type { ScatterModelShotStats } from "../../../../src/unitStats/scatterSimulation";
import {
  getScatterBand,
  getScatterImpactOffset,
  getRectangularAoeCorners,
} from "../../../../src/unitStats/scatterSimulation";

/** Keep this state at the calculator level so it can later feed the scatter solver. */
export type ScatterFormationState = {
  enabled: boolean;
  preset: InfantryFormationPreset;
  disabledModelIds: number[];
  /** An infantry aim point. Disabled models can still be used as markers. Null = ground attack. */
  targetModelId: number | null;
  /** Arbitrary aim point in provisional metres, used when targetModelId is null. */
  groundTarget?: { x: number; y: number } | null;
  /** Internal mathematical angle: 0° right, 90° up. The UI measures clockwise from the unit's front. */
  gunnerAngleDeg: number;
};

export type ScatterFormationModel = SquadFormationModel;

export const DEFAULT_SCATTER_FORMATION: ScatterFormationState = {
  enabled: true,
  preset: DEFAULT_INFANTRY_FORMATION_PRESET,
  disabledModelIds: [],
  targetModelId: 1,
  groundTarget: null,
  gunnerAngleDeg: 270,
};

/** Shared fallback for the diagram and solver when the selected squad has no usable layout. */
export const getScatterFormationModels = (
  state: ScatterFormationState,
  count = 6,
): ScatterFormationModel[] =>
  getInfantryFormationExample(state.preset, count).map((model) => ({
    ...model,
    enabled: !state.disabledModelIds.includes(model.id),
  }));

/** Gunner bearing around the aimed-at model. Physical range comes from the DPS chart. */
export const getScatterGunnerDirection = (state: ScatterFormationState) => {
  const radians = (state.gunnerAngleDeg * Math.PI) / 180;
  return { x: Math.cos(radians), y: Math.sin(radians) };
};

// These radii are only for the preview ring, not game-world distances.
const GUNNER_RADIUS_X = 43;
const GUNNER_RADIUS_Y = 43;
const MAX_MODEL_SCALE = 10;

/** The unit faces down: front = 0°, right flank (preview left) = 90°. This is its own inverse. */
const toUnitRelativeBearing = (angle: number) => (630 - angle) % 360;

type PreviewWeapon = {
  weapon: WeaponStatsType;
  label: string;
  /** Currently selected firing range for this preview, in displayed metres. */
  range: number;
  /** Unmodified minimum firing range; range modifiers do not move this limit. */
  minRange: number;
  /** Max range on the displayed graph, including applicable range modifiers. */
  maxRange: number;
  isMoving: boolean;
  scatterMultiplier: number;
  inFogOfWar: boolean;
  /** Per-shot stats at the preview range for this one weapon, not every compared attacker. */
  modelStats?: ScatterModelShotStats[];
};

type Point = { x: number; y: number };

/** The limiting region is the same sector used to sample misses, but viewed near the target. */
const buildScatterPreview = (preview: PreviewWeapon, target: Point, gunnerAngleDeg: number) => {
  const { minRange, maxRange, angleWidth } = getScatterBand(
    preview.weapon,
    preview.range,
    preview.isMoving,
    preview.scatterMultiplier,
    preview.inFogOfWar,
  );
  const pointAt = (radius: number, angle: number): Point => {
    const offset = getScatterImpactOffset(preview.range, radius, angle, gunnerAngleDeg);
    return { x: target.x + offset.x, y: target.y + offset.y };
  };

  // Trace the two arcs so the envelope exactly matches the angular/radial bounds.
  const arcSteps = 36;
  const outline: Point[] = [];
  for (let i = 0; i <= arcSteps; i++) {
    outline.push(pointAt(maxRange, -angleWidth / 2 + (angleWidth * i) / arcSteps));
  }
  for (let i = arcSteps; i >= 0; i--) {
    outline.push(pointAt(minRange, -angleWidth / 2 + (angleWidth * i) / arcSteps));
  }

  // Every 1 m ruler mark follows an arc at a constant distance from the gunner,
  // spanning the whole angular band instead of using a straight chord.
  const ticks: Array<{ arc: Point[]; delta: number }> = [];
  for (
    let delta = Math.ceil(minRange - preview.range);
    delta <= Math.floor(maxRange - preview.range);
    delta++
  ) {
    const radius = preview.range + delta;
    const arc: Point[] = [];
    for (let i = 0; i <= arcSteps; i++) {
      arc.push(pointAt(radius, -angleWidth / 2 + (angleWidth * i) / arcSteps));
    }
    ticks.push({ arc, delta });
  }
  return { outline, ticks, minRange, maxRange };
};

interface ScatterFormationEditorProps {
  value: ScatterFormationState;
  models?: ScatterFormationModel[];
  unitFormation?: {
    available: boolean;
    approximateCrew: boolean;
    weapon?: Point;
  };
  onChange: (value: ScatterFormationState) => void;
  /** Currently selected AoE weapon; preview only (not used by the DPS solver). */
  previewWeapon?: PreviewWeapon;
  previewWeaponOptions: Array<{
    value: string;
    label: string;
    weaponName: string;
    attackerName: string;
    color: string;
    averageDamage: number | null;
  }>;
  selectedPreviewWeaponId: string | null;
  onPreviewWeaponChange: (value: string) => void;
  onPreviewRangeChange: (range: number) => void;
}

export const ScatterFormationEditor: React.FC<ScatterFormationEditorProps> = ({
  value,
  models: suppliedModels,
  unitFormation,
  onChange,
  previewWeapon,
  previewWeaponOptions,
  selectedPreviewWeaponId,
  onPreviewWeaponChange,
  onPreviewRangeChange,
}) => {
  // Keep dragging responsive without recalculating every DPS curve on each pointer move.
  const { t } = useTranslation("explorer");
  const [previewAngle, setPreviewAngle] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [resizeRef, canvasBounds] = useResizeObserver<HTMLDivElement>();
  const measuredCanvasRef = useMergedRef(canvasRef, resizeRef);
  const displayedAngle = previewAngle ?? value.gunnerAngleDeg;
  const displayedBearing = toUnitRelativeBearing(displayedAngle);
  const selectedPreset = INFANTRY_FORMATION_PRESETS.includes(value.preset)
    ? value.preset
    : DEFAULT_INFANTRY_FORMATION_PRESET;
  const models = suppliedModels ?? getScatterFormationModels(value);
  const activeCount = models.filter((model) => model.enabled).length;
  // A disabled model remains a valid aiming marker but does not receive damage.
  const targetModel = models.find((model) => model.id === value.targetModelId);
  const aimPoint: Point | null =
    value.targetModelId === null ? (value.groundTarget ?? null) : (targetModel ?? null);
  const gunnerDirection = getScatterGunnerDirection({
    ...value,
    gunnerAngleDeg: displayedAngle,
  });
  const gunnerX = 50 + gunnerDirection.x * GUNNER_RADIUS_X;
  const gunnerY = 50 - gunnerDirection.y * GUNNER_RADIUS_Y;

  const preview =
    aimPoint && previewWeapon && previewWeapon.maxRange > 0
      ? buildScatterPreview(previewWeapon, aimPoint, displayedAngle)
      : null;

  // Centre the *view* on the aimed point (model or ground). Model coordinates
  // remain unchanged for the solver; this is a display-only translation.
  const viewOrigin = aimPoint ?? { x: 0, y: 0 };

  // Zoom the whole diagram relative to that target so the formation, AoE circle,
  // and scatter envelope fit without stretching circular AoE.
  // The gunner's ring remains a symbolic direction selector; it is not physical range.
  let maxExtent = 3.8;
  for (const model of models) {
    maxExtent = Math.max(
      maxExtent,
      Math.abs(model.x - viewOrigin.x),
      Math.abs(model.y - viewOrigin.y),
    );
  }
  if (aimPoint && previewWeapon) {
    maxExtent = Math.max(maxExtent, previewWeapon.weapon.aoe_outer_radius);
  }
  const rectangleCorners =
    aimPoint && previewWeapon?.weapon.aoe_shape === "rectangle"
      ? getRectangularAoeCorners(
          aimPoint,
          previewWeapon.weapon.aoe_outer_length,
          previewWeapon.weapon.aoe_width,
          displayedAngle,
        )
      : [];
  for (const point of rectangleCorners) {
    maxExtent = Math.max(
      maxExtent,
      Math.abs(point.x - viewOrigin.x),
      Math.abs(point.y - viewOrigin.y),
    );
  }
  for (const point of preview?.outline ?? []) {
    maxExtent = Math.max(
      maxExtent,
      Math.abs(point.x - viewOrigin.x),
      Math.abs(point.y - viewOrigin.y),
    );
  }
  const modelScale = Math.min(MAX_MODEL_SCALE, 39 / maxExtent);
  const pixelsPerMetre = (modelScale * (canvasBounds.width || 440)) / 100;
  // Fade fine lines as they become crowded; coarsen the major grid only at extreme zooms.
  const minorGridOpacity = Math.max(0, Math.min(1, (pixelsPerMetre - 8) / 8)) * 0.06;
  const majorLimit = 10 / pixelsPerMetre;
  const majorBase = 10 ** Math.floor(Math.log10(majorLimit));
  const majorRatio = majorLimit / majorBase;
  const majorGridMetres = Math.max(
    5,
    majorBase * (majorRatio <= 1 ? 1 : majorRatio <= 2 ? 2 : majorRatio <= 5 ? 5 : 10),
  );
  const gridMetres = pixelsPerMetre >= 12 ? 1 : majorGridMetres;
  const toX = (x: number) => 50 + (x - viewOrigin.x) * modelScale;
  const toY = (y: number) => 50 - (y - viewOrigin.y) * modelScale;
  // Draw in world coordinates so changing the aim point pans the grid with the formation.
  const gridPath = (step: number, skipMajor = false) => {
    const commands: string[] = [];
    for (const [origin, project, vertical] of [
      [viewOrigin.x, toX, true],
      [viewOrigin.y, toY, false],
    ] as const) {
      const first = Math.ceil((origin - 50 / modelScale) / step);
      const last = Math.floor((origin + 50 / modelScale) / step);
      for (let index = first; index <= last; index++) {
        const coordinate = index * step;
        if (skipMajor && coordinate % majorGridMetres === 0) continue;
        const position = project(coordinate);
        commands.push(vertical ? "M " + position + " 0 V 100" : "M 0 " + position + " H 100");
      }
    }
    return commands.join(" ");
  };
  const outlinePath =
    preview?.outline
      .map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x)} ${toY(point.y)}`)
      .join(" ") + " Z";
  const rectanglePath =
    rectangleCorners
      .map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x)} ${toY(point.y)}`)
      .join(" ") + " Z";

  const toggleModel = (id: number) => {
    const disabledModelIds = value.disabledModelIds.includes(id)
      ? value.disabledModelIds.filter((modelId) => modelId !== id)
      : [...value.disabledModelIds, id];
    // Keep aim on the same model even if it is disabled: it remains a
    // positional reference, just excluded from damage and AoE cap selection.
    onChange({ ...value, disabledModelIds });
  };

  const getAngleFromPointer = (event: React.PointerEvent<HTMLDivElement>): number => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return displayedAngle;
    const x = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
    const y = (bounds.top + bounds.height / 2 - event.clientY) / bounds.height;
    if (x === 0 && y === 0) return displayedAngle;
    // Normalize the ellipse so clicking/dragging in any direction is intuitive.
    return Math.round(
      ((Math.atan2(y / (GUNNER_RADIUS_Y / 100), x / (GUNNER_RADIUS_X / 100)) * 180) / Math.PI +
        360) %
        360,
    );
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPreviewAngle(getAngleFromPointer(event));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      setPreviewAngle(getAngleFromPointer(event));
    }
  };

  const handleGroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const bounds = canvasRef.current.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    // Client coordinates are converted back into provisional world metres so
    // changing the aim re-centres the view without shifting squad positions.
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;
    const x = viewOrigin.x + (relativeX * 100 - 50) / modelScale;
    const y = viewOrigin.y + (50 - relativeY * 100) / modelScale;
    onChange({ ...value, targetModelId: null, groundTarget: { x, y } });
  };

  return (
    <Card withBorder radius="md" p="md" mt="md" data-testid="scatter-formation-editor">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Title order={5}>{t("dpsCompareUi.formation.title")}</Title>
          <Text size="sm" c="dimmed" data-testid="scatter-active-count">
            {t("dpsCompareUi.formation.activeModels", {
              active: activeCount,
              total: models.length,
            })}
          </Text>
        </Group>

        <Grid align="flex-start" gap="md">
          <Grid.Col span={{ base: 12, sm: 8 }}>
            <Stack gap="sm">
              <Stack gap={4}>
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={500}>
                    {t("dpsCompareUi.formation.previewRange")}
                  </Text>
                  <Text size="sm" c="dimmed" data-testid="scatter-preview-range-value">
                    {previewWeapon ? `${previewWeapon.range.toFixed(1)} m` : "—"}
                  </Text>
                </Group>
                <Slider
                  min={previewWeapon?.minRange ?? 0}
                  max={
                    previewWeapon?.maxRange &&
                    previewWeapon.maxRange > (previewWeapon.minRange ?? 0)
                      ? previewWeapon.maxRange
                      : 1
                  }
                  value={previewWeapon?.range ?? 0}
                  step={0.1}
                  onChange={onPreviewRangeChange}
                  disabled={!previewWeapon || previewWeapon.maxRange <= previewWeapon.minRange}
                  marks={
                    previewWeapon && previewWeapon.maxRange > previewWeapon.minRange
                      ? [
                          {
                            value: previewWeapon.minRange,
                            label: `${previewWeapon.minRange.toFixed(1)} m`,
                          },
                          {
                            value: previewWeapon.maxRange,
                            label: `${previewWeapon.maxRange.toFixed(1)} m`,
                          },
                        ]
                      : undefined
                  }
                  aria-label={t("dpsCompareUi.formation.previewRange")}
                  data-testid="scatter-preview-range-slider"
                  mb="lg"
                />
              </Stack>

              {!unitFormation?.available && (
                <SimpleGrid
                  cols={{ base: 1, sm: 2 }}
                  spacing="xs"
                  data-testid="scatter-example-presets"
                >
                  {INFANTRY_FORMATION_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      size="compact-sm"
                      variant={selectedPreset === preset ? "filled" : "default"}
                      onClick={() => onChange({ ...value, preset })}
                      aria-pressed={selectedPreset === preset}
                    >
                      {t(`dpsCompareUi.formation.presets.${preset}`)}
                    </Button>
                  ))}
                </SimpleGrid>
              )}
              {!unitFormation?.available && (
                <Text size="xs" c="dimmed">
                  {t("dpsCompareUi.formation.unavailable", {
                    unit: t(`dpsCompareUi.formation.presets.${selectedPreset}`),
                  })}
                </Text>
              )}
              {unitFormation?.approximateCrew && (
                <Text size="xs" c="dimmed">
                  {t("dpsCompareUi.formation.approximateCrew")}
                </Text>
              )}

              <Box
                pos="relative"
                ref={measuredCanvasRef}
                role="group"
                aria-label={t("dpsCompareUi.formation.canvas")}
                onClick={handleGroundClick}
                style={{
                  width: "100%",
                  maxWidth: 440,
                  aspectRatio: "1 / 1",
                  marginInline: "auto",
                  borderRadius: "var(--mantine-radius-sm)",
                  border: "1px solid var(--mantine-color-default-border)",
                  backgroundColor: "var(--mantine-color-default-hover)",
                  cursor: "crosshair",
                  touchAction: "none",
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                  data-testid="scatter-metre-grid"
                  data-major-step={majorGridMetres}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: "inherit",
                    pointerEvents: "none",
                    color: "var(--mantine-color-text)",
                  }}
                >
                  {minorGridOpacity > 0 && (
                    <path
                      d={gridPath(1, true)}
                      stroke="currentColor"
                      strokeOpacity={minorGridOpacity}
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                      data-testid="scatter-grid-minor"
                    />
                  )}
                  <path
                    d={gridPath(majorGridMetres)}
                    stroke="currentColor"
                    strokeOpacity={0.13}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    data-testid="scatter-grid-major"
                  />
                </svg>
                <Text
                  pos="absolute"
                  left="4%"
                  bottom="3%"
                  size="xs"
                  c="dimmed"
                  px={3}
                  data-testid="scatter-grid-label"
                  style={{
                    pointerEvents: "none",
                    zIndex: 1,
                    backgroundColor: "var(--mantine-color-default-hover)",
                    borderRadius: "var(--mantine-radius-xs)",
                  }}
                >
                  {t("dpsCompareUi.formation.metreGrid", { distance: gridMetres })}
                </Text>
                {/* Preview-only gunner orbit: range will be supplied by the DPS graph. */}
                <Box
                  pos="absolute"
                  style={{
                    left: `${50 - GUNNER_RADIUS_X}%`,
                    top: `${50 - GUNNER_RADIUS_Y}%`,
                    width: `${GUNNER_RADIUS_X * 2}%`,
                    height: `${GUNNER_RADIUS_Y * 2}%`,
                    border: "1px dashed var(--mantine-color-dimmed)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                    opacity: 0.55,
                  }}
                />
                {aimPoint && (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      overflow: "visible",
                    }}
                  >
                    <defs>
                      <marker
                        id="scatter-target-arrow"
                        markerWidth="5"
                        markerHeight="5"
                        refX="4"
                        refY="2.5"
                        orient="auto"
                      >
                        <path d="M 0 0 L 5 2.5 L 0 5 z" fill="var(--mantine-color-orange-6)" />
                      </marker>
                    </defs>
                    {/* Visual-only scatter preview of the chosen AoE weapon at its selected range. */}
                    {preview && previewWeapon && (
                      <g>
                        <path
                          d={outlinePath}
                          fill="var(--mantine-color-cyan-5)"
                          fillOpacity={0.16}
                          stroke="var(--mantine-color-cyan-6)"
                          strokeWidth={0.35}
                          strokeLinejoin="round"
                        />
                        {/* AoE at a direct impact: a circle around target, or a rectangle
                      extending forward from the targeted model (near edge). */}
                        {previewWeapon.weapon.aoe_shape === "rectangle" ? (
                          <path
                            d={rectanglePath}
                            stroke="var(--mantine-color-orange-6)"
                            strokeWidth={0.35}
                            strokeDasharray="1.2 0.9"
                            fill="var(--mantine-color-orange-4)"
                            fillOpacity={0.07}
                          />
                        ) : (
                          <circle
                            cx={toX(aimPoint.x)}
                            cy={toY(aimPoint.y)}
                            r={previewWeapon.weapon.aoe_outer_radius * modelScale}
                            stroke="var(--mantine-color-orange-6)"
                            strokeWidth={0.35}
                            strokeDasharray="1.2 0.9"
                            fill="var(--mantine-color-orange-4)"
                            fillOpacity={0.07}
                          />
                        )}
                        {/* Curved 1 m ruler arcs span the full limiting region, with no labels. */}
                        {preview.ticks.map(({ arc, delta }) => (
                          <path
                            key={delta}
                            d={arc
                              .map(
                                (point, index) =>
                                  `${index === 0 ? "M" : "L"} ${toX(point.x)} ${toY(point.y)}`,
                              )
                              .join(" ")}
                            fill="none"
                            stroke="var(--mantine-color-cyan-7)"
                            strokeWidth={delta === 0 ? 0.42 : 0.27}
                            strokeOpacity={delta === 0 ? 0.95 : 0.7}
                          />
                        ))}
                      </g>
                    )}
                    <line
                      x1={gunnerX}
                      y1={gunnerY}
                      x2={toX(aimPoint.x)}
                      y2={toY(aimPoint.y)}
                      stroke="var(--mantine-color-orange-6)"
                      strokeWidth="0.6"
                      strokeDasharray="1.5 1"
                      markerEnd="url(#scatter-target-arrow)"
                    />
                  </svg>
                )}
                {value.targetModelId === null && aimPoint && (
                  <Box
                    data-testid="scatter-ground-aim"
                    aria-label={t("dpsCompareUi.formation.groundAim")}
                    pos="absolute"
                    style={{
                      left: `${toX(aimPoint.x)}%`,
                      top: `${toY(aimPoint.y)}%`,
                      width: 16,
                      height: 16,
                      transform: "translate(-50%, -50%)",
                      border: "2px dashed var(--mantine-color-orange-6)",
                      borderRadius: "50%",
                      pointerEvents: "none",
                    }}
                  />
                )}
                {unitFormation?.weapon && (
                  <Tooltip label={t("dpsCompareUi.formation.crewWeapon")}>
                    <Box
                      pos="absolute"
                      data-testid="scatter-crew-weapon"
                      aria-label={t("dpsCompareUi.formation.crewWeapon")}
                      style={{
                        left: toX(unitFormation.weapon.x) + "%",
                        top: toY(unitFormation.weapon.y) + "%",
                        transform: "translate(-50%, -50%)",
                        width: 26,
                        height: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 4,
                        background: "var(--mantine-color-gray-7)",
                        color: "var(--mantine-color-white)",
                      }}
                    >
                      <IconTargetArrow size={19} />
                    </Box>
                  </Tooltip>
                )}
                {models.map((model) => {
                  const isTarget = model.id === value.targetModelId;
                  return (
                    <Tooltip
                      key={model.id}
                      multiline
                      w={240}
                      label={(() => {
                        const stat = previewWeapon?.modelStats?.find(
                          (entry) => entry.id === model.id,
                        );
                        return (
                          <Stack gap={2}>
                            <Text size="xs" fw={600} c="inherit">
                              {t("dpsCompareUi.formation.model", {
                                number: model.id,
                              })}{" "}
                              —{" "}
                              {model.enabled
                                ? isTarget
                                  ? t("dpsCompareUi.formation.targeted")
                                  : t("dpsCompareUi.formation.active")
                                : t("dpsCompareUi.formation.disabled")}
                            </Text>
                            {stat && previewWeapon ? (
                              <>
                                <Text size="xs" c="inherit">
                                  {t("dpsCompareUi.formation.hit")}:{" "}
                                  {(stat.hitChance * 100).toFixed(1)}%
                                </Text>
                                <Text size="xs" c="inherit">
                                  {t("dpsCompareUi.formation.avgDamage")}:{" "}
                                  {stat.averageDamage.toFixed(2)} HP
                                </Text>
                                <Text size="xs" c="inherit">
                                  {t("dpsCompareUi.formation.kill")}:{" "}
                                  {stat.killChance === null
                                    ? "—"
                                    : `${(stat.killChance * 100).toFixed(1)}%`}
                                </Text>
                              </>
                            ) : (
                              <Text size="xs" c="inherit">
                                {t("dpsCompareUi.formation.noWeapon")}
                              </Text>
                            )}
                          </Stack>
                        );
                      })()}
                    >
                      <Box
                        component="button"
                        type="button"
                        aria-label={t("dpsCompareUi.formation.modelAria", {
                          number: model.id,
                        })}
                        aria-pressed={isTarget}
                        data-testid={`scatter-model-${model.id}`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          onChange({
                            ...value,
                            targetModelId: model.id,
                            groundTarget: null,
                          });
                        }}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleModel(model.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Delete" || event.key === "Backspace") {
                            event.preventDefault();
                            toggleModel(model.id);
                          }
                        }}
                        style={{
                          position: "absolute",
                          left: `${toX(model.x)}%`,
                          top: `${toY(model.y)}%`,
                          transform: "translate(-50%, -50%)",
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: model.enabled
                            ? model.operator
                              ? "var(--mantine-color-teal-6)"
                              : "var(--mantine-color-blue-6)"
                            : "var(--mantine-color-gray-5)",
                          border: isTarget
                            ? "3px solid var(--mantine-color-yellow-3)"
                            : "1px solid var(--mantine-color-white)",
                          opacity: model.enabled ? 1 : 0.45,
                          boxShadow: isTarget
                            ? "0 0 0 2px var(--mantine-color-blue-9)"
                            : undefined,
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  );
                })}
                <Tooltip label={t("dpsCompareUi.formation.dragGunner")}>
                  <Box
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      handlePointerDown(event);
                    }}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(event) => {
                      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        const gunnerAngleDeg = getAngleFromPointer(event);
                        event.currentTarget.releasePointerCapture(event.pointerId);
                        setPreviewAngle(null);
                        if (gunnerAngleDeg !== value.gunnerAngleDeg) {
                          onChange({ ...value, gunnerAngleDeg });
                        }
                      }
                    }}
                    onPointerCancel={() => setPreviewAngle(null)}
                    onClick={(event) => event.stopPropagation()}
                    data-testid="scatter-gunner-position"
                    aria-label={t("dpsCompareUi.formation.gunnerAngleAria", {
                      angle: displayedBearing,
                    })}
                    pos="absolute"
                    style={{
                      left: `${gunnerX}%`,
                      top: `${gunnerY}%`,
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "var(--mantine-color-orange-6)",
                      color: "white",
                      border: "2px solid var(--mantine-color-yellow-3)",
                      cursor: "grab",
                      userSelect: "none",
                    }}
                  >
                    <IconTargetArrow size={21} />
                  </Box>
                </Tooltip>
              </Box>

              <Group justify="space-between" align="center" gap="sm">
                <Tooltip label={t("dpsCompareUi.formation.directionHelp")}>
                  <Text size="sm" fw={500}>
                    {t("dpsCompareUi.formation.gunnerDirection")}
                  </Text>
                </Tooltip>
                <Text size="sm" c="dimmed" data-testid="scatter-gunner-angle">
                  {displayedBearing}°
                </Text>
              </Group>
              <Slider
                min={0}
                max={359}
                step={1}
                value={displayedBearing}
                onChange={(bearing) => setPreviewAngle(toUnitRelativeBearing(bearing))}
                onChangeEnd={(bearing) => {
                  setPreviewAngle(null);
                  onChange({ ...value, gunnerAngleDeg: toUnitRelativeBearing(bearing) });
                }}
                aria-label={t("dpsCompareUi.formation.gunnerAngleAria", {
                  angle: displayedBearing,
                })}
                data-testid="scatter-gunner-direction-slider"
                marks={[
                  { value: 0, label: t("dpsCompareUi.formation.front") },
                  { value: 90, label: t("dpsCompareUi.formation.rightFlank") },
                  { value: 180, label: t("dpsCompareUi.formation.behind") },
                  { value: 270, label: t("dpsCompareUi.formation.leftFlank") },
                ]}
                mb="lg"
              />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Stack gap="xs" data-testid="scatter-preview-weapon-list">
              <Text size="sm" fw={600}>
                {t("dpsCompareUi.formation.avgDamage")}
              </Text>
              {previewWeaponOptions.length === 0 && (
                <Text size="sm" c="dimmed">
                  {t("dpsCompareUi.formation.noWeapon")}
                </Text>
              )}
              {previewWeaponOptions.map((option) => {
                const selected = option.value === selectedPreviewWeaponId;
                return (
                  <UnstyledButton
                    key={option.value}
                    onClick={() => onPreviewWeaponChange(option.value)}
                    aria-label={option.label}
                    aria-pressed={selected}
                    title={
                      option.averageDamage === null
                        ? t("dpsCompareUi.formation.outOfRange")
                        : undefined
                    }
                    data-testid="scatter-preview-weapon-option"
                    data-value={option.value}
                    data-average-damage={option.averageDamage ?? ""}
                    p="xs"
                    style={{
                      width: "100%",
                      opacity: option.averageDamage === null ? 0.5 : 1,
                      borderRadius: "var(--mantine-radius-sm)",
                      border: `2px solid var(--mantine-color-${option.color}-5)`,
                      background: selected
                        ? `var(--mantine-color-${option.color}-light)`
                        : "var(--mantine-color-default)",
                    }}
                  >
                    <Group gap="xs" justify="space-between" wrap="nowrap" align="center">
                      <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                        <Text
                          size="sm"
                          fw={selected ? 600 : 500}
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {option.weaponName}
                        </Text>
                        <Text size="xs" c="dimmed" style={{ overflowWrap: "anywhere" }}>
                          {option.attackerName}
                        </Text>
                      </Stack>
                      <Text
                        size="sm"
                        fw={600}
                        style={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
                        title={
                          option.averageDamage === null
                            ? t("dpsCompareUi.formation.outOfRange")
                            : undefined
                        }
                      >
                        {option.averageDamage === null ? "—" : option.averageDamage.toFixed(1)}
                      </Text>
                    </Group>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </Grid.Col>
        </Grid>
        <Group justify="space-between" align="flex-start" gap="sm">
          <Text size="xs" c="dimmed" style={{ flex: 1 }}>
            {t("dpsCompareUi.formation.help")}
          </Text>
          <Button
            variant="subtle"
            size="compact-sm"
            disabled={value.disabledModelIds.length === 0}
            onClick={() =>
              onChange({
                ...value,
                disabledModelIds: [],
                targetModelId: value.targetModelId,
              })
            }
          >
            {t("dpsCompareUi.formation.restore")}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
