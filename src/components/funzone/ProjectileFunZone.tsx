import { useMemo, useState } from 'react';
import { Compass, Rocket, Target } from 'lucide-react';
import { formatPhysicsNumber, projectileAtTime, projectileFlightTime, type ProjectileInputs } from '../../physics/learningModules';
import { CannonGame } from './CannonGame';
import {
  difficultyForStats,
  feedbackWithProgress,
  FunZoneHero,
  GameSelectorNav,
  GameShell,
  FeedbackBanner,
  levelFromDifficulty,
  randomInt,
  useFunZoneStats,
  type ActivityProps as SharedActivityProps,
  type DifficultyOverride,
  type Feedback,
  type GameMeta,
} from './FunZoneShared';

type GameId = 'cannon' | 'range' | 'phase';
const gameIds: GameId[] = ['cannon', 'range', 'phase'];

const games: Array<GameMeta<GameId>> = [
  { id: 'cannon', title: 'Cannon Game', tagline: 'Hit the hidden target', skill: 'Projectile artillery', icon: Target, color: 'coral' },
  { id: 'range', title: 'Range Rocket', tagline: 'Predict where it lands', skill: 'Predicting range', icon: Rocket, color: 'gold' },
  { id: 'phase', title: 'Vector Detective', tagline: 'Read the flight phase', skill: 'Velocity direction', icon: Compass, color: 'blue' },
];

type ActivityProps = SharedActivityProps;

const randomInputs = (level: number): ProjectileInputs => ({
  speed: randomInt(9, 13 + level * 3),
  angleDegrees: randomInt(18 + level, 62 - level),
  gravity: 9.8,
  initialHeight: randomInt(0, Math.min(10, 2 + level * 2)),
});

type RangeChallenge = { inputs: ProjectileInputs; range: number };
const makeRangeChallenge = (level: number): RangeChallenge => {
  const inputs = randomInputs(level);
  const flightTime = projectileFlightTime(inputs);
  const range = projectileAtTime(inputs, flightTime).position.x;
  return { inputs, range };
};

const makeRangeChoices = (range: number, count: number): number[] => {
  const factors = [1, 1.22, 0.8, 1.4, 0.62, 1.55, 0.45];
  const unique = [...new Set(factors.map((factor) => Number((range * factor).toFixed(1))))];
  while (unique.length < count) {
    const candidate = Number((range * (0.55 + Math.random() * 1.1)).toFixed(1));
    if (!unique.includes(candidate)) unique.push(candidate);
  }
  return unique.slice(0, count).sort(() => Math.random() - 0.5);
};

function RangeRocket({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makeRangeChallenge(level));
  const choices = useMemo(() => makeRangeChoices(challenge.range, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: number) => {
    if (feedback) return;
    const correct = choice === Number(challenge.range.toFixed(1));
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct
        ? `Touchdown! The rocket travels ${formatPhysicsNumber(challenge.range)} m before landing.`
        : `Use x(t) = v cos(θ) t at the landing time. The rocket actually travels ${formatPhysicsNumber(challenge.range)} m.`,
      stats,
      override,
    ));
  };
  const next = () => { setChallenge(makeRangeChallenge(level)); setFeedback(null); };
  return (
    <GameShell icon={Rocket} color="coral" skill="Predicting range" title="Range Rocket" headingId="range-game-heading" instructions="Read the launch conditions, then pick how far downrange the rocket lands." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">
        Launch speed <strong>{challenge.inputs.speed} m/s</strong> at <strong>{challenge.inputs.angleDegrees}°</strong> from a platform <strong>{challenge.inputs.initialHeight} m</strong> high.
        <small>How far downrange (x) does it land? • {choiceCount} choices</small>
      </div>
      <div className="fun-choice-stack">
        {choices.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice} m</button>)}
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

const phases = ['ascending', 'apex', 'descending'] as const;
type Phase = (typeof phases)[number];
const phaseLabel: Record<Phase, string> = {
  ascending: 'Ascending (before the apex)',
  apex: 'At the apex',
  descending: 'Descending (after the apex)',
};

type PhaseChallenge = { inputs: ProjectileInputs; time: number; flightTime: number; phase: Phase };
const makePhaseChallenge = (level: number): PhaseChallenge => {
  const inputs = randomInputs(level);
  const flightTime = projectileFlightTime(inputs);
  const angle = (inputs.angleDegrees * Math.PI) / 180;
  const apexTime = (inputs.speed * Math.sin(angle)) / inputs.gravity;
  const phase = phases[randomInt(0, 2)];
  const time = phase === 'apex'
    ? apexTime
    : phase === 'ascending'
      ? apexTime * (0.12 + Math.random() * 0.55)
      : apexTime + (flightTime - apexTime) * (0.2 + Math.random() * 0.65);
  return { inputs, time: Math.min(flightTime, Math.max(0, time)), flightTime, phase };
};

function TrajectoryPreview({ inputs, time }: { inputs: ProjectileInputs; time: number }) {
  const flightTime = projectileFlightTime(inputs);
  const samples = useMemo(
    () => Array.from({ length: 41 }, (_, index) => projectileAtTime(inputs, (index / 40) * flightTime).position),
    [inputs, flightTime],
  );
  const maxX = Math.max(...samples.map((sample) => sample.x), 1);
  const maxY = Math.max(...samples.map((sample) => sample.y), 1, inputs.initialHeight);
  const mapX = (x: number) => 25 + (x / maxX) * 350;
  const mapY = (y: number) => 190 - (Math.max(0, y) / maxY) * 160;
  const path = samples.map((sample, index) => `${index === 0 ? 'M' : 'L'} ${mapX(sample.x)} ${mapY(sample.y)}`).join(' ');
  const state = projectileAtTime(inputs, time);
  const px = mapX(state.position.x);
  const py = mapY(state.position.y);
  const speed = Math.hypot(state.velocity.x, state.velocity.y) || 1;
  const vLength = 34;
  const vx = px + (state.velocity.x / speed) * vLength;
  const vy = py - (state.velocity.y / speed) * vLength;
  return (
    <svg viewBox="0 0 400 210" role="img" aria-label="Projectile arc with the object and its velocity vector marked at one moment in flight" className="fun-mini-scene">
      <defs><marker id="projectile-arc-arrow" className="fun-arrow-marker" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <rect width="400" height="210" rx="14" className="fun-grid-bg" />
      <line x1="20" y1="192" x2="390" y2="192" className="fun-grid-axis" />
      <path d={path} className="fun-arc-path" />
      <line x1={px} y1={py} x2={vx} y2={vy} className="fun-arc-vector" markerEnd="url(#projectile-arc-arrow)" />
      <circle cx={px} cy={py} r="8" className="fun-point" />
    </svg>
  );
}

function VectorDetective({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const [challenge, setChallenge] = useState(() => makePhaseChallenge(level));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Phase) => {
    if (feedback) return;
    const correct = choice === challenge.phase;
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct
        ? `Right: the velocity arrow shows the object ${phaseLabel[challenge.phase].toLowerCase()}.`
        : `Look at the arrow's tilt: upward means ascending, level means the apex, downward means descending. This moment is ${phaseLabel[challenge.phase].toLowerCase()}.`,
      stats,
      override,
    ));
  };
  const next = () => { setChallenge(makePhaseChallenge(level)); setFeedback(null); };
  return (
    <GameShell icon={Compass} color="blue" skill="Velocity direction" title="Vector Detective" headingId="phase-game-heading" instructions="Watch which way the velocity arrow tilts and decide which part of the flight it marks." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">Which part of the flight is marked? <small>Read the arrow's direction, not just its position.</small></div>
      <div className="fun-play-grid">
        <TrajectoryPreview inputs={challenge.inputs} time={challenge.time} />
        <div className="fun-choice-stack">
          {phases.map((phase) => <button key={phase} type="button" disabled={Boolean(feedback)} onClick={() => answer(phase)}>{phaseLabel[phase]}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

export function ProjectileFunZone() {
  const [activeGame, setActiveGame] = useState<GameId>('cannon');
  const [override, setOverride] = useState<DifficultyOverride>('auto');
  const { allStats, recordResult } = useFunZoneStats('physics-motion-lab-projectile-motion-funzone-v1', gameIds);
  const totalCorrect = Object.values(allStats).reduce((total, stats) => total + stats.correct, 0);
  const totalAttempts = Object.values(allStats).reduce((total, stats) => total + stats.attempts, 0);
  const activityProps = (id: GameId): ActivityProps => ({ stats: allStats[id], override, onResult: (correct: boolean) => recordResult(id, correct) });

  return (
    <div className="fun-zone-layout">
      <FunZoneHero
        eyebrow="Trajectory Arcade • 3 games"
        totalCorrect={totalCorrect}
        totalAttempts={totalAttempts}
        description="Fire a cannon at a hidden target, predict landing distances, and read velocity vectors. Your scores are saved in this browser."
        override={override}
        onOverrideChange={setOverride}
      />
      <GameSelectorNav games={games} activeGame={activeGame} onSelect={setActiveGame} allStats={allStats} />
      {activeGame === 'cannon' && <CannonGame {...activityProps('cannon')} />}
      {activeGame === 'range' && <RangeRocket {...activityProps('range')} />}
      {activeGame === 'phase' && <VectorDetective {...activityProps('phase')} />}
    </div>
  );
}
