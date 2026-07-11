import { useMemo, useState } from 'react';
import { Activity, Clock3, Waypoints } from 'lucide-react';
import { formatPhysicsNumber, linearMotionAtTime, type LinearMotionInputs } from '../physics/learningModules';
import { ConceptQuiz, ExplainView, GuidedChallenges, LearningModuleShell, MetricGrid, RangeControl, type ConceptQuestion, type CoreMode } from './LearningModuleShared';

const questions: ConceptQuestion[] = [
  { prompt: 'Dots are recorded at equal time intervals and get farther apart. What does that show?', choices: ['Speed is increasing', 'Time intervals are increasing', 'Acceleration is zero', 'The object is at rest'], answer: 'Speed is increasing', explanation: 'More distance covered during each equal interval means a greater speed.', skill: 'dot spacing' },
  { prompt: 'Velocity points right while acceleration points left. What is happening initially?', choices: ['The object is slowing down', 'The object must be stopped', 'The object has constant velocity', 'The object is speeding up to the right'], answer: 'The object is slowing down', explanation: 'Opposite velocity and acceleration directions reduce the speed until a possible reversal.', skill: 'vector reasoning' },
  { prompt: 'What does the slope of a position-time graph represent?', choices: ['Velocity', 'Acceleration', 'Distance', 'Force'], answer: 'Velocity', explanation: 'Position change divided by time change is velocity.', skill: 'graphs' },
  { prompt: 'Can an object have zero velocity and nonzero acceleration?', choices: ['Yes, at an instant such as a turnaround', 'No, never', 'Only if time stops', 'Only in circular motion'], answer: 'Yes, at an instant such as a turnaround', explanation: 'Velocity may pass through zero while acceleration continues to change it.', skill: 'acceleration' },
  { prompt: 'Which statement distinguishes distance and displacement?', choices: ['Distance is path length; displacement connects start to finish', 'They are always equal vectors', 'Displacement has no direction', 'Distance can be negative'], answer: 'Distance is path length; displacement connects start to finish', explanation: 'Distance is a nonnegative scalar; displacement is a vector change in position.', skill: 'representations' },
];

export function MotionDiagramsModule() {
  const [mode, setMode] = useState<CoreMode>('explore');
  const [inputs, setInputs] = useState<LinearMotionInputs>({ initialPosition: 0, initialVelocity: 2, acceleration: 0 });
  const [interval, setInterval] = useState(0.8);
  const [focusIndex, setFocusIndex] = useState(4);
  const modeCopy = {
    explore: 'Build an equal-time dot diagram and connect its spacing, arrows, data, and graphs to one motion model.',
    explain: 'Read motion diagrams in a consistent order: confirm equal times, inspect spacing, identify direction, then compare velocity and acceleration.',
    quiz: 'Interpret dot patterns, vectors, graph slopes, and motion reversals with immediate skill-based feedback.',
  };
  return <LearningModuleShell eyebrow="Multiple representations" title="Motion Diagram Studio" intro={<>One motion can be shown with dots, arrows, numbers, and graphs. <strong>Equal time intervals turn spacing into evidence about speed.</strong></>} mode={mode} onModeChange={setMode} modeCopy={modeCopy}>
    {mode === 'explore' && <MotionExplore inputs={inputs} onInputsChange={setInputs} interval={interval} onIntervalChange={setInterval} focusIndex={focusIndex} onFocusIndexChange={setFocusIndex} />}
    {mode === 'explain' && <MotionExplain inputs={inputs} interval={interval} focusIndex={focusIndex} />}
    {mode === 'quiz' && <ConceptQuiz moduleId="motion-diagrams" questions={questions} onReviewExplain={() => setMode('explain')} />}
  </LearningModuleShell>;
}

function MotionExplore({ inputs, onInputsChange, interval, onIntervalChange, focusIndex, onFocusIndexChange }: {
  inputs: LinearMotionInputs; onInputsChange: (inputs: LinearMotionInputs) => void; interval: number; onIntervalChange: (value: number) => void; focusIndex: number; onFocusIndexChange: (value: number) => void;
}) {
  const samples = useMemo(() => Array.from({ length: 8 }, (_, index) => ({ time: index * interval, ...linearMotionAtTime(inputs, index * interval) })), [inputs, interval]);
  const positions = samples.map((sample) => sample.position);
  const minimum = Math.min(...positions);
  const maximum = Math.max(...positions);
  const span = Math.max(1, maximum - minimum);
  const mapX = (position: number) => 65 + ((position - minimum) / span) * 590;
  const focused = samples[focusIndex];
  const finalVelocity = samples.at(-1)?.velocity ?? 0;
  const reversed = inputs.initialVelocity !== 0 && Math.sign(finalVelocity) !== Math.sign(inputs.initialVelocity);
  const setScenario = (scenario: 'constant' | 'speeding' | 'slowing' | 'reversing') => {
    const next = scenario === 'constant' ? { initialPosition: 0, initialVelocity: 2, acceleration: 0 }
      : scenario === 'speeding' ? { initialPosition: 0, initialVelocity: 0.8, acceleration: 1 }
        : scenario === 'slowing' ? { initialPosition: 0, initialVelocity: 4, acceleration: -0.7 }
          : { initialPosition: 0, initialVelocity: 3, acceleration: -1.4 };
    onInputsChange(next);
  };
  return <div className="topic-explore-layout">
    <div className="topic-main-column">
      <figure className="topic-simulation" aria-labelledby="motion-diagram-caption">
        <svg viewBox="0 0 720 300" role="img" aria-label="Equal-time motion diagram with velocity arrows">
          <defs><marker id="motion-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
          <rect width="720" height="300" className="topic-sky" />
          <line x1="35" y1="155" x2="685" y2="155" className="topic-ground" />
          {samples.map((sample, index) => {
            const x = mapX(sample.position);
            const arrowLength = Math.max(-55, Math.min(55, sample.velocity * 10));
            return <g key={sample.time} className={focusIndex === index ? 'focused-sample' : ''}>
              <circle cx={x} cy="155" r={focusIndex === index ? 11 : 7} className="motion-dot" />
              <text x={x} y="185" textAnchor="middle" className="topic-svg-label">{index}</text>
              <line x1={x} y1="130" x2={x + arrowLength} y2="130" className="topic-velocity" markerEnd="url(#motion-arrow)" />
            </g>;
          })}
          <text x="35" y="225" className="topic-svg-label">Dots are separated by Δt = {interval} s</text>
          <text x="35" y="250" className="topic-svg-label velocity-label">Arrows show instantaneous velocity</text>
        </svg>
        <figcaption id="motion-diagram-caption">Dot numbers show time order. Spacing describes speed; arrows preserve direction.</figcaption>
      </figure>
      <section className="panel topic-controls">
        <div className="panel-title"><Waypoints aria-hidden="true" size={20} /><h2>Motion Controls</h2></div>
        <div className="scenario-buttons" role="group" aria-label="Motion presets">
          <button type="button" onClick={() => setScenario('constant')}>Constant velocity</button>
          <button type="button" onClick={() => setScenario('speeding')}>Speeding up</button>
          <button type="button" onClick={() => setScenario('slowing')}>Slowing down</button>
          <button type="button" onClick={() => setScenario('reversing')}>Reverse direction</button>
        </div>
        <div className="topic-control-grid">
          <RangeControl label="Initial velocity" value={inputs.initialVelocity} min={-5} max={5} step={0.1} unit="m/s" onChange={(initialVelocity) => onInputsChange({ ...inputs, initialVelocity })} />
          <RangeControl label="Acceleration" value={inputs.acceleration} min={-2} max={2} step={0.1} unit="m/s²" onChange={(acceleration) => onInputsChange({ ...inputs, acceleration })} />
          <RangeControl label="Time interval" value={interval} min={0.4} max={1.5} step={0.1} unit="s" onChange={onIntervalChange} />
          <RangeControl label="Focus dot" value={focusIndex} min={0} max={7} step={1} unit="" onChange={onFocusIndexChange} />
        </div>
      </section>
      <GuidedChallenges challenges={[
        { title: 'Equal spacing', prompt: 'Create constant velocity so every equal-time displacement is the same.', hint: 'Set acceleration to zero.', complete: Math.abs(inputs.acceleration) < 0.05 && Math.abs(inputs.initialVelocity) > 0.2 },
        { title: 'Speeding up', prompt: 'Make velocity and acceleration point in the same direction.', hint: 'Give velocity and acceleration the same sign.', complete: inputs.initialVelocity * inputs.acceleration > 0.2 },
        { title: 'Turn around', prompt: 'Create a motion that reverses direction before the last dot.', hint: 'Acceleration must oppose the initial velocity strongly enough.', complete: reversed },
      ]} />
    </div>
    <aside className="topic-side-column">
      <section className="panel"><div className="panel-title"><Clock3 aria-hidden="true" size={20} /><h2>Focused Dot {focusIndex}</h2></div><MetricGrid metrics={[
        { label: 'Time', value: `${formatPhysicsNumber(focused.time)} s` },
        { label: 'Position', value: `${formatPhysicsNumber(focused.position)} m` },
        { label: 'Velocity', value: `${formatPhysicsNumber(focused.velocity)} m/s` },
        { label: 'Acceleration', value: `${formatPhysicsNumber(focused.acceleration)} m/s²` },
      ]} /></section>
      <MotionGraphs samples={samples} />
      <section className="panel reason-panel"><div className="panel-title"><Activity aria-hidden="true" size={20} /><h2>Read the Pattern</h2></div><p>{Math.abs(inputs.acceleration) < 0.05 ? 'Equal spacing indicates constant velocity.' : inputs.initialVelocity * inputs.acceleration >= 0 ? 'Velocity and acceleration initially align, so the object speeds up.' : reversed ? 'The spacing shrinks to a turnaround, then grows in the opposite direction.' : 'Acceleration opposes velocity, so the object slows down.'}</p></section>
    </aside>
  </div>;
}

function MotionGraphs({ samples }: { samples: Array<{ time: number; position: number; velocity: number }> }) {
  const pathFor = (values: number[], top: number) => {
    const min = Math.min(...values); const max = Math.max(...values); const span = Math.max(1, max - min);
    return values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${40 + index * 38} ${top + 70 - ((value - min) / span) * 55}`).join(' ');
  };
  return <section className="panel mini-graphs"><h2>Synchronized Graphs</h2><svg viewBox="0 0 340 210" role="img" aria-label="Position and velocity versus time graphs"><text x="8" y="24">x(t)</text><line x1="38" y1="85" x2="320" y2="85" className="graph-axis" /><path d={pathFor(samples.map((sample) => sample.position), 10)} className="position-graph" /><text x="8" y="124">v(t)</text><line x1="38" y1="185" x2="320" y2="185" className="graph-axis" /><path d={pathFor(samples.map((sample) => sample.velocity), 110)} className="velocity-graph" /></svg><p className="sense-line">Position slope is velocity; velocity slope is acceleration.</p></section>;
}

function MotionExplain({ inputs, interval, focusIndex }: { inputs: LinearMotionInputs; interval: number; focusIndex: number }) {
  const state = linearMotionAtTime(inputs, focusIndex * interval);
  return <ExplainView heading="Read dots before reaching for equations" summary="A reliable interpretation begins with the sampling interval and time order, then uses spacing and arrows as evidence." steps={[
    { title: 'Confirm equal times.', body: `Each dot is ${interval} s after the previous one.` },
    { title: 'Follow the order.', body: 'Dot labels show which direction the object travels, even if it turns around.' },
    { title: 'Inspect spacing.', body: 'Larger equal-time displacements mean greater speed.' },
    { title: 'Compare vectors.', body: `At focused dot ${focusIndex}, v = ${formatPhysicsNumber(state.velocity)} m/s and a = ${formatPhysicsNumber(state.acceleration)} m/s².` },
    { title: 'Connect the graphs.', body: 'Position slope gives velocity, and velocity slope gives acceleration.' },
  ]} concepts={[
    { title: 'Position vs. displacement', body: <p>Position locates an object relative to an origin. Displacement connects two positions and includes direction.</p> },
    { title: 'Speed vs. velocity', body: <p>Speed is the magnitude of velocity. A negative velocity is a direction, not a negative speed.</p> },
    { title: 'Zero velocity', body: <p>An object can stop for an instant while nonzero acceleration causes it to reverse.</p> },
    { title: 'Graph connections', body: <p>Slope and area connect position, velocity, and acceleration representations.</p> },
  ]} misconceptions={[
    'Dots farther apart do not mean that the recording interval became longer when intervals are explicitly equal.',
    'Acceleration does not always point in the direction of motion.',
    'A curved graph is not automatically a curved path through physical space.',
  ]} />;
}
