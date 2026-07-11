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
type Feedback = { correct: boolean; message: string };

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

const coordinateValues = Array.from({ length: 11 }, (_, index) => index - 5);
const emptyStats = (): Stats => ({ correct: 0, attempts: 0, streak: 0 });
const randomInt = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
const randomPoint = (allowOrigin = true): Point => {
  let point = { x: randomInt(-4, 4), y: randomInt(-4, 4) };
  while (!allowOrigin && point.x === 0 && point.y === 0) {
    point = { x: randomInt(-4, 4), y: randomInt(-4, 4) };
  }
  return point;
};
const pointLabel = (point: Point) => `(${point.x}, ${point.y})`;
const samePoint = (first: Point, second: Point) => first.x === second.x && first.y === second.y;

function makePointChoices(answer: Point): Point[] {
  const candidates = [
    answer,
    { x: answer.y, y: answer.x },
    { x: -answer.x, y: answer.y },
    { x: answer.x, y: -answer.y },
    { x: answer.x + (answer.x < 4 ? 1 : -1), y: answer.y },
  ];
  const unique = candidates.filter(
    (candidate, index) => candidates.findIndex((point) => samePoint(point, candidate)) === index,
  );
  while (unique.length < 4) {
    const candidate = randomPoint();
    if (!unique.some((point) => samePoint(point, candidate))) unique.push(candidate);
  }
  return unique.slice(0, 4).sort(() => Math.random() - 0.5);
}

function ScoreStrip({ stats }: { stats: Stats }) {
  const accuracy = stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);
  return (
    <div className="fun-score-strip" aria-label="Game score">
      <span><strong>{stats.correct}</strong> points</span>
      <span><strong>{accuracy}%</strong> accuracy</span>
      <span><strong>{stats.streak}</strong> streak</span>
    </div>
  );
}

function FeedbackBanner({ feedback, onNext }: { feedback: Feedback; onNext: () => void }) {
  return (
    <div className={`fun-feedback ${feedback.correct ? 'correct' : 'incorrect'}`} role="status">
      {feedback.correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
      <div>
        <strong>{feedback.correct ? 'Nice work!' : 'Good try!'}</strong>
        <p>{feedback.message}</p>
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
}: {
  points?: Array<{ point: Point; label: string; tone?: string }>;
  selected?: Point | null;
  interactive?: boolean;
  onSelect?: (point: Point) => void;
  ariaLabel: string;
}) {
  const size = 360;
  const origin = size / 2;
  const step = 30;
  const toScreen = (point: Point) => ({ x: origin + point.x * step, y: origin - point.y * step });
  const selectFromPointer = (event: MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onSelect) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const screenX = ((event.clientX - bounds.left) / bounds.width) * size;
    const screenY = ((event.clientY - bounds.top) / bounds.height) * size;
    onSelect({
      x: Math.max(-5, Math.min(5, Math.round((screenX - origin) / step))),
      y: Math.max(-5, Math.min(5, Math.round((origin - screenY) / step))),
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
  const [target, setTarget] = useState(() => randomPoint());
  const [selected, setSelected] = useState<Point | null>(null);
  const [keyboardPoint, setKeyboardPoint] = useState<Point>({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const submit = (point: Point) => {
    if (feedback) return;
    setSelected(point);
    const correct = samePoint(point, target);
    onResult(correct);
    setFeedback({
      correct,
      message: correct
        ? `Bullseye! You plotted ${pointLabel(target)}.`
        : `You chose ${pointLabel(point)}. The target was ${pointLabel(target)}: x first, then y.`,
    });
  };
  const next = () => {
    setTarget(randomPoint());
    setSelected(null);
    setFeedback(null);
  };

  return (
    <ActivityShell gameId="plot" stats={stats} instructions="Plot the target ordered pair on the grid. Click the grid, or use the keyboard-friendly coordinate picker.">
      <div className="fun-prompt">Plot <strong>{pointLabel(target)}</strong></div>
      <div className="fun-play-grid">
        <CoordinateGrid interactive={!feedback} selected={selected} onSelect={submit} ariaLabel={`Blank coordinate grid. Plot ${pointLabel(target)}.`} />
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
  const [point, setPoint] = useState(() => randomPoint(false));
  const choices = useMemo(() => makePointChoices(point), [point]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, point);
    onResult(correct);
    setFeedback({ correct, message: correct ? `Signal decoded: ${pointLabel(point)}.` : `That was ${pointLabel(choice)}. Read x horizontally and y vertically; the signal is ${pointLabel(point)}.` });
  };
  const next = () => { setPoint(randomPoint(false)); setFeedback(null); };
  return (
    <ActivityShell gameId="read" stats={stats} instructions="Read the glowing signal on the grid and choose its ordered pair.">
      <div className="fun-prompt">What coordinates is the radar signal marking?</div>
      <div className="fun-play-grid">
        <CoordinateGrid points={[{ point, label: '?' }]} ariaLabel="Coordinate grid with one radar signal to identify." />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

type TranslationChallenge = { start: Point; move: Point; answer: Point };
const makeTranslation = (): TranslationChallenge => {
  const start = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  let move = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  while ((move.x === 0 && move.y === 0) || Math.abs(start.x + move.x) > 5 || Math.abs(start.y + move.y) > 5) {
    move = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  }
  return { start, move, answer: { x: start.x + move.x, y: start.y + move.y } };
};

function TranslationTrek({ stats, onResult }: ActivityProps) {
  const [challenge, setChallenge] = useState(makeTranslation);
  const choices = useMemo(() => makePointChoices(challenge.answer), [challenge]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, challenge.answer);
    onResult(correct);
    setFeedback({ correct, message: correct ? `The rover arrived at ${pointLabel(challenge.answer)}.` : `Add the translation to each coordinate: (${challenge.start.x} + ${challenge.move.x}, ${challenge.start.y} + ${challenge.move.y}) = ${pointLabel(challenge.answer)}.` });
  };
  const next = () => { setChallenge(makeTranslation()); setFeedback(null); };
  return (
    <ActivityShell gameId="translate" stats={stats} instructions="Guide the rover by adding the translation vector to its starting coordinates.">
      <div className="fun-prompt">Start at <strong>{pointLabel(challenge.start)}</strong>, then move <strong>⟨{challenge.move.x}, {challenge.move.y}⟩</strong>. Where do you land?</div>
      <div className="fun-play-grid">
        <CoordinateGrid points={[{ point: challenge.start, label: 'START', tone: 'secondary' }]} ariaLabel={`Rover starts at ${pointLabel(challenge.start)} and translates by ${pointLabel(challenge.move)}.`} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

type RotationChallenge = { point: Point; clockwise: boolean; answer: Point };
const makeRotation = (): RotationChallenge => {
  const point = randomPoint(false);
  const clockwise = Math.random() > 0.5;
  return { point, clockwise, answer: clockwise ? { x: point.y, y: -point.x } : { x: -point.y, y: point.x } };
};

function RotationReactor({ stats, onResult }: ActivityProps) {
  const [challenge, setChallenge] = useState(makeRotation);
  const choices = useMemo(() => makePointChoices(challenge.answer), [challenge]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, challenge.answer);
    onResult(correct);
    const rule = challenge.clockwise ? '(x, y) → (y, −x)' : '(x, y) → (−y, x)';
    setFeedback({ correct, message: correct ? `Perfect spin! The new point is ${pointLabel(challenge.answer)}.` : `For a 90° ${challenge.clockwise ? 'clockwise' : 'counterclockwise'} turn, use ${rule}. The answer is ${pointLabel(challenge.answer)}.` });
  };
  const next = () => { setChallenge(makeRotation()); setFeedback(null); };
  return (
    <ActivityShell gameId="rotate" stats={stats} instructions="Rotate the energy crystal 90° around the origin and choose its new coordinates.">
      <div className="fun-prompt">Rotate <strong>{pointLabel(challenge.point)}</strong> 90° <strong>{challenge.clockwise ? 'clockwise' : 'counterclockwise'}</strong>.</div>
      <div className="fun-play-grid">
        <CoordinateGrid points={[{ point: challenge.point, label: 'CRYSTAL' }]} ariaLabel={`Point ${pointLabel(challenge.point)} before a 90 degree ${challenge.clockwise ? 'clockwise' : 'counterclockwise'} rotation.`} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </ActivityShell>
  );
}

const relationships = [
  'Same x-coordinate',
  'Same y-coordinate',
  'Reflections across the x-axis',
  'Reflections across the y-axis',
  'Opposite points about the origin',
] as const;
type Relationship = (typeof relationships)[number];
type RelationshipChallenge = { first: Point; second: Point; answer: Relationship };
const makeRelationship = (): RelationshipChallenge => {
  const answer = relationships[randomInt(0, relationships.length - 1)];
  const first = { x: randomInt(1, 4) * (Math.random() > 0.5 ? 1 : -1), y: randomInt(1, 4) * (Math.random() > 0.5 ? 1 : -1) };
  let second: Point;
  if (answer === 'Same x-coordinate') second = { x: first.x, y: first.y === 4 ? 2 : first.y + 1 };
  else if (answer === 'Same y-coordinate') second = { x: first.x === 4 ? 2 : first.x + 1, y: first.y };
  else if (answer === 'Reflections across the x-axis') second = { x: first.x, y: -first.y };
  else if (answer === 'Reflections across the y-axis') second = { x: -first.x, y: first.y };
  else second = { x: -first.x, y: -first.y };
  return { first, second, answer };
};

function MirrorMatch({ stats, onResult }: ActivityProps) {
  const [challenge, setChallenge] = useState(makeRelationship);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Relationship) => {
    if (feedback) return;
    const correct = choice === challenge.answer;
    onResult(correct);
    setFeedback({ correct, message: correct ? `You spotted it: ${challenge.answer.toLowerCase()}.` : `Compare one coordinate at a time. These are ${challenge.answer.toLowerCase()}.` });
  };
  const next = () => { setChallenge(makeRelationship()); setFeedback(null); };
  return (
    <ActivityShell gameId="relate" stats={stats} instructions="Compare points A and B. Choose the relationship that connects their coordinates.">
      <div className="fun-prompt">How are <strong>A {pointLabel(challenge.first)}</strong> and <strong>B {pointLabel(challenge.second)}</strong> related?</div>
      <div className="fun-play-grid">
        <CoordinateGrid points={[{ point: challenge.first, label: 'A' }, { point: challenge.second, label: 'B', tone: 'secondary' }]} ariaLabel={`Point A is ${pointLabel(challenge.first)} and point B is ${pointLabel(challenge.second)}.`} />
        <div className="fun-choice-stack relationship-choices">
          {relationships.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice}</button>)}
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
          <p>Every round is randomized. Build a streak, improve your accuracy, and try to earn a point in all five games.</p>
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
              <span className="fun-mini-score">{allStats[game.id].correct} pts</span>
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
