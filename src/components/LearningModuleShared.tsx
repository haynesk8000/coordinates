import { useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, Compass, FlaskConical, Gamepad2, GraduationCap, RotateCcw, XCircle } from 'lucide-react';
import { ModeSwitcher, type Mode } from './ModeSwitcher';

export type CoreMode = Exclude<Mode, 'fun'>;

const modeIcons = { explore: Compass, explain: GraduationCap, quiz: FlaskConical, fun: Gamepad2 } as const;

export function LearningModuleShell({
  eyebrow,
  title,
  intro,
  mode,
  onModeChange,
  modeCopy,
  includeFunZone = false,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  modeCopy: Partial<Record<Mode, string>>;
  includeFunZone?: boolean;
  children: ReactNode;
}) {
  const Icon = modeIcons[mode];
  return (
    <>
      <header className="topbar module-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="module-title">{title}</h2>
        </div>
        <ModeSwitcher mode={mode} onChange={onModeChange} includeFunZone={includeFunZone} />
      </header>
      <section className="intro-band topic-intro" aria-live="polite">
        <Icon aria-hidden="true" size={22} />
        <p>{intro}</p>
      </section>
      <div className="module-content">
        <p className="mode-copy">{modeCopy[mode]}</p>
        {children}
      </div>
    </>
  );
}

export type ExplainStep = { title: string; body: ReactNode };
export type ConceptCard = { title: string; body: ReactNode };

export function ExplainView({
  heading,
  summary,
  steps,
  concepts,
  misconceptions,
}: {
  heading: string;
  summary: string;
  steps: ExplainStep[];
  concepts: ConceptCard[];
  misconceptions: string[];
}) {
  return (
    <div className="explain-stack topic-explain">
      <section className="panel reason-panel">
        <p className="eyebrow">Guided derivation</p>
        <h2>{heading}</h2>
        <p>{summary}</p>
        <ol className="derivation-list">
          {steps.map((step) => <li key={step.title}><strong>{step.title}</strong> {step.body}</li>)}
        </ol>
      </section>
      <section className="concept-card-grid" aria-label="Key concepts">
        {concepts.map((concept) => (
          <article className="panel concept-card" key={concept.title}>
            <h2>{concept.title}</h2>
            <div>{concept.body}</div>
          </article>
        ))}
      </section>
      <section className="panel mistakes-panel">
        <h2>Common Misconceptions</h2>
        <ul>{misconceptions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </div>
  );
}

export type ConceptQuestion = {
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
  skill: string;
};

type SavedQuizScore = { correct: number; attempts: number; bySkill: Record<string, { correct: number; attempts: number }> };

const emptyQuizScore = (): SavedQuizScore => ({ correct: 0, attempts: 0, bySkill: {} });

export function ConceptQuiz({
  moduleId,
  questions,
  onReviewExplain,
}: {
  moduleId: string;
  questions: ConceptQuestion[];
  onReviewExplain: () => void;
}) {
  const storageKey = `physics-motion-lab-${moduleId}-score`;
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [score, setScore] = useState<SavedQuizScore>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) as SavedQuizScore : emptyQuizScore();
    } catch {
      return emptyQuizScore();
    }
  });
  const question = questions[index];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(score));
  }, [score, storageKey]);

  const answer = (choice: string) => {
    if (feedback) return;
    const correct = choice === question.answer;
    setFeedback({ correct, explanation: correct ? question.explanation : `${question.explanation} Correct answer: ${question.answer}.` });
    setScore((current) => {
      const skill = current.bySkill[question.skill] ?? { correct: 0, attempts: 0 };
      return {
        correct: current.correct + (correct ? 1 : 0),
        attempts: current.attempts + 1,
        bySkill: {
          ...current.bySkill,
          [question.skill]: { correct: skill.correct + (correct ? 1 : 0), attempts: skill.attempts + 1 },
        },
      };
    });
  };

  const next = () => {
    setFeedback(null);
    setIndex((current) => (current + 1) % questions.length);
  };

  const reset = () => {
    const fresh = emptyQuizScore();
    setScore(fresh);
    localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  return (
    <div className="quiz-layout topic-quiz">
      <section className="panel quiz-card" aria-labelledby={`${moduleId}-quiz-heading`}>
        <p className="eyebrow">Question {index + 1} of {questions.length} • {question.skill}</p>
        <h2 id={`${moduleId}-quiz-heading`}>{question.prompt}</h2>
        <div className="choice-grid">
          {question.choices.map((choice) => <button key={choice} type="button" disabled={Boolean(feedback)} onClick={() => answer(choice)}>{choice}</button>)}
        </div>
        {feedback && (
          <div className={feedback.correct ? 'feedback correct' : 'feedback incorrect'} role="status">
            {feedback.correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
            <div>
              <strong>{feedback.correct ? 'Correct' : 'Not quite'}</strong>
              <p>{feedback.explanation}</p>
              <button type="button" onClick={onReviewExplain}>Review explanation</button>
              <button type="button" onClick={next}>Next question</button>
            </div>
          </div>
        )}
      </section>
      <aside className="panel score-panel">
        <div className="panel-title"><CheckCircle2 aria-hidden="true" size={20} /><h2>Progress</h2></div>
        <p className="score-big">{score.correct}/{score.attempts}</p>
        <div className="skill-list">
          {Object.entries(score.bySkill).map(([skill, value]) => <div key={skill}><span>{skill}</span><strong>{value.correct}/{value.attempts}</strong></div>)}
        </div>
        <p className="history-note">Progress is saved in this browser.</p>
        <button type="button" className="tool-button" onClick={reset}><RotateCcw aria-hidden="true" size={18} /> Reset score</button>
      </aside>
    </div>
  );
}

export function RangeControl({ label, value, min, max, step, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-control">
      <span>{label}<strong>{value} {unit}</strong></span>
      <input aria-label={label} type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function MetricGrid({ metrics }: { metrics: Array<{ label: string; value: string }> }) {
  return <dl className="topic-metrics">{metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl>;
}
