import { fetchLocstring } from "./locstring";
import { getWeaponStats } from "./mappingWeapon";
import { getEbpsStats } from "./mappingEbps";
import { getSbpsStats } from "./mappingSbps";
import { getDpsUpgrades } from "./mappingUpgrades";
import { getAbilitiesStats } from "./mappingAbilities";
import { getFormationData } from "./mappingFormations";
import { mapCustomizableUnit } from "./dpsCommon";
import { normalizeDpsPatch } from "./dpsData";
import type { DpsData, DpsUnitOption } from "./dpsData";

/** Only the server prepares picker metadata; full calculator units stay on demand. */
export const buildDpsUnitOptions = (data: Omit<DpsData, "unitOptions">): DpsUnitOption[] =>
  data.sbpsData.map((squad) => {
    const unit = mapCustomizableUnit(
      squad,
      data.ebpsData,
      data.weaponData,
      data.upgradesData,
      data.abilitiesData,
    );
    return {
      id: unit.id,
      path: unit.path,
      label: unit.label,
      value: unit.value,
      screen_name: unit.screen_name,
      description: unit.description,
      image: unit.image,
      type_icon: unit.type_icon,
      icon_name: unit.icon_name,
      unit_type: unit.unit_type,
      faction: unit.faction,
      hasWeapons: unit.weapon_member.length > 0,
      infantryTarget:
        unit.unit_type === "infantry" ||
        (unit.unit_type === "team_weapons" &&
          squad.loadout.some(({ type }) => /(?:^|[\\/])infantry[\\/]/.test(type))),
    };
  });

const requests = new Map<string, Promise<DpsData>>();
// An uncached old patch can be large. Avoid mapping several such patches concurrently.
let pending: Promise<unknown> = Promise.resolve();

export const getDpsData = (patch = "latest"): Promise<DpsData> => {
  const key = normalizeDpsPatch(patch);
  let request = requests.get(key);
  if (!request) {
    request = pending.then(async () => {
      // Keep the calculator's existing English game text.
      // Other pages' EBPS display workarounds are intentionally not applied here.
      await fetchLocstring("en");
      const [weaponData, ebpsData, sbpsData, upgradesData, abilitiesData, formationData] =
        await Promise.all([
          getWeaponStats(key),
          getEbpsStats(key),
          getSbpsStats(key, "en", { requireCompleteMetadata: true }),
          getDpsUpgrades(key),
          getAbilitiesStats(key),
          getFormationData(key),
        ]);
      const data = {
        patch: key,
        weaponData,
        ebpsData,
        sbpsData,
        upgradesData,
        abilitiesData,
        formationData,
      };
      return { ...data, unitOptions: buildDpsUnitOptions(data) };
    });
    pending = request.catch(() => undefined);
    requests.set(key, request);
    request.catch(() => requests.delete(key));
  }
  return request;
};
