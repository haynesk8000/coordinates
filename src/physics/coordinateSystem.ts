import {
  dot,
  normalize,
  perpendicularLeft,
  rotate,
  scale,
  subtract,
  type Vector2,
  vector,
} from './vectors';
import {
  accelerationWorld,
  initialPositionWorld,
  initialVelocityWorld,
  type ProjectileParameters,
} from './projectile';

export type AxisLabels = 'xy' | 'ab' | 'rs' | 'custom';

export type CoordinateSystem = {
  originWorld: Vector2;
  axis1: Vector2;
  axis2: Vector2;
  label1: string;
  label2: string;
  name?: string;
  description?: string;
};

export type CoordinateComponents = {
  position0: Vector2;
  velocity0: Vector2;
  acceleration: Vector2;
};

export const makeCoordinateSystem = (
  originWorld: Vector2,
  axis1: Vector2,
  axis2: Vector2,
  label1 = 'x',
  label2 = 'y',
): CoordinateSystem => ({
  originWorld,
  axis1: normalize(axis1),
  axis2: normalize(axis2),
  label1,
  label2,
});

export const projectWorldPoint = (worldPoint: Vector2, system: CoordinateSystem): Vector2 => {
  const relative = subtract(worldPoint, system.originWorld);
  return vector(dot(relative, system.axis1), dot(relative, system.axis2));
};

export const projectWorldVector = (worldVector: Vector2, system: CoordinateSystem): Vector2 =>
  vector(dot(worldVector, system.axis1), dot(worldVector, system.axis2));

export const getCoordinateComponents = (
  params: ProjectileParameters,
  system: CoordinateSystem,
): CoordinateComponents => ({
  position0: projectWorldPoint(initialPositionWorld(params), system),
  velocity0: projectWorldVector(initialVelocityWorld(params), system),
  acceleration: projectWorldVector(accelerationWorld(params), system),
});

export const rotateCoordinateSystem = (system: CoordinateSystem, degrees: number): CoordinateSystem => {
  const radians = (degrees * Math.PI) / 180;
  return {
    ...system,
    axis1: normalize(rotate(system.axis1, radians)),
    axis2: normalize(rotate(system.axis2, radians)),
  };
};

export const flipAxis = (system: CoordinateSystem, axis: 1 | 2): CoordinateSystem => ({
  ...system,
  axis1: axis === 1 ? scale(system.axis1, -1) : system.axis1,
  axis2: axis === 2 ? scale(system.axis2, -1) : system.axis2,
});

export const setAxis1Angle = (system: CoordinateSystem, degrees: number): CoordinateSystem => {
  const radians = (degrees * Math.PI) / 180;
  const axis1 = vector(Math.cos(radians), Math.sin(radians));
  return {
    ...system,
    axis1,
    axis2: perpendicularLeft(axis1),
  };
};

export const setLabels = (system: CoordinateSystem, label1: string, label2: string): CoordinateSystem => ({
  ...system,
  label1,
  label2,
});

export const swapCoordinateVariables = (system: CoordinateSystem): CoordinateSystem => ({
  ...system,
  axis1: system.axis2,
  axis2: system.axis1,
  label1: system.label2,
  label2: system.label1,
});

export const coordinateAtTime = (
  params: ProjectileParameters,
  system: CoordinateSystem,
  time: number,
): Vector2 => {
  const components = getCoordinateComponents(params, system);
  return vector(
    components.position0.x + components.velocity0.x * time + 0.5 * components.acceleration.x * time * time,
    components.position0.y + components.velocity0.y * time + 0.5 * components.acceleration.y * time * time,
  );
};
