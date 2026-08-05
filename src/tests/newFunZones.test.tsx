import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

const topics = () => within(screen.getByRole('tablist', { name: 'Physics topics' }));

const openTopicFunZone = (topicName: string) => {
  render(<App />);
  fireEvent.click(topics().getByRole('tab', { name: topicName }));
  fireEvent.click(screen.getByRole('tab', { name: 'Fun Zone' }));
};

describe('Fun Zone for every topic', () => {
  beforeEach(() => window.localStorage.clear());

  it.each([
    ['Motion Diagrams', 'Spacing Sleuth', 'Slope Detective'],
    ['Relative Motion', 'Current Navigator', 'Frame Namer'],
    ['Uniform Circular Motion', 'Period Predictor', 'Radial Racer'],
  ])('gives %s a two-game arcade with score tracking', (topicName, firstGame, secondGame) => {
    openTopicFunZone(topicName);

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: firstGame })).toBeVisible();
    expect(screen.getByLabelText('Difficulty 0%')).toBeVisible();

    fireEvent.click(within(selector).getByRole('button', { name: new RegExp(secondGame) }));
    expect(screen.getByRole('heading', { name: secondGame })).toBeVisible();
  });

  it('keeps only Cannon Game in the Projectile Motion arcade', () => {
    openTopicFunZone('Projectile Motion');

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Cannon Game' })).toBeVisible();
    expect(screen.queryByRole('group', { name: 'Difficulty mode' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Difficulty \d+%/)).not.toBeInTheDocument();
    expect(within(selector).queryByRole('button', { name: /Range Rocket/ })).not.toBeInTheDocument();
    expect(within(selector).queryByRole('button', { name: /Vector Detective/ })).not.toBeInTheDocument();
  });

  it('lets a Projectile Motion player fire the cannon and see landing feedback', async () => {
    openTopicFunZone('Projectile Motion');
    expect(screen.getByRole('heading', { name: 'Cannon Game' })).toBeVisible();
    expect(screen.getByText(/Target distance:/)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Fire!' }));

    await waitFor(() => expect(screen.getByRole('status')).toBeVisible(), { timeout: 3000 });
    expect(screen.getByText(/Landing distance:/)).toBeVisible();
    expect(screen.getByLabelText(/total points from 1 attempts/)).toBeInTheDocument();
  });
});

describe('cross-topic progress dashboard', () => {
  beforeEach(() => window.localStorage.clear());

  it('shows a summary card for every topic once opened', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'My progress' }));

    expect(screen.getByRole('heading', { name: 'My Progress' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Coordinate Systems' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Projectile Motion' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Uniform Circular Motion' })).toBeVisible();
  });
});
