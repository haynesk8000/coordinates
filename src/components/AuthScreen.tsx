import { useState, type FormEvent } from 'react';
import { beginPinReset, login, register, resetPin, verifyEmail, type User } from '../auth/authStore';
import labLogo from '../../Lab_Logo.png';

type View = 'welcome' | 'login' | 'register' | 'verify' | 'reset-request' | 'reset';
type PendingLink = { token: string; email: string };

const readMatchingPin = (data: FormData) => {
  const pin = String(data.get('pin') ?? '');
  const confirmation = String(data.get('confirmPin') ?? '');
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must contain exactly 4 numeric digits.');
  if (pin !== confirmation) throw new Error('PIN confirmation does not match.');
  return pin;
};

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [view, setView] = useState<View>('welcome');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingLink, setPendingLink] = useState<PendingLink | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    try {
      if (view === 'register') {
        const first = String(data.get('firstName') ?? '').trim();
        const last = String(data.get('lastName') ?? '').trim();
        const email = String(data.get('email') ?? '');
        if (!first || !last || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter your name and a valid email address.');
        const result = await register(first, last, email, readMatchingPin(data));
        setPendingLink({ token: result.verificationToken, email: result.user.email }); setView('verify');
      } else if (view === 'login') {
        onAuthenticated(await login(String(data.get('email')), String(data.get('pin')), data.get('remember') === 'on'));
      } else if (view === 'reset-request') {
        setPendingLink(beginPinReset(String(data.get('email') ?? ''))); setView('reset');
      } else if (view === 'reset' && pendingLink) {
        await resetPin(pendingLink.token, readMatchingPin(data));
        setMessage('Your PIN was reset. You can now log in.'); setPendingLink(null); setView('login');
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); }
  };

  if (view === 'welcome') return <main className="auth-page"><section className="auth-card"><img className="auth-logo" src={labLogo} alt="Physics Motion Lab" /><p className="eyebrow">Interactive Physics</p><h1>Physics Motion Lab</h1><p>A projectile follows one path, but that path can be described by many different coordinate systems. Sign in to learn and keep your progress synchronized.</p><div className="auth-actions"><button className="primary" onClick={() => setView('register')}>Register</button><button onClick={() => setView('login')}>Login</button></div></section></main>;

  if (view === 'verify' && pendingLink) return <main className="auth-page"><section className="auth-card"><h1>Verify your email</h1><p>A verification message for <strong>{pendingLink.email}</strong> is ready. In this local development build, use the preview below.</p><div className="email-preview"><p>Welcome to Physics Motion Lab! Confirm your email address to activate your account.</p><button className="primary" onClick={() => { verifyEmail(pendingLink.token); setPendingLink(null); setMessage('Email verified. You can now log in.'); setView('login'); }}>Verify Email</button></div></section></main>;

  const isRegister = view === 'register';
  const isReset = view === 'reset';
  const title = isRegister ? 'Create your account' : view === 'reset-request' ? 'Reset your PIN' : isReset ? 'Create a new PIN' : 'Welcome back';

  return <main className="auth-page"><section className="auth-card"><button className="text-button" onClick={() => { setView(view === 'reset' ? 'reset-request' : 'welcome'); setError(''); }}>← Back</button>{view === 'login' && <img className="auth-logo" src={labLogo} alt="Physics Motion Lab" />}<h1>{title}</h1>{isReset && pendingLink && <p>A PIN reset link for <strong>{pendingLink.email}</strong> is ready. In this local development build, create the new PIN below.</p>}{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}<form onSubmit={submit}>{isRegister && <><label>First name<input name="firstName" required autoComplete="given-name" /></label><label>Last name<input name="lastName" required autoComplete="family-name" /></label></>}{!isReset && <label>Email address<input name="email" type="email" required autoComplete="email" /></label>}{(isRegister || isReset) && <><label>{isReset ? 'New 4-digit PIN' : 'Create 4-digit PIN'}<input name="pin" required type="password" inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} autoComplete="new-password" /></label><label>Confirm 4-digit PIN<input name="confirmPin" required type="password" inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} autoComplete="new-password" /></label></>}{view === 'login' && <><label>4-digit PIN<input name="pin" required type="password" inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} autoComplete="current-password" /></label><label className="check-row"><input name="remember" type="checkbox" /> Remember me</label></>}<button className="primary" type="submit">{isRegister ? 'Register' : view === 'reset-request' ? 'Send reset link' : isReset ? 'Save new PIN' : 'Login'}</button></form>{view === 'login' && <button className="text-button" onClick={() => { setError(''); setMessage(''); setView('reset-request'); }}>Forgot PIN?</button>}</section></main>;
}
