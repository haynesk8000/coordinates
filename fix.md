**AI Agent Task: Update the Target Plotter (Fun Zone → Coordinate System Tab)**

Replace the current **Coordinate Picker** game with a new ladder-climbing game while preserving the existing coordinate question and answer logic.

## 1. Replace the Coordinate Picker Interface

* Remove the entire **Coordinate Picker** frame and its associated graphics.
* Replace it with a scene containing:

  * A ladder extending from the ground to a raised platform.
  * A climber standing at the base of the ladder at the start of the game.
  * A platform at the top representing successful completion of the game.
* At the beginning of each new game, randomly select the climber's gender (male or female).


## 2. Correct Answer Behavior

Each correct answer advances the climber **10% of the ladder height**.

Requirements:

* Animate the climber ascending the ladder.
* The climbing animation should include realistic climbing motions (arms and legs moving).
* Update the climber's position only after the climbing animation completes.
* Continue this process until the climber reaches the platform.

## 3. Incorrect Answer Behavior

If the user answers incorrectly, animate the climber falling from their current position.

The fall animation and landing sequence must depend on the climber's current height.

### Case 1: Climber on the Ground (0%)

* Do **not** animate a fall.
* Leave the climber standing at the bottom of the ladder.

### Case 2: Climber Between 10% and 20% Up the Ladder

* Animate the climber falling to the ground.
* After landing, the climber should land in a dramatic **superhero kneeling pose**.
* Pause briefly.
* Animate the climber standing back up and returning to the starting position.

### Case 3: Climber Between 30% and 60% Up the Ladder

* Animate the climber falling.
* The climber lands flat on the ground.
* Pause briefly.
* Animate the climber slowly getting back up.
* Return the climber to the base of the ladder.

### Case 4: Climber Above 60% Up the Ladder

* Animate the climber falling from their current position.
* Use the most dramatic fall animation of the game.
* This fall results in the climber's death.
* Display a clear **Game Over** screen.
* Disable further gameplay until the user starts a new game.

## 4. Fall Animations

Each fall animation should:

* Begin from the climber's current position on the ladder.
* Follow a realistic downward trajectory.
* Be visually different depending on the fall category.
* Include appropriate landing animations.
* Return control to the player only after the animation sequence completes (except for the Game Over case).

## 5. Winning the Game

When the climber reaches the platform:

* Animate the climber stepping onto the platform and doing a dance.
* Play a celebratory animation (for example, cheering, waving, confetti, or fireworks).
* Display a clear success message.
* Prevent further climbing until a new game begins.

## 6. Sound Effects

Add synchronized audio effects for the following events:

### Climbing

* Optional climbing sounds (footsteps or ladder movement).

### Falling

* A scream that begins shortly after the fall starts.
* The scream should continue naturally during the fall.

### Landing

* A realistic impact sound synchronized with the landing animation.
* Use different impact sounds appropriate to the landing severity.

### Victory

* Play a celebratory sound synchronized with the victory animation.

## 8. Game State Management

Ensure the following behavior:

* Reset all animations, sounds, and character state when a new game starts.
* Randomize the climber's gender on every new game.
* Reset the climber to the base of the ladder.
* Reset progress to 0%.
* Preserve the existing coordinate-question generation and scoring logic unless required to support this new interface.

## 9. General Requirements

* All animations should be smooth and synchronized with their corresponding sound effects.
* Character movement should use consistent world coordinates so the climber remains aligned with the ladder throughout climbing and falling.
* Do not modify the existing coordinate question logic except where necessary to integrate the new visual game mechanics.
* Ensure the interface remains responsive and all animations complete cleanly before accepting the next user input.
