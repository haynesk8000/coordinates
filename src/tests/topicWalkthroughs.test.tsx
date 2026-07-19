import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

const topics = () => within(screen.getByRole('tablist', { name: 'Physics topics' }));
const activePanel = () => within(screen.getByRole('tabpanel'));

describe('Topic walkthroughs (replacing Discoveries)', () => {
  beforeEach(() => window.localStorage.clear());

  it('walks a student through concept, task, and check steps with live detection and retry', () => {
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: 'Motion Diagrams' }));
    fireEvent.click(activePanel().getByRole('button', { name: /Start walkthrough/ }));

    expect(activePanel().getByRole('heading', { name: 'Read Before You Calculate' })).toBeVisible();
    fireEvent.click(activePanel().getByRole('button', { name: /Next/ }));

    expect(activePanel().getByRole('heading', { name: 'Build Constant Velocity' })).toBeVisible();
    expect(activePanel().getByText('Task complete — nice work.')).toBeVisible();
    fireEvent.click(activePanel().getByRole('button', { name: /Next/ }));

    expect(activePanel().getByRole('heading', { name: 'Speed It Up' })).toBeVisible();
    expect(activePanel().getByRole('button', { name: /Next/ })).toBeDisabled();

    fireEvent.click(activePanel().getByRole('button', { name: 'Speeding up' }));
    expect(activePanel().getByText('Task complete — nice work.')).toBeVisible();
    fireEvent.click(activePanel().getByRole('button', { name: /Next/ }));

    expect(activePanel().getByRole('heading', { name: 'Check: Growing Gaps' })).toBeVisible();
    fireEvent.click(activePanel().getByRole('button', { name: 'The object is at rest' }));
    expect(activePanel().getByText('Not quite')).toBeVisible();
    expect(activePanel().getByRole('button', { name: /Next/ })).toBeDisabled();

    fireEvent.click(activePanel().getByRole('button', { name: 'Speed is increasing' }));
    expect(activePanel().getByText('Correct')).toBeVisible();
    expect(activePanel().getByRole('button', { name: /Next/ })).toBeEnabled();

    expect(activePanel().getByLabelText('Motion Diagrams walkthrough progress')).toBeVisible();
  });

  it('persists step progress across a reload', () => {
    const { unmount } = render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: 'Motion Diagrams' }));
    fireEvent.click(activePanel().getByRole('button', { name: /Start walkthrough/ }));
    fireEvent.click(activePanel().getByRole('button', { name: /Next/ }));
    expect(activePanel().getByText('2 of 8 steps complete (25%)').textContent).toBeDefined();

    unmount();
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: 'Motion Diagrams' }));
    expect(activePanel().getByRole('button', { name: /Continue walkthrough/ })).toBeVisible();
  });

  it.each([
    ['Projectile Motion'],
    ['Relative Motion'],
    ['Uniform Circular Motion'],
  ])('gives %s its own guided walkthrough in place of Discoveries', (topicName) => {
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: topicName }));

    expect(activePanel().getByRole('heading', { name: 'Walkthrough' })).toBeVisible();
    expect(activePanel().getByRole('button', { name: /Start walkthrough/ })).toBeVisible();
    expect(activePanel().queryByRole('heading', { name: 'Guided Challenges' })).not.toBeInTheDocument();
  });

  it.each([
    ['Projectile Motion'],
    ['Motion Diagrams'],
    ['Relative Motion'],
    ['Uniform Circular Motion'],
  ])('positions the walkthrough launcher above the interactive display on %s, matching Coordinate Systems', (topicName) => {
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: topicName }));

    const launcherHeading = activePanel().getByRole('heading', { name: 'Walkthrough' });
    const mainColumn = launcherHeading.closest('.topic-main-column');
    expect(mainColumn).not.toBeNull();
    const figure = mainColumn!.querySelector('.topic-simulation');
    expect(figure).not.toBeNull();

    const position = launcherHeading.compareDocumentPosition(figure!);
    expect(Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });

  it('marks the layout walkthrough-active while open so the simulation and feedback stay visible beside the popup', () => {
    render(<App />);
    fireEvent.click(topics().getByRole('tab', { name: 'Motion Diagrams' }));

    const launcherHeading = activePanel().getByRole('heading', { name: 'Walkthrough' });
    const layout = launcherHeading.closest('.topic-explore-layout');
    expect(layout).not.toBeNull();
    expect(layout).not.toHaveClass('walkthrough-active');

    fireEvent.click(activePanel().getByRole('button', { name: /Start walkthrough/ }));
    expect(layout).toHaveClass('walkthrough-active');
    expect(activePanel().getByRole('heading', { name: 'Motion Diagram Studio' })).toBeVisible();
    expect(activePanel().getByRole('img', { name: /Equal-time motion diagram/ })).toBeVisible();

    fireEvent.click(activePanel().getByRole('button', { name: 'Close walkthrough' }));
    expect(layout).not.toHaveClass('walkthrough-active');
  });
});
