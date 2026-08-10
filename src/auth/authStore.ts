export type UserRole = 'student' | 'instructor' | 'administrator';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pinHash: string;
  role: UserRole;
  verified: boolean;
  verificationToken: string;
  pinResetToken?: string;
  instructorId?: string;
  progress: Record<string, string>;
  createdAt: string;
};

const USERS_KEY = 'physics-motion-lab-users-v1';
const SESSION_KEY = 'physics-motion-lab-session-v1';
const PROGRESS_PREFIXES = ['coordinate-', 'physics-motion-lab-'];

const readUsers = (): User[] => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as User[]; }
  catch { return []; }
};

const writeUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
export const listUsers = () => readUsers();
export const sortPeople = <T extends Pick<User, 'lastName' | 'firstName'>>(people: T[]) =>
  [...people].sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));

// crypto.randomUUID() is unavailable in some browsers when the app is served
// outside a secure context. Generate an RFC 4122 version-4 UUID locally so
// account creation also works on classroom LAN and plain-HTTP deployments.
export const generateUuid = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomNibble = Math.floor(Math.random() * 16);
    const value = character === 'x' ? randomNibble : (randomNibble & 0x3) | 0x8;
    return value.toString(16);
  });

const fallbackSha256 = (value: string): string => {
  const rightRotate = (word: number, amount: number) => (word >>> amount) | (word << (32 - amount));
  const maxWord = 2 ** 32;
  const words: number[] = [];
  const constants: number[] = [];
  const initialHash: number[] = [];
  let primeCandidate = 2;

  while (constants.length < 64) {
    let isPrime = true;
    for (let factor = 2; factor * factor <= primeCandidate; factor += 1) {
      if (primeCandidate % factor === 0) { isPrime = false; break; }
    }
    if (isPrime) {
      if (initialHash.length < 8) initialHash.push((Math.sqrt(primeCandidate) * maxWord) | 0);
      constants.push((Math.cbrt(primeCandidate) * maxWord) | 0);
    }
    primeCandidate += 1;
  }

  const encoded = unescape(encodeURIComponent(value));
  const bitLength = encoded.length * 8;
  let binary = `${encoded}\x80`;
  while (binary.length % 64 !== 56) binary += '\x00';
  for (let index = 0; index < binary.length; index += 1) {
    words[index >> 2] |= binary.charCodeAt(index) << ((3 - index) % 4) * 8;
  }
  words.push(Math.floor(bitLength / maxWord), bitLength);

  const hash = [...initialHash];
  for (let block = 0; block < words.length; block += 16) {
    const schedule = words.slice(block, block + 16);
    const state = [...hash];
    for (let index = 0; index < 64; index += 1) {
      const w15 = schedule[index - 15];
      const w2 = schedule[index - 2];
      if (index >= 16) {
        const sigma0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const sigma1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        schedule[index] = (schedule[index - 16] + sigma0 + schedule[index - 7] + sigma1) | 0;
      }
      const [a, b, c, d, e, f, g, h] = state;
      const sum1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const choice = (e & f) ^ (~e & g);
      const first = (h + sum1 + choice + constants[index] + schedule[index]) | 0;
      const sum0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const second = (sum0 + majority) | 0;
      state.unshift((first + second) | 0);
      state[4] = (state[4] + first) | 0;
      state.pop();
    }
    for (let index = 0; index < 8; index += 1) hash[index] = (hash[index] + state[index]) | 0;
  }

  return hash.map((word) => (word >>> 0).toString(16).padStart(8, '0')).join('');
};

export const digest = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  if (globalThis.crypto?.subtle) {
    const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return fallbackSha256(value);
};

const validatePin = (pin: string) => {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must contain exactly 4 numeric digits.');
};
export const currentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!session) return null;
  const user = readUsers().find((item) => item.id === session && item.verified);
  return user ?? null;
};

export async function register(firstName: string, lastName: string, email: string, pin: string) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) throw new Error('An account already uses that email.');
  validatePin(pin);
  const user: User = {
    id: generateUuid(), firstName: firstName.trim(), lastName: lastName.trim(), email: normalizedEmail,
    pinHash: await digest(pin), role: users.length === 0 ? 'administrator' : 'student', verified: false,
    verificationToken: generateUuid(), progress: {}, createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return { user, verificationToken: user.verificationToken };
}

export function verifyEmail(token: string) {
  const users = readUsers();
  const user = users.find((item) => item.verificationToken === token);
  if (!user) throw new Error('That verification link is invalid.');
  user.verified = true;
  user.verificationToken = '';
  writeUsers(users);
  return user;
}

export async function login(email: string, pin: string, remember: boolean) {
  validatePin(pin);
  const user = readUsers().find((item) => item.email === email.trim().toLowerCase());
  if (!user || user.pinHash !== await digest(pin)) throw new Error('Email or PIN is incorrect.');
  if (!user.verified) throw new Error('Verify your email before logging in.');
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, user.id);
  restoreProgress(user);
  return user;
}

export const logout = () => { syncProgress(); localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); };

export function beginPinReset(email: string) {
  const users = readUsers();
  const user = users.find((item) => item.email === email.trim().toLowerCase());
  if (!user) throw new Error('No account was found for that email.');
  user.pinResetToken = generateUuid();
  writeUsers(users);
  return { email: user.email, token: user.pinResetToken };
}

export async function resetPin(token: string, pin: string) {
  validatePin(pin);
  const users = readUsers();
  const user = users.find((item) => item.pinResetToken === token);
  if (!user) throw new Error('That PIN reset link is invalid.');
  user.pinHash = await digest(pin);
  delete user.pinResetToken;
  writeUsers(users);
  return user;
}

export function updateInstructor(instructorId: string) {
  const actor = currentUser();
  const users = readUsers();
  const user = users.find((item) => item.id === actor?.id);
  const instructor = users.find((item) => item.id === instructorId && item.verified && item.role !== 'student');
  if (!user || user.role !== 'student' || !instructor) throw new Error('Invalid instructor selection.');
  user.instructorId = instructor.id; writeUsers(users); return user;
}

export function changeRole(userId: string, role: UserRole) {
  const actor = currentUser();
  if (actor?.role !== 'administrator') throw new Error('Administrator permission required.');
  if (actor.id === userId && role !== 'administrator') throw new Error('You cannot demote yourself.');
  const users = readUsers(); const target = users.find((user) => user.id === userId);
  if (!target) throw new Error('User not found.');
  if (target.role === 'administrator' && role !== 'administrator' && users.filter((u) => u.role === 'administrator').length === 1) throw new Error('At least one administrator is required.');
  target.role = role; if (role !== 'student') delete target.instructorId; writeUsers(users);
}

export function deleteUser(userId: string) {
  const actor = currentUser(); const users = readUsers();
  if (actor?.role !== 'administrator') throw new Error('Administrator permission required.');
  if (actor.id === userId) throw new Error('You cannot delete yourself.');
  const target = users.find((user) => user.id === userId);
  if (target?.role === 'administrator' && users.filter((u) => u.role === 'administrator').length === 1) throw new Error('At least one administrator is required.');
  writeUsers(users.filter((user) => user.id !== userId).map((user) => user.instructorId === userId ? { ...user, instructorId: undefined } : user));
}

export function resetStudents() {
  if (currentUser()?.role !== 'administrator') throw new Error('Administrator permission required.');
  writeUsers(readUsers().filter((user) => user.role !== 'student'));
}

export function syncProgress() {
  const actor = currentUser(); if (!actor) return;
  const users = readUsers(); const user = users.find((item) => item.id === actor.id); if (!user) return;
  const progress: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index); if (key && PROGRESS_PREFIXES.some((prefix) => key.startsWith(prefix)) && key !== USERS_KEY && key !== SESSION_KEY) progress[key] = localStorage.getItem(key)!;
  }
  user.progress = progress; writeUsers(users);
}

function restoreProgress(user: User) { Object.entries(user.progress).forEach(([key, value]) => localStorage.setItem(key, value)); }
