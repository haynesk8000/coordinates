import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

const openFunZone = () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'Fun Zone' }));
};

describe('Fun Zone', () => {
  it('adds a Coordinate Systems-only mode with five activities', () => {
    openFunZone();

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: 'Target Plotter' })).toBeVisible();

    fireEvent.click(within(selector).getByRole('button', { name: /Rotation Reactor/ }));
    expect(screen.getByRole('heading', { name: 'Rotation Reactor' })).toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'Projectile Motion' }));
    const placeholderModes = within(screen.getByRole('tablist', { name: 'Learning mode' }));
    expect(placeholderModes.queryByRole('tab', { name: 'Fun Zone' })).not.toBeInTheDocument();
  });

  it('provides immediate feedback and tracks a measurable score', () => {
    openFunZone();

    const xPicker = screen.getByLabelText('x');
    const yPicker = screen.getByLabelText('y');
    fireEvent.change(xPicker, { target: { value: '5' } });
    fireEvent.change(yPicker, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Plot this point' }));

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('button', { name: /Next challenge/ })).toBeVisible();
    expect(screen.getByLabelText('Game score')).toHaveTextContent('0 streak');
    expect(screen.getByLabelText('0 total points from 1 attempts')).toBeInTheDocument();
  });
});
