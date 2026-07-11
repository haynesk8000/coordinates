import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Compass, X } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { landingTime, type ProjectileParameters } from '../physics/projectile';
import { rotationTasks, tasksFor, translationTasks, type WalkthroughKind } from './walkthroughTasks';

const STORAGE_KEY = 'coordinate-explorer-walkthrough-progress-v1';
const EPSILON = 0.08;

type SavedProgress = Record<WalkthroughKind, number[]>;

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
  time: number;
  rotationUnits: number;
  axisHandleMoves: number;
  onOpenChange?: (isOpen: boolean) => void;
};

const emptyProgress = (): SavedProgress => ({ translation: [], rotation: [] });

const loadProgress = (): SavedProgress => {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<SavedProgress>;
    return {
      translation: Array.isArray(saved.translation) ? [...new Set(saved.translation.filter((id) => id >= 1 && id <= 10))] : [],
      rotation: Array.isArray(saved.rotation) ? [...new Set(saved.rotation.filter((id) => id >= 11 && id <= 20))] : [],
    };
  } catch {
    return emptyProgress();
  }
};

const near = (a: number, b: number, tolerance = EPSILON) => Math.abs(a - b) <= tolerance;
const defaultAxes = (system: CoordinateSystem) =>
  near(system.axis1.x, 1) && near(system.axis1.y, 0) && near(system.axis2.x, 0) && near(system.axis2.y, 1);
const atLaunch = (system: CoordinateSystem, params: ProjectileParameters) =>
  near(system.originWorld.x, 0) && near(system.originWorld.y, params.H);

export const isWalkthroughTaskComplete = (
  taskId: number,
  { params, system, time, rotationUnits, axisHandleMoves }: Props,
): boolean => {
  const { x, y } = system.originWorld;
  const axesAreDefault = defaultAxes(system);
  switch (taskId) {
    case 1: return axesAreDefault && x > 1 && Math.abs(y - params.H) <= 3;
    case 2: return axesAreDefault && x < -1 && Math.abs(y - params.H) <= 3;
    case 3: return axesAreDefault && near(x, 0) && near(y, 0);
    case 4: return axesAreDefault && y > params.H + 1;
    case 5: return axesAreDefault && near(x, params.d1) && near(y, params.h);
    case 6:
      return axesAreDefault && near(x, params.d1 + params.d2) && near(y, 0) && system.label1 === 'a' && system.label2 === 'b';
    case 7: return axesAreDefault && near(x, params.d1);
    case 8: return axesAreDefault && near(y, params.h);
    case 9: return axesAreDefault && x > 1 && y < params.H - 1;
    case 10:
      return axesAreDefault && (!near(x, 0) || !near(y, params.H)) && time >= landingTime(params) * 0.5;
    case 11: return atLaunch(system, params) && rotationUnits > 0 && rotationUnits < 6;
    case 12: return atLaunch(system, params) && rotationUnits < 0 && rotationUnits > -6;
    case 13: return atLaunch(system, params) && rotationUnits === 2;
    case 14: return rotationUnits === 6;
    case 15: return rotationUnits === -6;
    case 16: return rotationUnits === 12;
    case 17: return rotationUnits === 24;
    case 18: return near(x, 0) && near(y, 0) && rotationUnits === 3;
    case 19:
      return atLaunch(system, params) && rotationUnits !== 0 && rotationUnits % 6 !== 0 && time >= landingTime(params) / 3;
    case 20: return axisHandleMoves > 0 && rotationUnits !== 0;
    default: return false;
  }
};

export function ExploreWalkthroughs(props: Props) {
  const [progress, setProgress] = useState<SavedProgress>(loadProgress);
  const [activeKind, setActiveKind] = useState<WalkthroughKind | null>(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [axisHandleBaseline, setAxisHandleBaseline] = useState(0);
  const tasks = activeKind ? tasksFor(activeKind) : [];
  const currentTask = tasks[taskIndex];
  const currentComplete = Boolean(activeKind && currentTask && progress[activeKind].includes(currentTask.id));

  useEffect(() => {
    props.onOpenChange?.(activeKind !== null);
  }, [activeKind, props.onOpenChange]);

  useEffect(() => () => props.onOpenChange?.(false), [props.onOpenChange]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress remains available for this session when storage is unavailable.
    }
  }, [progress]);

  useEffect(() => {
    if (!activeKind || !currentTask || currentComplete) return;
    if (!isWalkthroughTaskComplete(currentTask.id, {
      ...props,
      axisHandleMoves: props.axisHandleMoves - axisHandleBaseline,
    })) return;
    setProgress((previous) => ({
      ...previous,
      [activeKind]: [...new Set([...previous[activeKind], currentTask.id])].sort((a, b) => a - b),
    }));
  }, [activeKind, axisHandleBaseline, currentComplete, currentTask, props]);

  useEffect(() => {
    setShowHint(false);
    if (!activeKind || currentComplete) return;
    const timer = window.setTimeout(() => setShowHint(true), 15_000);
    return () => window.clearTimeout(timer);
  }, [activeKind, currentComplete, taskIndex]);

  const open = (kind: WalkthroughKind) => {
    const kindTasks = tasksFor(kind);
    const firstIncomplete = kindTasks.findIndex((task) => !progress[kind].includes(task.id));
    setTaskIndex(firstIncomplete === -1 ? kindTasks.length - 1 : firstIncomplete);
    setAxisHandleBaseline(props.axisHandleMoves);
    setActiveKind(kind);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.scene')?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      });
    });
  };

  const progressFor = (kind: WalkthroughKind) => progress[kind].length;
  const statusLabel = (kind: WalkthroughKind) =>
    `${progressFor(kind)} of 10 tasks complete (${progressFor(kind) * 10}%)`;

  return (
    <section className="walkthroughs panel" aria-labelledby="walkthroughs-title">
      <div className="panel-title">
        <Compass aria-hidden="true" size={19} />
        <h2 id="walkthroughs-title">Walkthroughs</h2>
      </div>
      <div className="walkthrough-launchers">
        {(['translation', 'rotation'] as const).map((kind) => {
          const count = progressFor(kind);
          const complete = count === 10;
          return (
            <div className={`walkthrough-launcher ${complete ? 'complete' : ''}`} key={kind}>
              <button type="button" onClick={() => open(kind)} aria-describedby={`${kind}-progress-label`}>
                {complete ? <Check aria-hidden="true" size={18} /> : null}
                {kind === 'translation' ? 'Translation' : 'Rotation'}
                {complete ? <span className="complete-badge">Complete</span> : null}
              </button>
              <progress value={count} max="10" aria-label={`${kind} walkthrough progress`} />
              <span id={`${kind}-progress-label`}>{statusLabel(kind)}</span>
            </div>
          );
        })}
      </div>

      {activeKind && currentTask ? (
        <section className="walkthrough-popup" role="dialog" aria-modal="false" aria-labelledby="walkthrough-task-title">
          <header className="walkthrough-popup-header">
            <div>
              <p className="eyebrow">{activeKind} · Task {taskIndex + 1} of 10</p>
              <h3 id="walkthrough-task-title">{currentTask.title}</h3>
            </div>
            <button type="button" className="icon-button" onClick={() => setActiveKind(null)} aria-label="Close walkthrough">
              <X aria-hidden="true" size={20} />
            </button>
          </header>
          <div className="walkthrough-popup-grid">
            <div>
              <h4>Description</h4>
              <ol>{currentTask.description.map((step) => <li key={step}>{step}</li>)}</ol>
              <div className={`task-status ${currentComplete ? 'success' : ''}`} role="status" aria-live="polite">
                {currentComplete ? <><Check aria-hidden="true" size={18} /> Task complete — nice work.</> : 'Waiting for you to complete the task in the workspace…'}
              </div>
              {showHint && !currentComplete ? <p className="walkthrough-hint"><strong>Hint:</strong> {currentTask.hint}</p> : null}
            </div>
            <div className="walkthrough-learning">
              <h4>Observation</h4>
              <p>{currentTask.observation}</p>
              <h4>Explanation</h4>
              <p>{currentTask.explanation}</p>
            </div>
          </div>
          <footer className="walkthrough-navigation">
            <button type="button" onClick={() => {
              setAxisHandleBaseline(props.axisHandleMoves);
              setTaskIndex((index) => index - 1);
            }} disabled={taskIndex === 0}>
              <ChevronLeft aria-hidden="true" size={18} /> Previous
            </button>
            <span>{statusLabel(activeKind)}</span>
            <button
              type="button"
              onClick={() => {
                setAxisHandleBaseline(props.axisHandleMoves);
                if (taskIndex === tasks.length - 1) setActiveKind(null);
                else setTaskIndex((index) => index + 1);
              }}
              disabled={!currentComplete}
            >
              {taskIndex === tasks.length - 1 ? 'Finish' : 'Next'} <ChevronRight aria-hidden="true" size={18} />
            </button>
          </footer>
        </section>
      ) : null}
    </section>
  );
}

export { STORAGE_KEY, rotationTasks, translationTasks };
