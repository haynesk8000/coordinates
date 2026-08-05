import { useMemo, useState } from 'react';
import { changeRole, deleteUser, listUsers, resetStudents, sortPeople, updateInstructor, type User, type UserRole } from '../auth/authStore';

const progressSummary = (progress: Record<string, string>) => {
  let attempts = 0, correct = 0;
  Object.values(progress).forEach((raw) => { try { const value = JSON.parse(raw); if (typeof value.attempts === 'number') attempts += value.attempts; if (typeof value.correct === 'number') correct += value.correct; } catch { /* ignore non-score entries */ } });
  return { attempts, correct, records: Object.keys(progress).length };
};

export function InstructorAssignment({ user, onAssigned }: { user: User; onAssigned: (user: User) => void }) {
  const instructors = sortPeople(listUsers().filter((item) => item.verified && item.role !== 'student'));
  return <main className="auth-page"><section className="auth-card"><h1>Choose your instructor</h1><p>Your activities unlock after you select the instructor who will review your progress.</p>{instructors.length ? <form onSubmit={(event) => { event.preventDefault(); onAssigned(updateInstructor(String(new FormData(event.currentTarget).get('instructor')))); }}><label>Instructor<select name="instructor" required defaultValue=""><option value="" disabled>Select an instructor</option>{instructors.map((item) => <option key={item.id} value={item.id}>{item.lastName}, {item.firstName}</option>)}</select></label><button className="primary">Continue</button></form> : <p className="error">No verified instructors are available. Ask an administrator to promote an instructor.</p>}</section></main>;
}

export function InstructorDashboard({ user }: { user: User }) {
  const [selected, setSelected] = useState(user.id);
  const users = listUsers(); const instructors = sortPeople(users.filter((item) => item.role !== 'student'));
  const ownerId = user.role === 'administrator' ? selected : user.id;
  const students = sortPeople(users.filter((item) => item.role === 'student' && item.instructorId === ownerId));
  return <section className="panel account-panel"><h2>Instructor Dashboard</h2>{user.role === 'administrator' && <label>View instructor<select value={selected} onChange={(event) => setSelected(event.target.value)}>{instructors.map((item) => <option key={item.id} value={item.id}>{item.lastName}, {item.firstName}</option>)}</select></label>}<p>{students.length} assigned student{students.length === 1 ? '' : 's'}</p><div className="user-list">{students.map((student) => { const score = progressSummary(student.progress); return <article key={student.id}><h3>{student.lastName}, {student.firstName}</h3><p>{score.correct} correct · {score.attempts} attempts · {score.records} saved activities</p></article>; })}{!students.length && <p>No students are currently assigned.</p>}</div></section>;
}

export function AdministratorDashboard({ current }: { current: User }) {
  const [version, setVersion] = useState(0); const [notice, setNotice] = useState('');
  const users = useMemo(() => listUsers(), [version]);
  const mutate = (work: () => void) => { try { work(); setNotice('Changes saved.'); setVersion((value) => value + 1); } catch (reason) { setNotice((reason as Error).message); } };
  const groups: Array<[UserRole, string]> = [['administrator', 'Administrators'], ['instructor', 'Instructors'], ['student', 'Students']];
  return <section className="panel account-panel"><h2>Administrator Dashboard</h2>{notice && <p role="status">{notice}</p>}{groups.map(([role, title]) => <div key={role}><h3>{title}</h3><div className="user-list">{sortPeople(users.filter((item) => item.role === role)).map((item) => <article key={item.id}><div><strong>{item.lastName}, {item.firstName}</strong><small>{item.email}</small></div><div className="user-actions"><label><span className="sr-only">Role for {item.firstName} {item.lastName}</span><select value={item.role} disabled={item.id === current.id} onChange={(event) => mutate(() => changeRole(item.id, event.target.value as UserRole))}><option value="student">Student</option><option value="instructor">Instructor</option><option value="administrator">Administrator</option></select></label><button disabled={item.id === current.id} onClick={() => confirm(`Delete ${item.firstName} ${item.lastName}?`) && mutate(() => deleteUser(item.id))}>Delete</button></div></article>)}{!users.some((item) => item.role === role) && <p>None</p>}</div></div>)}<div className="danger-zone"><h3>Reset application</h3><p>Deletes all student accounts and student progress while preserving instructor and administrator accounts.</p><button onClick={() => confirm('Delete every student and all student progress? This cannot be undone.') && mutate(resetStudents)}>Reset Application</button></div></section>;
}
