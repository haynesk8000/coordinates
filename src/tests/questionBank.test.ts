import { describe, expect, it } from 'vitest';
import { buildQuestionBank } from '../quiz/questionBank';
import { defaultParameters } from '../physics/projectile';

describe('question bank', () => {
  it('builds a 50-question pool', () => {
    expect(buildQuestionBank(defaultParameters)).toHaveLength(50);
  });
});
