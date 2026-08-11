import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DoorOpen, Sparkles } from 'lucide-react';
import explosionSoundUrl from '../../../explosion.mp3?url';
import nonFatalMissSoundUrl from '../../../ohoh.mp3?url';
import {
  GameShell,
  randomInt,
  type DifficultyOverride,
  type Stats,
} from './FunZoneShared';

export type ShiftPoint = { x: number; y: number };
export type CoordinateTransformation = {
  shiftX: number;
  shiftY: number;
  flipX: boolean;
  flipY: boolean;
};

type Props = {
  stats: Stats;
  override: DifficultyOverride;
  onResult: (correct: boolean) => void;
};

type Question = {
  point: ShiftPoint;
  transformation: CoordinateTransformation;
  prompt: string;
  answer: ShiftPoint;
  choices: ShiftPoint[];
};

type Phase = 'ready' | 'walking' | 'opening' | 'success' | 'bad-event' | 'won' | 'lost';

const RANGE = 6;
const transformationKinds = ['shift-x', 'shift-y', 'shift-both', 'flip-x', 'flip-y', 'flip-both', 'combined'] as const;

const badEvents = [
  ['trapdoor', 'Trapdoor', '🕳️'],
  ['monster', 'Monster Attack', '👾'],
  ['rocks', 'Falling Rocks', '🪨'],
  ['lightning', 'Lightning Strike', '⚡'],
  ['fire', 'Fire Blast', '🔥'],
  ['gas', 'Poison Gas', '☁️'],
  ['boulder', 'Giant Boulder', '🔴'],
  ['shark', 'Shark Pit', '🦈'],
  ['cannon', 'Cannon Blast', '💥'],
  ['spider', 'Giant Spider', '🕷️'],
  ['avalanche', 'Avalanche', '❄️'],
  ['lava', 'Lava Flow', '🌋'],
  ['electric', 'Electrified Floor', '⚡'],
  ['robot', 'Robot Attack', '🤖'],
  ['abyss', 'The Abyss', '🌀'],
] as const;

export function transformCoordinates(point: ShiftPoint, transformation: CoordinateTransformation): ShiftPoint {
  const shiftedX = point.x - transformation.shiftX;
  const shiftedY = point.y - transformation.shiftY;
  return {
    x: transformation.flipX ? -shiftedX : shiftedX,
    y: transformation.flipY ? -shiftedY : shiftedY,
  };
}

const pointText = (point: ShiftPoint) => `(${point.x}, ${point.y})`;
const samePoint = (first: ShiftPoint, second: ShiftPoint) => first.x === second.x && first.y === second.y;
const randomNonZero = () => {
  const value = randomInt(1, 3);
  return Math.random() < 0.5 ? -value : value;
};

function describeShift(axis: 'x' | 'y', amount: number) {
  const direction = amount > 0 ? (axis === 'x' ? 'right' : 'up') : (axis === 'x' ? 'left' : 'down');
  return `move the origin ${Math.abs(amount)} unit${Math.abs(amount) === 1 ? '' : 's'} ${direction}`;
}

function transformationForKind(kind: typeof transformationKinds[number]): CoordinateTransformation {
  const shiftX = ['shift-x', 'shift-both', 'combined'].includes(kind) ? randomNonZero() : 0;
  const shiftY = ['shift-y', 'shift-both', 'combined'].includes(kind) ? randomNonZero() : 0;
  const combinedFlipX = kind === 'combined' && Math.random() < 0.5;
  return {
    shiftX,
    shiftY,
    flipX: kind === 'flip-x' || kind === 'flip-both' || combinedFlipX,
    flipY: kind === 'flip-y' || kind === 'flip-both' || (kind === 'combined' && !combinedFlipX),
  };
}

function describeTransformation(transformation: CoordinateTransformation) {
  const actions: string[] = [];
  if (transformation.shiftX) actions.push(describeShift('x', transformation.shiftX));
  if (transformation.shiftY) actions.push(describeShift('y', transformation.shiftY));
  if (transformation.flipX) actions.push('reverse the x-axis');
  if (transformation.flipY) actions.push('reverse the y-axis');
  return `${actions.slice(0, -1).join(', ')}${actions.length > 1 ? ' and ' : ''}${actions.at(-1)}.`;
}

function plausibleChoices(answer: ShiftPoint, point: ShiftPoint, transformation: CoordinateTransformation) {
  const candidates: ShiftPoint[] = [
    answer,
    point,
    { x: point.x + transformation.shiftX, y: point.y + transformation.shiftY },
    { x: -answer.x, y: answer.y },
    { x: answer.x, y: -answer.y },
    { x: answer.y, y: answer.x },
    { x: answer.x + (answer.x < RANGE ? 1 : -1), y: answer.y },
    { x: answer.x, y: answer.y + (answer.y < RANGE ? 1 : -1) },
  ];
  const unique = candidates.filter((candidate, index) =>
    Math.abs(candidate.x) <= RANGE && Math.abs(candidate.y) <= RANGE
      && candidates.findIndex((other) => samePoint(other, candidate)) === index);
  while (unique.length < 3) {
    const candidate = { x: randomInt(-RANGE, RANGE), y: randomInt(-RANGE, RANGE) };
    if (!unique.some((other) => samePoint(other, candidate))) unique.push(candidate);
  }
  return [answer, ...unique.filter((choice) => !samePoint(choice, answer)).slice(0, 2)]
    .sort(() => Math.random() - 0.5);
}

export function createShiftingQuestion(kind = transformationKinds[randomInt(0, transformationKinds.length - 1)]): Question {
  const transformation = transformationForKind(kind);
  let point: ShiftPoint;
  let answer: ShiftPoint;
  do {
    point = { x: randomInt(-RANGE, RANGE), y: randomInt(-RANGE, RANGE) };
    answer = transformCoordinates(point, transformation);
  } while (Math.abs(answer.x) > RANGE || Math.abs(answer.y) > RANGE);
  return {
    point,
    transformation,
    answer,
    prompt: `Create the new coordinate system: ${describeTransformation(transformation)}`,
    choices: plausibleChoices(answer, point, transformation),
  };
}

function FixedGrid({ point }: { point: ShiftPoint }) {
  const size = 360;
  const origin = 180;
  const step = 25;
  const values = Array.from({ length: 13 }, (_, index) => index - RANGE);
  return (
    <svg className="coordinate-game-grid shifting-grid" viewBox="0 0 360 360" role="img" aria-label={`Original coordinate grid from negative 6 to 6 with point P at ${pointText(point)}`}>
      <defs><marker id="shift-axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <rect width="360" height="360" rx="18" className="fun-grid-bg" />
      {values.map((value) => <g key={value}>
        <line x1={origin + value * step} y1="30" x2={origin + value * step} y2="330" className="fun-grid-line" />
        <line x1="30" y1={origin - value * step} x2="330" y2={origin - value * step} className="fun-grid-line" />
        {value !== 0 && <><text x={origin + value * step} y={origin + 16} textAnchor="middle" className="fun-grid-number">{value}</text><text x={origin - 9} y={origin - value * step + 4} textAnchor="end" className="fun-grid-number">{value}</text></>}
      </g>)}
      <line x1="22" y1={origin} x2="338" y2={origin} className="fun-grid-axis" markerEnd="url(#shift-axis-arrow)" />
      <line x1={origin} y1="338" x2={origin} y2="22" className="fun-grid-axis" markerEnd="url(#shift-axis-arrow)" />
      <text x="338" y="168" className="fun-grid-axis-label">x</text><text x="190" y="25" className="fun-grid-axis-label">y</text>
      <circle cx={origin + point.x * step} cy={origin - point.y * step} r="9" className="fun-point" />
      <text x={origin + point.x * step + 12} y={origin - point.y * step - 11} className="fun-point-label">P {pointText(point)}</text>
    </svg>
  );
}

function Character() {
  return <div className="door-character" aria-hidden="true"><span className="door-head" /><span className="door-body" /><span className="door-arm left" /><span className="door-arm right" /><span className="door-leg left" /><span className="door-leg right" /></div>;
}

export function ShiftingCoordinatesGame({ stats, override, onResult }: Props) {
  const [question, setQuestion] = useState(() => createShiftingQuestion());
  const [phase, setPhase] = useState<Phase>('ready');
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const timers = useRef<number[]>([]);
  const badAudio = useRef<HTMLAudioElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const event = badEvents[eventIndex];

  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  useEffect(() => () => { clearTimers(); badAudio.current?.pause(); context.current?.close(); }, []);

  const later = (callback: () => void, delay: number) => timers.current.push(window.setTimeout(callback, delay));
  const nextQuestion = () => {
    setQuestion(createShiftingQuestion());
    setSelectedDoor(null);
    setPhase('ready');
  };
  const playBadSound = (fatal: boolean) => {
    badAudio.current?.pause();
    const audio = new Audio(fatal ? explosionSoundUrl : nonFatalMissSoundUrl);
    badAudio.current = audio;
    void audio.play().catch(() => undefined);
  };
  const playVictoryMusic = () => {
    const AudioContextClass = window.AudioContext;
    const audioContext = context.current ?? new AudioContextClass();
    context.current = audioContext;
    [523, 659, 784, 1047].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
      oscillator.frequency.value = frequency; oscillator.type = 'triangle';
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + index * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + index * 0.16 + 0.28);
      oscillator.connect(gain).connect(audioContext.destination); oscillator.start(audioContext.currentTime + index * 0.16); oscillator.stop(audioContext.currentTime + index * 0.16 + 0.3);
    });
  };
  const chooseDoor = (index: number) => {
    if (phase !== 'ready') return;
    const correct = samePoint(question.choices[index], question.answer);
    const nextCorrect = correctCount + (correct ? 1 : 0);
    const nextMistakes = mistakes + (correct ? 0 : 1);
    setSelectedDoor(index); setPhase('walking'); onResult(correct);
    later(() => setPhase('opening'), 650);
    if (correct) {
      setCorrectCount(nextCorrect);
      later(() => setPhase('success'), 1100);
      if (nextCorrect >= 5) later(() => { setPhase('won'); playVictoryMusic(); }, 1900);
      else later(nextQuestion, 3000);
    } else {
      const nextEvent = randomInt(0, badEvents.length - 1);
      setMistakes(nextMistakes); setEventIndex(nextEvent);
      later(() => { setPhase('bad-event'); playBadSound(nextMistakes >= 3); }, 1100);
      if (nextMistakes >= 3) later(() => setPhase('lost'), 3300);
      else later(nextQuestion, 3300);
    }
  };
  const restart = () => { clearTimers(); setCorrectCount(0); setMistakes(0); setSelectedDoor(null); setPhase('ready'); setQuestion(createShiftingQuestion()); };
  const characterPosition = selectedDoor === null ? 50 : 17 + selectedDoor * 33;
  const sceneClass = `door-scene phase-${phase}${phase === 'bad-event' ? ` event-${event[0]}` : ''}`;
  const feedback = phase === 'success' || phase === 'won' ? 'Correct!' : phase === 'bad-event' || phase === 'lost' ? 'Incorrect!' : '';

  return <GameShell icon={DoorOpen} color="blue" skill="Coordinate transformations" title="Shifting Coordinates" headingId="shift-game-heading" instructions="Track point P while the origin and axis directions change. Choose its coordinates in the new system by entering the correct door." stats={stats} difficulty={0} override={override} showDifficulty={false} scoreOverride={<><span><strong>{correctCount}</strong>/5 correct</span><span><strong>{3 - mistakes}</strong> lives remaining</span></>}>
    <p className="fun-prompt" data-testid="shifting-prompt"><strong>Point P starts at {pointText(question.point)}.</strong> {question.prompt}<small>Where is the same point in the new coordinate system?</small></p>
    <div className="shifting-game-layout">
      <FixedGrid point={question.point} />
      <div className={sceneClass} aria-label={`Three answer doors. Character at the ${phase} stage.`}>
        <div className="door-scene-title">Choose a door</div>
        <div className="answer-doors">
          {question.choices.map((choice, index) => <button key={`${choice.x}-${choice.y}`} type="button" className={selectedDoor === index ? 'selected' : ''} disabled={phase !== 'ready'} onClick={() => chooseDoor(index)} aria-label={`Door ${index + 1}, answer ${pointText(choice)}`}>
            <strong>{pointText(choice)}</strong><span className="door-panel"><span className="door-number">{index + 1}</span><span className="door-knob" /></span>
          </button>)}
        </div>
        <div className="door-floor" />
        <div className="door-character-wrap" style={{ '--door-position': `${characterPosition}%` } as CSSProperties}><Character /></div>
        {phase === 'bad-event' && <div className="bad-event-effect" role="img" aria-label={`${event[1]} cartoon animation`}><span>{event[2]}</span><strong>{event[1]}</strong></div>}
        {feedback && <div className={`door-feedback ${feedback === 'Correct!' ? 'correct' : 'incorrect'}`} role="status"><strong>{feedback}</strong>{feedback === 'Incorrect!' && <span>Correct coordinate: {pointText(question.answer)}</span>}</div>}
        {(phase === 'won' || phase === 'lost') && <div className={`door-end-screen ${phase}`} role="alert">{phase === 'won' ? <><Sparkles aria-hidden="true" /><strong>You Win!</strong><span>Five coordinate systems conquered!</span></> : <><strong>Game Over</strong><span>Three incorrect doors ended this run.</span></>}<button type="button" onClick={restart}>Start new game</button></div>}
      </div>
    </div>
  </GameShell>;
}
