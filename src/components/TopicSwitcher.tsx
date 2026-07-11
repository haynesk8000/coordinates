import { useRef, type KeyboardEvent } from 'react';

export const physicsTopics = [
  { id: 'coordinate-systems', label: 'Coordinate Systems' },
  { id: 'projectile-motion', label: 'Projectile Motion' },
  { id: 'motion-diagrams', label: 'Motion Diagrams' },
  { id: 'relative-motion', label: 'Relative Motion' },
  { id: 'uniform-circular-motion', label: 'Uniform Circular Motion' },
] as const;

export type PhysicsTopic = (typeof physicsTopics)[number]['id'];

type Props = {
  topic: PhysicsTopic;
  onChange: (topic: PhysicsTopic) => void;
};

export const topicTabId = (topic: PhysicsTopic) => `topic-tab-${topic}`;

export const topicPanelId = (topic: PhysicsTopic) => `topic-panel-${topic}`;

export function TopicSwitcher({ topic, onChange }: Props) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % physicsTopics.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + physicsTopics.length) % physicsTopics.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = physicsTopics.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextTopic = physicsTopics[nextIndex];
    onChange(nextTopic.id);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="topic-switcher" role="tablist" aria-label="Physics topics">
      {physicsTopics.map((item, index) => (
        <button
          key={item.id}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          id={topicTabId(item.id)}
          type="button"
          role="tab"
          aria-controls={topicPanelId(item.id)}
          aria-selected={topic === item.id}
          tabIndex={topic === item.id ? 0 : -1}
          className={topic === item.id ? 'active' : ''}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
