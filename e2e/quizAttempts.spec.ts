import { expect, test } from '@playwright/test';
import { buildQuestionBank } from '../src/quiz/questionBank';
import { defaultParameters } from '../src/physics/projectile';

const topics = [
  { name: 'Coordinate Systems', count: 10, answers: [] },
  { name: 'Projectile Motion', count: 5, answers: ['Vertical velocity is zero; acceleration is downward', '(0, −g)', 'They describe the same object during the same flight', 'Increases the horizontal range', 'A y-versus-time graph'] },
  { name: 'Motion Diagrams', count: 5, answers: ['Speed is increasing', 'The object is slowing down', 'Velocity', 'Yes, at an instant such as a turnaround', 'Distance is path length; displacement connects start to finish'] },
  { name: 'Relative Motion', count: 5, answers: ['12 m/s', 'Velocity of A relative to B', 'Downstream from the point directly across', 'Acceleration', 'A moving frame changes measured velocities'] },
  { name: 'Uniform Circular Motion', count: 5, answers: ['Its velocity direction changes', 'Toward the center', 'v = ωr', '4', 'No extra force; identify the inward net force'] },
];

test('every tab balances answer positions and scores shuffled quiz attempts', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const user = { id: 'quiz-test', firstName: 'Quiz', lastName: 'Test', email: 'quiz@example.com', pinHash: '', role: 'student', verified: true, verificationToken: '', progress: {}, createdAt: '2026-01-01T00:00:00.000Z' };
    localStorage.setItem('physics-motion-lab-users-v1', JSON.stringify([user]));
    localStorage.setItem('physics-motion-lab-session-v1', user.id);
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  const bank = buildQuestionBank(defaultParameters);

  for (const topic of topics) {
    await page.getByRole('tablist', { name: 'Physics topics' }).getByRole('tab', { name: topic.name, exact: true }).click();
    const panel = page.getByRole('tabpanel', { name: topic.name, exact: true });
    await panel.getByRole('tab', { name: 'Quiz', exact: true }).click();
    const attemptSignatures: string[] = [];
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const counts = [0, 0, 0, 0];
      const signatures: string[] = [];
      for (let index = 0; index < topic.count; index += 1) {
        const prompt = await panel.locator('.quiz-card h2').innerText();
        const buttons = panel.locator('.choice-grid button');
        const choices = await buttons.allTextContents();
        signatures.push(JSON.stringify([prompt, choices]));
        const coordinateQuestion = topic.name === 'Coordinate Systems' ? bank.find((question) => question.prompt === prompt) : undefined;
        if (coordinateQuestion?.type === 'short') {
          await panel.getByLabel('Short explanation answer').fill(coordinateQuestion.sample);
          await panel.getByRole('button', { name: 'Check explanation' }).click();
        } else if (coordinateQuestion?.type === 'components') {
          for (const part of coordinateQuestion.answer) await panel.getByRole('button', { name: part, exact: true }).click();
          await panel.getByRole('button', { name: 'Check components' }).click();
        } else {
          expect(choices).toHaveLength(4);
          const correct = coordinateQuestion && typeof coordinateQuestion.answer === 'string'
            ? coordinateQuestion.answer : topic.answers.find((answer) => choices.includes(answer));
          expect(correct).toBeDefined();
          counts[choices.indexOf(correct!)] += 1;
          await panel.getByRole('button', { name: correct!, exact: true }).click();
        }
        await expect(panel.getByRole('status').getByText('Correct', { exact: true })).toBeVisible();
        await expect(panel.locator('.score-big')).toHaveText(`${attempt * topic.count + index + 1}/${attempt * topic.count + index + 1}`);
        // Feedback and score updates must keep this question's choices fixed.
        expect(await buttons.allTextContents()).toEqual(choices);
        await panel.getByRole('button', { name: index === topic.count - 1 ? 'Start new quiz' : 'Next question', exact: true }).click();
      }
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
      attemptSignatures.push(signatures.join('|'));
    }
    expect(attemptSignatures[0]).not.toEqual(attemptSignatures[1]);
  }
});
