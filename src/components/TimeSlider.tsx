import { Clock3 } from 'lucide-react';
import { maxUsefulTime, type ProjectileParameters } from '../physics/projectile';

type Props = {
  params: ProjectileParameters;
  time: number;
  onChange: (time: number) => void;
};

export function TimeSlider({ params, time, onChange }: Props) {
  const maxTime = maxUsefulTime(params);
  return (
    <section className="panel compact-panel" aria-labelledby="time-heading">
      <div className="panel-title">
        <Clock3 aria-hidden="true" size={19} />
        <h2 id="time-heading">Time</h2>
      </div>
      <label className="range-control">
        <span>
          Current time
          <strong>{time.toFixed(2)} s</strong>
        </span>
        <input
          aria-label="Projectile time"
          type="range"
          min={0}
          max={maxTime}
          step={0.02}
          value={Math.min(time, maxTime)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    </section>
  );
}
