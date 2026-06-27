import { WeaponStatsType, getScatterDimensions } from "../../../src/unitStats";
import { AoeFalloffValues, AoeDatasetOptions } from "./types-and-constants";

// ============================================================================
// Formatting Helpers
// ============================================================================

export const formatUnitType = (unitType: string): string =>
  unitType
    .replace(/^tp_/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatBaseDamageModifier = (value: number): React.ReactNode => {
  if (value === 0) return "—";

  return value > 0 ? `+${value}` : value;
};

export const formatMultiplier = (
  value: number,
  unchangedValue: React.ReactNode = "—",
): React.ReactNode => {
  const roundedValue = Math.round(value * 100) / 100;

  if (roundedValue === 1) return unchangedValue;

  return `×${roundedValue}`;
};

export const roundValue = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const formatPercent = (value: number, decimals = 2) => {
  return `${roundValue(value * 100, decimals)}%`;
};

export const formatSeconds = (value: number, decimals = 3) => `${roundValue(value, decimals)}s`;

export const formatMinMaxSeconds = (min: number, max: number, decimals = 3) => {
  const roundedMin = roundValue(min, decimals);
  const roundedMax = roundValue(max, decimals);

  if (roundedMin === roundedMax) return `${roundedMax}s`;

  return `${roundedMin}–${roundedMax}s`;
};

export const formatScatterOffset = (offset: number): React.ReactNode => {
  if (offset === 0) return `—`;

  if (offset > 0) return `+${offset}m`;

  return `${offset}m`;
};

export const formatRangeHeaderDistance = (distance: number) => `${roundValue(distance, 2)}m`;

export const isChangedMultiplier = (value: number) => Math.round(value * 100) / 100 !== 1;

// ============================================================================
// Calculation Helpers
// ============================================================================

export const getAoeValueAtDistance = (
  weapon_bag: WeaponStatsType,
  distance: number,
  values: AoeFalloffValues,
): number => {
  const nearDistance = weapon_bag.aoe_distance_near;
  const midDistance = weapon_bag.aoe_distance_mid;
  const farDistance = weapon_bag.aoe_distance_far;

  const interpolate = (x: number, x1: number, x2: number, y1: number, y2: number): number => {
    if (x1 === x2) return y2;

    const t = (x - x1) / (x2 - x1);
    return y1 + (y2 - y1) * t;
  };

  if (distance <= nearDistance) {
    return values.near;
  }

  if (distance <= midDistance) {
    return interpolate(distance, nearDistance, midDistance, values.near, values.mid);
  }

  if (distance <= farDistance) {
    return interpolate(distance, midDistance, farDistance, values.mid, values.far);
  }

  return values.far;
};

export const formatScatterDimensions = (distance: number, weapon_bag: WeaponStatsType) => {
  const { width, length } = getScatterDimensions(distance, weapon_bag);
  if (roundValue(width, 1) === 0 && roundValue(length, 1) === 0) return 0;
  return `${roundValue(width, 1)}×${roundValue(length, 1)}`;
};

export const getScatterOffset = (distance: number, weapon_bag: WeaponStatsType) => {
  const { offset } = getScatterDimensions(distance, weapon_bag);

  return roundValue(offset, 1);
};

export const areAoeFalloffValuesEqual = (first: AoeFalloffValues, second: AoeFalloffValues) => {
  const epsilon = 0.000001;

  return (
    Math.abs(first.near - second.near) < epsilon &&
    Math.abs(first.mid - second.mid) < epsilon &&
    Math.abs(first.far - second.far) < epsilon
  );
};

export const normalizeOwnUnitAoeDamageValue = (ownUnitValue: number, friendlyValue: number) => {
  // Relic-style inherit value.
  if (ownUnitValue < 0) return friendlyValue;

  return ownUnitValue;
};

export const getWeaponIconSrc = (iconName: string) => {
  const normalizedIconName = iconName.trim();

  if (!normalizedIconName) return "";

  if (normalizedIconName.startsWith("/")) return normalizedIconName;

  return normalizedIconName.endsWith(".png")
    ? `/icons/${normalizedIconName}`
    : `/icons/${normalizedIconName}.png`;
};

// ============================================================================
// AOE Chart Helpers
// ============================================================================

export const getAoeGraphStep = (maxDistance: number) => {
  if (maxDistance <= 5) return 0.1;

  return 0.2;
};

export const buildAoeGraphPoints = (
  getValue: (distance: number) => number,
  weapon_bag: WeaponStatsType,
) => {
  const maxDistance = weapon_bag.aoe_outer_radius;
  const step = getAoeGraphStep(maxDistance);

  const regularPoints = Array.from({ length: Math.floor(maxDistance / step) + 1 }, (_, index) =>
    roundValue(index * step, 2),
  );

  const exactPoints = [
    0,
    weapon_bag.aoe_distance_near,
    weapon_bag.aoe_distance_mid,
    weapon_bag.aoe_distance_far,
    weapon_bag.aoe_outer_radius,
  ].map((distance) => roundValue(distance, 2));

  const distances = [...new Set([...regularPoints, ...exactPoints])]
    .filter((distance) => Number.isFinite(distance))
    .filter((distance) => distance >= 0 && distance <= maxDistance)
    .sort((a, b) => a - b);

  return distances.map((distance) => ({
    x: distance,
    y: roundValue(getValue(distance), 3),
  }));
};

export const createAoeDataset = (
  label: string,
  data: { x: number; y: number }[],
  color: string,
  options: AoeDatasetOptions = {},
) => ({
  label,
  data,
  yAxisID: options.yAxisID ?? "yDamage",
  borderWidth: options.borderWidth ?? 3,
  borderColor: color,
  tension: 0.1,
  pointStyle: "cross" as const,
  fill: false,
  backgroundColor: "rgba(200, 200, 200, 0.2)",
  pointRadius: 0,
  pointHoverRadius: 30,
  pointHitRadius: 10,
  order: options.order ?? 1,
  ...(options.borderDash ? { borderDash: options.borderDash } : {}),
});

export const createAoeChartOptions = (
  weapon_bag: WeaponStatsType,
  maxAoeDamageGraphValue: number,
  maxAoeSuppressionGraphValue: number,
  hasAoeSuppression: boolean,
  t: (key: string) => string,
) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top" as const,
      display: true,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      min: 0,
      suggestedMax: weapon_bag.aoe_outer_radius,
      title: {
        display: true,
        text: t("weaponCard.distance"),
      },
      grid: {
        lineWidth: 0.5,
        display: true,
      },
    },
    yDamage: {
      type: "linear" as const,
      position: "left" as const,
      suggestedMin: 0,
      suggestedMax: Math.ceil(maxAoeDamageGraphValue),
      title: {
        display: true,
        text: t("weaponCard.damage"),
      },
      grid: {
        lineWidth: 0.5,
        display: false,
      },
    },
    ySuppression: {
      type: "linear" as const,
      position: "right" as const,
      display: hasAoeSuppression,
      suggestedMin: 0,
      suggestedMax: Math.ceil(maxAoeSuppressionGraphValue),
      title: {
        display: hasAoeSuppression,
        text: t("weaponCard.suppression"),
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
});
