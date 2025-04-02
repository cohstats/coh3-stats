import { fetchLocstring } from "./locstring";
import { getWeaponStats } from "./mappingWeapon";
import { getEbpsStats } from "./mappingEbps";
import { getSbpsStats } from "./mappingSbps";
import { getUpgradesStats } from "./mappingUpgrades";
import { getAbilitiesStats } from "./mappingAbilities";
import { getBattlegroupStats } from "./mappingBattlegroups";
import { ebpsWorkarounds } from "./workarounds";
import { getDailyChallengeStats, getWeeklyChallengeStats } from "./mappingChallenges";

const getMappings = async (locale = "en") => {
  // Locstring needs to be fetched first because it's used by the other mappings.

  const locstring = await fetchLocstring(locale);

  const [
    weaponData,
    ebpsData,
    sbpsData,
    upgradesData,
    abilitiesData,
    battlegroupData,
    dailyChallengesData,
    weeklyChallengesData,
  ] = await Promise.all([
    getWeaponStats("latest", locale),
    getEbpsStats("latest", locale),
    getSbpsStats("latest", locale),
    getUpgradesStats(locale),
    getAbilitiesStats("latest", locale),
    getBattlegroupStats(locale),
    getDailyChallengeStats(locale),
    getWeeklyChallengeStats(locale),
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
    dailyChallengesData,
    weeklyChallengesData,
  };
};

export { getMappings };
