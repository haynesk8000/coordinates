import { useEffect, useState } from 'react';
import { LogOut, Trophy } from 'lucide-react';
import { currentUser, logout, syncProgress, type User } from './auth/authStore';
import { AdministratorDashboard, InstructorAssignment, InstructorDashboard } from './components/AccountDashboards';
import { AuthScreen } from './components/AuthScreen';
import { CircularMotionModule } from './components/CircularMotionModule';
import { CoordinateSystemsModule } from './components/CoordinateSystemsModule';
import { MotionDiagramsModule } from './components/MotionDiagramsModule';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ProjectileMotionModule } from './components/ProjectileMotionModule';
import { RelativeMotionModule } from './components/RelativeMotionModule';
import {
  physicsTopics,
  topicPanelId,
  topicTabId,
  TopicSwitcher,
  type PhysicsTopic,
} from './components/TopicSwitcher';

function App() {
  const testUser: User = { id: 'test-admin', firstName: 'Test', lastName: 'Administrator', email: 'test@example.com', pinHash: '', role: 'administrator', verified: true, verificationToken: '', progress: {}, createdAt: '2026-01-01T00:00:00.000Z' };
  const [user, setUser] = useState<User | null>(() => import.meta.env.MODE === 'test' ? testUser : currentUser());
  const [topic, setTopic] = useState<PhysicsTopic>('coordinate-systems');
  const [showProgress, setShowProgress] = useState(false);
  const [accountView, setAccountView] = useState<'learning' | 'instructor' | 'administrator'>('learning');

  useEffect(() => {
    if (!user) return;
    const synchronize = () => syncProgress();
    window.addEventListener('storage', synchronize);
    const timer = window.setInterval(synchronize, 5000);
    return () => { window.removeEventListener('storage', synchronize); window.clearInterval(timer); };
  }, [user]);

  if (!user) return <AuthScreen onAuthenticated={setUser} />;
  if (user.role === 'student' && !user.instructorId) return <InstructorAssignment user={user} onAssigned={setUser} />;

  const renderModule = (topicId: PhysicsTopic) => {
    if (topicId === 'coordinate-systems') return <CoordinateSystemsModule />;
    if (topicId === 'projectile-motion') return <ProjectileMotionModule />;
    if (topicId === 'motion-diagrams') return <MotionDiagramsModule />;
    if (topicId === 'relative-motion') return <RelativeMotionModule />;
    return <CircularMotionModule />;
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">Interactive Physics</p>
          <h1>Physics Motion Lab</h1>
        </div>
        <div className="account-menu"><strong>{user.firstName} {user.lastName}</strong><span className="role-badge">{user.role}</span><button type="button" onClick={() => { logout(); setUser(null); }}><LogOut aria-hidden="true" size={17} /> Log out</button></div>
      </header>

      <nav className="account-tabs" aria-label="Application sections"><button className={accountView === 'learning' ? 'active' : ''} onClick={() => setAccountView('learning')}>Learning</button>{user.role !== 'student' && <button className={accountView === 'instructor' ? 'active' : ''} onClick={() => setAccountView('instructor')}>Instructor</button>}{user.role === 'administrator' && <button className={accountView === 'administrator' ? 'active' : ''} onClick={() => setAccountView('administrator')}>Administrator</button>}</nav>

      {accountView === 'instructor' && <InstructorDashboard user={user} />}
      {accountView === 'administrator' && <AdministratorDashboard current={user} />}
      {accountView === 'learning' && <>
      <button type="button" className="progress-toggle" aria-expanded={showProgress} onClick={() => setShowProgress((current) => !current)}><Trophy aria-hidden="true" size={18} /> {showProgress ? 'Hide my progress' : 'My progress'}</button>

      {showProgress && <ProgressDashboard />}

      <TopicSwitcher topic={topic} onChange={setTopic} />

      <main className="topic-panels">
        {physicsTopics.map((item) => (
          <section
            key={item.id}
            id={topicPanelId(item.id)}
            className="topic-panel"
            data-topic={item.id}
            role="tabpanel"
            aria-labelledby={topicTabId(item.id)}
            hidden={topic !== item.id}
          >
            {renderModule(item.id)}
          </section>
        ))}
      </main>
      </>}
    </div>
  );
}

export default App;
