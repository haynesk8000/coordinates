import { add, scale, type Vector2, vector } from './vectors';

export type ProjectileParameters = {
  H: number;
  h: number;
  d1: number;
  d2: number;
  v0: number;
  g: number;
};

export const defaultParameters: ProjectileParameters = {
  H: 20,
  h: 8,
  d1: 15,
  d2: 20,
  v0: 12,
  g: 9.8,
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
