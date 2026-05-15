import { expect, test } from '@playwright/test';

test('selecting a preset updates equations', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coordinate preset').selectOption('4');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = y0 + 1/2 g t^2');
});

test('flipping an axis changes the sign of the matching term', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = y0 - 1/2 g t^2');
  await page.getByRole('button', { name: /Flip y/ }).click();
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = y0 + 1/2 g t^2');
});

test('moving the origin changes initial coordinates but not velocity or acceleration', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coordinate preset').selectOption('5');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = y0 - 1/2 g t^2');
  await expect(page.getByRole('cell', { name: 'v0' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: '-g' }).first()).toBeVisible();
});

test('dragging either axis rotates with the same snapped units as the slider', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByLabel('Rotate coordinate axes');
  const axisHandles = page.locator('.axis-rotation-handle');

  await axisHandles.nth(0).dragTo(axisHandles.nth(1));
  await expect(slider).toHaveValue('6');

  await page.getByRole('button', { name: /Reset/ }).click();
  await axisHandles.nth(1).dragTo(axisHandles.nth(0));
  await expect(slider).toHaveValue('-6');
});
