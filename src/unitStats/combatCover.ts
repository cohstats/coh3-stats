import type { WeaponStatsType } from "./mappingWeapon";

export type DirectionalCoverLine = { y: number; minX: number; maxX: number };
type Position = { x: number; y: number };

export const isLightOrHeavyCover = (cover: string) => cover === "light" || cover === "heavy";

export const usesProjectileImpactCover = (weapon: WeaponStatsType) =>
  Boolean(
    weapon.projectile_type &&
    weapon.projectile_type !== "none" &&
    !weapon.always_calculate_cover_from_shooting_position,
  );

/** Point-blank behaviour bypasses light/heavy cover through 10 m, never garrison. */
export const getEffectiveCoverType = (
  cover: string,
  weapon: WeaponStatsType,
  distance: number,
) => (isLightOrHeavyCover(cover) && weapon.behaviour_point_blank && distance <= 10 ? "" : cover);

/** Bearing points from the aim point towards the shooter, at the displayed firing range. */
export const getShooterPosition = (
  aim: Position,
  distance: number,
  bearingDeg: number,
): Position => {
  const radians = (bearingDeg * Math.PI) / 180;
  return { x: aim.x + Math.cos(radians) * distance, y: aim.y + Math.sin(radians) * distance };
};

/** Cover protects a model when the segment from the damage origin crosses the cover line. */
export const isProtectedByDirectionalCover = (
  line: DirectionalCoverLine,
  origin: Position,
  model: Position,
): boolean => {
  if ((origin.y - line.y) * (model.y - line.y) > 0) return false;
  const deltaY = model.y - origin.y;
  // Parallel shots, including a shot exactly along the line, do not cross it.
  if (Math.abs(deltaY) < 1e-9) return false;
  const fraction = (line.y - origin.y) / deltaY;
  const crossingX = origin.x + (model.x - origin.x) * fraction;
  return (
    fraction >= 0 &&
    fraction <= 1 &&
    crossingX >= line.minX - 1e-9 &&
    crossingX <= line.maxX + 1e-9
  );
};
