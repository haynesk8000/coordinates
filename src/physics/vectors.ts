export type Vector2 = {
  x: number;
  y: number;
};

export const vector = (x: number, y: number): Vector2 => ({ x, y });

export const add = (a: Vector2, b: Vector2): Vector2 => vector(a.x + b.x, a.y + b.y);

export const subtract = (a: Vector2, b: Vector2): Vector2 => vector(a.x - b.x, a.y - b.y);

export const scale = (value: Vector2, factor: number): Vector2 => vector(value.x * factor, value.y * factor);

export const dot = (a: Vector2, b: Vector2): number => a.x * b.x + a.y * b.y;

export const magnitude = (value: Vector2): number => Math.hypot(value.x, value.y);

export const normalize = (value: Vector2): Vector2 => {
  const length = magnitude(value);
  if (length === 0) {
    throw new Error('Cannot normalize a zero-length vector.');
  }
  return vector(value.x / length, value.y / length);
};

export const rotate = (value: Vector2, radians: number): Vector2 => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return vector(value.x * cos - value.y * sin, value.x * sin + value.y * cos);
};

export const perpendicularLeft = (value: Vector2): Vector2 => vector(-value.y, value.x);

export const almostEqual = (a: number, b: number, tolerance = 1e-9): boolean => Math.abs(a - b) <= tolerance;

export const almostVector = (a: Vector2, b: Vector2, tolerance = 1e-9): boolean =>
  almostEqual(a.x, b.x, tolerance) && almostEqual(a.y, b.y, tolerance);
