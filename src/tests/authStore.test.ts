import { beforeEach, describe, expect, it } from 'vitest';
import { beginPinReset, digest, generateUuid, login, register, resetPin, verifyEmail } from '../auth/authStore';

describe('authentication identifiers', () => {
  beforeEach(() => localStorage.clear());

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
