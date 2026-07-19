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

  it('gives Projectile Motion a three-game arcade led by the Cannon Game', () => {
    openTopicFunZone('Projectile Motion');

    const selector = screen.getByRole('navigation', { name: 'Fun Zone activities' });
    expect(within(selector).getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Cannon Game' })).toBeVisible();

    fireEvent.click(within(selector).getByRole('button', { name: /Range Rocket/ }));
    expect(screen.getByRole('heading', { name: 'Range Rocket' })).toBeVisible();

    fireEvent.click(within(selector).getByRole('button', { name: /Vector Detective/ }));
    expect(screen.getByRole('heading', { name: 'Vector Detective' })).toBeVisible();
  });

  it('lets a Projectile Motion player answer a Range Rocket round', () => {
    openTopicFunZone('Projectile Motion');
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Fun Zone activities' })).getByRole('button', { name: /Range Rocket/ }));

    fireEvent.click(screen.getAllByRole('button', { name: /^\d+(\.\d+)? m$/ })[0]);

    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('button', { name: /Next challenge/ })).toBeVisible();
    expect(screen.getByLabelText(/total points from 1 attempts/)).toBeInTheDocument();
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
