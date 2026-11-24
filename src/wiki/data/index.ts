import { WikiArticle } from "../wiki-types";
import weaponFiringCycle from "./articles/weapon-firing-cycle";
import rateOfFireVsAttackSpeed from "./articles/rate-of-fire-vs-attack-speed";
import attackSpeedBuffExamples from "./articles/attack-speed-buff-examples";
import accuracyAndTargetSize from "./articles/accuracy-and-target-size";
import shotPlacementArmourAndDamageSpread from "./articles/shot-placement-armour-and-damage-spread";
import scatter from "./articles/scatter";
import terrainAndProjectileFlight from "./articles/terrain-and-projectile-flight";
import unitExperienceGains from "./articles/unit-experience-gains";

/** Every wiki article, register new ones here. The order doesn't matter, `order` does. */
export const WIKI_ARTICLES: WikiArticle[] = [
  weaponFiringCycle,
  rateOfFireVsAttackSpeed,
  attackSpeedBuffExamples,
  accuracyAndTargetSize,
  shotPlacementArmourAndDamageSpread,
  scatter,
  terrainAndProjectileFlight,
  unitExperienceGains,
];
