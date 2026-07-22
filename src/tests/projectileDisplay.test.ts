import { describe, expect, it } from 'vitest';
import { mapProjectileToScreen, projectileDisplayBounds } from '../components/ProjectileMotionModule';

describe('projectile display bounds', () => {
  it('uses a fixed 110 meter horizontal world scale', () => {
    expect(projectileDisplayBounds.width).toBe(110);
    expect(mapProjectileToScreen({ x: 0, y: 0 }).x).toBe(35);
    expect(mapProjectileToScreen({ x: 110, y: 0 }).x).toBe(690);
  });

  it('uses a fixed 65 meter vertical world scale above the ground', () => {
    expect(projectileDisplayBounds.height).toBe(65);
    expect(mapProjectileToScreen({ x: 0, y: 0 }).y).toBe(325);
    expect(mapProjectileToScreen({ x: 0, y: 65 }).y).toBe(0);
  });

  it('uses one unchanged world-to-screen transformation for intermediate points', () => {
    expect(mapProjectileToScreen({ x: 55, y: 32.5 })).toEqual({
      x: 362.5,
      y: 162.5,
    });
  });
});