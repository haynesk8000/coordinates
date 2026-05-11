import { useMemo, useState } from 'react';
import { FlipHorizontal, FlipVertical, RotateCcw, Shuffle, Tag } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { flipAxis, setLabels, swapCoordinateVariables } from '../physics/coordinateSystem';
import type { CoordinatePreset } from '../physics/presets';
import type { ProjectileParameters } from '../physics/projectile';
import { perpendicularLeft, scale, vector } from '../physics/vectors';
import { SceneCanvas } from './SceneCanvas';
import { EquationPanel } from './EquationPanel';
import { ComponentBreakdown } from './ComponentBreakdown';
import { ParameterControls } from './ParameterControls';
import { TimeSlider } from './TimeSlider';

type Props = {
  params: ProjectileParameters;
  onParamsChange: (params: ProjectileParameters) => void;
  presets: CoordinatePreset[];
  selectedPresetId: string;
  onPresetChange: (presetId: string) => void;
  system: CoordinateSystem;
  onSystemChange: (system: CoordinateSystem) => void;
  time: number;
  onTimeChange: (time: number) => void;
};

const labelSets = {
  xy: ['x', 'y'],
  ab: ['a', 'b'],
  rs: ['r', 's'],
};

const angleOf = (system: CoordinateSystem) => Math.round((Math.atan2(system.axis1.y, system.axis1.x) * 180) / Math.PI);

function rotateTo(system: CoordinateSystem, degrees: number): CoordinateSystem {
  const radians = (degrees * Math.PI) / 180;
  const axis1 = vector(Math.cos(radians), Math.sin(radians));
  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;
  const axis2 = cross >= 0 ? perpendicularLeft(axis1) : scale(perpendicularLeft(axis1), -1);
  return { ...system, axis1, axis2 };
}

export function ExploreMode({
  params,
  onParamsChange,
  presets,
  selectedPresetId,
  onPresetChange,
  system,
  onSystemChange,
  time,
  onTimeChange,
}: Props) {
  const [custom1, setCustom1] = useState(system.label1);
  const [custom2, setCustom2] = useState(system.label2);
  const angle = useMemo(() => angleOf(system), [system]);
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? presets[0];

  const setOrigin = (axis: 'x' | 'y', value: number) => {
    onSystemChange({
      ...system,
      originWorld: {
        ...system.originWorld,
        [axis]: value,
      },
    });
  };

  return (
    <div className="mode-layout explore-layout">
      <div className="primary-column">
        <SceneCanvas params={params} system={system} time={time} onSystemChange={onSystemChange} interactive />
        <TimeSlider params={params} time={time} onChange={onTimeChange} />
        <div className="panel" aria-labelledby="coordinate-controls">
          <div className="panel-title">
            <Tag aria-hidden="true" size={19} />
            <h2 id="coordinate-controls">Coordinate System</h2>
          </div>
          <div className="form-grid">
            <label>
              Preset
              <select
                aria-label="Coordinate preset"
                value={selectedPresetId}
                onChange={(event) => onPresetChange(event.target.value)}
              >
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rotation
              <span className="inline-value">{angle} deg</span>
              <input
                aria-label="Rotate coordinate axes"
                type="range"
                min="-180"
                max="180"
                step="5"
                value={angle}
                onChange={(event) => onSystemChange(rotateTo(system, Number(event.target.value)))}
              />
            </label>
            <label>
              Origin X_world
              <span className="inline-value">{system.originWorld.x.toFixed(1)} m</span>
              <input
                aria-label="Coordinate origin X world"
                type="range"
                min="-12"
                max={params.d1 + params.d2 + 12}
                step="0.5"
                value={system.originWorld.x}
                onChange={(event) => setOrigin('x', Number(event.target.value))}
              />
            </label>
            <label>
              Origin X direct
              <input
                aria-label="Coordinate origin X direct input"
                type="number"
                min="-12"
                max={params.d1 + params.d2 + 12}
                step="0.1"
                value={Number(system.originWorld.x.toFixed(2))}
                onChange={(event) => {
                  if (event.target.value !== '') setOrigin('x', Number(event.target.value));
                }}
              />
            </label>
            <label>
              Origin Y_world
              <span className="inline-value">{system.originWorld.y.toFixed(1)} m</span>
              <input
                aria-label="Coordinate origin Y world"
                type="range"
                min="-6"
                max={params.H + 10}
                step="0.5"
                value={system.originWorld.y}
                onChange={(event) => setOrigin('y', Number(event.target.value))}
              />
            </label>
            <label>
              Origin Y direct
              <input
                aria-label="Coordinate origin Y direct input"
                type="number"
                min="-6"
                max={params.H + 10}
                step="0.1"
                value={Number(system.originWorld.y.toFixed(2))}
                onChange={(event) => {
                  if (event.target.value !== '') setOrigin('y', Number(event.target.value));
                }}
              />
            </label>
          </div>
          <div className="button-row">
            <button type="button" className="tool-button" onClick={() => onSystemChange(flipAxis(system, 1))}>
              <FlipHorizontal aria-hidden="true" size={18} />
              Flip {system.label1}
            </button>
            <button type="button" className="tool-button" onClick={() => onSystemChange(flipAxis(system, 2))}>
              <FlipVertical aria-hidden="true" size={18} />
              Flip {system.label2}
            </button>
            <button type="button" className="tool-button" onClick={() => onSystemChange(swapCoordinateVariables(system))}>
              <Shuffle aria-hidden="true" size={18} />
              Swap variables
            </button>
            <button type="button" className="tool-button" onClick={() => onSystemChange(selectedPreset)}>
              <RotateCcw aria-hidden="true" size={18} />
              Reset
            </button>
          </div>
          <div className="label-controls" aria-label="Axis label controls">
            {Object.entries(labelSets).map(([key, labels]) => (
              <button key={key} type="button" onClick={() => onSystemChange(setLabels(system, labels[0], labels[1]))}>
                {labels[0]}, {labels[1]}
              </button>
            ))}
            <label>
              Axis 1
              <input
                aria-label="Custom label for axis 1"
                value={custom1}
                maxLength={3}
                onChange={(event) => {
                  setCustom1(event.target.value);
                  onSystemChange(setLabels(system, event.target.value || 'q1', system.label2));
                }}
              />
            </label>
            <label>
              Axis 2
              <input
                aria-label="Custom label for axis 2"
                value={custom2}
                maxLength={3}
                onChange={(event) => {
                  setCustom2(event.target.value);
                  onSystemChange(setLabels(system, system.label1, event.target.value || 'q2'));
                }}
              />
            </label>
          </div>
        </div>
        <ParameterControls params={params} onChange={onParamsChange} />
      </div>
      <aside className="side-column">
        <EquationPanel params={params} system={system} />
        <ComponentBreakdown params={params} system={system} />
        <section className="panel reason-panel">
          <h2>What Changed?</h2>
          <p>
            Origin affects only initial coordinates. Axis direction affects signs. Axis labels affect symbols. The path
            drawn in world coordinates stays fixed.
          </p>
        </section>
      </aside>
    </div>
  );
}
