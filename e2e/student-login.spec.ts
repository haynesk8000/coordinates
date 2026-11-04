import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

test('a new account verifies and logs in directly to learning without instructor selection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.getByLabel('First name').fill('New');
  await page.getByLabel('Last name').fill('Learner');
  await page.getByLabel('Email address').fill('new@example.com');
  await page.getByLabel('Create 4-digit PIN', { exact: true }).fill('1234');
  await page.getByLabel('Confirm 4-digit PIN').fill('1234');
  await page.getByRole('button', { name: 'Register', exact: true }).click();
  await page.getByRole('button', { name: 'Verify Email', exact: true }).click();
  await page.getByLabel('Email address').fill('new@example.com');
  await page.getByLabel('4-digit PIN', { exact: true }).fill('1234');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByRole('tablist', { name: 'Physics topics' }).getByRole('tab')).toHaveCount(5);
  await expect(page.getByRole('banner')).toContainText('New Learner');
  await expect(page.getByRole('banner')).not.toContainText(/student|instructor|administrator/i);
  await expect(page.getByRole('combobox', { name: /instructor/i })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('physics-motion-lab-users-v1')!)[0].role)).toBe('student');
});

for (const role of ['student', 'instructor', 'administrator']) {
  test(`legacy ${role} signs in and resumes learning with preserved progress`, async ({ page }) => {
    const progressKey = 'coordinate-legacy-progress-v1';
    const progressValue = JSON.stringify({ correct: 3, attempts: 4 });
    const user = {
      id: `legacy-${role}`, firstName: 'Legacy', lastName: 'Learner', email: `${role}@example.com`,
      pinHash: createHash('sha256').update('1234').digest('hex'), role,
      verified: true, verificationToken: '', createdAt: '2025-01-01T00:00:00.000Z',
      progress: { [progressKey]: progressValue },
    };
    await page.goto('/');
    await page.evaluate((account) => localStorage.setItem('physics-motion-lab-users-v1', JSON.stringify([account])), user);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.getByLabel('Email address').fill(user.email);
    await page.getByLabel('4-digit PIN', { exact: true }).fill('1234');
    await page.getByLabel('Remember me').check();
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    const topics = page.getByRole('tablist', { name: 'Physics topics' });
    await expect(topics.getByRole('tab')).toHaveCount(5);
    await expect(page.getByRole('banner')).toContainText('Legacy Learner');
    await expect(page.getByRole('banner')).not.toContainText(/student|instructor|administrator/i);
    await topics.getByRole('tab', { name: 'Projectile Motion', exact: true }).click();
    const panel = page.getByRole('tabpanel', { name: 'Projectile Motion', exact: true });
    await panel.getByRole('tab', { name: 'Quiz', exact: true }).click();
    await expect(panel.getByText(/At the highest point/)).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), progressKey)).toBe(progressValue);

    await page.reload();
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(topics.getByRole('tab')).toHaveCount(5);
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('physics-motion-lab-users-v1')!)[0]);
    expect(stored).toMatchObject({ ...user, role: 'student' });
    expect(stored.progress[progressKey]).toBe(progressValue);
  });
}
