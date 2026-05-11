import { AlertTriangle, CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
import { getCoordinateComponents } from '../physics/coordinateSystem';
import { formatEquationSet } from '../physics/equationFormatter';
import { createPresets } from '../physics/presets';
import type { ProjectileParameters } from '../physics/projectile';
import { ComponentBreakdown } from './ComponentBreakdown';
import { EquationPanel } from './EquationPanel';
import { MathBlock } from './MathBlock';
import { SceneCanvas } from './SceneCanvas';

type Props = {
  params: ProjectileParameters;
  system: CoordinateSystem;
};

const formatNumber = (value: number) => value.toFixed(2).replace(/\.?0+$/, '');

const directionText = (axis: { x: number; y: number }) => {
  const parts = [];
  if (Math.abs(axis.x) > 0.35) parts.push(axis.x > 0 ? 'right' : 'left');
  if (Math.abs(axis.y) > 0.35) parts.push(axis.y > 0 ? 'up' : 'down');
  return parts.join(' and ') || 'nearly zero';
};

function WorkedExample({ params, system, title }: { params: ProjectileParameters; system: CoordinateSystem; title: string }) {
  const equations = formatEquationSet(params, system);
  return (
    <article className="example-card">
      <SceneCanvas params={params} system={system} time={0.9} small />
      <div>
        <h3>{title}</h3>
        <dl className="mini-facts">
          <div>
            <dt>Initial coordinates</dt>
            <dd>
              ({equations.axis1.initialPosition}, {equations.axis2.initialPosition})
            </dd>
          </div>
          <div>
            <dt>Velocity components</dt>
            <dd>
              ({equations.axis1.initialVelocity}, {equations.axis2.initialVelocity})
            </dd>
          </div>
          <div>
            <dt>Acceleration components</dt>
            <dd>
              ({equations.axis1.acceleration}, {equations.axis2.acceleration})
            </dd>
          </div>
        </dl>
        <MathBlock expression={equations.axis1.simplifiedLatex} block />
        <MathBlock expression={equations.axis2.simplifiedLatex} block />
        <p className="sense-line">
          The signs make sense because {system.label1} points {directionText(system.axis1)} and {system.label2} points{' '}
          {directionText(system.axis2)}.
        </p>
      </div>
    </article>
  );
}

export function ExplainMode({ params, system }: Props) {
  const presets = createPresets(params);
  const current = formatEquationSet(params, system);
  const defaultSystem = presets[0];
  const components = getCoordinateComponents(params, system);
  const examples = [presets[0], presets[3], presets[4], presets[9]];

  return (
    <div className="explain-stack" id="explain-review">
      <section className="panel">
        <div className="panel-title">
          <Lightbulb aria-hidden="true" size={20} />
          <h2>Derive The Equations</h2>
        </div>
        <ol className="derivation-list">
          <li>
            <strong>Locate the origin.</strong> Right now it is at world ({formatNumber(system.originWorld.x)},{' '}
            {formatNumber(system.originWorld.y)}), so the launch point is measured from there.
          </li>
          <li>
            <strong>Identify positive directions.</strong> Positive {system.label1} points {directionText(system.axis1)};
            positive {system.label2} points {directionText(system.axis2)}.
          </li>
          <li>
            <strong>Determine initial position.</strong> Project the launch point onto the axes: ({current.axis1.initialPosition},{' '}
            {current.axis2.initialPosition}).
          </li>
          <li>
            <strong>Determine initial velocity.</strong> The object is thrown horizontally right, so velocity becomes (
            {current.axis1.initialVelocity}, {current.axis2.initialVelocity}).
          </li>
          <li>
            <strong>Determine acceleration.</strong> Gravity always points downward in the physical picture, so acceleration
            becomes ({current.axis1.acceleration}, {current.axis2.acceleration}).
          </li>
          <li>
            <strong>Substitute.</strong> Use the same constant-acceleration form for each coordinate component.
          </li>
          <li>
            <strong>Check the sense.</strong> The current acceleration vector is ({formatNumber(components.acceleration.x)},{' '}
            {formatNumber(components.acceleration.y)}), so the gravity term belongs only where the axis has a vertical
            projection.
          </li>
        </ol>
      </section>

      <div className="comparison-grid">
        <div>
          <h2>Default System</h2>
          <EquationPanel params={params} system={defaultSystem} />
        </div>
        <div>
          <h2>Current System</h2>
          <EquationPanel params={params} system={system} />
        </div>
      </div>

      <ComponentBreakdown params={params} system={system} />

      <section className="panel">
        <div className="panel-title">
          <HelpCircle aria-hidden="true" size={20} />
          <h2>Sign Reasoning Prompts</h2>
        </div>
        <div className="prompt-grid">
          <p>Does positive vertical point with or against gravity?</p>
          <p>Does positive horizontal point with or against the launch velocity?</p>
          <p>Is the projectile initially above, below, left, or right of the origin?</p>
          <p>Which coordinate should contain the gravity term?</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <CheckCircle2 aria-hidden="true" size={20} />
          <h2>Worked Examples</h2>
        </div>
        <div className="examples-grid">
          {examples.map((example, index) => (
            <WorkedExample
              key={example.id}
              params={params}
              system={example}
              title={(example.name ?? 'Coordinate example').replace(/^\d+\.\s*/, '')}
            />
          ))}
        </div>
      </section>

      <section className="panel mistakes-panel">
        <div className="panel-title">
          <AlertTriangle aria-hidden="true" size={20} />
          <h2>Common Mistakes</h2>
        </div>
        <ul>
          <li>Forgetting that gravity is downward in the physical picture.</li>
          <li>Using +g automatically instead of checking which way the positive axis points.</li>
          <li>Assuming the initial coordinates are zero for every origin.</li>
          <li>Confusing the physical path with the coordinate description.</li>
          <li>Missing that swapped axes change which equation gets the gravitational term.</li>
          <li>Forgetting that v0 is horizontal in the physical picture, not necessarily along the coordinate named x.</li>
        </ul>
      </section>
    </div>
  );
}
