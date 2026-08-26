import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthScreen } from '../components/AuthScreen';
import { login, register, verifyEmail } from '../auth/authStore';

describe('welcome and session login flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('always starts at Welcome and shows an image from Welcome_images', () => {
    render(<AuthScreen onAuthenticated={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Physics Motion Lab' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Register' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Login' })).toBeVisible();
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('/Welcome_images/'));
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument();
  });

  it('opens the login form when no valid session exists', () => {
    render(<AuthScreen onAuthenticated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect(screen.getByLabelText('Email address')).toBeVisible();
    expect(screen.getByLabelText('4-digit PIN')).toBeVisible();
  });

  it('resumes a valid saved session after Login is chosen', async () => {
    const registered = await register('Ada', 'Lovelace', 'ada@example.com', '1234');
    verifyEmail(registered.verificationToken);
    const user = await login('ada@example.com', '1234', true);
    const onAuthenticated = vi.fn();
    render(<AuthScreen onAuthenticated={onAuthenticated} />);

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(onAuthenticated).toHaveBeenCalledWith(expect.objectContaining({ id: user.id, role: 'administrator' }));
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument();
  });
});
