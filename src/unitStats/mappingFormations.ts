import config from "../../config";
import { fetchJsonWithLogging } from "./fetch-mappings-withLogs";

export type FormationGroup = "core" | "scout" | "left" | "right";
export type FormationCounts = Record<FormationGroup, number>;
export type FormationPoint = { x: number; y: number; facing: number };
export type FormationShape = { scale: number; spots: FormationPoint[] };
export type SquadFormationDefinition = {
  anchors: FormationShape;
  groups: Record<FormationGroup, FormationShape>;
};
export type FormationData = Record<string, SquadFormationDefinition>;
export type SquadFormationReferences = {
  distribution: Record<string, FormationCounts>;
  cover: Record<string, string>;
  movingCover: Record<string, string>;
};

const groups = {
  core: "core",
  scout: "scout",
  left: "left_flank",
  right: "right_flank",
} as const;
export const FORMATION_GROUPS = Object.keys(groups) as FormationGroup[];
const number = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const reference = (value: any): string =>
  typeof value?.instance_reference === "string"
    ? value.instance_reference.replace(/\\/g, "/")
    : "";

/** Keep the exported distribution separate from the effective runtime allocation. */
export const mapSquadFormationReferences = (extension: any): SquadFormationReferences => ({
  distribution: Object.fromEntries(
    Object.entries(extension.squad_distribution_table ?? {}).map(
      ([key, value]: [string, any]) => [
        key,
        Object.fromEntries(
          FORMATION_GROUPS.map((group) => [
            group,
            Math.max(0, Math.floor(number(value[`units_in_${groups[group]}`]))),
          ]),
        ) as FormationCounts,
      ],
    ),
  ),
  cover: Object.fromEntries(
    Object.entries(extension.cover_formation_table ?? {}).map(([key, value]) => [
      key,
      reference(value),
    ]),
  ),
  movingCover: Object.fromEntries(
    Object.entries(extension.moving_cover_formation_override_table ?? {}).map(([key, value]) => [
      key,
      reference(value),
    ]),
  ),
});

const resolve = (root: any, ref: string) =>
  ref
    .split("/")
    .slice(1)
    .reduce((value, key) => value?.[key], root);
const shape = (entry: any): FormationShape | undefined => {
  const bag = entry?.formation_bag;
  if (!Array.isArray(bag?.spots)) return undefined;
  return {
    scale: number(bag.scale, 1),
    spots: bag.spots.map(({ spot }: any) => ({
      x: number(spot?.pos_x),
      y: number(spot?.pos_y),
      facing: number(spot?.facing),
    })),
  };
};

export const mapFormationData = (squadRoot: any, formationRoot: any): FormationData => {
  const result: FormationData = {};
  const visit = (node: any, path: string[]) => {
    if (!node || typeof node !== "object") return;
    const bag = node.squad_formation_bag;
    if (bag) {
      const anchors = shape(resolve(formationRoot, reference(bag.squad_formation)));
      const elements = Object.fromEntries(
        FORMATION_GROUPS.map((group) => [
          group,
          shape(resolve(formationRoot, reference(bag[`element_${groups[group]}_formation`]))),
        ]),
      ) as Record<FormationGroup, FormationShape | undefined>;
      if (anchors && FORMATION_GROUPS.every((group) => elements[group])) {
        result[`squad_formations/${path.join("/")}`] = {
          anchors,
          groups: elements as Record<FormationGroup, FormationShape>,
        };
      }
      return;
    }
    for (const [key, child] of Object.entries(node)) visit(child, [...path, key]);
  };
  visit(squadRoot, []);
  return result;
};

const cache = new Map<string, Promise<FormationData>>();
/** Older patches may not publish formation files. Callers retain a labelled generic fallback. */
export const getFormationData = (patch = "latest"): Promise<FormationData> => {
  const key = patch === config.latestPatch ? "latest" : patch;
  if (!cache.has(key))
    cache.set(
      key,
      (async () => {
        try {
          const [squads, formations] = await Promise.all([
            fetchJsonWithLogging(
              config.getPatchDataUrl("squad_formations.json", key),
              `squad formations ${key}`,
            ),
            fetchJsonWithLogging(
              config.getPatchDataUrl("formations.json", key),
              `formations ${key}`,
            ),
          ]);
          return mapFormationData(squads, formations);
        } catch {
          return {};
        }
      })(),
    );
  return cache.get(key)!;
};
