import { useMemo, useState } from 'react';
import { Anchor, Waves } from 'lucide-react';
import { relativeVelocityState, type Point2, type RelativeMotionInputs } from '../../physics/learningModules';
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

type GameId = 'combine' | 'notation';
const gameIds: GameId[] = ['combine', 'notation'];

const games: Array<GameMeta<GameId>> = [
  { id: 'combine', title: 'Current Navigator', tagline: 'Add the velocity vectors', skill: 'Vector addition', icon: Waves, color: 'blue' },
  { id: 'notation', title: 'Frame Namer', tagline: 'Match the subscript notation', skill: 'Reference-frame notation', icon: Anchor, color: 'purple' },
];

const round1 = (value: number) => Math.round(value * 10) / 10;
const vectorLabel = (point: Point2) => `(${round1(point.x)}, ${round1(point.y)})`;
const sameVector = (a: Point2, b: Point2) => round1(a.x) === round1(b.x) && round1(a.y) === round1(b.y);

const randomRelativeInputs = (level: number): RelativeMotionInputs => ({
  boatSpeed: randomInt(2, 5 + level),
  headingDegrees: randomInt(35, 145),
  currentSpeed: randomInt(0, 2 + level),
  riverWidth: 20,
});

type CombineChallenge = { boatWater: Point2; waterGround: Point2; answer: Point2 };
const makeCombineChallenge = (level: number): CombineChallenge => {
  const inputs = randomRelativeInputs(level);
  const state = relativeVelocityState(inputs);
  return {
    boatWater: { x: round1(state.boatRelativeWater.x), y: round1(state.boatRelativeWater.y) },
    waterGround: { x: round1(state.waterRelativeGround.x), y: 0 },
    answer: { x: round1(state.boatRelativeGround.x), y: round1(state.boatRelativeGround.y) },
  };
};

const makeVectorChoices = (answer: Point2, count: number): Point2[] => {
  const candidates: Point2[] = [
    answer,
    { x: round1(answer.x + 1), y: answer.y },
    { x: round1(answer.x - 1), y: answer.y },
    { x: answer.x, y: round1(answer.y + 1) },
    { x: round1(answer.x * 0.6), y: answer.y },
    { x: answer.y, y: answer.x },
  ];
  const unique = candidates.filter((candidate, index) => candidates.findIndex((point) => sameVector(point, candidate)) === index);
  while (unique.length < count) {
    const candidate = { x: round1(answer.x + (Math.random() - 0.5) * 4), y: round1(answer.y + (Math.random() - 0.5) * 4) };
    if (!unique.some((point) => sameVector(point, candidate))) unique.push(candidate);
  }
  return unique.slice(0, count).sort(() => Math.random() - 0.5);
};

function VectorSumPreview({ a, b }: { a: Point2; b: Point2 }) {
  const scale = 13;
  const origin = { x: 45, y: 165 };
  const tip1 = { x: origin.x + a.x * scale, y: origin.y - a.y * scale };
  const tip2 = { x: tip1.x + b.x * scale, y: tip1.y - b.y * scale };
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="Vector addition diagram: boat relative to water, then water relative to ground" className="fun-mini-scene">
      <defs><marker id="relative-vec-arrow" className="fun-arrow-marker" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <rect width="400" height="190" rx="14" className="fun-grid-bg" />
      <line x1={origin.x} y1={origin.y} x2={tip1.x} y2={tip1.y} className="fun-arc-vector" markerEnd="url(#relative-vec-arrow)" />
      <line x1={tip1.x} y1={tip1.y} x2={tip2.x} y2={tip2.y} className="fun-second-vector" markerEnd="url(#relative-vec-arrow)" />
      <text x={origin.x + 6} y={origin.y - 55} className="fun-grid-number">v boat/water (blue)</text>
      <text x={origin.x + 6} y={origin.y - 38} className="fun-grid-number">v water/ground (red)</text>
    </svg>
  );
}

function CurrentNavigator({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makeCombineChallenge(level));
  const choices = useMemo(() => makeVectorChoices(challenge.answer, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point2) => {
    if (feedback) return;
    const correct = sameVector(choice, challenge.answer);
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct
        ? `v⃗BG = v⃗BW + v⃗WG = ${vectorLabel(challenge.answer)} m/s.`
        : `Add matching components: v⃗BG = v⃗BW + v⃗WG = ${vectorLabel(challenge.boatWater)} + ${vectorLabel(challenge.waterGround)} = ${vectorLabel(challenge.answer)} m/s.`,
      stats,
      override,
    ));
  };
  const next = () => { setChallenge(makeCombineChallenge(level)); setFeedback(null); };
  return (
    <GameShell icon={Waves} color="blue" skill="Vector addition" title="Current Navigator" headingId="combine-game-heading" instructions="Add the boat/water vector to the water/ground vector tip-to-tail to find the boat's velocity relative to the ground." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">
        v boat/water = <strong>{vectorLabel(challenge.boatWater)}</strong> m/s, v water/ground = <strong>{vectorLabel(challenge.waterGround)}</strong> m/s.
        <small>What is v boat/ground? • {choiceCount} choices</small>
      </div>
      <div className="fun-play-grid">
        <VectorSumPreview a={challenge.boatWater} b={challenge.waterGround} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={vectorLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{vectorLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

type NotationQuestion = { prompt: string; answer: string; choices: string[]; explanation: string };
const notationBank: NotationQuestion[] = [
  { prompt: 'The velocity of the boat relative to the water.', answer: 'v⃗B/W', choices: ['v⃗B/W', 'v⃗W/B', 'v⃗B/G', 'v⃗W/G'], explanation: 'The first subscript is the object; the second is the frame it is measured from.' },
  { prompt: 'The velocity of the current (water) relative to the ground.', answer: 'v⃗W/G', choices: ['v⃗W/G', 'v⃗G/W', 'v⃗B/W', 'v⃗B/G'], explanation: 'W is the object (water), G is the observing frame (ground).' },
  { prompt: 'The velocity of the boat relative to the ground.', answer: 'v⃗B/G', choices: ['v⃗B/G', 'v⃗G/B', 'v⃗W/B', 'v⃗W/G'], explanation: 'This is the vector sum v⃗B/W + v⃗W/G.' },
  { prompt: 'v⃗G/W is the reverse of which vector?', answer: 'v⃗W/G', choices: ['v⃗W/G', 'v⃗B/W', 'v⃗B/G', 'v⃗G/B'], explanation: 'Swapping the subscript order reverses the vector’s direction.' },
  { prompt: 'Which vector must be added to v⃗B/W to build v⃗B/G?', answer: 'v⃗W/G', choices: ['v⃗W/G', 'v⃗G/W', 'v⃗B/G', 'v⃗G/B'], explanation: 'The shared middle subscript (W) links the chain: B/W + W/G = B/G.' },
];

function FrameNamer({ stats, override, onResult }: ActivityProps) {
  const [index, setIndex] = useState(() => randomInt(0, notationBank.length - 1));
  const question = notationBank[index];
  const choices = useMemo(() => [...question.choices].sort(() => Math.random() - 0.5), [question]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: string) => {
    if (feedback) return;
    const correct = choice === question.answer;
    onResult(correct);
    setFeedback(feedbackWithProgress(correct, correct ? question.explanation : `${question.explanation} Correct answer: ${question.answer}.`, stats, override));
  };
  const next = () => {
    let nextIndex = randomInt(0, notationBank.length - 1);
    if (notationBank.length > 1) while (nextIndex === index) nextIndex = randomInt(0, notationBank.length - 1);
    setIndex(nextIndex);
    setFeedback(null);
  };
  return (
    <GameShell icon={Anchor} color="purple" skill="Reference-frame notation" title="Frame Namer" headingId="notation-game-heading" instructions="Read each description of a relative velocity and choose its correct subscript notation." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">{question.prompt}</div>
      <div className="fun-choice-stack">
        {choices.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice}</button>)}
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

export function RelativeMotionFunZone() {
  const [activeGame, setActiveGame] = useState<GameId>('combine');
  const [override, setOverride] = useState<DifficultyOverride>('auto');
  const { allStats, recordResult } = useFunZoneStats('physics-motion-lab-relative-motion-funzone-v1', gameIds);
  const totalCorrect = Object.values(allStats).reduce((total, stats) => total + stats.correct, 0);
  const totalAttempts = Object.values(allStats).reduce((total, stats) => total + stats.attempts, 0);
  const activityProps = (id: GameId): ActivityProps => ({ stats: allStats[id], override, onResult: (correct: boolean) => recordResult(id, correct) });

  return (
    <div className="fun-zone-layout">
      <FunZoneHero
        eyebrow="Reference Frame Arcade • 2 games"
        totalCorrect={totalCorrect}
        totalAttempts={totalAttempts}
        description="Chain velocity vectors across frames and master the subscript notation that keeps them straight. Your scores are saved in this browser."
        override={override}
        onOverrideChange={setOverride}
      />
      <GameSelectorNav games={games} activeGame={activeGame} onSelect={setActiveGame} allStats={allStats} />
      {activeGame === 'combine' && <CurrentNavigator {...activityProps('combine')} />}
      {activeGame === 'notation' && <FrameNamer {...activityProps('notation')} />}
    </div>
  );
}
