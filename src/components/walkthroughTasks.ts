export type WalkthroughKind = 'translation' | 'rotation';

export type WalkthroughTask = {
  id: number;
  title: string;
  description: string[];
  observation: string;
  explanation: string;
  hint: string;
};

export const translationTasks: WalkthroughTask[] = [
  {
    id: 1,
    title: 'Move the Origin to the Right',
    description: ['Select the preset “Cliff top, x right, y up.”', 'Compare the symbolic equations and initial-coordinate guides before moving anything.', 'Drag the coordinate origin to the right while keeping it near the launch height.', 'Compare the Equations panel and Component Breakdown with the original display.'],
    observation: 'The launch point is now to the left of the origin. The initial horizontal coordinate changes sign, while the velocity and acceleration components stay the same.',
    explanation: 'Moving the origin changes where positions are measured from. The projectile did not move, and the axes still point in the same directions, so only the initial position terms change.',
    hint: 'Keep the axes unrotated, then drag the origin crosshair to the right of the launch point while staying close to the launch height.',
  },
  {
    id: 2,
    title: 'Move the Origin to the Left',
    description: ['Reset to “Cliff top, x right, y up.”', 'Drag the coordinate origin to the left of the launch point.', 'Watch the top initial-coordinate guide and the first equation.', 'Compare this result with the previous rightward translation.'],
    observation: 'The launch point is now to the right of the origin. The initial horizontal coordinate has the opposite sign from the rightward-translation case.',
    explanation: 'The positive horizontal axis still points right, so a point to the right of the origin has a positive horizontal coordinate. Translation changes the reference point, not the launch velocity or gravity.',
    hint: 'Reset to the default preset, then drag the origin crosshair left of the launch point without rotating the axes.',
  },
  {
    id: 3,
    title: 'Move the Origin to the Ground',
    description: ['Select “Cliff top, x right, y up.”', 'Drag the origin straight down to the ground below the cliff, or select the ground-origin preset.', 'Compare the vertical initial-coordinate guide before and after the move.', 'Look for the new initial-position term in the vertical equation.'],
    observation: 'The projectile starts above the new origin. The vertical equation gains an initial height term, while the gravity term remains negative.',
    explanation: 'The vertical axis still points upward, so the launch point is a positive vertical distance above the ground origin. Gravity still points downward, so its component is unchanged by this translation.',
    hint: 'Choose “Ground origin, x right, y up,” or place the origin at the ground directly below the cliff with both axes in their default directions.',
  },
  {
    id: 4,
    title: 'Move the Origin Above the Launch Point',
    description: ['Reset to “Cliff top, x right, y up.”', 'Drag the origin upward above the launch point.', 'Observe the vertical initial-coordinate guide.', 'Compare the vertical equation with the default vertical equation.'],
    observation: 'The launch point is below the origin, so the initial vertical coordinate becomes negative. The projectile path and velocity vectors remain visually fixed.',
    explanation: 'A point below an upward-positive origin has a negative vertical coordinate. The negative initial position describes where the projectile starts relative to the new origin, not a different physical launch.',
    hint: 'With x pointing right and y pointing up, drag the origin crosshair above the projectile’s launch point.',
  },
  {
    id: 5,
    title: 'Move the Origin to the Wall Top',
    description: ['Select the wall-top preset, or drag the origin near the top of the wall.', 'Compare the initial-coordinate guides with the wall, cliff, and launch point.', 'Look for symbolic distance terms in the position equations.', 'Check whether the velocity and acceleration rows changed.'],
    observation: 'The launch point is left of and above the wall-top origin. The equations use initial-position terms tied to the wall distance and height difference, while velocity and acceleration keep the same components.',
    explanation: 'Placing the origin at the wall top changes both initial coordinates because the launch point is offset horizontally and vertically from that origin. The physical velocity and gravity vectors are not affected by where the coordinate system begins.',
    hint: 'Select “Wall top origin, x right, y up,” or place the origin crosshair exactly at the top of the wall.',
  },
  {
    id: 6,
    title: 'Move the Origin to the Landing Region',
    description: ['Select “Landing origin, a right, b up.”', 'Compare the displayed equations with the cliff-top default.', 'Notice the custom labels in the Equations and Component Breakdown panels.', 'Use the time slider and watch the projectile move along the same path.'],
    observation: 'The launch point is far to the left and above the landing-origin coordinate system. The equation labels change to match the axes, and the initial-position terms describe the launch point relative to the landing region.',
    explanation: 'This translation moves the reference point but keeps the same physical scene. Custom labels change the symbols used in the equations, while the underlying projectile motion remains the same.',
    hint: 'Select the preset named “Landing origin, a right, b up.” The labels must be a and b and the origin must be at the landing point.',
  },
  {
    id: 7,
    title: 'Snap to a Vertical Guide Line',
    description: ['Start with “Cliff top, x right, y up.”', 'Drag the origin horizontally toward the wall location.', 'Move slowly near the invisible vertical guide line at the wall.', 'Watch how the horizontal initial-position term updates symbolically.'],
    observation: 'When the origin aligns with the wall’s vertical guide line, the horizontal initial-position term uses the wall distance symbol instead of an arbitrary coordinate value.',
    explanation: 'The app recognizes important physical reference lines such as the cliff, wall, and landing point. Snapping to those lines makes the equation traceable to visible distances in the diagram.',
    hint: 'With the default axis directions, drag the origin until its horizontal position snaps to the wall’s vertical line.',
  },
  {
    id: 8,
    title: 'Snap to a Horizontal Guide Line',
    description: ['Select “Cliff top, x right, y up.”', 'Drag the origin vertically toward the wall height.', 'Move slowly near the invisible horizontal guide line at the top of the wall.', 'Compare the vertical initial-position term before and after the snap.'],
    observation: 'The vertical initial-position term changes to a symbolic height difference when the origin aligns with the wall height. The gravity term is still controlled by the direction of the vertical axis.',
    explanation: 'Horizontal guide lines mark meaningful heights in the physical scene. Moving the origin to one of those heights changes the initial vertical coordinate, but it does not change the downward direction of gravity.',
    hint: 'With the default axis directions, drag the origin until its vertical position snaps to the top-of-wall height.',
  },
  {
    id: 9,
    title: 'Translate Down and Right',
    description: ['Reset to the default cliff-top coordinate system.', 'Drag the origin down and to the right of the launch point.', 'Compare both initial-coordinate guides at the same time.', 'Identify which terms changed in the two position equations.'],
    observation: 'Both initial coordinates change because the origin moved in two directions. The launch point is left of the origin and above or below it depending on the final placement.',
    explanation: 'A diagonal translation combines a horizontal translation and a vertical translation. Each coordinate records the launch point’s displacement along its own axis, so both position equations can gain new initial terms.',
    hint: 'Reset the axes, then move the origin both right of the cliff and below the launch height. Both coordinates must change.',
  },
  {
    id: 10,
    title: 'Translate, Then Check Time',
    description: ['Move the origin to any new location while keeping the axes unrotated.', 'Move the time slider from launch to impact.', 'Watch the projectile follow the same trajectory.', 'Compare the Component Breakdown before and after changing time.'],
    observation: 'The path in the scene does not move when the origin changes. The current velocity row changes with time, but the translation itself does not alter velocity or acceleration components.',
    explanation: 'A translation changes position coordinates because the reference point changed. Velocity and acceleration are vectors, so translating the origin without rotating the axes leaves their components unchanged.',
    hint: 'Keep the axes unrotated, move the origin away from the launch point, then move the time slider at least halfway toward impact.',
  },
];

export const rotationTasks: WalkthroughTask[] = [
  {
    id: 11,
    title: 'Rotate Slightly Counterclockwise',
    description: ['Select “Cliff top, x right, y up.”', 'Move the Rotation slider to a small positive angle such as pi/12.', 'Compare the Equations panel before and after the rotation.', 'Look at which rows in the Component Breakdown now contain trig terms.'],
    observation: 'The initial position may still be zero at the launch point, but velocity and acceleration are now split across the rotated axes. The equations include angle-dependent terms.',
    explanation: 'Rotating the coordinate system changes the directions used for measurement. The projectile still launches horizontally and gravity still points downward, but their components are now projections onto tilted axes.',
    hint: 'Reset to the cliff-top default and move Rotation one or two steps to a positive, non-cardinal angle.',
  },
  {
    id: 12,
    title: 'Rotate Slightly Clockwise',
    description: ['Reset to the cliff-top default preset.', 'Move the Rotation slider to a small negative angle such as -pi/12.', 'Compare the signs of the velocity and acceleration terms with the positive-rotation case.', 'Check the Velocity Equations panel.'],
    observation: 'The same physical vectors are projected onto axes tilted the other way. Some signs differ from the positive-rotation case.',
    explanation: 'A clockwise rotation changes which side of each axis the launch velocity and gravity fall on. The signs come from projection onto the chosen positive axis directions.',
    hint: 'Reset to the cliff-top default and move Rotation one or two steps below zero.',
  },
  {
    id: 13,
    title: 'Rotate by pi/6',
    description: ['Select the default cliff-top preset.', 'Set the Rotation slider to pi/6.', 'Compare the position equations, velocity equations, and acceleration row.', 'Move the time slider and watch the current velocity components update.'],
    observation: 'The velocity equations and current velocity row use the rotated coordinate directions. As time changes, the acceleration contribution changes the current velocity expression while the axes remain fixed.',
    explanation: 'The current velocity is the initial velocity plus the acceleration contribution over time. In a rotated coordinate system, both parts must be projected onto the rotated axes.',
    hint: 'Choose the cliff-top default and set Rotation to exactly pi/6 rad (two slider steps above zero).',
  },
  {
    id: 14,
    title: 'Rotate by pi/2',
    description: ['Reset to “Cliff top, x right, y up.”', 'Set the Rotation slider to pi/2.', 'Observe which coordinate axis is vertical and which is horizontal.', 'Identify which equation contains the gravity term.'],
    observation: 'The coordinate named by the first axis now points vertically upward, and the second axis points horizontally left. The gravity term moves into the first coordinate equation.',
    explanation: 'The name of a coordinate does not decide what physics belongs in it. Gravity appears in whichever coordinate has a vertical component along the downward direction.',
    hint: 'Set Rotation to exactly pi/2 rad (six slider steps above zero).',
  },
  {
    id: 15,
    title: 'Rotate by -pi/2',
    description: ['Reset to the default cliff-top coordinate system.', 'Set the Rotation slider to -pi/2.', 'Compare the equations with the pi/2 rotation.', 'Check whether the gravity term has the same or opposite sign.'],
    observation: 'The first axis now points vertically downward, so the gravity component along that axis becomes positive. The horizontal launch velocity appears along the other axis.',
    explanation: 'Gravity always points downward in the physical scene. If the positive coordinate direction also points downward, the acceleration component along that coordinate is positive.',
    hint: 'Set Rotation to exactly -pi/2 rad (six slider steps below zero).',
  },
  {
    id: 16,
    title: 'Rotate by pi',
    description: ['Select “Cliff top, x right, y up.”', 'Set the Rotation slider to pi.', 'Compare the result with flipping both axes from the default orientation.', 'Notice the signs in the velocity and acceleration components.'],
    observation: 'Both axes point opposite their default directions. The horizontal velocity component changes sign, and the gravity component changes sign relative to the default vertical axis.',
    explanation: 'A rotation by pi turns the coordinate system around. Every component measured along those reversed axes changes sign, even though the projectile path remains unchanged.',
    hint: 'Set Rotation to exactly pi rad (twelve slider steps above zero).',
  },
  {
    id: 17,
    title: 'Rotate Through a Full Turn',
    description: ['Reset to the default coordinate system.', 'Move the Rotation slider gradually up to 2pi.', 'Pause at several intermediate angles and compare the equations.', 'Compare the final 2pi orientation with the original orientation.'],
    observation: 'Intermediate rotations change the component equations, but a full turn returns the axes to their original directions. The final coordinate description matches the starting description.',
    explanation: 'A full rotation changes the coordinate system continuously and then brings it back to the same orientation. The physical motion never changes during the rotation.',
    hint: 'Move the Rotation slider all the way to 2pi rad at its positive endpoint.',
  },
  {
    id: 18,
    title: 'Rotate After Moving the Origin',
    description: ['Select “Ground origin, x right, y up.”', 'Observe the initial height term in the vertical equation.', 'Rotate the axes to pi/4.', 'Compare how the initial-position, velocity, and acceleration terms are distributed.'],
    observation: 'After rotation, the initial height is no longer only in one equation. Position, velocity, and acceleration can all be split between the two rotated coordinates.',
    explanation: 'Translation decides the relative position vector from the origin to the projectile. Rotation decides how that vector, along with velocity and acceleration, is projected onto the coordinate axes.',
    hint: 'Place the origin on the ground below the cliff, then set Rotation to pi/4 rad (three steps above zero).',
  },
  {
    id: 19,
    title: 'Rotate, Then Watch Current Velocity',
    description: ['Set the origin at the launch point.', 'Rotate the axes to a non-cardinal angle such as pi/3.', 'Move the time slider from launch toward impact.', 'Watch the Current Velocity row and Velocity Equations panel.'],
    observation: 'The current velocity components update symbolically with time in the rotated coordinate system. The horizontal and vertical velocity vectors in the scene still show the physical motion.',
    explanation: 'The velocity display changes because the same world velocity is being described along tilted axes. The physical velocity changes over time due to gravity, and the rotated components describe that changing vector in the chosen coordinates.',
    hint: 'Put the origin at the launch point, choose a tilted non-cardinal angle, and move the time slider at least one-third toward impact.',
  },
  {
    id: 20,
    title: 'Drag an Axis Handle',
    description: ['Reset to the default coordinate system.', 'Drag either axis handle in the scene instead of using the Rotation slider.', 'Stop at a positive or negative angle shown by the Rotation control.', 'Confirm that the axes remain perpendicular and the equations update.'],
    observation: 'Dragging an axis rotates the whole coordinate system in discrete angle steps. The two axes keep a right angle, and the symbolic equations update just as they do with the slider.',
    explanation: 'The app treats dragging an axis handle as another way to rotate the coordinate system. Because the axes stay orthogonal, components are still found by projecting the physical position, velocity, and acceleration onto two perpendicular directions.',
    hint: 'Drag one of the small circular handles at an axis tip. The task only completes after an axis-handle drag changes Rotation away from zero.',
  },
];

export const tasksFor = (kind: WalkthroughKind) => kind === 'translation' ? translationTasks : rotationTasks;
