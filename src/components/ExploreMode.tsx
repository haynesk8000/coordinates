import { useState } from 'react';
import { FlipHorizontal, FlipVertical, RotateCcw, Shuffle, Tag } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import {
  flipAxis,
  MAX_ROTATION_UNITS,
  MIN_ROTATION_UNITS,
  ROTATION_UNIT_RADIANS,
  setLabels,
  swapCoordinateVariables,
} from '../physics/coordinateSystem';
import type { CoordinatePreset } from '../physics/presets';
import type { ProjectileParameters } from '../physics/projectile';
import { perpendicularLeft, scale, vector } from '../physics/vectors';
import { SceneCanvas } from './SceneCanvas';
import { EquationPanel } from './EquationPanel';
import { ComponentBreakdown } from './ComponentBreakdown';
import { TimeSlider } from './TimeSlider';

type Props = {
  params: ProjectileParameters;
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

const angleUnitOf = (system: CoordinateSystem) => Math.round(Math.atan2(system.axis1.y, system.axis1.x) / ROTATION_UNIT_RADIANS);

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

const formatPiMultiple = (units: number): string => {
  if (units === 0) return '0 rad';
  const denominator = 12;
  const divisor = gcd(Math.abs(units), denominator);
  const numerator = units / divisor;
  const reducedDenominator = denominator / divisor;
  const sign = numerator < 0 ? '-' : '';
  const absoluteNumerator = Math.abs(numerator);

  if (reducedDenominator === 1) {
    return `${sign}${absoluteNumerator === 1 ? '' : absoluteNumerator}pi rad`;
  }

  return `${sign}${absoluteNumerator === 1 ? '' : absoluteNumerator}pi/${reducedDenominator} rad`;
};

function rotateTo(system: CoordinateSystem, units: number): CoordinateSystem {
  const radians = units * ROTATION_UNIT_RADIANS;
  const axis1 = vector(Math.cos(radians), Math.sin(radians));
  const cross = system.axis1.x * system.axis2.y - system.axis1.y * system.axis2.x;
  const axis2 = cross >= 0 ? perpendicularLeft(axis1) : scale(perpendicularLeft(axis1), -1);
  return { ...system, axis1, axis2 };
}

export function ExploreMode({
  params,
  presets,
  selectedPresetId,
  onPresetChange,
  system,
  onSystemChange,
  time,
  onTimeChange,
}: Props) {
  const [angleUnits, setAngleUnits] = useState(() => angleUnitOf(system));
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? presets[0];
  const applySystemChange = (nextSystem: CoordinateSystem) => {
    setAngleUnits(angleUnitOf(nextSystem));
    onSystemChange(nextSystem);
  };

  const setRotation = (nextAngleUnits: number) => {
    const clampedAngleUnits = Math.min(MAX_ROTATION_UNITS, Math.max(MIN_ROTATION_UNITS, nextAngleUnits));
    setAngleUnits(clampedAngleUnits);
    onSystemChange(rotateTo(system, clampedAngleUnits));
  };

  return (
    <div className="mode-layout explore-layout">
      <div className="primary-column">
        <SceneCanvas
          params={params}
          system={system}
          time={time}
          onSystemChange={onSystemChange}
          onRotationUnitsChange={setRotation}
          rotationUnits={angleUnits}
          interactive
        />
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
                onChange={(event) => {
                  const nextPreset = presets.find((preset) => preset.id === event.target.value);
                  if (nextPreset) setAngleUnits(angleUnitOf(nextPreset));
                  onPresetChange(event.target.value);
                }}
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
              <span className="inline-value">{formatPiMultiple(angleUnits)}</span>
              <input
                aria-label="Rotate coordinate axes"
                type="range"
                min={MIN_ROTATION_UNITS}
                max={MAX_ROTATION_UNITS}
                step="1"
                value={angleUnits}
                onChange={(event) => setRotation(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="button-row">
            <button type="button" className="tool-button" onClick={() => applySystemChange(flipAxis(system, 1))}>
              <FlipHorizontal aria-hidden="true" size={18} />
              Flip {system.label1}
            </button>
            <button type="button" className="tool-button" onClick={() => applySystemChange(flipAxis(system, 2))}>
              <FlipVertical aria-hidden="true" size={18} />
              Flip {system.label2}
            </button>
            <button type="button" className="tool-button" onClick={() => applySystemChange(swapCoordinateVariables(system))}>
              <Shuffle aria-hidden="true" size={18} />
              Swap variables
            </button>
            <button type="button" className="tool-button" onClick={() => applySystemChange(selectedPreset)}>
              <RotateCcw aria-hidden="true" size={18} />
              Reset
            </button>
          </div>
          <div className="label-controls" aria-label="Axis label controls">
            <span className="control-group-label">Axes Labels</span>
            {Object.entries(labelSets).map(([key, labels]) => (
              <button key={key} type="button" onClick={() => onSystemChange(setLabels(system, labels[0], labels[1]))}>
                {labels[0]}, {labels[1]}
              </button>
            ))}
          </div>
        </div>
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
