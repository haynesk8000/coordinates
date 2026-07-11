# Future Physics Module Documentation

## Document Purpose

This document defines the educational scope for the four top-level modules that currently contain placeholder content:

1. Projectile Motion
2. Motion Diagrams
3. Relative Motion
4. Uniform Circular Motion

The modules should extend the teaching approach established by Coordinate Systems. Every mathematical representation should remain connected to a visible physical situation, and students should be asked to predict, inspect, explain, and test ideas rather than only read formulas.

Across all four modules, development should preserve the following instructional sequence:

> physical situation → vectors → components or representations → equations → physical interpretation

Each module should eventually support the application's Explore, Explain, and Quiz modes. Explore should emphasize prediction and manipulation, Explain should make the reasoning traceable step by step, and Quiz should provide immediate feedback tied to specific skills.

---

# Projectile Motion

## Description

Projectile Motion focuses on objects moving in two dimensions under the influence of gravity. Students will investigate launches from the ground, elevated locations, and horizontal or angled starting directions while connecting the visible path to position, velocity, and acceleration components.

The module should build directly on Coordinate Systems. A projectile follows one physical trajectory, while the signs, components, and equations used to describe it depend on the selected origin and axis directions. The initial version should use constant downward gravitational acceleration and neglect air resistance.

## Purpose

The purpose of this module is to help students treat projectile motion as a combination of simultaneous horizontal and vertical motion rather than as a collection of unrelated formulas. Students should learn to begin with vectors and initial conditions, choose a useful coordinate system, and construct equations that match the physical situation.

Students should gain experience with:

- separating a launch velocity into horizontal and vertical components;
- recognizing that horizontal and vertical motion share the same elapsed time;
- identifying which component has constant velocity and which has constant acceleration;
- using position and velocity equations to predict the projectile's location and motion;
- checking whether a mathematical result agrees with the visible trajectory, signs, units, and limiting cases;
- distinguishing the physical path from graphs such as `x(t)`, `y(t)`, `v_x(t)`, and `v_y(t)`.

## Key Concepts

### Physical model and assumptions

- A projectile is modeled as a point object after launch.
- Gravity has magnitude `g` and points vertically downward.
- Gravitational acceleration is treated as constant near Earth's surface.
- Air resistance is neglected in the introductory model.
- After release, the projectile's mass does not affect its acceleration in this model.

### Component motion

- Horizontal and vertical motion occur simultaneously and are linked by time.
- With horizontal positive to the right and vertical positive upward:

  ```text
  a_x = 0
  a_y = -g
  ```

- The component equations are:

  ```text
  x(t) = x0 + v_x0 t
  y(t) = y0 + v_y0 t - (1/2) g t^2
  v_x(t) = v_x0
  v_y(t) = v_y0 - g t
  ```

- For a launch speed `v0` at angle `theta` above the horizontal:

  ```text
  v_x0 = v0 cos(theta)
  v_y0 = v0 sin(theta)
  ```

- Different axis choices change signs and component names but do not change the trajectory in physical space.

### Trajectory and characteristic events

- The trajectory is parabolic when gravity is constant and air resistance is neglected.
- At the highest point, the vertical velocity component is zero, but the horizontal component is generally not zero.
- The acceleration remains downward at the highest point.
- Time of flight, maximum height, horizontal range, and impact velocity must be derived from the chosen initial conditions rather than applied as universal formulas.
- Ground-to-ground shortcut formulas are valid only when the launch and landing heights satisfy their stated assumptions.

### Vectors and representations

- Position, displacement, velocity, and acceleration are distinct vector quantities.
- The velocity vector is tangent to the path.
- The acceleration vector points downward throughout the flight.
- Equal-time markers can be used to compare horizontal and vertical changes.
- Position-time and velocity-time graphs describe components over time; they are not drawings of the projectile's path.

### Practical problem-solving skills

- Choose an origin and positive directions before assigning signs.
- Translate words and diagrams into initial position and velocity components.
- Solve for time using the component with sufficient known information.
- Substitute the same time into the other component equation.
- Use units, signs, and limiting cases to check an answer.
- Interpret negative coordinates or velocities relative to the selected axes.

## Learning Outcomes

After completing the Projectile Motion module, students should be able to:

1. State the assumptions of the introductory projectile model and identify situations where those assumptions may fail.
2. Select a coordinate system and correctly represent gravity in that system.
3. Resolve an angled initial velocity into horizontal and vertical components.
4. Construct position and velocity equations from a diagram and a set of initial conditions.
5. Explain why the horizontal and vertical motions use the same time variable.
6. Predict the direction and relative size of the velocity components at different points along a trajectory.
7. Explain why acceleration remains downward, including at the top of the path.
8. Determine time of flight, maximum height, horizontal displacement, or impact velocity for an appropriate scenario.
9. Distinguish a trajectory diagram from component-versus-time graphs.
10. Compare equations written in different coordinate systems and explain why they describe the same physical motion.
11. Check a solution using units, signs, special cases, and agreement with the visible scene.

---

# Motion Diagrams

## Description

Motion Diagrams develops students' ability to read and construct visual records of motion. A motion diagram shows an object's position at equal time intervals and may include displacement, velocity, and acceleration vectors. The module should synchronize these diagrams with animations, numerical data, and position-, velocity-, and acceleration-versus-time graphs.

The emphasis is on representation: the same motion can be shown as an animation, a dot pattern, a vector diagram, a data table, or a graph. Students should learn what information each representation reveals and how to translate between them.

## Purpose

The purpose of this module is to strengthen the conceptual distinction among position, displacement, distance, velocity, speed, and acceleration. Students should learn to infer how an object is moving from spacing and vector changes rather than relying only on memorized equations.

Students should gain experience with:

- interpreting position dots recorded at equal time intervals;
- using dot spacing to reason about speed;
- using displacement vectors to estimate average velocity;
- distinguishing the direction of velocity from the direction of acceleration;
- recognizing constant velocity, speeding up, slowing down, stopping, and reversing direction;
- connecting motion diagrams to kinematics graphs and physical animations;
- constructing a motion diagram from a written description, graph, or data set.

## Key Concepts

### Equal-time sampling

- Successive dots represent the object's position after equal time intervals.
- Equal spacing indicates constant speed.
- Increasing spacing indicates increasing speed.
- Decreasing spacing indicates decreasing speed.
- Overlapping or nearly overlapping dots can represent rest or very slow motion.
- A reversal of direction must be inferred from ordered positions or direction indicators, not spacing alone.

### Position and displacement

- Position locates an object relative to an origin.
- Displacement is the vector from one position to another.
- Distance traveled is a scalar path length and is not generally equal to the magnitude of total displacement.
- A change of coordinate origin changes position values but does not change the spacing between physical locations.

### Velocity and speed

- Average velocity is displacement divided by elapsed time:

  ```text
  v_average = delta r / delta t
  ```

- Instantaneous velocity is tangent to the path and points in the current direction of motion.
- Speed is the magnitude of velocity.
- Velocity arrows should be anchored consistently and scaled meaningfully when they are compared.

### Acceleration

- Acceleration describes the rate at which velocity changes:

  ```text
  a_average = delta v / delta t
  ```

- Acceleration may change speed, direction, or both.
- Velocity and acceleration pointing in the same direction generally indicate speeding up.
- Velocity and acceleration pointing in opposite directions generally indicate slowing down.
- Zero velocity at an instant does not necessarily mean zero acceleration.
- Constant velocity requires zero acceleration, while constant speed can still involve acceleration if direction changes.

### Connections to graphs

- The slope of a position-time graph represents velocity.
- The slope of a velocity-time graph represents acceleration.
- The area under a velocity-time graph represents displacement.
- The area under an acceleration-time graph represents change in velocity.
- A curved path in physical space should not be confused with a curved position-time graph.

### Practical representation skills

- Preserve equal time intervals when constructing a diagram.
- Add arrows and labels without treating vectors as part of the object's path.
- Determine whether a proposed diagram is consistent with its graphs.
- Reconstruct an approximate motion story from dots and vectors.
- Identify missing, reversed, or incorrectly scaled velocity and acceleration arrows.

## Learning Outcomes

After completing the Motion Diagrams module, students should be able to:

1. Explain what each dot in an equal-time motion diagram represents.
2. Determine whether an object is stationary, moving at constant speed, speeding up, or slowing down from dot spacing.
3. Identify the direction of motion and recognize a reversal of direction.
4. Draw displacement, average velocity, instantaneous velocity, and acceleration vectors appropriately.
5. Distinguish position from displacement and distance from displacement magnitude.
6. Distinguish velocity from speed and velocity from acceleration.
7. Explain how an object can have zero velocity but nonzero acceleration.
8. Match an animation or motion diagram to compatible position-, velocity-, and acceleration-time graphs.
9. Use graph slopes and areas to describe changes in motion.
10. Construct a motion diagram from a written scenario, graph, or position data.
11. Diagnose inconsistencies among a motion diagram, vector display, and graph set.

---

# Relative Motion

## Description

Relative Motion examines how position and velocity depend on the observer or reference frame. Students will compare the same physical event as seen from the ground and from a moving observer, using situations such as a passenger walking in a train, a boat crossing a river, or rain viewed from a moving car.

This module should explicitly distinguish a stationary coordinate change from a moving reference frame. Relabeling or rotating axes changes component descriptions, while changing to a moving frame can change measured positions and velocities over time.

## Purpose

The purpose of this module is to help students reason consistently about statements such as “moving at 2 m/s” by asking “relative to what?” Students should learn to define objects and frames clearly, subtract vectors in a consistent order, and interpret the result physically.

Students should gain experience with:

- identifying the observer and reference object in a relative-motion statement;
- comparing world and moving-observer views of the same event;
- calculating relative position and relative velocity using vector subtraction;
- using vector addition to solve navigation and crossing problems;
- separating an object's motion relative to a medium or vehicle from the motion of that medium or vehicle relative to the ground;
- identifying quantities that depend on the frame and quantities that remain unchanged between constant-velocity inertial frames.

## Key Concepts

### Reference frames and notation

- A position or velocity is measured relative to a specified frame.
- Notation should state both the object and the frame, for example `v_A/B`, meaning the velocity of A measured relative to B.
- Reversing the order reverses the vector:

  ```text
  v_A/B = -v_B/A
  ```

- Consistent object/frame labels are essential for avoiding sign errors.

### Relative position, velocity, and acceleration

- Relative quantities are found by vector subtraction:

  ```text
  r_A/B = r_A/W - r_B/W
  v_A/B = v_A/W - v_B/W
  a_A/B = a_A/W - a_B/W
  ```

- Equivalent velocity-addition forms may be rearranged as:

  ```text
  v_A/W = v_A/B + v_B/W
  ```

- A vector diagram should show how the terms connect rather than treating the equation as scalar arithmetic.

### Constant-velocity inertial frames

- In frames moving at constant velocity relative to one another, measured position and velocity can differ.
- Under the introductory Galilean model, elapsed time and acceleration are the same in constant-velocity inertial frames.
- The physical event and interactions are unchanged even though observers report different velocities.
- Simultaneous side-by-side views can reveal which displayed quantities are observer-dependent.

### Two-dimensional applications

- Walking inside a moving train combines the walker's velocity relative to the train with the train's velocity relative to the ground.
- A boat's ground velocity combines its velocity relative to the water with the water's velocity relative to the ground.
- “Point directly across” and “arrive directly across” are different conditions in a river-crossing problem.
- Wind, rain, and aircraft problems require attention to both magnitude and direction.
- Head-to-tail vector addition and component methods should produce the same result.

### Coordinate systems versus reference frames

- Moving, rotating, flipping, or relabeling stationary axes changes coordinate values and components.
- Giving the observer a velocity changes the frame from which motion is measured.
- A coordinate transformation and a frame change can occur together, but they should be controlled and explained separately.
- Students should identify whether a difference comes from axis orientation, origin placement, observer motion, or more than one of these.

### Practical problem-solving skills

- Define every velocity with “object relative to frame” language before calculating.
- Draw a vector-addition diagram and choose a consistent positive direction.
- Resolve two-dimensional vectors into components when necessary.
- Distinguish the direction an object points from the direction it moves over the ground.
- Check whether the result is reasonable by considering cases where the frame speed or current approaches zero.

## Learning Outcomes

After completing the Relative Motion module, students should be able to:

1. Identify the observer or reference frame associated with a reported position or velocity.
2. Use consistent two-object notation for relative position, velocity, and acceleration.
3. Explain why two observers can report different velocities for the same object without disagreeing about the physical event.
4. Calculate one-dimensional relative velocities with correct signs.
5. Construct and solve two-dimensional relative-velocity vector equations.
6. Solve introductory train, moving-walkway, river-current, wind, or rain problems.
7. Distinguish an object's heading from its velocity relative to the ground.
8. Explain which quantities remain unchanged between frames moving at constant relative velocity in the introductory Galilean model.
9. Distinguish changing coordinate axes from changing to a moving reference frame.
10. Interpret simultaneous world-frame and observer-frame animations.
11. Verify a solution using vector diagrams, components, units, and limiting cases.

---

# Uniform Circular Motion

## Description

Uniform Circular Motion explores motion along a circular path at constant speed. Although the speed remains constant, the velocity changes continuously because its direction changes. Students will connect angular variables to linear motion while observing tangential velocity and inward radial acceleration.

The module should use synchronized animation, vector displays, and component graphs to make curved motion understandable. It should also prepare students for later work with forces, rotational motion, polar coordinates, and non-uniform circular motion.

## Purpose

The purpose of this module is to confront the misconception that constant speed implies zero acceleration. Students should understand that acceleration measures any change in velocity, including a change in direction, and should be able to relate radius, angular speed, period, frequency, tangential speed, and radial acceleration.

Students should gain experience with:

- describing circular position using angles measured in radians;
- relating angular motion to distance traveled along the circle;
- identifying the direction of instantaneous velocity and radial acceleration;
- predicting how speed and radius affect centripetal acceleration;
- translating between angular, vector, graphical, and Cartesian representations;
- distinguishing inward net force from a separate force called “centripetal force.”

## Key Concepts

### Angular description

- Angular position `theta` locates an object around the circle relative to a chosen zero direction.
- Angles should be measured in radians when used in kinematics equations.
- Arc length is related to angular displacement by:

  ```text
  s = r theta
  ```

- Uniform circular motion has constant angular speed:

  ```text
  omega = delta theta / delta t
  ```

- Clockwise and counterclockwise motion require a stated sign convention.

### Period and frequency

- The period `T` is the time required for one complete revolution.
- The frequency `f` is the number of revolutions per unit time.
- Their relationships are:

  ```text
  f = 1 / T
  omega = 2 pi / T = 2 pi f
  ```

- Period, frequency, and angular speed describe the same repetition rate in different forms.

### Tangential velocity

- Instantaneous velocity is tangent to the circular path and perpendicular to the radius.
- Tangential speed is:

  ```text
  v = omega r
  ```

- At constant angular speed, an object farther from the center has a greater tangential speed.
- The velocity direction changes at every point even when its magnitude remains constant.

### Radial acceleration

- Uniform circular motion has inward acceleration directed toward the center:

  ```text
  a_radial = v^2 / r = omega^2 r
  ```

- Radial acceleration is perpendicular to instantaneous velocity in uniform circular motion.
- The inward acceleration changes the direction of velocity rather than its magnitude.
- Increasing speed has a squared effect on radial acceleration when radius is fixed.
- The zero-speed and very-large-radius limiting cases provide useful checks.

### Cartesian and vector representations

- With the circle centered at the origin, position may be written as:

  ```text
  x(t) = r cos(theta(t))
  y(t) = r sin(theta(t))
  ```

- The `x` and `y` position components oscillate even though the object moves at constant speed.
- Velocity component graphs are phase-shifted relative to position component graphs.
- Acceleration points opposite the position vector for a circle centered at the origin:

  ```text
  a = -omega^2 r_vector
  ```

- The radial and tangential basis directions change as the object moves.

### Force interpretation

- “Centripetal” describes the inward direction of the net force required for circular motion.
- Tension, gravity, friction, a normal force, or a combination of physical forces may provide the inward net force.
- A separate “centripetal force” should not be added to a free-body diagram.
- The initial module should emphasize the kinematics of inward acceleration while using force examples only to prepare for later dynamics work.

### Practical problem-solving skills

- Convert consistently among period, frequency, and angular speed.
- Use radians rather than degrees in angular kinematics equations.
- Draw velocity tangent to the path and acceleration toward the center.
- Determine how changing radius or angular speed affects linear speed and radial acceleration.
- Compare Cartesian components with radial/tangential descriptions.
- Use units and proportional reasoning to test calculated results.

## Learning Outcomes

After completing the Uniform Circular Motion module, students should be able to:

1. Define angular position, angular displacement, angular speed, period, and frequency.
2. Convert among period, frequency, and angular speed.
3. Relate arc length, radius, and angular displacement using radians.
4. Calculate tangential speed from angular speed and radius.
5. Calculate radial acceleration using either `v^2/r` or `omega^2 r`.
6. Draw the instantaneous velocity tangent to the circle and acceleration toward the center at any point.
7. Explain why an object moving at constant speed in a circle has nonzero acceleration.
8. Predict how changes in speed, angular speed, or radius affect radial acceleration.
9. Interpret circular motion using animations, vector diagrams, Cartesian equations, and component graphs.
10. Explain why the position and acceleration vectors point in opposite directions for a circle centered at the origin.
11. Distinguish centripetal acceleration or inward net force from a new physical force.
12. Check circular-motion calculations using units, proportional reasoning, and limiting cases.

---

# Shared Development Guidance

When these modules are implemented, they should follow these common rules:

- Maintain one authoritative physical model and derive all visualizations, equations, and quiz answers from it.
- Keep physical vectors visually distinct from coordinate axes, graph traces, and vector components.
- Ask students to make a prediction before revealing an animation or calculated result when practical.
- Keep assumptions visible, including constant gravity, negligible air resistance, equal time intervals, or inertial-frame conditions.
- Pair equations with plain-language reasoning and a visible feature of the diagram.
- Use immediate feedback that explains why an answer is correct or incorrect.
- Track skill-specific progress without requiring an account.
- Provide keyboard-accessible controls, screen-reader descriptions, and alternatives to color-only cues.
- Use responsive layouts that remain clear on classroom projectors, student laptops, tablets, and mobile screens.
- Test both the physics model and the connection between interface controls and displayed results.
