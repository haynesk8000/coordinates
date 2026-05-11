import { Sigma } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { formatEquationSet } from '../physics/equationFormatter';
import type { ProjectileParameters } from '../physics/projectile';
import { MathBlock } from './MathBlock';

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
};

export function EquationPanel({ params, system }: Props) {
  const equations = formatEquationSet(params, system);
  const gravityAxis =
    equations.axis1.acceleration !== '0'
      ? system.label1
      : equations.axis2.acceleration !== '0'
        ? system.label2
        : 'neither coordinate';

  return (
    <section className="panel equation-panel" aria-labelledby="equation-heading">
      <div className="panel-title">
        <Sigma aria-hidden="true" size={19} />
        <h2 id="equation-heading">Equations</h2>
      </div>
      <div className="formula-stack live-formulas" aria-live="polite">
        <p className="formula-label">Symbolic form</p>
        <MathBlock
          expression={equations.axis1.simplifiedLatex}
          block
          label={equations.axis1.simplifiedText}
          testId={`equation-${system.label1}`}
        />
        <MathBlock
          expression={equations.axis2.simplifiedLatex}
          block
          label={equations.axis2.simplifiedText}
          testId={`equation-${system.label2}`}
        />
        <p className="formula-label">Numerical form</p>
        <MathBlock
          expression={equations.axis1.numericLatex}
          block
          label={equations.axis1.numericText}
          testId={`equation-${system.label1}-numeric`}
        />
        <MathBlock
          expression={equations.axis2.numericLatex}
          block
          label={equations.axis2.numericText}
          testId={`equation-${system.label2}-numeric`}
        />
      </div>
      <div className="insight-row">
        <span>Gravity term appears in</span>
        <strong>{gravityAxis}</strong>
      </div>
    </section>
  );
}
