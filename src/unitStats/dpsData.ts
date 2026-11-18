import config from "../../config";
import { mapCustomizableUnit, createDefaultCustomModifiers } from "./dpsCommon";
import { isFinalStandUnit } from "./finalStand";
import type { CustomizableUnit } from "./dpsCommon";
import type { EbpsType } from "./mappingEbps";
import type { SbpsType } from "./mappingSbps";
import type { WeaponType } from "./mappingWeapon";
import type { UpgradesType } from "./mappingUpgrades";
import type { AbilitiesType } from "./mappingAbilities";
import type { FormationData } from "./mappingFormations";

/** The picker needs display information, not a fully initialized calculator unit. */
export type DpsUnitOption = Pick<
  CustomizableUnit,
  | "id"
  | "path"
  | "label"
  | "value"
  | "screen_name"
  | "description"
  | "image"
  | "type_icon"
  | "icon_name"
  | "unit_type"
  | "faction"
> & {
  hasWeapons: boolean;
  infantryTarget: boolean;
};

export interface DpsData {
  patch: string;
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  upgradesData: UpgradesType[];
  abilitiesData: AbilitiesType[];
  formationData: FormationData;
  unitOptions: DpsUnitOption[];
}

export const EMPTY_DPS_DATA: DpsData = {
  patch: config.latestPatch,
  weaponData: [],
  sbpsData: [],
  ebpsData: [],
  upgradesData: [],
  abilitiesData: [],
  formationData: {},
  unitOptions: [],
};

export const normalizeDpsPatch = (patch = "latest") =>
  patch === "latest" ? config.latestPatch : patch;

export const filterDpsUnitOptions = (
  options: DpsUnitOption[],
  factions: string[] = [],
  showFinalStand = false,
  requireWeapons = true,
) =>
  options.filter(
    (unit) =>
      unit.type_icon !== "" &&
      unit.faction !== "british" &&
      (showFinalStand || !isFinalStandUnit(unit)) &&
      (factions.length === 0 || factions.includes(unit.faction)) &&
      (!requireWeapons || unit.hasWeapons),
  );

const requests = new Map<string, Promise<DpsData>>();

/** Both views and repeated patch selections share the same compact response. */
export const fetchDpsData = (patch = "latest"): Promise<DpsData> => {
  const key = normalizeDpsPatch(patch);
  let request = requests.get(key);
  if (!request) {
    const suffix = typeof DecompressionStream === "undefined" ? ".json" : "";
    // A deployment can change mapping code without changing the game patch.
    // Keep CDN responses tied to the page's build, rather than serving older mappings.
    const buildId = (globalThis as typeof globalThis & { __NEXT_DATA__?: { buildId: string } })
      .__NEXT_DATA__?.buildId;
    const query = buildId ? `?build=${encodeURIComponent(buildId)}` : "";
    request = fetch(`/api/dps-data/${encodeURIComponent(key)}${suffix}${query}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Failed to load DPS data for patch ${key}`);
        if (response.headers?.get("content-type")?.startsWith("application/gzip")) {
          if (!response.body) throw new Error(`Empty DPS data for patch ${key}`);
          const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
          return (await new Response(stream).json()) as DpsData;
        }
        // Plain JSON also permits an older browser or a previously cached response.
        return (await response.json()) as DpsData;
      })
      .catch((error) => {
        requests.delete(key);
        throw error;
      });
    requests.set(key, request);
  }
  return request;
};

export const createDpsUnitCatalog = (data: DpsData) => {
  const squads = new Map<string, SbpsType>();
  for (const squad of data.sbpsData) {
    // Preserve Array.find's first-match behavior if a dataset contains duplicate IDs.
    if (!squads.has(squad.id)) squads.set(squad.id, squad);
  }
  const units = new Map<string, CustomizableUnit>();

  const getUnit = (id: string): CustomizableUnit | undefined => {
    let unit = units.get(id);
    if (!unit) {
      const squad = squads.get(id);
      if (!squad) return undefined;
      unit = mapCustomizableUnit(
        squad,
        data.ebpsData,
        data.weaponData,
        data.upgradesData,
        data.abilitiesData,
      );
      units.set(id, unit);
    }
    return unit;
  };

  const createUnit = (id: string): CustomizableUnit | undefined => {
    const unit = getUnit(id);
    if (!unit) return undefined;
    return {
      ...unit,
      weapon_member: unit.weapon_member.map((weapon) => ({ ...weapon })),
      def_weapon_member: unit.def_weapon_member.map((weapon) => ({ ...weapon })),
      custom_modifiers: createDefaultCustomModifiers(),
    };
  };

  return { data, unitOptions: data.unitOptions, getUnit, createUnit };
};

export type DpsUnitCatalog = ReturnType<typeof createDpsUnitCatalog>;
