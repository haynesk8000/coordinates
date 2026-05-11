import type { QuizSkill } from './questionTypes';

export type QuizScore = {
  attempts: number;
  correct: number;
  bySkill: Record<QuizSkill, { attempts: number; correct: number }>;
  history: Array<{ date: string; correct: number; attempts: number }>;
};

const skills: QuizSkill[] = [
  'origin placement',
  'axis orientation',
  'velocity components',
  'acceleration components',
  'equation construction',
  'swapped axes',
];

export const emptyScore = (): QuizScore => ({
  attempts: 0,
  correct: 0,
  bySkill: Object.fromEntries(skills.map((skill) => [skill, { attempts: 0, correct: 0 }])) as QuizScore['bySkill'],
  history: [],
});

export const updateScore = (score: QuizScore, skill: QuizSkill, correct: boolean): QuizScore => {
  const next = structuredClone(score);
  next.attempts += 1;
  next.correct += correct ? 1 : 0;
  next.bySkill[skill].attempts += 1;
  next.bySkill[skill].correct += correct ? 1 : 0;
  next.history = [...next.history, { date: new Date().toISOString(), correct: correct ? 1 : 0, attempts: 1 }].slice(-50);
  return next;
};
