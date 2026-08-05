**AI Agent Task: Update the Rotation Reactor (Fun Zone → Coordinate Systems Tab)**

Modify the audio behavior for incorrect answers. **Do not change any gameplay mechanics, animations, scoring, or game flow.** This task is limited to updating the sound effects.

## Requirements

### 1. First Incorrect Answer

When the user answers a question incorrectly **and it is not their second consecutive incorrect answer**:

* Play the audio file **`ohoh.mp3`**.
* Start the sound immediately after the answer has been evaluated as incorrect.
* Synchronize the sound with the existing incorrect-answer animation.
* Do not modify the current animation sequence or character behavior.

### 2. Second Consecutive Incorrect Answer

When the user answers **two consecutive questions incorrectly**, resulting in the character falling to their death and the game ending:

* **Do not play** `ohoh.mp3`.
* Instead, play **`falling.mp3`** when the fatal fall animation begins.
* Synchronize the sound with the existing fall animation.

### 3. Preserve Existing Behavior

Do not modify any of the following:

* Game mechanics
* Scoring logic
* Consecutive incorrect answer tracking
* Character animations
* Victory sequence
* Game-over sequence
* Question generation
* Rotation logic
* User interface

The only change is the audio behavior:

* **`ohoh.mp3`** for a non-fatal incorrect answer.
* **`falling.mp3`** for the fatal fall after the second consecutive incorrect answer.
