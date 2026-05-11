import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { buildQuestionBank } from '../quiz/questionBank';
import { emptyScore, updateScore, type QuizScore } from '../quiz/scoring';
import type { QuizQuestion } from '../quiz/questionTypes';
import type { ProjectileParameters } from '../physics/projectile';

type Props = {
  params: ProjectileParameters;
  onReviewExplain: () => void;
};

type Feedback = {
  correct: boolean;
  message: string;
};

const storageKey = 'coordinate-kinematics-quiz-score';

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

const selectQuizQuestions = (pool: QuizQuestion[], count: number, previousSignature = ''): QuizQuestion[] => {
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  const selected = shuffled.slice(0, count);
  const signature = selected.map((question) => question.id).join('|');
  if (signature !== previousSignature || pool.length <= count) return selected;

  const replacement = pool.find((question) => !selected.some((selectedQuestion) => selectedQuestion.id === question.id));
  return replacement ? [replacement, ...selected.slice(1)] : selected.reverse();
};

function loadScore(): QuizScore {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as QuizScore) : emptyScore();
  } catch {
    return emptyScore();
  }
}

function ChoiceQuestion({
  question,
  disabled,
  onAnswer,
}: {
  question: Extract<QuizQuestion, { choices: string[] }>;
  disabled: boolean;
  onAnswer: (answer: string) => void;
}) {
  return (
    <div className="choice-grid">
      {question.choices.map((choice) => (
        <button key={choice} type="button" disabled={disabled} onClick={() => onAnswer(choice)}>
          {choice}
        </button>
      ))}
    </div>
  );
}

function ComponentQuestion({
  question,
  disabled,
  onAnswer,
}: {
  question: Extract<QuizQuestion, { type: 'components' }>;
  disabled: boolean;
  onAnswer: (answer: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const choose = (choice: string) => {
    if (disabled) return;
    setSelected((current) => (current.length >= question.blanks.length ? [choice] : [...current, choice]));
  };

  return (
    <div className="component-builder">
      <div className="blank-row" aria-live="polite">
        {question.blanks.map((blank, index) => (
          <span key={blank} className="blank-slot">
            {blank}: {selected[index] ?? '____'}
          </span>
        ))}
      </div>
      <div className="choice-grid">
        {question.choices.map((choice) => (
          <button key={choice} type="button" disabled={disabled} onClick={() => choose(choice)}>
            {choice}
          </button>
        ))}
      </div>
      <div className="button-row">
        <button type="button" disabled={disabled || selected.length !== question.blanks.length} onClick={() => onAnswer(selected)}>
          Check components
        </button>
        <button type="button" disabled={disabled || selected.length === 0} onClick={() => setSelected([])}>
          Clear
        </button>
      </div>
    </div>
  );
}

function ShortQuestion({
  question,
  disabled,
  onAnswer,
}: {
  question: Extract<QuizQuestion, { type: 'short' }>;
  disabled: boolean;
  onAnswer: (answer: string) => void;
}) {
  const [value, setValue] = useState('');
  return (
    <div className="short-answer">
      <textarea
        aria-label="Short explanation answer"
        disabled={disabled}
        rows={4}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button type="button" disabled={disabled || value.trim().length < 8} onClick={() => onAnswer(value)}>
        Check explanation
      </button>
    </div>
  );
}

export function QuizMode({ params, onReviewExplain }: Props) {
  const questionPool = useMemo(() => buildQuestionBank(params), [params]);
  const [quizVersion, setQuizVersion] = useState(0);
  const previousQuizSignature = useRef('');
  const questions = useMemo(() => {
    const selected = selectQuizQuestions(questionPool, 10, previousQuizSignature.current);
    previousQuizSignature.current = selected.map((selectedQuestion) => selectedQuestion.id).join('|');
    return selected;
  }, [questionPool, quizVersion]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState<QuizScore>(() => loadScore());
  const question = questions[index];

  useEffect(() => {
    setIndex(0);
    setFeedback(null);
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(score));
  }, [score]);

  const submit = (correct: boolean, message: string) => {
    setFeedback({ correct, message });
    setScore((current) => updateScore(current, question.skill, correct));
  };

  const answerQuestion = (answer: string | string[]) => {
    if (question.type === 'components') {
      const correct = question.answer.every((part, partIndex) => normalize(answer[partIndex] ?? '') === normalize(part));
      submit(correct, correct ? question.explanation : `${question.explanation} Correct answer: ${question.answer.join(', ')}.`);
      return;
    }
    if (question.type === 'short') {
      const text = normalize(String(answer));
      const matches = question.keyIdeas.filter((idea) => text.includes(normalize(idea))).length;
      const correct = matches >= 3;
      submit(correct, correct ? question.explanation : `${question.explanation} A model answer: ${question.sample}`);
      return;
    }
    const correct = normalize(String(answer)) === normalize(question.answer);
    submit(correct, correct ? question.explanation : `${question.explanation} Correct answer: ${question.answer}.`);
  };

  const next = () => {
    setFeedback(null);
    if (index === questions.length - 1) {
      setQuizVersion((current) => current + 1);
      return;
    }
    setIndex((current) => current + 1);
  };

  const resetScore = () => {
    const fresh = emptyScore();
    setScore(fresh);
    localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  return (
    <div className="quiz-layout">
      <section className="panel quiz-card" aria-labelledby="quiz-heading">
        <p className="eyebrow">
          Question {index + 1} of {questions.length} from a {questionPool.length}-question pool
        </p>
        <h2 id="quiz-heading">{question.prompt}</h2>
        {question.type === 'components' ? (
          <ComponentQuestion question={question} disabled={Boolean(feedback)} onAnswer={answerQuestion} />
        ) : question.type === 'short' ? (
          <ShortQuestion question={question} disabled={Boolean(feedback)} onAnswer={answerQuestion} />
        ) : (
          <ChoiceQuestion question={question} disabled={Boolean(feedback)} onAnswer={answerQuestion} />
        )}
        {feedback && (
          <div className={feedback.correct ? 'feedback correct' : 'feedback incorrect'} role="status">
            {feedback.correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
            <div>
              <strong>{feedback.correct ? 'Correct' : 'Not quite'}</strong>
              <p>{feedback.message}</p>
              <button type="button" onClick={onReviewExplain}>
                Review explanation
              </button>
              <button type="button" onClick={next}>
                {index === questions.length - 1 ? 'Start new quiz' : 'Next question'}
              </button>
            </div>
          </div>
        )}
      </section>

      <aside className="panel score-panel">
        <div className="panel-title">
          <CheckCircle2 aria-hidden="true" size={20} />
          <h2>Score</h2>
        </div>
        <p className="score-big">
          {score.correct}/{score.attempts || 0}
        </p>
        <div className="skill-list">
          {Object.entries(score.bySkill).map(([skill, value]) => (
            <div key={skill}>
              <span>{skill}</span>
              <strong>
                {value.correct}/{value.attempts}
              </strong>
            </div>
          ))}
        </div>
        <p className="history-note">
          Attempts are saved in this browser. Recent improvement: {score.history.slice(-5).reduce((sum, item) => sum + item.correct, 0)}
          /{score.history.slice(-5).reduce((sum, item) => sum + item.attempts, 0) || 0} over the last five attempts.
        </p>
        <button type="button" className="tool-button" onClick={resetScore}>
          <RotateCcw aria-hidden="true" size={18} />
          Reset score
        </button>
      </aside>
    </div>
  );
}
