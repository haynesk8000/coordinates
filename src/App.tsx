import { useState } from 'react';
import { CircularMotionModule } from './components/CircularMotionModule';
import { CoordinateSystemsModule } from './components/CoordinateSystemsModule';
import { MotionDiagramsModule } from './components/MotionDiagramsModule';
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
        <p className="eyebrow">Interactive Physics</p>
        <h1>Physics Motion Lab</h1>
      </header>

      <TopicSwitcher topic={topic} onChange={setTopic} />

      <main className="topic-panels">
        {physicsTopics.map((item) => (
          <section
            key={item.id}
            id={topicPanelId(item.id)}
            className="topic-panel"
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
