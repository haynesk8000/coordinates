import { describe, expect, it } from 'vitest';
import { getCoordinateComponents, projectWorldPoint } from '../physics/coordinateSystem';
import { createPresets } from '../physics/presets';
import { defaultParameters } from '../physics/projectile';
import { dot, normalize, vector } from '../physics/vectors';

describe('vector math', () => {
  it('computes dot products', () => {
    expect(dot(vector(3, -2), vector(4, 5))).toBe(2);
  });

  it('normalizes vectors', () => {
    const unit = normalize(vector(3, 4));
    expect(unit.x).toBeCloseTo(0.6);
    expect(unit.y).toBeCloseTo(0.8);
  });
});

describe('coordinate projection', () => {
  it('projects a point onto the selected axes', () => {
    const system = createPresets(defaultParameters)[4];
    expect(projectWorldPoint(vector(0, defaultParameters.H), system)).toEqual(vector(0, defaultParameters.H));
  });

  it('transforms velocity and acceleration for default axes', () => {
    const system = createPresets(defaultParameters)[0];
    const components = getCoordinateComponents(defaultParameters, system);
    expect(components.velocity0.x).toBe(defaultParameters.v0);
    expect(components.velocity0.y).toBe(0);
    expect(components.acceleration.x).toBe(0);
    expect(components.acceleration.y).toBe(-defaultParameters.g);
  });

  it('flips vertical acceleration when the vertical axis points downward', () => {
    const system = createPresets(defaultParameters)[3];
    const components = getCoordinateComponents(defaultParameters, system);
    expect(components.position0.y).toBe(0);
    expect(components.velocity0.y).toBe(0);
    expect(components.acceleration.y).toBe(defaultParameters.g);
  });

  it('moves origin without changing velocity or acceleration components', () => {
    const defaultSystem = createPresets(defaultParameters)[0];
    const groundSystem = createPresets(defaultParameters)[4];
    const defaultComponents = getCoordinateComponents(defaultParameters, defaultSystem);
    const groundComponents = getCoordinateComponents(defaultParameters, groundSystem);

    expect(groundComponents.position0.y).toBe(defaultParameters.H);
    expect(groundComponents.velocity0).toEqual(defaultComponents.velocity0);
    expect(groundComponents.acceleration).toEqual(defaultComponents.acceleration);
  });

  it('supports swapped axes', () => {
    const system = createPresets(defaultParameters)[9];
    const components = getCoordinateComponents(defaultParameters, system);
    expect(components.position0.x).toBe(defaultParameters.H);
    expect(components.position0.y).toBe(0);
    expect(components.velocity0.x).toBe(0);
    expect(components.velocity0.y).toBe(defaultParameters.v0);
    expect(components.acceleration.x).toBe(-defaultParameters.g);
    expect(components.acceleration.y).toBe(0);
  });
});
