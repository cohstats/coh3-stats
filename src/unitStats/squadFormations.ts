import type { SbpsType } from "./mappingSbps";
import type { EbpsType } from "./mappingEbps";
import infantryFormationPresets from "./infantry-formation-presets.json";
import {
  FORMATION_GROUPS,
  type FormationCounts,
  type FormationData,
  type FormationGroup,
  type SquadFormationDefinition,
} from "./mappingFormations";

/** In-game tests on 3.0.1: left-only assignments disappear; scouts remain; vacancies fill core.
 * Set false when a verified game fix restores unpaired left-flank assignments.
 * Right-only has not been tested and is deliberately left untouched.
 */
export const IGNORE_UNPAIRED_LEFT_FLANK = true;

export type SquadFormationModel = {
  id: number;
  x: number;
  y: number;
  enabled: boolean;
  group?: FormationGroup;
  slot?: string;
  operator?: boolean;
};
export type ResolvedSquadFormation = {
  models: SquadFormationModel[];
  weapon?: { x: number; y: number };
  reference: string;
  approximateCrew: boolean;
};

const slotBase: Record<FormationGroup, number> = {
  core: 0,
  left: 100,
  right: 200,
  scout: 300,
};
const slotLetter: Record<FormationGroup, string> = {
  core: "C",
  left: "L",
  right: "R",
  scout: "S",
};
const coverKey: Record<string, string> = {
  "": "tp_defcover",
  heavy: "tp_heavy_cover",
  light: "tp_light_cover",
  negative: "tp_negative_cover",
  garrison: "tp_garrison_cover",
};

export const getSquadHumanCount = (squad: SbpsType): number =>
  squad.loadout
    .filter(({ type }) => /(?:^|[\\/])infantry[\\/]/.test(type))
    .reduce((sum, member) => sum + Math.max(0, member.num), 0);

export const getSquadWeaponEntity = (
  squad: SbpsType,
  entities: EbpsType[],
): EbpsType | undefined => {
  const loadout = squad.loadout.find(({ type }) => !/(?:^|[\\/])infantry[\\/]/.test(type));
  if (!loadout || squad.unitType !== "team_weapons") return undefined;
  const id = loadout.type.replace(/\\/g, "/").split("/").at(-1);
  return entities.find((entity) => entity.id === id);
};

/** Tested runtime allocation, without editing the extracted SBPS row. */
export const getEffectiveFormationCounts = (
  exported: FormationCounts | undefined,
  count: number,
  ignoreUnpairedLeft = IGNORE_UNPAIRED_LEFT_FLANK,
): FormationCounts => {
  const remaining = Math.max(0, Math.floor(count));
  const raw = exported ?? { core: remaining, left: 0, right: 0, scout: 0 };
  const scout = Math.min(remaining, raw.scout);
  const right = Math.min(remaining - scout, raw.right);
  const left =
    ignoreUnpairedLeft && raw.right === 0 ? 0 : Math.min(remaining - scout - right, raw.left);
  return { core: remaining - scout - right - left, scout, left, right };
};

/** Slot mapping confirmed by the editor; overall and element scales apply independently. */
export const getFormationSlot = (
  definition: SquadFormationDefinition,
  group: FormationGroup,
  index: number,
): SquadFormationModel | undefined => {
  const anchor = definition.anchors.spots[FORMATION_GROUPS.indexOf(group)];
  const element = definition.groups[group];
  const local = element.spots[index];
  if (!anchor || !local) return undefined;
  const facing = (anchor.facing * Math.PI) / 180;
  const x = local.x * element.scale,
    y = local.y * element.scale;
  return {
    id: slotBase[group] + index + 1,
    enabled: true,
    group,
    slot: `${slotLetter[group]}${index + 1}`,
    x: anchor.x * definition.anchors.scale + x * Math.cos(facing) - y * Math.sin(facing),
    y: anchor.y * definition.anchors.scale + x * Math.sin(facing) + y * Math.cos(facing),
  };
};

/** Empirical spare-crew positions, not a guessed general engine allocation algorithm.
 * Human count excludes the gun, includes its two handlers. Tested with Pak 38 and le.IG.
 * Corrected four-human observation: C2 + L1. Six-human case intentionally drops C3.
 */
const MOBILE_SPARE_CREW: Record<number, string[]> = {
  2: [],
  3: ["L1"],
  4: ["C2", "L1"],
  5: ["C2", "C3", "L1"],
  6: ["C2", "L1", "L2", "R1"],
};

export const resolveSquadFormation = (
  squad: SbpsType,
  data: FormationData,
  humanCount: number,
  cover = "",
  moving = false,
  weapon?: EbpsType,
): ResolvedSquadFormation | undefined => {
  const info = squad.formation;
  if (!info) return undefined;
  const key = coverKey[cover] ?? cover;
  const ref =
    (moving ? info.movingCover[key] : undefined) || info.cover[key] || info.cover.tp_defcover;
  const definition = data[ref];
  if (!definition) return undefined;
  const humans = Math.max(1, Math.floor(humanCount));
  const teamWeapon = squad.unitType === "team_weapons" && !!weapon;
  const entityCount = humans + (teamWeapon ? 1 : 0);
  const row = info.distribution[`${String(entityCount).padStart(2, "0")}_soldiers`];
  if (!row) return undefined;
  const counts = getEffectiveFormationCounts(row, entityCount);
  const origin = getFormationSlot(definition, "core", 0);
  if (!origin) return undefined;
  let models: SquadFormationModel[] = [];
  let approximateCrew = false;

  // Mobile guns: retain tested irregular allocation, rather than filling slots in a fabricated order.
  const mobile = teamWeapon && weapon.teamWeapon?.type === "tp_mobile";
  const handlerCount =
    teamWeapon && weapon.teamWeapon?.type !== "tp_carried"
      ? Math.min(humans, weapon.teamWeapon?.requiredCrew ?? 2)
      : 0;
  const observed =
    mobile && handlerCount === 2 && ref === info.cover.tp_defcover
      ? MOBILE_SPARE_CREW[humans]
      : undefined;
  // Do not invent an allocation for larger mobile crews that were not tested.
  if (mobile && handlerCount === 2 && ref === info.cover.tp_defcover && !observed)
    return undefined;
  if (observed) {
    for (const slot of observed) {
      const group = ({ C: "core", L: "left", R: "right", S: "scout" } as const)[
        slot[0] as "C" | "L" | "R" | "S"
      ];
      const point = getFormationSlot(definition, group, Number(slot.slice(1)) - 1);
      if (!point) return undefined;
      models.push(point);
    }
  } else {
    // Carried HMGs/mortars leave the last allocated core slot unused by people.
    if (teamWeapon) counts.core = Math.max(0, counts.core - 1);
    for (const group of FORMATION_GROUPS)
      for (let i = 0; i < counts[group]; i++) {
        const point = getFormationSlot(definition, group, i);
        if (!point) return undefined;
        models.push(point);
      }
    if (handlerCount)
      models = models.filter((model) => model.slot !== "C1").slice(0, humans - handlerCount);
  }
  if (handlerCount) {
    // Skeleton marker transforms are not present in these JSON files. Approximate the observed
    // cluster just behind C1; setup/teardown animation changes are deliberately not simulated.
    approximateCrew = true;
    const handlers: SquadFormationModel[] = [];
    for (let i = 0; i < handlerCount; i++)
      handlers.push({
        id: 10001 + i,
        enabled: true,
        operator: true,
        x: origin.x + (i - (handlerCount - 1) / 2) * 1.2,
        y: origin.y - 0.8,
      });
    models = [...handlers, ...models];
  }
  if (models.length !== humans) return undefined;
  return {
    models,
    reference: ref,
    approximateCrew,
    ...(teamWeapon ? { weapon: { x: origin.x, y: origin.y } } : {}),
  };
};

export const rotateFormationModels = (
  models: SquadFormationModel[],
  angle: number,
): SquadFormationModel[] => {
  const radians = (angle * Math.PI) / 180;
  return models.map((model) => ({
    ...model,
    x: model.x * Math.cos(radians) - model.y * Math.sin(radians),
    y: model.x * Math.sin(radians) + model.y * Math.cos(radians),
  }));
};

export type InfantryFormationPreset = keyof typeof infantryFormationPresets.presets;
export const DEFAULT_INFANTRY_FORMATION_PRESET: InfantryFormationPreset = "panzergrenadier_ak";
export const INFANTRY_FORMATION_PRESETS = Object.keys(
  infantryFormationPresets.presets,
) as InfantryFormationPreset[];

/** Real 3.0.1 example layouts for missing data, not the selected squad's formation.
 * The 1–6-model rows use exported distributions and the same left-flank workaround.
 * Larger counts repeat the six-person example in separated groups.
 */
export const getInfantryFormationExample = (
  presetId: InfantryFormationPreset,
  humanCount: number,
): SquadFormationModel[] => {
  const preset =
    infantryFormationPresets.presets[presetId] ??
    infantryFormationPresets.presets[DEFAULT_INFANTRY_FORMATION_PRESET];
  const count = Math.max(0, Math.floor(Number.isFinite(humanCount) ? humanCount : 0));
  const fullCounts = getEffectiveFormationCounts(preset.distribution[5], 6);
  const fullPositions = FORMATION_GROUPS.flatMap((group) =>
    preset.groups[group].slice(0, fullCounts[group]),
  );
  const spacing =
    Math.max(...fullPositions.map(({ x }) => x)) -
    Math.min(...fullPositions.map(({ x }) => x)) +
    4;
  const models: SquadFormationModel[] = [];
  for (let start = 0; start < count; start += 6) {
    const block = start / 6;
    const size = Math.min(6, count - start);
    const counts = getEffectiveFormationCounts(preset.distribution[size - 1], size);
    for (const group of FORMATION_GROUPS)
      for (let i = 0; i < counts[group]; i++) {
        const point = preset.groups[group][i];
        models.push({
          id: block * 1000 + slotBase[group] + i + 1,
          x: point.x + block * spacing,
          y: point.y,
          enabled: true,
          group,
          slot: `${slotLetter[group]}${i + 1}`,
        });
      }
  }
  return models;
};
