import { useEffect, useState } from 'react';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Compass, X, XCircle } from 'lucide-react';

export type ConceptStep = { type: 'concept'; title: string; body: string };
export type TaskStep = {
  type: 'task';
  title: string;
  instructions: string[];
  hint: string;
  observation: string;
  explanation: string;
  complete: boolean;
};
export type CheckStep = {
  type: 'check';
  title: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};
export type WalkthroughStep = ConceptStep | TaskStep | CheckStep;

type Props = {
  storageKey: string;
  label: string;
  steps: WalkthroughStep[];
  onOpenChange?: (open: boolean) => void;
};

const loadCompleted = (storageKey: string): Set<number> => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? new Set(JSON.parse(saved) as number[]) : new Set();
  } catch {
    return new Set();
  }
};

export function TopicWalkthrough({ storageKey, label, steps, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(() => loadCompleted(storageKey));
  const [showHint, setShowHint] = useState(false);
  const [wrongChoices, setWrongChoices] = useState<Set<string>>(new Set());
  const [answeredCorrect, setAnsweredCorrect] = useState<Record<number, boolean>>({});

  const step = steps[activeIndex];

  const markComplete = (index: number) => {
    setCompleted((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // Progress remains available for this session when storage is unavailable.
      }
      return next;
    });
  };

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    if (step.type === 'concept') markComplete(activeIndex);
    if (step.type === 'task' && step.complete) markComplete(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex, step]);

  useEffect(() => {
    setShowHint(false);
    setWrongChoices(new Set());
    if (!open || step.type !== 'task' || step.complete) return;
    const timer = window.setTimeout(() => setShowHint(true), 15_000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  const isSatisfied = step.type === 'concept'
    ? true
    : step.type === 'task'
      ? step.complete
      : completed.has(activeIndex) || Boolean(answeredCorrect[activeIndex]);

  const openWalkthrough = () => {
    const firstIncomplete = steps.findIndex((_, index) => !completed.has(index));
    setActiveIndex(firstIncomplete === -1 ? steps.length - 1 : firstIncomplete);
    setOpen(true);
  };

  const answerCheck = (choice: string) => {
    if (step.type !== 'check') return;
    if (choice === step.answer) {
      setAnsweredCorrect((current) => ({ ...current, [activeIndex]: true }));
      markComplete(activeIndex);
    } else {
      setWrongChoices((current) => new Set(current).add(choice));
    }
  };

  const goNext = () => {
    if (activeIndex === steps.length - 1) {
      setOpen(false);
      return;
    }
    setActiveIndex((index) => index + 1);
  };
  const goPrevious = () => setActiveIndex((index) => Math.max(0, index - 1));

  const doneCount = completed.size;
  const allDone = doneCount === steps.length;

  return (
    <section className="walkthroughs panel" aria-labelledby={`${storageKey}-walkthrough-title`}>
      <div className="panel-title">
        <Compass aria-hidden="true" size={19} />
        <h2 id={`${storageKey}-walkthrough-title`}>Walkthrough</h2>
      </div>
      <div className="walkthrough-launchers walkthrough-launchers-single">
        <div className={`walkthrough-launcher ${allDone ? 'complete' : ''}`}>
          <button type="button" onClick={openWalkthrough}>
            {allDone ? <Check aria-hidden="true" size={18} /> : null}
            {allDone ? 'Review walkthrough' : doneCount > 0 ? 'Continue walkthrough' : 'Start walkthrough'}
            {allDone ? <span className="complete-badge">Complete</span> : null}
          </button>
          <progress value={doneCount} max={steps.length} aria-label={`${label} walkthrough progress`} />
          <span>{doneCount} of {steps.length} steps complete ({Math.round((doneCount / steps.length) * 100)}%)</span>
        </div>
      </div>

      {open ? (
        <section className="walkthrough-popup" role="dialog" aria-modal="false" aria-labelledby="topic-walkthrough-task-title">
          <header className="walkthrough-popup-header">
            <div>
              <p className="eyebrow">{label} · Step {activeIndex + 1} of {steps.length}</p>
              <h3 id="topic-walkthrough-task-title">{step.title}</h3>
            </div>
            <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close walkthrough">
              <X aria-hidden="true" size={20} />
            </button>
          </header>
          <div className="walkthrough-popup-grid">
            {step.type === 'concept' && <p>{step.body}</p>}

            {step.type === 'task' && (
              <>
                <h4>Do this</h4>
                <ol>{step.instructions.map((line) => <li key={line}>{line}</li>)}</ol>
                <div className={`task-status ${step.complete ? 'success' : ''}`} role="status" aria-live="polite">
                  {step.complete ? <><Check aria-hidden="true" size={18} /> Task complete — nice work.</> : 'Waiting for you to complete the task in the workspace…'}
                </div>
                {showHint && !step.complete ? <p className="walkthrough-hint"><strong>Hint:</strong> {step.hint}</p> : null}
                <div className="walkthrough-learning">
                  <h4>Observation</h4>
                  <p>{step.observation}</p>
                  <h4>Explanation</h4>
                  <p>{step.explanation}</p>
                </div>
              </>
            )}

            {step.type === 'check' && (
              <>
                <p>{step.prompt}</p>
                <div className="choice-grid">
                  {step.choices.map((choice) => {
                    const isWrong = wrongChoices.has(choice);
                    const isRevealedCorrect = Boolean(answeredCorrect[activeIndex]) && choice === step.answer;
                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={isWrong || Boolean(answeredCorrect[activeIndex])}
                        className={isWrong ? 'choice-wrong' : isRevealedCorrect ? 'choice-correct' : ''}
                        onClick={() => answerCheck(choice)}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {wrongChoices.size > 0 && !answeredCorrect[activeIndex] && (
                  <div className="feedback incorrect" role="status">
                    <XCircle aria-hidden="true" />
                    <div><strong>Not quite</strong><p>Try another choice.</p></div>
                  </div>
                )}
                {answeredCorrect[activeIndex] && (
                  <div className="feedback correct" role="status">
                    <CheckCircle2 aria-hidden="true" />
                    <div><strong>Correct</strong><p>{step.explanation}</p></div>
                  </div>
                )}
              </>
            )}
          </div>
          <footer className="walkthrough-navigation">
            <button type="button" onClick={goPrevious} disabled={activeIndex === 0}>
              <ChevronLeft aria-hidden="true" size={18} /> Previous
            </button>
            <span>{doneCount} of {steps.length} steps complete</span>
            <button type="button" onClick={goNext} disabled={!isSatisfied}>
              {activeIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight aria-hidden="true" size={18} />
            </button>
          </footer>
        </section>
      ) : null}
    </section>
  );
}
