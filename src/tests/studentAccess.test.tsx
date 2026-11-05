import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

describe('student-only learning access', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it.each(['student', 'instructor', 'administrator'] as const)(
    'resumes a legacy %s session without instructor onboarding or role labels',
    (role) => {
      const user = {
        id: 'legacy-user', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com',
        pinHash: 'preserved', role, verified: true, verificationToken: '',
        progress: {}, createdAt: '2025-01-01T00:00:00.000Z',
      };
      localStorage.setItem('physics-motion-lab-users-v1', JSON.stringify([user]));
      sessionStorage.setItem('physics-motion-lab-session-v1', user.id);
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      const header = within(screen.getByText('Ada Lovelace').closest('header')!);
      expect(header.getByText('Ada Lovelace')).toBeVisible();
      expect(header.queryByText(/^(student|instructor|administrator)$/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox', { name: /instructor/i })).not.toBeInTheDocument();
      const topics = within(screen.getByRole('tablist', { name: 'Physics topics' }));
      expect(topics.getAllByRole('tab')).toHaveLength(5);
      expect(screen.getByLabelText('Coordinate preset')).toBeVisible();
      fireEvent.click(topics.getByRole('tab', { name: 'Projectile Motion' }));
      const panel = within(screen.getByRole('tabpanel', { name: 'Projectile Motion' }));
      const modes = within(panel.getByRole('tablist', { name: 'Learning mode' }));
      fireEvent.click(modes.getByRole('tab', { name: 'Quiz' }));
      expect(panel.getByText(/Question 1 of 5/)).toBeVisible();
      expect(screen.getByRole('button', { name: 'My progress' })).toBeVisible();
      fireEvent.click(header.getByRole('button', { name: 'Log out' }));
      expect(screen.getByRole('button', { name: 'Login' })).toBeVisible();
      expect(sessionStorage.getItem('physics-motion-lab-session-v1')).toBeNull();
    },
  );
});
