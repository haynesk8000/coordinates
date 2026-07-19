import { useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, Gamepad2, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Stats = { correct: number; attempts: number; streak: number };
export type Feedback = { correct: boolean; message: string; difficultyIncrease?: number };
export type DifficultyOverride = 'auto' | 'easy' | 'medium' | 'hard';
export type ActivityProps = { stats: Stats; override: DifficultyOverride; onResult: (correct: boolean) => void };

export const emptyStats = (): Stats => ({ correct: 0, attempts: 0, streak: 0 });

export const difficultyFromCorrect = (correct: number) => Math.min(100, Math.floor(correct / 3) * 20);

const manualDifficulty: Record<Exclude<DifficultyOverride, 'auto'>, number> = {
  easy: 0,
  medium: 40,
  hard: 80,
};

export const difficultyForStats = (stats: Stats, override: DifficultyOverride) =>
  override === 'auto' ? difficultyFromCorrect(stats.correct) : manualDifficulty[override];

export const levelFromDifficulty = (difficulty: number) => difficulty / 20;

export function feedbackWithProgress(
  correct: boolean,
  message: string,
  stats: Stats,
  override: DifficultyOverride = 'auto',
): Feedback {
  if (override !== 'auto') return { correct, message };
  const currentDifficulty = difficultyFromCorrect(stats.correct);
  const nextDifficulty = difficultyFromCorrect(stats.correct + (correct ? 1 : 0));
  return {
    correct,
    message,
    difficultyIncrease: nextDifficulty > currentDifficulty ? nextDifficulty : undefined,
  };
}

export function useFunZoneStats<GameId extends string>(storageKey: string, gameIds: readonly GameId[]) {
  const fallback = () => Object.fromEntries(gameIds.map((id) => [id, emptyStats()])) as Record<GameId, Stats>;
  const [allStats, setAllStats] = useState<Record<GameId, Stats>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return fallback();
      const parsed = JSON.parse(saved) as Partial<Record<GameId, Stats>>;
      return { ...fallback(), ...parsed };
    } catch {
      return fallback();
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(allStats));
  }, [allStats, storageKey]);

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

  return { allStats, recordResult };
}

export function DifficultySelector({
  value,
  onChange,
}: {
  value: DifficultyOverride;
  onChange: (value: DifficultyOverride) => void;
}) {
  const options: DifficultyOverride[] = ['auto', 'easy', 'medium', 'hard'];
  return (
    <div className="fun-difficulty-select" role="group" aria-label="Difficulty mode">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? 'active' : ''}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option === 'auto' ? 'Auto' : `${option[0].toUpperCase()}${option.slice(1)}`}
        </button>
      ))}
    </div>
  );
}

export function ScoreStrip({
  stats,
  difficulty,
  override,
}: {
  stats: Stats;
  difficulty: number;
  override: DifficultyOverride;
}) {
  const accuracy = stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);
  const correctTowardNext = difficulty === 100 ? 3 : stats.correct % 3;
  return (
    <div className="fun-score-strip" aria-label="Game score">
      <span><strong>{stats.correct}</strong> points</span>
      <span><strong>{accuracy}%</strong> accuracy</span>
      <span><strong>{stats.streak}</strong> streak</span>
      <div className="fun-difficulty" aria-label={`Difficulty ${difficulty}%`}>
        <div>
          <strong>Difficulty {difficulty}%</strong>
          <small>
            {override !== 'auto'
              ? `Manual: ${override[0].toUpperCase()}${override.slice(1)}`
              : difficulty === 100
                ? 'Maximum level'
                : `${correctTowardNext}/3 correct to level up`}
          </small>
        </div>
        <progress max="100" value={difficulty} aria-label="Difficulty progress" />
      </div>
    </div>
  );
}

export function FeedbackBanner({ feedback, onNext }: { feedback: Feedback; onNext: () => void }) {
  return (
    <div className={`fun-feedback ${feedback.correct ? 'correct' : 'incorrect'}`} role="status">
      {feedback.correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
      <div>
        <strong>{feedback.correct ? 'Nice work!' : 'Good try!'}</strong>
        <p>{feedback.message}</p>
        {feedback.difficultyIncrease !== undefined && (
          <p className="fun-level-up fun-celebrate">
            <Sparkles aria-hidden="true" size={16} /> Difficulty increased to {feedback.difficultyIncrease}%!
          </p>
        )}
      </div>
      <button type="button" onClick={onNext}>
        <RefreshCw aria-hidden="true" size={17} /> Next challenge
      </button>
    </div>
  );
}

export function GameShell({
  icon: Icon,
  color,
  skill,
  title,
  headingId,
  instructions,
  stats,
  difficulty,
  override,
  children,
}: {
  icon: LucideIcon;
  color: string;
  skill: string;
  title: string;
  headingId: string;
  instructions: string;
  stats: Stats;
  difficulty: number;
  override: DifficultyOverride;
  children: ReactNode;
}) {
  return (
    <section className={`panel fun-activity fun-${color}`} aria-labelledby={headingId}>
      <div className="fun-activity-heading">
        <div className="fun-game-icon"><Icon aria-hidden="true" /></div>
        <div>
          <p className="eyebrow">{skill}</p>
          <h2 id={headingId}>{title}</h2>
        </div>
      </div>
      <p className="fun-instructions"><strong>How to play:</strong> {instructions}</p>
      <ScoreStrip stats={stats} difficulty={difficulty} override={override} />
      {children}
    </section>
  );
}

export type GameMeta<GameId extends string> = {
  id: GameId;
  title: string;
  tagline: string;
  skill: string;
  icon: LucideIcon;
  color: string;
};

export function FunZoneHero({
  eyebrow,
  totalCorrect,
  totalAttempts,
  description,
  override,
  onOverrideChange,
}: {
  eyebrow: string;
  totalCorrect: number;
  totalAttempts: number;
  description: string;
  override: DifficultyOverride;
  onOverrideChange: (value: DifficultyOverride) => void;
}) {
  return (
    <section className="fun-zone-hero" aria-labelledby="fun-zone-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="fun-zone-heading"><Gamepad2 aria-hidden="true" /> Choose your next challenge</h2>
        <p>{description}</p>
        <div className="fun-difficulty-row">
          <span>Difficulty</span>
          <DifficultySelector value={override} onChange={onOverrideChange} />
        </div>
      </div>
      <div className="fun-total-score" aria-label={`${totalCorrect} total points from ${totalAttempts} attempts`}>
        <strong>{totalCorrect}</strong><span>Total points</span><small>{totalAttempts} attempts</small>
      </div>
    </section>
  );
}

export function GameSelectorNav<GameId extends string>({
  games,
  activeGame,
  onSelect,
  allStats,
}: {
  games: Array<GameMeta<GameId>>;
  activeGame: GameId;
  onSelect: (id: GameId) => void;
  allStats: Record<GameId, Stats>;
}) {
  return (
    <nav className="fun-game-selector" aria-label="Fun Zone activities">
      {games.map((game) => {
        const Icon = game.icon;
        return (
          <button
            key={game.id}
            type="button"
            className={`${game.color}${activeGame === game.id ? ' active' : ''}`}
            aria-pressed={activeGame === game.id}
            onClick={() => onSelect(game.id)}
          >
            <span className="fun-selector-icon"><Icon aria-hidden="true" /></span>
            <span><strong>{game.title}</strong><small>{game.tagline}</small></span>
            <span className="fun-mini-score">{allStats[game.id].correct} pts • {difficultyFromCorrect(allStats[game.id].correct)}%</span>
          </button>
        );
      })}
    </nav>
  );
}

export const randomInt = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
