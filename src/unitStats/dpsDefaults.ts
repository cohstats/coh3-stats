import {
  DEFAULT_INFANTRY_FORMATION_PRESET,
  type InfantryFormationPreset,
  type CalculatorFormationMode,
} from "./squadFormations";

export type ScatterFormationState = {
  enabled: boolean;
  preset: InfantryFormationPreset;
  formation?: CalculatorFormationMode;
  directionalCover?: boolean;
  disabledModelIds: number[];
  /** Null selects ground attack; disabled models remain valid aiming markers. */
  targetModelId: number | null;
  groundTarget?: { x: number; y: number } | null;
  /** Mathematical bearing towards the shooter: 0° right, 90° up. */
  gunnerAngleDeg: number;
};

export const DEFAULT_SCATTER_FORMATION: ScatterFormationState = {
  enabled: true,
  preset: DEFAULT_INFANTRY_FORMATION_PRESET,
  formation: "default",
  directionalCover: false,
  disabledModelIds: [],
  targetModelId: 1,
  groundTarget: null,
  gunnerAngleDeg: 270,
};

export const DEFAULT_DPS_SETTINGS = {
  allowAllWeapons: false,
  showFinalStand: false,
  showDpsHealth: false,
};

export const DEFAULT_COMPARE_SETTINGS = {
  targetType: "infantry" as const,
  samples: 576,
  fogOfWar: false,
};

// Shared by the initial/reset defender and the URL defaults.
export const DEFAULT_COMPARE_TARGET_IDS = {
  infantry: "panzergrenadier_ak",
  other: "halftrack_250_ak",
};
