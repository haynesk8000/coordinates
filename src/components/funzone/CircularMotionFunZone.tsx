import { useMemo, useState } from 'react';
import { CircleDot, Gauge } from 'lucide-react';
import { formatPhysicsNumber } from '../../physics/learningModules';
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
  type ActivityProps,
  type DifficultyOverride,
  type Feedback,
  type GameMeta,
} from './FunZoneShared';

type GameId = 'period' | 'radial';
const gameIds: GameId[] = ['period', 'radial'];

const games: Array<GameMeta<GameId>> = [
  { id: 'period', title: 'Period Predictor', tagline: 'Time one full lap', skill: 'Period and angular speed', icon: CircleDot, color: 'gold' },
  { id: 'radial', title: 'Radial Racer', tagline: 'Find the inward pull', skill: 'Radial acceleration', icon: Gauge, color: 'coral' },
];

const randomCircularInputs = (level: number) => ({
  radius: Number((1.5 + Math.random() * (2.5 + level)).toFixed(1)),
  angularSpeed: Number((0.4 + Math.random() * (0.9 + level * 0.35)).toFixed(1)),
});

const makeNumberChoices = (value: number, count: number): number[] => {
  const factors = [1, 1.25, 0.8, 1.5, 0.6, 1.7, 0.4];
  const unique = [...new Set(factors.map((factor) => Number((value * factor).toFixed(2))))];
  while (unique.length < count) {
    const candidate = Number((value * (0.5 + Math.random() * 1.2)).toFixed(2));
    if (!unique.includes(candidate)) unique.push(candidate);
  }
  return unique.slice(0, count).sort(() => Math.random() - 0.5);
};

function OrbitPreview({ radius }: { radius: number }) {
  const center = { x: 200, y: 105 };
  const displayRadius = 40 + radius * 14;
  const theta = 0.6;
  const point = { x: center.x + displayRadius * Math.cos(theta), y: center.y - displayRadius * Math.sin(theta) };
  return (
    <svg viewBox="0 0 400 210" role="img" aria-label={`Circular path with radius ${radius} meters`} className="fun-mini-scene">
      <rect width="400" height="210" rx="14" className="fun-grid-bg" />
      <circle cx={center.x} cy={center.y} r={displayRadius} className="fun-orbit-ring" />
      <line x1={center.x} y1={center.y} x2={point.x} y2={point.y} className="fun-arc-vector" />
      <circle cx={center.x} cy={center.y} r="5" className="fun-point secondary" />
      <circle cx={point.x} cy={point.y} r="9" className="fun-point" />
    </svg>
  );
}

type OrbitChallenge = { radius: number; angularSpeed: number; answer: number };

const makePeriodChallenge = (level: number): OrbitChallenge => {
  const { radius, angularSpeed } = randomCircularInputs(level);
  return { radius, angularSpeed, answer: Number(((2 * Math.PI) / angularSpeed).toFixed(2)) };
};

function PeriodPredictor({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makePeriodChallenge(level));
  const choices = useMemo(() => makeNumberChoices(challenge.answer, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: number) => {
    if (feedback) return;
    const correct = choice === challenge.answer;
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct
        ? `T = 2π/ω = ${formatPhysicsNumber(challenge.answer)} s.`
        : `Use T = 2π/ω, not the radius. One lap actually takes ${formatPhysicsNumber(challenge.answer)} s.`,
      stats,
      override,
    ));
  };
  const next = () => { setChallenge(makePeriodChallenge(level)); setFeedback(null); };
  return (
    <GameShell icon={CircleDot} color="gold" skill="Period and angular speed" title="Period Predictor" headingId="period-game-heading" instructions="Given the angular speed, work out how long one full lap takes." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">
        Angular speed ω = <strong>{challenge.angularSpeed} rad/s</strong>, radius r = <strong>{challenge.radius} m</strong>.
        <small>How long does one full revolution take? • {choiceCount} choices</small>
      </div>
      <div className="fun-play-grid">
        <OrbitPreview radius={challenge.radius} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice} s</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

const makeRadialChallenge = (level: number): OrbitChallenge => {
  const { radius, angularSpeed } = randomCircularInputs(level);
  return { radius, angularSpeed, answer: Number((angularSpeed ** 2 * radius).toFixed(2)) };
};

function RadialRacer({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makeRadialChallenge(level));
  const choices = useMemo(() => makeNumberChoices(challenge.answer, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: number) => {
    if (feedback) return;
    const correct = choice === challenge.answer;
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct
        ? `aᵣ = ω²r = ${formatPhysicsNumber(challenge.answer)} m/s², pointing toward the center.`
        : `Use aᵣ = ω²r, always toward the center. The actual value is ${formatPhysicsNumber(challenge.answer)} m/s².`,
      stats,
      override,
    ));
  };
  const next = () => { setChallenge(makeRadialChallenge(level)); setFeedback(null); };
  return (
    <GameShell icon={Gauge} color="coral" skill="Radial acceleration" title="Radial Racer" headingId="radial-game-heading" instructions="Given the radius and angular speed, calculate how hard the object is being pulled toward the center." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">
        Radius r = <strong>{challenge.radius} m</strong>, angular speed ω = <strong>{challenge.angularSpeed} rad/s</strong>.
        <small>What is the radial (centripetal) acceleration? • {choiceCount} choices</small>
      </div>
      <div className="fun-play-grid">
        <OrbitPreview radius={challenge.radius} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice} m/s²</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

export function CircularMotionFunZone() {
  const [activeGame, setActiveGame] = useState<GameId>('period');
  const [override, setOverride] = useState<DifficultyOverride>('auto');
  const { allStats, recordResult } = useFunZoneStats('physics-motion-lab-uniform-circular-motion-funzone-v1', gameIds);
  const totalCorrect = Object.values(allStats).reduce((total, stats) => total + stats.correct, 0);
  const totalAttempts = Object.values(allStats).reduce((total, stats) => total + stats.attempts, 0);
  const activityProps = (id: GameId): ActivityProps => ({ stats: allStats[id], override, onResult: (correct: boolean) => recordResult(id, correct) });

  return (
    <div className="fun-zone-layout">
      <FunZoneHero
        eyebrow="Orbit Arcade • 2 games"
        totalCorrect={totalCorrect}
        totalAttempts={totalAttempts}
        description="Apply v = ωr, T = 2π/ω, and aᵣ = ω²r under time pressure. Your scores are saved in this browser."
        override={override}
        onOverrideChange={setOverride}
      />
      <GameSelectorNav games={games} activeGame={activeGame} onSelect={setActiveGame} allStats={allStats} />
      {activeGame === 'period' && <PeriodPredictor {...activityProps('period')} />}
      {activeGame === 'radial' && <RadialRacer {...activityProps('radial')} />}
    </div>
  );
}
