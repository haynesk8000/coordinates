import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { coordinateAtTime } from '../physics/coordinateSystem';
import {
  accelerationWorld,
  initialVelocityWorld,
  trajectorySamples,
  worldPositionAtTime,
  type ProjectileParameters,
} from '../physics/projectile';
import { add, scale, type Vector2, vector } from '../physics/vectors';

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
  time: number;
  onSystemChange?: (system: CoordinateSystem) => void;
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const makeBounds = (params: ProjectileParameters, system: CoordinateSystem): Bounds => {
  const minX = Math.min(-12, system.originWorld.x - 8);
  const maxX = Math.max(params.d1 + params.d2 + 12, system.originWorld.x + 8);
  const minY = Math.min(-6, system.originWorld.y - 8);
  const maxY = Math.max(params.H + 8, system.originWorld.y + 8, params.h + 8);
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
};

const format = (value: number) => value.toFixed(1).replace(/\.0$/, '');

export function SceneCanvas({ params, system, time, onSystemChange, interactive = false, small = false }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const bounds = useMemo(() => makeBounds(params, system), [params, system]);
  const projectile = worldPositionAtTime(params, time);
  const coordinates = coordinateAtTime(params, system, time);
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

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging || !interactive) return;
    updateOrigin(toWorld(event.clientX, event.clientY));
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

  const axis1End = add(system.originWorld, scale(system.axis1, axisLength));
  const axis2End = add(system.originWorld, scale(system.axis2, axisLength));
  const velocityEnd = add(projectile, scale(velocity, 0.18));
  const accelerationEnd = add(projectile, scale(acceleration, 0.25));
  const positionLine = line(system.originWorld, projectile);
  const wallBase = toScreen(vector(params.d1, 0));
  const wallTop = toScreen(vector(params.d1, params.h));
  const groundLeft = toScreen(vector(bounds.minX, 0));
  const groundRight = toScreen(vector(bounds.maxX, 0));
  const cliffTop = toScreen(vector(0, params.H));
  const cliffBase = toScreen(vector(0, 0));
  const projectileScreen = toScreen(projectile);
  const originScreen = toScreen(system.originWorld);

  return (
    <figure className={small ? 'scene small-scene' : 'scene'}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${screenWidth} ${screenHeight}`}
        role={interactive ? 'application' : 'img'}
        aria-label="Projectile scene with cliff, wall, trajectory, and coordinate axes"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <defs>
          <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#1f6feb" />
          </marker>
          <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#c0392b" />
          </marker>
          <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#16835f" />
          </marker>
          <marker id="arrow-purple" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#6f42c1" />
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
        <line x1={cliffTop.x} y1={groundRight.y + 22} x2={wallBase.x} y2={groundRight.y + 22} className="dimension" />
        <text x={(cliffTop.x + wallBase.x) / 2 - 8} y={groundRight.y + 39} className="scene-label">
          d1
        </text>
        <line x1={wallBase.x} y1={groundRight.y + 48} x2={toScreen(vector(params.d1 + params.d2, 0)).x} y2={groundRight.y + 48} className="dimension" />
        <text x={(wallBase.x + toScreen(vector(params.d1 + params.d2, 0)).x) / 2 - 8} y={groundRight.y + 66} className="scene-label">
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
            if (!interactive) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onKeyDown={handleKeyDown}
          className={interactive ? 'origin-handle interactive' : 'origin-handle'}
        >
          <circle cx={originScreen.x} cy={originScreen.y} r="11" />
          <path d={`M ${originScreen.x - 16} ${originScreen.y} L ${originScreen.x + 16} ${originScreen.y} M ${originScreen.x} ${originScreen.y - 16} L ${originScreen.x} ${originScreen.y + 16}`} />
        </g>
      </svg>
      <figcaption>
        Same motion, different coordinate description. Physical position: ({format(projectile.x)} m,{' '}
        {format(projectile.y)} m). Coordinate values: {system.label1} = {format(coordinates.x)} m, {system.label2} ={' '}
        {format(coordinates.y)} m.
      </figcaption>
    </figure>
  );
}
