import type { WeaponStatsType } from "./mappingWeapon";
import type { CustomModifier } from "./dpsCommon";

/** Generic formation coordinates are provisional metres until the game's squad layouts are parsed. */
export type ScatterModel = { id: number; x: number; y: number; enabled: boolean };

export type ScatterDpsOptions = {
  models: ScatterModel[];
  targetModelId: number | null;
  /** Ground attack: an arbitrary point is aimed at, with no direct accuracy hit. */
  groundTarget?: { x: number; y: number } | null;
  /** Bearing from the formation centre towards the gunner: 0 right, 90 up. */
  gunnerAngleDeg: number;
  /** Number of scatter outcomes sampled for each missed shot (square midpoint grid). */
  samplesPerShot: number;
  /** Target is in fog of war: use this weapon's FOW scatter multipliers. */
  inFogOfWar?: boolean;
};

export const SCATTER_SAMPLE_COUNTS = [144, 576, 2025] as const;

/**
 * Incremental target accuracy is applied once per OTHER active model close to
 * the intended target. The radius is interpolated from the weapon's near/mid/far
 * search-radius fields by the caller, using its effective weapon range.
 * The bonus is exponential (multiplier ^ nearby models), as shown on the weapon card.
 */
export const getIncrementalTargetAccuracyMultiplier = (
  weapon: WeaponStatsType,
  searchRadius: number,
  models: readonly ScatterModel[],
  targetModelId: number | null,
): number => {
  const perModel = weapon.burst_incremental_target_table_accuracy_multiplier;
  if (
    !weapon.burst_can_burst ||
    !Number.isFinite(perModel) ||
    perModel <= 0 ||
    !Number.isFinite(searchRadius) ||
    searchRadius <= 0
  )
    return 1;

  const target = models.find((model) => model.id === targetModelId && model.enabled);
  if (!target) return 1;

  const radiusSquared = searchRadius * searchRadius;
  let nearbyModels = 0;
  for (const model of models) {
    // The original target never grants a bonus, and disabled models do not count.
    if (!model.enabled || model.id === target.id) continue;
    const dx = model.x - target.x;
    const dy = model.y - target.y;
    if (dx * dx + dy * dy <= radiusSquared) nearbyModels++;
  }
  return Math.pow(perModel, nearbyModels);
};

/** Only shapes whose affected models can be located in the formation editor. */
export const hasScatterAoe = (weapon: WeaponStatsType): boolean =>
  ((weapon.aoe_shape === "circle" || weapon.aoe_shape === "unknown") &&
    weapon.aoe_outer_radius > 0) ||
  (weapon.aoe_shape === "rectangle" && weapon.aoe_outer_length > 0 && weapon.aoe_width > 0);

type Point = { x: number; y: number };

/** A rectangle begins at impact and extends forward along the shot, centred laterally. */
export const getRectangularAoeCorners = (
  impact: Point,
  length: number,
  width: number,
  gunnerAngleDeg: number,
  scatterAngle = 0,
): Point[] => {
  const bearing = (gunnerAngleDeg * Math.PI) / 180;
  const forwardX = -Math.cos(bearing + scatterAngle);
  const forwardY = -Math.sin(bearing + scatterAngle);
  const sideX = -forwardY;
  const sideY = forwardX;
  const halfWidth = width / 2;
  const nearLeft = { x: impact.x - sideX * halfWidth, y: impact.y - sideY * halfWidth };
  const nearRight = { x: impact.x + sideX * halfWidth, y: impact.y + sideY * halfWidth };
  return [
    nearLeft,
    nearRight,
    { x: nearRight.x + forwardX * length, y: nearRight.y + forwardY * length },
    { x: nearLeft.x + forwardX * length, y: nearLeft.y + forwardY * length },
  ];
};

/** Shared geometry for scatter DPS and the max-range formation preview. */
export const getScatterBand = (
  weapon: WeaponStatsType,
  distance: number,
  isMoving = false,
  scatterMultiplier = 1,
  inFogOfWar = false,
) => {
  const movingAngle = isMoving ? weapon.scatter_moving_scatter_angle_multiplier : 1;
  const movingDistance = isMoving ? weapon.scatter_moving_scatter_distance_multiplier : 1;
  // Missing FOW data is neutral, rather than assuming every gun uses 1.25.
  const fogAngle = inFogOfWar ? (weapon.scatter_fow_angle_multiplier ?? 1) : 1;
  const fogDistance = inFogOfWar ? (weapon.scatter_fow_distance_multiplier ?? 1) : 1;
  const vetScatter = Math.max(0, scatterMultiplier);
  const angleWidth =
    (Math.max(0, weapon.scatter_angle_scatter * movingAngle * fogAngle * vetScatter) * Math.PI) /
    180;
  const scatterSpan = Math.max(
    0,
    Math.min(
      weapon.scatter_distance_scatter_max,
      distance * weapon.scatter_distance_scatter_ratio,
    ) *
      movingDistance *
      fogDistance *
      vetScatter,
  );
  const offset = weapon.scatter_distance_scatter_offset;
  const minRange = Math.max(0, distance - scatterSpan * (1 - offset));
  const maxRange = Math.max(minRange, distance + scatterSpan * (1 + offset));
  return { minRange, maxRange, angleWidth };
};

/** Impact in world metres, relative to the target. Gunner bearing points away from the target. */
export const getScatterImpactOffset = (
  distance: number,
  radius: number,
  angle: number,
  gunnerAngleDeg: number,
) => {
  const gunnerAngle = (gunnerAngleDeg * Math.PI) / 180;
  const forwardX = -Math.cos(gunnerAngle);
  const forwardY = -Math.sin(gunnerAngle);
  const lateralX = -forwardY;
  const lateralY = forwardX;
  const longitudinal = radius * Math.cos(angle) - distance;
  const lateral = radius * Math.sin(angle);
  return {
    x: longitudinal * forwardX + lateral * lateralX,
    y: longitudinal * forwardY + lateral * lateralY,
  };
};

export type ScatterShotInputs = ScatterDpsOptions & {
  weapon: WeaponStatsType;
  distance: number;
  isMoving: boolean;
  directHitChance: number;
  /** Expected direct-hit damage including penetration (uncapped fallback). */
  directDamage: number;
  /** Modified HP of one selected defender model. Omitted for generic formations. */
  modelHitpoints?: number;
  /** Damage on successful direct penetration, after damage modifiers. */
  directFullDamage?: number;
  /** Direct penetration probability, before averaging hit/deflection outcomes. */
  directPenetrationChance?: number;
  /** Damage fraction on a failed direct penetration (zero when not enabled). */
  directDeflectionMultiplier?: number;
  /** Damage before AoE falloff/penetration, including applicable modifiers. */
  splashDamage: number;
  targetArmor: number;
  splashPenetrationMultiplier: number;
  /** Manual attacker penetration adjustment; applied to AoE penetration per model. */
  splashPenetrationModifier?: CustomModifier;
  /** Applied to both angular and longitudinal scatter, from attacking-unit veterancy. */
  scatterMultiplier?: number;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** The game's near/mid/far multipliers, interpolated by impact distance. */
const interpolateFalloff = (
  distance: number,
  weapon: WeaponStatsType,
  near: number,
  mid: number,
  far: number,
): number => {
  const n = weapon.aoe_distance_near;
  const m = weapon.aoe_distance_mid;
  const f = weapon.aoe_distance_far;
  if (distance <= n) return near;
  if (distance < m && m > n) return near + ((mid - near) * (distance - n)) / (m - n);
  if (distance <= m) return mid;
  if (distance < f && f > m) return mid + ((far - mid) * (distance - m)) / (f - m);
  return far;
};

/** Midpoints of each angle/distance bucket; each of N×N outcomes has equal weight. */
type ScatterSamples = { radial: Float64Array; cos: Float64Array; sin: Float64Array };
const scatterSampleCache = new Map<string, ScatterSamples>();
const getScatterSamples = (count: number, angleWidth: number): ScatterSamples => {
  const side = Math.max(1, Math.round(Math.sqrt(count)));
  const key = `${side}:${angleWidth}`;
  const cached = scatterSampleCache.get(key);
  if (cached) return cached;

  const actualCount = side * side;
  const radial = new Float64Array(actualCount);
  const cos = new Float64Array(actualCount);
  const sin = new Float64Array(actualCount);
  let index = 0;
  for (let distanceIndex = 0; distanceIndex < side; distanceIndex++) {
    const distanceFraction = (distanceIndex + 0.5) / side;
    for (let angleIndex = 0; angleIndex < side; angleIndex++) {
      const theta = ((angleIndex + 0.5) / side - 0.5) * angleWidth;
      radial[index] = distanceFraction;
      cos[index] = Math.cos(theta);
      sin[index] = Math.sin(theta);
      index++;
    }
  }

  if (scatterSampleCache.size > 100) scatterSampleCache.clear();
  const result = { radial, cos, sin };
  scatterSampleCache.set(key, result);
  return result;
};

/** Per-model outcomes for one shot from the chosen preview weapon, at the supplied range. */
export type ScatterModelShotStats = {
  id: number;
  /** Probability of receiving positive HP damage, including direct or splash damage. */
  hitChance: number;
  /** Expected HP removed from this model by one shot, with any model HP cap. */
  averageDamage: number;
  /** Single-shot kill probability; null for generic formations without a model HP value. */
  killChance: number | null;
};

export type ScatterShotDetails = {
  totalExpectedDamage: number;
  models: ScatterModelShotStats[];
};

/**
 * Expected HP damage across a fixed squad formation from one shot.
 *
 * A successful accuracy roll damages the selected model if it is active, with
 * splash on the nearest other active models. A disabled targeted model is an
 * aiming reference only: its direct damage is excluded and it uses no AoE cap
 * slot. Ground attack always scatters and has no direct-hit probability.
 *
 * No deaths, retargeting, cover collisions, obstacles or repositioning are simulated.
 * The optional detail collector is used by formation hover tooltips; the DPS
 * graph uses the same calculation without allocating per-model statistics.
 */
const calculateScatterShot = (
  input: ScatterShotInputs,
  collectDetails: boolean,
): ScatterShotDetails => {
  const { weapon, distance, isMoving, models, targetModelId } = input;
  const active = models.filter((model) => model.enabled);
  const selected = models.find((model) => model.id === targetModelId);
  const aim = targetModelId === null ? input.groundTarget : selected;
  const stats = collectDetails
    ? new Map<number, ScatterModelShotStats>(
        models.map((model) => [
          model.id,
          {
            id: model.id,
            hitChance: 0,
            averageDamage: 0,
            killChance: input.modelHitpoints === undefined ? null : 0,
          },
        ]),
      )
    : undefined;
  const finish = (totalExpectedDamage: number): ScatterShotDetails => ({
    totalExpectedDamage,
    models: stats ? [...stats.values()] : [],
  });
  if (!aim || !active.length) return finish(0);

  // Ground attack skips the accuracy roll entirely, even for nominally accurate guns.
  const accuracy = targetModelId === null ? 0 : clamp01(input.directHitChance);
  const hasSplash = hasScatterAoe(weapon);
  const isRectangle = weapon.aoe_shape === "rectangle";
  const cap =
    weapon.aoe_damage_max_member > 0 ? Math.floor(weapon.aoe_damage_max_member) : active.length;
  const armor = Math.max(0.001, input.targetArmor);
  const modelHitpoints =
    input.modelHitpoints === undefined ? Infinity : Math.max(0, input.modelHitpoints);
  const gunnerAngle = (input.gunnerAngleDeg * Math.PI) / 180;
  const forwardX = -Math.cos(gunnerAngle);
  const forwardY = -Math.sin(gunnerAngle);
  const perpendicularX = -forwardY;
  const perpendicularY = forwardX;

  let expectedDamage = 0;
  const observe = (id: number, outcomeWeight: number, damage: number, damageChance: number) => {
    const expected = outcomeWeight * damage * damageChance;
    expectedDamage += expected;
    const stat = stats?.get(id);
    if (stat && damage > 0 && damageChance > 0) {
      stat.averageDamage += expected;
      stat.hitChance += outcomeWeight * damageChance;
      if (stat.killChance !== null && modelHitpoints > 0 && damage >= modelHitpoints) {
        stat.killChance += outcomeWeight * damageChance;
      }
    }
  };

  /** Select by physical distance FIRST, then apply AoE damage and penetration. */
  const splashAt = (
    x: number,
    y: number,
    weight: number,
    skipId?: number,
    scatterCos = 1,
    scatterSin = 0,
  ) => {
    if (!hasSplash || cap <= 0 || weight <= 0) return;
    const radiusSq = weapon.aoe_outer_radius * weapon.aoe_outer_radius;
    const shotX = forwardX * scatterCos + perpendicularX * scatterSin;
    const shotY = forwardY * scatterCos + perpendicularY * scatterSin;
    const hits: Array<{ distanceSq: number; id: number }> = [];
    for (const model of active) {
      if (model.id === skipId) continue;
      const dx = model.x - x;
      const dy = model.y - y;
      const distanceSq = dx * dx + dy * dy;
      if (isRectangle) {
        const forwardDistance = dx * shotX + dy * shotY;
        const sidewaysDistance = -dx * shotY + dy * shotX;
        if (
          forwardDistance >= -1e-9 &&
          forwardDistance <= weapon.aoe_outer_length + 1e-9 &&
          Math.abs(sidewaysDistance) <= weapon.aoe_width / 2 + 1e-9
        ) {
          hits.push({ distanceSq, id: model.id });
        }
      } else if (distanceSq <= radiusSq) {
        hits.push({ distanceSq, id: model.id });
      }
    }
    hits.sort((a, b) => a.distanceSq - b.distanceSq || a.id - b.id);
    // A *living* direct-hit target consumes one cap slot. Disabled targets
    // are not part of the formation, so they never consume a damage slot.
    const available = Math.max(0, cap - (skipId === undefined ? 0 : 1));
    for (let i = 0; i < Math.min(available, hits.length); i++) {
      const radius = Math.sqrt(hits[i].distanceSq);
      const falloff = isRectangle
        ? weapon.aoe_damage_near
        : interpolateFalloff(
            radius,
            weapon,
            weapon.aoe_damage_near,
            weapon.aoe_damage_mid,
            weapon.aoe_damage_far,
          );
      const aoeAccuracy = isRectangle
        ? weapon.aoe_accuracy_near
        : interpolateFalloff(
            radius,
            weapon,
            weapon.aoe_accuracy_near,
            weapon.aoe_accuracy_mid,
            weapon.aoe_accuracy_far,
          );
      let aoePenetration =
        (isRectangle
          ? weapon.aoe_penetration_near
          : interpolateFalloff(
              radius,
              weapon,
              weapon.aoe_penetration_near,
              weapon.aoe_penetration_mid,
              weapon.aoe_penetration_far,
            )) * input.splashPenetrationMultiplier;
      const modifier = input.splashPenetrationModifier;
      if (modifier?.enabled) {
        const value = Number.isFinite(modifier.value) ? modifier.value : 0;
        if (modifier.type === "percentage") aoePenetration *= 1 + value / 100;
        else if (modifier.type === "absolute") aoePenetration = value;
        else if (modifier.type === "additive") aoePenetration += value;
      }
      aoePenetration = Math.max(0, aoePenetration);
      const penetrationChance =
        aoePenetration / armor < 0.03 ? 0 : clamp01(aoePenetration / armor);
      const splashOnHit = Math.min(modelHitpoints, Math.max(0, input.splashDamage * falloff));
      observe(hits[i].id, weight, splashOnHit, clamp01(aoeAccuracy) * penetrationChance);
    }
  };

  // Cap each direct penetration and deflection outcome BEFORE averaging.
  // A shot that lands on a disabled model is still allowed to explode there,
  // but cannot register direct HP damage against that absent model.
  if (accuracy > 0) {
    if (selected?.enabled) {
      if (input.directPenetrationChance !== undefined) {
        const pen = clamp01(input.directPenetrationChance);
        const full = Math.min(
          modelHitpoints,
          Math.max(0, input.directFullDamage ?? input.directDamage),
        );
        const deflect = Math.min(
          modelHitpoints,
          Math.max(
            0,
            (input.directFullDamage ?? input.directDamage) *
              (input.directDeflectionMultiplier ?? 0),
          ),
        );
        observe(selected.id, accuracy, full, pen);
        observe(selected.id, accuracy, deflect, 1 - pen);
      } else {
        observe(
          selected.id,
          accuracy,
          Math.min(modelHitpoints, Math.max(0, input.directDamage)),
          1,
        );
      }
    }
    splashAt(aim.x, aim.y, accuracy, selected?.enabled ? selected.id : undefined);
  }

  if (!hasSplash || accuracy >= 1) return finish(expectedDamage);

  const { minRange, maxRange, angleWidth } = getScatterBand(
    weapon,
    distance,
    isMoving,
    input.scatterMultiplier ?? 1,
    input.inFogOfWar ?? false,
  );
  const side = Math.max(1, Math.round(Math.sqrt(input.samplesPerShot)));
  const count = side * side;
  const samples = getScatterSamples(count, angleWidth);
  const sampleWeight = (1 - accuracy) / count;
  for (let i = 0; i < count; i++) {
    const r = minRange + (maxRange - minRange) * samples.radial[i];
    const longitudinal = r * samples.cos[i] - distance;
    const lateral = r * samples.sin[i];
    const impactX = aim.x + longitudinal * forwardX + lateral * perpendicularX;
    const impactY = aim.y + longitudinal * forwardY + lateral * perpendicularY;
    splashAt(impactX, impactY, sampleWeight, undefined, samples.cos[i], samples.sin[i]);
  }
  return finish(expectedDamage);
};

/** Graph path: return the expected total damage without allocating per-model result objects. */
export const simulateExpectedScatterShot = (input: ScatterShotInputs): number =>
  calculateScatterShot(input, false).totalExpectedDamage;

/** Formation-editor hover path: same model and probabilities as the DPS graph. */
export const simulateScatterShotDetails = (input: ScatterShotInputs): ScatterShotDetails =>
  calculateScatterShot(input, true);
