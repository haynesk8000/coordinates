**AI Agent Task: Update the Rotation Reactor (Fun Zone → Coordinate Systems Tab)**

Redesign the Rotation Reactor interface and integrate an animated tightrope scene that visually represents the player's progress and game state.

## 1. Relocate the Instruction Text

Modify the layout of the activity as follows:

* Remove the **Help/Instruction** panel currently displayed to the right of the coordinate grid.
* Move the instructional text into a panel positioned **directly above the coordinate grid**.
* Preserve the existing instructional content, updating it only if necessary to reflect the current game rules.
* Ensure the instruction panel spans the width of the coordinate grid and remains readable without reducing the usable grid area.

## 2. Add a Tightrope Animation Scene

To the **right of the coordinate grid**, add a persistent animated scene consisting of:

* A deep chasm.
* A taut tightrope spanning the chasm.
* Stable ground on both sides of the chasm.
* A human character standing on the rope.
* The character begins **one step from the left edge** of the rope.

The rope should require **five total progress segments** to reach the opposite side.

## 3. Correct Answer Behavior

When the user answers a question correctly:

1. If the character is hanging below the rope from a previous incorrect answer:

   * Animate the character climbing back onto the rope at the exact position where they fell.
   * After climbing back onto the rope, continue with the normal movement.

2. Animate the character taking **two realistic walking steps** toward the far side.

3. Those two animated steps should advance the character **exactly one-fifth (1/5)** of the total rope length.

4. Synchronize the movement animation with natural walking motion.

## 4. Incorrect Answer Behavior

When the user answers a question incorrectly:

### First Consecutive Incorrect Answer

* Animate the character slipping from the rope.
* The character falls only a short distance below the rope.
* The character catches the rope and remains hanging beneath it.
* Do **not** change the player's progress along the rope.
* The hanging position should remain until the next question is answered.

### Correct Answer After Hanging

If the next answer is correct:

* Animate the character climbing back onto the rope.
* Restore the character to the exact horizontal position occupied before the fall.
* After climbing back onto the rope, animate the normal forward movement described above.

### Second Consecutive Incorrect Answer

If the user answers two questions in a row incorrectly:

* Animate the character losing their grip.
* The character falls into the chasm.
* Use a longer, more dramatic falling animation.
* Play a realistic scream synchronized with the fall.
* End the activity immediately.
* Display a clear **Game Over** message.
* Disable further gameplay until the activity is restarted.

## 5. Victory Sequence

When the player's score reaches **5 points**:

1. Animate the character taking the final steps onto solid ground on the far side of the chasm.
2. Play the existing victory sound (or another celebratory sound if appropriate).
3. Animate the character performing a celebratory dance.
4. Display a clear success message.
5. End the activity and prevent additional questions until the game is restarted.

## 6. State Management

Maintain the following gameplay state throughout the activity:

* Current score.
* Character progress across the rope.
* Whether the character is:

  * Standing on the rope.
  * Hanging below the rope.
  * Has fallen into the chasm (game over).
  * Has reached the far side (victory).
* Consecutive incorrect answer count.

## 7. Activity Reset

When the user starts a new game:

* Reset the score to **0**.
* Reset the consecutive incorrect answer count to **0**.
* Position the character one step from the left side of the rope.
* Restore the character to a standing position.
* Clear all game-over and victory states.
* Generate a new sequence of rotation questions.

## 8. General Requirements

* Synchronize all animations, sound effects, and gameplay events.
* Prevent user input while animations are in progress.
* Ensure transitions between hanging, climbing, walking, falling, victory, and game-over states are smooth and visually consistent.
* Preserve all existing rotation logic, scoring rules, coordinate validation, and question generation. Only modify the interface and progression animations as specified above.
