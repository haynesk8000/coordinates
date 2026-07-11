import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  MAX_ROTATION_UNITS,
  MIN_ROTATION_UNITS,
  ROTATION_UNIT_RADIANS,
  getCoordinateComponents,
  type CoordinateSystem,
} from '../physics/coordinateSystem';
import {
  initialPositionWorld,
  landingTime,
  trajectorySamples,
  worldVelocityAtTime,
  worldPositionAtTime,
  type ProjectileParameters,
} from '../physics/projectile';
import { add, almostEqual, magnitude, scale, subtract, type Vector2, vector } from '../physics/vectors';
import {
  clampSystemToScene,
  createSceneBounds,
  SCENE_AXIS_LENGTH,
  SCENE_SCREEN_HEIGHT,
  SCENE_SCREEN_WIDTH,
  sceneScreenToWorld,
  screenAxisEndpoint,
  worldToSceneScreen,
} from '../physics/sceneGeometry';

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
  time: number;
  caption?: string;
  onSystemChange?: (system: CoordinateSystem) => void;
  onRotationUnitsChange?: (units: number) => void;
  onAxisHandleInteraction?: () => void;
  rotationUnits?: number;
  interactive?: boolean;
  small?: boolean;
  showInitialCoordinateGuides?: boolean;
};

const screenWidth = SCENE_SCREEN_WIDTH;
const screenHeight = SCENE_SCREEN_HEIGHT;
const axis2QuarterTurnUnits = 6;

const clampRotationUnits = (units: number) => Math.min(MAX_ROTATION_UNITS, Math.max(MIN_ROTATION_UNITS, units));

type DragTarget = 'origin' | 'axis1' | 'axis2' | null;

const format = (value: number) => value.toFixed(1).replace(/\.0$/, '');

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const guideLineFromAnchor = (
  anchor: number,
  length: number,
  direction: number,
  min: number,
  max: number,
): { start: number; end: number } => {
  const safeDirection = direction === 0 ? 1 : direction;
  let start = anchor;
  let end = anchor + safeDirection * length;

  if (Math.min(start, end) < min) {
    const shift = min - Math.min(start, end);
    start += shift;
    end += shift;
  }

  if (Math.max(start, end) > max) {
    const shift = max - Math.max(start, end);
    start += shift;
    end += shift;
  }

  return { start, end };
};

export function SceneCanvas({
  params,
  system,
  time,
  caption,
  onSystemChange,
  onRotationUnitsChange,
  onAxisHandleInteraction,
  rotationUnits,
  interactive = false,
  small = false,
  showInitialCoordinateGuides = false,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<DragTarget>(null);
  const bounds = useMemo(() => createSceneBounds(params), [params]);
  const projectile = worldPositionAtTime(params, time);
  const currentVelocity = worldVelocityAtTime(params, time);
  const initialPosition = initialPositionWorld(params);
  const initialCoordinates = getCoordinateComponents(params, system).position0;
  const path = trajectorySamples(params);
  const axisLength = SCENE_AXIS_LENGTH;

  useEffect(() => {
    if (!interactive) return;
    const clampedSystem = clampSystemToScene(system, params, axisLength);
    if (
      Math.abs(clampedSystem.originWorld.x - system.originWorld.x) > 0.001 ||
      Math.abs(clampedSystem.originWorld.y - system.originWorld.y) > 0.001
    ) {
      onSystemChange?.(clampedSystem);
    }
  }, [axisLength, interactive, onSystemChange, params, system]);

  const toScreen = (point: Vector2): Vector2 =>
    worldToSceneScreen(point, bounds);

  const toWorld = (clientX: number, clientY: number): Vector2 => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return system.originWorld;
    const sx = ((clientX - rect.left) / rect.width) * screenWidth;
    const sy = ((clientY - rect.top) / rect.height) * screenHeight;
    return sceneScreenToWorld(vector(sx, sy), bounds);
  };

  const updateOrigin = (originWorld: Vector2) => {
    const nextSystem = clampSystemToScene({
      ...system,
      originWorld,
    }, params, axisLength);
    onSystemChange?.(nextSystem);
  };

  const nearestRotationEquivalent = (rawUnits: number) => {
    const referenceUnits = rotationUnits ?? Math.round(Math.atan2(system.axis1.y, system.axis1.x) / ROTATION_UNIT_RADIANS);
    const candidates = [-48, -24, 0, 24, 48]
      .map((offset) => rawUnits + offset)
      .filter((units) => units >= MIN_ROTATION_UNITS && units <= MAX_ROTATION_UNITS);
    const nearest = candidates.reduce(
      (best, units) => (Math.abs(units - referenceUnits) < Math.abs(best - referenceUnits) ? units : best),
      candidates[0] ?? rawUnits,
    );
    return clampRotationUnits(nearest);
  };

  const updateRotationFromPointer = (target: 'axis1' | 'axis2', pointerWorld: Vector2) => {
    const fromOrigin = subtract(pointerWorld, system.originWorld);
    if (magnitude(fromOrigin) < 0.35) return;

    const draggedAxisUnits = Math.round(Math.atan2(fromOrigin.y, fromOrigin.x) / ROTATION_UNIT_RADIANS);
    const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;
    const axis1Units =
      target === 'axis1'
        ? draggedAxisUnits
        : draggedAxisUnits + (cross >= 0 ? -axis2QuarterTurnUnits : axis2QuarterTurnUnits);

    onRotationUnitsChange?.(nearestRotationEquivalent(axis1Units));
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging || !interactive) return;
    const pointerWorld = toWorld(event.clientX, event.clientY);
    if (dragging === 'origin') {
      updateOrigin(pointerWorld);
    } else {
      onAxisHandleInteraction?.();
      updateRotationFromPointer(dragging, pointerWorld);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (!interactive) return;
    const step = event.shiftKey ? 2 : 0.5;
    const deltas: Record<string, Vector2> = {
      ArrowLeft: vector(-step, 0),
      ArrowRight: vector(step, 0),
      ArrowUp: vector(0, step),
      ArrowDown: vector(0, -step),
    };
    const delta = deltas[event.key];
    if (delta) {
      event.preventDefault();
      updateOrigin(add(system.originWorld, delta));
    }
  };

  const pathD = path
    .map((point, index) => {
      const screen = toScreen(point);
      return `${index === 0 ? 'M' : 'L'} ${screen.x.toFixed(2)} ${screen.y.toFixed(2)}`;
    })
    .join(' ');

  const line = (start: Vector2, end: Vector2) => {
    const a = toScreen(start);
    const b = toScreen(end);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  };

  const startDrag = (target: DragTarget, event: PointerEvent<SVGElement>) => {
    if (!interactive) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
    setDragging(target);
    if (target === 'axis1' || target === 'axis2') {
      updateRotationFromPointer(target, toWorld(event.clientX, event.clientY));
    }
  };

  const axis1EndScreen = screenAxisEndpoint(system.originWorld, system.axis1, bounds, axisLength);
  const axis2EndScreen = screenAxisEndpoint(system.originWorld, system.axis2, bounds, axisLength);
  const axis1End = sceneScreenToWorld(axis1EndScreen, bounds);
  const axis2End = sceneScreenToWorld(axis2EndScreen, bounds);
  const velocityVectorScale = 0.42;
  const horizontalVelocityEnd = add(projectile, scale(vector(params.v0, 0), velocityVectorScale));
  const verticalVelocityEnd = add(projectile, scale(vector(0, currentVelocity.y), velocityVectorScale));
  const showVerticalVelocity = !almostEqual(currentVelocity.y, 0, 1e-8);
  const positionLine = line(system.originWorld, projectile);
  const wallBase = toScreen(vector(params.d1, 0));
  const wallTop = toScreen(vector(params.d1, params.h));
  const groundLeft = toScreen(vector(bounds.minX, 0));
  const groundRight = toScreen(vector(bounds.maxX, 0));
  const cliffTop = toScreen(vector(0, params.H));
  const cliffBase = toScreen(vector(0, 0));
  const projectileScreen = toScreen(projectile);
  const initialScreen = toScreen(initialPosition);
  const originScreen = toScreen(system.originWorld);
  const impact = toScreen(worldPositionAtTime(params, landingTime(params)));
  const d1Y = groundRight.y + 22;
  const d2Y = groundRight.y + 48;
  const guideInset = 34;
  const dimensionTickSize = 7;
  const cliffHeightDimensionX = Math.max(guideInset, cliffBase.x - 28);
  const cliffHeightLabelAnchor = cliffHeightDimensionX - 16 > guideInset ? 'end' : 'start';
  const cliffHeightLabelX = cliffHeightLabelAnchor === 'end' ? cliffHeightDimensionX - 10 : cliffHeightDimensionX + 10;
  const wallHeightDimensionX = Math.min(screenWidth - guideInset, wallBase.x + 24);
  const wallHeightLabelAnchor = wallHeightDimensionX + 32 < screenWidth - guideInset ? 'start' : 'end';
  const wallHeightLabelX = wallHeightLabelAnchor === 'start' ? wallHeightDimensionX + 10 : wallHeightDimensionX - 10;
  const oneMeterScreen = toScreen(vector(1, 0));
  const zeroMeterScreen = toScreen(vector(0, 0));
  const pixelsPerMeter = Math.hypot(oneMeterScreen.x - zeroMeterScreen.x, oneMeterScreen.y - zeroMeterScreen.y);
  const x0Length = Math.abs(initialCoordinates.x) * pixelsPerMeter;
  const y0Length = Math.abs(initialCoordinates.y) * pixelsPerMeter;
  const xGuideY = 28;
  const yGuideX = screenWidth - 34;
  const xDirection = Math.sign(originScreen.x - initialScreen.x) || Math.sign(-initialCoordinates.x);
  const yDirection = Math.sign(originScreen.y - initialScreen.y) || Math.sign(-initialCoordinates.y);
  const xGuide = guideLineFromAnchor(
    clamp(initialScreen.x, guideInset, screenWidth - guideInset),
    x0Length,
    xDirection,
    guideInset,
    screenWidth - guideInset,
  );
  const yGuide = guideLineFromAnchor(
    clamp(initialScreen.y, guideInset, screenHeight - guideInset),
    y0Length,
    yDirection,
    guideInset,
    screenHeight - guideInset,
  );
  const xGuideMid = (xGuide.start + xGuide.end) / 2;
  const yGuideMid = (yGuide.start + yGuide.end) / 2;
  const initialLabel1 = `${system.label1}0`;
  const initialLabel2 = `${system.label2}0`;
  const initialCoordinateGuideLabel = `Initial coordinate guides for ${initialLabel1} and ${initialLabel2}`;
  const gravityReferenceX = 62;
  const gravityReferenceStartY = 106;
  const gravityReferenceEndY = 158;

  return (
    <figure className={small ? 'scene small-scene' : 'scene'}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${screenWidth} ${screenHeight}`}
        role={interactive ? 'application' : 'img'}
        aria-label="Projectile scene with cliff, wall, trajectory, and coordinate axes"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
      >
        <defs>
          <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#222222" />
          </marker>
          <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#555555" />
          </marker>
          <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#333333" />
          </marker>
          <marker id="arrow-purple" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#888888" />
          </marker>
        </defs>

        <rect width={screenWidth} height={screenHeight} className="sky" />
        <line {...line(vector(bounds.minX, 0), vector(bounds.maxX, 0))} className="ground-line" />
        <polygon
          points={`${groundLeft.x},${groundLeft.y} ${cliffBase.x},${cliffBase.y} ${cliffTop.x},${cliffTop.y} ${groundLeft.x},${cliffTop.y}`}
          className="cliff"
        />
        <g className="height-dimension" data-testid="height-dimension-H" aria-label="H vertical measurement">
          <title>H vertical measurement</title>
          <line
            x1={cliffHeightDimensionX}
            y1={cliffBase.y}
            x2={cliffHeightDimensionX}
            y2={cliffTop.y}
            className="measure-line"
          />
          <line
            x1={cliffHeightDimensionX - dimensionTickSize}
            y1={cliffBase.y}
            x2={cliffHeightDimensionX + dimensionTickSize}
            y2={cliffBase.y}
            className="dimension-tick"
          />
          <line
            x1={cliffHeightDimensionX - dimensionTickSize}
            y1={cliffTop.y}
            x2={cliffHeightDimensionX + dimensionTickSize}
            y2={cliffTop.y}
            className="dimension-tick"
          />
          <text
            x={cliffHeightLabelX}
            y={(cliffBase.y + cliffTop.y) / 2}
            className="scene-label text-halo"
            textAnchor={cliffHeightLabelAnchor}
            dominantBaseline="middle"
          >
            H
          </text>
        </g>
        <rect
          x={wallBase.x - 5}
          y={wallTop.y}
          width="10"
          height={wallBase.y - wallTop.y}
          rx="2"
          className="wall"
        />
        <g className="height-dimension" data-testid="height-dimension-h" aria-label="h vertical measurement">
          <title>h vertical measurement</title>
          <line
            x1={wallHeightDimensionX}
            y1={wallBase.y}
            x2={wallHeightDimensionX}
            y2={wallTop.y}
            className="measure-line"
          />
          <line
            x1={wallHeightDimensionX - dimensionTickSize}
            y1={wallBase.y}
            x2={wallHeightDimensionX + dimensionTickSize}
            y2={wallBase.y}
            className="dimension-tick"
          />
          <line
            x1={wallHeightDimensionX - dimensionTickSize}
            y1={wallTop.y}
            x2={wallHeightDimensionX + dimensionTickSize}
            y2={wallTop.y}
            className="dimension-tick"
          />
          <text
            x={wallHeightLabelX}
            y={(wallBase.y + wallTop.y) / 2}
            className="scene-label text-halo"
            textAnchor={wallHeightLabelAnchor}
            dominantBaseline="middle"
          >
            h
          </text>
        </g>
        <line x1={cliffBase.x} y1={d1Y} x2={wallBase.x} y2={d1Y} className="dimension" />
        <text x={(cliffBase.x + wallBase.x) / 2 - 8} y={d1Y + 17} className="scene-label">
          d1
        </text>
        <line x1={wallBase.x} y1={d2Y} x2={impact.x} y2={d2Y} className="dimension" />
        <text x={(wallBase.x + impact.x) / 2 - 8} y={d2Y + 17} className="scene-label">
          d2
        </text>

        <path d={pathD} className="trajectory" />
        {showInitialCoordinateGuides ? (
          <g
            className="initial-coordinate-guides"
            data-testid="initial-coordinate-guides"
            aria-label={initialCoordinateGuideLabel}
          >
            <title>{initialCoordinateGuideLabel}</title>
            <line
              x1={xGuide.start}
              y1={xGuideY}
              x2={xGuide.end}
              y2={xGuideY}
              className="initial-guide-line"
              data-testid="initial-guide-axis1"
            />
            <line x1={xGuide.start} y1={xGuideY - 7} x2={xGuide.start} y2={xGuideY + 7} className="initial-guide-tick" />
            <line x1={xGuide.end} y1={xGuideY - 7} x2={xGuide.end} y2={xGuideY + 7} className="initial-guide-tick" />
            <text x={xGuideMid} y={xGuideY - 10} className="initial-guide-label text-halo" textAnchor="middle">
              {initialLabel1}
            </text>
            <line
              x1={yGuideX}
              y1={yGuide.start}
              x2={yGuideX}
              y2={yGuide.end}
              className="initial-guide-line"
              data-testid="initial-guide-axis2"
            />
            <line x1={yGuideX - 7} y1={yGuide.start} x2={yGuideX + 7} y2={yGuide.start} className="initial-guide-tick" />
            <line x1={yGuideX - 7} y1={yGuide.end} x2={yGuideX + 7} y2={yGuide.end} className="initial-guide-tick" />
            <text
              x={yGuideX - 10}
              y={yGuideMid}
              className="initial-guide-label text-halo"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {initialLabel2}
            </text>
          </g>
        ) : null}
        <line {...positionLine} className="position-vector" markerEnd="url(#arrow-purple)" />
        <line
          {...line(projectile, horizontalVelocityEnd)}
          className="velocity-vector"
          markerEnd="url(#arrow-green)"
          data-testid="projectile-vx-vector"
        />
        {showVerticalVelocity ? (
          <>
            <line
              {...line(projectile, verticalVelocityEnd)}
              className="velocity-vector"
              markerEnd="url(#arrow-green)"
              data-testid="projectile-vy-vector"
            />
            <text
              x={toScreen(verticalVelocityEnd).x + 6}
              y={toScreen(verticalVelocityEnd).y + (currentVelocity.y < 0 ? 16 : -6)}
              className="vector-label velocity"
            >
              v<tspan baselineShift="sub" fontSize="12">y</tspan>
            </text>
          </>
        ) : null}
        <text x={toScreen(horizontalVelocityEnd).x + 6} y={toScreen(horizontalVelocityEnd).y - 4} className="vector-label velocity">
          v<tspan baselineShift="sub" fontSize="12">x</tspan>
        </text>
        <line
          x1={gravityReferenceX}
          y1={gravityReferenceStartY}
          x2={gravityReferenceX}
          y2={gravityReferenceEndY}
          className="accel-vector gravity-reference-vector"
          markerEnd="url(#arrow-red)"
          data-testid="gravity-reference-vector"
        />
        <text x={gravityReferenceX + 9} y={gravityReferenceEndY + 4} className="vector-label accel">
          g
        </text>

        <line {...line(system.originWorld, axis1End)} className="axis axis-one" markerEnd="url(#arrow-blue)" />
        <line {...line(system.originWorld, axis2End)} className="axis axis-two" markerEnd="url(#arrow-blue)" />
        {interactive ? (
          <>
            <line
              {...line(system.originWorld, axis1End)}
              className="axis-hit-zone"
              aria-hidden="true"
              onPointerDown={(event) => startDrag('axis1', event)}
            />
            <line
              {...line(system.originWorld, axis2End)}
              className="axis-hit-zone"
              aria-hidden="true"
              onPointerDown={(event) => startDrag('axis2', event)}
            />
            <circle
              cx={toScreen(axis1End).x}
              cy={toScreen(axis1End).y}
              r="7"
              className="axis-rotation-handle"
              aria-hidden="true"
              onPointerDown={(event) => startDrag('axis1', event)}
            />
            <circle
              cx={toScreen(axis2End).x}
              cy={toScreen(axis2End).y}
              r="7"
              className="axis-rotation-handle"
              aria-hidden="true"
              onPointerDown={(event) => startDrag('axis2', event)}
            />
          </>
        ) : null}
        <text x={toScreen(axis1End).x + 8} y={toScreen(axis1End).y - 6} className="axis-label">
          +{system.label1}
        </text>
        <text x={toScreen(axis2End).x + 8} y={toScreen(axis2End).y - 6} className="axis-label">
          +{system.label2}
        </text>

        <circle cx={projectileScreen.x} cy={projectileScreen.y} r="8" className="projectile-dot" />
        <g
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? 'slider' : undefined}
          aria-label="Coordinate origin. Drag or use arrow keys to move it."
          aria-valuetext={`origin X ${format(system.originWorld.x)} meters, Y ${format(system.originWorld.y)} meters`}
          onPointerDown={(event) => {
            startDrag('origin', event);
          }}
          onKeyDown={handleKeyDown}
          className={interactive ? 'origin-handle interactive' : 'origin-handle'}
        >
          <circle cx={originScreen.x} cy={originScreen.y} r="11" />
          <path d={`M ${originScreen.x - 16} ${originScreen.y} L ${originScreen.x + 16} ${originScreen.y} M ${originScreen.x} ${originScreen.y - 16} L ${originScreen.x} ${originScreen.y + 16}`} />
        </g>
      </svg>
      <figcaption>
        {caption ??
          `Same motion, different coordinate description. The projectile starts at (${system.label1}0, ${system.label2}0) in the selected coordinates; only the description changes when the axes move.`}
      </figcaption>
    </figure>
  );
}
