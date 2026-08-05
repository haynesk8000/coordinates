import { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, RotateCcw, Target } from 'lucide-react';
import targetHitSoundUrl from '../../../explosion.mp3?url';
import { formatPhysicsNumber, projectileAtTime, projectileFlightTime, type ProjectileInputs } from '../../physics/learningModules';
import { RangeControl } from '../LearningModuleShared';
import {
  GameShell,
  randomInt,
  type ActivityProps,
} from './FunZoneShared';

const MIN_POWER = 1;
const MAX_POWER = 10;
const POWER_LEVELS = Array.from({ length: MAX_POWER - MIN_POWER + 1 }, (_, index) => index + MIN_POWER);
const ANGLE_STEP = 0.5;
const PHASE1_MIN_ANGLE = 0;
const PHASE1_MAX_ANGLE = 45;
const PHASE2_MAX_ANGLE = 90;
const GRAVITY = 9.8;
const HIT_TOLERANCE = 50;
const MIN_TARGET = 5000;
const MAX_TARGET = 9000;
const ANIMATION_MS = 900;
const FRAME_MS = 30;
const MISS_EXPLOSION_MS = 500;
const HIT_EXPLOSION_MS = 950;
const MIN_INITIAL_LANDING_FRACTION = 0.2;
const MAX_INITIAL_LANDING_FRACTION = 0.5;

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

type Phase = 1 | 2;

// Every target range has (at most) two solutions for a given power: a "low"
// angle under 45° and its complement "high" angle over 45° that lands the
// same distance. That pairing is what makes the target hittable in both
// phases. A target is only usable if the low solution sits comfortably below
// 45° so its complement lands comfortably above it, leaving Phase 2 solvable.
const solvablePhaseAngles = (power: number, target: number): { low: number; high: number } | null => {
  const velocity = muzzleVelocity(power);
  const ratio = (GRAVITY * target) / (velocity * velocity);
  if (ratio <= 0 || ratio >= 1) return null;
  const low = (0.5 * Math.asin(ratio) * 180) / Math.PI;
  if (low > PHASE1_MAX_ANGLE - ANGLE_STEP) return null;
  return { low, high: 90 - low };
};

const isTargetSolvable = (target: number): boolean =>
  POWER_LEVELS.some((power) => solvablePhaseAngles(power, target) !== null);

const generateTarget = (maxDistance: number): number => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = randomInt(MIN_TARGET, Math.max(MIN_TARGET, maxDistance));
    if (isTargetSolvable(candidate)) return candidate;
  }
  return MIN_TARGET;
};

// The opening shot is deliberately off: it's aimed to land between 20% and
// 50% of the way to the target so players have something to correct from.
const solveInitialConfig = (target: number): { power: number; angle: number } => {
  const fraction = MIN_INITIAL_LANDING_FRACTION + Math.random() * (MAX_INITIAL_LANDING_FRACTION - MIN_INITIAL_LANDING_FRACTION);
  const desiredLanding = target * fraction;
  const shuffledPowers = [...POWER_LEVELS].sort(() => Math.random() - 0.5);
  for (const candidatePower of shuffledPowers) {
    const solved = solvablePhaseAngles(candidatePower, desiredLanding);
    if (solved !== null) {
      return { power: candidatePower, angle: solved.low };
    }
  }
  return { power: MIN_POWER, angle: PHASE1_MIN_ANGLE };
};

const generateRoundSeed = (maxDistance: number) => {
  const target = generateTarget(maxDistance);
  const { power, angle } = solveInitialConfig(target);
  return { target, power, angle };
};

// Phase 1 is fixed at 0°-45°. Phase 2 must stay above 45° and strictly above
// whatever angle actually won Phase 1 (the two constraints collapse to the
// same floor, since Phase 1 never allows an angle above 45° in the first place).
const angleBoundsForPhase = (phase: Phase, phase1Angle: number | null): { min: number; max: number } => {
  if (phase === 1) return { min: PHASE1_MIN_ANGLE, max: PHASE1_MAX_ANGLE };
  const floor = Math.max(PHASE1_MAX_ANGLE, phase1Angle ?? PHASE1_MAX_ANGLE);
  return { min: Math.min(PHASE2_MAX_ANGLE, floor + ANGLE_STEP), max: PHASE2_MAX_ANGLE };
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
type Explosion = { id: number; x: number; kind: 'miss' | 'hit' };
type Crater = { id: number; x: number; kind: 'small' | 'large' };
type SoundKind = 'launch' | 'flight' | 'miss-explosion';

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
  const [seed] = useState(() => generateRoundSeed(MAX_TARGET));
  const [target, setTarget] = useState(seed.target);
  const [power, setPower] = useState(seed.power);
  const [angle, setAngle] = useState(seed.angle);
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
  const [explosion, setExplosion] = useState<Explosion | null>(null);
  const [craters, setCraters] = useState<Crater[]>([]);
  const [flagDestroyed, setFlagDestroyed] = useState(false);
  const [phase, setPhase] = useState<Phase>(1);
  const [phase1Angle, setPhase1Angle] = useState<number | null>(null);
  const [phase1Attempts, setPhase1Attempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const explosionTimeoutRef = useRef<number | null>(null);
  const effectIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const targetHitAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (explosionTimeoutRef.current !== null) window.clearTimeout(explosionTimeoutRef.current);
    void audioContextRef.current?.close();
    targetHitAudioRef.current?.pause();
  }, []);

  const playSound = (kind: SoundKind) => {
    if (typeof AudioContext === 'undefined') return;
    const context = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = context;
    void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const [frequency, duration, volume, type] = {
      launch: [90, 0.28, 0.16, 'square'],
      flight: [820, ANIMATION_MS / 1000, 0.035, 'sine'],
      'miss-explosion': [150, MISS_EXPLOSION_MS / 1000, 0.12, 'sawtooth'],
    }[kind] as [number, number, number, OscillatorType];
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency / (kind === 'flight' ? 2.5 : 4)), context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  const playTargetHitSound = () => {
    const audio = targetHitAudioRef.current ?? new Audio(targetHitSoundUrl);
    targetHitAudioRef.current = audio;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  };

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

    const explosionId = (effectIdRef.current += 1);
    const explosionX = result.hit ? target : result.landing;
    const explosionKind: Explosion['kind'] = result.hit ? 'hit' : 'miss';
    const explosionDuration = result.hit ? HIT_EXPLOSION_MS : MISS_EXPLOSION_MS;
    setExplosion({ id: explosionId, x: explosionX, kind: explosionKind });
    if (result.hit) playTargetHitSound();
    else playSound('miss-explosion');
    explosionTimeoutRef.current = window.setTimeout(() => {
      setExplosion((current) => (current?.id === explosionId ? null : current));
      setCraters((current) => [...current, { id: explosionId, x: explosionX, kind: result.hit ? 'large' : 'small' }]);
      if (result.hit) setFlagDestroyed(true);
    }, explosionDuration);

    if (result.hit) {
      setRoundWon(true);
      if (phase === 1) {
        setPhase1Angle(result.angle);
        setPhase1Attempts(nextAttempts);
      } else {
        setGameComplete(true);
        const totalAttempts = phase1Attempts + nextAttempts;
        setBestAttempts((current) => {
          const next = current === null || totalAttempts < current ? totalAttempts : current;
          try {
            localStorage.setItem(BEST_KEY, JSON.stringify(next));
          } catch {
            // Best score remains available for this session when storage is unavailable.
          }
          return next;
        });
        setRoundStats((current) => {
          const next = { roundsWon: current.roundsWon + 1, totalAttempts: current.totalAttempts + totalAttempts };
          try {
            localStorage.setItem(ROUNDS_KEY, JSON.stringify(next));
          } catch {
            // Round stats remain available for this session when storage is unavailable.
          }
          return next;
        });
      }
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
    playSound('launch');
    playSound('flight');

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

  // Phase 1 destroyed the target with a low-angle shot; clear the battlefield
  // and restore the same target for the high-angle Phase 2 assault.
  const advanceToPhase2 = () => {
    if (explosionTimeoutRef.current !== null) window.clearTimeout(explosionTimeoutRef.current);
    const bounds = angleBoundsForPhase(2, phase1Angle);
    setPhase(2);
    setAngle(bounds.min);
    setAttemptsThisRound(0);
    setShotHistory([]);
    setLastShot(null);
    setRoundWon(false);
    setFiring(false);
    setAnimInputs(null);
    setAnimProgress(0);
    setExplosion(null);
    setCraters([]);
    setFlagDestroyed(false);
  };

  const startNewGame = () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (explosionTimeoutRef.current !== null) window.clearTimeout(explosionTimeoutRef.current);
    const nextSeed = generateRoundSeed(MAX_TARGET);
    targetHitAudioRef.current?.pause();
    if (targetHitAudioRef.current) targetHitAudioRef.current.currentTime = 0;
    setTarget(nextSeed.target);
    setPower(nextSeed.power);
    setAngle(nextSeed.angle);
    setAttemptsThisRound(0);
    setShotHistory([]);
    setLastShot(null);
    setRoundWon(false);
    setFiring(false);
    setAnimInputs(null);
    setAnimProgress(0);
    setExplosion(null);
    setCraters([]);
    setFlagDestroyed(false);
    setPhase(1);
    setPhase1Angle(null);
    setPhase1Attempts(0);
    setGameComplete(false);
  };

  const angleBounds = angleBoundsForPhase(phase, phase1Angle);

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
      instructions="Destroy the target twice to win: first with a low-angle shot (0°–45°), then again with a high-angle shot (above 45° up to 90°). Choose an energy level (1–10) and a launch angle, then fire."
      stats={stats}
      difficulty={0}
      override={override}
      showDifficulty={false}
    >
      <div className="fun-prompt">
        <span className="cannon-phase-badge">{gameComplete ? 'Mission complete' : `Phase ${phase} of 2`}</span>
        {' '}Target distance: <strong>{Math.round(target)} m</strong>
        <small>
          {gameComplete
            ? 'The target has been destroyed with both a low-angle and a high-angle shot.'
            : phase === 1
              ? `Low-angle assault — launch angle limited to ${PHASE1_MIN_ANGLE}°–${PHASE1_MAX_ANGLE}°.`
              : `High-angle assault — launch angle limited to ${formatPhysicsNumber(angleBounds.min, 1)}°–${angleBounds.max}°.`}
          {' '}Hit within ±{HIT_TOLERANCE} m to advance • Attempt {attemptsThisRound + (roundWon || firing ? 0 : 1)}
        </small>
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

          {craters.map((crater) => (
            <g key={crater.id} transform={`translate(${originX + crater.x * scale} ${groundY})`} className={`cannon-crater ${crater.kind}`} aria-hidden="true">
              <ellipse cx="0" cy="0" rx={crater.kind === 'large' ? 26 : 13} ry={crater.kind === 'large' ? 10 : 5} />
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

          <g transform={`translate(${targetX} ${groundY})`} className={flagDestroyed ? 'cannon-target destroyed' : 'cannon-target'}>
            {flagDestroyed ? (
              <>
                <line x1="0" y1="0" x2="8" y2="-22" />
                <path d="M 8 -22 L 26 -14 L 2 -12 Z" />
              </>
            ) : (
              <>
                <line x1="0" y1="0" x2="0" y2="-38" />
                <path d="M 0 -38 L 22 -30 L 0 -22 Z" />
              </>
            )}
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

          {explosion && (
            <g
              key={explosion.id}
              transform={`translate(${originX + explosion.x * scale} ${groundY})`}
              className={`cannon-explosion ${explosion.kind}`}
              aria-hidden="true"
            >
              {explosion.kind === 'hit' ? (
                <>
                  <circle className="mushroom-stem" cx="0" cy="0" r="9" />
                  <circle className="mushroom-cap" cx="0" cy="0" r="9" />
                  <circle className="blast-ring" cx="0" cy="0" r="9" />
                </>
              ) : (
                <>
                  <circle className="blast-core" cx="0" cy="0" r="6" />
                  <circle className="blast-ring" cx="0" cy="0" r="6" />
                </>
              )}
            </g>
          )}
        </svg>
        <figcaption>Previous shots stay marked on the range so you can refine your next attempt.</figcaption>
      </figure>

      <section className="panel cannon-controls" aria-labelledby="cannon-controls-heading">
        <h3 id="cannon-controls-heading">Fire Controls</h3>
        <div className="cannon-power-row" role="group" aria-label="Energy Level">
          <span>Energy Level</span>
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
        <RangeControl label="Launch angle" value={angle} min={angleBounds.min} max={angleBounds.max} step={ANGLE_STEP} unit="°" onChange={setAngle} />
        <div className="cannon-fire-row">
          <button type="button" className="fun-primary-button" disabled={firing || roundWon} onClick={fire}>
            <Crosshair aria-hidden="true" size={18} /> Fire!
          </button>
          {roundWon && (
            phase === 1 ? (
              <button type="button" onClick={advanceToPhase2}>
                <RotateCcw aria-hidden="true" size={17} /> Start Phase 2
              </button>
            ) : (
              <button type="button" onClick={startNewGame}>
                <RotateCcw aria-hidden="true" size={17} /> New Game
              </button>
            )
          )}
        </div>
      </section>

      {lastShot && (
        <div className={`fun-feedback ${lastShot.hit ? 'correct' : 'incorrect'}`} role="status">
          <Target aria-hidden="true" />
          <div>
            <strong>
              {lastShot.hit
                ? phase === 1
                  ? `Phase 1 complete! ${rating(attemptsThisRound)}`
                  : `Phase 2 complete! ${rating(attemptsThisRound)}`
                : lastShot.diff > 0 ? 'Long — reduce energy or angle.' : 'Short — increase energy or angle.'}
            </strong>
            <p>
              {lastShot.hit && phase === 1 && 'Destroy the target a second time with a high-angle launch above 45° to finish the mission. '}
              {lastShot.hit && phase === 2 && 'Mission accomplished — the target was destroyed with both a low-angle and a high-angle shot. '}
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
        <div><strong>{roundStats.roundsWon}</strong><span>Missions completed</span></div>
        <div><strong>{averageAttempts !== null ? formatPhysicsNumber(averageAttempts) : '—'}</strong><span>Average attempts per mission</span></div>
      </div>
    </GameShell>
  );
}
