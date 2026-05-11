import { describe, expect, it } from 'vitest';
import { defaultParameters, worldPositionAtTime } from '../physics/projectile';

describe('projectile motion', () => {
  it('starts at the cliff top', () => {
    expect(worldPositionAtTime(defaultParameters, 0)).toEqual({ x: 0, y: defaultParameters.H });
  });

  it('keeps horizontal speed constant while gravity changes height', () => {
    const position = worldPositionAtTime(defaultParameters, 2);
    expect(position.x).toBe(defaultParameters.v0 * 2);
    expect(position.y).toBeCloseTo(defaultParameters.H - 0.5 * defaultParameters.g * 4);
  });
});
