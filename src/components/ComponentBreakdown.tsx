import { TableProperties } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { formatEquationSet } from '../physics/equationFormatter';
import type { ProjectileParameters } from '../physics/projectile';

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
};

export function ComponentBreakdown({ params, system }: Props) {
  const equations = formatEquationSet(params, system);
  const rows = [
    ['Initial position', equations.axis1.initialPosition, equations.axis2.initialPosition],
    ['Initial velocity', equations.axis1.initialVelocity, equations.axis2.initialVelocity],
    ['Acceleration', equations.axis1.acceleration, equations.axis2.acceleration],
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
            {rows.map(([name, axis1, axis2]) => (
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
