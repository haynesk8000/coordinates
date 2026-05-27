import { describe, expect, it } from 'vitest';
import { makeCoordinateSystem } from '../physics/coordinateSystem';
import { defaultParameters } from '../physics/projectile';
import {
  clampSystemToScene,
  clampOriginToScene,
  createSceneBounds,
  INTERACTIVE_EDGE_INSET_PX,
  SCENE_DRAWING_HEIGHT,
  SCENE_SCREEN_HEIGHT,
  SCENE_SCREEN_WIDTH,
  sceneScreenToWorld,
  screenAxisEndpoint,
  worldToSceneScreen,
} from '../physics/sceneGeometry';
import { vector } from '../physics/vectors';

describe('scene geometry', () => {
  it('uses fixed bounds with triple the previous whitespace above the cliff', () => {
    const bounds = createSceneBounds(defaultParameters);
    expect(bounds.maxY - defaultParameters.H).toBe(24);
  });

  it('adds 20 pixels below the drawing area for the interactive window', () => {
    expect(SCENE_SCREEN_HEIGHT - SCENE_DRAWING_HEIGHT).toBe(20);
  });

  it('lets the origin and rotation handles move within 30 pixels of the interactive window edge', () => {
    const bounds = createSceneBounds(defaultParameters);
    const system = makeCoordinateSystem(vector(100, -100), vector(1, 0), vector(0, -1));
    const origin = clampOriginToScene(system.originWorld, system, bounds);
    const originScreen = worldToSceneScreen(origin, bounds);
    const axis1End = screenAxisEndpoint(origin, system.axis1, bounds);
    const axis2End = screenAxisEndpoint(origin, system.axis2, bounds);
    const tolerancePx = 0.001;

    for (const handle of [originScreen, axis1End, axis2End]) {
      expect(handle.x).toBeGreaterThanOrEqual(INTERACTIVE_EDGE_INSET_PX - tolerancePx);
      expect(handle.x).toBeLessThanOrEqual(SCENE_SCREEN_WIDTH - INTERACTIVE_EDGE_INSET_PX + tolerancePx);
      expect(handle.y).toBeGreaterThanOrEqual(INTERACTIVE_EDGE_INSET_PX - tolerancePx);
      expect(handle.y).toBeLessThanOrEqual(SCENE_SCREEN_HEIGHT - INTERACTIVE_EDGE_INSET_PX + tolerancePx);
    }
  });

  it('snaps the origin x coordinate to an invisible vertical guide line within 5 screen pixels', () => {
    const bounds = createSceneBounds(defaultParameters);
    const freeY = defaultParameters.h + 2;
    const guideScreen = worldToSceneScreen(vector(defaultParameters.d1, freeY), bounds);
    const nearGuide = sceneScreenToWorld(vector(guideScreen.x + 4, guideScreen.y), bounds);
    const system = makeCoordinateSystem(nearGuide, vector(1, 0), vector(0, 1));

    const snapped = clampSystemToScene(system, defaultParameters);

    expect(snapped.originWorld.x).toBe(defaultParameters.d1);
    expect(snapped.originWorld.y).toBeCloseTo(nearGuide.y);
  });

  it('snaps the origin y coordinate to an invisible horizontal guide line within 5 screen pixels', () => {
    const bounds = createSceneBounds(defaultParameters);
    const freeX = 2;
    const guideScreen = worldToSceneScreen(vector(freeX, defaultParameters.H), bounds);
    const nearGuide = sceneScreenToWorld(vector(guideScreen.x, guideScreen.y + 4), bounds);
    const system = makeCoordinateSystem(nearGuide, vector(1, 0), vector(0, 1));

    const snapped = clampSystemToScene(system, defaultParameters);

    expect(snapped.originWorld.x).toBeCloseTo(nearGuide.x);
    expect(snapped.originWorld.y).toBe(defaultParameters.H);
  });

  it('leaves coordinates unsnapped when guide lines are farther than 5 screen pixels away', () => {
    const bounds = createSceneBounds(defaultParameters);
    const freePoint = vector(3, 11);
    const system = makeCoordinateSystem(freePoint, vector(1, 0), vector(0, 1));

    const snapped = clampSystemToScene(system, defaultParameters);

    expect(snapped.originWorld.x).toBeCloseTo(freePoint.x);
    expect(snapped.originWorld.y).toBeCloseTo(freePoint.y);
  });

  it('draws both coordinate axes at the same screen length', () => {
    const bounds = createSceneBounds(defaultParameters);
    const system = makeCoordinateSystem(vector(0, defaultParameters.H), vector(1, 0), vector(0, 1));
    const originScreen = screenAxisEndpoint(system.originWorld, vector(0, 0), bounds);
    const axis1End = screenAxisEndpoint(system.originWorld, system.axis1, bounds);
    const axis2End = screenAxisEndpoint(system.originWorld, system.axis2, bounds);
    const axis1Length = Math.hypot(axis1End.x - originScreen.x, axis1End.y - originScreen.y);
    const axis2Length = Math.hypot(axis2End.x - originScreen.x, axis2End.y - originScreen.y);

    expect(axis1Length).toBeCloseTo(axis2Length);
  });

  it('keeps rotated coordinate axes visually perpendicular', () => {
    const bounds = createSceneBounds(defaultParameters);
    const rootHalf = Math.SQRT1_2;
    const system = makeCoordinateSystem(
      vector(0, defaultParameters.H),
      vector(rootHalf, rootHalf),
      vector(-rootHalf, rootHalf),
    );
    const originScreen = screenAxisEndpoint(system.originWorld, vector(0, 0), bounds);
    const axis1End = screenAxisEndpoint(system.originWorld, system.axis1, bounds);
    const axis2End = screenAxisEndpoint(system.originWorld, system.axis2, bounds);
    const axis1Screen = vector(axis1End.x - originScreen.x, axis1End.y - originScreen.y);
    const axis2Screen = vector(axis2End.x - originScreen.x, axis2End.y - originScreen.y);

    expect(axis1Screen.x * axis2Screen.x + axis1Screen.y * axis2Screen.y).toBeCloseTo(0);
  });
});
