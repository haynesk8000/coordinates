import { useState } from 'react';
import { CircleDot, Gauge, RotateCw } from 'lucide-react';
import { circularMotionAtTime, formatPhysicsNumber, type CircularMotionInputs } from '../physics/learningModules';
import { CircularMotionFunZone } from './funzone/CircularMotionFunZone';
import { ConceptQuiz, ExplainView, LearningModuleShell, MetricGrid, RangeControl, type ConceptQuestion } from './LearningModuleShared';
import type { Mode } from './ModeSwitcher';
import { TopicWalkthrough, type WalkthroughStep } from './walkthroughs/TopicWalkthrough';

const questions: ConceptQuestion[] = [
  { prompt: 'An object moves in a circle at constant speed. Why is it accelerating?', choices: ['Its velocity direction changes', 'Its speed must increase', 'Its mass changes', 'Its radius is zero'], answer: 'Its velocity direction changes', explanation: 'Velocity includes direction, so continuously turning means continuously changing velocity.', skill: 'velocity and acceleration' },
  { prompt: 'Which direction does radial acceleration point?', choices: ['Toward the center', 'Tangent to the circle', 'Away from the center', 'Always upward'], answer: 'Toward the center', explanation: 'Centripetal or radial acceleration is inward at every point.', skill: 'vector directions' },
  { prompt: 'What is the tangential speed for radius r and angular speed ω?', choices: ['v = ωr', 'v = ω/r', 'v = r/ω', 'v = ω²r'], answer: 'v = ωr', explanation: 'A larger radius covers more arc length for the same angular change.', skill: 'angular relationships' },
  { prompt: 'If speed doubles at fixed radius, radial acceleration changes by what factor?', choices: ['4', '2', '1/2', '8'], answer: '4', explanation: 'Because aᵣ = v²/r, doubling v multiplies acceleration by four.', skill: 'proportional reasoning' },
  { prompt: 'What should be drawn as “centripetal force” on a free-body diagram?', choices: ['No extra force; identify the inward net force', 'A new force in addition to all interactions', 'Only gravity', 'A tangent force'], answer: 'No extra force; identify the inward net force', explanation: 'Centripetal describes the inward net-force role, not a separate interaction.', skill: 'force interpretation' },
];

export function CircularMotionModule() {
  const [mode, setMode] = useState<Mode>('explore');
  const [inputs, setInputs] = useState<CircularMotionInputs>({ radius: 4, angularSpeed: 1.2, direction: 1 });
  const [time, setTime] = useState(1.2);
  const modeCopy = {
    explore: 'Change radius, angular speed, direction, and time while watching tangent velocity and inward acceleration stay geometrically connected.',
    explain: 'Relate radians, period, tangential speed, and radial acceleration, then connect the equations to the moving vectors.',
    quiz: 'Test vector directions, angular relationships, proportional reasoning, and the meaning of centripetal force.',
    fun: 'Apply v = ωr, T = 2π/ω, and aᵣ = ω²r under time pressure. Chase a high score or set your own difficulty.',
  };
  return <LearningModuleShell eyebrow="Curved motion" title="Uniform Circular Motion Lab" intro={<>Constant speed does not mean constant velocity. <strong>The velocity turns continuously, so acceleration points inward.</strong></>} mode={mode} onModeChange={setMode} modeCopy={modeCopy} includeFunZone>
    {mode === 'explore' && <CircularExplore inputs={inputs} onInputsChange={setInputs} time={time} onTimeChange={setTime} />}
    {mode === 'explain' && <CircularExplain inputs={inputs} time={time} />}
    {mode === 'quiz' && <ConceptQuiz moduleId="uniform-circular-motion" questions={questions} onReviewExplain={() => setMode('explain')} />}
    {mode === 'fun' && <CircularMotionFunZone />}
  </LearningModuleShell>;
}

function CircularExplore({ inputs, onInputsChange, time, onTimeChange }: { inputs: CircularMotionInputs; onInputsChange: (inputs: CircularMotionInputs) => void; time: number; onTimeChange: (value: number) => void }) {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const state = circularMotionAtTime(inputs, time);
  const center = { x: 350, y: 185 };
  const displayRadius = 55 + inputs.radius * 18;
  const point = { x: center.x + displayRadius * Math.cos(state.theta), y: center.y - displayRadius * Math.sin(state.theta) };
  const tangentUnit = { x: -inputs.direction * Math.sin(state.theta), y: -inputs.direction * Math.cos(state.theta) };
  const inwardUnit = { x: -Math.cos(state.theta), y: Math.sin(state.theta) };
  const normalizedAngle = ((state.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const walkthroughSteps: WalkthroughStep[] = [
    {
      type: 'concept',
      title: "Constant Speed Isn't Constant Velocity",
      body: 'Velocity has both a size and a direction. An object moving in a circle at a perfectly steady speed still has a constantly changing velocity, because its direction keeps turning. A changing velocity means there is acceleration, even though the speed never changes.',
    },
    {
      type: 'task',
      title: 'Reach a Quarter Turn',
      instructions: ['Move the Time control until the object has traveled about one quarter of the way around the circle.', 'Watch how the velocity arrow rotates along with it.'],
      hint: `A quarter turn occurs near t = ${formatPhysicsNumber((Math.PI / 2) / inputs.angularSpeed)} s.`,
      observation: 'The velocity arrow has rotated 90° from where it started, even though its length — the speed — has not changed.',
      explanation: 'The velocity vector stays tangent to the circle at every instant. As the object moves around the circle, that tangent direction continuously rotates.',
      complete: Math.abs(normalizedAngle - Math.PI / 2) < 0.08,
    },
    {
      type: 'check',
      title: 'Check: Direction of Velocity',
      prompt: 'At any instant, which direction does the velocity vector point relative to the radius line?',
      choices: ['Tangent to the circle, perpendicular to the radius', 'Directly toward the center', 'Directly away from the center', 'Parallel to the radius'],
      answer: 'Tangent to the circle, perpendicular to the radius',
      explanation: 'Velocity is always tangent to the circular path, which makes it perpendicular to the radius line at every point.',
    },
    {
      type: 'task',
      title: 'Push the Inward Acceleration Higher',
      instructions: ['Increase the Radius or the Angular speed.', 'Get the radial acceleration above 35 m/s² — check the Live Orbit panel.'],
      hint: 'Angular speed has the biggest effect, since acceleration grows with its square.',
      observation: 'A larger radius or a faster angular speed both increase how hard the object is being pulled toward the center.',
      explanation: 'Radial acceleration is aᵣ = ω²r. Doubling the angular speed quadruples the acceleration, while doubling the radius only doubles it.',
      complete: state.radialAcceleration > 35,
    },
    {
      type: 'check',
      title: 'Check: Proportional Reasoning',
      prompt: 'If speed doubles while the radius stays fixed, the radial acceleration changes by what factor?',
      choices: ['4', '2', '1/2', '8'],
      answer: '4',
      explanation: 'Since aᵣ = v²/r, doubling v multiplies the acceleration by 2² = 4.',
    },
    {
      type: 'task',
      title: 'Reverse the Orbit',
      instructions: ['Switch the Direction control to clockwise.', 'Watch the velocity arrow flip while the inward acceleration arrow keeps pointing at the center.'],
      hint: 'Use the Direction buttons under Orbit Controls.',
      observation: 'The velocity arrow now points the opposite way along the circle, but the acceleration arrow still points straight at the center — its direction did not depend on which way the object was moving.',
      explanation: 'Radial acceleration always points toward the center regardless of rotation direction, because it exists only to continuously redirect the velocity, not to change its magnitude.',
      complete: inputs.direction === -1,
    },
    {
      type: 'task',
      title: 'Speed Up the Rotation',
      instructions: ['Raise the Angular speed until the Period shown in Cycle Measures drops to about 2.9 seconds or less.', 'Notice how much faster the object completes each lap.'],
      hint: 'Try an Angular speed of at least 2.2 rad/s.',
      observation: 'A higher angular speed means a shorter period — each full revolution takes less time.',
      explanation: 'Period and angular speed are inversely related: T = 2π/ω. As ω grows, T shrinks.',
      complete: inputs.angularSpeed >= 2.2,
    },
    {
      type: 'check',
      title: 'Mastery Check',
      prompt: 'A car rounds a curve at constant speed. What actually supplies the centripetal force that keeps it turning?',
      choices: ['Friction between the tires and the road', 'A separate centripetal force pushing outward', "The car's engine power alone", 'Air resistance on the windshield'],
      answer: 'Friction between the tires and the road',
      explanation: 'Centripetal force is not a new force of its own — it is the name for whichever real force (here, tire friction) supplies the net inward push needed for circular motion.',
    },
  ];
  return <div className={`topic-explore-layout ${walkthroughOpen ? 'walkthrough-active' : ''}`}>
    <div className="topic-main-column">
      <TopicWalkthrough storageKey="physics-motion-lab-uniform-circular-motion-walkthrough-v1" label="Uniform Circular Motion" steps={walkthroughSteps} onOpenChange={setWalkthroughOpen} />
      <figure className="topic-simulation" aria-labelledby="circular-scene-caption">
        <svg viewBox="0 0 700 380" role="img" aria-label="Circular path with tangent velocity and inward acceleration vectors">
          <defs><marker id="circular-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
          <rect width="700" height="380" className="topic-sky" />
          <circle cx={center.x} cy={center.y} r={displayRadius} className="orbit" />
          <line x1={center.x} y1={center.y} x2={point.x} y2={point.y} className="radius-line" />
          <circle cx={center.x} cy={center.y} r="6" className="orbit-center" />
          <line x1={point.x} y1={point.y} x2={point.x + tangentUnit.x * 85} y2={point.y + tangentUnit.y * 85} className="topic-velocity" markerEnd="url(#circular-arrow)" />
          <line x1={point.x} y1={point.y} x2={point.x + inwardUnit.x * 70} y2={point.y + inwardUnit.y * 70} className="topic-acceleration" markerEnd="url(#circular-arrow)" />
          <circle cx={point.x} cy={point.y} r="11" className="topic-object" />
          <text x={point.x + tangentUnit.x * 92} y={point.y + tangentUnit.y * 92} className="topic-svg-label velocity-label">v tangent</text>
          <text x={point.x + inwardUnit.x * 78} y={point.y + inwardUnit.y * 78} className="topic-svg-label acceleration-label">a inward</text>
          <text x="25" y="35" className="topic-svg-heading">θ = {formatPhysicsNumber(state.theta)} rad</text>
          <text x="25" y="62" className="topic-svg-label">Speed stays {formatPhysicsNumber(state.speed)} m/s</text>
        </svg>
        <figcaption id="circular-scene-caption">Velocity remains tangent to the path. Radial acceleration always points from the object toward the center.</figcaption>
      </figure>
      <section className="panel topic-controls">
        <div className="panel-title"><RotateCw aria-hidden="true" size={20} /><h2>Orbit Controls</h2></div>
        <div className="topic-control-grid">
          <RangeControl label="Radius" value={inputs.radius} min={1} max={7} step={0.1} unit="m" onChange={(radius) => onInputsChange({ ...inputs, radius })} />
          <RangeControl label="Angular speed" value={inputs.angularSpeed} min={0.3} max={3} step={0.1} unit="rad/s" onChange={(angularSpeed) => onInputsChange({ ...inputs, angularSpeed })} />
          <RangeControl label="Time" value={time} min={0} max={10} step={0.05} unit="s" onChange={onTimeChange} />
          <div className="direction-control"><span>Direction</span><div role="group" aria-label="Orbit direction"><button type="button" className={inputs.direction === 1 ? 'active' : ''} onClick={() => onInputsChange({ ...inputs, direction: 1 })}>Counterclockwise</button><button type="button" className={inputs.direction === -1 ? 'active' : ''} onClick={() => onInputsChange({ ...inputs, direction: -1 })}>Clockwise</button></div></div>
        </div>
      </section>
    </div>
    <aside className="topic-side-column">
      <section className="panel"><div className="panel-title"><Gauge aria-hidden="true" size={20} /><h2>Live Orbit</h2></div><MetricGrid metrics={[
        { label: 'Angular position', value: `${formatPhysicsNumber(state.theta)} rad` },
        { label: 'Position', value: `(${formatPhysicsNumber(state.position.x)}, ${formatPhysicsNumber(state.position.y)}) m` },
        { label: 'Tangential speed', value: `${formatPhysicsNumber(state.speed)} m/s` },
        { label: 'Radial acceleration', value: `${formatPhysicsNumber(state.radialAcceleration)} m/s²` },
      ]} /></section>
      <section className="panel"><div className="panel-title"><CircleDot aria-hidden="true" size={20} /><h2>Cycle Measures</h2></div><MetricGrid metrics={[
        { label: 'Period T', value: `${formatPhysicsNumber(state.period)} s` },
        { label: 'Frequency f', value: `${formatPhysicsNumber(state.frequency)} Hz` },
        { label: 'Direction', value: inputs.direction === 1 ? 'Counterclockwise' : 'Clockwise' },
      ]} /></section>
      <section className="panel equation-summary"><h2>Core Relationships</h2><code>v = ωr</code><code>aᵣ = v²/r = ω²r</code><code>T = 2π/ω</code><p className="sense-line">Velocity is perpendicular to the radius; acceleration is opposite the radius vector.</p></section>
      <ComponentBars x={state.position.x} y={state.position.y} radius={inputs.radius} />
    </aside>
  </div>;
}

function ComponentBars({ x, y, radius }: { x: number; y: number; radius: number }) {
  const width = (value: number) => Math.abs(value / radius) * 115;
  return <section className="panel component-bars"><h2>Cartesian Components</h2><div><span>x</span><i className={x >= 0 ? 'positive' : 'negative'} style={{ width: width(x) }} /><strong>{formatPhysicsNumber(x)} m</strong></div><div><span>y</span><i className={y >= 0 ? 'positive' : 'negative'} style={{ width: width(y) }} /><strong>{formatPhysicsNumber(y)} m</strong></div><p className="sense-line">The components oscillate while the radius stays constant.</p></section>;
}

function CircularExplain({ inputs, time }: { inputs: CircularMotionInputs; time: number }) {
  const state = circularMotionAtTime(inputs, time);
  return <ExplainView heading="Constant speed can still mean acceleration" summary="Follow the changing velocity direction from angular position to tangent motion and inward acceleration." steps={[
    { title: 'Locate the object.', body: `θ = ωt gives ${formatPhysicsNumber(state.theta)} rad at the selected time.` },
    { title: 'Draw the radius.', body: 'The position vector points from the center to the object.' },
    { title: 'Draw tangent velocity.', body: `v = ωr = ${formatPhysicsNumber(state.speed)} m/s, perpendicular to the radius.` },
    { title: 'Compare nearby velocities.', body: 'Their directions differ, so the change in velocity points inward.' },
    { title: 'Calculate radial acceleration.', body: `aᵣ = ω²r = ${formatPhysicsNumber(state.radialAcceleration)} m/s² toward the center.` },
  ]} concepts={[
    { title: 'Radians', body: <p>Radians connect angular displacement to arc length through s = rθ.</p> },
    { title: 'Period and frequency', body: <p>T is time per revolution; f is revolutions per second. They satisfy f = 1/T.</p> },
    { title: 'Changing basis', body: <p>Radial and tangential directions rotate with the object even when their magnitudes stay simple.</p> },
    { title: 'Force language', body: <p>Centripetal describes the inward net force. It is not an extra interaction to add to a free-body diagram.</p> },
  ]} misconceptions={[
    'Constant speed does not imply zero acceleration when direction changes.',
    'The velocity does not point toward the center; it is tangent to the path.',
    'Centripetal force is not a separate force in addition to tension, gravity, friction, or the normal force.',
  ]} />;
}
