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
  timeFactor?: string;
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

export type FormattedExpression = {
  latex: string;
  text: string;
};

export type VelocityDisplayAxis = {
  label: string;
  initialComponent: FormattedExpression;
  currentComponent: FormattedExpression;
  equation: FormattedExpression;
};

export type VelocityDisplaySet = {
  axis1: VelocityDisplayAxis;
  axis2: VelocityDisplayAxis;
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
      candidate.symbol === term.symbol &&
      candidate.timePower === term.timePower &&
      candidate.trig === term.trig &&
      candidate.timeFactor === term.timeFactor,
  );
  if (existing) {
    existing.coefficient += term.coefficient;
  } else {
    terms.push({ ...term });
  }
};

const positionComponentTerms = (label: string, initialPositionValue: number): SymbolicTerm[] => {
  if (almostEqual(initialPositionValue, 0, EPSILON)) return [];
  const sign = initialPositionValue < -EPSILON ? -1 : 1;
  return [{ coefficient: sign, symbol: `${label}_0`, timePower: 0 }];
};

const multiplyTerms = (
  terms: SymbolicTerm[],
  coefficient: number,
  trig?: SymbolicTerm['trig'],
): SymbolicTerm[] => terms.map((term) => ({ ...term, coefficient: term.coefficient * coefficient, trig }));

type RelativePositionTerms = {
  x: SymbolicTerm[] | null;
  y: SymbolicTerm[] | null;
};

const snappedRelativePositionTerms = (
  params: ProjectileParameters,
  system: CoordinateSystem,
): RelativePositionTerms => {
  const origin = system.originWorld;
  let x: SymbolicTerm[] | null = null;
  let y: SymbolicTerm[] | null = null;

  if (almostEqual(origin.x, 0, EPSILON)) {
    x = [];
  } else if (almostEqual(origin.x, params.d1, EPSILON)) {
    x = [{ coefficient: -1, symbol: 'd_1', timePower: 0 }];
  } else if (almostEqual(origin.x, params.d1 + params.d2, EPSILON)) {
    x = [
      { coefficient: -1, symbol: 'd_1', timePower: 0 },
      { coefficient: -1, symbol: 'd_2', timePower: 0 },
    ];
  }

  if (almostEqual(origin.y, params.H, EPSILON)) {
    y = [];
  } else if (almostEqual(origin.y, 0, EPSILON)) {
    y = [{ coefficient: 1, symbol: 'H', timePower: 0 }];
  } else if (almostEqual(origin.y, params.h, EPSILON)) {
    y = [
      { coefficient: 1, symbol: 'H', timePower: 0 },
      { coefficient: -1, symbol: 'h', timePower: 0 },
    ];
  }

  return { x, y };
};

const hasCompleteRelativePositionTerms = (relative: RelativePositionTerms): relative is {
  x: SymbolicTerm[];
  y: SymbolicTerm[];
} => relative.x !== null && relative.y !== null;

const symbolicPositionComponentTerms = (
  params: ProjectileParameters,
  system: CoordinateSystem,
  axis: Vector2,
  axisIndex: 1 | 2,
  label: string,
  initialPositionValue: number,
): SymbolicTerm[] => {
  const axisX = snap(axis.x);
  const axisY = snap(axis.y);
  const relative = snappedRelativePositionTerms(params, system);

  if (isCardinal(axis)) {
    if (axisX !== 0) {
      return relative.x === null ? positionComponentTerms(label, initialPositionValue) : multiplyTerms(relative.x, axisX);
    }

    if (axisY !== 0) {
      return relative.y === null ? positionComponentTerms(label, initialPositionValue) : multiplyTerms(relative.y, axisY);
    }

    return positionComponentTerms(label, initialPositionValue);
  }

  if (!hasCompleteRelativePositionTerms(relative)) return positionComponentTerms(label, initialPositionValue);

  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;
  if (axisIndex === 1) {
    return [...multiplyTerms(relative.x, 1, 'cos'), ...multiplyTerms(relative.y, 1, 'sin')];
  }

  if (cross >= 0) {
    return [...multiplyTerms(relative.x, -1, 'sin'), ...multiplyTerms(relative.y, 1, 'cos')];
  }

  return [...multiplyTerms(relative.x, 1, 'sin'), ...multiplyTerms(relative.y, -1, 'cos')];
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

const symbolText = (symbol?: string): string => {
  if (symbol === 'v_x0' || symbol === 'v_y0') return symbol;
  return symbol?.replaceAll('_', '') ?? '';
};

const trigText = (trig: SymbolicTerm['trig'] | undefined, mode: 'latex' | 'text', theta: string): string => {
  if (!trig) return '';
  return mode === 'latex' ? `\\${trig}\\left(${theta}\\right)` : `${trig}(${theta})`;
};

const timeFactorText = (timeFactor: string | undefined, mode: 'latex' | 'text'): string => {
  if (!timeFactor) return '';
  return mode === 'latex' ? `\\left(${timeFactor}\\right)` : `(${timeFactor})`;
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
  const timeFactor = timeFactorText(term.timeFactor, mode);
  const symbolFactor = symbol && timeFactor ? `${symbol}${timeFactor}` : symbol;
  const includeOne = !symbolFactor && !time && !timeFactor && !trig;
  const coefficient = formatCoefficient(term.coefficient, mode, includeOne);
  const factors = [
    symbolFactor,
    time && !symbol ? time : '',
    time && symbol ? time : '',
    !symbol && timeFactor ? timeFactor : '',
    trig,
  ].filter(Boolean);
  const body = [coefficient, ...factors].filter(Boolean).join(' ');
  return `${sign}${body}`;
};

const cleanTerms = (terms: SymbolicTerm[]): SymbolicTerm[] =>
  terms
    .filter((term) => !almostEqual(term.coefficient, 0, EPSILON))
    .sort(
      (a, b) =>
        a.timePower - b.timePower ||
        symbolSortRank(a.symbol) - symbolSortRank(b.symbol) ||
        (a.symbol ?? '').localeCompare(b.symbol ?? '') ||
        (a.trig ?? '').localeCompare(b.trig ?? ''),
    );

const symbolSortRank = (symbol?: string): number => {
  const order = ['H', 'h', 'd_1', 'd_2', 'v_0', 'v_x0', 'v_y0', 'g'];
  const index = order.indexOf(symbol ?? '');
  return index === -1 ? order.length : index;
};

const formatTerms = (terms: SymbolicTerm[], mode: 'latex' | 'text', theta: string): string => {
  const cleaned = cleanTerms(terms);
  if (cleaned.length === 0) return '0';
  return cleaned.map((term, index) => formatSingleTerm(term, mode, index === 0, theta)).join('');
};

const formatEquationTerms = (
  terms: SymbolicTerm[],
  mode: 'latex' | 'text',
  theta: string,
  showInitialZero: boolean,
): string => {
  const cleaned = cleanTerms(terms);
  if (cleaned.length === 0) return '0';
  if (!showInitialZero) {
    return cleaned.map((term, index) => formatSingleTerm(term, mode, index === 0, theta)).join('');
  }

  return `0${cleaned.map((term) => formatSingleTerm(term, mode, false, theta)).join('')}`;
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

const genericVelocityComponentTerms = (
  axis: Vector2,
  axisIndex: 1 | 2,
  system: CoordinateSystem,
): SymbolicTerm[] => {
  const axisX = snap(axis.x);
  const axisY = snap(axis.y);

  if (isCardinal(axis)) {
    const terms: SymbolicTerm[] = [];
    if (axisX !== 0) terms.push({ coefficient: axisX, symbol: 'v_x0', timePower: 0 });
    if (axisY !== 0) terms.push({ coefficient: axisY, symbol: 'v_y0', timePower: 0 });
    return terms;
  }

  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;
  if (axisIndex === 1) {
    return [
      { coefficient: 1, symbol: 'v_x0', timePower: 0, trig: 'cos' },
      { coefficient: 1, symbol: 'v_y0', timePower: 0, trig: 'sin' },
    ];
  }

  if (cross >= 0) {
    return [
      { coefficient: -1, symbol: 'v_x0', timePower: 0, trig: 'sin' },
      { coefficient: 1, symbol: 'v_y0', timePower: 0, trig: 'cos' },
    ];
  }

  return [
    { coefficient: 1, symbol: 'v_x0', timePower: 0, trig: 'sin' },
    { coefficient: -1, symbol: 'v_y0', timePower: 0, trig: 'cos' },
  ];
};

const rotatedAccelerationComponentTerms = (axisIndex: 1 | 2, system: CoordinateSystem): SymbolicTerm[] => {
  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;

  if (axisIndex === 1) {
    return [{ coefficient: -1, symbol: 'g', timePower: 0, trig: 'sin' }];
  }

  return [{ coefficient: cross >= 0 ? -1 : 1, symbol: 'g', timePower: 0, trig: 'cos' }];
};

const axisEquation = (
  params: ProjectileParameters,
  label: string,
  axis: Vector2,
  system: CoordinateSystem,
  componentValues: { position: number; velocity: number; acceleration: number },
  axisIndex: 1 | 2,
): AxisEquation => {
  const position = symbolicPositionComponentTerms(params, system, axis, axisIndex, label, componentValues.position);
  const velocity = velocityComponentTerms(axis) ?? rotatedVelocityComponentTerms(axisIndex, system);
  const acceleration = accelerationComponentTerms(axis) ?? rotatedAccelerationComponentTerms(axisIndex, system);
  const equationTerms = buildEquationTerms(position, velocity, acceleration);
  const generalLatex = `${label}(t) = ${label}_0 + v_{${label},0} t + \\frac{1}{2} a_${label} t^2`;
  const latexTheta = formatTheta(system, 'latex');
  const textTheta = formatTheta(system, 'text');
  const showInitialZero = cleanTerms(position).length === 0 && almostEqual(componentValues.position, 0, EPSILON);
  const rightSideLatex = formatEquationTerms(equationTerms, 'latex', latexTheta, showInitialZero);
  const rightSideText = formatEquationTerms(equationTerms, 'text', textTheta, showInitialZero);

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
    axis1: axisEquation(params, system.label1, system.axis1, system, {
      position: components.position0.x,
      velocity: components.velocity0.x,
      acceleration: components.acceleration.x,
    }, 1),
    axis2: axisEquation(params, system.label2, system.axis2, system, {
      position: components.position0.y,
      velocity: components.velocity0.y,
      acceleration: components.acceleration.y,
    }, 2),
  };
};

const formatTime = (value: number): string => value.toFixed(2).replace(/\.?0+$/, '') || '0';

const formattedExpression = (terms: SymbolicTerm[], latexTheta: string, textTheta: string): FormattedExpression => ({
  latex: formatTerms(terms, 'latex', latexTheta),
  text: formatTerms(terms, 'text', textTheta),
});

const velocityEquationLabel = (label: string, mode: 'latex' | 'text'): string =>
  mode === 'latex' ? `v_{${label}}` : `v_${label}`;

const velocityDisplayAxis = (
  label: string,
  axis: Vector2,
  system: CoordinateSystem,
  axisIndex: 1 | 2,
  time: number,
): VelocityDisplayAxis => {
  const latexTheta = formatTheta(system, 'latex');
  const textTheta = formatTheta(system, 'text');
  const timeLabel = formatTime(time);
  const initial = genericVelocityComponentTerms(axis, axisIndex, system);
  const acceleration = accelerationComponentTerms(axis) ?? rotatedAccelerationComponentTerms(axisIndex, system);
  const current = [
    ...initial,
    ...acceleration.map((term) => ({
      ...term,
      timeFactor: timeLabel,
    })),
  ];
  const equation = [...initial, ...acceleration.map((term) => ({ ...term, timePower: 1 as TimePower }))];
  const equationRightSide = formattedExpression(equation, latexTheta, textTheta);

  return {
    label,
    initialComponent: formattedExpression(initial, latexTheta, textTheta),
    currentComponent: formattedExpression(current, latexTheta, textTheta),
    equation: {
      latex: `${velocityEquationLabel(label, 'latex')} = ${equationRightSide.latex}`,
      text: `${velocityEquationLabel(label, 'text')} = ${equationRightSide.text}`,
    },
  };
};

export const formatVelocityDisplaySet = (system: CoordinateSystem, time: number): VelocityDisplaySet => ({
  axis1: velocityDisplayAxis(system.label1, system.axis1, system, 1, time),
  axis2: velocityDisplayAxis(system.label2, system.axis2, system, 2, time),
});
