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

const digest = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const randomValue = () => crypto.getRandomValues(new Uint32Array(1))[0];
export const currentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!session) return null;
  const user = readUsers().find((item) => item.id === session && item.verified);
  return user ?? null;
};

export async function register(firstName: string, lastName: string, email: string) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) throw new Error('An account already uses that email.');
  const pin = String(randomValue() % 100).padStart(2, '0');
  const user: User = {
    id: crypto.randomUUID(), firstName: firstName.trim(), lastName: lastName.trim(), email: normalizedEmail,
    pinHash: await digest(pin), role: users.length === 0 ? 'administrator' : 'student', verified: false,
    verificationToken: crypto.randomUUID(), progress: {}, createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return { user, pin, verificationToken: user.verificationToken };
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
  const user = readUsers().find((item) => item.email === email.trim().toLowerCase());
  if (!user || user.pinHash !== await digest(pin)) throw new Error('Email or PIN is incorrect.');
  if (!user.verified) throw new Error('Verify your email before logging in.');
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, user.id);
  restoreProgress(user);
  return user;
}

export const logout = () => { syncProgress(); localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); };

export function recoverPin(email: string) {
  const exists = readUsers().some((user) => user.email === email.trim().toLowerCase());
  if (!exists) throw new Error('No account was found for that email.');
  return 'If this address is registered, its PIN has been sent.';
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
