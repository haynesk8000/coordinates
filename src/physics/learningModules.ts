export type Point2 = { x: number; y: number };

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

export type ProjectileInputs = {
  speed: number;
  angleDegrees: number;
  gravity: number;
  initialHeight: number;
};

export const projectileFlightTime = (inputs: ProjectileInputs) => {
  const { speed, angleDegrees, gravity } = inputs;
  const verticalSpeed = speed * Math.sin(degreesToRadians(angleDegrees));
  return (verticalSpeed + Math.sqrt(verticalSpeed * verticalSpeed + 2 * gravity * inputs.initialHeight)) / gravity;
};

export const projectileAtTime = (inputs: ProjectileInputs, time: number) => {
  const angle = degreesToRadians(inputs.angleDegrees);
  const velocity0 = {
    x: inputs.speed * Math.cos(angle),
    y: inputs.speed * Math.sin(angle),
  };
  return {
    position: {
      x: velocity0.x * time,
      y: inputs.initialHeight + velocity0.y * time - 0.5 * inputs.gravity * time * time,
    },
    velocity: { x: velocity0.x, y: velocity0.y - inputs.gravity * time },
    acceleration: { x: 0, y: -inputs.gravity },
  };
};

export type LinearMotionInputs = {
  initialPosition: number;
  initialVelocity: number;
  acceleration: number;
};

export const linearMotionAtTime = (inputs: LinearMotionInputs, time: number) => ({
  position: inputs.initialPosition + inputs.initialVelocity * time + 0.5 * inputs.acceleration * time * time,
  velocity: inputs.initialVelocity + inputs.acceleration * time,
  acceleration: inputs.acceleration,
});

export type RelativeMotionInputs = {
  boatSpeed: number;
  headingDegrees: number;
  currentSpeed: number;
  riverWidth: number;
};

export const relativeVelocityState = (inputs: RelativeMotionInputs) => {
  const heading = degreesToRadians(inputs.headingDegrees);
  const boatRelativeWater = {
    x: inputs.boatSpeed * Math.cos(heading),
    y: inputs.boatSpeed * Math.sin(heading),
  };
  const waterRelativeGround = { x: inputs.currentSpeed, y: 0 };
  const boatRelativeGround = {
    x: boatRelativeWater.x + waterRelativeGround.x,
    y: boatRelativeWater.y,
  };
  const crossingTime = boatRelativeGround.y > 0 ? inputs.riverWidth / boatRelativeGround.y : Infinity;
  return {
    boatRelativeWater,
    waterRelativeGround,
    boatRelativeGround,
    crossingTime,
    downstreamDrift: Number.isFinite(crossingTime) ? boatRelativeGround.x * crossingTime : Infinity,
  };
};

export type CircularMotionInputs = {
  radius: number;
  angularSpeed: number;
  direction: 1 | -1;
};

export const circularMotionAtTime = (inputs: CircularMotionInputs, time: number) => {
  const theta = inputs.direction * inputs.angularSpeed * time;
  const position = { x: inputs.radius * Math.cos(theta), y: inputs.radius * Math.sin(theta) };
  const velocity = {
    x: -inputs.direction * inputs.angularSpeed * inputs.radius * Math.sin(theta),
    y: inputs.direction * inputs.angularSpeed * inputs.radius * Math.cos(theta),
  };
  const acceleration = {
    x: -(inputs.angularSpeed ** 2) * position.x,
    y: -(inputs.angularSpeed ** 2) * position.y,
  };
  return {
    theta,
    position,
    velocity,
    acceleration,
    speed: inputs.angularSpeed * inputs.radius,
    radialAcceleration: inputs.angularSpeed ** 2 * inputs.radius,
    period: (2 * Math.PI) / inputs.angularSpeed,
    frequency: inputs.angularSpeed / (2 * Math.PI),
  };
};

export const formatPhysicsNumber = (value: number, digits = 2) =>
  Number.isFinite(value) ? Number(value.toFixed(digits)).toString() : 'not reached';
