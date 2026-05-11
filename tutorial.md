# Coordinate Kinematics Lab Tutorial

This tutorial explains how this frontend project is put together. It is written for a complete beginner in frontend coding, so it starts with the big picture and then slowly walks into the actual code.

The project is an interactive website for physics students. Its central lesson is:

> The projectile's physical motion stays the same. Changing the coordinate system changes only the coordinate description.

Students can move the origin, rotate axes, flip axes, relabel variables, change projectile parameters, scrub through time, read the resulting equations, follow a guided explanation, and answer quiz questions.

## 1. Technology Summary

This project uses a modern frontend stack:

| Technology | What it does here |
| --- | --- |
| Vite | Runs the local development server and builds the website for production. |
| React | Builds the interface out of reusable components. |
| TypeScript | Adds types to JavaScript so data shapes are clearer and mistakes are easier to catch. |
| SVG | Draws the projectile scene, axes, vectors, wall, cliff, and trajectory. |
| KaTeX | Renders math equations in a clean textbook-like style. |
| Lucide React | Provides icons for buttons and section headings. |
| Vitest | Runs unit tests for the physics and formatting logic. |
| Playwright | Runs browser-level tests that click the real interface. |
| Local storage | Saves quiz progress in the student's browser without a backend. |

There is no server database. The app is a static frontend site.

## 2. How To Run The App

From the project folder:

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite, usually:

```text
http://127.0.0.1:3000
```

To run tests:

```bash
npm test
npm run e2e
```

To build the production version:

```bash
npm run build
```

## 3. Project Structure

Here is the main folder layout:

```text
src/
  App.tsx
  main.tsx
  styles/
    globals.css
  components/
    SceneCanvas.tsx
    ExploreMode.tsx
    ExplainMode.tsx
    QuizMode.tsx
    EquationPanel.tsx
    ComponentBreakdown.tsx
    ParameterControls.tsx
    TimeSlider.tsx
    ModeSwitcher.tsx
    MathBlock.tsx
  physics/
    vectors.ts
    projectile.ts
    coordinateSystem.ts
    equationFormatter.ts
    presets.ts
  quiz/
    questionTypes.ts
    questionBank.ts
    scoring.ts
  tests/
    coordinateSystem.test.ts
    projectile.test.ts
    equationFormatter.test.ts
e2e/
  app.spec.ts
```

The project has three important layers:

1. The physics layer in `src/physics`
2. The React interface layer in `src/components`
3. The quiz and testing layer in `src/quiz`, `src/tests`, and `e2e`

The most important design choice is that equations are not hard-coded in the UI. The UI asks the physics layer to calculate components and format equations.

## 4. The App In One Sentence

The app keeps one fixed world-coordinate projectile motion and repeatedly projects that motion onto whatever coordinate system the student chooses.

World coordinates are:

```text
X_world: positive right
Y_world: positive up
```

The projectile always starts at the top of the cliff:

```text
R0_world = (0, H)
V0_world = (v0, 0)
A_world = (0, -g)
```

The coordinate system can change:

```text
originWorld = where the coordinate origin is
axis1 = first unit axis direction in world coordinates
axis2 = second unit axis direction in world coordinates
label1 = first coordinate name
label2 = second coordinate name
```

Then a world point is converted into coordinate values using dot products:

```text
q1 = dot(R_world - originWorld, axis1)
q2 = dot(R_world - originWorld, axis2)
```

That is the mathematical heart of the whole app.

## 5. How The Browser App Starts

The browser starts with `index.html`, which contains a root element. React attaches the app to that element in `src/main.tsx`.

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './styles/globals.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Beginner notes:

- `import App from './App'` loads the main app component.
- `ReactDOM.createRoot(...)` tells React where to draw the interface.
- `globals.css` contains the site-wide styles.
- `katex.min.css` gives rendered equations their math styling.
- The `!` after `getElementById('root')` tells TypeScript, "Trust me, this element exists."

## 6. The Main App Component

The main app lives in `src/App.tsx`. It stores the shared state that several modes need.

Important state values:

```tsx
const [mode, setMode] = useState<Mode>('explore');
const [params, setParams] = useState<ProjectileParameters>(defaultParameters);
const [selectedPresetId, setSelectedPresetId] = useState('1');
const [system, setSystem] = useState<CoordinateSystem>(presets[0]);
const [time, setTime] = useState(0);
```

These mean:

| State | Meaning |
| --- | --- |
| `mode` | Which learning mode is visible: Explore, Explain, or Quiz. |
| `params` | Physical values like `H`, `h`, `d1`, `d2`, `v0`, and `g`. |
| `selectedPresetId` | Which coordinate preset is selected. |
| `system` | The currently active coordinate system. |
| `time` | The current time on the projectile path. |

React state is special because when it changes, React redraws the interface with the new values.

The app chooses which mode component to render:

```tsx
{mode === 'explore' && (
  <ExploreMode
    params={params}
    onParamsChange={updateParams}
    presets={presets}
    selectedPresetId={selectedPresetId}
    onPresetChange={selectPreset}
    system={system}
    onSystemChange={setSystem}
    time={time}
    onTimeChange={setTime}
  />
)}

{mode === 'explain' && <ExplainMode params={params} system={system} />}
{mode === 'quiz' && <QuizMode params={params} onReviewExplain={() => setMode('explain')} />}
```

This is a common React pattern: the parent component owns shared state, then passes values and update functions down to child components.

## 7. The Physics Engine

The physics engine is the most important part of this project because the educational value depends on trustworthy transformations.

### 7.1 Vector Math

The file `src/physics/vectors.ts` defines tiny helper functions for 2D vectors:

```ts
export type Vector2 = {
  x: number;
  y: number;
};

export const vector = (x: number, y: number): Vector2 => ({ x, y });

export const dot = (a: Vector2, b: Vector2): number => a.x * b.x + a.y * b.y;

export const normalize = (value: Vector2): Vector2 => {
  const length = magnitude(value);
  if (length === 0) {
    throw new Error('Cannot normalize a zero-length vector.');
  }
  return vector(value.x / length, value.y / length);
};
```

Beginner notes:

- A vector is represented as an object with `x` and `y`.
- `dot(a, b)` measures how much one vector points along another.
- `normalize(value)` turns a vector into a unit vector with length 1.
- Unit vectors matter because coordinate axes should measure distance correctly.

### 7.2 Projectile Motion

The file `src/physics/projectile.ts` defines the physical motion in fixed world coordinates.

```ts
export type ProjectileParameters = {
  H: number;
  h: number;
  d1: number;
  d2: number;
  v0: number;
  g: number;
};

export const defaultParameters: ProjectileParameters = {
  H: 20,
  h: 8,
  d1: 15,
  d2: 20,
  v0: 12,
  g: 9.8,
};
```

The world-coordinate vectors are:

```ts
export const initialPositionWorld = (params: ProjectileParameters): Vector2 =>
  vector(0, params.H);

export const initialVelocityWorld = (params: ProjectileParameters): Vector2 =>
  vector(params.v0, 0);

export const accelerationWorld = (params: ProjectileParameters): Vector2 =>
  vector(0, -params.g);
```

This encodes the physics:

- The projectile starts at `X = 0`, `Y = H`.
- It is thrown horizontally right with speed `v0`.
- Gravity points downward, so world acceleration is `(0, -g)`.

The position at any time uses the constant-acceleration equation:

```ts
export const worldPositionAtTime = (params: ProjectileParameters, time: number): Vector2 => {
  const r0 = initialPositionWorld(params);
  const v = initialVelocityWorld(params);
  const a = accelerationWorld(params);
  return add(add(r0, scale(v, time)), scale(a, 0.5 * time * time));
};
```

This matches:

```text
R(t) = R0 + V0 t + (1/2) A t^2
```

### 7.3 Coordinate Systems

The file `src/physics/coordinateSystem.ts` defines how a coordinate system is represented.

```ts
export type CoordinateSystem = {
  originWorld: Vector2;
  axis1: Vector2;
  axis2: Vector2;
  label1: string;
  label2: string;
  name?: string;
  description?: string;
};
```

This says that a coordinate system has:

- An origin in world coordinates
- Two axis directions in world coordinates
- Two labels, such as `x` and `y` or `a` and `b`

The key function is `projectWorldPoint`:

```ts
export const projectWorldPoint = (worldPoint: Vector2, system: CoordinateSystem): Vector2 => {
  const relative = subtract(worldPoint, system.originWorld);
  return vector(dot(relative, system.axis1), dot(relative, system.axis2));
};
```

Read this slowly:

1. `subtract(worldPoint, system.originWorld)` finds the vector from the chosen origin to the world point.
2. `dot(relative, system.axis1)` finds how much of that relative vector lies along axis 1.
3. `dot(relative, system.axis2)` finds how much lies along axis 2.

Velocity and acceleration use a similar projection, but without subtracting the origin:

```ts
export const projectWorldVector = (worldVector: Vector2, system: CoordinateSystem): Vector2 =>
  vector(dot(worldVector, system.axis1), dot(worldVector, system.axis2));
```

That is because moving the origin changes positions, but it does not change velocity or acceleration.

The app combines all three component calculations here:

```ts
export const getCoordinateComponents = (
  params: ProjectileParameters,
  system: CoordinateSystem,
): CoordinateComponents => ({
  position0: projectWorldPoint(initialPositionWorld(params), system),
  velocity0: projectWorldVector(initialVelocityWorld(params), system),
  acceleration: projectWorldVector(accelerationWorld(params), system),
});
```

This one function powers the component table, the equation formatter, and many tests.

### 7.4 Coordinate Transform Controls

The same file contains helper functions that update the coordinate system:

```ts
export const flipAxis = (system: CoordinateSystem, axis: 1 | 2): CoordinateSystem => ({
  ...system,
  axis1: axis === 1 ? scale(system.axis1, -1) : system.axis1,
  axis2: axis === 2 ? scale(system.axis2, -1) : system.axis2,
});
```

This function returns a new coordinate system with one axis multiplied by `-1`.

In React, returning a new object is important. It lets React detect that state changed.

Another helper swaps the variables:

```ts
export const swapCoordinateVariables = (system: CoordinateSystem): CoordinateSystem => ({
  ...system,
  axis1: system.axis2,
  axis2: system.axis1,
  label1: system.label2,
  label2: system.label1,
});
```

This captures the lesson that the coordinate named `x` is not always the horizontal coordinate.

## 8. Presets

The file `src/physics/presets.ts` defines the starting coordinate systems.

Example:

```ts
{
  id: '1',
  name: '1. Cliff top, x right, y up',
  description: 'Origin at launch point; horizontal positive right; vertical positive up.',
  originKey: 'cliffTop',
  originWorld: vector(0, params.H),
  axis1: vector(1, 0),
  axis2: vector(0, 1),
  label1: 'x',
  label2: 'y',
}
```

This means:

- Origin is at the launch point.
- Axis 1 points right.
- Axis 2 points up.
- The axis labels are `x` and `y`.

The swapped-axis preset is especially important:

```ts
{
  id: '10',
  name: '10. Swapped variables: x vertical, y horizontal',
  description: 'The coordinate named x is vertical upward; the coordinate named y is horizontal right.',
  originKey: 'groundBelowCliff',
  originWorld: vector(0, 0),
  axis1: vector(0, 1),
  axis2: vector(1, 0),
  label1: 'x',
  label2: 'y',
}
```

Here, `x` points upward and `y` points right. That means gravity appears in the `x(t)` equation, not the `y(t)` equation.

## 9. Equation Formatting

The file `src/physics/equationFormatter.ts` converts numeric and symbolic components into displayable equations.

For the default coordinate system, it should produce:

```text
x(t) = v0 t
y(t) = -1/2 g t^2
```

For the ground-origin system, it should produce:

```text
x(t) = v0 t
y(t) = H - 1/2 g t^2
```

The public function is:

```ts
export const formatEquationSet = (params: ProjectileParameters, system: CoordinateSystem): EquationSet => {
  const components = getCoordinateComponents(params, system);
  return {
    axis1: axisEquation(system.label1, system.axis1, system, params, {
      position: components.position0.x,
      velocity: components.velocity0.x,
      acceleration: components.acceleration.x,
    }),
    axis2: axisEquation(system.label2, system.axis2, system, params, {
      position: components.position0.y,
      velocity: components.velocity0.y,
      acceleration: components.acceleration.y,
    }),
  };
};
```

Notice the flow:

1. Get position, velocity, and acceleration components.
2. Build one equation for axis 1.
3. Build one equation for axis 2.
4. Use the current labels, so relabeling changes the displayed variables.

The formatter tries to use symbolic output when axes are cardinal directions, meaning right, left, up, or down.

This helper detects simple directions:

```ts
const isCardinal = (axis: Vector2): boolean =>
  [-1, 0, 1].includes(snap(axis.x)) && [-1, 0, 1].includes(snap(axis.y));
```

If axes are rotated to a non-cardinal angle, the formatter keeps the symbolic equation in terms of `sin(theta)` and `cos(theta)`, then displays a second numerical equation with the current values substituted.

## 10. The Explore Mode

Explore mode is in `src/components/ExploreMode.tsx`.

It combines:

- The SVG scene
- The time slider
- Coordinate controls
- Parameter sliders
- The equation panel
- The component breakdown table

The main JSX structure is:

```tsx
<div className="mode-layout explore-layout">
  <div className="primary-column">
    <SceneCanvas params={params} system={system} time={time} onSystemChange={onSystemChange} interactive />
    <TimeSlider params={params} time={time} onChange={onTimeChange} />
    {/* coordinate controls */}
    <ParameterControls params={params} onChange={onParamsChange} />
  </div>

  <aside className="side-column">
    <EquationPanel params={params} system={system} />
    <ComponentBreakdown params={params} system={system} />
  </aside>
</div>
```

Beginner notes:

- `params={params}` passes a value into a child component.
- `onSystemChange={onSystemChange}` passes a function into a child component.
- The child component can call that function to ask the parent to update state.

For example, the Flip buttons call physics helpers:

```tsx
<button type="button" className="tool-button" onClick={() => onSystemChange(flipAxis(system, 1))}>
  <FlipHorizontal aria-hidden="true" size={18} />
  Flip {system.label1}
</button>
```

When a student clicks the button:

1. `flipAxis(system, 1)` creates a new coordinate system.
2. `onSystemChange(...)` updates state in `App.tsx`.
3. React redraws the scene, equations, and table.

## 11. The SVG Scene

The visual diagram is in `src/components/SceneCanvas.tsx`.

It draws:

- Sky/background
- Ground
- Cliff
- Wall
- Dimension labels
- Projectile trajectory
- Projectile dot
- Velocity vector
- Acceleration vector
- Position vector from origin
- Coordinate axes
- Draggable origin handle

The scene uses SVG because SVG is excellent for crisp educational diagrams.

### 11.1 World Coordinates To Screen Coordinates

Physics uses world coordinates where positive `Y` is upward. Browser SVG coordinates usually have positive `Y` downward. So the app converts between them.

```ts
const toScreen = (point: Vector2): Vector2 =>
  vector(
    ((point.x - bounds.minX) / bounds.width) * screenWidth,
    screenHeight - ((point.y - bounds.minY) / bounds.height) * screenHeight,
  );
```

The first line maps world `x` to screen `x`.

The second line maps world `y` to screen `y`, but subtracts from `screenHeight` so that higher physical positions appear higher on screen.

### 11.2 Drawing The Trajectory

The projectile path is sampled in the physics layer:

```ts
const path = trajectorySamples(params);
```

Then it is converted into an SVG path string:

```ts
const pathD = path
  .map((point, index) => {
    const screen = toScreen(point);
    return `${index === 0 ? 'M' : 'L'} ${screen.x.toFixed(2)} ${screen.y.toFixed(2)}`;
  })
  .join(' ');
```

In SVG path syntax:

- `M` means "move to this point."
- `L` means "draw a line to this point."

The final path is rendered like this:

```tsx
<path d={pathD} className="trajectory" />
```

### 11.3 Dragging The Origin

The origin handle can be dragged with a pointer or moved with the keyboard.

Pointer movement calls:

```ts
const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
  if (!dragging || !interactive) return;
  updateOrigin(toWorld(event.clientX, event.clientY));
};
```

Keyboard movement calls:

```ts
const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
  if (!interactive) return;
  const step = event.shiftKey ? 2 : 0.5;
  const deltas: Record<string, Vector2> = {
    ArrowLeft: vector(-step, 0),
    ArrowRight: vector(step, 0),
    ArrowUp: vector(0, step),
    ArrowDown: vector(0, -step),
  };
  const delta = deltas[event.key];
  if (delta) {
    event.preventDefault();
    updateOrigin(add(system.originWorld, delta));
  }
};
```

That is an accessibility win: students who cannot or do not want to drag can still move the origin using arrow keys.

## 12. Equation Panel

The equation panel lives in `src/components/EquationPanel.tsx`.

It asks the formatter for the current equations:

```tsx
const equations = formatEquationSet(params, system);
```

Then it displays both the general form and simplified form:

```tsx
<MathBlock expression={equations.axis1.generalLatex} block />
<MathBlock expression={equations.axis2.generalLatex} block />

<MathBlock expression={equations.axis1.simplifiedLatex} block label={equations.axis1.simplifiedText} />
<p className="equation-text" data-testid={`equation-${system.label1}`}>
  {equations.axis1.simplifiedText}
</p>
```

The equation is displayed twice:

1. As a KaTeX-rendered math block for visual clarity.
2. As plain text for easier reading, accessibility, and testing.

The `data-testid` attribute lets Playwright find the equation during tests.

The panel also tells the student where gravity appears:

```tsx
const gravityAxis =
  equations.axis1.acceleration !== '0'
    ? system.label1
    : equations.axis2.acceleration !== '0'
      ? system.label2
      : 'neither coordinate';
```

That turns the abstract idea into a visible teaching hint.

## 13. Component Breakdown

The component table is in `src/components/ComponentBreakdown.tsx`.

It uses the same formatter as the equation panel:

```tsx
const equations = formatEquationSet(params, system);
const rows = [
  ['Initial position', equations.axis1.initialPosition, equations.axis2.initialPosition],
  ['Initial velocity', equations.axis1.initialVelocity, equations.axis2.initialVelocity],
  ['Acceleration', equations.axis1.acceleration, equations.axis2.acceleration],
];
```

This table reinforces the lesson:

```text
origin -> initial coordinate
axis direction -> sign
axis label -> variable name
gravity direction -> acceleration component
launch direction -> velocity component
```

The table headers use the current labels:

```tsx
<th>Along {system.label1}</th>
<th>Along {system.label2}</th>
```

So changing labels from `x, y` to `a, b` updates the table too.

## 14. Parameter Controls

The parameter sliders live in `src/components/ParameterControls.tsx`.

Each slider is defined in a data array:

```ts
const controls: Array<{ key: keyof ProjectileParameters; label: string; min: number; max: number; step: number; unit: string }> = [
  { key: 'H', label: 'Cliff height H', min: 6, max: 40, step: 1, unit: 'm' },
  { key: 'h', label: 'Wall height h', min: 1, max: 25, step: 1, unit: 'm' },
  { key: 'd1', label: 'Wall distance d1', min: 4, max: 35, step: 1, unit: 'm' },
  { key: 'd2', label: 'Landing distance d2', min: 5, max: 45, step: 1, unit: 'm' },
  { key: 'v0', label: 'Launch speed v0', min: 4, max: 25, step: 0.5, unit: 'm/s' },
  { key: 'g', label: 'Gravity g', min: 1, max: 15, step: 0.1, unit: 'm/s^2' },
];
```

Then React loops over that array:

```tsx
{controls.map((control) => (
  <label className="range-control" key={control.key}>
    <span>
      {control.label}
      <strong>
        {params[control.key]} {control.unit}
      </strong>
    </span>
    <input
      aria-label={control.label}
      type="range"
      min={control.min}
      max={control.max}
      step={control.step}
      value={params[control.key]}
      onChange={(event) => onChange({ ...params, [control.key]: Number(event.target.value) })}
    />
  </label>
))}
```

This is a common frontend technique: store repetitive UI definitions in an array, then map over the array.

## 15. Explain Mode

Explain mode lives in `src/components/ExplainMode.tsx`.

Its job is not just to show equations. It teaches a process:

1. Locate the origin.
2. Identify positive directions.
3. Determine initial position.
4. Determine initial velocity.
5. Determine acceleration.
6. Substitute into equations.
7. Check whether the answer makes sense.

The code directly renders that sequence:

```tsx
<ol className="derivation-list">
  <li>
    <strong>Locate the origin.</strong> Right now it is at world ({formatNumber(system.originWorld.x)},{' '}
    {formatNumber(system.originWorld.y)}), so the launch point is measured from there.
  </li>
  <li>
    <strong>Identify positive directions.</strong> Positive {system.label1} points {directionText(system.axis1)};
    positive {system.label2} points {directionText(system.axis2)}.
  </li>
  {/* more steps */}
</ol>
```

The helper `directionText` turns an axis vector into student-friendly words:

```ts
const directionText = (axis: { x: number; y: number }) => {
  const parts = [];
  if (Math.abs(axis.x) > 0.35) parts.push(axis.x > 0 ? 'right' : 'left');
  if (Math.abs(axis.y) > 0.35) parts.push(axis.y > 0 ? 'up' : 'down');
  return parts.join(' and ') || 'nearly zero';
};
```

So an axis like `(1, 0)` becomes `right`, and an axis like `(0, -1)` becomes `down`.

Explain mode also compares the default coordinate system to the current one:

```tsx
<div className="comparison-grid">
  <div>
    <h2>Default System</h2>
    <EquationPanel params={params} system={defaultSystem} compact />
  </div>
  <div>
    <h2>Current System</h2>
    <EquationPanel params={params} system={system} compact />
  </div>
</div>
```

This helps students see exactly what changed.

## 16. Quiz Mode

Quiz mode lives in `src/components/QuizMode.tsx`.

The questions are generated in `src/quiz/questionBank.ts`.

Example:

```ts
{
  id: 'vertical-up-acceleration',
  type: 'choice',
  prompt: 'The positive vertical axis points upward. What is the vertical acceleration component?',
  choices: ['-g', '+g', '0', 'v0'],
  answer: '-g',
  explanation: 'Gravity points downward, so it is opposite a positive-up vertical axis.',
  skill: 'acceleration components',
}
```

The quiz has multiple question types:

- Choice questions
- Equation selection questions
- Component builder questions
- Sign checks
- Origin checks
- Swapped-axis questions
- Short explanation questions

The component decides how to render a question based on `question.type`:

```tsx
{question.type === 'components' ? (
  <ComponentQuestion question={question} disabled={Boolean(feedback)} onAnswer={answerQuestion} />
) : question.type === 'short' ? (
  <ShortQuestion question={question} disabled={Boolean(feedback)} onAnswer={answerQuestion} />
) : (
  <ChoiceQuestion question={question} disabled={Boolean(feedback)} onAnswer={answerQuestion} />
)}
```

Beginner note: this is conditional rendering. React shows one component or another based on a value.

### 16.1 Immediate Feedback

When a student answers, the app compares the answer and sets feedback:

```ts
const submit = (correct: boolean, message: string) => {
  setFeedback({ correct, message });
  setScore((current) => updateScore(current, question.skill, correct));
};
```

Then the UI displays either a correct or incorrect feedback block:

```tsx
{feedback && (
  <div className={feedback.correct ? 'feedback correct' : 'feedback incorrect'} role="status">
    {feedback.correct ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
    <div>
      <strong>{feedback.correct ? 'Correct' : 'Not quite'}</strong>
      <p>{feedback.message}</p>
      <button type="button" onClick={onReviewExplain}>
        Review explanation
      </button>
      <button type="button" onClick={next}>
        Next question
      </button>
    </div>
  </div>
)}
```

The `role="status"` helps screen readers announce feedback.

### 16.2 Scoring

Scores are defined in `src/quiz/scoring.ts`.

```ts
export type QuizScore = {
  attempts: number;
  correct: number;
  bySkill: Record<QuizSkill, { attempts: number; correct: number }>;
  history: Array<{ date: string; correct: number; attempts: number }>;
};
```

The score tracks:

- Total attempts
- Total correct
- Attempts and correct answers by skill
- Recent history

The browser saves score data using local storage:

```ts
useEffect(() => {
  localStorage.setItem(storageKey, JSON.stringify(score));
}, [score]);
```

Local storage is built into browsers. It stores small pieces of data for the current site.

## 17. Styling And Layout

The styling lives in `src/styles/globals.css`.

The app uses CSS custom properties for repeated colors:

```css
:root {
  --ink: #18202a;
  --muted: #5c6773;
  --line: #cbd5df;
  --paper: #ffffff;
  --wash: #f4f7fa;
  --blue: #1f6feb;
  --teal: #16835f;
  --red: #c0392b;
  --amber: #a66500;
  --purple: #6f42c1;
}
```

That makes the visual design easier to maintain. For example, if you want all blue accents to change, you can change `--blue` once.

The Explore mode uses CSS Grid:

```css
.explore-layout {
  grid-template-columns: minmax(0, 1.55fr) minmax(360px, 0.75fr);
  align-items: start;
}
```

This creates a large left column for the scene and controls, plus a right column for equations and tables.

Responsive behavior is handled with media queries:

```css
@media (max-width: 1100px) {
  .explore-layout,
  .quiz-layout,
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
```

At narrower screen widths, the layout becomes a single column so it works on tablets and smaller laptops.

## 18. Accessibility Choices

Several accessibility details are already built in:

### 18.1 Labels For Controls

Sliders and selects have labels or `aria-label` values:

```tsx
<input
  aria-label="Rotate coordinate axes"
  type="range"
  min="-180"
  max="180"
  step="5"
  value={angle}
  onChange={(event) => onSystemChange(rotateTo(system, Number(event.target.value)))}
/>
```

This helps screen reader users understand what the control does.

### 18.2 Keyboard Origin Movement

The draggable coordinate origin can also be moved with arrow keys:

```tsx
<g
  tabIndex={interactive ? 0 : undefined}
  role={interactive ? 'slider' : undefined}
  aria-label="Coordinate origin. Drag or use arrow keys to move it."
  aria-valuetext={`origin X ${format(system.originWorld.x)} meters, Y ${format(system.originWorld.y)} meters`}
  onKeyDown={handleKeyDown}
>
```

### 18.3 Plain Text Equations

Rendered math is beautiful, but screen readers can struggle with complex generated HTML. The app also includes plain text equations:

```tsx
<p className="equation-text" data-testid={`equation-${system.label1}`}>
  {equations.axis1.simplifiedText}
</p>
```

This helps both accessibility and testing.

## 19. Tests

Testing is split into two types:

1. Unit tests with Vitest
2. End-to-end tests with Playwright

### 19.1 Unit Tests

Unit tests check small pieces of logic directly.

Example from `src/tests/coordinateSystem.test.ts`:

```ts
it('moves origin without changing velocity or acceleration components', () => {
  const defaultSystem = createPresets(defaultParameters)[0];
  const groundSystem = createPresets(defaultParameters)[4];
  const defaultComponents = getCoordinateComponents(defaultParameters, defaultSystem);
  const groundComponents = getCoordinateComponents(defaultParameters, groundSystem);

  expect(groundComponents.position0.y).toBe(defaultParameters.H);
  expect(groundComponents.velocity0).toEqual(defaultComponents.velocity0);
  expect(groundComponents.acceleration).toEqual(defaultComponents.acceleration);
});
```

This test protects a key learning goal:

> Moving the origin changes position components only.

Equation formatting tests check exact symbolic output:

```ts
it('formats swapped-axis equations', () => {
  const equations = formatEquationSet(defaultParameters, createPresets(defaultParameters)[9]);
  expect(equations.axis1.simplifiedText).toBe('x(t) = H - 1/2 g t^2');
  expect(equations.axis2.simplifiedText).toBe('y(t) = v0 t');
});
```

This protects the swapped-axis lesson.

### 19.2 End-To-End Tests

End-to-end tests open the real browser app and interact with it.

Example from `e2e/app.spec.ts`:

```ts
test('flipping an axis changes the sign of the matching term', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('equation-y')).toContainText('y(t) = -1/2 g t^2');
  await page.getByRole('button', { name: /Flip y/ }).click();
  await expect(page.getByTestId('equation-y')).toContainText('y(t) = 1/2 g t^2');
});
```

This test checks that the interface and the physics logic work together.

## 20. Data Flow Walkthrough

Here is what happens when a student flips the vertical axis:

1. The student clicks `Flip y`.
2. `ExploreMode` calls `flipAxis(system, 2)`.
3. `flipAxis` multiplies `axis2` by `-1`.
4. `onSystemChange` updates React state in `App.tsx`.
5. React rerenders child components with the new `system`.
6. `SceneCanvas` draws the flipped axis.
7. `EquationPanel` calls `formatEquationSet(params, system)`.
8. `formatEquationSet` calls `getCoordinateComponents`.
9. Gravity is projected onto the new axis direction.
10. The displayed equation changes from `-1/2 g t^2` to `+1/2 g t^2`.

Here is what happens when a student moves the origin:

1. The student drags the origin handle or uses the origin sliders.
2. `originWorld` changes.
3. `projectWorldPoint` calculates a new initial position.
4. `projectWorldVector` leaves velocity and acceleration unchanged.
5. The component breakdown table shows new initial coordinates.
6. The velocity and acceleration rows stay the same.

This is exactly the learning goal the app is trying to make visible.

## 21. Common Beginner Concepts Used In This Code

### 21.1 Components

A React component is a reusable piece of interface.

Example:

```tsx
export function TimeSlider({ params, time, onChange }: Props) {
  return (
    <section className="panel compact-panel" aria-labelledby="time-heading">
      {/* JSX goes here */}
    </section>
  );
}
```

Components receive inputs called props.

### 21.2 Props

Props are values passed from a parent component to a child component.

```tsx
<TimeSlider params={params} time={time} onChange={onTimeChange} />
```

Here, `TimeSlider` receives:

- `params`
- `time`
- `onChange`

### 21.3 State

State is data React remembers and redraws when it changes.

```tsx
const [time, setTime] = useState(0);
```

This creates:

- `time`, the current value
- `setTime`, the function used to change it

### 21.4 Event Handlers

Event handlers are functions that run when the user does something.

```tsx
onChange={(event) => onChange(Number(event.target.value))}
```

This runs when a slider changes.

### 21.5 Conditional Rendering

React can show different UI based on state:

```tsx
{mode === 'quiz' && <QuizMode params={params} onReviewExplain={() => setMode('explain')} />}
```

This means "show `QuizMode` only when `mode` is `quiz`."

### 21.6 Mapping Arrays To UI

React can turn arrays into repeated UI:

```tsx
{presets.map((preset) => (
  <option key={preset.id} value={preset.id}>
    {preset.name}
  </option>
))}
```

This creates one `<option>` for every coordinate preset.

## 22. How To Add A New Coordinate Preset

Open `src/physics/presets.ts` and add another object to the array returned by `createPresets`.

Example:

```ts
{
  id: '13',
  name: '13. Wall top, x left, y up',
  description: 'Origin at the wall top with horizontal positive left.',
  originKey: 'wallTop',
  originWorld: vector(params.d1, params.h),
  axis1: vector(-1, 0),
  axis2: vector(0, 1),
  label1: 'x',
  label2: 'y',
}
```

Because the app uses the general coordinate transformation engine, you do not need to hard-code its final equations. The equation panel will calculate them.

## 23. How To Add A New Quiz Question

Open `src/quiz/questionBank.ts` and add a new question object to the returned array.

Example:

```ts
{
  id: 'horizontal-left-velocity',
  type: 'choice',
  prompt: 'If the positive horizontal axis points left, what is the launch velocity component along that axis?',
  choices: ['v0', '-v0', 'g', '0'],
  answer: '-v0',
  explanation: 'The projectile is launched to the right, which is opposite a positive-left axis.',
  skill: 'velocity components',
}
```

Make sure the `skill` value is one of the skills defined in `src/quiz/questionTypes.ts`.

## 24. How To Change The Visual Design

Most visual styling is in `src/styles/globals.css`.

Useful places to start:

- Change colors in the `:root` variables.
- Change layout widths in `.explore-layout`.
- Change card styles in `.panel`.
- Change scene colors in `.sky`, `.cliff`, `.wall`, `.trajectory`, `.axis`, and vector classes.
- Change mobile behavior in the `@media` sections.

For example, to make the trajectory thicker:

```css
.trajectory {
  fill: none;
  stroke: var(--amber);
  stroke-width: 5;
}
```

## 25. High-Level Code Review

The strongest part of the codebase is the separation between physics and display.

The physics files do not know about React. They simply calculate vectors, projections, and equations. This makes them easy to test.

The React components mostly focus on:

- Rendering controls
- Rendering diagrams
- Passing user choices into state
- Calling the physics layer for calculated values

This is good architecture for an educational app because it keeps the core math trustworthy and reusable.

The tests also cover the highest-risk concepts:

- Dot products
- Vector normalization
- Coordinate projection
- Velocity transformation
- Acceleration transformation
- Default equations
- Flipped-axis equations
- Moved-origin equations
- Swapped-axis equations

## 26. Five Suggestions For Improvement Based On Self-Review

1. Add true drag-and-drop for the component-builder quiz.

   The current quiz lets students click components into blanks, which works, but the requirements describe drag-and-drop. A future version could add keyboard-accessible drag-and-drop or a more polished click-to-place interaction with better visual affordances.

2. Add more visual highlighting when terms change.

   The app explains that signs, labels, and initial coordinates change, but it could make changes more obvious by briefly highlighting the exact equation term that changed after a flip, origin move, or label swap.

3. Make rotated-axis notation more instructor-configurable.

   Rotated axes now show `sin(theta)` and `cos(theta)`, but a future version could let instructors choose whether theta is measured from axis 1, the vertical direction, or a preset diagram angle.

4. Add more end-to-end tests for mobile and keyboard interactions.

   The current Playwright tests cover major equation updates. More tests could verify mobile layout, keyboard movement of the origin, label changes, quiz feedback, and local-storage scoring.

5. Make presets editable and savable for instructors.

   Presets are defined in code right now. Since the homework figure is hand-drawn and may need instructor adjustment, a future feature could let instructors edit preset origins, axis directions, labels, and descriptions in the browser and export/import the configuration.
