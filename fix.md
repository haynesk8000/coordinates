**AI Agent Task: Update the Cannon Game (Fun Zone → Projectile Motion Tab)**

Modify the Cannon game to consist of **two sequential gameplay phases**, requiring the player to destroy the target twice using different launch angle constraints.

## Phase 1: Low-Angle Launch (Less Than 45°)

### Launch Angle Restrictions

* Restrict the cannon launch angle to the range **0° to 45°** (inclusive).
* Prevent the player from selecting an angle outside this range.

### Objective

* The player must destroy the target using a launch angle **less than or equal to 45°**.
* Preserve all existing gameplay mechanics, including projectile physics, sound effects, and explosion animations.

## Transition to Phase 2

After the target is successfully destroyed during Phase 1:

1. Complete the existing target-hit sequence (explosion, sound effects, etc.).
2. Display a clear message indicating that the player must destroy the target **a second time**, this time using a high-angle launch.
3. Remove all impact craters created during Phase 1.
4. Restore the target by placing a new flag at the **same target location**.
5. Reset the battlefield so Phase 2 begins with a clean playing area.

## Phase 2: High-Angle Launch (Greater Than 45°)

### Launch Angle Restrictions

* Restrict the launch angle to the range **greater than the player's final Phase 1 launch angle through 90°**.
* This range must include only angles **above 45°**.
* Prevent the player from selecting any angle outside the allowed range.

### Objective

* The player must destroy the restored target using a **high-angle trajectory**.
* Continue using the existing projectile physics and hit detection.

## Game Completion

The game is complete only after the target has been destroyed in **both phases**.

Upon successful completion of Phase 2:

* Play the existing target destruction sequence.
* Display a clear victory message indicating that both objectives have been completed.
* End the game and prevent additional shots until the player starts a new game.

## User Interface Update

Update the control panel as follows:

* Rename the label **"Power Level"** to **"Energy Level"**.
* This is a label change only. Do not modify the underlying energy control or its functionality.

## General Requirements

* Clearly indicate the current phase of the game to the player.
* Enforce the angle restrictions throughout each phase.
* Preserve all existing gameplay mechanics, animations, scoring, sound effects, and projectile physics unless explicitly modified above.
* Ensure that starting a new game resets:

  * The game back to Phase 1.
  * The launch angle restriction to **0°–45°**.
  * The target and flag.
  * All craters and visual effects.
  * All phase-specific game state.
