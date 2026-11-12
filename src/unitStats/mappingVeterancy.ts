// type description of mapped data

import config from "../../config";
import { traverseTree } from "./unitStatsLib";
import { fetchJsonWithLogging } from "./fetch-mappings-withLogs";

/**
 * The veterancy.json contains the custom property containers with the veterancy bonuses.
 * Available since data tag v3.0.0-3.
 *
 * The squads (sbps) reference them in `squad_veterancy_ext` ->
 * `veterancy_rank/custom_properties/custom_pbgid_properties` (id `VETERANCY_PBG_1`), e.g.
 * `custom_property_container/veterancy/american/infantry/riflemen/veterancy_1_riflemen`.
 * See `veterancyRef` in the sbps veterancyInfo.
 */
const VETERANCY_REF_PREFIX = "custom_property_container/veterancy";

type VeterancyType = {
  id: string; // filename -> eg. veterancy_1_engineer
  pbgid: number;
  /** The full instance reference, the same as is referenced from the sbps.
   * eg. custom_property_container/veterancy/american/infantry/engineer/veterancy_1_engineer */
  path: string;
  /** First folder - afrika_korps, american, british, german, common.
   * The root template_veterancy_container has the faction set to its id. */
  faction: string;
  /** `custom_float_properties` and `custom_int32_properties` -> id: value.
   * eg. RECEIVED_ACCURACY_MODIFIER: 0.85, WEAPON_OVERALL_ATTACK_SPEED: 1.1 */
  modifiers: Record<string, number>;
  /** `custom_bool_properties` -> id: value. eg. AUTO_APPLY_MODIFIERS: true */
  flags: Record<string, boolean>;
  /** `custom_pbgid_properties` -> id: instance reference. eg. ABILITY_PBG, UPGRADE_PBG_1 */
  pbgRefs: Record<string, string>;
};

// It's in format PATCH : DATA. The promise is cached, so concurrent callers
// (eg. getMappings + getSbpsStats) share a single fetch of veterancy.json.
const veterancyPatchData: Record<string, Promise<VeterancyType[]>> = {};

const mapCustomProperties = (propertyBag: any, veterancy: VeterancyType) => {
  if (!propertyBag) return;

  const numberProperties = [
    ...(propertyBag.custom_float_properties || []).map((x: any) => x.custom_float_property),
    ...(propertyBag.custom_int32_properties || []).map((x: any) => x.custom_int32_property),
  ];
  for (const prop of numberProperties) {
    if (!prop?.id) continue;
    veterancy.modifiers[prop.id] = Number(prop.value);
  }

  for (const item of propertyBag.custom_bool_properties || []) {
    const prop = item.custom_bool_property;
    if (!prop?.id) continue;
    veterancy.flags[prop.id] = String(prop.value).toLowerCase() === "true";
  }

  for (const item of propertyBag.custom_pbgid_properties || []) {
    const prop = item.custom_pbgid_property;
    if (!prop?.id || !prop.pbg?.instance_reference) continue;
    veterancy.pbgRefs[prop.id] = prop.pbg.instance_reference;
  }
};

// mapping a single entity of the json file. eg. veterancy_1_engineer.
const mapVeterancyData = (filename: string, subtree: any, jsonPath: string) => {
  // The root template_veterancy_container has an empty jsonPath.
  const relativePath = jsonPath ? `${jsonPath}/${filename}` : filename;

  const veterancy: VeterancyType = {
    id: filename,
    pbgid: subtree.pbgid || 0,
    path: `${VETERANCY_REF_PREFIX}/${relativePath}`,
    faction: relativePath.split("/")[0],
    modifiers: {},
    flags: {},
    pbgRefs: {},
  };

  mapCustomProperties(subtree.custom_property_bag, veterancy);

  return veterancy;
};

const isVeterancyContainer = (key: string, obj: any) => {
  return obj !== null && typeof obj === "object" && "custom_property_bag" in obj;
};

/**
 * Calls the mapping for each veterancy container. The result is cached per patch.
 * The veterancy.json doesn't contain any locstrings, so there is no locale.
 * @param patch Note: the veterancy.json is available only since data tag v3.0.0-3.
 */
const getVeterancyStats = async (patch = "latest"): Promise<VeterancyType[]> => {
  if (patch == config.latestPatch) patch = "latest";

  if (!veterancyPatchData[patch]) {
    veterancyPatchData[patch] = loadVeterancyStats(patch).catch((error) => {
      // Don't cache failures, allow a retry.
      delete veterancyPatchData[patch];
      throw error;
    });
  }

  return veterancyPatchData[patch];
};

const loadVeterancyStats = async (patch: string) => {
  const veterancyUrl = config.getPatchDataUrl("veterancy.json", patch);
  const root = await fetchJsonWithLogging(veterancyUrl, `veterancy.json for patch ${patch}`);

  const veterancySetAll: VeterancyType[] = [];

  for (const obj in root) {
    // The root template_veterancy_container is the container itself.
    if (isVeterancyContainer(obj, root[obj])) {
      veterancySetAll.push(mapVeterancyData(obj, root[obj], ""));
      continue;
    }

    const veterancySet = traverseTree(
      root[obj],
      isVeterancyContainer,
      (filename: string, subtree: any, jsonPath: string) =>
        mapVeterancyData(filename, subtree, jsonPath),
      obj,
      obj,
    );

    veterancySet.forEach((item: VeterancyType) => {
      veterancySetAll.push(item);
    });
  }

  return veterancySetAll;
};

/**
 * Finds the veterancy container by the instance reference used in sbps (`veterancyRef`).
 */
const getVeterancyByRef = (
  veterancyData: VeterancyType[],
  ref?: string,
): VeterancyType | undefined => {
  if (!ref) return undefined;
  return veterancyData.find((item) => item.path === ref);
};

export { getVeterancyStats, getVeterancyByRef };
export type { VeterancyType };
