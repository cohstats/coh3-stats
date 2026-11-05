/**
 * Read the cumulative, auto-applied veterancy modifiers already mapped from
 * sbps.json + veterancy.json. Keep these separate from manual custom modifiers.
 *
 * This implements the modifiers understood by the DPS calculator; other
 * effects (sight, movement, abilities, special payloads, etc.) are omitted.
 */
type VetModifier = { id: string; value: number };
type VetRank = {
  exp?: number;
  screenName?: string;
  modifiers?: VetModifier[];
};
type VeterancyCarrier = {
  veterancyLevel?: number;
  sbps?: {
    veterancyInfo?: {
      one?: VetRank;
      two?: VetRank;
      three?: VetRank;
      four?: VetRank;
    };
  };
};

export type DpsVeterancyEffects = {
  accuracyMultiplier: number;
  movingAccuracyMultiplier: number;
  damageMultiplier: number;
  damageAddition: number;
  receivedAccuracyMultiplier: number;
  receivedDamageMultiplier: number;
  penetrationMultiplier: number;
  attackTimeMultiplier: number;
  burstDurationMultiplier: number;
  burstRateMultiplier: number;
  healthAddition: number;
  rangeMultiplier: number;
  rangeAddition: number;
};

const neutral = (): DpsVeterancyEffects => ({
  accuracyMultiplier: 1,
  movingAccuracyMultiplier: 1,
  damageMultiplier: 1,
  damageAddition: 0,
  receivedAccuracyMultiplier: 1,
  receivedDamageMultiplier: 1,
  penetrationMultiplier: 1,
  attackTimeMultiplier: 1,
  burstDurationMultiplier: 1,
  burstRateMultiplier: 1,
  healthAddition: 0,
  rangeMultiplier: 1,
  rangeAddition: 0,
});

const levelKeys = ["one", "two", "three", "four"] as const;

export const getMaxDpsVeterancyLevel = (unit?: VeterancyCarrier): number => {
  const ranks = unit?.sbps?.veterancyInfo;
  if (!ranks) return 0;
  // The older online patches do not have imported modifier data yet.
  // Do not offer buttons that appear to work but have no calculation effect.
  if (!levelKeys.some((key) => ranks[key]?.modifiers?.length)) return 0;
  let max = 0;
  for (const [index, key] of levelKeys.entries()) {
    const rank = ranks[key];
    if (rank && (rank.exp || rank.screenName || rank.modifiers?.length)) {
      max = index + 1;
    }
  }
  return max;
};

export const getDpsVeterancyEffects = (unit?: VeterancyCarrier): DpsVeterancyEffects => {
  const result = neutral();
  const info = unit?.sbps?.veterancyInfo;
  if (!info) return result;

  const requested = Math.floor(Number(unit?.veterancyLevel ?? 0));
  const level = Math.max(0, Math.min(requested, getMaxDpsVeterancyLevel(unit)));

  // MULT_ADD modifiers add together across ranks, then multiply with other
  // attack-time modifiers. E.g. -0.2 and -0.4 combine to 1 - 0.6 = 0.4,
  // not (1 - 0.2) * (1 - 0.4) = 0.48.
  let attackSpeedMultAddTotal = 0;

  // Reaching veterancy N means all modifiers from 1 through N are active.
  for (const key of levelKeys.slice(0, level)) {
    for (const modifier of info[key]?.modifiers ?? []) {
      const value = modifier.value;
      if (!Number.isFinite(value)) continue;

      switch (modifier.id) {
        case "WEAPON_ACCURACY_MODIFIER":
          result.accuracyMultiplier *= value;
          break;
        case "WEAPON_MOVING_ACCURACY_MODIFIER":
          result.movingAccuracyMultiplier *= value;
          break;
        case "WEAPON_DAMAGE_MODIFIER":
          result.damageMultiplier *= value;
          break;
        case "WEAPON_DAMAGE_ADDITION_MODIFIER":
          result.damageAddition += value;
          break;
        case "RECEIVED_ACCURACY_MODIFIER":
          result.receivedAccuracyMultiplier *= value;
          break;
        case "RECEIVED_DAMAGE_MODIFIER":
          result.receivedDamageMultiplier *= value;
          break;
        case "WEAPON_PENETRATION_MODIFIER":
          result.penetrationMultiplier *= value;
          break;
        case "WEAPON_OVERALL_ATTACK_SPEED":
          // In game data, e.g. 0.7 multiplies attack cycle timings,
          // which are tick-rounded by the existing weapon calculator.
          result.attackTimeMultiplier *= value;
          break;
        case "WEAPON_OVERALL_ATTACK_SPEED_MULT_ADD":
          // Sum these separately; apply the resulting multiplier after all ranks.
          attackSpeedMultAddTotal += value;
          break;
        case "WEAPON_BURST_DURATION_MODIFIER":
          result.burstDurationMultiplier *= value;
          break;
        case "WEAPON_BURST_RATE_OF_FIRE_MODIFIER":
          result.burstRateMultiplier *= value;
          break;
        case "HEALTH_MODIFIER_ADDITION":
          result.healthAddition += value;
          break;
        case "WEAPON_RANGE_MULTIPLICATION_MODIFIER":
          result.rangeMultiplier *= value;
          break;
        case "WEAPON_RANGE_MODIFIER":
          result.rangeAddition += value;
          break;
      }
    }
  }

  // Normal attack-time multipliers combine multiplicatively with the single
  // multiplier formed from the sum of all MULT_ADD values.
  result.attackTimeMultiplier *= 1 + attackSpeedMultAddTotal;
  return result;
};
