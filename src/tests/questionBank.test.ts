import { describe, expect, it } from 'vitest';
import { buildQuestionBank, shuffleQuestionChoices } from '../quiz/questionBank';
import { defaultParameters } from '../physics/projectile';

describe('question bank', () => {
  it('builds a 50-question pool', () => {
    expect(buildQuestionBank(defaultParameters)).toHaveLength(50);
  });

  it('shuffles quiz choices without changing the answer key', () => {
    const question = buildQuestionBank(defaultParameters).find((candidate) => candidate.id === 'accel-positive-up');
    if (!question || !('choices' in question)) throw new Error('Expected a choice question.');

    const shuffled = shuffleQuestionChoices(question, () => 0);
    if (!('choices' in shuffled)) throw new Error('Expected shuffled choices.');

    expect(question.choices[0]).toBe(question.answer);
    expect(shuffled.answer).toBe(question.answer);
    expect(shuffled.choices[0]).not.toBe(question.answer);
    expect(shuffled.choices).toHaveLength(question.choices.length);
    expect([...shuffled.choices].sort()).toEqual([...question.choices].sort());
  });
});
