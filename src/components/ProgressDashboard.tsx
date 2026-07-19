import { Award, Compass, Gamepad2, Trophy } from 'lucide-react';
import { physicsTopics, type PhysicsTopic } from './TopicSwitcher';

type QuizScoreShape = { correct: number; attempts: number };
type StatsRecord = Record<string, { correct: number; attempts: number }>;

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const quizStorageKey = (topic: PhysicsTopic) =>
  topic === 'coordinate-systems' ? 'coordinate-kinematics-quiz-score' : `physics-motion-lab-${topic}-score`;

const funZoneStorageKey = (topic: PhysicsTopic) =>
  topic === 'coordinate-systems' ? 'coordinate-funzone-stats-v1' : `physics-motion-lab-${topic}-funzone-v1`;

const walkthroughTotals: Partial<Record<PhysicsTopic, number>> = {
  'projectile-motion': 8,
  'motion-diagrams': 8,
  'relative-motion': 8,
  'uniform-circular-motion': 8,
};

const readQuizScore = (topic: PhysicsTopic): QuizScoreShape => {
  const saved = readJson<QuizScoreShape>(quizStorageKey(topic));
  return { correct: saved?.correct ?? 0, attempts: saved?.attempts ?? 0 };
};

const readFunZonePoints = (topic: PhysicsTopic): { correct: number; attempts: number } => {
  const saved = readJson<StatsRecord>(funZoneStorageKey(topic));
  if (!saved) return { correct: 0, attempts: 0 };
  return Object.values(saved).reduce(
    (total, stats) => ({ correct: total.correct + (stats?.correct ?? 0), attempts: total.attempts + (stats?.attempts ?? 0) }),
    { correct: 0, attempts: 0 },
  );
};

const readWalkthroughCount = (): number => {
  const saved = readJson<{ translation?: number[]; rotation?: number[] }>('coordinate-explorer-walkthrough-progress-v1');
  return (saved?.translation?.length ?? 0) + (saved?.rotation?.length ?? 0);
};

const readTopicWalkthroughCount = (topic: PhysicsTopic): number => {
  const saved = readJson<number[]>(`physics-motion-lab-${topic}-walkthrough-v1`);
  return saved?.length ?? 0;
};

export function ProgressDashboard() {
  const rows = physicsTopics.map((topic) => {
    const quiz = readQuizScore(topic.id);
    const fun = readFunZonePoints(topic.id);
    const walkthrough = topic.id === 'coordinate-systems'
      ? { done: readWalkthroughCount(), total: 20, label: 'Walkthrough tasks' }
      : { done: readTopicWalkthroughCount(topic.id), total: walkthroughTotals[topic.id] ?? 0, label: 'Walkthrough steps' };
    return { topic, quiz, fun, walkthrough };
  });

  const totalPoints = rows.reduce((total, row) => total + row.quiz.correct + row.fun.correct, 0);
  const totalAttempts = rows.reduce((total, row) => total + row.quiz.attempts + row.fun.attempts, 0);
  const topicsStarted = rows.filter((row) => row.quiz.attempts > 0 || row.fun.attempts > 0 || row.walkthrough.done > 0).length;

  return (
    <section className="panel progress-dashboard" aria-labelledby="progress-dashboard-heading">
      <div className="panel-title">
        <Trophy aria-hidden="true" size={20} />
        <h2 id="progress-dashboard-heading">My Progress</h2>
      </div>
      <div className="progress-summary">
        <div><strong>{totalPoints}</strong><span>Total points</span></div>
        <div><strong>{totalAttempts}</strong><span>Total attempts</span></div>
        <div><strong>{topicsStarted} of {rows.length}</strong><span>Topics started</span></div>
      </div>
      <div className="progress-grid">
        {rows.map(({ topic, quiz, fun, walkthrough }) => (
          <article key={topic.id} className="progress-card" data-topic={topic.id}>
            <h3>{topic.label}</h3>
            <dl>
              <div>
                <dt><Award aria-hidden="true" size={15} /> Quiz</dt>
                <dd>{quiz.correct}/{quiz.attempts || 0}</dd>
              </div>
              <div>
                <dt><Gamepad2 aria-hidden="true" size={15} /> Fun Zone</dt>
                <dd>{fun.correct} pts{fun.attempts > 0 ? ` (${fun.attempts} tries)` : ''}</dd>
              </div>
              <div>
                <dt><Compass aria-hidden="true" size={15} /> {walkthrough.label}</dt>
                <dd>{walkthrough.done}/{walkthrough.total}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <p className="history-note">Progress is saved per browser. Visit each topic's Quiz and Fun Zone to build up your score.</p>
    </section>
  );
}
