import { SlidersHorizontal } from 'lucide-react';
import type { ProjectileParameters } from '../physics/projectile';

type Props = {
  params: ProjectileParameters;
  onChange: (params: ProjectileParameters) => void;
};

const controls: Array<{ key: keyof ProjectileParameters; label: string; min: number; max: number; step: number; unit: string }> = [
  { key: 'H', label: 'Cliff height H', min: 6, max: 40, step: 1, unit: 'm' },
  { key: 'h', label: 'Wall height h', min: 1, max: 25, step: 1, unit: 'm' },
  { key: 'd1', label: 'Wall distance d1', min: 4, max: 35, step: 1, unit: 'm' },
  { key: 'd2', label: 'Landing distance d2', min: 5, max: 45, step: 1, unit: 'm' },
  { key: 'v0', label: 'Launch speed v0', min: 4, max: 25, step: 0.5, unit: 'm/s' },
  { key: 'g', label: 'Gravity g', min: 1, max: 15, step: 0.1, unit: 'm/s^2' },
];

export function ParameterControls({ params, onChange }: Props) {
  return (
    <section className="panel" aria-labelledby="parameter-heading">
      <div className="panel-title">
        <SlidersHorizontal aria-hidden="true" size={19} />
        <h2 id="parameter-heading">Parameters</h2>
      </div>
      <div className="control-grid">
        {controls.map((control) => (
          <label className="range-control" key={control.key}>
            <span>
              {control.label}
              <strong>
                {params[control.key]} {control.unit}
              </strong>
            </span>
            <input
              aria-label={control.label}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={params[control.key]}
              onChange={(event) => onChange({ ...params, [control.key]: Number(event.target.value) })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
