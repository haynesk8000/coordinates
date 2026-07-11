import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExploreWalkthroughs, isWalkthroughTaskComplete, STORAGE_KEY } from '../components/ExploreWalkthroughs';
import { rotationTasks, translationTasks } from '../components/walkthroughTasks';
import { defaultParameters } from '../physics/projectile';
import { createPresets } from '../physics/presets';

const params = defaultParameters;
const defaultSystem = createPresets(params)[0];

const props = (overrides = {}) => ({
  params,
  system: defaultSystem,
  time: 0,
  rotationUnits: 0,
  axisHandleMoves: 0,
  ...overrides,
});

describe('Explore walkthroughs', () => {
  beforeEach(() => window.localStorage.clear());

  it('provides ten ordered activities for each concept', () => {
    expect(translationTasks).toHaveLength(10);
    expect(rotationTasks).toHaveLength(10);
    expect(translationTasks.map((task) => task.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(rotationTasks.map((task) => task.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('keeps Next disabled until the workspace satisfies the current task', async () => {
    const { rerender } = render(<ExploreWalkthroughs {...props()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Translation' }));

    expect(screen.getByRole('heading', { name: 'Move the Origin to the Right' })).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();

    rerender(<ExploreWalkthroughs {...props({ system: { ...defaultSystem, originWorld: { x: 3, y: params.H } } })} />);

    await waitFor(() => expect(screen.getByText(/Task complete/)).toBeVisible());
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
    expect(screen.getByLabelText('translation walkthrough progress')).toHaveValue(1);
  });

  it('resumes at the first incomplete saved activity', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ translation: [1, 2], rotation: [11] }));
    render(<ExploreWalkthroughs {...props()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Translation' }));

    expect(screen.getByRole('heading', { name: 'Move the Origin to the Ground' })).toBeVisible();
    expect(screen.getAllByText('2 of 10 tasks complete (20%)')).toHaveLength(2);
  });

  it('validates exact rotations and axis-handle interaction independently', () => {
    expect(isWalkthroughTaskComplete(14, props({ rotationUnits: 6 }))).toBe(true);
    expect(isWalkthroughTaskComplete(14, props({ rotationUnits: 5 }))).toBe(false);
    expect(isWalkthroughTaskComplete(20, props({ rotationUnits: 2, axisHandleMoves: 1 }))).toBe(true);
    expect(isWalkthroughTaskComplete(20, props({ rotationUnits: 2, axisHandleMoves: 0 }))).toBe(false);
  });
});
