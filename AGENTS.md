# AGENTS.md

## Project Mission

Build an interactive website for physics students based on **Problem 3: Coordinate systems and kinematic relations** from the uploaded PHYS306 homework. The goal is to help students understand how the same physical projectile motion situation is written differently when the coordinate system is moved, rotated, flipped, or relabeled.

The website must emphasize this central idea:

> The motion does not change when the coordinate system changes. Only the coordinates, signs, component equations, and variable names change.

Problem 3 describes an object thrown horizontally from a cliff and passing over a wall. The generic constant-acceleration equations are given as:

```text
x(t) = x0 + vx0 t
y(t) = y0 + vy0 t + (1/2) a t^2
```

However, the problem asks students to rewrite these equations for multiple coordinate systems, accounting for:

- origin placement
- axis direction
- axis labels
- coordinate variables
- the fact that the gravitational acceleration has magnitude `g`
- the requirement that at `t = 0`, the object should be located at `{x0, y0}` in the chosen coordinate system

Known physical quantities:

```text
H, h, d1, d2, v0, g
```

The original prompt notes:

- For coordinate systems 1 through 4, the origin is at the top of the hill.
- If no axis variables are given, use `x` and `y` for horizontal and vertical.
- For coordinate system #10, the axis variables are swapped.

## Target Users

The target users are undergraduate physics students learning:

- 2D kinematics
- coordinate systems
- projectile motion
- vector components
- sign conventions
- the difference between physical motion and mathematical description

The website should be visually clear, interactive, and explanatory. It should not simply display formulas. It should help students reason through the formulas.

## Core Learning Goals

Students should be able to:

1. Identify the origin of a coordinate system.
2. Determine whether each axis points with or against the physical horizontal/vertical direction.
3. Translate physical initial position into coordinate values.
4. Translate initial velocity into coordinate components.
5. Translate gravitational acceleration into coordinate components.
6. Write correct component equations for a chosen coordinate system.
7. Explain why different equations can describe the same motion.
8. Recognize that flipping an axis changes signs.
9. Recognize that moving the origin changes initial coordinates.
10. Recognize that rotating axes changes which coordinate gets the acceleration term.
11. Recognize that relabeling axes changes the symbols but not the physics.

## Website Modes

The website must have three learning modes:

1. **Explore**
2. **Explain**
3. **Quiz**

Use a persistent top-level mode switcher so students can easily move among these modes.

---

# Mode 1: Explore

## Purpose

Explore mode is an interactive sandbox. Students manipulate the coordinate system and immediately see how the equations change.

## Required Features

### 1. Projectile Scene

Display a 2D diagram of the physical situation:

- cliff top
- cliff height `H`
- ground level
- wall located a horizontal distance `d1` from the cliff
- wall height `h`
- landing region beyond the wall
- additional horizontal distance `d2`
- projectile launched horizontally from the cliff top with speed `v0`
- gravitational acceleration downward with magnitude `g`

The physical scene should remain fixed.

### 2. Movable Coordinate System

Students must be able to manipulate the coordinate system in the scene.

Required controls:

- Drag the origin to a new location.
- Rotate the coordinate axes.
- Flip the horizontal-like axis.
- Flip the vertical-like axis.
- Reset to default.
- Select from preset coordinate systems matching the numbered systems in the homework figure.
- Toggle axis labels among:
  - `x, y`
  - `a, b`
  - `r, s`
  - custom labels
- Optionally swap coordinate variables, especially to model the homework’s note that #10 swaps horizontal and vertical variables.

### 3. Equation Panel

Show the component equations for the currently selected coordinate system.

The equations should update live as the coordinate system changes.

Use a clean mathematical display, preferably with MathJax or KaTeX.

The panel should show:

```text
coordinate_1(t) = coordinate_1,0 + v_coordinate_1,0 t + (1/2) a_coordinate_1 t^2
coordinate_2(t) = coordinate_2,0 + v_coordinate_2,0 t + (1/2) a_coordinate_2 t^2
```

Then show the simplified form after substituting the current coordinate system’s components.

### 4. Component Breakdown

Below the equations, show a breakdown table:

| Physical Quantity | Component Along Axis 1 | Component Along Axis 2 |
|---|---:|---:|
| Initial position | ... | ... |
| Initial velocity | ... | ... |
| Acceleration | ... | ... |

This table should change dynamically.

### 5. Visual Vectors

Show vectors on the diagram:

- initial velocity vector
- acceleration vector
- coordinate basis vector 1
- coordinate basis vector 2
- position vector from the chosen origin to the projectile

Use labels and arrows.

### 6. Invariant Physical Motion

Make clear that the projectile path in real space does not change.

The trajectory should remain visually fixed in world coordinates, while its coordinate description changes.

Include a small note:

> Same motion, different coordinate description.

### 7. Parameter Controls

Allow students to adjust:

- `H`
- `h`
- `d1`
- `d2`
- `v0`
- `g`

Use sliders with reasonable default values.

Example defaults:

```text
H = 20 m
h = 8 m
d1 = 15 m
d2 = 20 m
v0 = 12 m/s
g = 9.8 m/s^2
```

### 8. Time Slider

Include a time slider so students can move the projectile along its path.

Display the current physical position and coordinate values in the selected coordinate system.

---

# Mode 2: Explain

## Purpose

Explain mode should teach students how to derive the equations step by step.

## Required Features

### 1. Guided Derivation

For the selected coordinate system, explain the process in steps:

1. Locate the origin.
2. Identify the positive direction of each axis.
3. Determine the initial position coordinates.
4. Determine the initial velocity components.
5. Determine the acceleration components.
6. Substitute into the constant-acceleration equations.
7. Check whether the result makes physical sense.

### 2. Student-Friendly Language

Use clear wording such as:

- “Gravity always points downward in the physical picture.”
- “If the positive vertical axis points upward, gravity is negative.”
- “If the positive vertical axis points downward, gravity is positive.”
- “If the origin moves, the initial coordinates change even though the object did not move.”
- “If the axes are swapped, the acceleration term may appear in the other coordinate equation.”

### 3. Comparison View

Show side-by-side equations for:

- default coordinate system
- currently selected coordinate system

The goal is to help students see exactly what changed.

### 4. Sign Reasoning Prompts

Include short prompts such as:

- “Does positive vertical point with or against gravity?”
- “Does positive horizontal point with or against the launch velocity?”
- “Is the projectile initially above, below, left, or right of the origin?”
- “Which coordinate should contain the `-1/2 g t^2` or `+1/2 g t^2` term?”

### 5. Worked Examples

Include at least four worked examples:

1. Origin at cliff top, positive `x` right, positive `y` up.
2. Origin at cliff top, positive `x` right, positive `y` down.
3. Origin at ground below the cliff, positive `x` right, positive `y` up.
4. Swapped axes, where the vertical coordinate is named `x` and the horizontal coordinate is named `y`.

Each worked example should include:

- diagram
- initial coordinates
- velocity components
- acceleration components
- final equations
- one sentence explaining why the signs make sense

### 6. “Common Mistakes” Section

Include a section explaining common errors:

- forgetting that gravity is downward
- using `+g` automatically instead of checking axis direction
- assuming `x0 = 0` and `y0 = 0` for every coordinate system
- forgetting that the origin can move
- confusing the physical path with the coordinate description
- missing that swapped axes change which equation gets the gravitational term
- forgetting that `v0` is horizontal in the physical picture, not necessarily along the coordinate named `x`

---

# Mode 3: Quiz

## Purpose

Quiz mode should test whether students can reason about coordinate systems and kinematic equations.

## Quiz Types

Implement multiple question types.

### 1. Multiple Choice

Example:

> The positive vertical axis points upward. What is the vertical acceleration component?

Choices:

```text
A. -g
B. +g
C. 0
D. v0
```

### 2. Equation Selection

Show a coordinate system and ask students to select the correct equation pair.

### 3. Drag-and-Drop Components

Students drag these components into equation blanks:

```text
x0
y0
v0
-v0
g
-g
0
(1/2)gt^2
-(1/2)gt^2
```

### 4. Sign Check

Ask:

> Should the acceleration term in this coordinate be positive, negative, or zero?

### 5. Origin Check

Ask students to determine the initial coordinate values from a diagram.

### 6. Axis Swap Questions

Include questions where the vertical coordinate is not named `y`.

Example:

> In this coordinate system, the `x` axis points vertically downward and the `y` axis points horizontally right. Which equation contains the gravity term?

### 7. Short Explanation

Ask students to write one or two sentences explaining their reasoning.

For auto-feedback, compare against key ideas rather than exact wording.

## Feedback

Every quiz question must give immediate feedback.

Feedback should include:

- whether the answer is correct
- the correct answer
- a short explanation
- a link or button to review the relevant Explain section

## Scoring

Track:

- total score
- score by skill:
  - origin placement
  - axis orientation
  - velocity components
  - acceleration components
  - equation construction
  - swapped axes
- number of attempts
- improvement over time if local storage is used

Do not require login.

---

# Coordinate System Model

Use a general coordinate transformation model rather than hard-coding every equation.

## World Coordinates

Define world coordinates using a fixed physical frame:

```text
X_world: positive right
Y_world: positive upward
```

Use physical position:

```text
R_world(t) = R0_world + V0_world t + (1/2) A_world t^2
```

For the basic projectile:

```text
R0_world = [0, H]
V0_world = [v0, 0]
A_world = [0, -g]
```

## Coordinate System Representation

Represent a student coordinate system as:

```ts
type CoordinateSystem = {
  originWorld: Vector2;
  axis1: Vector2;       // unit vector in world coordinates
  axis2: Vector2;       // unit vector in world coordinates
  label1: string;
  label2: string;
};
```

The coordinate value of a world vector `R_world` should be:

```text
q1 = dot(R_world - originWorld, axis1)
q2 = dot(R_world - originWorld, axis2)
```

Velocity components:

```text
v1 = dot(V_world, axis1)
v2 = dot(V_world, axis2)
```

Acceleration components:

```text
a1 = dot(A_world, axis1)
a2 = dot(A_world, axis2)
```

Equations:

```text
q1(t) = q1_0 + v1_0 t + (1/2) a1 t^2
q2(t) = q2_0 + v2_0 t + (1/2) a2 t^2
```

## Special Case: Orthogonal Axes

For the main learning activity, keep axes orthogonal.

Students may rotate the coordinate system, but `axis1` and `axis2` should remain perpendicular unit vectors.

When students flip an axis, multiply that axis vector by `-1`.

When students rotate, rotate both axes together unless an advanced mode is later added.

## Symbolic Output

The website must present simplified symbolic equations where possible.

Examples:

Default coordinate system with origin at cliff top, `x` right and `y` up:

```text
x(t) = v0 t
y(t) = -1/2 g t^2
```

Origin at cliff top, `x` right and `y` down:

```text
x(t) = v0 t
y(t) = 1/2 g t^2
```

Origin at ground below cliff, `x` right and `y` up:

```text
x(t) = v0 t
y(t) = H - 1/2 g t^2
```

Swapped axes example, with `x` vertical up and `y` horizontal right:

```text
x(t) = H - 1/2 g t^2
y(t) = v0 t
```

If the coordinate system is rotated to a non-cardinal angle, symbolic simplification may use trigonometric expressions or numeric approximations.

---

# Suggested Technology Stack

Use one of the following stacks.

Preferred:

```text
Vite + React + TypeScript
```

Recommended libraries:

```text
React
TypeScript
KaTeX or MathJax
SVG for diagrams
Zustand or React Context for state
Vitest for unit tests
Playwright for end-to-end tests
```

Avoid unnecessary heavy dependencies.

Do not require a backend unless explicitly requested later.

All user progress may be stored in browser local storage.

---

# Suggested App Structure

```text
src/
  App.tsx
  main.tsx
  styles/
    globals.css
  components/
    SceneCanvas.tsx
    CoordinateAxes.tsx
    ProjectilePath.tsx
    EquationPanel.tsx
    ComponentBreakdown.tsx
    ParameterControls.tsx
    TimeSlider.tsx
    ModeSwitcher.tsx
    ExploreMode.tsx
    ExplainMode.tsx
    QuizMode.tsx
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
```

---

# Implementation Requirements

## 1. Accessibility

The website must be accessible.

Requirements:

- Keyboard-accessible controls.
- ARIA labels for sliders and interactive diagram controls.
- Color should not be the only way to communicate meaning.
- Equation changes should be readable by screen readers.
- Provide text descriptions of diagrams.
- Ensure adequate contrast.

## 2. Responsiveness

The website must work on:

- desktop
- tablet
- Chromebook-sized screens
- mobile, at least in a simplified stacked layout

## 3. Performance

The interaction should feel immediate.

Use SVG or Canvas efficiently.

For this project, SVG is preferred because coordinate axes, arrows, labels, and paths are easier to inspect and make accessible.

## 4. Pedagogical Design

Do not merely show correct formulas.

The website should repeatedly connect formulas to reasoning:

```text
origin → initial coordinate
axis direction → sign
axis label → variable name
gravity direction → acceleration component
launch direction → velocity component
```

Use visual highlighting when a student changes the coordinate system:

- Highlight changed signs.
- Highlight changed initial coordinate terms.
- Highlight which equation receives the gravity term.
- Highlight when variable labels are swapped.

## 5. No Hidden Hard-Coding

The app should not rely on a table of all final answers only.

It may include presets matching the homework image, but the equations should be generated from the coordinate transformation engine.

## 6. Clean Code

Use clear names:

```text
worldPosition
originWorld
axis1
axis2
initialVelocityWorld
accelerationWorld
projectToCoordinateSystem
formatEquation
```

Avoid vague names such as:

```text
thing
stuff
magic
temp
```

## 7. Testing Requirements

Write unit tests for:

- vector dot product
- vector normalization
- coordinate projection
- velocity component transformation
- acceleration component transformation
- default coordinate equations
- flipped vertical axis equations
- origin moved to ground equations
- swapped-axis equations

Write at least one end-to-end test verifying:

- selecting a coordinate preset updates the equations
- flipping an axis changes the sign of the appropriate term
- moving the origin changes initial coordinates but not velocity or acceleration components

---

# Formula Rules

The formula engine must follow these rules.

## Rule 1: Moving the Origin

Changing the origin affects position components only.

It does not change velocity or acceleration components.

## Rule 2: Flipping an Axis

Flipping an axis changes the sign of every component along that axis:

- initial position component
- velocity component
- acceleration component

## Rule 3: Rotating Axes

Rotating axes changes components by dot product projection.

## Rule 4: Relabeling Axes

Relabeling axes changes the variable names shown in equations.

It does not change the physical vectors.

## Rule 5: Swapping Axes

Swapping axes changes which equation represents which physical direction.

The gravity term belongs to the coordinate that has a component along physical downward direction.

---

# Preset Coordinate Systems

Create presets based on the numbered coordinate systems in the homework figure.

Because the source image is hand-drawn, implement these as editable presets rather than treating them as unquestionable final answers.

Each preset should define:

```ts
type CoordinatePreset = {
  id: string;
  name: string;
  description: string;
  originWorld: Vector2;
  axis1: Vector2;
  axis2: Vector2;
  label1: string;
  label2: string;
};
```

Include at least these conceptual presets:

```text
1. Origin at cliff top; axis1 right; axis2 up.
2. Origin at cliff top; axis1 left; axis2 up.
3. Origin at cliff top; axis1 left; axis2 down.
4. Origin at cliff top; axis1 right; axis2 down.
5. Origin at ground below cliff; axis1 right; axis2 up.
6. Origin at ground below cliff; axis1 right; axis2 down.
7. Origin at ground below cliff; axis1 left; axis2 down.
8. Origin at ground below cliff; axis1 left; axis2 up.
9. Origin near wall top; axis1 right; axis2 up.
10. Swapped variables; vertical coordinate named x and horizontal coordinate named y.
11. Origin near landing point; custom labels a and b.
12. Origin near landing point; flipped/custom labels a and b.
```

Do not assume these are the final answers unless verified against the course figure. The UI should allow the instructor to adjust presets.

---

# Content Copy

Use this short explanatory copy in the website.

## Landing Page Copy

```text
A projectile follows one path, but that path can be described by many different coordinate systems. In this activity, you will move, rotate, flip, and relabel the coordinate axes and watch the kinematic equations change. The physics stays the same; the description changes.
```

## Explore Mode Copy

```text
Move the coordinate system and watch the equations update. Pay attention to what changes and what does not. Moving the origin changes the initial coordinates. Flipping an axis changes signs. Relabeling an axis changes the symbols.
```

## Explain Mode Copy

```text
To write the equation correctly, do not start by memorizing signs. Start by asking: Where is the origin? Which way is positive? What direction is the velocity? What direction is gravity?
```

## Quiz Mode Copy

```text
Choose the correct equation by reasoning from the coordinate system. Look at the origin, the axis directions, the launch velocity, and gravity.
```

---

# Acceptance Criteria

The implementation is complete when:

1. The site has Explore, Explain, and Quiz modes.
2. The projectile scene is visually clear.
3. Students can move the coordinate origin.
4. Students can rotate the coordinate axes.
5. Students can flip each axis.
6. Students can relabel or swap coordinate variables.
7. Equations update immediately.
8. The component breakdown updates immediately.
9. The physical path remains fixed when only the coordinate system changes.
10. Explain mode walks through the reasoning process.
11. Quiz mode gives immediate feedback.
12. Unit tests confirm the coordinate transformation logic.
13. The site works without a backend.
14. The site is usable on a classroom projector and on student laptops.
15. The code is documented enough for a future instructor or AI coding agent to extend it.

---

# Development Workflow for AI Agents

When implementing this project:

1. Start by building the physics and coordinate-transformation engine.
2. Add unit tests for the engine before building the UI.
3. Build a static SVG scene.
4. Add coordinate-system controls.
5. Connect the equation panel.
6. Add Explain mode.
7. Add Quiz mode.
8. Add accessibility improvements.
9. Add responsive layout.
10. Run tests.
11. Write a short `README.md` explaining how to install, run, test, and build the project.

Do not skip the physics engine tests. The educational value of the website depends on trustworthy coordinate transformations.

---

# Out of Scope for Version 1

Do not implement these unless requested later:

- user accounts
- backend database
- LMS integration
- grade export
- multiplayer/classroom live mode
- non-orthogonal coordinate systems
- air resistance
- 3D motion
- special relativity content from the rest of the homework

---

# Final Note for Implementing Agent

The most important design principle is:

> Every equation shown to the student must be traceable to a visible choice in the coordinate system.

When a sign, term, or variable changes, the interface should help the student see why.
