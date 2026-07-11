import { useState } from 'react';
import { CircleDot, Gauge, RotateCw } from 'lucide-react';
import { circularMotionAtTime, formatPhysicsNumber, type CircularMotionInputs } from '../physics/learningModules';
import { ConceptQuiz, ExplainView, GuidedChallenges, LearningModuleShell, MetricGrid, RangeControl, type ConceptQuestion, type CoreMode } from './LearningModuleShared';

const questions: ConceptQuestion[] = [
  { prompt: 'An object moves in a circle at constant speed. Why is it accelerating?', choices: ['Its velocity direction changes', 'Its speed must increase', 'Its mass changes', 'Its radius is zero'], answer: 'Its velocity direction changes', explanation: 'Velocity includes direction, so continuously turning means continuously changing velocity.', skill: 'velocity and acceleration' },
  { prompt: 'Which direction does radial acceleration point?', choices: ['Toward the center', 'Tangent to the circle', 'Away from the center', 'Always upward'], answer: 'Toward the center', explanation: 'Centripetal or radial acceleration is inward at every point.', skill: 'vector directions' },
  { prompt: 'What is the tangential speed for radius r and angular speed ω?', choices: ['v = ωr', 'v = ω/r', 'v = r/ω', 'v = ω²r'], answer: 'v = ωr', explanation: 'A larger radius covers more arc length for the same angular change.', skill: 'angular relationships' },
  { prompt: 'If speed doubles at fixed radius, radial acceleration changes by what factor?', choices: ['4', '2', '1/2', '8'], answer: '4', explanation: 'Because aᵣ = v²/r, doubling v multiplies acceleration by four.', skill: 'proportional reasoning' },
  { prompt: 'What should be drawn as “centripetal force” on a free-body diagram?', choices: ['No extra force; identify the inward net force', 'A new force in addition to all interactions', 'Only gravity', 'A tangent force'], answer: 'No extra force; identify the inward net force', explanation: 'Centripetal describes the inward net-force role, not a separate interaction.', skill: 'force interpretation' },
];

export function CircularMotionModule() {
  const [mode, setMode] = useState<CoreMode>('explore');
  const [inputs, setInputs] = useState<CircularMotionInputs>({ radius: 4, angularSpeed: 1.2, direction: 1 });
  const [time, setTime] = useState(1.2);
  const modeCopy = {
    explore: 'Change radius, angular speed, direction, and time while watching tangent velocity and inward acceleration stay geometrically connected.',
    explain: 'Relate radians, period, tangential speed, and radial acceleration, then connect the equations to the moving vectors.',
    quiz: 'Test vector directions, angular relationships, proportional reasoning, and the meaning of centripetal force.',
  };
  return <LearningModuleShell eyebrow="Curved motion" title="Uniform Circular Motion Lab" intro={<>Constant speed does not mean constant velocity. <strong>The velocity turns continuously, so acceleration points inward.</strong></>} mode={mode} onModeChange={setMode} modeCopy={modeCopy}>
    {mode === 'explore' && <CircularExplore inputs={inputs} onInputsChange={setInputs} time={time} onTimeChange={setTime} />}
    {mode === 'explain' && <CircularExplain inputs={inputs} time={time} />}
    {mode === 'quiz' && <ConceptQuiz moduleId="uniform-circular-motion" questions={questions} onReviewExplain={() => setMode('explain')} />}
  </LearningModuleShell>;
}

function CircularExplore({ inputs, onInputsChange, time, onTimeChange }: { inputs: CircularMotionInputs; onInputsChange: (inputs: CircularMotionInputs) => void; time: number; onTimeChange: (value: number) => void }) {
  const state = circularMotionAtTime(inputs, time);
  const center = { x: 350, y: 185 };
  const displayRadius = 55 + inputs.radius * 18;
  const point = { x: center.x + displayRadius * Math.cos(state.theta), y: center.y - displayRadius * Math.sin(state.theta) };
  const tangentUnit = { x: -inputs.direction * Math.sin(state.theta), y: -inputs.direction * Math.cos(state.theta) };
  const inwardUnit = { x: -Math.cos(state.theta), y: Math.sin(state.theta) };
  const normalizedAngle = ((state.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return <div className="topic-explore-layout">
    <div className="topic-main-column">
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
      <GuidedChallenges challenges={[
        { title: 'Quarter turn', prompt: 'Move time until the object is approximately one quarter revolution from its start.', hint: `A quarter turn occurs near t = ${formatPhysicsNumber((Math.PI / 2) / inputs.angularSpeed)} s.`, complete: Math.abs(normalizedAngle - Math.PI / 2) < 0.08 },
        { title: 'Strong inward change', prompt: 'Create radial acceleration above 35 m/s².', hint: 'Acceleration grows with radius and with angular speed squared.', complete: state.radialAcceleration > 35 },
        { title: 'Reverse the orbit', prompt: 'Switch to clockwise motion and watch the velocity reverse while acceleration remains inward.', hint: 'Use the Direction buttons.', complete: inputs.direction === -1 },
      ]} />
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
