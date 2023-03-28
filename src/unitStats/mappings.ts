import { fetchLocstring } from "./locstring";
import { getWeaponStats } from "./mappingWeapon";
import { getEbpsStats } from "./mappingEbps";
import { getSbpsStats } from "./mappingSbps";
import { getUpgradesStats } from "./mappingUpgrades";
import { getAbilitiesStats } from "./mappingAbilities";
import { getBattlegroupStats } from "./mappingBattlegroups";

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
