import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

const topics = () => within(screen.getByRole('tablist', { name: 'Physics topics' }));
const activePanel = () => within(screen.getByRole('tabpanel'));

describe('interactive physics topic modules', () => {
  beforeEach(() => window.localStorage.clear());

  it('updates projectile measurements and provides walkthrough progress', () => {
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: 'Projectile Motion' }));

    const speed = activePanel().getByLabelText('Launch speed');
    fireEvent.change(speed, { target: { value: '25' } });
    expect(speed).toHaveValue('25');
    expect(activePanel().getByRole('heading', { name: 'Live Components' })).toBeVisible();
    expect(activePanel().getByLabelText('Projectile Motion walkthrough progress')).toBeVisible();
  });

  it('supports motion presets and immediate quiz feedback', () => {
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: 'Motion Diagrams' }));
    fireEvent.click(activePanel().getByRole('button', { name: 'Reverse direction' }));
    expect(activePanel().getByRole('button', { name: /Start walkthrough/ })).toBeVisible();

    fireEvent.click(activePanel().getByRole('tab', { name: 'Quiz' }));
    fireEvent.click(activePanel().getByRole('button', { name: 'Speed is increasing' }));
    expect(activePanel().getByRole('status')).toHaveTextContent('Correct');
  });

  it('exposes reference-frame and circular-motion controls', () => {
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: 'Relative Motion' }));
    expect(activePanel().getByText('v⃗BG = v⃗BW + v⃗WG')).toBeVisible();

    fireEvent.click(topics().getByRole('tab', { name: 'Uniform Circular Motion' }));
    fireEvent.click(activePanel().getByRole('button', { name: 'Clockwise' }));
    expect(activePanel().getAllByText('Clockwise').length).toBeGreaterThan(0);
    expect(activePanel().getByLabelText('Uniform Circular Motion walkthrough progress')).toBeVisible();
  });
});
