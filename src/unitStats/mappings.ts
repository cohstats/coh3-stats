import { fetchLocstring } from "./locstring";
import { getWeaponStats } from "./mappingWeapon";
import { getEbpsStats } from "./mappingEbps";
import { getSbpsStats } from "./mappingSbps";
import { getUpgradesStats } from "./mappingUpgrades";
import { getAbilitiesStats } from "./mappingAbilities";
import { getBattlegroupStats } from "./mappingBattlegroups";
import { ebpsWorkarounds } from "./workarounds";

const getMappings = async () => {
  // Locstring needs to be fetched first because it's used by the other mappings.
  const locstring = await fetchLocstring();

  const [weaponData, ebpsData, sbpsData, upgradesData, abilitiesData, battlegroupData] =
    await Promise.all([
      getWeaponStats(),
      getEbpsStats(),
      getSbpsStats(),
      getUpgradesStats(),
      getAbilitiesStats(),
      getBattlegroupStats(),
    ]);

  for (const ebpsItem of ebpsData) {
    for (const [override, { predicate, mutator, validator }] of ebpsWorkarounds) {
      if (predicate(ebpsItem)) {
        mutator(ebpsItem);
        if (validator && !validator(ebpsItem)) {
          console.error(`Invalid item ${ebpsItem.id} after override ${override}`, ebpsItem);
          // throw new Error("Error during ebps workarounds");
        }
      }
    }
  }

  return {
    locstring,
    weaponData,
    ebpsData,
    sbpsData,
    upgradesData,
    abilitiesData,
    battlegroupData,
  };
};

export { getMappings };
