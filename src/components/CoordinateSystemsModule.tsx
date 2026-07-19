import { useMemo, useState } from 'react';
import { Compass, FlaskConical, Gamepad2, GraduationCap } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { createPresets } from '../physics/presets';
import { defaultParameters } from '../physics/projectile';
import { ExplainMode } from './ExplainMode';
import { ExploreMode } from './ExploreMode';
import { FunZoneMode } from './FunZoneMode';
import { ModeSwitcher, type Mode } from './ModeSwitcher';
import { QuizMode } from './QuizMode';

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
  fun: {
    icon: Gamepad2,
    copy:
      'Put your coordinate skills into play. Choose a game, chase a high score, and try a fresh randomized challenge whenever you are ready.',
  },
};

export function CoordinateSystemsModule() {
  const [mode, setMode] = useState<Mode>('explore');
  const params = defaultParameters;
  const presets = useMemo(() => createPresets(params), [params]);
  const [selectedPresetId, setSelectedPresetId] = useState('1');
  const [isPresetModified, setIsPresetModified] = useState(false);
  const [system, setSystem] = useState<CoordinateSystem>(presets[0]);
  const [time, setTime] = useState(0);

  const activeMeta = modeMeta[mode];
  const Icon = activeMeta.icon;

  const cloneSystem = (nextSystem: CoordinateSystem): CoordinateSystem => ({
    ...nextSystem,
    originWorld: { ...nextSystem.originWorld },
    axis1: { ...nextSystem.axis1 },
    axis2: { ...nextSystem.axis2 },
  });

  const applyPreset = (presetId: string) => {
    const nextPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
    setSelectedPresetId(presetId);
    setIsPresetModified(false);
    setSystem(cloneSystem(nextPreset));
  };

  const updateSystem = (nextSystem: CoordinateSystem) => {
    setIsPresetModified(true);
    setSystem(nextSystem);
  };

  return (
    <>
      <header className="topbar module-header">
        <div>
          <p className="eyebrow">Projectile Coordinate Systems</p>
          <h2 className="module-title">Coordinate Kinematics Lab</h2>
        </div>
        <ModeSwitcher mode={mode} onChange={setMode} includeFunZone />
      </header>

      <section className="intro-band" aria-live="polite">
        <Icon aria-hidden="true" size={22} />
        <p>
          A projectile follows one path, but that path can be described by many different coordinate systems.{' '}
          <strong>The physics stays the same; the description changes.</strong>
        </p>
      </section>

      <div className="module-content">
        <p className="mode-copy">{activeMeta.copy}</p>
        {mode === 'explore' && (
          <ExploreMode
            params={params}
            presets={presets}
            selectedPresetId={selectedPresetId}
            isPresetModified={isPresetModified}
            onPresetChange={applyPreset}
            system={system}
            onSystemChange={updateSystem}
            time={time}
            onTimeChange={setTime}
          />
        )}
        {mode === 'explain' && <ExplainMode params={params} system={system} />}
        {mode === 'quiz' && <QuizMode params={params} onReviewExplain={() => setMode('explain')} onTryWalkthrough={() => setMode('explore')} />}
        {mode === 'fun' && <FunZoneMode />}
      </div>
    </>
  );
}
