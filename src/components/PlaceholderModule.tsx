import { useState } from 'react';
import { ModeSwitcher, type Mode } from './ModeSwitcher';

type Props = {
  title: string;
};

const modeLabels: Record<Mode, string> = {
  explore: 'Explore',
  explain: 'Explain',
  quiz: 'Quiz',
  fun: 'Fun Zone',
};

export function PlaceholderModule({ title }: Props) {
  const [mode, setMode] = useState<Mode>('explore');

  return (
    <>
      <header className="topbar module-header">
        <div>
          <p className="eyebrow">Physics Learning Module</p>
          <h2 className="module-title">{title}</h2>
        </div>
        <ModeSwitcher mode={mode} onChange={setMode} />
      </header>

      <section className="panel placeholder-panel" aria-live="polite">
        <p className="eyebrow">{modeLabels[mode]} mode</p>
        <h3>{title}</h3>
        <p>Content coming soon.</p>
      </section>
    </>
  );
}
