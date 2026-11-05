import { describe, expect, it } from 'vitest';
import { prepareQuizQuestions } from '../quiz/choiceOrder';
import { buildQuestionBank } from '../quiz/questionBank';
import { defaultParameters } from '../physics/projectile';

const seededRandom = (initial: number) => {
  let seed = initial;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const question = (index: number) => ({
  prompt: `Question ${index}`, choices: [`answer ${index}`, `wrong A ${index}`, `wrong B ${index}`, `wrong C ${index}`],
  answer: `answer ${index}`, explanation: `Feedback ${index}`,
});

const positions = (questions: ReturnType<typeof question>[]) => questions.map((item) => item.choices.indexOf(item.answer));

function expectBalanced(values: number[]) {
  const counts = Array.from({ length: 4 }, (_, index) => values.filter((value) => value === index).length);
  expect(values.every((value) => value >= 0 && value < 4)).toBe(true);
  expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
}

describe('quiz attempt ordering', () => {
  it.each([0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 50])('balances all four answer slots for %i questions over many attempts', (count) => {
    const source = Array.from({ length: count }, (_, index) => question(index));
    const original = structuredClone(source);
    for (let seed = 1; seed <= 40; seed += 1) {
      const attempt = prepareQuizQuestions(source, seededRandom(seed));
      expectBalanced(positions(attempt));
      expect(attempt.map((item) => item.prompt).sort()).toEqual(source.map((item) => item.prompt).sort());
      for (const item of attempt) {
        const before = source.find((candidate) => candidate.prompt === item.prompt)!;
        expect([...item.choices].sort()).toEqual([...before.choices].sort());
        expect(item.answer).toBe(before.answer);
        expect(item.explanation).toBe(before.explanation);
        expect(item.choices.filter((choice) => choice === item.answer)).toHaveLength(1);
      }
    }
    expect(source).toEqual(original);
  });

  it('randomizes question order, distractors, balanced positions and which positions get the remainder', () => {
    const source = Array.from({ length: 5 }, (_, index) => question(index));
    const attempts = Array.from({ length: 40 }, (_, index) => prepareQuizQuestions(source, seededRandom(index + 1)));
    expect(new Set(attempts.map((attempt) => attempt.map((item) => item.prompt).join('|'))).size).toBeGreaterThan(10);
    expect(new Set(attempts.map((attempt) => positions(attempt).join('|'))).size).toBeGreaterThan(10);
    const doubledSlots = attempts.map((attempt) => {
      const values = positions(attempt);
      return values.find((slot) => values.filter((value) => value === slot).length === 2);
    });
    expect(new Set(doubledSlots).size).toBe(4);
    const sameQuestionOrders = attempts.map((attempt) => attempt.find((item) => item.prompt === source[0].prompt)!.choices.join('|'));
    expect(new Set(sameQuestionOrders).size).toBeGreaterThan(8);
    expect(attempts.some((attempt) => {
      const values = positions(attempt);
      return values.some((value, index) => index > 0 && value === values[index - 1]);
    })).toBe(true);
  });

  it('balances the actual coordinate bank without changing multi-part or written answers', () => {
    const source = buildQuestionBank(defaultParameters);
    const snapshot = structuredClone(source);
    const attempt = prepareQuizQuestions(source, seededRandom(43));
    const values: number[] = [];
    for (const item of attempt) {
      const before = source.find((candidate) => candidate.id === item.id)!;
      expect(item).toMatchObject({ id: before.id, prompt: before.prompt, explanation: before.explanation });
      if (item.type === 'short') {
        expect(item).toEqual(before);
      } else {
        expect(item.answer).toEqual('answer' in before ? before.answer : undefined);
        expect([...item.choices].sort()).toEqual('choices' in before ? [...before.choices].sort() : []);
        if (item.type !== 'components') {
          expect(item.choices).toHaveLength(4);
          values.push(item.choices.indexOf(item.answer));
        }
      }
    }
    expectBalanced(values);
    expect(source).toEqual(snapshot);
  });
});
