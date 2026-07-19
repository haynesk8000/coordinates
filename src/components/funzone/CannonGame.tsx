import { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, RotateCcw, Target } from 'lucide-react';
import { formatPhysicsNumber, projectileAtTime, projectileFlightTime, type ProjectileInputs } from '../../physics/learningModules';
import { RangeControl } from '../LearningModuleShared';
import {
  difficultyForStats,
  GameShell,
  levelFromDifficulty,
  randomInt,
  type ActivityProps,
} from './FunZoneShared';

const MIN_POWER = 1;
const MAX_POWER = 10;
const POWER_LEVELS = Array.from({ length: MAX_POWER - MIN_POWER + 1 }, (_, index) => index + MIN_POWER);
const MIN_ANGLE = 5;
const MAX_ANGLE = 85;
const GRAVITY = 9.8;
const HIT_TOLERANCE = 50;
const MIN_TARGET = 5000;
const ANIMATION_MS = 900;
const FRAME_MS = 30;

const BEST_KEY = 'physics-motion-lab-projectile-motion-cannon-best-v1';
const ROUNDS_KEY = 'physics-motion-lab-projectile-motion-cannon-rounds-v1';

const muzzleVelocity = (power: number) => 120 + power * 25;

const inputsFor = (power: number, angleDegrees: number): ProjectileInputs => ({
  speed: muzzleVelocity(power),
  angleDegrees,
  gravity: GRAVITY,
  initialHeight: 0,
});

const rangeFor = (power: number, angleDegrees: number): number => {
  const inputs = inputsFor(power, angleDegrees);
  return projectileAtTime(inputs, projectileFlightTime(inputs)).position.x;
};

const maxHeightFor = (inputs: ProjectileInputs): number => {
  const radians = (inputs.angleDegrees * Math.PI) / 180;
  const verticalSpeed = inputs.speed * Math.sin(radians);
  return inputs.initialHeight + (verticalSpeed * verticalSpeed) / (2 * inputs.gravity);
};

const solvableAngleForPower = (power: number, target: number): number | null => {
  const velocity = muzzleVelocity(power);
  const ratio = (GRAVITY * target) / (velocity * velocity);
  if (ratio > 1) return null;
  const theta1 = (0.5 * Math.asin(ratio) * 180) / Math.PI;
  const theta2 = 90 - theta1;
  if (theta1 >= MIN_ANGLE && theta1 <= MAX_ANGLE) return theta1;
  if (theta2 >= MIN_ANGLE && theta2 <= MAX_ANGLE) return theta2;
  return null;
};

const isTargetSolvable = (target: number): boolean =>
  POWER_LEVELS.some((power) => solvableAngleForPower(power, target) !== null);

const generateTarget = (maxDistance: number): number => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = randomInt(MIN_TARGET, Math.max(MIN_TARGET, maxDistance));
    if (isTargetSolvable(candidate)) return candidate;
  }
  return MIN_TARGET;
};

const rating = (attempts: number): string => {
  if (attempts <= 1) return 'Perfect Shot';
  if (attempts <= 3) return 'Sharpshooter';
  if (attempts <= 6) return 'Expert Gunner';
  return 'Marksman';
};

type Shot = { power: number; angle: number; landing: number; hit: boolean };
type ShotResult = {
  power: number;
  angle: number;
  landing: number;
  diff: number;
  hit: boolean;
  flightTime: number;
  maxHeight: number;
};

const readNumber = (key: string): number | null => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as number) : null;
  } catch {
    return null;
  }
};

type RoundStats = { roundsWon: number; totalAttempts: number };
const emptyRoundStats = (): RoundStats => ({ roundsWon: 0, totalAttempts: 0 });
const readRoundStats = (): RoundStats => {
  try {
    const saved = localStorage.getItem(ROUNDS_KEY);
    return saved ? (JSON.parse(saved) as RoundStats) : emptyRoundStats();
  } catch {
    return emptyRoundStats();
  }
};

export function CannonGame({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const maxTargetDistance = 9000 + level * 800;

  const [target, setTarget] = useState(() => generateTarget(maxTargetDistance));
  const [power, setPower] = useState(5);
  const [angle, setAngle] = useState(45);
  const [attemptsThisRound, setAttemptsThisRound] = useState(0);
  const [shotHistory, setShotHistory] = useState<Shot[]>([]);
  const [lastShot, setLastShot] = useState<ShotResult | null>(null);
  const [roundWon, setRoundWon] = useState(false);
  const [firing, setFiring] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [animInputs, setAnimInputs] = useState<ProjectileInputs | null>(null);
  const [animFlightTime, setAnimFlightTime] = useState(0);
  const [bestAttempts, setBestAttempts] = useState<number | null>(() => readNumber(BEST_KEY));
  const [roundStats, setRoundStats] = useState<RoundStats>(() => readRoundStats());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  const displayMax = useMemo(() => {
    const landings = shotHistory.map((shot) => shot.landing);
    return Math.max(target, ...landings, 1) * 1.15;
  }, [target, shotHistory]);

  const completeShot = (result: ShotResult) => {
    const nextAttempts = attemptsThisRound + 1;
    setAttemptsThisRound(nextAttempts);
    setShotHistory((current) => [...current, { power: result.power, angle: result.angle, landing: result.landing, hit: result.hit }]);
    setLastShot(result);
    setFiring(false);
    onResult(result.hit);
    if (result.hit) {
      setRoundWon(true);
      setBestAttempts((current) => {
        const next = current === null || nextAttempts < current ? nextAttempts : current;
        try {
          localStorage.setItem(BEST_KEY, JSON.stringify(next));
        } catch {
          // Best score remains available for this session when storage is unavailable.
        }
        return next;
      });
      setRoundStats((current) => {
        const next = { roundsWon: current.roundsWon + 1, totalAttempts: current.totalAttempts + nextAttempts };
        try {
          localStorage.setItem(ROUNDS_KEY, JSON.stringify(next));
        } catch {
          // Round stats remain available for this session when storage is unavailable.
        }
        return next;
      });
    }
  };

  const fire = () => {
    if (firing || roundWon) return;
    const shotInputs = inputsFor(power, angle);
    const flightTime = projectileFlightTime(shotInputs);
    const landing = projectileAtTime(shotInputs, flightTime).position.x;
    const diff = landing - target;
    const hit = Math.abs(diff) <= HIT_TOLERANCE;
    const maxHeight = maxHeightFor(shotInputs);

    setFiring(true);
    setAnimProgress(0);
    setAnimInputs(shotInputs);
    setAnimFlightTime(flightTime);

    const totalFrames = Math.max(1, Math.round(ANIMATION_MS / FRAME_MS));
    let frame = 0;
    const tick = () => {
      frame += 1;
      setAnimProgress(Math.min(1, frame / totalFrames));
      if (frame < totalFrames) {
        timeoutRef.current = window.setTimeout(tick, FRAME_MS);
      } else {
        completeShot({ power, angle, landing, diff, hit, flightTime, maxHeight });
      }
    };
    timeoutRef.current = window.setTimeout(tick, FRAME_MS);
  };

  const newTarget = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    setTarget(generateTarget(maxTargetDistance));
    setAttemptsThisRound(0);
    setShotHistory([]);
    setLastShot(null);
    setRoundWon(false);
    setFiring(false);
    setAnimInputs(null);
    setAnimProgress(0);
  };

  const scale = 700 / displayMax;
  const groundY = 258;
  const originX = 30;
  const targetX = originX + target * scale;
  const animatedPosition = animInputs ? projectileAtTime(animInputs, animProgress * animFlightTime).position : null;
  const barrelAngle = firing && animInputs ? animInputs.angleDegrees : angle;

  const distanceStep = displayMax > 20000 ? 4000 : displayMax > 10000 ? 2000 : 1000;
  const markers = useMemo(() => {
    const values: number[] = [];
    for (let value = distanceStep; value < displayMax; value += distanceStep) values.push(value);
    return values;
  }, [displayMax, distanceStep]);

  const averageAttempts = roundStats.roundsWon > 0 ? roundStats.totalAttempts / roundStats.roundsWon : null;

  return (
    <GameShell
      icon={Target}
      color="coral"
      skill="Projectile artillery"
      title="Cannon Game"
      headingId="cannon-game-heading"
      instructions="Choose a power level (1–10) and a launch angle (5°–85°), then fire. Use the distance and short/long feedback to zero in on the hidden target in as few shots as possible."
      stats={stats}
      difficulty={difficultyForStats(stats, override)}
      override={override}
    >
      <div className="fun-prompt">
        Target distance: <strong>{Math.round(target)} m</strong>
        <small>Hit within ±{HIT_TOLERANCE} m to win the round • Attempt {attemptsThisRound + (roundWon || firing ? 0 : 1)}</small>
      </div>

      <figure className="cannon-scene-figure">
        <svg viewBox="0 0 760 300" role="img" aria-label={`Cannon range with target at ${Math.round(target)} meters`} className="fun-mini-scene cannon-scene">
          <rect width="760" height="300" className="fun-grid-bg" />
          <line x1={originX} y1={groundY} x2="740" y2={groundY} className="fun-grid-axis" />
          {markers.map((value) => (
            <g key={value}>
              <line x1={originX + value * scale} y1={groundY} x2={originX + value * scale} y2={groundY + 6} className="cannon-tick" />
              <text x={originX + value * scale} y={groundY + 20} textAnchor="middle" className="fun-grid-number">{value >= 1000 ? `${value / 1000}k` : value}</text>
            </g>
          ))}

          {shotHistory.map((shot, index) => (
            <circle
              key={`${shot.power}-${shot.angle}-${index}`}
              cx={originX + shot.landing * scale}
              cy={groundY}
              r="5"
              className={shot.hit ? 'cannon-shot-marker hit' : 'cannon-shot-marker'}
            />
          ))}

          <g transform={`translate(${targetX} ${groundY})`} className="cannon-target">
            <line x1="0" y1="0" x2="0" y2="-38" />
            <path d="M 0 -38 L 22 -30 L 0 -22 Z" />
          </g>

          <g transform={`translate(${originX} ${groundY}) rotate(${-barrelAngle})`} className="cannon-body">
            <rect x="0" y="-6" width="46" height="12" rx="4" />
          </g>
          <circle cx={originX} cy={groundY} r="12" className="cannon-base" />

          {animatedPosition && (
            <circle
              cx={originX + Math.max(0, animatedPosition.x) * scale}
              cy={groundY - Math.max(0, animatedPosition.y) * scale}
              r="7"
              className="cannon-ball"
            />
          )}
        </svg>
        <figcaption>Previous shots stay marked on the range so you can refine your next attempt.</figcaption>
      </figure>

      <section className="panel cannon-controls" aria-labelledby="cannon-controls-heading">
        <h3 id="cannon-controls-heading">Fire Controls</h3>
        <div className="cannon-power-row" role="group" aria-label="Power level">
          <span>Power level</span>
          <div className="cannon-power-buttons">
            {POWER_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                className={power === level ? 'active' : ''}
                aria-pressed={power === level}
                disabled={firing || roundWon}
                onClick={() => setPower(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <RangeControl label="Launch angle" value={angle} min={MIN_ANGLE} max={MAX_ANGLE} step={0.5} unit="°" onChange={setAngle} />
        <div className="cannon-fire-row">
          <button type="button" className="fun-primary-button" disabled={firing || roundWon} onClick={fire}>
            <Crosshair aria-hidden="true" size={18} /> Fire!
          </button>
          {roundWon && (
            <button type="button" onClick={newTarget}>
              <RotateCcw aria-hidden="true" size={17} /> New Target
            </button>
          )}
        </div>
      </section>

      {lastShot && (
        <div className={`fun-feedback ${lastShot.hit ? 'correct' : 'incorrect'}`} role="status">
          <Target aria-hidden="true" />
          <div>
            <strong>
              {lastShot.hit
                ? `Direct hit! ${rating(attemptsThisRound)}`
                : lastShot.diff > 0 ? 'Long — reduce power or angle.' : 'Short — increase power or angle.'}
            </strong>
            <p>
              Landing distance: {formatPhysicsNumber(lastShot.landing, 0)} m
              {' • '}Off by {formatPhysicsNumber(Math.abs(lastShot.diff), 0)} m
              {' • '}Flight time {formatPhysicsNumber(lastShot.flightTime)} s
              {' • '}Max height {formatPhysicsNumber(lastShot.maxHeight, 0)} m
            </p>
          </div>
          {!roundWon && (
            <button type="button" onClick={fire} disabled={firing}>
              <Crosshair aria-hidden="true" size={17} /> Fire again
            </button>
          )}
        </div>
      )}

      <div className="cannon-score-panel">
        <div><strong>{bestAttempts ?? '—'}</strong><span>Best score (fewest shots)</span></div>
        <div><strong>{roundStats.roundsWon}</strong><span>Targets destroyed</span></div>
        <div><strong>{averageAttempts !== null ? formatPhysicsNumber(averageAttempts) : '—'}</strong><span>Average attempts per hit</span></div>
      </div>
    </GameShell>
  );
}
