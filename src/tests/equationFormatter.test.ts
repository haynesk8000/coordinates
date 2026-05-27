import { describe, expect, it } from 'vitest';
import { makeCoordinateSystem, rotateCoordinateSystem } from '../physics/coordinateSystem';
import { formatEquationSet } from '../physics/equationFormatter';
import { createPresets } from '../physics/presets';
import { defaultParameters } from '../physics/projectile';
import {
  clampSystemToScene,
  createSceneBounds,
  sceneScreenToWorld,
  worldToSceneScreen,
} from '../physics/sceneGeometry';
import { vector, type Vector2 } from '../physics/vectors';

const snappedDefaultSystemNear = (originWorld: Vector2, screenOffset: Vector2) => {
  const bounds = createSceneBounds(defaultParameters);
  const screen = worldToSceneScreen(originWorld, bounds);
  const nearOrigin = sceneScreenToWorld(vector(screen.x + screenOffset.x, screen.y + screenOffset.y), bounds);
  return clampSystemToScene(
    makeCoordinateSystem(nearOrigin, vector(1, 0), vector(0, 1)),
    defaultParameters,
  );
};

describe('equation formatter', () => {
  it('formats default coordinate equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[0]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = 0 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = 0 - 1/2 g t^2');
  });

  it('formats flipped vertical axis equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[3]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = 0 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = 0 + 1/2 g t^2');
  });

  it('formats ground-origin equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[4]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = 0 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = H - 1/2 g t^2');
  });

  it('formats swapped-axis equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[9]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = H - 1/2 g t^2');
    expect(equations.axis2.simplifiedText).toBe('y(t) = 0 + v0 t');
  });

  it('formats wall-origin equations with H, h, and d1', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[8]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = -d1 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = H - h - 1/2 g t^2');
  });

  it('formats landing-origin equations with d1 and d2', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[10]);
    expect(equations.axis1.simplifiedText).toBe('a(t) = -d1 - d2 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('b(t) = H - 1/2 g t^2');
  });

  it('formats equations symbolically after snapping to each vertical guide line', () => {
    const freeY = defaultParameters.h + 2;
    const cases = [
      { originX: 0, expected: 'x(t) = 0 + v0 t' },
      { originX: defaultParameters.d1, expected: 'x(t) = -d1 + v0 t' },
      { originX: defaultParameters.d1 + defaultParameters.d2, expected: 'x(t) = -d1 - d2 + v0 t' },
    ];

    for (const testCase of cases) {
      const system = snappedDefaultSystemNear(vector(testCase.originX, freeY), vector(4, 0));
      const equations = formatEquationSet(defaultParameters, system);

      expect(system.originWorld.x).toBe(testCase.originX);
      expect(system.originWorld.y).toBeCloseTo(freeY);
      expect(equations.axis1.simplifiedText).toBe(testCase.expected);
    }
  });

  it('formats equations symbolically after snapping to each horizontal guide line', () => {
    const freeX = 2;
    const cases = [
      { originY: 0, expected: 'y(t) = H - 1/2 g t^2' },
      { originY: defaultParameters.h, expected: 'y(t) = H - h - 1/2 g t^2' },
      { originY: defaultParameters.H, expected: 'y(t) = 0 - 1/2 g t^2' },
    ];

    for (const testCase of cases) {
      const system = snappedDefaultSystemNear(vector(freeX, testCase.originY), vector(0, 4));
      const equations = formatEquationSet(defaultParameters, system);

      expect(system.originWorld.x).toBeCloseTo(freeX);
      expect(system.originWorld.y).toBe(testCase.originY);
      expect(equations.axis2.simplifiedText).toBe(testCase.expected);
    }
  });

  it('combines snapped vertical and horizontal guide lines even when the origin is not an old preset point', () => {
    const system = snappedDefaultSystemNear(vector(defaultParameters.d1 + defaultParameters.d2, defaultParameters.h), vector(4, 4));
    const equations = formatEquationSet(defaultParameters, system);

    expect(equations.axis1.simplifiedText).toBe('x(t) = -d1 - d2 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = H - h - 1/2 g t^2');
  });

  it('keeps rotated coordinate equations symbolic with trig', () => {
    const rotated = rotateCoordinateSystem(createPresets(defaultParameters)[0], Math.PI / 4);
    const equations = formatEquationSet(defaultParameters, rotated);

    expect(equations.axis1.simplifiedText).toContain('cos(pi/4)');
    expect(equations.axis1.simplifiedText).toContain('sin(pi/4)');
    expect(equations.axis1.simplifiedText).toContain('v0');
    expect(equations.axis1.simplifiedText).toContain('g');
  });
});
