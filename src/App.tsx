import { useState } from 'react';
import { Trophy } from 'lucide-react';
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
  const [topic, setTopic] = useState<PhysicsTopic>('coordinate-systems');
  const [showProgress, setShowProgress] = useState(false);

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
        <button type="button" className="progress-toggle" aria-expanded={showProgress} onClick={() => setShowProgress((current) => !current)}>
          <Trophy aria-hidden="true" size={18} /> {showProgress ? 'Hide my progress' : 'My progress'}
        </button>
      </header>

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
    </div>
  );
}

export default App;
