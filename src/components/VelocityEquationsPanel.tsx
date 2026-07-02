import { Activity } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { formatVelocityDisplaySet } from '../physics/equationFormatter';
import { MathBlock } from './MathBlock';

type Props = {
  system: CoordinateSystem;
  time: number;
};

export function VelocityEquationsPanel({ system, time }: Props) {
  const velocity = formatVelocityDisplaySet(system, time);

  return (
    <section className="panel equation-panel" aria-labelledby="velocity-equation-heading">
      <div className="panel-title">
        <Activity aria-hidden="true" size={19} />
        <h2 id="velocity-equation-heading">Velocity Equations</h2>
      </div>
      <div className="formula-stack live-formulas" aria-live="polite">
        <p className="formula-label">Along {system.label1}</p>
        <MathBlock
          expression={velocity.axis1.equation.latex}
          block
          label={velocity.axis1.equation.text}
          testId="velocity-equation-x"
        />
        <p className="formula-label">Along {system.label2}</p>
        <MathBlock
          expression={velocity.axis2.equation.latex}
          block
          label={velocity.axis2.equation.text}
          testId="velocity-equation-y"
        />
      </div>
    </section>
  );
}
