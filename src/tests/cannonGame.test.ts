import { describe, expect, it } from 'vitest';
import { muzzleVelocity, POWER_LEVELS, rangeFor } from '../components/funzone/CannonGame';

describe('Cannon Game energy scale', () => {
  it('offers energy levels from 0 to 4 in increments of 0.25', () => {
    expect(POWER_LEVELS).toEqual([
      0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
      2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4,
    ]);
  });

  it('uses zero velocity and zero range at zero energy', () => {
    expect(muzzleVelocity(0)).toBe(0);
    expect(rangeFor(0, 35)).toBe(0);
  });

  it('scales the physical projectile range linearly with energy', () => {
    const angle = 35;
    const baselineRange = rangeFor(1, angle);

    for (const energy of [0.25, 0.5, 1, 2, 3, 4]) {
      expect(rangeFor(energy, angle)).toBeCloseTo(baselineRange * energy, 8);
    }
  });
});
