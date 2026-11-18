import type { SbpsType } from "./mappingSbps";
import type { EbpsType } from "./mappingEbps";
import type { FormationData, FormationGroup } from "./mappingFormations";
import {
  getSquadHumanCount,
  getSquadWeaponEntity,
  resolveSquadFormation,
  type ResolvedSquadFormation,
} from "./squadFormations";

export const DEFAULT_FORMATION_COVER_TYPE = "tp_defcover";

/** "crew" are the team weapon handlers, their positions are approximate. */
export type FormationPreviewElement = FormationGroup | "crew";
export type FormationPreviewPoint = { x: number; y: number };
export type FormationPreviewModel = FormationPreviewPoint & { element: FormationPreviewElement };
export type FormationPreviewLayout = {
  models: FormationPreviewModel[];
  weapon: FormationPreviewPoint | null;
};
export type FormationPreviewOption = {
  /** Cover types (tp_*) which use this formation. */
  coverTypes: string[];
  /** Index 0 is the squad of 1. Null when the formation can't be resolved for that size. */
  layouts: Array<FormationPreviewLayout | null>;
};
/** Everything the formation card needs, precomputed so the client gets only the positions. */
export type SquadFormationPreview = {
  squadSize: number;
  options: FormationPreviewOption[];
};

// Centimetres are plenty for the plot and keep the page props small.
const round = (value: number) => Math.round(value * 100) / 100;

const toLayout = (resolved?: ResolvedSquadFormation): FormationPreviewLayout | null =>
  resolved
    ? {
        models: resolved.models.map((model) => ({
          x: round(model.x),
          y: round(model.y),
          element: model.operator ? "crew" : (model.group ?? "core"),
        })),
        weapon: resolved.weapon
          ? { x: round(resolved.weapon.x), y: round(resolved.weapon.y) }
          : null,
      }
    : null;

/**
 * The formation preview for the unit page. Built on the same resolver as the DPS scatter calculator.
 * Null when there is nothing to draw: no formation data or a single model squad.
 */
export const getSquadFormationPreview = (
  squad: SbpsType,
  ebpsData: EbpsType[],
  formationData: FormationData,
): SquadFormationPreview | null => {
  const info = squad.formation;
  const squadSize = getSquadHumanCount(squad);
  if (!info || squadSize < 2) return null;

  const weapon = getSquadWeaponEntity(squad, ebpsData);
  const coverTypes = [
    DEFAULT_FORMATION_COVER_TYPE,
    ...Object.keys(info.cover).filter((coverType) => coverType !== DEFAULT_FORMATION_COVER_TYPE),
  ];

  const options: Array<FormationPreviewOption & { reference: string }> = [];
  for (const coverType of coverTypes) {
    const resolved = Array.from({ length: squadSize }, (_, index) =>
      resolveSquadFormation(squad, formationData, index + 1, coverType, false, weapon),
    );
    const reference = resolved.find(Boolean)?.reference;
    if (!reference) continue;

    // Most cover types share the default formation, show them as one option.
    const existing = options.find((option) => option.reference === reference);
    if (existing) {
      existing.coverTypes.push(coverType);
      continue;
    }
    options.push({ reference, coverTypes: [coverType], layouts: resolved.map(toLayout) });
  }

  if (!options.length) return null;
  return {
    squadSize,
    options: options.map(({ coverTypes, layouts }) => ({ coverTypes, layouts })),
  };
};
