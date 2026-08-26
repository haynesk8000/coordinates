import { fireEvent, render, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import App from '../App';

const TEST_USER = {
  id: 'test-admin', firstName: 'Test', lastName: 'Administrator', email: 'test@example.com', pinHash: '',
  role: 'administrator', verified: true, verificationToken: '', progress: {}, createdAt: '2026-01-01T00:00:00.000Z',
};

/** Enters through Welcome > Login, matching the production session flow. */
export const renderAuthenticatedApp = (): RenderResult => {
  localStorage.setItem('physics-motion-lab-users-v1', JSON.stringify([TEST_USER]));
  localStorage.setItem('physics-motion-lab-session-v1', TEST_USER.id);
  const result = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  return result;
};
