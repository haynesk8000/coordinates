import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  MAX_ROTATION_UNITS,
  MIN_ROTATION_UNITS,
  ROTATION_UNIT_RADIANS,
  type CoordinateSystem,
} from '../physics/coordinateSystem';
import {
  accelerationWorld,
  initialVelocityWorld,
  landingTime,
  trajectorySamples,
  worldPositionAtTime,
  type ProjectileParameters,
} from '../physics/projectile';
import { add, magnitude, scale, subtract, type Vector2, vector } from '../physics/vectors';

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
  time: number;
  onSystemChange?: (system: CoordinateSystem) => void;
  onRotationUnitsChange?: (units: number) => void;
  rotationUnits?: number;
  interactive?: boolean;
  small?: boolean;
};

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

const screenWidth = 860;
const screenHeight = 470;
const axis2QuarterTurnUnits = 6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clampRotationUnits = (units: number) => Math.min(MAX_ROTATION_UNITS, Math.max(MIN_ROTATION_UNITS, units));

type DragTarget = 'origin' | 'axis1' | 'axis2' | null;

const makeBounds = (params: ProjectileParameters, system: CoordinateSystem): Bounds => {
  const minX = Math.min(-12, system.originWorld.x - 8);
  const maxX = Math.max(params.d1 + params.d2 + 12, system.originWorld.x + 8);
  const minY = Math.min(-6, system.originWorld.y - 8);
  const maxY = Math.max(params.H + 8, system.originWorld.y + 8, params.h + 8);
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
};

const format = (value: number) => value.toFixed(1).replace(/\.0$/, '');

export function SceneCanvas({
  params,
  system,
  time,
  onSystemChange,
  onRotationUnitsChange,
  rotationUnits,
  interactive = false,
  small = false,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<DragTarget>(null);
  const bounds = useMemo(() => makeBounds(params, system), [params, system]);
  const projectile = worldPositionAtTime(params, time);
  const path = trajectorySamples(params);
  const velocity = initialVelocityWorld(params);
  const acceleration = accelerationWorld(params);
  const axisLength = Math.max(6, Math.min(bounds.width, bounds.height) * 0.2);

  const toScreen = (point: Vector2): Vector2 =>
    vector(
      ((point.x - bounds.minX) / bounds.width) * screenWidth,
      screenHeight - ((point.y - bounds.minY) / bounds.height) * screenHeight,
    );

  const toWorld = (clientX: number, clientY: number): Vector2 => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return system.originWorld;
    const sx = ((clientX - rect.left) / rect.width) * screenWidth;
    const sy = ((clientY - rect.top) / rect.height) * screenHeight;
    return vector(
      bounds.minX + (sx / screenWidth) * bounds.width,
      bounds.minY + ((screenHeight - sy) / screenHeight) * bounds.height,
    );
  };

  const updateOrigin = (originWorld: Vector2) => {
    onSystemChange?.({
      ...system,
      originWorld: vector(
        clamp(originWorld.x, bounds.minX + 1, bounds.maxX - 1),
        clamp(originWorld.y, bounds.minY + 1, bounds.maxY - 1),
      ),
    });
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

  const axis1End = add(system.originWorld, scale(system.axis1, axisLength));
  const axis2End = add(system.originWorld, scale(system.axis2, axisLength));
  const velocityEnd = add(projectile, scale(velocity, 0.42));
  const accelerationEnd = add(projectile, scale(acceleration, 0.5));
  const positionLine = line(system.originWorld, projectile);
  const wallBase = toScreen(vector(params.d1, 0));
  const wallTop = toScreen(vector(params.d1, params.h));
  const groundLeft = toScreen(vector(bounds.minX, 0));
  const groundRight = toScreen(vector(bounds.maxX, 0));
  const cliffTop = toScreen(vector(0, params.H));
  const cliffBase = toScreen(vector(0, 0));
  const projectileScreen = toScreen(projectile);
  const originScreen = toScreen(system.originWorld);
  const impact = toScreen(worldPositionAtTime(params, landingTime(params)));
  const d1Y = groundRight.y + 22;
  const d2Y = groundRight.y + 48;

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
        <line {...line(vector(0, 0), vector(0, params.H))} className="measure-line" />
        <text x={cliffBase.x + 10} y={(cliffBase.y + cliffTop.y) / 2} className="scene-label">
          H
        </text>
        <rect
          x={wallBase.x - 5}
          y={wallTop.y}
          width="10"
          height={wallBase.y - wallTop.y}
          rx="2"
          className="wall"
        />
        <text x={wallBase.x + 10} y={(wallBase.y + wallTop.y) / 2} className="scene-label">
          h
        </text>
        <line x1={cliffBase.x} y1={d1Y} x2={wallBase.x} y2={d1Y} className="dimension" />
        <text x={(cliffBase.x + wallBase.x) / 2 - 8} y={d1Y + 17} className="scene-label">
          d1
        </text>
        <line x1={wallBase.x} y1={d2Y} x2={impact.x} y2={d2Y} className="dimension" />
        <text x={(wallBase.x + impact.x) / 2 - 8} y={d2Y + 17} className="scene-label">
          d2
        </text>

        <path d={pathD} className="trajectory" />
        <line {...positionLine} className="position-vector" markerEnd="url(#arrow-purple)" />
        <line {...line(projectile, velocityEnd)} className="velocity-vector" markerEnd="url(#arrow-green)" />
        <line {...line(projectile, accelerationEnd)} className="accel-vector" markerEnd="url(#arrow-red)" />
        <text x={toScreen(velocityEnd).x + 6} y={toScreen(velocityEnd).y - 4} className="vector-label velocity">
          v0
        </text>
        <text x={toScreen(accelerationEnd).x + 6} y={toScreen(accelerationEnd).y + 16} className="vector-label accel">
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
        Same motion, different coordinate description. The projectile starts at ({system.label1}0, {system.label2}0)
        in the selected coordinates; only the description changes when the axes move.
      </figcaption>
    </figure>
  );
}
