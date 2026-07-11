# Guided Explore Activities

These activities are designed for the Explore tab. They focus on how moving or rotating the coordinate system changes the coordinate description while the projectile motion stays physically fixed.

## Translation Tasks

### Task 1

**Title:** Move the Origin to the Right

**Description**

1. Select the preset "Cliff top, x right, y up."
2. Compare the symbolic equations and the initial-coordinate guides before moving anything.
3. Drag the coordinate origin to the right while keeping it near the launch height.
4. Compare the Equations panel and Component Breakdown with the original display.

**Observation**

The launch point is now to the left of the origin. The initial horizontal coordinate changes sign, while the velocity and acceleration components stay the same.

**Explanation**

Moving the origin changes where positions are measured from. The projectile did not move, and the axes still point in the same directions, so only the initial position terms change.

### Task 2

**Title:** Move the Origin to the Left

**Description**

1. Reset to "Cliff top, x right, y up."
2. Drag the coordinate origin to the left of the launch point.
3. Watch the top initial-coordinate guide and the first equation.
4. Compare this result with the previous rightward translation.

**Observation**

The launch point is now to the right of the origin. The initial horizontal coordinate has the opposite sign from the rightward-translation case.

**Explanation**

The positive horizontal axis still points right, so a point to the right of the origin has a positive horizontal coordinate. Translation changes the reference point, not the launch velocity or gravity.

### Task 3

**Title:** Move the Origin to the Ground

**Description**

1. Select "Cliff top, x right, y up."
2. Drag the origin straight downward to the ground below the cliff, or select the ground-origin preset.
3. Compare the vertical initial-coordinate guide before and after the move.
4. Look for the new initial-position term in the vertical equation.

**Observation**

The projectile starts above the new origin. The vertical equation gains an initial height term, while the gravity term remains negative.

**Explanation**

The vertical axis still points upward, so the launch point is a positive vertical distance above the ground origin. Gravity still points downward, so its component is unchanged by this translation.

### Task 4

**Title:** Move the Origin Above the Launch Point

**Description**

1. Reset to "Cliff top, x right, y up."
2. Drag the origin upward above the launch point.
3. Observe the vertical initial-coordinate guide.
4. Compare the vertical equation with the default vertical equation.

**Observation**

The launch point is below the origin, so the initial vertical coordinate becomes negative. The projectile path and velocity vectors remain visually fixed.

**Explanation**

A point below an upward-positive origin has a negative vertical coordinate. The negative initial position describes where the projectile starts relative to the new origin, not a different physical launch.

### Task 5

**Title:** Move the Origin to the Wall Top

**Description**

1. Select the wall-top preset, or drag the origin near the top of the wall.
2. Compare the initial-coordinate guides with the wall, cliff, and launch point.
3. Look for symbolic distance terms in the position equations.
4. Check whether the velocity and acceleration rows changed.

**Observation**

The launch point is left of and above the wall-top origin. The equations use initial-position terms tied to the wall distance and height difference, while velocity and acceleration keep the same components.

**Explanation**

Placing the origin at the wall top changes both initial coordinates because the launch point is offset horizontally and vertically from that origin. The physical velocity and gravity vectors are not affected by where the coordinate system begins.

### Task 6

**Title:** Move the Origin to the Landing Region

**Description**

1. Select "Landing origin, a right, b up."
2. Compare the displayed equations with the cliff-top default.
3. Notice the custom labels in the Equations and Component Breakdown panels.
4. Use the time slider and watch the projectile move along the same path.

**Observation**

The launch point is far to the left and above the landing-origin coordinate system. The equation labels change to match the axes, and the initial-position terms describe the launch point relative to the landing region.

**Explanation**

This translation moves the reference point but keeps the same physical scene. Custom labels change the symbols used in the equations, while the underlying projectile motion remains the same.

### Task 7

**Title:** Snap to a Vertical Guide Line

**Description**

1. Start with "Cliff top, x right, y up."
2. Drag the origin horizontally toward the wall location.
3. Move slowly near the invisible vertical guide line at the wall.
4. Watch how the horizontal initial-position term updates symbolically.

**Observation**

When the origin aligns with the wall's vertical guide line, the horizontal initial-position term uses the wall distance symbol instead of an arbitrary coordinate value.

**Explanation**

The app recognizes important physical reference lines such as the cliff, wall, and landing point. Snapping to those lines makes the equation traceable to visible distances in the diagram.

### Task 8

**Title:** Snap to a Horizontal Guide Line

**Description**

1. Select "Cliff top, x right, y up."
2. Drag the origin vertically toward the wall height.
3. Move slowly near the invisible horizontal guide line at the top of the wall.
4. Compare the vertical initial-position term before and after the snap.

**Observation**

The vertical initial-position term changes to a symbolic height difference when the origin aligns with the wall height. The gravity term is still controlled by the direction of the vertical axis.

**Explanation**

Horizontal guide lines mark meaningful heights in the physical scene. Moving the origin to one of those heights changes the initial vertical coordinate, but it does not change the downward direction of gravity.

### Task 9

**Title:** Translate Down and Right

**Description**

1. Reset to the default cliff-top coordinate system.
2. Drag the origin down and to the right of the launch point.
3. Compare both initial-coordinate guides at the same time.
4. Identify which terms changed in the two position equations.

**Observation**

Both initial coordinates change because the origin moved in two directions. The launch point is left of the origin and above or below it depending on the final placement.

**Explanation**

A diagonal translation combines a horizontal translation and a vertical translation. Each coordinate records the launch point's displacement along its own axis, so both position equations can gain new initial terms.

### Task 10

**Title:** Translate, Then Check Time

**Description**

1. Move the origin to any new location while keeping the axes unrotated.
2. Move the time slider from launch to impact.
3. Watch the projectile follow the same trajectory.
4. Compare the Component Breakdown before and after changing time.

**Observation**

The path in the scene does not move when the origin changes. The current velocity row changes with time, but the translation itself does not alter velocity or acceleration components.

**Explanation**

A translation changes position coordinates because the reference point changed. Velocity and acceleration are vectors, so translating the origin without rotating the axes leaves their components unchanged.

## Rotation Tasks

### Task 11

**Title:** Rotate Slightly Counterclockwise

**Description**

1. Select "Cliff top, x right, y up."
2. Move the Rotation slider to a small positive angle such as pi/12.
3. Compare the Equations panel before and after the rotation.
4. Look at which rows in the Component Breakdown now contain trig terms.

**Observation**

The initial position may still be zero at the launch point, but velocity and acceleration are now split across the rotated axes. The equations include angle-dependent terms.

**Explanation**

Rotating the coordinate system changes the directions used for measurement. The projectile still launches horizontally and gravity still points downward, but their components are now projections onto tilted axes.

### Task 12

**Title:** Rotate Slightly Clockwise

**Description**

1. Reset to the cliff-top default preset.
2. Move the Rotation slider to a small negative angle such as -pi/12.
3. Compare the signs of the velocity and acceleration terms with the positive-rotation case.
4. Check the Velocity Equations panel.

**Observation**

The same physical vectors are projected onto axes tilted the other way. Some signs differ from the positive-rotation case.

**Explanation**

A clockwise rotation changes which side of each axis the launch velocity and gravity fall on. The signs come from projection onto the chosen positive axis directions.

### Task 13

**Title:** Rotate by pi/6

**Description**

1. Select the default cliff-top preset.
2. Set the Rotation slider to pi/6.
3. Compare the position equations, velocity equations, and acceleration row.
4. Move the time slider and watch the current velocity components update.

**Observation**

The velocity equations and current velocity row use the rotated coordinate directions. As time changes, the acceleration contribution changes the current velocity expression while the axes remain fixed.

**Explanation**

The current velocity is the initial velocity plus the acceleration contribution over time. In a rotated coordinate system, both parts must be projected onto the rotated axes.

### Task 14

**Title:** Rotate by pi/2

**Description**

1. Reset to "Cliff top, x right, y up."
2. Set the Rotation slider to pi/2.
3. Observe which coordinate axis is vertical and which is horizontal.
4. Identify which equation contains the gravity term.

**Observation**

The coordinate named by the first axis now points vertically upward, and the second axis points horizontally left. The gravity term moves into the first coordinate equation.

**Explanation**

The name of a coordinate does not decide what physics belongs in it. Gravity appears in whichever coordinate has a vertical component along the downward direction.

### Task 15

**Title:** Rotate by -pi/2

**Description**

1. Reset to the default cliff-top coordinate system.
2. Set the Rotation slider to -pi/2.
3. Compare the equations with the pi/2 rotation.
4. Check whether the gravity term has the same or opposite sign.

**Observation**

The first axis now points vertically downward, so the gravity component along that axis becomes positive. The horizontal launch velocity appears along the other axis.

**Explanation**

Gravity always points downward in the physical scene. If the positive coordinate direction also points downward, the acceleration component along that coordinate is positive.

### Task 16

**Title:** Rotate by pi

**Description**

1. Select "Cliff top, x right, y up."
2. Set the Rotation slider to pi.
3. Compare the result with flipping both axes from the default orientation.
4. Notice the signs in the velocity and acceleration components.

**Observation**

Both axes point opposite their default directions. The horizontal velocity component changes sign, and the gravity component changes sign relative to the default vertical axis.

**Explanation**

A rotation by pi turns the coordinate system around. Every component measured along those reversed axes changes sign, even though the projectile path remains unchanged.

### Task 17

**Title:** Rotate Through a Full Turn

**Description**

1. Reset to the default coordinate system.
2. Move the Rotation slider gradually up to 2pi.
3. Pause at several intermediate angles and compare the equations.
4. Compare the final 2pi orientation with the original orientation.

**Observation**

Intermediate rotations change the component equations, but a full turn returns the axes to their original directions. The final coordinate description matches the starting description.

**Explanation**

A full rotation changes the coordinate system continuously and then brings it back to the same orientation. The physical motion never changes during the rotation.

### Task 18

**Title:** Rotate After Moving the Origin

**Description**

1. Select "Ground origin, x right, y up."
2. Observe the initial height term in the vertical equation.
3. Rotate the axes to pi/4.
4. Compare how the initial-position, velocity, and acceleration terms are distributed.

**Observation**

After rotation, the initial height is no longer only in one equation. Position, velocity, and acceleration can all be split between the two rotated coordinates.

**Explanation**

Translation decides the relative position vector from the origin to the projectile. Rotation decides how that vector, along with velocity and acceleration, is projected onto the coordinate axes.

### Task 19

**Title:** Rotate, Then Watch Current Velocity

**Description**

1. Set the origin at the launch point.
2. Rotate the axes to a non-cardinal angle such as pi/3.
3. Move the time slider from launch toward impact.
4. Watch the Current Velocity row and Velocity Equations panel.

**Observation**

The current velocity components update symbolically with time in the rotated coordinate system. The horizontal and vertical velocity vectors in the scene still show the physical motion.

**Explanation**

The velocity display changes because the same world velocity is being described along tilted axes. The physical velocity changes over time due to gravity, and the rotated components describe that changing vector in the chosen coordinates.

### Task 20

**Title:** Drag an Axis Handle

**Description**

1. Reset to the default coordinate system.
2. Drag either axis handle in the scene instead of using the Rotation slider.
3. Stop at a positive or negative angle shown by the Rotation control.
4. Confirm that the axes remain perpendicular and the equations update.

**Observation**

Dragging an axis rotates the whole coordinate system in discrete angle steps. The two axes keep a right angle, and the symbolic equations update just as they do with the slider.

**Explanation**

The app treats dragging an axis handle as another way to rotate the coordinate system. Because the axes stay orthogonal, components are still found by projecting the physical position, velocity, and acceleration onto two perpendicular directions.
