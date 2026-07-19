import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { difficultyFromCorrect } from '../components/FunZoneMode';

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
  fireEvent.change(screen.getByRole('combobox', { name: 'x' }), { target: { value: String(x) } });
  fireEvent.change(screen.getByRole('combobox', { name: 'y' }), { target: { value: String(y) } });
  fireEvent.click(screen.getByRole('button', { name: 'Plot this point' }));
};

describe('Fun Zone', () => {
  beforeEach(() => window.localStorage.clear());

  it('gives Coordinate Systems a five-activity arcade', () => {
    openFunZone();

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: 'Target Plotter' })).toBeVisible();

    fireEvent.click(within(selector).getByRole('button', { name: /Rotation Reactor/ }));
    expect(screen.getByRole('heading', { name: 'Rotation Reactor' })).toBeVisible();
    expect(screen.getByLabelText('Difficulty 0%')).toBeVisible();
  });

  it('also gives the other physics topics their own Fun Zone', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Projectile Motion' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Fun Zone' }));

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Cannon Game' })).toBeVisible();
  });

  it('provides immediate feedback and tracks a measurable score', () => {
    openFunZone();

    const target = currentPlotTarget();
    submitPlot(target.x === 2 ? -2 : target.x + 1, target.y);

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('button', { name: /Next challenge/ })).toBeVisible();
    expect(screen.getByLabelText('Game score')).toHaveTextContent('0 streak');
    expect(screen.getByLabelText('0 total points from 1 attempts')).toBeInTheDocument();
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

  it('lets a student pick a fixed difficulty instead of the automatic ramp', () => {
    openFunZone();

    fireEvent.click(screen.getByRole('button', { name: 'Hard' }));
    expect(screen.getByLabelText('Difficulty 80%')).toBeVisible();
  });

  it('calculates the exact capped difficulty progression', () => {
    expect([0, 2, 3, 5, 6, 9, 12, 15, 18].map(difficultyFromCorrect)).toEqual([
      0, 0, 20, 20, 40, 60, 80, 100, 100,
    ]);
  });

  it('levels up after three correct answers and makes plotting harder', () => {
    openFunZone();

    expect(screen.getByLabelText('Difficulty 0%')).toBeVisible();
    expect(within(screen.getByRole('combobox', { name: 'x' })).getAllByRole('option')).toHaveLength(5);

    for (let answerIndex = 0; answerIndex < 3; answerIndex += 1) {
      const target = currentPlotTarget();
      submitPlot(target.x, target.y);
      if (answerIndex < 2) fireEvent.click(screen.getByRole('button', { name: /Next challenge/ }));
    }

    expect(screen.getByLabelText('Difficulty 20%')).toBeVisible();
    expect(screen.getByText('Difficulty increased to 20%!')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Next challenge/ }));
    expect(within(screen.getByRole('combobox', { name: 'x' })).getAllByRole('option')).toHaveLength(7);
  });
});
