import { useMemo, useState } from 'react';
import { Activity, Gauge, Timer } from 'lucide-react';
import { formatPhysicsNumber, projectileAtTime, projectileFlightTime, type ProjectileInputs } from '../physics/learningModules';
import { ProjectileFunZone } from './funzone/ProjectileFunZone';
import {
  ConceptQuiz,
  ExplainView,
  LearningModuleShell,
  MetricGrid,
  RangeControl,
  type ConceptQuestion,
} from './LearningModuleShared';
import type { Mode } from './ModeSwitcher';
import { TopicWalkthrough, type WalkthroughStep } from './walkthroughs/TopicWalkthrough';

export const projectileControlLimits = {
  speed: { min: 6, max: 30 },
  angleDegrees: { min: 0, max: 90 },
  initialHeight: { min: 0, max: 12 },
  gravity: { min: 2, max: 18 },
} as const;

const PROJECTILE_SCREEN_BOUNDS = {
  left: 35,
  right: 690,
  top: 0,
  ground: 325,
} as const;

export const projectileDisplayBounds = {
  width: 110,
  height: 65,
} as const;

export const mapProjectileToScreen = (position: { x: number; y: number }) => ({
  x:
    PROJECTILE_SCREEN_BOUNDS.left +
    (position.x / projectileDisplayBounds.width) *
      (PROJECTILE_SCREEN_BOUNDS.right - PROJECTILE_SCREEN_BOUNDS.left),
  y:
    PROJECTILE_SCREEN_BOUNDS.ground -
    (position.y / projectileDisplayBounds.height) *
      (PROJECTILE_SCREEN_BOUNDS.ground - PROJECTILE_SCREEN_BOUNDS.top),
});
const questions: ConceptQuestion[] = [
  { prompt: 'At the highest point of a projectile path, which statement is correct?', choices: ['Velocity and acceleration are both zero', 'Vertical velocity is zero; acceleration is downward', 'Acceleration is horizontal', 'Horizontal velocity is zero'], answer: 'Vertical velocity is zero; acceleration is downward', explanation: 'Gravity continues to act at the top. Only the vertical velocity component is momentarily zero.', skill: 'vectors' },
  { prompt: 'With right positive and up positive, what are the acceleration components?', choices: ['(0, −g)', '(g, 0)', '(0, g)', '(−g, −g)'], answer: '(0, −g)', explanation: 'The introductory model has no horizontal acceleration and gravity points downward.', skill: 'components' },
  { prompt: 'Why do horizontal and vertical equations use the same time?', choices: ['They describe the same object during the same flight', 'Their velocities are equal', 'Gravity acts horizontally too', 'Time is a vector'], answer: 'They describe the same object during the same flight', explanation: 'The component equations are two descriptions of one simultaneous motion.', skill: 'modeling' },
  { prompt: 'Ignoring air resistance, increasing launch speed while keeping angle fixed generally does what?', choices: ['Increases the horizontal range', 'Removes gravity', 'Makes acceleration larger', 'Makes mass matter'], answer: 'Increases the horizontal range', explanation: 'More initial speed increases the velocity components, while gravitational acceleration stays the same.', skill: 'prediction' },
  { prompt: 'Which graph is not a drawing of the physical trajectory?', choices: ['A y-versus-time graph', 'The path in the scene', 'A world-space trail', 'The curve followed by the object'], answer: 'A y-versus-time graph', explanation: 'A component-time graph uses time on one axis; it is a different representation from the path in space.', skill: 'representations' },
];

export function ProjectileMotionModule() {
  const [mode, setMode] = useState<Mode>('explore');
  const [inputs, setInputs] = useState<ProjectileInputs>({ speed: 18, angleDegrees: 42, gravity: 9.8, initialHeight: 4 });
  const [progress, setProgress] = useState(35);
  const flightTime = projectileFlightTime(inputs);
  const time = (progress / 100) * flightTime;
  const state = projectileAtTime(inputs, time);

  const modeCopy = {
    explore: 'Change the launch and scrub through time. The path, vectors, component values, and graphs all come from the same physical model.',
    explain: 'Build projectile equations from the initial conditions: choose axes, resolve velocity, apply gravity, and check the result against the path.',
    quiz: 'Reason from vectors, components, assumptions, and graphs. Feedback identifies the specific idea behind every answer.',
    fun: 'Predict landing distances and read velocity vectors. Chase a high score or dial in your own difficulty.',
  };

  return (
    <LearningModuleShell
      eyebrow="Two-dimensional kinematics"
      title="Projectile Motion Lab"
      intro={<>Horizontal and vertical components evolve together during one flight. <strong>Gravity changes vertical velocity while horizontal velocity remains constant.</strong></>}
      mode={mode}
      onModeChange={setMode}
      modeCopy={modeCopy}
      includeFunZone
    >
      {mode === 'explore' && <ProjectileExplore inputs={inputs} onInputsChange={setInputs} progress={progress} onProgressChange={setProgress} />}
      {mode === 'explain' && <ProjectileExplain inputs={inputs} time={time} />}
      {mode === 'quiz' && <ConceptQuiz moduleId="projectile-motion" questions={questions} onReviewExplain={() => setMode('explain')} />}
      {mode === 'fun' && <ProjectileFunZone />}
    </LearningModuleShell>
  );
}

function ProjectileExplore({ inputs, onInputsChange, progress, onProgressChange }: {
  inputs: ProjectileInputs;
  onInputsChange: (inputs: ProjectileInputs) => void;
  progress: number;
  onProgressChange: (value: number) => void;
}) {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const flightTime = projectileFlightTime(inputs);
  const time = (progress / 100) * flightTime;
  const state = projectileAtTime(inputs, time);
  const samples = useMemo(() => Array.from({ length: 61 }, (_, index) => projectileAtTime(inputs, (index / 60) * flightTime).position), [inputs, flightTime]);
  const mapX = (x: number) => mapProjectileToScreen({ x, y: 0 }).x;
  const mapY = (y: number) => mapProjectileToScreen({ x: 0, y }).y;
  const path = samples.map((sample, index) => `${index === 0 ? 'M' : 'L'} ${mapX(sample.x)} ${mapY(Math.max(0, sample.y))}`).join(' ');
  const pointX = mapX(state.position.x);
  const pointY = mapY(Math.max(0, state.position.y));
  const apexTime = (inputs.speed * Math.sin((inputs.angleDegrees * Math.PI) / 180)) / inputs.gravity;
  const apexHeight = projectileAtTime(inputs, Math.max(0, apexTime)).position.y;
  const range = projectileAtTime(inputs, flightTime).position.x;

  const walkthroughSteps: WalkthroughStep[] = [
    {
      type: 'concept',
      title: 'Two Independent Motions',
      body: "A projectile's horizontal and vertical motions happen at the same time but obey different rules. Horizontal velocity stays constant because gravity has no horizontal component. Vertical velocity changes at a constant rate because gravity pulls straight down. Both share the same clock: whatever time you pick describes both components at once.",
    },
    {
      type: 'task',
      title: 'Launch Flat',
      instructions: ['Set the launch angle to 0°.', 'Watch the path in the scene as the projectile falls.'],
      hint: 'Move the Launch angle slider all the way to the left.',
      observation: 'Even with no upward angle, the object still traces a curved path downward instead of flying in a straight line.',
      explanation: "Gravity acts on the vertical component regardless of the launch angle. A flat launch removes the initial vertical velocity, but it can't remove gravity's constant downward acceleration.",
      complete: inputs.angleDegrees === 0,
    },
    {
      type: 'task',
      title: 'Find the Apex',
      instructions: ['Drag the Flight progress slider until the vertical velocity is nearly zero.', 'Check the Live Components panel to confirm.'],
      hint: 'Watch v_y in the Live Components panel — it should read close to 0 m/s.',
      observation: 'At that instant the object is momentarily moving purely horizontally: it has stopped rising but has not started falling yet.',
      explanation: 'The apex is where vertical velocity crosses zero. Horizontal velocity is unaffected and keeps its original value the whole flight.',
      complete: Math.abs(time - apexTime) < Math.max(0.08, flightTime * 0.035),
    },
    {
      type: 'check',
      title: 'Check: At the Apex',
      prompt: 'At the apex, which statement is true?',
      choices: ['Horizontal velocity is nonzero; vertical velocity is momentarily zero', 'Both velocity components are zero', 'Horizontal velocity is zero; vertical velocity is at its maximum', 'Acceleration is zero'],
      answer: 'Horizontal velocity is nonzero; vertical velocity is momentarily zero',
      explanation: 'Only the vertical component of velocity passes through zero at the apex. Gravity keeps acting throughout the entire flight, so acceleration is never zero in this model.',
    },
    {
      type: 'task',
      title: 'Extend the Range',
      instructions: ['Adjust the launch speed and angle together.', 'Try to get the horizontal range above 45 m — check the Flight Summary panel.'],
      hint: 'Angles nearer 45° combined with higher speed tend to produce the longest range.',
      observation: 'Range grows fastest when you increase speed, since range depends on speed squared, and is maximized (for a given speed) near a 45° angle.',
      explanation: 'Horizontal range comes from how long the object is airborne multiplied by its constant horizontal velocity. Both flight time and horizontal speed increase your range, but they trade off against each other as the angle changes.',
      complete: range > 45,
    },
    {
      type: 'task',
      title: 'Raise the Ceiling',
      instructions: ['Increase the launch angle to 60° or steeper.', 'Notice how much higher the peak of the path becomes.'],
      hint: 'Move the Launch angle slider to the right, past 60°.',
      observation: 'A steeper launch angle trades horizontal range for maximum height — the same speed sends the object much higher.',
      explanation: 'Maximum height depends on the vertical component of the initial velocity: v0 sin(θ). Larger angles increase sin(θ), which raises the peak even though it shortens the horizontal reach.',
      complete: inputs.angleDegrees >= 60,
    },
    {
      type: 'check',
      title: 'Check: Angle and Range',
      prompt: 'Keeping launch speed fixed, increasing the angle from 20° toward 45° generally does what to horizontal range?',
      choices: ['Increases the range', 'Decreases the range', 'Has no effect on the range', 'Makes the object fall straight down'],
      answer: 'Increases the range',
      explanation: 'Range is proportional to sin(2θ), which increases as θ approaches 45° from below.',
    },
    {
      type: 'check',
      title: 'Mastery Check',
      prompt: "Which everyday example best matches the idealized 'no air resistance' projectile motion model used here?",
      choices: ['A cannonball fired across an open field', 'A paper airplane gliding across a room', 'A feather dropped from a table', 'A rocket under continuous engine thrust'],
      answer: 'A cannonball fired across an open field',
      explanation: 'A dense, compact object over a short flight is dominated by gravity, matching this model. Paper airplanes and feathers are shaped by air resistance, and a thrusting rocket has forces beyond gravity acting on it.',
    },
  ];

  return (
    <div className={`topic-explore-layout ${walkthroughOpen ? 'walkthrough-active' : ''}`}>
      <div className="topic-main-column">
        <TopicWalkthrough storageKey="physics-motion-lab-projectile-motion-walkthrough-v1" label="Projectile Motion" steps={walkthroughSteps} onOpenChange={setWalkthroughOpen} />
        <figure className="topic-simulation" aria-labelledby="projectile-scene-caption">
          <svg viewBox="0 0 720 380" role="img" aria-label="Projectile trajectory with current velocity and downward acceleration vectors">
            <defs><marker id="projectile-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
            <rect width="720" height="380" className="topic-sky" />
            <line x1="35" y1="325" x2="690" y2="325" className="topic-ground" />
            <path d={path} className="topic-path" />
            {samples.filter((_, index) => index % 10 === 0).map((sample, index) => <circle key={index} cx={mapX(sample.x)} cy={mapY(Math.max(0, sample.y))} r="3" className="sample-dot" />)}
            <line x1={pointX} y1={pointY} x2={pointX + state.velocity.x * 2.2} y2={pointY - state.velocity.y * 2.2} className="topic-velocity" markerEnd="url(#projectile-arrow)" />
            <line x1={pointX} y1={pointY} x2={pointX} y2={pointY + 50} className="topic-acceleration" markerEnd="url(#projectile-arrow)" />
            <circle cx={pointX} cy={pointY} r="9" className="topic-object" />
            <text x={pointX + 14} y={pointY - 12} className="topic-svg-label">t = {formatPhysicsNumber(time)} s</text>
            <text x={pointX + state.velocity.x * 2.2 + 8} y={pointY - state.velocity.y * 2.2} className="topic-svg-label velocity-label">v</text>
            <text x={pointX + 8} y={pointY + 48} className="topic-svg-label acceleration-label">g</text>
          </svg>
          <figcaption id="projectile-scene-caption">Equal-time dots reveal constant horizontal motion while the vertical spacing changes under gravity.</figcaption>
        </figure>
        <section className="panel topic-controls" aria-labelledby="projectile-controls-heading">
          <div className="panel-title"><Gauge aria-hidden="true" size={20} /><h2 id="projectile-controls-heading">Launch Controls</h2></div>
          <div className="topic-control-grid">
            <RangeControl label="Launch speed" value={inputs.speed} min={projectileControlLimits.speed.min} max={projectileControlLimits.speed.max} step={1} unit="m/s" onChange={(speed) => onInputsChange({ ...inputs, speed })} />
            <RangeControl label="Launch angle" value={inputs.angleDegrees} min={projectileControlLimits.angleDegrees.min} max={projectileControlLimits.angleDegrees.max} step={1} unit="°" onChange={(angleDegrees) => onInputsChange({ ...inputs, angleDegrees })} />
            <RangeControl label="Launch height" value={inputs.initialHeight} min={projectileControlLimits.initialHeight.min} max={projectileControlLimits.initialHeight.max} step={1} unit="m" onChange={(initialHeight) => onInputsChange({ ...inputs, initialHeight })} />
            <RangeControl label="Gravity" value={inputs.gravity} min={projectileControlLimits.gravity.min} max={projectileControlLimits.gravity.max} step={0.1} unit="m/s²" onChange={(gravity) => onInputsChange({ ...inputs, gravity })} />
          </div>
          <RangeControl label="Flight progress" value={progress} min={0} max={100} step={1} unit="%" onChange={onProgressChange} />
        </section>
      </div>
      <aside className="topic-side-column">
        <section className="panel">
          <div className="panel-title"><Activity aria-hidden="true" size={20} /><h2>Live Components</h2></div>
          <MetricGrid metrics={[
            { label: 'Time', value: `${formatPhysicsNumber(time)} s` },
            { label: 'Position', value: `(${formatPhysicsNumber(state.position.x)}, ${formatPhysicsNumber(state.position.y)}) m` },
            { label: 'Velocity', value: `(${formatPhysicsNumber(state.velocity.x)}, ${formatPhysicsNumber(state.velocity.y)}) m/s` },
            { label: 'Acceleration', value: `(0, −${inputs.gravity}) m/s²` },
          ]} />
        </section>
        <section className="panel equation-summary">
          <h2>Component Equations</h2>
          <code>x(t) = v₀ cos(θ)t</code>
          <code>y(t) = y₀ + v₀ sin(θ)t − ½gt²</code>
          <code>vᵧ(t) = v₀ sin(θ) − gt</code>
        </section>
        <section className="panel">
          <div className="panel-title"><Timer aria-hidden="true" size={20} /><h2>Flight Summary</h2></div>
          <MetricGrid metrics={[
            { label: 'Flight time', value: `${formatPhysicsNumber(flightTime)} s` },
            { label: 'Range', value: `${formatPhysicsNumber(projectileAtTime(inputs, flightTime).position.x)} m` },
            { label: 'Apex height', value: `${formatPhysicsNumber(apexHeight)} m` },
            { label: 'Apex time', value: `${formatPhysicsNumber(Math.max(0, apexTime))} s` },
            { label: 'Model', value: 'Constant g, no drag' },
          ]} />
        </section>
      </aside>
    </div>
  );
}

function ProjectileExplain({ inputs, time }: { inputs: ProjectileInputs; time: number }) {
  const state = projectileAtTime(inputs, time);
  const angle = (inputs.angleDegrees * Math.PI) / 180;
  return <ExplainView
    heading="Build the motion from components"
    summary="Start from the physical launch, not a memorized range formula. The same time belongs in both component equations."
    steps={[
      { title: 'Choose axes.', body: 'Use right as positive x and up as positive y, so gravity is negative in the y equation.' },
      { title: 'Resolve the launch velocity.', body: `vₓ₀ = ${formatPhysicsNumber(inputs.speed * Math.cos(angle))} m/s and vᵧ₀ = ${formatPhysicsNumber(inputs.speed * Math.sin(angle))} m/s.` },
      { title: 'Apply acceleration.', body: `aₓ = 0 and aᵧ = −${inputs.gravity} m/s² for the entire flight.` },
      { title: 'Use one shared time.', body: `At t = ${formatPhysicsNumber(time)} s, both equations describe the same object.` },
      { title: 'Check the result.', body: `The model predicts position (${formatPhysicsNumber(state.position.x)}, ${formatPhysicsNumber(state.position.y)}) m and a velocity tangent to the path.` },
    ]}
    concepts={[
      { title: 'Independent components', body: <p>Gravity changes vertical motion without changing horizontal velocity. The components are independent but simultaneous.</p> },
      { title: 'At the apex', body: <p>The vertical velocity is zero for an instant. Horizontal velocity remains, and acceleration still points downward.</p> },
      { title: 'Model assumptions', body: <p>Constant gravity and negligible air resistance produce a parabola. Real projectiles can depart from this model.</p> },
      { title: 'Graph versus path', body: <p>A trajectory uses x and y in physical space. A component graph uses time on its horizontal axis.</p> },
    ]}
    misconceptions={[
      'The acceleration is not zero at the highest point.',
      'A negative vertical velocity means downward motion relative to the chosen axes, not a negative speed.',
      'Ground-to-ground range shortcuts do not automatically apply when launch and landing heights differ.',
    ]}
  />;
}
