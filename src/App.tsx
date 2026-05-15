import { useMemo, useState } from 'react';
import { Compass, FlaskConical, GraduationCap } from 'lucide-react';
import { createPresets } from './physics/presets';
import { defaultParameters } from './physics/projectile';
import type { CoordinateSystem } from './physics/coordinateSystem';
import { ModeSwitcher, type Mode } from './components/ModeSwitcher';
import { ExploreMode } from './components/ExploreMode';
import { ExplainMode } from './components/ExplainMode';
import { QuizMode } from './components/QuizMode';

const modeMeta: Record<Mode, { icon: typeof Compass; copy: string }> = {
  explore: {
    icon: Compass,
    copy:
      'Move the coordinate system and watch the equations update. Pay attention to what changes and what does not. Moving the origin changes the initial coordinates. Flipping an axis changes signs. Relabeling an axis changes the symbols.',
  },
  explain: {
    icon: GraduationCap,
    copy:
      'To write the equation correctly, do not start by memorizing signs. Start by asking: Where is the origin? Which way is positive? What direction is the velocity? What direction is gravity?',
  },
  quiz: {
    icon: FlaskConical,
    copy:
      'Choose the correct equation by reasoning from the coordinate system. Look at the origin, the axis directions, the launch velocity, and gravity.',
  },
};

function App() {
  const [mode, setMode] = useState<Mode>('explore');
  const params = defaultParameters;
  const presets = useMemo(() => createPresets(params), [params]);
  const [selectedPresetId, setSelectedPresetId] = useState('1');
  const [system, setSystem] = useState<CoordinateSystem>(presets[0]);
  const [time, setTime] = useState(0);

  const activeMeta = modeMeta[mode];
  const Icon = activeMeta.icon;

  const selectPreset = (presetId: string) => {
    const nextPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
    setSelectedPresetId(presetId);
    setSystem(nextPreset);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Projectile Coordinate Systems</p>
          <h1>Coordinate Kinematics Lab</h1>
        </div>
        <ModeSwitcher mode={mode} onChange={setMode} />
      </header>

      <section className="intro-band" aria-live="polite">
        <Icon aria-hidden="true" size={22} />
        <p>
          A projectile follows one path, but that path can be described by many different coordinate systems.{' '}
          <strong>The physics stays the same; the description changes.</strong>
        </p>
      </section>

      <main>
        <p className="mode-copy">{activeMeta.copy}</p>
        {mode === 'explore' && (
          <ExploreMode
            params={params}
            presets={presets}
            selectedPresetId={selectedPresetId}
            onPresetChange={selectPreset}
            system={system}
            onSystemChange={setSystem}
            time={time}
            onTimeChange={setTime}
          />
        )}
        {mode === 'explain' && <ExplainMode params={params} system={system} />}
        {mode === 'quiz' && <QuizMode params={params} onReviewExplain={() => setMode('explain')} />}
      </main>
    </div>
  );
}

export default App;
