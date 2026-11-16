/**
 * Small, intentionally text-driven subset of the special veterancy payloads.
 *
 * The SBPS action tree is the authority for whether a special weapon-group
 * effect runs. Its formatted (English) rank description supplies the amount.
 * Damage against vehicles is the deliberate text-only exception: the game's
 * conditional-table effect isn't represented by a standard veterancy property.
 *
 * If a description no longer names the effect, do not invent a value.
 */
export type SpecialVeterancyModifier = { id: string; value: number };

type NumberNearLabel = { value: number; hasPercent: boolean };

const numericToken = /([+\-−]?\d+(?:[.,]\d+)?)\s*(%|percent\b)?/gi;

const sanitize = (text: string) =>
  text
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\\r\\n|\\[nr]/g, "\n")
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/[−–]/g, "-")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();

/**
 * Find the numeric value nearest the *named* effect, preferably in the same
 * clause. In a Sherman description, 80, 25 and 33 are all present; we must
 * associate 33 with "machine gun damage", not use the first numeric argument.
 */
const numberNearestTo = (
  text: string,
  label: RegExp,
  requirePercent: boolean,
): NumberNearLabel | undefined => {
  // Sentences and UI list entries can contain other, unrelated bonuses.
  const clauses = text
    .replace(/\bvs\.(?=\s+vehicles\b)/gi, "vs")
    .split(/[,;\n\r\u2022]|[.!](?=\s|$)/);
  for (const clause of clauses) {
    const labelMatch = label.exec(clause);
    label.lastIndex = 0;
    if (!labelMatch) continue;

    const tokens = Array.from(clause.matchAll(numericToken));
    const numbers = tokens
      .map((match) => ({
        value: Number(match[1].replace(",", ".")),
        hasPercent: Boolean(match[2]),
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
      }))
      .filter(
        (number) => Number.isFinite(number.value) && (!requirePercent || number.hasPercent),
      );
    if (!numbers.length) continue;

    const labelStart = labelMatch.index;
    const labelEnd = labelStart + labelMatch[0].length;
    const ranked = numbers
      .map((number) => ({
        ...number,
        gap:
          number.end <= labelStart
            ? labelStart - number.end
            : number.start >= labelEnd
              ? number.start - labelEnd
              : 0,
      }))
      .sort((a, b) => a.gap - b.gap);
    // If distant, the number may belong to an unrelated effect in this clause.
    if (ranked[0].gap > 45) continue;
    return { value: ranked[0].value, hasPercent: ranked[0].hasPercent };
  }
  return undefined;
};

const percentNear = (description: string, label: RegExp): number | undefined =>
  numberNearestTo(description, label, true)?.value;

/** Exported for regression checks against actual SBPS rank data. */
export const extractSpecialVeterancyModifiers = (
  squadEntityActionTree: string,
  formattedDescription: string,
): SpecialVeterancyModifier[] => {
  const result: SpecialVeterancyModifier[] = [];
  const description = sanitize(formattedDescription);
  if (!description) return result;

  const treeName =
    squadEntityActionTree.replace(/\\/g, "/").split("/").pop()?.toLowerCase() ?? "";

  // Main-gun accuracy payloads share this name pattern. Tiger and Panzer IV
  // omit "accuracy" from their branch names, so recognize those explicitly.
  if (
    /main_gun.*accuracy/.test(treeName) ||
    ["tiger_main_gun", "main_gun_panzer_iv"].includes(treeName)
  ) {
    const amount = percentNear(description, /\baccuracy\b/i);
    if (amount !== undefined) {
      result.push({ id: "WEAPON_MAIN_GUN_ACCURACY_MODIFIER", value: 1 + amount / 100 });
    }
  }
  if (/_mg_buff$/.test(treeName)) {
    const amount = percentNear(description, /\b(?:machine[ -]?guns?|mg)\s+damage\b/i);
    if (amount !== undefined) {
      result.push({ id: "WEAPON_MG_DAMAGE_MODIFIER", value: 1 + amount / 100 });
    }
  }
  if (/_flamethrower_damage$/.test(treeName)) {
    // This payload adds flat damage. Match its named amount independently
    // of any percentage bonuses elsewhere in the description.
    const nearby = numberNearestTo(description, /\bflamethrower\s+damage\b/i, false);
    const amount = nearby && !nearby.hasPercent ? nearby.value : undefined;
    if (amount !== undefined && Number.isFinite(amount)) {
      result.push({ id: "WEAPON_FLAMETHROWER_DAMAGE_ADDITION", value: amount });
    }
  }

  // The rare anti-vehicle bonus is intentionally recognized from text alone.
  // A percentage and a flat increase are distinct (e.g. '+40 damage' is flat).
  const vehicleBonus = numberNearestTo(
    description,
    /\bdamage\s+(?:against|vs\.?|to)\s+vehicles\b/i,
    false,
  );
  if (vehicleBonus) {
    result.push(
      vehicleBonus.hasPercent
        ? { id: "WEAPON_DAMAGE_VS_VEHICLES_MULTIPLIER", value: 1 + vehicleBonus.value / 100 }
        : { id: "WEAPON_DAMAGE_VS_VEHICLES_ADDITION", value: vehicleBonus.value },
    );
  }

  return result;
};
