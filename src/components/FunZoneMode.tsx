import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Crosshair, MoveRight, Radar, RotateCw, Sparkles } from 'lucide-react';
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
  type DifficultyOverride,
  type Feedback,
  type GameMeta,
  type Stats,
} from './funzone/FunZoneShared';

export { difficultyFromCorrect } from './funzone/FunZoneShared';

type Point = { x: number; y: number };
type GameId = 'plot' | 'rotate';

const gameIds: GameId[] = ['plot', 'rotate'];

const games: Array<GameMeta<GameId>> = [
  { id: 'plot', title: 'Target Plotter', tagline: 'Hit the ordered pair', skill: 'Plotting points', icon: Crosshair, color: 'coral', showDifficulty: false },
  { id: 'rotate', title: 'Rotation Reactor', tagline: 'Rotate vectors and frames', skill: 'Rotation', icon: RotateCw, color: 'purple', showDifficulty: false },
];

const coordinateValuesForRange = (range: number) =>
  Array.from({ length: range * 2 + 1 }, (_, index) => index - range);
const randomPoint = (range = 4, allowOrigin = true): Point => {
  let point = { x: randomInt(-range, range), y: randomInt(-range, range) };
  while (!allowOrigin && point.x === 0 && point.y === 0) {
    point = { x: randomInt(-range, range), y: randomInt(-range, range) };
  }
  return point;
};
const pointLabel = (point: Point) => `(${point.x}, ${point.y})`;
const samePoint = (first: Point, second: Point) => first.x === second.x && first.y === second.y;

export function coordinateFromGridPointer(
  clientPoint: Point,
  bounds: { left: number; top: number; width: number; height: number },
  range: number,
): Point {
  const viewBoxSize = 360;
  const origin = viewBoxSize / 2;
  const gridStep = 150 / range;
  const renderedScale = Math.min(bounds.width / viewBoxSize, bounds.height / viewBoxSize);
  const renderedWidth = viewBoxSize * renderedScale;
  const renderedHeight = viewBoxSize * renderedScale;
  const horizontalLetterbox = (bounds.width - renderedWidth) / 2;
  const verticalLetterbox = (bounds.height - renderedHeight) / 2;
  const viewBoxX = (clientPoint.x - bounds.left - horizontalLetterbox) / renderedScale;
  const viewBoxY = (clientPoint.y - bounds.top - verticalLetterbox) / renderedScale;

  return {
    x: Math.max(-range, Math.min(range, Math.round((viewBoxX - origin) / gridStep))),
    y: Math.max(-range, Math.min(range, Math.round((origin - viewBoxY) / gridStep))),
  };
}

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

function CoordinateGrid({
  points = [],
  vectors = [],
  selected,
  interactive = false,
  onSelect,
  ariaLabel,
  range = 5,
}: {
  points?: Array<{ point: Point; label: string; tone?: string }>;
  vectors?: Array<{ endpoint: Point; label: string; tone?: string }>;
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
    onSelect(coordinateFromGridPointer(
      { x: event.clientX, y: event.clientY },
      bounds,
      range,
    ));
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
        <marker id="fun-vector-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={7 / 3} markerHeight={7 / 3} orient="auto">
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
      {vectors.map(({ endpoint, label, tone = 'primary' }) => {
        const screen = toScreen(endpoint);
        return (
          <g key={`${label}-${endpoint.x}-${endpoint.y}`} className={`fun-vector ${tone}`}>
            <line x1={origin} y1={origin} x2={screen.x} y2={screen.y} markerEnd="url(#fun-vector-arrow)" />
            <text x={screen.x + 11} y={screen.y - 10} className="fun-point-label">{label}</text>
          </g>
        );
      })}
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

type ActivityProps = { stats: Stats; override: DifficultyOverride; onResult: (correct: boolean) => void };

type ClimberPhase = 'idle' | 'climbing' | 'fall-low' | 'fall-mid' | 'fall-fatal' | 'victory' | 'game-over';

function TargetPlotter({ stats, override, onResult }: ActivityProps) {
  const range = 7;
  const [target, setTarget] = useState(() => randomPoint(range));
  const [selected, setSelected] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [progress, setProgress] = useState(0);
  const [gender, setGender] = useState<'female' | 'male'>(() => Math.random() < 0.5 ? 'female' : 'male');
  const [phase, setPhase] = useState<ClimberPhase>('idle');
  const timers = useRef<number[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };
  const after = (delay: number, callback: () => void) => timers.current.push(window.setTimeout(callback, delay));
  useEffect(() => () => {
    clearTimers();
    void audioContext.current?.close();
  }, []);
  const playSound = (kind: 'climb' | 'scream' | 'light-impact' | 'heavy-impact' | 'victory') => {
    if (typeof AudioContext === 'undefined') return;
    const context = audioContext.current ?? new AudioContext();
    audioContext.current = context;
    void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const [frequency, duration, volume, type] = {
      climb: [210, 0.14, 0.04, 'square'],
      scream: [620, 0.9, 0.08, 'sawtooth'],
      'light-impact': [105, 0.22, 0.08, 'square'],
      'heavy-impact': [68, 0.4, 0.14, 'square'],
      victory: [440, 0.75, 0.1, 'triangle'],
    }[kind] as [number, number, number, OscillatorType];
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'victory' ? frequency * 2 : Math.max(35, frequency / 3), context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };
  const presentNextQuestion = () => {
    setTarget(randomPoint(range));
    setSelected(null);
    setFeedback(null);
    setPhase('idle');
  };
  const locked = phase !== 'idle' || Boolean(feedback);
  const submit = (point: Point) => {
    if (locked) return;
    setSelected(point);
    const correct = samePoint(point, target);
    onResult(correct);
    setFeedback({
      correct,
      message: correct
        ? `Bullseye! You plotted ${pointLabel(target)}.`
        : `You chose ${pointLabel(point)}. The target was ${pointLabel(target)}: x first, then y.`,
    });
    if (correct) {
      const destination = Math.min(100, progress + 10);
      setPhase('climbing');
      playSound('climb');
      after(850, () => {
        setProgress(destination);
        if (destination === 100) {
          setPhase('victory');
          playSound('victory');
        } else {
          presentNextQuestion();
        }
      });
    } else if (progress > 0) {
      const fallPhase: ClimberPhase = progress <= 20 ? 'fall-low' : progress <= 60 ? 'fall-mid' : 'fall-fatal';
      setPhase(fallPhase);
      after(150, () => playSound('scream'));
      after(fallPhase === 'fall-low' ? 550 : 750, () => playSound(fallPhase === 'fall-low' ? 'light-impact' : 'heavy-impact'));
      after(fallPhase === 'fall-fatal' ? 1250 : 1800, () => {
        if (fallPhase === 'fall-fatal') setPhase('game-over');
        else {
          setProgress(0);
          presentNextQuestion();
        }
      });
    } else {
      // Even a miss from the ground is a complete round. Keep input locked long
      // enough for the result to be recognized before presenting a new target.
      after(1100, presentNextQuestion);
    }
  };
  const newGame = () => {
    clearTimers();
    void audioContext.current?.close();
    audioContext.current = null;
    setTarget(randomPoint(range));
    setSelected(null);
    setFeedback(null);
    setProgress(0);
    setGender(Math.random() < 0.5 ? 'female' : 'male');
    setPhase('idle');
  };

  return (
    <GameShell icon={Crosshair} color="coral" skill="Plotting points" title="Target Plotter" headingId="plot-game-heading" instructions="Plot each ordered pair correctly to help the climber reach the platform. Each correct answer climbs one rung." stats={stats} difficulty={0} override={override} showDifficulty={false}>
      <div className="fun-prompt" data-testid="plot-target">Plot <strong>{pointLabel(target)}</strong> <small>Range: −{range} to {range}</small></div>
      <div className="ladder-game-layout">
        <CoordinateGrid range={range} interactive={!locked} selected={selected} onSelect={submit} ariaLabel={`Blank coordinate grid from negative ${range} to ${range}. Plot ${pointLabel(target)}.`} />
        <section className={`ladder-scene phase-${phase}`} aria-label={`${gender} climber at ${progress}% of the ladder`}>
          <div className="ladder-platform"><span>FINISH</span></div>
          <div className="ladder">{Array.from({ length: 11 }, (_, index) => <span key={index} style={{ bottom: `${index * 9}%` }} />)}</div>
          <div className="ladder-climber" style={{ '--climb-progress': progress } as CSSProperties}>
            <span className={`climber-head ${gender}`} /><span className="climber-body" />
            <span className="climber-arm left" /><span className="climber-arm right" />
            <span className="climber-leg left" /><span className="climber-leg right" />
          </div>
          {phase === 'victory' && <div className="ladder-confetti" aria-hidden="true">✦ 🎉 ✦</div>}
          {phase === 'victory' && (
            <div className="ladder-result" role="status">
              <span>Platform reached! You win!</span>
              <button type="button" onClick={newGame}>New game</button>
            </div>
          )}
          {phase === 'game-over' && <div className="ladder-game-over" role="alert"><strong>Game Over</strong><span>The climber fell from too high.</span><button type="button" onClick={newGame}>Start new game</button></div>}
          <progress max="100" value={progress} aria-label="Ladder progress" />
          <span className="ladder-progress-label">{progress}% climbed</span>
        </section>
      </div>
      {feedback && phase !== 'victory' && phase !== 'game-over' && (
        <FeedbackBanner feedback={feedback} onNext={() => {}} autoAdvance />
      )}
    </GameShell>
  );
}

function RadarReader({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const range = 2 + level;
  const choiceCount = 3 + Math.floor(level / 2);
  const [point, setPoint] = useState(() => randomPoint(range, false));
  const choices = useMemo(() => makePointChoices(point, range, choiceCount), [point, range, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, point);
    onResult(correct);
    setFeedback(feedbackWithProgress(correct, correct ? `Signal decoded: ${pointLabel(point)}.` : `That was ${pointLabel(choice)}. Read x horizontally and y vertically; the signal is ${pointLabel(point)}.`, stats, override));
  };
  const next = () => { setPoint(randomPoint(range, false)); setFeedback(null); };
  return (
    <GameShell icon={Radar} color="blue" skill="Reading coordinates" title="Radar Reader" headingId="read-game-heading" instructions="Read the glowing signal on the grid and choose its ordered pair." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">What coordinates is the radar signal marking? <small>{choiceCount} answer choices • range ±{range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={range} points={[{ point, label: '?' }]} ariaLabel="Coordinate grid with one radar signal to identify." />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
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

function TranslationTrek({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makeTranslation(level));
  const choices = useMemo(() => makePointChoices(challenge.answer, challenge.range, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, challenge.answer);
    onResult(correct);
    const totalMove = challenge.moves.reduce((total, move) => ({ x: total.x + move.x, y: total.y + move.y }), { x: 0, y: 0 });
    setFeedback(feedbackWithProgress(correct, correct ? `The rover arrived at ${pointLabel(challenge.answer)}.` : `Combine the moves to get a total translation of (${totalMove.x}, ${totalMove.y}), then add it to ${pointLabel(challenge.start)}. The destination is ${pointLabel(challenge.answer)}.`, stats, override));
  };
  const next = () => { setChallenge(makeTranslation(level)); setFeedback(null); };
  return (
    <GameShell icon={MoveRight} color="green" skill="Translation" title="Translation Trek" headingId="translate-game-heading" instructions="Guide the rover by applying every translation vector in order to its starting coordinates." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">Start at <strong>{pointLabel(challenge.start)}</strong>, then move {challenge.moves.map((move, index) => <strong key={`${move.x}-${move.y}-${index}`}>⟨{move.x}, {move.y}⟩{index < challenge.moves.length - 1 ? ', then ' : ''}</strong>)}. Where do you land? <small>{challenge.moves.length} step{challenge.moves.length === 1 ? '' : 's'} • range ±{challenge.range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={challenge.range} points={[{ point: challenge.start, label: 'START', tone: 'secondary' }]} ariaLabel={`Rover starts at ${pointLabel(challenge.start)} and has ${challenge.moves.length} translation steps.`} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

type RotationAngle = 90 | 180 | 270 | 360;
export type RotationQuestionType = 'vector' | 'coordinates';
export type RotationChallenge = { point: Point; clockwise: boolean; angle: RotationAngle; type: RotationQuestionType; answer: Point; range: 6 };
export const rotatePoint = (point: Point, angle: RotationAngle, clockwise: boolean): Point => {
  let rotated = { ...point };
  for (let turn = 0; turn < angle / 90; turn += 1) {
    rotated = clockwise ? { x: rotated.y, y: -rotated.x } : { x: -rotated.y, y: rotated.x };
  }
  return rotated;
};
export const makeRotation = (): RotationChallenge => {
  const range = 6 as const;
  const angles: RotationAngle[] = [90, 180, 270, 360];
  const angle = angles[randomInt(0, angles.length - 1)];
  const clockwise = Math.random() < 0.5;
  const type: RotationQuestionType = Math.random() < 0.5 ? 'vector' : 'coordinates';
  const point = randomPoint(range, false);
  const answer = rotatePoint(point, angle, type === 'vector' ? clockwise : !clockwise);
  return { point, clockwise, angle, type, answer, range };
};

/* Retired adaptive Rotation Reactor retained temporarily for history.
function RotationReactorLegacy({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const choiceCount = 3 + Math.floor(level / 2);
  const [challenge, setChallenge] = useState(() => makeRotation(level));
  const choices = useMemo(() => makePointChoices(challenge.answer, challenge.range, choiceCount), [challenge, choiceCount]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Point) => {
    if (feedback) return;
    const correct = samePoint(choice, challenge.answer);
    onResult(correct);
    const extraStep = challenge.translation ? ` Then apply the translation (${challenge.translation.x}, ${challenge.translation.y}).` : '';
    setFeedback(feedbackWithProgress(correct, correct ? `Perfect transformation! The new point is ${pointLabel(challenge.answer)}.` : `Rotate ${challenge.angle}° ${challenge.clockwise ? 'clockwise' : 'counterclockwise'}.${extraStep} The answer is ${pointLabel(challenge.answer)}.`, stats, override));
  };
  const next = () => { setChallenge(makeRotation(level)); setFeedback(null); };
  return (
    <GameShell icon={RotateCw} color="purple" skill="Rotation" title="Rotation Reactor" headingId="rotate-game-heading" instructions="Rotate the energy crystal around the origin, then complete any extra transformation shown." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">Rotate <strong>{pointLabel(challenge.point)}</strong> <strong>{challenge.angle}° {challenge.clockwise ? 'clockwise' : 'counterclockwise'}</strong>{challenge.translation && <>, then translate by <strong>⟨{challenge.translation.x}, {challenge.translation.y}⟩</strong></>}. <small>{choiceCount} choices • range ±{challenge.range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={challenge.range} points={[{ point: challenge.point, label: 'CRYSTAL' }]} ariaLabel={`Point ${pointLabel(challenge.point)} before a ${challenge.angle} degree ${challenge.clockwise ? 'clockwise' : 'counterclockwise'} rotation.`} />
        <div className="fun-choice-stack">
          {choices.map((choice) => <button key={pointLabel(choice)} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{pointLabel(choice)}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

*/

function RotationReactor({ stats, override, onResult }: ActivityProps) {
  const [challenge, setChallenge] = useState(makeRotation);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selected, setSelected] = useState<Point | null>(null);
  const [score, setScore] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const radians = ({ 90: 'π/2', 180: 'π', 270: '3π/2', 360: '2π' } as const)[challenge.angle];

  const answer = (choice: Point) => {
    if (feedback || status !== 'playing') return;
    setSelected(choice);
    const correct = samePoint(choice, challenge.answer);
    onResult(correct);
    const nextScore = score + (correct ? 1 : -1);
    const nextMisses = correct ? 0 : consecutiveIncorrect + 1;
    setScore(nextScore);
    setConsecutiveIncorrect(nextMisses);
    setFeedback({
      correct,
      message: correct
        ? `Correct. The resulting endpoint is ${pointLabel(challenge.answer)}.`
        : `The correct endpoint is ${pointLabel(challenge.answer)}. ${challenge.type === 'coordinates' ? 'Coordinates turn opposite to the rotating axes.' : 'The vector turns in the stated direction.'}`,
    });
    if (nextScore >= 5) setStatus('won');
    else if (nextMisses >= 2) setStatus('lost');
  };
  const next = () => { setChallenge(makeRotation()); setSelected(null); setFeedback(null); };
  const restart = () => {
    setChallenge(makeRotation());
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setConsecutiveIncorrect(0);
    setStatus('playing');
  };

  return (
    <GameShell icon={RotateCw} color="purple" skill="Rotation" title="Rotation Reactor" headingId="rotate-game-heading" instructions="Plot the new endpoint after the stated vector or coordinate-system rotation." stats={stats} difficulty={0} override={override} showDifficulty={false} scoreOverride={<><span><strong>{score}</strong> score</span><span><strong>{consecutiveIncorrect}</strong>/2 consecutive misses</span><span>Win at <strong>5</strong></span></>}>
      <div className="fun-prompt" data-testid="rotation-prompt">
        Rotate the <strong>{challenge.type === 'vector' ? 'vector' : 'coordinate system'}</strong> <strong>{radians} radians {challenge.clockwise ? 'clockwise' : 'counterclockwise'}</strong>.
        <small>Original vector endpoint: {pointLabel(challenge.point)} • fixed range −6 to 6</small>
      </div>
      <div className="fun-play-grid">
        <CoordinateGrid range={6} vectors={[{ endpoint: challenge.point, label: `v = ${pointLabel(challenge.point)}` }]} interactive={!feedback && status === 'playing'} selected={selected} onSelect={answer} ariaLabel={`Vector from the origin to ${pointLabel(challenge.point)}. Select the resulting endpoint on a grid from negative 6 to 6.`} />
        <div className="fun-rotation-help">
          <strong>{challenge.type === 'vector' ? 'Vector rotation' : 'Coordinate-system rotation'}</strong>
          <p>{challenge.type === 'vector' ? 'The axes stay fixed while the vector turns.' : 'The vector stays fixed in space while the axes turn; its coordinate values transform oppositely.'}</p>
          <p>Select the resulting endpoint directly on the grid.</p>
        </div>
      </div>
      {feedback && status === 'playing' && <FeedbackBanner feedback={feedback} onNext={next} />}
      {status === 'won' && <div className="rotation-game-result victory fun-celebrate" role="status"><Sparkles aria-hidden="true" /><strong>Reactor stabilized! You win!</strong><span>You reached 5 points.</span><button type="button" onClick={restart}>Play again</button></div>}
      {status === 'lost' && <div className="rotation-game-result game-over" role="alert"><strong>Game Over</strong><span>Two consecutive incorrect answers ended the run.</span><button type="button" onClick={restart}>Restart activity</button></div>}
    </GameShell>
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

function MirrorMatch({ stats, override, onResult }: ActivityProps) {
  const level = levelFromDifficulty(difficultyForStats(stats, override));
  const availableRelationships = relationships.slice(0, level + 2);
  const [challenge, setChallenge] = useState(() => makeRelationship(level));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answer = (choice: Relationship) => {
    if (feedback) return;
    const correct = choice === challenge.answer;
    onResult(correct);
    setFeedback(feedbackWithProgress(correct, correct ? `You spotted it: ${challenge.answer.toLowerCase()}.` : `Compare one coordinate at a time. These are ${challenge.answer.toLowerCase()}.`, stats, override));
  };
  const next = () => { setChallenge(makeRelationship(level)); setFeedback(null); };
  return (
    <GameShell icon={Sparkles} color="gold" skill="Coordinate relationships" title="Mirror Match" headingId="relate-game-heading" instructions="Compare points A and B. Choose the relationship that connects their coordinates." stats={stats} difficulty={difficultyForStats(stats, override)} override={override}>
      <div className="fun-prompt">{level >= 4 ? <>How are the plotted points <strong>A</strong> and <strong>B</strong> related?</> : <>How are <strong>A {pointLabel(challenge.first)}</strong> and <strong>B {pointLabel(challenge.second)}</strong> related?</>} <small>{availableRelationships.length} possible relationships • range ±{challenge.range}</small></div>
      <div className="fun-play-grid">
        <CoordinateGrid range={challenge.range} points={[{ point: challenge.first, label: 'A' }, { point: challenge.second, label: 'B', tone: 'secondary' }]} ariaLabel={`Point A is ${pointLabel(challenge.first)} and point B is ${pointLabel(challenge.second)}.`} />
        <div className="fun-choice-stack relationship-choices">
          {availableRelationships.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice}</button>)}
        </div>
      </div>
      {feedback && <FeedbackBanner feedback={feedback} onNext={next} />}
    </GameShell>
  );
}

export function FunZoneMode() {
  const [activeGame, setActiveGame] = useState<GameId>('plot');
  const [override, setOverride] = useState<DifficultyOverride>('auto');
  const { allStats, recordResult } = useFunZoneStats('coordinate-funzone-stats-v1', gameIds);
  const totalCorrect = Object.values(allStats).reduce((total, stats) => total + (stats as Stats).correct, 0);
  const totalAttempts = Object.values(allStats).reduce((total, stats) => total + (stats as Stats).attempts, 0);
  const activityProps = (id: GameId): ActivityProps => ({ stats: allStats[id], override, onResult: (correct: boolean) => recordResult(id, correct) });

  return (
    <div className="fun-zone-layout">
      <FunZoneHero
        eyebrow="Coordinate Arcade • 2 games"
        totalCorrect={totalCorrect}
        totalAttempts={totalAttempts}
        description={activeGame === 'plot'
          ? 'Plot ordered pairs on a fixed coordinate grid where both x and y run from −7 to 7. Your best streak is saved in this browser.'
          : 'Rotate vectors or coordinate systems on a fixed grid. Reach 5 points before missing twice in a row.'}
        override={override}
        onOverrideChange={setOverride}
        showDifficulty={false}
      />

      <GameSelectorNav games={games} activeGame={activeGame} onSelect={setActiveGame} allStats={allStats} />

      {activeGame === 'plot' && <TargetPlotter {...activityProps('plot')} />}
      {activeGame === 'rotate' && <RotationReactor {...activityProps('rotate')} />}
    </div>
  );
}
