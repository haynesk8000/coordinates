import { useState } from 'react';
import { CoordinateSystemsModule } from './components/CoordinateSystemsModule';
import { PlaceholderModule } from './components/PlaceholderModule';
import {
  physicsTopics,
  topicPanelId,
  topicTabId,
  TopicSwitcher,
  type PhysicsTopic,
} from './components/TopicSwitcher';

function App() {
  const [topic, setTopic] = useState<PhysicsTopic>('coordinate-systems');

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
            {item.id === 'coordinate-systems' ? (
              <CoordinateSystemsModule />
            ) : (
              <PlaceholderModule title={item.label} />
            )}
          </section>
        ))}
      </main>
    </div>
  );
}

export default App;
