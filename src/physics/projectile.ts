import { add, scale, type Vector2, vector } from './vectors';

export type ProjectileParameters = {
  H: number;
  h: number;
  d1: number;
  d2: number;
  v0: number;
  g: number;
};

const baseDefaults = {
  H: 20,
  h: 8,
  v0: 12,
  g: 9.8,
};

const timeToHeight = (startHeight: number, endHeight: number, gravity: number): number =>
  Math.sqrt((2 * (startHeight - endHeight)) / gravity);

const landingDistance = (height: number, velocity: number, gravity: number): number =>
  velocity * Math.sqrt((2 * height) / gravity);

const distanceToWall = baseDefaults.v0 * timeToHeight(baseDefaults.H, baseDefaults.h, baseDefaults.g);

export const defaultParameters: ProjectileParameters = {
  ...baseDefaults,
  d1: distanceToWall,
  d2: landingDistance(baseDefaults.H, baseDefaults.v0, baseDefaults.g) - distanceToWall,
};

export const initialPositionWorld = (params: ProjectileParameters): Vector2 => vector(0, params.H);

export const initialVelocityWorld = (params: ProjectileParameters): Vector2 => vector(params.v0, 0);

export const accelerationWorld = (params: ProjectileParameters): Vector2 => vector(0, -params.g);

export const worldPositionAtTime = (params: ProjectileParameters, time: number): Vector2 => {
  const r0 = initialPositionWorld(params);
  const v = initialVelocityWorld(params);
  const a = accelerationWorld(params);
  return add(add(r0, scale(v, time)), scale(a, 0.5 * time * time));
};

export const landingTime = (params: ProjectileParameters): number => Math.sqrt((2 * params.H) / params.g);

export const maxUsefulTime = (params: ProjectileParameters): number => {
  const naturalLanding = landingTime(params);
  const byDistance = (params.d1 + params.d2 + 8) / Math.max(params.v0, 1);
  return Math.max(naturalLanding, byDistance);
};

export const trajectorySamples = (params: ProjectileParameters, count = 80): Vector2[] => {
  const end = landingTime(params);
  return Array.from({ length: count }, (_, index) => worldPositionAtTime(params, (end * index) / (count - 1)));
};
