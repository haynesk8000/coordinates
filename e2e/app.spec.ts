import { expect, test } from '@playwright/test';

test('selecting a preset updates equations', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coordinate preset').selectOption('4');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 + 1/2 g t^2');
});

test('flipping an axis changes the sign of the matching term', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 - 1/2 g t^2');
  await page.getByRole('button', { name: /Flip y/ }).click();
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 + 1/2 g t^2');
});

test('moving the origin changes initial coordinates but not velocity or acceleration', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coordinate preset').selectOption('5');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = H - 1/2 g t^2');
  await expect(page.getByRole('cell', { name: 'v0' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: '-g' }).first()).toBeVisible();
});

test('initial coordinate measurement guides update with the selected coordinate system', async ({ page }) => {
  await page.goto('/');
  const guides = page.getByTestId('initial-coordinate-guides');
  const axis1Guide = page.getByTestId('initial-guide-axis1');
  const axis2Guide = page.getByTestId('initial-guide-axis2');
  const guideLength = async (guide: typeof axis1Guide) => {
    const [x1, y1, x2, y2] = await Promise.all([
      guide.getAttribute('x1'),
      guide.getAttribute('y1'),
      guide.getAttribute('x2'),
      guide.getAttribute('y2'),
    ]);

    return Math.hypot(Number(x2) - Number(x1), Number(y2) - Number(y1));
  };

  await expect(guides).toHaveAttribute('aria-label', 'Initial coordinate guides for x0 and y0');
  await expect(page.locator('.initial-guide-label')).toHaveText(['x0', 'y0']);
  await expect(page.locator('.initial-guide-label').filter({ hasText: /[1-9]\d*(\.\d+)?\s*m/ })).toHaveCount(0);
  const defaultAxis1Length = await guideLength(axis1Guide);
  const defaultAxis2Length = await guideLength(axis2Guide);

  await page.getByLabel('Coordinate preset').selectOption('5');
  await expect(guides).toHaveAttribute('aria-label', 'Initial coordinate guides for x0 and y0');
  await expect(page.locator('.initial-guide-label')).toHaveText(['x0', 'y0']);
  expect(await guideLength(axis1Guide)).toBeCloseTo(defaultAxis1Length);
  expect(await guideLength(axis2Guide)).toBeGreaterThan(defaultAxis2Length);

  await page.getByLabel('Coordinate preset').selectOption('10');
  expect(await guideLength(axis1Guide)).toBeGreaterThan(defaultAxis1Length);
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
