import { describe, expect, it } from 'vitest';
import {
  defaultParameters,
  landingTime,
  maxUsefulTime,
  worldPositionAtTime,
  worldVelocityAtTime,
} from '../physics/projectile';

describe('projectile motion', () => {
  it('starts at the cliff top', () => {
    expect(worldPositionAtTime(defaultParameters, 0)).toEqual({ x: 0, y: defaultParameters.H });
  });

  it('keeps horizontal speed constant while gravity changes height', () => {
    const position = worldPositionAtTime(defaultParameters, 2);
    expect(position.x).toBe(defaultParameters.v0 * 2);
    expect(position.y).toBeCloseTo(defaultParameters.H - 0.5 * defaultParameters.g * 4);
  });

  it('updates vertical velocity while horizontal velocity stays constant', () => {
    const velocity = worldVelocityAtTime(defaultParameters, 1.5);

    expect(velocity.x).toBe(defaultParameters.v0);
    expect(velocity.y).toBeCloseTo(-defaultParameters.g * 1.5);
  });

  it('caps useful animation time at ground impact', () => {
    expect(maxUsefulTime(defaultParameters)).toBe(landingTime(defaultParameters));
    expect(worldPositionAtTime(defaultParameters, maxUsefulTime(defaultParameters)).y).toBeCloseTo(0);
  });
});
