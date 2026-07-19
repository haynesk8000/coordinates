import { useMemo, useState } from 'react';
import { LineChart, Waypoints } from 'lucide-react';
import { linearMotionAtTime, type LinearMotionInputs } from '../../physics/learningModules';
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

type GameId = 'spacing' | 'graph';
const gameIds: GameId[] = ['spacing', 'graph'];

const games: Array<GameMeta<GameId>> = [
  { id: 'spacing', title: 'Spacing Sleuth', tagline: 'Classify the dot pattern', skill: 'Reading dot diagrams', icon: Waypoints, color: 'green' },
  { id: 'graph', title: 'Slope Detective', tagline: 'Match the graph to the motion', skill: 'Reading graphs', icon: LineChart, color: 'purple' },
];

const randomSign = () => (Math.random() < 0.5 ? -1 : 1);

const scenarios = ['constant', 'speeding', 'slowing', 'reversing'] as const;
type Scenario = (typeof scenarios)[number];
const scenarioLabel: Record<Scenario, string> = {
  constant: 'Constant velocity',
  speeding: 'Speeding up',
  slowing: 'Slowing down',
  reversing: 'Reversing direction',
};

const scenarioGenerators: Record<Scenario, () => LinearMotionInputs> = {
  constant: () => ({ initialPosition: 0, initialVelocity: randomSign() * (1 + Math.random() * 2.5), acceleration: 0 }),
  speeding: () => {
    const v = randomSign() * (0.4 + Math.random() * 1.2);
    return { initialPosition: 0, initialVelocity: v, acceleration: Math.sign(v) * (0.5 + Math.random() * 1.1) };
  },
  slowing: () => {
    const v = randomSign() * (2 + Math.random() * 2);
    return { initialPosition: 0, initialVelocity: v, acceleration: -Math.sign(v) * (0.3 + Math.random() * 0.6) };
  },
  reversing: () => {
    const v = randomSign() * (1 + Math.random() * 1.5);
    return { initialPosition: 0, initialVelocity: v, acceleration: -Math.sign(v) * (1.3 + Math.random() * 1.2) };
  },
};

const classify = (inputs: LinearMotionInputs, duration: number): Scenario => {
  if (Math.abs(inputs.acceleration) < 0.05) return 'constant';
  const finalVelocity = inputs.initialVelocity + inputs.acceleration * duration;
  const reversed = inputs.initialVelocity !== 0 && Math.sign(finalVelocity) !== Math.sign(inputs.initialVelocity);
  if (reversed) return 'reversing';
  return inputs.initialVelocity * inputs.acceleration >= 0 ? 'speeding' : 'slowing';
};

type DotChallenge = { inputs: LinearMotionInputs; interval: number; dotCount: number; answer: Scenario };
const makeDotChallenge = (level: number): DotChallenge => {
  const interval = 0.7;
  const dotCount = Math.min(9, 6 + Math.floor(level / 2));
  const target = scenarios[randomInt(0, level >= 2 ? 3 : 2)];
  let inputs = scenarioGenerators[target]();
  for (let attempt = 0; attempt < 6 && classify(inputs, interval * (dotCount - 1)) !== target; attempt += 1) {
    inputs = scenarioGenerators[target]();
  }
  return { inputs, interval, dotCount, answer: classify(inputs, interval * (dotCount - 1)) };
};

function DotDiagramPreview({ inputs, interval, dotCount }: { inputs: LinearMotionInputs; interval: number; dotCount: number }) {
  const samples = useMemo(
    () => Array.from({ length: dotCount }, (_, index) => ({ time: index * interval, ...linearMotionAtTime(inputs, index * interval) })),
    [inputs, interval, dotCount],
  );
  const positions = samples.map((sample) => sample.position);
  const minimum = Math.min(...positions);
  const maximum = Math.max(...positions);
  const span = Math.max(1, maximum - minimum);
  const mapX = (position: number) => 30 + ((position - minimum) / span) * 340;
  return (
    <svg viewBox="0 0 400 140" role="img" aria-label="Equal-time motion diagram to classify" className="fun-mini-scene">
      <defs><marker id="motion-dot-arrow" className="fun-arrow-marker" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <rect width="400" height="140" rx="14" className="fun-grid-bg" />
      <line x1="20" y1="80" x2="380" y2="80" className="fun-grid-axis" />
      {samples.map((sample, index) => {
        const x = mapX(sample.position);
        const arrowLength = Math.max(-30, Math.min(30, sample.velocity * 8));
        return (
          <g key={sample.time}>
            <circle cx={x} cy="80" r="6" className="fun-point" />
            <line x1={x} y1="52" x2={x + arrowLength} y2="52" className="fun-arc-vector" markerEnd="url(#motion-dot-arrow)" />
          </g>
        );
      })}
    </svg>
  );
}

function SpacingSleuth({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const [challenge, setChallenge] = useState(() => makeDotChallenge(level));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const options = level >= 2 ? scenarios : scenarios.slice(0, 3);
  const answer = (choice: Scenario) => {
    if (feedback) return;
    const correct = choice === challenge.answer;
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct
        ? `Exactly: the dots show ${scenarioLabel[challenge.answer].toLowerCase()}.`
        : `Compare equal-time spacing and arrow length. This diagram shows ${scenarioLabel[challenge.answer].toLowerCase()}.`,
      stats,
      override,
    ));
  };
  const next = () => { setChallenge(makeDotChallenge(level)); setFeedback(null); };
  return (
    <GameShell icon={Waypoints} color="green" skill="Reading dot diagrams" title="Spacing Sleuth" headingId="spacing-game-heading" instructions="Dots are recorded at equal time intervals. Read the spacing and arrows, then classify the motion." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">What kind of motion do these dots show? <small>Equal-time dots • arrows show instantaneous velocity</small></div>
      <div className="fun-play-grid">
        <DotDiagramPreview inputs={challenge.inputs} interval={challenge.interval} dotCount={challenge.dotCount} />
        <div className="fun-choice-stack">
          {options.map((option) => <button key={option} type="button" disabled={Boolean(feedback)} onClick={() => answer(option)}>{scenarioLabel[option]}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

const slopeAnswers = ['Positive constant acceleration', 'Zero acceleration', 'Negative constant acceleration'] as const;
type SlopeAnswer = (typeof slopeAnswers)[number];
type GraphChallenge = { acceleration: number; initialVelocity: number; answer: SlopeAnswer };
const makeGraphChallenge = (level: number): GraphChallenge => {
  const roll = Math.random();
  const magnitude = 0.6 + Math.random() * (1 + level * 0.3);
  const acceleration = roll < 0.34 ? 0 : roll < 0.67 ? magnitude : -magnitude;
  const answer: SlopeAnswer = acceleration === 0 ? 'Zero acceleration' : acceleration > 0 ? 'Positive constant acceleration' : 'Negative constant acceleration';
  return { acceleration, initialVelocity: (Math.random() - 0.5) * 4, answer };
};

function VelocityGraphPreview({ initialVelocity, acceleration }: { initialVelocity: number; acceleration: number }) {
  const samples = useMemo(() => Array.from({ length: 9 }, (_, index) => initialVelocity + acceleration * index * 0.6), [initialVelocity, acceleration]);
  const minimum = Math.min(...samples, 0);
  const maximum = Math.max(...samples, 0.5);
  const span = Math.max(1, maximum - minimum);
  const mapY = (value: number) => 130 - ((value - minimum) / span) * 100;
  const path = samples.map((value, index) => `${index === 0 ? 'M' : 'L'} ${30 + index * 42} ${mapY(value)}`).join(' ');
  return (
    <svg viewBox="0 0 400 150" role="img" aria-label="Velocity versus time graph to classify" className="fun-mini-scene">
      <rect width="400" height="150" rx="14" className="fun-grid-bg" />
      <text x="16" y="20" className="fun-grid-number">v(t)</text>
      <line x1="26" y1={mapY(0)} x2="380" y2={mapY(0)} className="fun-grid-axis" />
      <path d={path} className="fun-arc-vector" fill="none" />
    </svg>
  );
}

function SlopeDetective({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const [challenge, setChallenge] = useState(() => makeGraphChallenge(level));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: SlopeAnswer) => {
    if (feedback) return;
    const correct = choice === challenge.answer;
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct ? 'Right: the slope of a velocity-time graph is acceleration.' : `The line's slope gives acceleration. This graph shows ${challenge.answer.toLowerCase()}.`,
      stats,
      override,
    ));
  };
  const next = () => { setChallenge(makeGraphChallenge(level)); setFeedback(null); };
  return (
    <GameShell icon={LineChart} color="purple" skill="Reading graphs" title="Slope Detective" headingId="graph-game-heading" instructions="A velocity-time graph is shown. Read its slope to identify the acceleration." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">What does the slope of this v(t) graph tell you about acceleration?</div>
      <div className="fun-play-grid">
        <VelocityGraphPreview initialVelocity={challenge.initialVelocity} acceleration={challenge.acceleration} />
        <div className="fun-choice-stack">
          {slopeAnswers.map((option) => <button key={option} type="button" disabled={Boolean(feedback)} onClick={() => answer(option)}>{option}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

export function MotionDiagramFunZone() {
  const [activeGame, setActiveGame] = useState<GameId>('spacing');
  const [override, setOverride] = useState<DifficultyOverride>('auto');
  const { allStats, recordResult } = useFunZoneStats('physics-motion-lab-motion-diagrams-funzone-v1', gameIds);
  const totalCorrect = Object.values(allStats).reduce((total, stats) => total + stats.correct, 0);
  const totalAttempts = Object.values(allStats).reduce((total, stats) => total + stats.attempts, 0);
  const activityProps = (id: GameId): ActivityProps => ({ stats: allStats[id], override, onResult: (correct: boolean) => recordResult(id, correct) });

  return (
    <div className="fun-zone-layout">
      <FunZoneHero
        eyebrow="Dot Diagram Arcade • 2 games"
        totalCorrect={totalCorrect}
        totalAttempts={totalAttempts}
        description="Classify motion from dot spacing and read acceleration straight off a graph's slope. Your scores are saved in this browser."
        override={override}
        onOverrideChange={setOverride}
      />
      <GameSelectorNav games={games} activeGame={activeGame} onSelect={setActiveGame} allStats={allStats} />
      {activeGame === 'spacing' && <SpacingSleuth {...activityProps('spacing')} />}
      {activeGame === 'graph' && <SlopeDetective {...activityProps('graph')} />}
    </div>
  );
}
