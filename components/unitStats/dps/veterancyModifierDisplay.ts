/**
 * Present game property IDs without exposing their all-caps/underscore format.
 * Keep the full property name rather than shortening uncommon modifiers.
 */
export const humanizeVeterancyModifierId = (id: string): string =>
  id
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatNumber = (value: number): string => Number(value.toFixed(3)).toString();
const formatSigned = (value: number): string => `${value > 0 ? "+" : ""}${formatNumber(value)}`;
const formatPercent = (percent: number): string =>
  `${percent > 0 ? "+" : ""}${formatNumber(percent)}%`;

// These IDs are known to be multiplicative (1 = no change).
// Unknown properties retain their raw values rather than assuming their units.
const multiplierIds = new Set([
  "WEAPON_ACCURACY_MODIFIER",
  "WEAPON_MOVING_ACCURACY_MODIFIER",
  "WEAPON_DAMAGE_MODIFIER",
  "WEAPON_PENETRATION_MODIFIER",
  "WEAPON_BURST_DURATION_MODIFIER",
  "WEAPON_BURST_RATE_OF_FIRE_MODIFIER",
  "WEAPON_RANGE_MULTIPLICATION_MODIFIER",
  "RECEIVED_ACCURACY_MODIFIER",
  "RECEIVED_DAMAGE_MODIFIER",
]);

const additionIds = new Set([
  "WEAPON_DAMAGE_ADDITION_MODIFIER",
  "HEALTH_MODIFIER_ADDITION",
  "WEAPON_RANGE_MODIFIER",
]);

/**
 * Match Relic's attack-speed descriptions: a 0.5 attack-time multiplier is
 * displayed as +50% attack speed, not x0.5. This is a display convention;
 * do not replace the duration multiplier used by the DPS calculation.
 */
export const formatVeterancyAttackSpeed = (attackTimeMultiplier: number): string =>
  formatPercent((1 - attackTimeMultiplier) * 100);

export const formatVeterancyModifierValue = (id: string, value: number): string => {
  if (!Number.isFinite(value)) return String(value);

  switch (id.toUpperCase()) {
    case "WEAPON_OVERALL_ATTACK_SPEED":
      return formatVeterancyAttackSpeed(value);
    case "WEAPON_OVERALL_ATTACK_SPEED_MULT_ADD":
      // MULT_ADD contains an additive offset from 1 (e.g. -0.2 -> x0.8).
      return formatVeterancyAttackSpeed(1 + value);
    default:
      if (multiplierIds.has(id.toUpperCase())) return formatPercent((value - 1) * 100);
      if (additionIds.has(id.toUpperCase())) return formatSigned(value);
      return formatNumber(value);
  }
};
