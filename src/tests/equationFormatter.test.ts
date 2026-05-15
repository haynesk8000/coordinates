import { describe, expect, it } from 'vitest';
import { rotateCoordinateSystem } from '../physics/coordinateSystem';
import { formatEquationSet } from '../physics/equationFormatter';
import { createPresets } from '../physics/presets';
import { defaultParameters } from '../physics/projectile';

describe('equation formatter', () => {
  it('formats default coordinate equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[0]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = x0 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = y0 - 1/2 g t^2');
  });

  it('formats flipped vertical axis equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[3]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = x0 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = y0 + 1/2 g t^2');
  });

  it('formats ground-origin equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[4]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = x0 + v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = y0 - 1/2 g t^2');
  });

  it('formats swapped-axis equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[9]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = x0 - 1/2 g t^2');
    expect(equations.axis2.simplifiedText).toBe('y(t) = y0 + v0 t');
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
