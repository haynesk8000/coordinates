import { Activity } from 'lucide-react';
import { MathBlock } from './MathBlock';

type Props = {
  time: number;
};

const formatTime = (value: number): string => value.toFixed(2).replace(/\.?0+$/, '') || '0';

export function VelocityEquationsPanel({ time }: Props) {
  const timeLabel = formatTime(time);
  const verticalVelocityLabel = `v_y = v_y0 - g(${timeLabel})`;

  return (
    <section className="panel equation-panel" aria-labelledby="velocity-equation-heading">
      <div className="panel-title">
        <Activity aria-hidden="true" size={19} />
        <h2 id="velocity-equation-heading">Velocity Equations</h2>
      </div>
      <div className="formula-stack live-formulas" aria-live="polite">
        <p className="formula-label">Horizontal Velocity</p>
        <MathBlock
          expression="v_x = v_{x0}"
          block
          label="v_x = v_x0"
          testId="velocity-equation-x"
        />
        <p className="formula-label">Vertical Velocity</p>
        <MathBlock
          expression={`v_y = v_{y0} - g\\left(${timeLabel}\\right)`}
          block
          label={verticalVelocityLabel}
          testId="velocity-equation-y"
        />
      </div>
    </section>
  );
}
