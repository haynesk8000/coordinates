import { TableProperties } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { formatEquationSet, formatVelocityDisplaySet } from '../physics/equationFormatter';
import type { ProjectileParameters } from '../physics/projectile';
import { MathBlock } from './MathBlock';

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
  time?: number;
};

type BreakdownRow = {
  name: string;
  axis1: ReactNode;
  axis2: ReactNode;
};

export function ComponentBreakdown({ params, system, time = 0 }: Props) {
  const equations = formatEquationSet(params, system);
  const velocity = formatVelocityDisplaySet(system, time);
  const rows: BreakdownRow[] = [
    { name: 'Initial position', axis1: equations.axis1.initialPosition, axis2: equations.axis2.initialPosition },
    {
      name: 'Initial velocity',
      axis1: (
        <MathBlock
          expression={velocity.axis1.initialComponent.latex}
          label={velocity.axis1.initialComponent.text}
          testId="breakdown-initial-velocity-axis1"
        />
      ),
      axis2: (
        <MathBlock
          expression={velocity.axis2.initialComponent.latex}
          label={velocity.axis2.initialComponent.text}
          testId="breakdown-initial-velocity-axis2"
        />
      ),
    },
    {
      name: 'Current Velocity',
      axis1: (
        <MathBlock
          expression={velocity.axis1.currentComponent.latex}
          label={velocity.axis1.currentComponent.text}
          testId="breakdown-current-velocity-axis1"
        />
      ),
      axis2: (
        <MathBlock
          expression={velocity.axis2.currentComponent.latex}
          label={velocity.axis2.currentComponent.text}
          testId="breakdown-current-velocity-axis2"
        />
      ),
    },
    { name: 'Acceleration', axis1: equations.axis1.acceleration, axis2: equations.axis2.acceleration },
  ];

  return (
    <section className="panel" aria-labelledby="breakdown-heading">
      <div className="panel-title">
        <TableProperties aria-hidden="true" size={19} />
        <h2 id="breakdown-heading">Component Breakdown</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Physical quantity</th>
              <th>Along {system.label1}</th>
              <th>Along {system.label2}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ name, axis1, axis2 }) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>{axis1}</td>
                <td>{axis2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
