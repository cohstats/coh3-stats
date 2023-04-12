import { fetchLocstring } from "./locstring";
import { getWeaponStats } from "./mappingWeapon";
import { getEbpsStats } from "./mappingEbps";
import { getSbpsStats } from "./mappingSbps";
import { getUpgradesStats } from "./mappingUpgrades";
import { getAbilitiesStats } from "./mappingAbilities";
import { getBattlegroupStats } from "./mappingBattlegroups";

const getMappings = async (patch = "latest") => {
  // Locstring needs to be fetched first because it's used by the other mappings.
  const locstring = await fetchLocstring(patch);

  console.log(locstring);

  const [weaponData, ebpsData, sbpsData, upgradesData, abilitiesData, battlegroupData] =
    await Promise.all([
      getWeaponStats(patch),
      getEbpsStats(patch),
      getSbpsStats(patch),
      getUpgradesStats(patch),
      getAbilitiesStats(patch),
      getBattlegroupStats(patch),
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
