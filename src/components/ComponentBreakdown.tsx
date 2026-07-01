import { TableProperties } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { formatEquationSet } from '../physics/equationFormatter';
import { worldVelocityAtTime, type ProjectileParameters } from '../physics/projectile';
import { almostEqual } from '../physics/vectors';
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

const formatTime = (value: number): string => value.toFixed(2).replace(/\.?0+$/, '') || '0';

export function ComponentBreakdown({ params, system, time = 0 }: Props) {
  const equations = formatEquationSet(params, system);
  const currentWorldVelocity = worldVelocityAtTime(params, time);
  const timeLabel = formatTime(time);
  const currentVerticalVelocity = almostEqual(currentWorldVelocity.y, 0, 1e-8) ? (
    <MathBlock expression="0" label="0" testId="breakdown-current-velocity-axis2" />
  ) : (
    <MathBlock
      expression={`v_y = v_{y0} - g\\left(${timeLabel}\\right)`}
      label={`v_y = v_y0 - g(${timeLabel})`}
      testId="breakdown-current-velocity-axis2"
    />
  );
  const rows: BreakdownRow[] = [
    { name: 'Initial position', axis1: equations.axis1.initialPosition, axis2: equations.axis2.initialPosition },
    {
      name: 'Initial velocity',
      axis1: <MathBlock expression="v_{x0}" label="v_x0" testId="breakdown-initial-velocity-axis1" />,
      axis2: <MathBlock expression="v_{y0}" label="v_y0" testId="breakdown-initial-velocity-axis2" />,
    },
    {
      name: 'Current Velocity',
      axis1: <MathBlock expression="v_{x0}" label="v_x0" testId="breakdown-current-velocity-axis1" />,
      axis2: currentVerticalVelocity,
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
