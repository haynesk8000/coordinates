import { useState } from 'react';
import { Anchor, Navigation, Waves } from 'lucide-react';
import { formatPhysicsNumber, relativeVelocityState, type RelativeMotionInputs } from '../physics/learningModules';
import { ConceptQuiz, ExplainView, GuidedChallenges, LearningModuleShell, MetricGrid, RangeControl, type ConceptQuestion, type CoreMode } from './LearningModuleShared';

const questions: ConceptQuestion[] = [
  { prompt: 'A passenger walks forward at 2 m/s inside a train moving forward at 10 m/s. What is the passenger speed relative to the ground?', choices: ['12 m/s', '8 m/s', '2 m/s', '20 m/s'], answer: '12 m/s', explanation: 'The aligned velocities add: passenger/train plus train/ground.', skill: 'velocity addition' },
  { prompt: 'What does v_A/B mean?', choices: ['Velocity of A relative to B', 'Velocity of B relative to A', 'Acceleration of A', 'Distance from A to B'], answer: 'Velocity of A relative to B', explanation: 'The first label is the object; the second is the reference frame.', skill: 'notation' },
  { prompt: 'A boat points directly across a river with a downstream current. Where does it arrive?', choices: ['Downstream from the point directly across', 'Directly across', 'Upstream', 'At its starting point'], answer: 'Downstream from the point directly across', explanation: 'The current contributes a downstream ground-velocity component.', skill: 'two-dimensional motion' },
  { prompt: 'Between frames moving at constant relative velocity, which quantity is unchanged in the introductory Galilean model?', choices: ['Acceleration', 'Position', 'Velocity', 'Coordinate value'], answer: 'Acceleration', explanation: 'Positions and velocities differ, while acceleration is the same between constant-velocity inertial frames.', skill: 'invariants' },
  { prompt: 'How is changing to a moving frame different from only rotating axes?', choices: ['A moving frame changes measured velocities', 'They are always identical', 'Rotating axes changes the physical event', 'A moving frame removes time'], answer: 'A moving frame changes measured velocities', explanation: 'Axis changes alter components; observer motion also changes the velocity assigned to an object.', skill: 'reference frames' },
];

export function RelativeMotionModule() {
  const [mode, setMode] = useState<CoreMode>('explore');
  const [inputs, setInputs] = useState<RelativeMotionInputs>({ boatSpeed: 5, headingDegrees: 90, currentSpeed: 2, riverWidth: 20 });
  const [progress, setProgress] = useState(65);
  const modeCopy = {
    explore: 'Compare shore and water-frame views while building the ground velocity from two visible vectors.',
    explain: 'Name the object and frame for every velocity, arrange a vector equation, then check its direction in both views.',
    quiz: 'Practice notation, vector addition, crossings, and frame invariants with immediate explanations.',
  };
  return <LearningModuleShell eyebrow="Moving reference frames" title="Relative Motion Navigator" intro={<>A velocity is incomplete until its reference frame is named. <strong>The same boat has different velocities relative to the water and shore.</strong></>} mode={mode} onModeChange={setMode} modeCopy={modeCopy}>
    {mode === 'explore' && <RelativeExplore inputs={inputs} onInputsChange={setInputs} progress={progress} onProgressChange={setProgress} />}
    {mode === 'explain' && <RelativeExplain inputs={inputs} />}
    {mode === 'quiz' && <ConceptQuiz moduleId="relative-motion" questions={questions} onReviewExplain={() => setMode('explain')} />}
  </LearningModuleShell>;
}

function RelativeExplore({ inputs, onInputsChange, progress, onProgressChange }: { inputs: RelativeMotionInputs; onInputsChange: (inputs: RelativeMotionInputs) => void; progress: number; onProgressChange: (value: number) => void }) {
  const relative = relativeVelocityState(inputs);
  const crossingTime = Number.isFinite(relative.crossingTime) ? relative.crossingTime : 0;
  const time = crossingTime * (progress / 100);
  const shorePosition = { x: relative.boatRelativeGround.x * time, y: relative.boatRelativeGround.y * time };
  const waterPosition = { x: relative.boatRelativeWater.x * time, y: relative.boatRelativeWater.y * time };
  const scaleY = 8;
  const waterFinalX = relative.boatRelativeWater.x * crossingTime;
  const scaleX = 130 / Math.max(10, Math.abs(relative.downstreamDrift), Math.abs(waterFinalX));
  const boatY = 260 - shorePosition.y * scaleY;
  const waterBoatY = 260 - waterPosition.y * scaleY;
  const cancelHeading = Math.acos(Math.min(1, inputs.currentSpeed / inputs.boatSpeed)) * 180 / Math.PI;
  const upstreamCancelHeading = 180 - cancelHeading;
  return <div className="topic-explore-layout">
    <div className="topic-main-column">
      <figure className="topic-simulation" aria-labelledby="relative-scene-caption">
        <svg viewBox="0 0 760 350" role="img" aria-label="Boat crossing shown in shore and water reference frames">
          <defs><marker id="relative-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
          <rect width="760" height="350" className="topic-sky" />
          <text x="190" y="28" textAnchor="middle" className="topic-svg-heading">Shore frame</text>
          <text x="570" y="28" textAnchor="middle" className="topic-svg-heading">Water frame</text>
          <line x1="380" y1="15" x2="380" y2="330" className="frame-divider" />
          {[0, 1].map((panel) => <g key={panel}><rect x={panel * 380 + 35} y="65" width="310" height="200" className="river" /><line x1={panel * 380 + 35} y1="65" x2={panel * 380 + 345} y2="65" className="river-bank" /><line x1={panel * 380 + 35} y1="265" x2={panel * 380 + 345} y2="265" className="river-bank" /></g>)}
          <line x1="190" y1="260" x2={190 + shorePosition.x * scaleX} y2={boatY} className="topic-path relative-path" />
          <line x1="570" y1="260" x2={570 + waterPosition.x * scaleX} y2={waterBoatY} className="topic-path relative-path" />
          <g transform={`translate(${190 + shorePosition.x * scaleX} ${boatY})`}><path d="M -13 8 L 0 -12 L 13 8 Z" className="boat" /></g>
          <g transform={`translate(${570 + waterPosition.x * scaleX} ${waterBoatY})`}><path d="M -13 8 L 0 -12 L 13 8 Z" className="boat" /></g>
          <line x1="80" y1="305" x2={80 + relative.boatRelativeWater.x * 18} y2={305 - relative.boatRelativeWater.y * 18} className="topic-velocity" markerEnd="url(#relative-arrow)" />
          <line x1="80" y1="305" x2={80 + relative.waterRelativeGround.x * 18} y2="305" className="current-vector" markerEnd="url(#relative-arrow)" />
          <line x1="80" y1="305" x2={80 + relative.boatRelativeGround.x * 18} y2={305 - relative.boatRelativeGround.y * 18} className="result-vector" markerEnd="url(#relative-arrow)" />
          <text x="45" y="330" className="topic-svg-label">Vector sum: boat/water + water/ground = boat/ground</text>
        </svg>
        <figcaption id="relative-scene-caption">The shore frame includes the current. The water frame removes the water's motion but not the boat's motion through the water.</figcaption>
      </figure>
      <section className="panel topic-controls">
        <div className="panel-title"><Navigation aria-hidden="true" size={20} /><h2>Navigation Controls</h2></div>
        <div className="topic-control-grid">
          <RangeControl label="Boat speed through water" value={inputs.boatSpeed} min={2} max={8} step={0.1} unit="m/s" onChange={(boatSpeed) => onInputsChange({ ...inputs, boatSpeed })} />
          <RangeControl label="Current speed" value={inputs.currentSpeed} min={0} max={5} step={0.1} unit="m/s" onChange={(currentSpeed) => onInputsChange({ ...inputs, currentSpeed })} />
          <RangeControl label="Heading from +x" value={inputs.headingDegrees} min={30} max={170} step={1} unit="°" onChange={(headingDegrees) => onInputsChange({ ...inputs, headingDegrees })} />
          <RangeControl label="Crossing progress" value={progress} min={0} max={100} step={1} unit="%" onChange={onProgressChange} />
        </div>
      </section>
      <GuidedChallenges challenges={[
        { title: 'Point straight across', prompt: 'Aim at 90°. Observe that pointing straight across does not make the ground path straight across.', hint: 'Set Heading from +x to 90°.', complete: inputs.headingDegrees === 90 && inputs.currentSpeed > 0.2 },
        { title: 'Cancel the drift', prompt: 'Aim upstream until the ground velocity has almost no downstream component.', hint: inputs.currentSpeed >= inputs.boatSpeed ? 'First increase boat speed above the current speed.' : `Try a heading near ${formatPhysicsNumber(upstreamCancelHeading, 0)}° for the current settings.`, complete: Math.abs(relative.boatRelativeGround.x) < 0.12 },
        { title: 'Remove frame motion', prompt: 'Set the current to zero and compare the two paths.', hint: 'Move Current speed to 0.', complete: inputs.currentSpeed === 0 },
      ]} />
    </div>
    <aside className="topic-side-column">
      <section className="panel"><div className="panel-title"><Anchor aria-hidden="true" size={20} /><h2>Velocity Triangle</h2></div><MetricGrid metrics={[
        { label: 'v boat/water', value: `(${formatPhysicsNumber(relative.boatRelativeWater.x)}, ${formatPhysicsNumber(relative.boatRelativeWater.y)}) m/s` },
        { label: 'v water/ground', value: `(${formatPhysicsNumber(relative.waterRelativeGround.x)}, 0) m/s` },
        { label: 'v boat/ground', value: `(${formatPhysicsNumber(relative.boatRelativeGround.x)}, ${formatPhysicsNumber(relative.boatRelativeGround.y)}) m/s` },
      ]} /></section>
      <section className="panel"><div className="panel-title"><Waves aria-hidden="true" size={20} /><h2>Crossing Result</h2></div><MetricGrid metrics={[
        { label: 'Crossing time', value: `${formatPhysicsNumber(relative.crossingTime)} s` },
        { label: 'Downstream drift', value: `${formatPhysicsNumber(relative.downstreamDrift)} m` },
        { label: 'Current time', value: `${formatPhysicsNumber(time)} s` },
        { label: 'Shore position', value: `(${formatPhysicsNumber(shorePosition.x)}, ${formatPhysicsNumber(shorePosition.y)}) m` },
      ]} /></section>
      <section className="panel equation-summary"><h2>Frame Equation</h2><code>v⃗BG = v⃗BW + v⃗WG</code><p className="sense-line">Read each subscript as “first object relative to second frame.”</p></section>
    </aside>
  </div>;
}

function RelativeExplain({ inputs }: { inputs: RelativeMotionInputs }) {
  const state = relativeVelocityState(inputs);
  return <ExplainView heading="Name the frame before using a number" summary="Relative-motion equations become manageable when every vector says what moves and what observes it." steps={[
    { title: 'Define the frames.', body: 'B is the boat, W is the water, and G is the ground or shore.' },
    { title: 'Write the vector chain.', body: 'v⃗BG = v⃗BW + v⃗WG connects the boat to the ground through the water.' },
    { title: 'Resolve components.', body: `The current contributes (${inputs.currentSpeed}, 0) m/s while the boat/water vector follows the selected heading.` },
    { title: 'Add matching components.', body: `The resulting ground velocity is (${formatPhysicsNumber(state.boatRelativeGround.x)}, ${formatPhysicsNumber(state.boatRelativeGround.y)}) m/s.` },
    { title: 'Interpret the path.', body: `That velocity gives a crossing time of ${formatPhysicsNumber(state.crossingTime)} s and drift of ${formatPhysicsNumber(state.downstreamDrift)} m.` },
  ]} concepts={[
    { title: 'Observer dependence', body: <p>Position and velocity depend on the observer. Two reports can differ and still describe the same event.</p> },
    { title: 'Inertial-frame invariant', body: <p>Acceleration is unchanged between frames moving at constant relative velocity in the introductory Galilean model.</p> },
    { title: 'Heading versus track', body: <p>The boat can point upstream while its ground path goes straight across or even downstream.</p> },
    { title: 'Axes versus frames', body: <p>Rotating axes changes components. Giving the observer a velocity changes the measured velocity itself.</p> },
  ]} misconceptions={[
    'Pointing directly across is not the same as arriving directly across when a current is present.',
    'Relative velocities are vectors; their magnitudes cannot always be added as ordinary numbers.',
    'Switching the order of the subscripts reverses the relative-velocity vector.',
  ]} />;
}
