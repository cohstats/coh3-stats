import { WeaponStatsType } from "../../../src/unitStats";
import {
  BASE_GRAVITY,
  PROJECTILE_LAUNCH_HEIGHT,
  MIN_PROJECTILE_SPEED_INCREMENT,
  DEFAULT_PROJECTILE_SPEED_INCREMENT,
} from "./types-and-constants";

const getProjectileImpactHeight = (weapon_bag: WeaponStatsType) =>
  weapon_bag.projectile_midair_detonation_height > 0
    ? weapon_bag.projectile_midair_detonation_height
    : 0;

const getBallisticDiscriminant = (
  distance: number,
  heightDelta: number,
  speed: number,
  gravity: number,
) => {
  return speed ** 4 - gravity * (gravity * distance ** 2 + 2 * heightDelta * speed ** 2);
};

const getRequiredProjectileSpeed = (distance: number, heightDelta: number, gravity: number) => {
  if (distance <= 0 || gravity <= 0) return null;

  const requiredSpeedSquared =
    gravity * (heightDelta + Math.sqrt(distance ** 2 + heightDelta ** 2));

  if (requiredSpeedSquared <= 0) return null;

  return Math.sqrt(requiredSpeedSquared);
};

const getProjectileAngle = (lowAngle: number, highAngle: number, weapon_bag: WeaponStatsType) => {
  if (weapon_bag.projectile_firing_angle_type === "high_angle") {
    return highAngle;
  }

  return lowAngle;
};

const getActualProjectileSpeed = (
  requiredSpeed: number,
  baseSpeed: number,
  speedIncrement: number,
) => {
  if (baseSpeed >= requiredSpeed) return baseSpeed;

  // If increment is below the min, the field is broken
  // fall back to the projectile default
  const effectiveSpeedIncrement =
    speedIncrement >= MIN_PROJECTILE_SPEED_INCREMENT
      ? speedIncrement
      : DEFAULT_PROJECTILE_SPEED_INCREMENT;

  const steps = Math.ceil((requiredSpeed - baseSpeed) / effectiveSpeedIncrement - 1e-9);

  return baseSpeed + steps * effectiveSpeedIncrement;
};

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getRequiredSpeedForAngle = (
  distance: number,
  heightDelta: number,
  gravity: number,
  angle: number,
) => {
  const cosAngle = Math.cos(angle);
  const tanAngle = Math.tan(angle);

  const denominator = 2 * cosAngle ** 2 * (distance * tanAngle - heightDelta);

  if (denominator <= 0) return null;

  return Math.sqrt((gravity * distance ** 2) / denominator);
};

export const getProjectileTravelTime = (distance: number, weapon_bag: WeaponStatsType) => {
  if (weapon_bag.projectile_type === "none") return null;

  // Fixed trajectory projectiles use their authored time directly.
  if (
    weapon_bag.projectile_trajectory_type === "projectile_trajectory" &&
    weapon_bag.projectile_trajectory_time_seconds > 0
  ) {
    return weapon_bag.projectile_trajectory_time_seconds;
  }

  // For now, only calculate ballistic time for artillery.
  if (weapon_bag.projectile_type !== "artillery") return null;

  if (distance <= 0) return null;

  const gravity = BASE_GRAVITY * (weapon_bag.projectile_gravity_multiplier || 1);
  const impactHeight = getProjectileImpactHeight(weapon_bag);
  const heightDelta = impactHeight - PROJECTILE_LAUNCH_HEIGHT;

  if (weapon_bag.projectile_firing_angle_type === "lowest_non_collide_angle") {
    const theta = degreesToRadians(weapon_bag.projectile_non_collide_start_angle);

    const speed = getRequiredSpeedForAngle(distance, heightDelta, gravity, theta);

    if (speed === null) return null;

    const horizontalSpeed = speed * Math.cos(theta);

    if (horizontalSpeed <= 0) return null;

    return distance / horizontalSpeed;
  }

  const requiredSpeed = getRequiredProjectileSpeed(distance, heightDelta, gravity);

  if (requiredSpeed === null) return null;

  const speed = getActualProjectileSpeed(
    requiredSpeed,
    weapon_bag.projectile_speed,
    weapon_bag.projectile_speed_increment,
  );

  if (speed === null) return null;

  const discriminant = getBallisticDiscriminant(distance, heightDelta, speed, gravity);

  if (discriminant < 0) return null;

  const sqrtDiscriminant = Math.sqrt(discriminant);

  const lowTanTheta = (speed ** 2 - sqrtDiscriminant) / (gravity * distance);
  const highTanTheta = (speed ** 2 + sqrtDiscriminant) / (gravity * distance);

  const lowAngle = Math.atan(lowTanTheta);
  const highAngle = Math.atan(highTanTheta);

  const theta = getProjectileAngle(lowAngle, highAngle, weapon_bag);

  if (theta === null) return null;

  const horizontalSpeed = speed * Math.cos(theta);

  if (horizontalSpeed <= 0) return null;

  return distance / horizontalSpeed;
};
