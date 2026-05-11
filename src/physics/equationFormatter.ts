import type { CoordinateSystem } from './coordinateSystem';
import { getCoordinateComponents } from './coordinateSystem';
import type { ProjectileParameters } from './projectile';
import { almostEqual, type Vector2 } from './vectors';

type SymbolKey = 'H' | 'h' | 'd_1' | 'd_2' | 'v_0' | 'g';
type TimePower = 0 | 1 | 2;

type SymbolicTerm = {
  coefficient: number;
  symbol?: SymbolKey;
  timePower: TimePower;
  trig?: 'sin' | 'cos';
};

export type AxisEquation = {
  label: string;
  generalLatex: string;
  simplifiedLatex: string;
  simplifiedText: string;
  numericLatex: string;
  numericText: string;
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

const inferOriginTerms = (
  system: CoordinateSystem,
  params: ProjectileParameters,
): { x: SymbolicTerm[]; y: SymbolicTerm[] } => {
  if (almostEqual(system.originWorld.x, 0, EPSILON) && almostEqual(system.originWorld.y, params.H, EPSILON)) {
    return { x: [], y: [{ coefficient: 1, symbol: 'H', timePower: 0 }] };
  }
  if (almostEqual(system.originWorld.x, 0, EPSILON) && almostEqual(system.originWorld.y, 0, EPSILON)) {
    return { x: [], y: [] };
  }
  if (almostEqual(system.originWorld.x, params.d1, EPSILON) && almostEqual(system.originWorld.y, params.h, EPSILON)) {
    return {
      x: [{ coefficient: 1, symbol: 'd_1', timePower: 0 }],
      y: [{ coefficient: 1, symbol: 'h', timePower: 0 }],
    };
  }
  if (almostEqual(system.originWorld.x, params.d1 + params.d2, EPSILON) && almostEqual(system.originWorld.y, 0, EPSILON)) {
    return {
      x: [
        { coefficient: 1, symbol: 'd_1', timePower: 0 },
        { coefficient: 1, symbol: 'd_2', timePower: 0 },
      ],
      y: [],
    };
  }

  return {
    x: numericTerm(system.originWorld.x),
    y: numericTerm(system.originWorld.y),
  };
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

const multiplyTerms = (terms: SymbolicTerm[], factor: number): SymbolicTerm[] =>
  terms.map((term) => ({ ...term, coefficient: term.coefficient * factor }));

const positionComponentTerms = (
  axis: Vector2,
  system: CoordinateSystem,
  params: ProjectileParameters,
): SymbolicTerm[] | null => {
  const axisX = snap(axis.x);
  const axisY = snap(axis.y);
  if (!isCardinal(axis)) return null;

  const origin = inferOriginTerms(system, params);
  const worldInitial = { x: [] as SymbolicTerm[], y: [{ coefficient: 1, symbol: 'H' as SymbolKey, timePower: 0 as TimePower }] };
  const relativeX = [...worldInitial.x, ...multiplyTerms(origin.x, -1)];
  const relativeY = [...worldInitial.y, ...multiplyTerms(origin.y, -1)];
  const result: SymbolicTerm[] = [];
  multiplyTerms(relativeX, axisX).forEach((term) => addTerm(result, term));
  multiplyTerms(relativeY, axisY).forEach((term) => addTerm(result, term));
  return result;
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

const numericTerm = (value: number, timePower: TimePower = 0): SymbolicTerm[] =>
  almostEqual(value, 0, EPSILON) ? [] : [{ coefficient: value, timePower }];

const symbolLatex = (symbol?: SymbolKey): string => {
  if (!symbol) return '';
  return symbol.replace('_', '_{') + (symbol.includes('_') ? '}' : '');
};

const symbolText = (symbol?: SymbolKey): string => symbol?.replace('_', '') ?? '';

const trigText = (trig?: SymbolicTerm['trig'], mode: 'latex' | 'text' = 'text'): string => {
  if (!trig) return '';
  return mode === 'latex' ? `\\${trig}\\theta` : `${trig}(theta)`;
};

const formatCoefficient = (coefficient: number, mode: 'latex' | 'text', includeOne: boolean): string => {
  const absolute = Math.abs(coefficient);
  if (almostEqual(absolute, 1, EPSILON) && !includeOne) return '';
  if (almostEqual(absolute, 0.5, EPSILON)) return mode === 'latex' ? '\\frac{1}{2}' : '1/2';
  if (Number.isInteger(absolute)) return String(absolute);
  return absolute.toFixed(2).replace(/\.?0+$/, '');
};

const formatSingleTerm = (term: SymbolicTerm, mode: 'latex' | 'text', first: boolean): string => {
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
  const trig = trigText(term.trig, mode);
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

const formatTerms = (terms: SymbolicTerm[], mode: 'latex' | 'text'): string => {
  const cleaned = cleanTerms(terms);
  if (cleaned.length === 0) return '0';
  return cleaned.map((term, index) => formatSingleTerm(term, mode, index === 0)).join('');
};

const componentText = (symbolic: SymbolicTerm[] | null, numeric: number): string =>
  symbolic ? formatTerms(symbolic, 'text') : numeric.toFixed(2).replace(/\.?0+$/, '');

const buildEquationTerms = (
  position: SymbolicTerm[] | null,
  velocity: SymbolicTerm[] | null,
  acceleration: SymbolicTerm[] | null,
  numeric: { position: number; velocity: number; acceleration: number },
): SymbolicTerm[] => {
  const terms: SymbolicTerm[] = [];
  const posTerms = position ?? numericTerm(numeric.position);
  const velTerms = velocity ?? numericTerm(numeric.velocity);
  const accTerms = acceleration ?? numericTerm(numeric.acceleration);

  posTerms.forEach((term) => addTerm(terms, term));
  velTerms.forEach((term) => addTerm(terms, { ...term, timePower: 1 }));
  accTerms.forEach((term) => addTerm(terms, { ...term, coefficient: 0.5 * term.coefficient, timePower: 2 }));
  return terms;
};

const buildNumericEquationTerms = (numeric: {
  position: number;
  velocity: number;
  acceleration: number;
}): SymbolicTerm[] => {
  const terms: SymbolicTerm[] = [];
  numericTerm(numeric.position).forEach((term) => addTerm(terms, term));
  numericTerm(numeric.velocity, 1).forEach((term) => addTerm(terms, term));
  numericTerm(0.5 * numeric.acceleration, 2).forEach((term) => addTerm(terms, term));
  return terms;
};

const worldRelativeTerms = (
  system: CoordinateSystem,
  params: ProjectileParameters,
): { x: SymbolicTerm[]; y: SymbolicTerm[] } => {
  const origin = inferOriginTerms(system, params);
  const x: SymbolicTerm[] = [];
  const y: SymbolicTerm[] = [];

  multiplyTerms(origin.x, -1).forEach((term) => addTerm(x, term));
  addTerm(x, { coefficient: 1, symbol: 'v_0', timePower: 1 });

  addTerm(y, { coefficient: 1, symbol: 'H', timePower: 0 });
  multiplyTerms(origin.y, -1).forEach((term) => addTerm(y, term));
  addTerm(y, { coefficient: -0.5, symbol: 'g', timePower: 2 });

  return { x, y };
};

const multiplyTermsWithTrig = (
  terms: SymbolicTerm[],
  coefficient: number,
  trig: NonNullable<SymbolicTerm['trig']>,
): SymbolicTerm[] => terms.map((term) => ({ ...term, coefficient: term.coefficient * coefficient, trig }));

const rotatedEquationTerms = (
  axisIndex: 1 | 2,
  system: CoordinateSystem,
  params: ProjectileParameters,
): SymbolicTerm[] => {
  const relative = worldRelativeTerms(system, params);
  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;
  const terms: SymbolicTerm[] = [];

  if (axisIndex === 1) {
    multiplyTermsWithTrig(relative.x, 1, 'cos').forEach((term) => addTerm(terms, term));
    multiplyTermsWithTrig(relative.y, 1, 'sin').forEach((term) => addTerm(terms, term));
    return terms;
  }

  const xSign = cross >= 0 ? -1 : 1;
  const ySign = cross >= 0 ? 1 : -1;
  multiplyTermsWithTrig(relative.x, xSign, 'sin').forEach((term) => addTerm(terms, term));
  multiplyTermsWithTrig(relative.y, ySign, 'cos').forEach((term) => addTerm(terms, term));
  return terms;
};

const axisEquation = (
  label: string,
  axis: Vector2,
  system: CoordinateSystem,
  params: ProjectileParameters,
  numeric: { position: number; velocity: number; acceleration: number },
  axisIndex: 1 | 2,
): AxisEquation => {
  const position = positionComponentTerms(axis, system, params);
  const velocity = velocityComponentTerms(axis);
  const acceleration = accelerationComponentTerms(axis);
  const equationTerms =
    position && velocity && acceleration
      ? buildEquationTerms(position, velocity, acceleration, numeric)
      : rotatedEquationTerms(axisIndex, system, params);
  const numericTerms = buildNumericEquationTerms(numeric);
  const generalLatex = `${label}(t) = ${label}_0 + v_{${label},0} t + \\frac{1}{2} a_${label} t^2`;
  const rightSideLatex = formatTerms(equationTerms, 'latex');
  const rightSideText = formatTerms(equationTerms, 'text');
  const numericRightSideLatex = formatTerms(numericTerms, 'latex');
  const numericRightSideText = formatTerms(numericTerms, 'text');

  return {
    label,
    generalLatex,
    simplifiedLatex: `${label}(t) = ${rightSideLatex}`,
    simplifiedText: `${label}(t) = ${rightSideText}`,
    numericLatex: `${label}(t) = ${numericRightSideLatex}`,
    numericText: `${label}(t) = ${numericRightSideText}`,
    initialPosition: componentText(position, numeric.position),
    initialVelocity: componentText(velocity, numeric.velocity),
    acceleration: componentText(acceleration, numeric.acceleration),
  };
};

export const formatEquationSet = (params: ProjectileParameters, system: CoordinateSystem): EquationSet => {
  const components = getCoordinateComponents(params, system);
  return {
    axis1: axisEquation(system.label1, system.axis1, system, params, {
      position: components.position0.x,
      velocity: components.velocity0.x,
      acceleration: components.acceleration.x,
    }, 1),
    axis2: axisEquation(system.label2, system.axis2, system, params, {
      position: components.position0.y,
      velocity: components.velocity0.y,
      acceleration: components.acceleration.y,
    }, 2),
  };
};
