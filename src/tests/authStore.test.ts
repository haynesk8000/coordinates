import { beforeEach, describe, expect, it } from 'vitest';
import { beginPinReset, currentUser, digest, generateUuid, listUsers, login, logout, register, resetPin, restoreAuthenticatedSession, syncProgress, verifyEmail } from '../auth/authStore';

describe('authentication identifiers', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('creates both the first and subsequent accounts as students without instructor assignments', async () => {
    for (const email of ['first@example.com', 'second@example.com']) {
      const { user, verificationToken } = await register('New', 'Learner', email, '1234');
      expect(user.role).toBe('student');
      expect(user.instructorId).toBeUndefined();
      expect(verifyEmail(verificationToken).role).toBe('student');
      await expect(login(email, '1234', false)).resolves.toMatchObject({ id: user.id, role: 'student' });
      logout();
    }
  });

  it.each(['student', 'instructor', 'administrator'] as const)(
    'normalizes a legacy %s account while preserving credentials, metadata, and progress',
    async (role) => {
      const progress = { 'coordinate-quiz-v1': JSON.stringify({ correct: 3, attempts: 4 }) };
      const legacy = {
        id: `legacy-${role}`, firstName: 'Legacy', lastName: 'Learner', email: `${role}@example.com`,
        pinHash: await digest('1234'), role, verified: true, verificationToken: '',
        instructorId: 'historical-instructor', pinResetToken: 'historical-reset-token',
        createdAt: '2025-01-02T03:04:05.000Z', progress,
      };
      const stored = JSON.stringify([legacy]);
      localStorage.setItem('physics-motion-lab-users-v1', stored);
      expect(listUsers()).toEqual([{ ...legacy, role: 'student' }]);
      expect(localStorage.getItem('physics-motion-lab-users-v1')).toBe(stored);

      expect(await login(legacy.email, '1234', true)).toEqual({ ...legacy, role: 'student' });
      expect(currentUser()).toEqual({ ...legacy, role: 'student' });
      expect(restoreAuthenticatedSession()).toEqual({ ...legacy, role: 'student' });
      expect(localStorage.getItem('coordinate-quiz-v1')).toBe(progress['coordinate-quiz-v1']);

      const newResult = JSON.stringify({ points: 20, attempts: 2 });
      localStorage.setItem('physics-motion-lab-game-results-v1', newResult);
      syncProgress();
      expect(JSON.parse(localStorage.getItem('physics-motion-lab-users-v1')!)).toEqual([
        { ...legacy, role: 'student', progress: { ...progress, 'physics-motion-lab-game-results-v1': newResult } },
      ]);
      logout();
      expect(currentUser()).toBeNull();
      expect(listUsers()[0].pinHash).toBe(legacy.pinHash);
    },
  );

  it('generates RFC 4122 version-4 UUIDs without crypto.randomUUID', () => {
    expect(generateUuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('registers a user with fallback-generated identifiers', async () => {
    const result = await register('Ada', 'Lovelace', 'ada@example.com', '1234');

    expect(result.user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.verificationToken).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.user.id).not.toBe(result.verificationToken);
  });

  it('produces a standard SHA-256 hash', async () => {
    expect(await digest('42')).toBe('73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049');
  });

  it('requires exactly four numeric PIN digits', async () => {
    await expect(register('Ada', 'Lovelace', 'ada@example.com', '12')).rejects.toThrow('exactly 4 numeric digits');
    await expect(register('Ada', 'Lovelace', 'ada@example.com', '12ab')).rejects.toThrow('exactly 4 numeric digits');
  });

  it('resets the PIN using a single-use reset token', async () => {
    const registered = await register('Ada', 'Lovelace', 'ada@example.com', '1234');
    verifyEmail(registered.verificationToken);
    const reset = beginPinReset('ada@example.com');
    await resetPin(reset.token, '5678');

    await expect(login('ada@example.com', '1234', false)).rejects.toThrow('Email or PIN is incorrect');
    await expect(login('ada@example.com', '5678', false)).resolves.toMatchObject({ email: 'ada@example.com' });
    await expect(resetPin(reset.token, '9999')).rejects.toThrow('invalid');
  });
});
