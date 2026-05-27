import type { CoordinateSystem } from './coordinateSystem';
import type { ProjectileParameters } from './projectile';
import { vector, type Vector2 } from './vectors';

export type SceneBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

export const SCENE_AXIS_LENGTH = 8;
export const SCENE_SCREEN_WIDTH = 860;
export const SCENE_DRAWING_HEIGHT = 470;
export const SCENE_SCREEN_HEIGHT = SCENE_DRAWING_HEIGHT + 20;
export const INTERACTIVE_EDGE_INSET_PX = 30;
export const GUIDE_LINE_SNAP_DISTANCE_PX = 5;

const sideMargin = 12;
const belowGroundMargin = 10;
const aboveCliffMargin = 24;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sceneTransform = (bounds: SceneBounds) => {
  const scaleFactor = Math.min(SCENE_SCREEN_WIDTH / bounds.width, SCENE_DRAWING_HEIGHT / bounds.height);
  return {
    scaleFactor,
    offsetX: (SCENE_SCREEN_WIDTH - bounds.width * scaleFactor) / 2,
    offsetY: (SCENE_DRAWING_HEIGHT - bounds.height * scaleFactor) / 2,
  };
};

export const createSceneBounds = (params: ProjectileParameters): SceneBounds => {
  const physicalRight = Math.max(params.d1 + params.d2, params.d1, 0);
  const minX = -sideMargin;
  const maxX = physicalRight + sideMargin;
  const minY = -belowGroundMargin;
  const maxY = Math.max(params.H, params.h, 0) + aboveCliffMargin;

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
};

const nearestGuideLineValue = (
  originWorld: Vector2,
  originScreen: Vector2,
  bounds: SceneBounds,
  guideValues: number[],
  axis: 'x' | 'y',
  thresholdPx: number,
): number => {
  const currentValue = axis === 'x' ? originWorld.x : originWorld.y;
  let nearestValue = currentValue;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const guideValue of guideValues) {
    const guidePoint =
      axis === 'x' ? vector(guideValue, originWorld.y) : vector(originWorld.x, guideValue);
    const guideScreen = worldToSceneScreen(guidePoint, bounds);
    const distance = axis === 'x'
      ? Math.abs(originScreen.x - guideScreen.x)
      : Math.abs(originScreen.y - guideScreen.y);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestValue = guideValue;
    }
  }

  return nearestDistance <= thresholdPx ? nearestValue : currentValue;
};

export const snapOriginToGuideLines = (
  originWorld: Vector2,
  params: ProjectileParameters,
  bounds: SceneBounds,
  thresholdPx = GUIDE_LINE_SNAP_DISTANCE_PX,
): Vector2 => {
  const originScreen = worldToSceneScreen(originWorld, bounds);
  const snapX = nearestGuideLineValue(
    originWorld,
    originScreen,
    bounds,
    [0, params.d1, params.d1 + params.d2],
    'x',
    thresholdPx,
  );
  const snapY = nearestGuideLineValue(
    originWorld,
    originScreen,
    bounds,
    [0, params.h, params.H],
    'y',
    thresholdPx,
  );

  return vector(snapX, snapY);
};

export const clampOriginToScene = (
  originWorld: Vector2,
  system: CoordinateSystem,
  bounds: SceneBounds,
  axisLength = SCENE_AXIS_LENGTH,
): Vector2 => {
  const screen = worldToSceneScreen(originWorld, bounds);
  const handleOffsets = [
    vector(0, 0),
    subtractScreen(screenAxisEndpoint(originWorld, system.axis1, bounds, axisLength), screen),
    subtractScreen(screenAxisEndpoint(originWorld, system.axis2, bounds, axisLength), screen),
  ];
  const minOffsetX = Math.min(...handleOffsets.map((offset) => offset.x));
  const maxOffsetX = Math.max(...handleOffsets.map((offset) => offset.x));
  const minOffsetY = Math.min(...handleOffsets.map((offset) => offset.y));
  const maxOffsetY = Math.max(...handleOffsets.map((offset) => offset.y));
  const minScreenX = INTERACTIVE_EDGE_INSET_PX - minOffsetX;
  const maxScreenX = SCENE_SCREEN_WIDTH - INTERACTIVE_EDGE_INSET_PX - maxOffsetX;
  const minScreenY = INTERACTIVE_EDGE_INSET_PX - minOffsetY;
  const maxScreenY = SCENE_SCREEN_HEIGHT - INTERACTIVE_EDGE_INSET_PX - maxOffsetY;
  const clampedScreen = vector(
    clamp(screen.x, Math.min(minScreenX, maxScreenX), Math.max(minScreenX, maxScreenX)),
    clamp(screen.y, Math.min(minScreenY, maxScreenY), Math.max(minScreenY, maxScreenY)),
  );

  return sceneScreenToWorld(clampedScreen, bounds);
};

export const clampSystemToScene = (
  system: CoordinateSystem,
  params: ProjectileParameters,
  axisLength = SCENE_AXIS_LENGTH,
): CoordinateSystem => {
  const bounds = createSceneBounds(params);
  const clampedOrigin = clampOriginToScene(system.originWorld, system, bounds, axisLength);
  return {
    ...system,
    originWorld: snapOriginToGuideLines(clampedOrigin, params, bounds),
  };
};

const subtractScreen = (end: Vector2, start: Vector2): Vector2 => vector(end.x - start.x, end.y - start.y);

export const worldToSceneScreen = (point: Vector2, bounds: SceneBounds): Vector2 => {
  const transform = sceneTransform(bounds);
  return vector(
    transform.offsetX + (point.x - bounds.minX) * transform.scaleFactor,
    transform.offsetY + (bounds.maxY - point.y) * transform.scaleFactor,
  );
};

export const sceneScreenToWorld = (point: Vector2, bounds: SceneBounds): Vector2 => {
  const transform = sceneTransform(bounds);
  return vector(
    bounds.minX + (point.x - transform.offsetX) / transform.scaleFactor,
    bounds.maxY - (point.y - transform.offsetY) / transform.scaleFactor,
  );
};

export const screenAxisLength = (bounds: SceneBounds, axisLength = SCENE_AXIS_LENGTH): number =>
  axisLength * sceneTransform(bounds).scaleFactor;

export const screenAxisEndpoint = (
  originWorld: Vector2,
  axis: Vector2,
  bounds: SceneBounds,
  axisLength = SCENE_AXIS_LENGTH,
): Vector2 => {
  const originScreen = worldToSceneScreen(originWorld, bounds);
  const transform = sceneTransform(bounds);
  const screenDirection = vector(axis.x * transform.scaleFactor, -axis.y * transform.scaleFactor);
  const length = Math.hypot(screenDirection.x, screenDirection.y);
  if (length === 0) return originScreen;
  const fixedLength = screenAxisLength(bounds, axisLength);

  return vector(
    originScreen.x + (screenDirection.x / length) * fixedLength,
    originScreen.y + (screenDirection.y / length) * fixedLength,
  );
};
