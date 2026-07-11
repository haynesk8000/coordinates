# Recommended Kinematics and Dynamics Concepts

## Application review

The application already has a strong foundation for teaching:

- world position, velocity, and acceleration as vectors;
- components found by projection onto an orthogonal coordinate system;
- translated, rotated, flipped, and relabeled axes;
- horizontal projectile motion with constant gravitational acceleration;
- symbolic position and velocity equations;
- linked Explore, Explain, and Quiz experiences.

Its most useful teaching pattern is **physical situation -> vectors -> components -> equations**. New material should preserve that pattern. A student should be able to change a representation and see exactly which physical quantities do or do not change.

Uniform circular motion is an excellent next motion family. It exposes an important idea that projectile motion does not: velocity can change even when speed is constant. The recommendations below extend that idea and connect kinematics to dynamics.

## Highest-priority additions

### 1. Position, velocity, and acceleration in multiple representations

Students often learn equations without connecting them to motion diagrams, vector arrows, and graphs. Add a synchronized view containing:

- the moving object and its trail;
- equally spaced position dots;
- velocity and acceleration vectors;
- component graphs for position, velocity, and acceleration versus time;
- instantaneous slope and area cues.

Core relationships to teach:

```text
velocity = slope of the position-time graph
acceleration = slope of the velocity-time graph
change in position = area under the velocity-time graph
change in velocity = area under the acceleration-time graph
```

This should come before many new motion types because it helps students distinguish position, velocity, acceleration, speed, and path shape. In Quiz mode, students could match a physical animation to its graphs or find the interval during which velocity and acceleration have opposite signs.

### 2. Relative motion and moving reference frames

The current app changes a stationary coordinate description. The next conceptual step is to let the observer or frame move. This makes the distinction between a **coordinate change** and a **change of reference frame** explicit.

Use examples such as a person walking inside a moving train, a boat crossing a river, or rain observed from a moving car. Show:

```text
r_A/B = r_A/W - r_B/W
v_A/B = v_A/W - v_B/W
a_A/B = a_A/W - a_B/W
```

For frames moving at constant velocity, students should see that relative position and velocity change while acceleration is the same in both inertial frames. Explore mode could include a world camera and a moving-observer camera playing simultaneously. Quiz prompts should ask which quantities are observer-dependent and which remain unchanged.

This topic fits the mission especially well: the same event can have different coordinates and velocities without becoming a different physical event.

### 3. Uniform and non-uniform circular motion

Build uniform circular motion first, then extend the same scene to changing speed. Students should be able to adjust radius, angular speed, initial angle, and direction of rotation while viewing:

- angular position and angular velocity;
- tangential velocity;
- inward radial acceleration;
- period and frequency;
- Cartesian and radial/tangential components side by side.

Key equations include:

```text
v = omega r
a_radial = v^2 / r = omega^2 r
T = 2 pi / omega
f = 1 / T
```

The most important misconception to address is that constant speed does not imply zero acceleration. The velocity arrow should remain tangent to the path while the acceleration arrow points toward the center.

After that, introduce non-uniform circular motion:

```text
a = a_tangential + a_radial
a_tangential = alpha r
a_radial = v^2 / r
```

This visually separates acceleration that changes speed from acceleration that changes direction.

### 4. Polar coordinates and changing basis vectors

Polar coordinates are the natural conceptual bridge between coordinate systems and circular motion. Let students compare Cartesian coordinates `(x, y)` with polar coordinates `(r, theta)` for the same moving point.

Teach that the polar basis vectors rotate with the object. Even when the radial and angular coordinate values look simple, the directions of the basis vectors can change. The full relations are:

```text
v = r_dot e_r + r theta_dot e_theta
a = (r_double_dot - r theta_dot^2) e_r
    + (r theta_double_dot + 2 r_dot theta_dot) e_theta
```

The initial version can reveal these terms progressively instead of presenting the full expression at once. Begin with uniform circular motion where `r_dot = 0` and `theta_dot` is constant, then unlock radial motion and changing angular speed.

This module should explicitly contrast fixed rotated Cartesian axes with a polar basis that changes direction over time.

### 5. Newton's second law and free-body diagrams in chosen coordinates

This is the best transition from kinematics to dynamics. Allow students to place force arrows on an object, choose axes, project each force, and see the component equations generated from:

```text
sum F = m a
sum F_axis1 = m a_axis1
sum F_axis2 = m a_axis2
```

Start with an object on an incline. Let the student choose horizontal/vertical axes or axes parallel/perpendicular to the incline. The physical forces must stay fixed when the axes change, while their components and the algebra change.

The interface should distinguish forces from their components. A force component should never be drawn as an additional physical force. This module reinforces the app's central message while showing why a smart coordinate choice can simplify a problem.

### 6. Friction, normal force, tension, and constraints

Once free-body diagrams are available, add common constraint forces:

- static and kinetic friction;
- normal force on level and inclined surfaces;
- tension in a rope;
- connected masses and pulleys;
- circular-motion tension or normal force.

Important reasoning goals are:

- static friction is not always `mu_s N`;
- the normal force is not always `mg`;
- tension direction follows the rope;
- constrained objects can have linked accelerations;
- “centripetal force” is the inward net force, not a new force to add to a diagram.

Explore mode could let students change the incline angle, coefficient of friction, applied force, or mass and predict whether the object remains at rest, slides, or accelerates.

## Valuable second-stage additions

### 7. Work-energy and coordinate-independent checks

Energy gives students a useful contrast with component equations. Add kinetic energy, gravitational potential energy, spring potential energy, and work by non-conservative forces:

```text
W_net = Delta K
K_i + U_i + W_nonconservative = K_f + U_f
```

Show that shifting the zero of potential energy changes individual potential-energy values but not physically meaningful energy differences. This echoes moving a coordinate origin: a reference value changes, but the observable prediction does not.

Good scenes include a ramp, roller-coaster track, pendulum, and spring launcher. A live bar chart can display transfers among kinetic, potential, and thermal energy.

### 8. Impulse, momentum, and collisions

Add one- and two-dimensional collisions with center-of-mass motion. Students should be able to change the coordinate axes and verify that vector momentum conservation remains valid in every orientation.

Core ideas include:

```text
p = m v
J = Delta p = integral F dt
sum p_before = sum p_after
```

Use a force-time graph for impulse and vector diagrams for two-dimensional momentum. Quizzes should distinguish momentum conservation from kinetic-energy conservation and ask students to project a collision onto convenient axes.

### 9. Simple harmonic motion

Simple harmonic motion connects linear motion, circular motion, energy, and differential equations. Include mass-spring and pendulum models with synchronized position, velocity, acceleration, and energy graphs.

Teach:

```text
a = -omega^2 x
x(t) = A cos(omega t + phi)
```

Students should see that acceleration points toward equilibrium, not necessarily opposite the velocity. A projection of uniform circular motion onto one axis can visually derive sinusoidal motion and make this module feel like a continuation rather than a separate chapter.

### 10. Rotational kinematics and dynamics

After circular motion, introduce the angular analogs of linear quantities:

```text
theta <-> x
omega <-> v
alpha <-> a
torque = I alpha
L = I omega
```

Useful interactive cases include a rotating disk, a lever, and rolling without slipping. Students should compare angular quantities shared by a rigid body with linear quantities that depend on distance from the axis. Rolling should connect `v_cm = omega R` with translation plus rotation.

### 11. Non-inertial and rotating frames

This is an advanced extension of relative motion. Accelerating frames require apparent forces, and rotating frames introduce centrifugal and Coriolis effects. The module should make clear that these terms arise because the selected frame accelerates or rotates; they are not new interactions in the inertial-world free-body diagram.

Good examples include a turning car, a rotating platform, and a puck viewed from both the laboratory and the platform. This topic should appear only after students are comfortable with inertial frames, circular motion, and Newton's laws.

## Cross-cutting reasoning tools

These tools should accompany every module rather than become isolated chapters:

- **Units and dimensional analysis:** flag equations whose units do not match.
- **Limiting cases:** ask what happens when an angle, force, speed, radius, or time approaches zero.
- **Vector versus scalar language:** consistently separate speed from velocity and path length from displacement.
- **Prediction before animation:** require a direction, sign, or graph prediction before revealing the result.
- **Multiple solution methods:** compare component kinematics, Newton's laws, energy, and momentum when more than one method applies.
- **Model assumptions:** visibly list assumptions such as constant gravity, negligible drag, point particle, rigid rope, or inertial frame.
- **Uncertainty and measurement:** in a later lab-style mode, let students estimate velocity and acceleration from noisy position data.

## Recommended curriculum order

1. Coordinate systems and projectile motion — current module.
2. Motion diagrams and position/velocity/acceleration graphs.
3. Relative motion in constant-velocity frames.
4. Uniform circular motion.
5. Non-uniform circular motion and radial/tangential components.
6. Polar coordinates and changing basis vectors.
7. Newton's second law and free-body diagrams.
8. Inclines, friction, tension, and constraints.
9. Work-energy.
10. Impulse, momentum, and collisions.
11. Simple harmonic motion.
12. Rotational dynamics and non-inertial frames.

## Suggested first expansion

For the next release, the strongest compact set is:

1. synchronized motion diagrams and kinematics graphs;
2. relative velocity with a moving observer;
3. uniform circular motion with tangent velocity and radial acceleration;
4. an incline/free-body-diagram activity with movable axes.

Together, these additions reuse the app's vector projection engine and three learning modes while adding genuinely new ideas. They also create a coherent progression: describe motion, compare observers, explain curved motion, and finally connect acceleration to its physical cause.

## Design guardrails

- Keep one authoritative world model for each scene and derive all displayed components from it.
- Keep coordinate axes visually distinct from physical vectors and force arrows.
- Never make a trajectory change merely because axes are translated, rotated, flipped, or renamed.
- Treat moving or accelerating frames as a separate, explicit operation from changing stationary coordinates.
- Generate equations from the model instead of storing answer tables.
- Reuse Explore, Explain, and Quiz for every concept so students predict, inspect, derive, and test the same idea.
- Show which quantities are invariant and which are frame- or coordinate-dependent in every module.
