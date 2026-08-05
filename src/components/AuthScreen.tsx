import { useState, type FormEvent } from 'react';
import { login, recoverPin, register, verifyEmail, type User } from '../auth/authStore';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [view, setView] = useState<'welcome' | 'login' | 'register' | 'verify'>('welcome');
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [verification, setVerification] = useState<{ token: string; pin: string; email: string } | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); const data = new FormData(event.currentTarget);
    try {
      if (view === 'register') {
        const first = String(data.get('firstName') ?? '').trim(), last = String(data.get('lastName') ?? '').trim(), email = String(data.get('email') ?? '');
        if (!first || !last || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter your name and a valid email address.');
        const result = await register(first, last, email); setVerification({ token: result.verificationToken, pin: result.pin, email: result.user.email }); setView('verify');
      } else {
        const user = await login(String(data.get('email')), String(data.get('pin')), data.get('remember') === 'on'); onAuthenticated(user);
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went wrong.'); }
  };
  if (view === 'welcome') return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Interactive Physics</p><h1>Physics Motion Lab</h1><p>A projectile follows one path, but that path can be described by many different coordinate systems. Sign in to learn and keep your progress synchronized.</p><div className="auth-actions"><button className="primary" onClick={() => setView('register')}>Register</button><button onClick={() => setView('login')}>Login</button></div></section></main>;
  if (view === 'verify' && verification) return <main className="auth-page"><section className="auth-card"><h1>Verify your email</h1><p>A verification message for <strong>{verification.email}</strong> is ready. In this local development build, use the preview below.</p><div className="email-preview"><p>Welcome to Physics Motion Lab!</p><p>Your login PIN is <strong className="pin-preview">{verification.pin}</strong>.</p><button className="primary" onClick={() => { verifyEmail(verification.token); setMessage('Email verified. You can now log in.'); setView('login'); }}>Verify Email</button></div></section></main>;
  return <main className="auth-page"><section className="auth-card"><button className="text-button" onClick={() => { setView('welcome'); setError(''); }}>← Back</button><h1>{view === 'register' ? 'Create your account' : 'Welcome back'}</h1>{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}<form onSubmit={submit}>{view === 'register' && <><label>First name<input name="firstName" required autoComplete="given-name" /></label><label>Last name<input name="lastName" required autoComplete="family-name" /></label></>}<label>Email address<input name="email" type="email" required autoComplete="email" /></label>{view === 'login' && <><label>2-digit PIN<input name="pin" required inputMode="numeric" pattern="[0-9]{2}" maxLength={2} autoComplete="current-password" /></label><label className="check-row"><input name="remember" type="checkbox" /> Remember me</label></>}<button className="primary" type="submit">{view === 'register' ? 'Register' : 'Login'}</button></form>{view === 'login' && <button className="text-button" onClick={() => { const email = prompt('Enter your registered email address:'); if (!email) return; try { setMessage(recoverPin(email)); setError(''); } catch (reason) { setError((reason as Error).message); } }}>Forgot PIN?</button>}</section></main>;
}
