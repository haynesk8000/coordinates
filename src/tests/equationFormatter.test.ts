import { describe, expect, it } from 'vitest';
import { rotateCoordinateSystem } from '../physics/coordinateSystem';
import { formatEquationSet } from '../physics/equationFormatter';
import { createPresets } from '../physics/presets';
import { defaultParameters } from '../physics/projectile';

describe('equation formatter', () => {
  it('formats default coordinate equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[0]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = -1/2 g t^2');
  });

  it('formats flipped vertical axis equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[3]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = 1/2 g t^2');
  });

  it('formats ground-origin equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[4]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = v0 t');
    expect(equations.axis2.simplifiedText).toBe('y(t) = H - 1/2 g t^2');
  });

  it('formats swapped-axis equations', () => {
    const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[9]);
    expect(equations.axis1.simplifiedText).toBe('x(t) = H - 1/2 g t^2');
    expect(equations.axis2.simplifiedText).toBe('y(t) = v0 t');
  });

  it('keeps rotated coordinate equations symbolic with trig and also provides numeric equations', () => {
    const rotated = rotateCoordinateSystem(createPresets(defaultParameters)[0], 45);
    const equations = formatEquationSet(defaultParameters, rotated);

    expect(equations.axis1.simplifiedText).toContain('cos(theta)');
    expect(equations.axis1.simplifiedText).toContain('sin(theta)');
    expect(equations.axis1.simplifiedText).toContain('v0');
    expect(equations.axis1.simplifiedText).toContain('g');
    expect(equations.axis1.numericText).toContain('8.49 t');
    expect(equations.axis1.numericText).toContain('- 3.46 t^2');
  });
});
