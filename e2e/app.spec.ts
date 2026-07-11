import { expect, test, type Locator } from '@playwright/test';

const lineMetrics = async (line: Locator) => {
  const [x1, y1, x2, y2] = await Promise.all([
    line.getAttribute('x1'),
    line.getAttribute('y1'),
    line.getAttribute('x2'),
    line.getAttribute('y2'),
  ]);

  return {
    x1: Number(x1),
    y1: Number(y1),
    x2: Number(x2),
    y2: Number(y2),
    length: Math.hypot(Number(x2) - Number(x1), Number(y2) - Number(y1)),
  };
};

test('top-level topics expose learning-mode placeholders and preserve coordinate state', async ({ page }) => {
  await page.goto('/');
  const topics = page.getByRole('tablist', { name: 'Physics topics' });

  await expect(topics.getByRole('tab')).toHaveCount(5);
  await page.getByLabel('Coordinate preset').selectOption('4');

  await topics.getByRole('tab', { name: 'Projectile Motion' }).click();
  const projectileModule = page.getByRole('tabpanel', { name: 'Projectile Motion' });
  await expect(projectileModule.getByRole('heading', { level: 2, name: 'Projectile Motion' })).toBeVisible();
  await page.getByRole('tablist', { name: 'Learning mode' }).getByRole('tab', { name: 'Quiz' }).click();
  await expect(projectileModule.getByText('Quiz mode')).toBeVisible();
  await expect(projectileModule.getByText('Content coming soon.')).toBeVisible();

  await topics.getByRole('tab', { name: 'Coordinate Systems' }).click();
  await expect(page.getByLabel('Coordinate preset')).toHaveValue('4');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 + 1/2 g t^2');
});

test('translation walkthrough gates navigation and resumes saved progress', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Translation' }).click();
  const walkthrough = page.getByRole('dialog');
  await expect(walkthrough.getByRole('heading', { name: 'Move the Origin to the Right' })).toBeVisible();
  await expect.poll(async () => {
    const box = await walkthrough.boundingBox();
    const viewport = page.viewportSize();
    return Boolean(box && viewport && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height);
  }).toBe(true);

  const sceneBox = await page.locator('.scene').first().boundingBox();
  const taskBox = await walkthrough.boundingBox();
  expect(sceneBox && taskBox && (sceneBox.x + sceneBox.width <= taskBox.x || taskBox.x + taskBox.width <= sceneBox.x)).toBe(true);
  expect(taskBox && sceneBox && taskBox.x + taskBox.width <= sceneBox.x).toBe(true);

  const equationPanel = page.getByRole('region', { name: 'Equations', exact: true });
  const breakdownPanel = page.getByRole('region', { name: 'Component Breakdown', exact: true });
  await expect.poll(async () => {
    const viewport = page.viewportSize();
    const boxes = await Promise.all([page.locator('.scene').first().boundingBox(), equationPanel.boundingBox(), breakdownPanel.boundingBox()]);
    return Boolean(viewport && boxes.every((box) => box && box.y >= 0 && box.y + box.height <= viewport.height));
  }).toBe(true);
  await expect(walkthrough.getByRole('button', { name: 'Next' })).toBeDisabled();

  const origin = page.getByRole('slider', { name: /Coordinate origin/ });
  await origin.press('Shift+ArrowRight');

  await expect(walkthrough.getByText(/Task complete/)).toBeVisible();
  await expect(walkthrough.getByRole('button', { name: 'Next' })).toBeEnabled();
  await expect(page.getByLabel('translation walkthrough progress')).toHaveAttribute('value', '1');

  await page.reload();
  await page.getByRole('button', { name: 'Translation' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Move the Origin to the Left' })).toBeVisible();
});

test('selecting a preset updates equations', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coordinate preset').selectOption('4');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 + 1/2 g t^2');
});

test('selecting the active preset reapplies it after coordinate edits', async ({ page }) => {
  await page.goto('/');
  const presetSelect = page.getByLabel('Coordinate preset');

  await presetSelect.selectOption('4');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 + 1/2 g t^2');

  await page.getByRole('button', { name: /Flip y/ }).click();
  await expect(presetSelect).toHaveValue('__modified__');
  await expect(page.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 - 1/2 g t^2');

  await presetSelect.selectOption('4');
  await expect(presetSelect).toHaveValue('4');
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
  await expect(page.getByTestId('breakdown-initial-velocity-axis1')).toHaveAttribute('aria-label', 'v_x0');
  await expect(page.getByRole('cell', { name: '-g' }).first()).toBeVisible();
});

test('initial coordinate measurement guides update with the selected coordinate system', async ({ page }) => {
  await page.goto('/');
  const guides = page.getByTestId('initial-coordinate-guides');
  const axis1Guide = page.getByTestId('initial-guide-axis1');
  const axis2Guide = page.getByTestId('initial-guide-axis2');

  await expect(guides).toHaveAttribute('aria-label', 'Initial coordinate guides for x0 and y0');
  await expect(page.locator('.initial-guide-label')).toHaveText(['x0', 'y0']);
  await expect(page.locator('.initial-guide-label').filter({ hasText: /[1-9]\d*(\.\d+)?\s*m/ })).toHaveCount(0);
  const defaultAxis1Length = (await lineMetrics(axis1Guide)).length;
  const defaultAxis2Length = (await lineMetrics(axis2Guide)).length;

  await page.getByLabel('Coordinate preset').selectOption('5');
  await expect(guides).toHaveAttribute('aria-label', 'Initial coordinate guides for x0 and y0');
  await expect(page.locator('.initial-guide-label')).toHaveText(['x0', 'y0']);
  expect((await lineMetrics(axis1Guide)).length).toBeCloseTo(defaultAxis1Length);
  expect((await lineMetrics(axis2Guide)).length).toBeGreaterThan(defaultAxis2Length);

  await page.getByLabel('Coordinate preset').selectOption('10');
  expect((await lineMetrics(axis1Guide)).length).toBeGreaterThan(defaultAxis1Length);
});

test('height annotations use vertical measurement lines', async ({ page }) => {
  await page.goto('/');
  const hDimension = page.getByTestId('height-dimension-h');
  const HDimension = page.getByTestId('height-dimension-H');
  const hLine = hDimension.locator('.measure-line');
  const HLine = HDimension.locator('.measure-line');

  await expect(page.locator('.scene-label').filter({ hasText: 'd1' })).toBeVisible();
  await expect(page.locator('.scene-label').filter({ hasText: 'd2' })).toBeVisible();
  await expect(hDimension.locator('text')).toHaveText('h');
  await expect(HDimension.locator('text')).toHaveText('H');

  const hMetrics = await lineMetrics(hLine);
  const HMetrics = await lineMetrics(HLine);
  expect(hMetrics.x1).toBeCloseTo(hMetrics.x2);
  expect(hMetrics.length).toBeGreaterThan(20);
  expect(HMetrics.x1).toBeCloseTo(HMetrics.x2);
  expect(HMetrics.length).toBeGreaterThan(hMetrics.length);
});

test('velocity equations and current velocity update with time', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Velocity Equations' })).toBeVisible();
  await expect(page.getByTestId('velocity-equation-x')).toHaveAttribute('aria-label', 'v_x = v_x0');
  await expect(page.getByTestId('velocity-equation-y')).toHaveAttribute('aria-label', 'v_y = v_y0 - g t');
  await expect(page.getByTestId('breakdown-initial-velocity-axis1')).toHaveAttribute('aria-label', 'v_x0');
  await expect(page.getByTestId('breakdown-initial-velocity-axis2')).toHaveAttribute('aria-label', 'v_y0');

  await expect(page.getByTestId('breakdown-current-velocity-axis1')).toHaveAttribute('aria-label', 'v_x0');
  await expect(page.getByTestId('breakdown-current-velocity-axis2')).toHaveAttribute('aria-label', 'v_y0 - g(0)');

  await page.getByLabel('Projectile time').fill('1');
  await expect(page.getByTestId('velocity-equation-y')).toHaveAttribute('aria-label', 'v_y = v_y0 - g t');
  await expect(page.getByTestId('breakdown-current-velocity-axis1')).toHaveAttribute('aria-label', 'v_x0');
  await expect(page.getByTestId('breakdown-current-velocity-axis2')).toHaveAttribute('aria-label', 'v_y0 - g(1)');

  const rotationSlider = page.getByLabel('Rotate coordinate axes');
  await rotationSlider.focus();
  await rotationSlider.press('ArrowRight');
  await rotationSlider.press('ArrowRight');
  await rotationSlider.press('ArrowRight');
  await expect(rotationSlider).toHaveValue('3');
  await expect(page.getByTestId('velocity-equation-x')).toHaveAttribute(
    'aria-label',
    'v_x = v_x0 cos(pi/4) + v_y0 sin(pi/4) - g t sin(pi/4)',
  );
  await expect(page.getByTestId('velocity-equation-y')).toHaveAttribute(
    'aria-label',
    'v_y = -v_x0 sin(pi/4) + v_y0 cos(pi/4) - g t cos(pi/4)',
  );
  await expect(page.getByTestId('breakdown-current-velocity-axis1')).toHaveAttribute(
    'aria-label',
    'v_x0 cos(pi/4) + v_y0 sin(pi/4) - g(1) sin(pi/4)',
  );
});

test('projectile vectors show velocity components and fixed gravity reference', async ({ page }) => {
  await page.goto('/');
  const vxVector = page.getByTestId('projectile-vx-vector');
  const vyVector = page.getByTestId('projectile-vy-vector');
  const gravityReference = page.getByTestId('gravity-reference-vector');

  const initialVx = await lineMetrics(vxVector);
  const initialGravity = await lineMetrics(gravityReference);
  expect(initialVx.y1).toBeCloseTo(initialVx.y2);
  expect(initialVx.x2).toBeGreaterThan(initialVx.x1);
  await expect(vyVector).toHaveCount(0);
  expect(initialGravity.x1).toBeCloseTo(initialGravity.x2);
  expect(initialGravity.y2).toBeGreaterThan(initialGravity.y1);

  await page.getByLabel('Projectile time').fill('1');
  await expect(vyVector).toHaveCount(1);
  const movedVx = await lineMetrics(vxVector);
  const movedVy = await lineMetrics(vyVector);
  const movedGravity = await lineMetrics(gravityReference);

  expect(movedVx.length).toBeCloseTo(initialVx.length);
  expect(movedVx.y1).toBeCloseTo(movedVx.y2);
  expect(movedVy.x1).toBeCloseTo(movedVy.x2);
  expect(movedVy.y2).toBeGreaterThan(movedVy.y1);
  expect(movedGravity).toEqual(initialGravity);
  await expect(page.locator('.vector-label').filter({ hasText: 'v0' })).toHaveCount(0);
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

test('Fun Zone switches among five games and gives immediate scored feedback', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tablist', { name: 'Learning mode' }).getByRole('tab', { name: 'Fun Zone' }).click();

  const activities = page.getByRole('navigation', { name: 'Fun Zone activities' });
  await expect(activities.getByRole('button')).toHaveCount(5);
  await expect(page.getByRole('heading', { name: 'Target Plotter' })).toBeVisible();
  await expect(page.getByLabel('Difficulty 0%')).toBeVisible();

  await activities.getByRole('button', { name: /Rotation Reactor/ }).click();
  await expect(page.getByRole('heading', { name: 'Rotation Reactor' })).toBeVisible();

  await activities.getByRole('button', { name: /Target Plotter/ }).click();
  const targetMatch = (await page.getByTestId('plot-target').innerText()).match(/\((-?\d+),\s*(-?\d+)\)/);
  expect(targetMatch).not.toBeNull();
  const targetX = Number(targetMatch?.[1]);
  const targetY = Number(targetMatch?.[2]);
  await page.getByRole('combobox', { name: 'x', exact: true }).selectOption(String(targetX === 2 ? -2 : targetX + 1));
  await page.getByRole('combobox', { name: 'y', exact: true }).selectOption(String(targetY));
  await page.getByRole('button', { name: 'Plot this point' }).click();

  await expect(page.getByRole('status')).toContainText('The target was');
  await expect(page.getByLabel('Game score')).toContainText('0% accuracy');
  await expect(page.getByLabel('0 total points from 1 attempts')).toBeVisible();
});
