import { WikiArticle } from "../wiki-types";
import weaponFiringCycle from "./articles/weapon-firing-cycle";
import rateOfFireVsAttackSpeed from "./articles/rate-of-fire-vs-attack-speed";
import attackSpeedBuffExamples from "./articles/attack-speed-buff-examples";
import accuracyAndTargetSize from "./articles/accuracy-and-target-size";
import shotPlacementArmourAndDamageSpread from "./articles/shot-placement-armour-and-damage-spread";
import scatter from "./articles/scatter";
import terrainAndProjectileFlight from "./articles/terrain-and-projectile-flight";
import unitExperienceGains from "./articles/unit-experience-gains";
import coverBasics from "./articles/cover-basics";
import coverVsWeaponTypes from "./articles/cover-vs-weapon-types";
import suppressionAndCover from "./articles/suppression-and-cover";
import garrisonCover from "./articles/garrison-cover";
import coverMicroTips from "./articles/cover-micro-tips";
import territoryCaptureRates from "./articles/territory-capture-rates";
import territoryCaptureTactics from "./articles/territory-capture-tactics";
import territoryCaptureMicroTips from "./articles/territory-capture-micro-tips";
import rankingTiers from "./articles/ranking-tiers";
import { WIKI_TIP_ARTICLES } from "../tips/wiki-tips";

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
  coverBasics,
  coverVsWeaponTypes,
  suppressionAndCover,
  garrisonCover,
  coverMicroTips,
  territoryCaptureRates,
  territoryCaptureTactics,
  territoryCaptureMicroTips,
  rankingTiers,
  // The "Game Tips" pages, filled from the in-game tips data, see `src/wiki/tips/wiki-tips.ts`.
  ...WIKI_TIP_ARTICLES,
];
