**AI Agent Task: Update the Rotation Reactor (Fun Zone → Coordinate Systems Tab)**

Redesign the **Rotation Reactor** activity to focus on vector rotations and coordinate system rotations. Replace the current gameplay with the specifications below while preserving the overall look and feel of the Fun Zone.

## 1. Replace the Point with a Vector

* Remove the single point currently displayed on the coordinate grid.
* Replace it with a **vector** originating at the origin `(0, 0)` and terminating at the specified coordinate.
* Display the vector with a clearly visible arrowhead.
* The vector should remain fixed until the user submits an answer.

## 2. Question Types

Support two distinct question types:

### Type A: Vector Rotation

* Display a vector on the grid.
* Ask the user to determine the vector's new endpoint after rotating the **vector** about the origin.

### Type B: Coordinate System Rotation

* Display the same vector.
* Ask the user to determine the coordinates of the vector when the **coordinate system** (axes) is rotated while the vector remains fixed in space.
* Use the mathematically correct transformation for rotating the coordinate system.

### Question Selection

* Randomly choose between **Vector Rotation** and **Coordinate System Rotation** for each new question.
* Both question types should occur with approximately equal probability.

## 3. Fixed Coordinate Grid

Remove the adaptive difficulty system.

Use a fixed coordinate grid for the entire activity.

Requirements:

* X-axis ranges from **-6 to +6**.
* Y-axis ranges from **-6 to +6**.
* The origin remains centered.
* Grid spacing is uniform.
* All generated vectors must terminate within the valid grid boundaries.

## 4. Rotation Parameters

For every question, randomly determine:

### Rotation Direction

* Clockwise
* Counterclockwise

### Rotation Angle

Randomly select one of the following angles (in radians):

* π/2
* π
* 3π/2
* 2π

Each angle should have an equal probability of being selected.

## 5. User Interaction

* Display the original vector.
* Clearly state:

  * Whether the **vector** or the **coordinate system** is being rotated.
  * The rotation direction.
  * The rotation angle (in radians).
* The user answers by selecting or plotting the resulting endpoint on the coordinate grid.
* After submission, immediately evaluate the answer and provide clear Correct/Incorrect feedback before presenting the next question.

## 6. Scoring

Maintain a running score.

### Correct Answer

* Award **+1 point**.

### Incorrect Answer

* Deduct **1 point**.

Display the current score throughout the activity.

## 7. Winning Condition

The activity is successfully completed when the user's cumulative score reaches **5 points**.

Upon completion:

* Display a clear success message.
* Play the existing victory animation and sound effects (or equivalent celebration).
* Prevent additional questions until the activity is restarted.

## 8. Failure Condition

Track consecutive incorrect answers.

If the user answers **two consecutive questions incorrectly**:

* End the activity immediately.
* Display a **Game Over** message.
* Prevent additional input until the activity is restarted.

A correct answer resets the consecutive incorrect answer counter to zero.

## 9. Activity Reset

When the activity is restarted:

* Reset the score to **0**.
* Reset the consecutive incorrect answer count to **0**.
* Generate a new random vector.
* Continue using the fixed **-6 to +6** coordinate grid.
* Resume random selection of question type, rotation direction, and rotation angle.

## 10. General Requirements

* Remove all adaptive or changing difficulty logic from the activity.
* Ensure all vector rotations and coordinate system rotations use mathematically correct transformations.
* Keep rendering, coordinate generation, and answer validation synchronized so the displayed vector and expected answer are always consistent.
* Preserve existing UI conventions, accessibility features, and overall visual style unless explicitly modified by this specification.
