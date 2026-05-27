import { AlertTriangle, CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';
import type { CoordinateSystem } from '../physics/coordinateSystem';
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

const directionText = (axis: { x: number; y: number }) => {
  const parts = [];
  if (Math.abs(axis.x) > 0.35) parts.push(axis.x > 0 ? 'right' : 'left');
  if (Math.abs(axis.y) > 0.35) parts.push(axis.y > 0 ? 'up' : 'down');
  return parts.join(' and ') || 'nearly zero';
};

function WorkedExample({
  params,
  system,
  title,
  description,
}: {
  params: ProjectileParameters;
  system: CoordinateSystem;
  title: string;
  description: string;
}) {
  const equations = formatEquationSet(params, system);
  return (
    <article className="example-card">
      <SceneCanvas params={params} system={system} time={0.9} caption={description} small />
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
  const examples = [
    {
      system: presets[0],
      description:
        'The origin is at the launch point on top of the cliff, with x pointing right and y pointing up. The key information starts at (0, 0), gives the horizontal launch as (v0, 0), and shows gravity as negative in the upward y direction.',
    },
    {
      system: presets[3],
      description:
        'The projectile is still launched from the cliff top, but the vertical axis now points downward. The initial coordinates remain (0, 0), while the key information changes gravity to +g because positive y points with the downward acceleration.',
    },
    {
      system: presets[4],
      description:
        'Here the origin has moved to the ground below the cliff while the axes keep x right and y up. The key information shows the launch point begins H meters above the origin, so the vertical equation starts with H before gravity subtracts from it.',
    },
    {
      system: presets[9],
      description:
        'In this swapped-variable system, the coordinate named x is vertical and the coordinate named y is horizontal. The key information shows initial position (H, 0), puts the launch velocity in y as v0, and puts the gravity component in x as -g.',
    },
  ];

  return (
    <div className="explain-stack" id="explain-review">
      <section className="panel">
        <div className="panel-title">
          <Lightbulb aria-hidden="true" size={20} />
          <h2>Derive The Equations</h2>
        </div>
        <ol className="derivation-list">
          <li>
            <strong>Locate the origin.</strong> The launch point is measured from the selected origin, so the initial
            coordinates are written as signed starting values.
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
            <strong>Check the sense.</strong> The gravity term belongs only where the selected axis has a vertical
            projection, and its sign follows whether that axis points with or against gravity.
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
          {examples.map(({ system: example, description }) => (
            <WorkedExample
              key={example.id}
              params={params}
              system={example}
              description={description}
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
