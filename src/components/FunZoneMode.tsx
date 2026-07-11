import { useMemo, useState, type MouseEvent } from 'react';
import {
  CheckCircle2,
  Crosshair,
  Gamepad2,
  MoveRight,
  Radar,
  RefreshCw,
  RotateCw,
  Sparkles,
  XCircle,
} from 'lucide-react';

type Point = { x: number; y: number };
type GameId = 'plot' | 'read' | 'translate' | 'rotate' | 'relate';
type Stats = { correct: number; attempts: number; streak: number };
type Feedback = { correct: boolean; message: string; difficultyIncrease?: number };

const games: Array<{
  id: GameId;
  title: string;
  tagline: string;
  skill: string;
  icon: typeof Crosshair;
  color: string;
}> = [
  { id: 'plot', title: 'Target Plotter', tagline: 'Hit the ordered pair', skill: 'Plotting points', icon: Crosshair, color: 'coral' },
  { id: 'read', title: 'Radar Reader', tagline: 'Decode the signal', skill: 'Reading coordinates', icon: Radar, color: 'blue' },
  { id: 'translate', title: 'Translation Trek', tagline: 'Move the rover', skill: 'Translation', icon: MoveRight, color: 'green' },
  { id: 'rotate', title: 'Rotation Reactor', tagline: 'Spin around the origin', skill: 'Rotation', icon: RotateCw, color: 'purple' },
  { id: 'relate', title: 'Mirror Match', tagline: 'Spot the relationship', skill: 'Coordinate relationships', icon: Sparkles, color: 'gold' },
];

const emptyStats = (): Stats => ({ correct: 0, attempts: 0, streak: 0 });
export const difficultyFromCorrect = (correct: number) => Math.min(100, Math.floor(correct / 3) * 20);
const difficultyLevel = (stats: Stats) => difficultyFromCorrect(stats.correct) / 20;
const coordinateValuesForRange = (range: number) =>
  Array.from({ length: range * 2 + 1 }, (_, index) => index - range);
const randomInt = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
const randomPoint = (range = 4, allowOrigin = true): Point => {
  let point = { x: randomInt(-range, range), y: randomInt(-range, range) };
  while (!allowOrigin && point.x === 0 && point.y === 0) {
    point = { x: randomInt(-range, range), y: randomInt(-range, range) };
  }
  return point;
};
const pointLabel = (point: Point) => `(${point.x}, ${point.y})`;
const samePoint = (first: Point, second: Point) => first.x === second.x && first.y === second.y;

function makePointChoices(answer: Point, range: number, count: number): Point[] {
  const candidates = [
    answer,
    { x: answer.y, y: answer.x },
    { x: -answer.x, y: answer.y },
    { x: answer.x, y: -answer.y },
    { x: answer.x + (answer.x < range ? 1 : -1), y: answer.y },
    { x: answer.x, y: answer.y + (answer.y < range ? 1 : -1) },
  ];
  const unique = candidates.filter(
    (candidate, index) => candidates.findIndex((point) => samePoint(point, candidate)) === index,
  );
  while (unique.length < count) {
    const candidate = randomPoint(range);
    if (!unique.some((point) => samePoint(point, candidate))) unique.push(candidate);
  }
  return unique.slice(0, count).sort(() => Math.random() - 0.5);
}

function ScoreStrip({ stats }: { stats: Stats }) {
  const accuracy = stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);
  const difficulty = difficultyFromCorrect(stats.correct);
  const correctTowardNext = difficulty === 100 ? 3 : stats.correct % 3;
  return (
    <div className="fun-score-strip" aria-label="Game score">
      <span><strong>{stats.correct}</strong> points</span>
      <span><strong>{accuracy}%</strong> accuracy</span>
      <span><strong>{stats.streak}</strong> streak</span>
      <div className="fun-difficulty" aria-label={`Difficulty ${difficulty}%`}>
        <div><strong>Difficulty {difficulty}%</strong><small>{difficulty === 100 ? 'Maximum level' : `${correctTowardNext}/3 correct to level up`}</small></div>
        <progress max="100" value={difficulty} aria-label="Difficulty progress" />
      </div>
    </div>
  );
}

function feedbackWithProgress(correct: boolean, message: string, stats: Stats): Feedback {
  const currentDifficulty = difficultyFromCorrect(stats.correct);
  const nextDifficulty = difficultyFromCorrect(stats.correct + (correct ? 1 : 0));
  return {
    correct,
    message,
    difficultyIncrease: nextDifficulty > currentDifficulty ? nextDifficulty : undefined,
  };
}

function FeedbackBanner({ feedback, onNext }: { feedback: Feedback; onNext: () => void }) {
  return (
    <div className={`fun-feedback ${feedback.correct ? 'correct' : 'incorrect'}`} role="status">
      {feedback.correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
      <div>
        <strong>{feedback.correct ? 'Nice work!' : 'Good try!'}</strong>
        <p>{feedback.message}</p>
        {feedback.difficultyIncrease !== undefined && (
          <p className="fun-level-up"><Sparkles aria-hidden="true" size={16} /> Difficulty increased to {feedback.difficultyIncrease}%!</p>
        )}
      </div>
      <button type="button" onClick={onNext}>
        <RefreshCw aria-hidden="true" size={17} /> Next challenge
      </button>
    </div>
  );
}

function CoordinateGrid({
  points = [],
  selected,
  interactive = false,
  onSelect,
  ariaLabel,
  range = 5,
}: {
  points?: Array<{ point: Point; label: string; tone?: string }>;
  selected?: Point | null;
  interactive?: boolean;
  onSelect?: (point: Point) => void;
  ariaLabel: string;
  range?: number;
}) {
  const size = 360;
  const origin = size / 2;
  const step = 150 / range;
  const coordinateValues = coordinateValuesForRange(range);
  const toScreen = (point: Point) => ({ x: origin + point.x * step, y: origin - point.y * step });
  const selectFromPointer = (event: MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onSelect) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const screenX = ((event.clientX - bounds.left) / bounds.width) * size;
    const screenY = ((event.clientY - bounds.top) / bounds.height) * size;
    onSelect({
      x: Math.max(-range, Math.min(range, Math.round((screenX - origin) / step))),
      y: Math.max(-range, Math.min(range, Math.round((origin - screenY) / step))),
    });
  };

  return (
    <svg
      className={`coordinate-game-grid${interactive ? ' interactive' : ''}`}
      viewBox="0 0 360 360"
      role="img"
      aria-label={ariaLabel}
      onClick={selectFromPointer}
    >
      <defs>
        <marker id="fun-axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <rect width="360" height="360" rx="18" className="fun-grid-bg" />
      {coordinateValues.map((value) => (
        <g key={value}>
          <line x1={origin + value * step} y1="30" x2={origin + value * step} y2="330" className="fun-grid-line" />
          <line x1="30" y1={origin + value * step} x2="330" y2={origin + value * step} className="fun-grid-line" />
          {value !== 0 && (
            <>
              <text x={origin + value * step} y={origin + 17} textAnchor="middle" className="fun-grid-number">{value}</text>
              <text x={origin - 10} y={origin - value * step + 4} textAnchor="end" className="fun-grid-number">{value}</text>
            </>
          )}
        </g>
      ))}
      <line x1="22" y1={origin} x2="338" y2={origin} className="fun-grid-axis" markerEnd="url(#fun-axis-arrow)" />
      <line x1={origin} y1="338" x2={origin} y2="22" className="fun-grid-axis" markerEnd="url(#fun-axis-arrow)" />
      <text x="338" y={origin - 10} className="fun-grid-axis-label">x</text>
      <text x={origin + 10} y="25" className="fun-grid-axis-label">y</text>
      {points.map(({ point, label, tone = 'primary' }) => {
        const screen = toScreen(point);
        return (
          <g key={`${label}-${point.x}-${point.y}`}>
            <circle cx={screen.x} cy={screen.y} r="8" className={`fun-point ${tone}`} />
            <text x={screen.x + 11} y={screen.y - 10} className="fun-point-label">{label}</text>
          </g>
        );
      })}
      {selected && (() => {
        const screen = toScreen(selected);
        return <circle cx={screen.x} cy={screen.y} r="11" className="fun-selected-point" />;
      })()}
    </svg>
  );
}

type ActivityProps = { stats: Stats; onResult: (correct: boolean) => void };

function ActivityShell({
  gameId,
  stats,
  instructions,
  children,
}: {
  gameId: GameId;
  stats: Stats;
  instructions: string;
  children: React.ReactNode;
}) {
  const game = games.find((item) => item.id === gameId)!;
  const Icon = game.icon;
  return (
    <section className={`panel fun-activity fun-${game.color}`} aria-labelledby={`${gameId}-game-heading`}>
      <div className="fun-activity-heading">
        <div className="fun-game-icon"><Icon aria-hidden="true" /></div>
        <div>
          <p className="eyebrow">{game.skill}</p>
          <h2 id={`${gameId}-game-heading`}>{game.title}</h2>
        </div>
      </div>
      <p className="fun-instructions"><strong>How to play:</strong> {instructions}</p>
      <ScoreStrip stats={stats} />
      {children}
    </section>
  );
}

function TargetPlotter({ stats, onResult }: ActivityProps) {
  const level = difficultyLevel(stats);
  const range = 2 + level;
  const coordinateValues = coordinateValuesForRange(range);
  const [target, setTarget] = useState(() => randomPoint(range));
  const [selected, setSelected] = useState<Point | null>(null);
  const [keyboardPoint, setKeyboardPoint] = useState<Point>({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const submit = (point: Point) => {
    if (feedback) return;
    setSelected(point);
    const correct = samePoint(point, target);
    onResult(correct);
    setFeedback(feedbackWithProgress(
      correct,
      correct
        ? `Bullseye! You plotted ${pointLabel(target)}.`
        : `You chose ${pointLabel(point)}. The target was ${pointLabel(target)}: x first, then y.`,
      stats,
    ));
  };
  const next = () => {
    setTarget(randomPoint(range));
    setSelected(null);
    setFeedback(null);
  };

  return (
    <ActivityShell gameId="plot" stats={stats} instructions="Plot the target ordered pair on the grid. Click the grid, or use the keyboard-friendly coordinate picker.">
      <div className="fun-prompt" data-testid="plot-target">Plot <strong>{pointLabel(target)}</strong> <small>Range: −{range} to {range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={range} interactive={!feedback} selected={selected} onSelect={submit} ariaLabel={`Blank coordinate grid from negative ${range} to ${range}. Plot ${pointLabel(target)}.`} />
        <div className="fun-control-card">
          <h3>Coordinate picker</h3>
          <div className="coordinate-picker">
            <label>x<select value={keyboardPoint.x} onChange={(event) => setKeyboardPoint((current) => ({ ...current, x: Number(event.target.value) }))}>{coordinateValues.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>y<select value={keyboardPoint.y} onChange={(event) => setKeyboardPoint((current) => ({ ...current, y: Number(event.target.value) }))}>{coordinateValues.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <button type="button" className="fun-primary-button" disabled={Boolean(feedback)} onClick={() => submit(keyboardPoint)}>Plot this point</button>
          <p className="fun-tip">Remember: move along x first, then move along y.</p>
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

function RadarReader({ stats, onResult }: ActivityProps) {
  const level = difficultyLevel(stats);
  const range = 2 + level;
  const choiceCount = 3 + Math.floor(level / 2);
  const [point, setPoint] = useState(() => randomPoint(range, false));
  const choices = useMemo(() => makePointChoices(point, range, choiceCount), [point, range, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, point);
    onResult(correct);
    setFeedback(feedbackWithProgress(correct, correct ? `Signal decoded: ${pointLabel(point)}.` : `That was ${pointLabel(choice)}. Read x horizontally and y vertically; the signal is ${pointLabel(point)}.`, stats));
  };
  const next = () => { setPoint(randomPoint(range, false)); setFeedback(null); };
  return (
    <ActivityShell gameId="read" stats={stats} instructions="Read the glowing signal on the grid and choose its ordered pair.">
      <div className="fun-prompt">What coordinates is the radar signal marking? <small>{choiceCount} answer choices • range ±{range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={range} points={[{ point, label: '?' }]} ariaLabel="Coordinate grid with one radar signal to identify." />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

type TranslationChallenge = { start: Point; moves: Point[]; answer: Point; range: number };
const makeTranslation = (level: number): TranslationChallenge => {
  const range = 3 + level;
  const stepCount = 1 + Math.floor(level / 2);
  const moveLimit = 1 + Math.ceil(level / 2);
  const start = randomPoint(Math.max(1, range - 2));
  const moves: Point[] = [];
  let current = { ...start };
  for (let step = 0; step < stepCount; step += 1) {
    let move = { x: 0, y: 0 };
    do {
      move = { x: randomInt(-moveLimit, moveLimit), y: randomInt(-moveLimit, moveLimit) };
    } while (
      (move.x === 0 && move.y === 0)
      || Math.abs(current.x + move.x) > range
      || Math.abs(current.y + move.y) > range
    );
    moves.push(move);
    current = { x: current.x + move.x, y: current.y + move.y };
  }
  return { start, moves, answer: current, range };
};

function TranslationTrek({ stats, onResult }: ActivityProps) {
  const level = difficultyLevel(stats);
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makeTranslation(level));
  const choices = useMemo(() => makePointChoices(challenge.answer, challenge.range, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, challenge.answer);
    onResult(correct);
    const totalMove = challenge.moves.reduce((total, move) => ({ x: total.x + move.x, y: total.y + move.y }), { x: 0, y: 0 });
    setFeedback(feedbackWithProgress(correct, correct ? `The rover arrived at ${pointLabel(challenge.answer)}.` : `Combine the moves to get a total translation of (${totalMove.x}, ${totalMove.y}), then add it to ${pointLabel(challenge.start)}. The destination is ${pointLabel(challenge.answer)}.`, stats));
  };
  const next = () => { setChallenge(makeTranslation(level)); setFeedback(null); };
  return (
    <ActivityShell gameId="translate" stats={stats} instructions="Guide the rover by applying every translation vector in order to its starting coordinates.">
      <div className="fun-prompt">Start at <strong>{pointLabel(challenge.start)}</strong>, then move {challenge.moves.map((move, index) => <strong key={`${move.x}-${move.y}-${index}`}>⟨{move.x}, {move.y}⟩{index < challenge.moves.length - 1 ? ', then ' : ''}</strong>)}. Where do you land? <small>{challenge.moves.length} step{challenge.moves.length === 1 ? '' : 's'} • range ±{challenge.range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={challenge.range} points={[{ point: challenge.start, label: 'START', tone: 'secondary' }]} ariaLabel={`Rover starts at ${pointLabel(challenge.start)} and has ${challenge.moves.length} translation steps.`} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

type RotationChallenge = { point: Point; clockwise: boolean; angle: 90 | 180 | 270; translation?: Point; answer: Point; range: number };
const rotatePoint = (point: Point, angle: 90 | 180 | 270, clockwise: boolean): Point => {
  let rotated = { ...point };
  for (let turn = 0; turn < angle / 90; turn += 1) {
    rotated = clockwise ? { x: rotated.y, y: -rotated.x } : { x: -rotated.y, y: rotated.x };
  }
  return rotated;
};
const makeRotation = (level: number): RotationChallenge => {
  const range = 2 + level;
  const angles: Array<90 | 180 | 270> = level < 2 ? [90] : level < 3 ? [90, 180] : [90, 180, 270];
  const angle = angles[randomInt(0, angles.length - 1)];
  const clockwise = level === 0 ? true : Math.random() > 0.5;
  const point = randomPoint(Math.max(1, range - (level >= 4 ? 2 : 0)), false);
  const rotated = rotatePoint(point, angle, clockwise);
  const translation = level >= 4 ? randomPoint(level === 4 ? 1 : 2, false) : undefined;
  const answer = translation ? { x: rotated.x + translation.x, y: rotated.y + translation.y } : rotated;
  return { point, clockwise, angle, translation, answer, range };
};

function RotationReactor({ stats, onResult }: ActivityProps) {
  const level = difficultyLevel(stats);
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makeRotation(level));
  const choices = useMemo(() => makePointChoices(challenge.answer, challenge.range, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, challenge.answer);
    onResult(correct);
    const extraStep = challenge.translation ? ` Then apply the translation (${challenge.translation.x}, ${challenge.translation.y}).` : '';
    setFeedback(feedbackWithProgress(correct, correct ? `Perfect transformation! The new point is ${pointLabel(challenge.answer)}.` : `Rotate ${challenge.angle}° ${challenge.clockwise ? 'clockwise' : 'counterclockwise'}.${extraStep} The answer is ${pointLabel(challenge.answer)}.`, stats));
  };
  const next = () => { setChallenge(makeRotation(level)); setFeedback(null); };
  return (
    <ActivityShell gameId="rotate" stats={stats} instructions="Rotate the energy crystal around the origin, then complete any extra transformation shown.">
      <div className="fun-prompt">Rotate <strong>{pointLabel(challenge.point)}</strong> <strong>{challenge.angle}° {challenge.clockwise ? 'clockwise' : 'counterclockwise'}</strong>{challenge.translation && <>, then translate by <strong>⟨{challenge.translation.x}, {challenge.translation.y}⟩</strong></>}. <small>{choiceCount} choices • range ±{challenge.range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={challenge.range} points={[{ point: challenge.point, label: 'CRYSTAL' }]} ariaLabel={`Point ${pointLabel(challenge.point)} before a ${challenge.angle} degree ${challenge.clockwise ? 'clockwise' : 'counterclockwise'} rotation.`} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

const relationships = [
  'Same x-coordinate, not reflections',
  'Same y-coordinate, not reflections',
  'Reflections across the x-axis',
  'Reflections across the y-axis',
  'Opposite points about the origin',
  'Coordinates are swapped',
  'A 90° clockwise rotation',
] as const;
type Relationship = (typeof relationships)[number];
type RelationshipChallenge = { first: Point; second: Point; answer: Relationship; range: number };
const makeRelationship = (level: number): RelationshipChallenge => {
  const range = 2 + level;
  const availableRelationships = relationships.slice(0, level + 2);
  const answer = availableRelationships[randomInt(0, availableRelationships.length - 1)];
  let first = randomPoint(range, false);
  while (first.x === 0 || first.y === 0 || Math.abs(first.x) === Math.abs(first.y)) {
    first = randomPoint(range, false);
  }
  let second: Point;
  if (answer === 'Same x-coordinate, not reflections') second = { x: first.x, y: first.y === range ? first.y - 1 : first.y + 1 };
  else if (answer === 'Same y-coordinate, not reflections') second = { x: first.x === range ? first.x - 1 : first.x + 1, y: first.y };
  else if (answer === 'Reflections across the x-axis') second = { x: first.x, y: -first.y };
  else if (answer === 'Reflections across the y-axis') second = { x: -first.x, y: first.y };
  else if (answer === 'Opposite points about the origin') second = { x: -first.x, y: -first.y };
  else if (answer === 'Coordinates are swapped') second = { x: first.y, y: first.x };
  else second = { x: first.y, y: -first.x };
  return { first, second, answer, range };
};

function MirrorMatch({ stats, onResult }: ActivityProps) {
  const level = difficultyLevel(stats);
  const availableRelationships = relationships.slice(0, level + 2);
  const [challenge, setChallenge] = useState(() => makeRelationship(level));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Relationship) => {
    if (feedback) return;
    const correct = choice === challenge.answer;
    onResult(correct);
    setFeedback(feedbackWithProgress(correct, correct ? `You spotted it: ${challenge.answer.toLowerCase()}.` : `Compare one coordinate at a time. These are ${challenge.answer.toLowerCase()}.`, stats));
  };
  const next = () => { setChallenge(makeRelationship(level)); setFeedback(null); };
  return (
    <ActivityShell gameId="relate" stats={stats} instructions="Compare points A and B. Choose the relationship that connects their coordinates.">
      <div className="fun-prompt">{level >= 4 ? <>How are the plotted points <strong>A</strong> and <strong>B</strong> related?</> : <>How are <strong>A {pointLabel(challenge.first)}</strong> and <strong>B {pointLabel(challenge.second)}</strong> related?</>} <small>{availableRelationships.length} possible relationships • range ±{challenge.range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={challenge.range} points={[{ point: challenge.first, label: 'A' }, { point: challenge.second, label: 'B', tone: 'secondary' }]} ariaLabel={`Point A is ${pointLabel(challenge.first)} and point B is ${pointLabel(challenge.second)}.`} />
        <div className="fun-choice-stack relationship-choices">
          {availableRelationships.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

export function FunZoneMode() {
  const [activeGame, setActiveGame] = useState<GameId>('plot');
  const [allStats, setAllStats] = useState<Record<GameId, Stats>>(() => ({
    plot: emptyStats(), read: emptyStats(), translate: emptyStats(), rotate: emptyStats(), relate: emptyStats(),
  }));
  const recordResult = (gameId: GameId, correct: boolean) => {
    setAllStats((current) => ({
      ...current,
      [gameId]: {
        correct: current[gameId].correct + (correct ? 1 : 0),
        attempts: current[gameId].attempts + 1,
        streak: correct ? current[gameId].streak + 1 : 0,
      },
    }));
  };
  const totalCorrect = Object.values(allStats).reduce((total, stats) => total + stats.correct, 0);
  const totalAttempts = Object.values(allStats).reduce((total, stats) => total + stats.attempts, 0);
  const activityProps = (id: GameId) => ({ stats: allStats[id], onResult: (correct: boolean) => recordResult(id, correct) });

  return (
    <div className="fun-zone-layout">
      <section className="fun-zone-hero" aria-labelledby="fun-zone-heading">
        <div>
          <p className="eyebrow">Coordinate Arcade • 5 games</p>
          <h2 id="fun-zone-heading"><Gamepad2 aria-hidden="true" /> Choose your next challenge</h2>
          <p>Every game starts at 0% difficulty and levels up by 20% after every three correct answers. Build your skills all the way to 100%.</p>
        </div>
        <div className="fun-total-score" aria-label={`${totalCorrect} total points from ${totalAttempts} attempts`}>
          <strong>{totalCorrect}</strong><span>Total points</span><small>{totalAttempts} attempts</small>
        </div>
      </section>

      <nav className="fun-game-selector" aria-label="Fun Zone activities">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button key={game.id} type="button" className={`${game.color}${activeGame === game.id ? ' active' : ''}`} aria-pressed={activeGame === game.id} onClick={() => setActiveGame(game.id)}>
              <span className="fun-selector-icon"><Icon aria-hidden="true" /></span>
              <span><strong>{game.title}</strong><small>{game.tagline}</small></span>
              <span className="fun-mini-score">{allStats[game.id].correct} pts • {difficultyFromCorrect(allStats[game.id].correct)}%</span>
            </button>
          );
        })}
      </nav>

      {activeGame === 'plot' && <TargetPlotter {...activityProps('plot')} />}
      {activeGame === 'read' && <RadarReader {...activityProps('read')} />}
      {activeGame === 'translate' && <TranslationTrek {...activityProps('translate')} />}
      {activeGame === 'rotate' && <RotationReactor {...activityProps('rotate')} />}
      {activeGame === 'relate' && <MirrorMatch {...activityProps('relate')} />}
    </div>
  );
}
