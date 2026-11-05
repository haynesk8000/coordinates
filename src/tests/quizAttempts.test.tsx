import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectileMotionModule } from '../components/ProjectileMotionModule';
import { MotionDiagramsModule } from '../components/MotionDiagramsModule';
import { RelativeMotionModule } from '../components/RelativeMotionModule';
import { CircularMotionModule } from '../components/CircularMotionModule';
import { QuizMode } from '../components/QuizMode';
import { ConceptQuiz } from '../components/LearningModuleShared';
import { buildQuestionBank } from '../quiz/questionBank';
import { defaultParameters } from '../physics/projectile';

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const quizCard = () => document.querySelector<HTMLElement>('.quiz-card')!;
const optionButtons = () => within(quizCard().querySelector<HTMLElement>('.choice-grid')!).getAllByRole('button');
const optionTexts = () => optionButtons().map((button) => button.textContent);
const prompt = () => within(quizCard()).getByRole('heading', { level: 2 }).textContent!;

function expectBalanced(positions: number[]) {
  const counts = Array.from({ length: 4 }, (_, position) => positions.filter((value) => value === position).length);
  expect(Math.min(...positions)).toBeGreaterThanOrEqual(0);
  expect(Math.max(...positions)).toBeLessThan(4);
  expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
}

const topics = [
  {
    name: 'Projectile Motion', Module: ProjectileMotionModule, id: 'projectile-motion',
    answers: ['Vertical velocity is zero; acceleration is downward', '(0, −g)', 'They describe the same object during the same flight', 'Increases the horizontal range', 'A y-versus-time graph'],
  },
  {
    name: 'Motion Diagrams', Module: MotionDiagramsModule, id: 'motion-diagrams',
    answers: ['Speed is increasing', 'The object is slowing down', 'Velocity', 'Yes, at an instant such as a turnaround', 'Distance is path length; displacement connects start to finish'],
  },
  {
    name: 'Relative Motion', Module: RelativeMotionModule, id: 'relative-motion',
    answers: ['12 m/s', 'Velocity of A relative to B', 'Downstream from the point directly across', 'Acceleration', 'A moving frame changes measured velocities'],
  },
  {
    name: 'Uniform Circular Motion', Module: CircularMotionModule, id: 'uniform-circular-motion',
    answers: ['Its velocity direction changes', 'Toward the center', 'v = ωr', '4', 'No extra force; identify the inward net force'],
  },
];

describe('quiz attempts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Math, 'random').mockImplementation(seededRandom(731));
  });
  afterEach(() => vi.restoreAllMocks());

  it.each(topics)('$name balances every attempt and preserves shuffled scoring and feedback', ({ Module, id, answers }) => {
    const { rerender } = render(<Module />);
    fireEvent.click(screen.getByRole('tab', { name: 'Quiz' }));
    const attempts: Array<Array<{ prompt: string; options: Array<string | null> }>> = [];
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const order: Array<{ prompt: string; options: Array<string | null> }> = [];
      const positions: number[] = [];
      for (let index = 0; index < 5; index += 1) {
        const options = optionTexts();
        expect(options).toHaveLength(4);
        const answer = answers.find((candidate) => options.includes(candidate));
        expect(answer).toBeDefined();
        positions.push(options.indexOf(answer!));
        order.push({ prompt: prompt(), options });
        rerender(<Module />);
        expect(optionTexts()).toEqual(options);
        expect(prompt()).toBe(order[index].prompt);
        const wrong = attempt === 0 && index === 0;
        fireEvent.click(optionButtons()[wrong ? options.findIndex((choice) => choice !== answer) : options.indexOf(answer!)]);
        expect(optionTexts()).toEqual(options);
        const feedback = within(quizCard()).getByRole('status');
        expect(feedback).toHaveTextContent(wrong ? 'Not quite' : 'Correct');
        if (wrong) expect(feedback).toHaveTextContent(`Correct answer: ${answer}.`);
        optionButtons().forEach((button) => expect(button).toBeDisabled());
        fireEvent.click(optionButtons()[0]);
        const saved = JSON.parse(localStorage.getItem(`physics-motion-lab-${id}-score`)!);
        expect(saved.attempts).toBe(attempt * 5 + index + 1);
        expect(saved.correct).toBe(attempt * 5 + index);
        fireEvent.click(within(quizCard()).getByRole('button', { name: index === 4 ? 'Start new quiz' : 'Next question' }));
      }
      expectBalanced(positions);
      expect(new Set(order.map((question) => question.prompt)).size).toBe(5);
      attempts.push(order);
    }
    expect(attempts[1].map((question) => question.prompt)).not.toEqual(attempts[0].map((question) => question.prompt));
    expect(attempts[1].some((question) => {
      const previous = attempts[0].find((candidate) => candidate.prompt === question.prompt)!;
      return question.options.join('|') !== previous.options.join('|');
    })).toBe(true);
  });

  it('keeps a concept attempt fixed when props are recreated or accumulated scores are reset', () => {
    const questions = Array.from({ length: 8 }, (_, index) => ({
      prompt: `Stable question ${index}`, choices: [`Right ${index}`, `Wrong A ${index}`, `Wrong B ${index}`, `Wrong C ${index}`],
      answer: `Right ${index}`, explanation: `Explanation ${index}`, skill: 'stability',
    }));
    const { rerender } = render(<ConceptQuiz moduleId="stability" questions={questions} onReviewExplain={() => undefined} />);
    const initialPrompt = prompt();
    const initialOptions = optionTexts();
    rerender(<ConceptQuiz moduleId="stability" questions={questions.map((question) => ({ ...question, choices: [...question.choices] }))} onReviewExplain={() => undefined} />);
    expect(prompt()).toBe(initialPrompt);
    expect(optionTexts()).toEqual(initialOptions);
    fireEvent.click(screen.getByRole('button', { name: 'Reset score' }));
    expect(prompt()).toBe(initialPrompt);
    expect(optionTexts()).toEqual(initialOptions);
  });

  it('balances coordinate multiple-choice answers while preserving component and written-answer scoring', () => {
    const bank = buildQuestionBank(defaultParameters);
    const onReviewExplain = vi.fn();
    const { rerender } = render(<QuizMode params={defaultParameters} onReviewExplain={onReviewExplain} />);
    const orders: string[][] = [];
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const positions: number[] = [];
      const order: string[] = [];
      for (let index = 0; index < 10; index += 1) {
        const question = bank.find((candidate) => candidate.prompt === prompt())!;
        expect(question).toBeDefined();
        order.push(question.id);
        const options = question.type === 'short' ? [] : optionTexts();
        rerender(<QuizMode params={defaultParameters} onReviewExplain={onReviewExplain} />);
        expect(prompt()).toBe(question.prompt);
        if (question.type === 'short') {
          fireEvent.change(screen.getByRole('textbox'), { target: { value: question.sample } });
          fireEvent.click(screen.getByRole('button', { name: 'Check explanation' }));
        } else if (question.type === 'components') {
          expect(optionTexts()).toEqual(options);
          for (const part of question.answer) fireEvent.click(within(quizCard()).getByRole('button', { name: part }));
          fireEvent.click(screen.getByRole('button', { name: 'Check components' }));
        } else {
          expect(options).toHaveLength(4);
          expect(optionTexts()).toEqual(options);
          positions.push(options.indexOf(question.answer));
          fireEvent.click(within(quizCard()).getByRole('button', { name: question.answer }));
          expect(optionTexts()).toEqual(options);
        }
        expect(within(quizCard()).getByRole('status')).toHaveTextContent('Correct');
        const saved = JSON.parse(localStorage.getItem('coordinate-kinematics-quiz-score')!);
        expect(saved.attempts).toBe(attempt * 10 + index + 1);
        expect(saved.correct).toBe(saved.attempts);
        fireEvent.click(screen.getByRole('button', { name: index === 9 ? 'Start new quiz' : 'Next question' }));
      }
      expectBalanced(positions);
      expect(new Set(order).size).toBe(10);
      orders.push(order);
    }
    expect(orders[1]).not.toEqual(orders[0]);
  }, 20_000);
});
