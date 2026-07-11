import { describe, expect, it } from 'vitest';
import {
  circularMotionAtTime,
  linearMotionAtTime,
  projectileAtTime,
  projectileFlightTime,
  relativeVelocityState,
} from '../physics/learningModules';

describe('shared learning module physics', () => {
  it('keeps projectile horizontal velocity constant and lands at flight time', () => {
    const inputs = { speed: 20, angleDegrees: 35, gravity: 9.8, initialHeight: 4 };
    const flightTime = projectileFlightTime(inputs);
    const middle = projectileAtTime(inputs, flightTime / 2);
    const landing = projectileAtTime(inputs, flightTime);

    expect(middle.velocity.x).toBeCloseTo(20 * Math.cos(35 * Math.PI / 180));
    expect(landing.position.y).toBeCloseTo(0);
    expect(landing.acceleration).toEqual({ x: 0, y: -9.8 });
  });

  it('generates position and velocity for constant acceleration motion diagrams', () => {
    const state = linearMotionAtTime({ initialPosition: 1, initialVelocity: 2, acceleration: 3 }, 2);
    expect(state.position).toBe(11);
    expect(state.velocity).toBe(8);
    expect(state.acceleration).toBe(3);
  });

  it('adds boat/water and water/ground velocities component by component', () => {
    const state = relativeVelocityState({ boatSpeed: 5, headingDegrees: 90, currentSpeed: 2, riverWidth: 20 });
    expect(state.boatRelativeGround.x).toBeCloseTo(2);
    expect(state.boatRelativeGround.y).toBeCloseTo(5);
    expect(state.crossingTime).toBeCloseTo(4);
    expect(state.downstreamDrift).toBeCloseTo(8);
  });

  it('keeps circular velocity tangent and acceleration inward', () => {
    const state = circularMotionAtTime({ radius: 4, angularSpeed: 2, direction: 1 }, 0.7);
    const velocityDotPosition = state.velocity.x * state.position.x + state.velocity.y * state.position.y;
    const accelerationDotPosition = state.acceleration.x * state.position.x + state.acceleration.y * state.position.y;

    expect(velocityDotPosition).toBeCloseTo(0);
    expect(accelerationDotPosition).toBeLessThan(0);
    expect(state.speed).toBe(8);
    expect(state.radialAcceleration).toBe(16);
  });
});
