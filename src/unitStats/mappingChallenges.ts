// type description of mapped data

import config from "../../config";
import { resolveLocstring } from "./locstring";
import { traverseTree } from "./unitStatsLib";

// Need to be extended by all required fields
type ChallengesType = {
  id: string;
  name: string;
  description: string;
  tip: string;
  counters: {
    sources: string[];
    targets: string[];
    spawnee: string[];
    research: string[];
  };
  // Merit reward value.
  reward: number;
};

// type RequirementOperator = 'and' | 'or' | 'not' | 'none' | 'equal' | 'greaterthan' | 'greaterthanequal' | 'inrange' | 'in'

let challengesDaily: ChallengesType[];
let challengesWeekly: ChallengesType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapChallengesData = (filename: string, subtree: any) => {
  const challenge: ChallengesType = {
    id: filename,
    name: "",
    description: "",
    tip: "",
    counters: {
      targets: [],
      sources: [],
      spawnee: [],
      research: [],
    },
    reward: 0,
  };

  mapChallengeBag(subtree, challenge);

  return challenge;
};

const mapChallengeBag = (root: any, challenge: ChallengesType) => {
  const challengeBag = root.challenge_bag;

  challenge.name = resolveLocstring(challengeBag.name) || "";
  challenge.description = resolveLocstring(challengeBag.description) || "";
  challenge.tip = resolveLocstring(challengeBag.tip) || "";

  /* --------- REWARD SECTION --------- */
  challenge.reward = parseInt(
    challengeBag.reward.item_bundle.instance_reference
      .split("/")
      .slice(-1)[0]
      .split("_")
      .slice(-1)[0] || 0,
  );

  /* --------- REQUIREMENTS SECTION --------- */
  // const requirements = challengeBag.requirement.requirements;
  // for (const reqItem of requirements) {
  //   // const reqOperator = reqItem.requirement.operator;
  //   const reqValues = reqItem.requirement.values; // Array of value requirements.
  // }

  /* --------- COUNTERS SECTION --------- */
  for (const cItem of challengeBag.counters) {
    const triggerRules = cItem.counter.trigger_rules;
    for (const trRule of triggerRules) {
      const ruleReqValues = trRule.rule.requirement.values;
      const ruleReqReq = trRule.rule.requirement.requirements;

      for (const rrVal of ruleReqValues) {
        // Check the template reference value.
        const valTempRef = rrVal.value_requirement.template_reference.value;

        switch (valTempRef) {
          // Ignore for now.
          case "challenges\\requirement_values\\constant\\result":
            break;
          // Ignore these for now.
          case "challenges\\requirement_values\\dynamic\\result":
            break;
          // Important step to find source / target squad ids.
          case "challenges\\requirement_values\\dynamic\\squadtype":
          case "challenges\\requirement_values\\dynamic\\entitytype":
            {
              const firstReqVal = ruleReqValues[0].value_requirement.value;
              const slicedSourceValues = ruleReqValues.slice(1);

              for (const rrVal of slicedSourceValues) {
                // Check if contains an instance_reference.
                if (rrVal.value_requirement.value?.instance_reference) {
                  const squadId = rrVal.value_requirement.value.instance_reference
                    .split("/")
                    .slice(-1)[0];

                  switch (firstReqVal) {
                    case "Source":
                      challenge.counters.sources.push(squadId);
                      break;
                    case "Target":
                      challenge.counters.targets.push(squadId);
                      break;
                    case "Spawnee":
                      challenge.counters.spawnee.push(squadId);
                      break;
                    default:
                      break;
                  }
                }
              }
            }
            break;
          // Skip these as the previous case deals with those.
          case "challenges\\requirement_values\\constant\\squadtype":
          case "challenges\\requirement_values\\constant\\entitytype":
            break;
          case "challenges\\requirement_values\\dynamic\\upgradetype":
            {
              const slicedSourceValues = ruleReqValues.slice(1);

              for (const rrVal of slicedSourceValues) {
                // Check if contains an instance_reference.
                if (rrVal.value_requirement.value?.instance_reference) {
                  const upgradeId = rrVal.value_requirement.value.instance_reference
                    .split("/")
                    .slice(-1)[0];

                  challenge.counters.research.push(upgradeId);
                }
              }
            }
            break;
          // Skip these as the previous case deals with those.
          case "challenges\\requirement_values\\constant\\upgradetype":
            break;
        }
      }

      for (const rrReq of ruleReqReq) {
        // TODO: check how to handle this case. For example "d053_air_support" has an instance_reference.
        if (rrReq.requirement_instance) {
          continue;
        }

        // Check the template reference value.
        const reqTempRef = rrReq.requirement.template_reference.value;

        switch (reqTempRef) {
          // Ignore for now.
          case "challenges\\requirement_values\\constant\\result":
            break;
          // Ignore these for now.
          case "challenges\\requirement_values\\dynamic\\result":
            break;
          // Important step to find source / target squad ids.
          case "challenges\\requirement_values\\dynamic\\squadtype":
          case "challenges\\requirement_values\\dynamic\\entitytype":
            {
              const firstReqVal = ruleReqValues[0].value_requirement.value;
              const slicedSourceValues = ruleReqValues.slice(1);

              for (const rrVal of slicedSourceValues) {
                // Check if contains an instance_reference.
                if (rrVal.value_requirement.value?.instance_reference) {
                  const squadId = rrVal.value_requirement.value.instance_reference
                    .split("/")
                    .slice(-1)[0];

                  switch (firstReqVal) {
                    case "Source":
                      challenge.counters.sources.push(squadId);
                      break;
                    case "Target":
                      challenge.counters.targets.push(squadId);
                      break;
                    case "Spawnee":
                      challenge.counters.spawnee.push(squadId);
                      break;
                    default:
                      break;
                  }
                }
              }
            }
            break;
          // Skip these as the previous case deals with those.
          case "challenges\\requirement_values\\constant\\squadtype":
          case "challenges\\requirement_values\\constant\\entitytype":
            break;
          case "challenges\\requirement_values\\dynamic\\upgradetype":
            {
              const slicedSourceValues = ruleReqValues.slice(1);

              for (const rrVal of slicedSourceValues) {
                // Check if contains an instance_reference.
                if (rrVal.value_requirement.value?.instance_reference) {
                  const upgradeId = rrVal.value_requirement.value.instance_reference
                    .split("/")
                    .slice(-1)[0];

                  challenge.counters.research.push(upgradeId);
                }
              }
            }
            break;
          // Skip these as the previous case deals with those.
          case "challenges\\requirement_values\\constant\\upgradetype":
            break;
        }
      }
    }
  }

  // console.group("Challenge:", challenge.id);
  // console.log(challenge);
  // console.groupEnd();
};

// Calls the mapping for each entity and puts the result array into the exported
// SbpsData variable. This variable can be imported everywhere. this method is
// called after loading the JSON at build time.
const getDailyChallengeStats = async () => {
  if (challengesDaily) return challengesDaily;

  const myDailyChallenges = await fetch(
    config.getPatchDataUrl("daily_challenges_store_release.json"),
  );

  const root = await myDailyChallenges.json();

  const dailyChallengesAll: ChallengesType[] = [];

  // Extract from JSON
  const dailyChallengesSet = traverseTree(
    root,
    isChallengeBagContainer,
    mapChallengesData,
    "",
    "",
  );

  // Filter relevant objects
  dailyChallengesSet.forEach((item: ChallengesType) => {
    dailyChallengesAll.push(item);
  });

  setDailyChallengeStats(dailyChallengesAll);

  return dailyChallengesAll;
};

const isChallengeBagContainer = (key: string, obj: any) => {
  return Object.keys(obj).includes("challenge_bag");
};

//
const setDailyChallengeStats = (stats: ChallengesType[]) => {
  challengesDaily = stats;
};

/* ----------- Weekly challenges section ----------- */

const getWeeklyChallengeStats = async () => {
  if (challengesWeekly) return challengesWeekly;

  const myWeeklyChallenges = await fetch(
    config.getPatchDataUrl("weekly_challenges_store_release.json"),
  );

  const root = await myWeeklyChallenges.json();

  const weeklyChallengesAll: ChallengesType[] = [];

  // Extract from JSON
  const weeklyChallengesSet = traverseTree(
    root,
    isChallengeBagContainer,
    mapChallengesData,
    "",
    "",
  );

  // Filter relevant objects
  weeklyChallengesSet.forEach((item: ChallengesType) => {
    weeklyChallengesAll.push(item);
  });

  setWeeklyChallengeStats(weeklyChallengesAll);

  return weeklyChallengesAll;
};

const setWeeklyChallengeStats = (stats: ChallengesType[]) => {
  challengesWeekly = stats;
};

export {
  challengesDaily,
  challengesWeekly,
  setDailyChallengeStats,
  setWeeklyChallengeStats,
  getWeeklyChallengeStats,
  getDailyChallengeStats,
};
export type { ChallengesType };
