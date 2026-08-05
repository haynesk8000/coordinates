import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { difficultyFromCorrect, rotatePoint } from '../components/FunZoneMode';

const openFunZone = () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'Fun Zone' }));
};

const currentPlotTarget = () => {
  const match = screen.getByTestId('plot-target').textContent?.match(/\((-?\d+),\s*(-?\d+)\)/);
  if (!match) throw new Error('Plot target was not displayed');
  return { x: Number(match[1]), y: Number(match[2]) };
};

const submitPlot = (x: number, y: number) => {
  const grid = screen.getByRole('img', { name: /Blank coordinate grid/ });
  Object.defineProperty(grid, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      left: 0, top: 0, width: 360, height: 360,
      right: 360, bottom: 360, x: 0, y: 0,
      toJSON: () => ({}),
    }),
  });
  fireEvent.click(grid, {
    clientX: 180 + x * (150 / 7),
    clientY: 180 - y * (150 / 7),
  });
};

describe('Fun Zone', () => {
  beforeEach(() => window.localStorage.clear());

  it('shows only Target Plotter and Rotation Reactor in the Coordinate Systems arcade', () => {
    openFunZone();

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Target Plotter' })).toBeVisible();
    expect(within(selector).queryByRole('button', { name: /Radar Reader/ })).not.toBeInTheDocument();
    expect(within(selector).queryByRole('button', { name: /Translation Trek/ })).not.toBeInTheDocument();
    expect(within(selector).queryByRole('button', { name: /Mirror Match/ })).not.toBeInTheDocument();

    fireEvent.click(within(selector).getByRole('button', { name: /Rotation Reactor/ }));
    expect(screen.getByRole('heading', { name: 'Rotation Reactor' })).toBeVisible();
    expect(screen.queryByLabelText(/Difficulty/)).not.toBeInTheDocument();
    expect(screen.getByTestId('rotation-prompt')).toHaveTextContent(/vector|coordinate system/);
    expect(screen.getByTestId('rotation-prompt')).toHaveTextContent(/π\/2|π|3π\/2|2π/);
    expect(screen.getByRole('img', { name: /Vector from the origin/ })).toHaveClass('interactive');
    expect(screen.getByLabelText('Game score')).toHaveTextContent('0 score');
  });

  it('also gives the other physics topics their own Fun Zone', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Projectile Motion' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Fun Zone' }));

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Cannon Game' })).toBeVisible();
  });

  it('provides immediate feedback, locks input, and advances automatically', async () => {
    openFunZone();

    const target = currentPlotTarget();
    submitPlot(target.x === 2 ? -2 : target.x + 1, target.y);

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByText('Incorrect')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Next challenge/ })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Blank coordinate grid/ })).not.toHaveClass('interactive');
    expect(screen.queryByRole('button', { name: 'Plot this point' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Game score')).toHaveTextContent('0 streak');
    expect(screen.getByLabelText('0 total points from 1 attempts')).toBeInTheDocument();

    await waitFor(
      () => expect(screen.getByRole('img', { name: /Blank coordinate grid/ })).toHaveClass('interactive'),
      { timeout: 1600 },
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('persists score across a reload', () => {
    openFunZone();
    const target = currentPlotTarget();
    submitPlot(target.x, target.y);
    expect(screen.getByLabelText('1 total points from 1 attempts')).toBeInTheDocument();

    cleanup();
    openFunZone();
    expect(screen.getByLabelText('1 total points from 1 attempts')).toBeInTheDocument();
  });

  it('removes difficulty controls from Rotation Reactor and uses a fixed grid', () => {
    openFunZone();

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    fireEvent.click(within(selector).getByRole('button', { name: /Rotation Reactor/ }));
    expect(screen.queryByRole('group', { name: 'Difficulty mode' })).not.toBeInTheDocument();
    expect(screen.getByTestId('rotation-prompt')).toHaveTextContent('fixed range −6 to 6');
  });

  it('uses correct quarter-turn transformations in both directions', () => {
    expect(rotatePoint({ x: 2, y: 3 }, 90, true)).toEqual({ x: 3, y: -2 });
    expect(rotatePoint({ x: 2, y: 3 }, 90, false)).toEqual({ x: -3, y: 2 });
    expect(rotatePoint({ x: 2, y: 3 }, 360, true)).toEqual({ x: 2, y: 3 });
  });

  it('calculates the exact capped difficulty progression', () => {
    expect([0, 2, 3, 5, 6, 9, 12, 15, 18].map(difficultyFromCorrect)).toEqual([
      0, 0, 20, 20, 40, 60, 80, 100, 100,
    ]);
  });

  it('keeps Target Plotter on a fixed negative 7 to 7 grid without difficulty levels', async () => {
    openFunZone();

    expect(screen.queryByRole('heading', { name: 'Coordinate picker' })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/climber at 0% of the ladder/)).toBeVisible();
    expect(screen.getByLabelText('Ladder progress')).toHaveValue(0);
    expect(screen.queryByLabelText(/Difficulty \d+%/)).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Difficulty mode' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Plot this point' })).not.toBeInTheDocument();
    expect(screen.getByTestId('plot-target')).toHaveTextContent('−7 to 7');

    for (let answerIndex = 0; answerIndex < 3; answerIndex += 1) {
      const target = currentPlotTarget();
      submitPlot(target.x, target.y);
      expect(screen.getByText('Correct!')).toBeVisible();
      expect(screen.getByRole('img', { name: /Blank coordinate grid/ })).not.toHaveClass('interactive');
      await waitFor(
        () => expect(screen.getByRole('img', { name: /Blank coordinate grid/ })).toHaveClass('interactive'),
        { timeout: 1400 },
      );
    }

    expect(screen.getByLabelText('Ladder progress')).toHaveValue(30);
    expect(screen.queryByText(/Difficulty increased/)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
