import type { CoordinateSystem } from './coordinateSystem';
import { getCoordinateComponents } from './coordinateSystem';
import type { ProjectileParameters } from './projectile';
import { almostEqual, type Vector2 } from './vectors';

type TimePower = 0 | 1 | 2;

type SymbolicTerm = {
  coefficient: number;
  symbol?: string;
  timePower: TimePower;
  trig?: 'sin' | 'cos';
};

export type AxisEquation = {
  label: string;
  generalLatex: string;
  simplifiedLatex: string;
  simplifiedText: string;
  initialPosition: string;
  initialVelocity: string;
  acceleration: string;
};

export type EquationSet = {
  axis1: AxisEquation;
  axis2: AxisEquation;
};

const EPSILON = 1e-8;

const snap = (value: number): number => {
  if (almostEqual(value, 0, EPSILON)) return 0;
  if (almostEqual(value, 1, EPSILON)) return 1;
  if (almostEqual(value, -1, EPSILON)) return -1;
  return value;
};

const isCardinal = (axis: Vector2): boolean => [-1, 0, 1].includes(snap(axis.x)) && [-1, 0, 1].includes(snap(axis.y));

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

const thetaUnits = (system: CoordinateSystem): number => Math.round(Math.atan2(system.axis1.y, system.axis1.x) / (Math.PI / 12));

const formatTheta = (system: CoordinateSystem, mode: 'latex' | 'text'): string => {
  const units = thetaUnits(system);
  if (units === 0) return mode === 'latex' ? '\\theta' : 'theta';

  const denominator = 12;
  const divisor = gcd(Math.abs(units), denominator);
  const numerator = units / divisor;
  const reducedDenominator = denominator / divisor;
  const sign = numerator < 0 ? '-' : '';
  const absoluteNumerator = Math.abs(numerator);
  const piTerm = absoluteNumerator === 1 ? 'pi' : `${absoluteNumerator}pi`;

  if (mode === 'text') {
    return reducedDenominator === 1 ? `${sign}${piTerm}` : `${sign}${piTerm}/${reducedDenominator}`;
  }

  if (reducedDenominator === 1) {
    return `${sign}${absoluteNumerator === 1 ? '\\pi' : `${absoluteNumerator}\\pi`}`;
  }

  const numeratorLatex = absoluteNumerator === 1 ? '\\pi' : `${absoluteNumerator}\\pi`;
  return `${sign}\\frac{${numeratorLatex}}{${reducedDenominator}}`;
};

const addTerm = (terms: SymbolicTerm[], term: SymbolicTerm): void => {
  if (almostEqual(term.coefficient, 0, EPSILON)) return;
  const existing = terms.find(
    (candidate) =>
      candidate.symbol === term.symbol && candidate.timePower === term.timePower && candidate.trig === term.trig,
  );
  if (existing) {
    existing.coefficient += term.coefficient;
  } else {
    terms.push({ ...term });
  }
};

const positionComponentTerms = (label: string, initialPositionValue: number): SymbolicTerm[] => {
  const sign = initialPositionValue < -EPSILON ? -1 : 1;
  return [{ coefficient: sign, symbol: `${label}_0`, timePower: 0 }];
};

const velocityComponentTerms = (axis: Vector2): SymbolicTerm[] | null => {
  const axisX = snap(axis.x);
  if (!isCardinal(axis)) return null;
  return axisX === 0 ? [] : [{ coefficient: axisX, symbol: 'v_0', timePower: 0 }];
};

const accelerationComponentTerms = (axis: Vector2): SymbolicTerm[] | null => {
  const axisY = snap(axis.y);
  if (!isCardinal(axis)) return null;
  return axisY === 0 ? [] : [{ coefficient: -axisY, symbol: 'g', timePower: 0 }];
};

const symbolLatex = (symbol?: string): string => {
  if (!symbol) return '';
  const [base, subscript] = symbol.split('_');
  return subscript ? `${base}_{${subscript}}` : base;
};

const symbolText = (symbol?: string): string => symbol?.replaceAll('_', '') ?? '';

const trigText = (trig: SymbolicTerm['trig'] | undefined, mode: 'latex' | 'text', theta: string): string => {
  if (!trig) return '';
  return mode === 'latex' ? `\\${trig}\\left(${theta}\\right)` : `${trig}(${theta})`;
};

const formatCoefficient = (coefficient: number, mode: 'latex' | 'text', includeOne: boolean): string => {
  const absolute = Math.abs(coefficient);
  if (almostEqual(absolute, 1, EPSILON) && !includeOne) return '';
  if (almostEqual(absolute, 0.5, EPSILON)) return mode === 'latex' ? '\\frac{1}{2}' : '1/2';
  if (Number.isInteger(absolute)) return String(absolute);
  return absolute.toFixed(2).replace(/\.?0+$/, '');
};

const formatSingleTerm = (term: SymbolicTerm, mode: 'latex' | 'text', first: boolean, theta: string): string => {
  const sign = term.coefficient < 0 ? (first ? '-' : ' - ') : first ? '' : ' + ';
  const symbol = mode === 'latex' ? symbolLatex(term.symbol) : symbolText(term.symbol);
  const time =
    term.timePower === 0
      ? ''
      : term.timePower === 1
        ? 't'
        : symbol
          ? 't^2'
          : 't^2';
  const trig = trigText(term.trig, mode, theta);
  const includeOne = !symbol && !time && !trig;
  const coefficient = formatCoefficient(term.coefficient, mode, includeOne);
  const factors = [symbol, time && !symbol ? time : '', time && symbol ? time : '', trig].filter(Boolean);
  const body = [coefficient, ...factors].filter(Boolean).join(' ');
  return `${sign}${body}`;
};

const cleanTerms = (terms: SymbolicTerm[]): SymbolicTerm[] =>
  terms
    .filter((term) => !almostEqual(term.coefficient, 0, EPSILON))
    .sort(
      (a, b) =>
        a.timePower - b.timePower ||
        (a.symbol ?? '').localeCompare(b.symbol ?? '') ||
        (a.trig ?? '').localeCompare(b.trig ?? ''),
    );

const formatTerms = (terms: SymbolicTerm[], mode: 'latex' | 'text', theta: string): string => {
  const cleaned = cleanTerms(terms);
  if (cleaned.length === 0) return '0';
  return cleaned.map((term, index) => formatSingleTerm(term, mode, index === 0, theta)).join('');
};

const componentText = (symbolic: SymbolicTerm[], theta: string): string => formatTerms(symbolic, 'text', theta);

const buildEquationTerms = (
  position: SymbolicTerm[],
  velocity: SymbolicTerm[],
  acceleration: SymbolicTerm[],
): SymbolicTerm[] => {
  const terms: SymbolicTerm[] = [];
  position.forEach((term) => addTerm(terms, term));
  velocity.forEach((term) => addTerm(terms, { ...term, timePower: 1 }));
  acceleration.forEach((term) => addTerm(terms, { ...term, coefficient: 0.5 * term.coefficient, timePower: 2 }));
  return terms;
};

const rotatedVelocityComponentTerms = (axisIndex: 1 | 2, system: CoordinateSystem): SymbolicTerm[] => {
  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;

  if (axisIndex === 1) {
    return [{ coefficient: 1, symbol: 'v_0', timePower: 0, trig: 'cos' }];
  }

  return [{ coefficient: cross >= 0 ? -1 : 1, symbol: 'v_0', timePower: 0, trig: 'sin' }];
};

const rotatedAccelerationComponentTerms = (axisIndex: 1 | 2, system: CoordinateSystem): SymbolicTerm[] => {
  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;

  if (axisIndex === 1) {
    return [{ coefficient: -1, symbol: 'g', timePower: 0, trig: 'sin' }];
  }

  return [{ coefficient: cross >= 0 ? -1 : 1, symbol: 'g', timePower: 0, trig: 'cos' }];
};

const axisEquation = (
  label: string,
  axis: Vector2,
  system: CoordinateSystem,
  componentValues: { position: number; velocity: number; acceleration: number },
  axisIndex: 1 | 2,
): AxisEquation => {
  const position = positionComponentTerms(label, componentValues.position);
  const velocity = velocityComponentTerms(axis) ?? rotatedVelocityComponentTerms(axisIndex, system);
  const acceleration = accelerationComponentTerms(axis) ?? rotatedAccelerationComponentTerms(axisIndex, system);
  const equationTerms = buildEquationTerms(position, velocity, acceleration);
  const generalLatex = `${label}(t) = ${label}_0 + v_{${label},0} t + \\frac{1}{2} a_${label} t^2`;
  const latexTheta = formatTheta(system, 'latex');
  const textTheta = formatTheta(system, 'text');
  const rightSideLatex = formatTerms(equationTerms, 'latex', latexTheta);
  const rightSideText = formatTerms(equationTerms, 'text', textTheta);

  return {
    label,
    generalLatex,
    simplifiedLatex: `${label}(t) = ${rightSideLatex}`,
    simplifiedText: `${label}(t) = ${rightSideText}`,
    initialPosition: componentText(position, textTheta),
    initialVelocity: componentText(velocity, textTheta),
    acceleration: componentText(acceleration, textTheta),
  };
};

export const formatEquationSet = (params: ProjectileParameters, system: CoordinateSystem): EquationSet => {
  const components = getCoordinateComponents(params, system);
  return {
    axis1: axisEquation(system.label1, system.axis1, system, {
      position: components.position0.x,
      velocity: components.velocity0.x,
      acceleration: components.acceleration.x,
    }, 1),
    axis2: axisEquation(system.label2, system.axis2, system, {
      position: components.position0.y,
      velocity: components.velocity0.y,
      acceleration: components.acceleration.y,
    }, 2),
  };
};
