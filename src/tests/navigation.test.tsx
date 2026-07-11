import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

const topLevelTabs = () => within(screen.getByRole('tablist', { name: 'Physics topics' }));

const activeTopicPanel = () => within(screen.getByRole('tabpanel'));

describe('application navigation', () => {
  it('shows five top-level physics topics', () => {
    render(<App />);

    expect(topLevelTabs().getAllByRole('tab')).toHaveLength(5);
    expect(topLevelTabs().getByRole('tab', { name: 'Coordinate Systems' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Coordinate preset')).toBeVisible();
  });

  it('gives each placeholder topic reusable Explore, Explain, and Quiz tabs', () => {
    render(<App />);

    fireEvent.click(topLevelTabs().getByRole('tab', { name: 'Projectile Motion' }));
    const learningModes = within(screen.getByRole('tablist', { name: 'Learning mode' }));

    expect(learningModes.getAllByRole('tab')).toHaveLength(3);
    expect(activeTopicPanel().getByText('Explore mode')).toBeVisible();
    expect(activeTopicPanel().getByText('Content coming soon.')).toBeVisible();

    fireEvent.click(learningModes.getByRole('tab', { name: 'Quiz' }));
    expect(activeTopicPanel().getByText('Quiz mode')).toBeVisible();

    fireEvent.click(topLevelTabs().getByRole('tab', { name: 'Relative Motion' }));
    expect(activeTopicPanel().getByText('Explore mode')).toBeVisible();

    fireEvent.click(topLevelTabs().getByRole('tab', { name: 'Projectile Motion' }));
    expect(activeTopicPanel().getByText('Quiz mode')).toBeVisible();
  });

  it('preserves coordinate-system state while visiting another topic', () => {
    render(<App />);
    const preset = screen.getByLabelText('Coordinate preset');

    fireEvent.change(preset, { target: { value: '4' } });
    expect(preset).toHaveValue('4');

    fireEvent.click(topLevelTabs().getByRole('tab', { name: 'Motion Diagrams' }));
    fireEvent.click(topLevelTabs().getByRole('tab', { name: 'Coordinate Systems' }));

    expect(screen.getByLabelText('Coordinate preset')).toHaveValue('4');
    expect(screen.getByTestId('equation-y')).toHaveAttribute('aria-label', 'y(t) = 0 + 1/2 g t^2');
  });

  it('supports arrow-key navigation between top-level topics', () => {
    render(<App />);
    const coordinateSystems = topLevelTabs().getByRole('tab', { name: 'Coordinate Systems' });

    fireEvent.keyDown(coordinateSystems, { key: 'ArrowRight' });

    expect(topLevelTabs().getByRole('tab', { name: 'Projectile Motion' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(activeTopicPanel().getByText('Content coming soon.')).toBeVisible();
  });
});
