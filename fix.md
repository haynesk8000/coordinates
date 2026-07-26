**AI Agent Task: Update the Target Plotter (Fun Zone → Coordinate System Tab)**

Modify the game flow so that each question is fully resolved before the next question is presented.

### Required Behavior

After the user submits an answer for a coordinate placement question:

1. **Evaluate the Answer**

   * Determine whether the user's selected coordinate is correct.
   * Compare the selected coordinate to the expected coordinate using the existing validation logic.

2. **Provide Immediate Feedback**

   * Clearly indicate whether the answer is **Correct** or **Incorrect**.
   * Display the appropriate visual and audio feedback associated with the result.
   * Allow sufficient time for the player to recognize the outcome before continuing.

3. **Update the Game State**

   * If the answer is correct:

     * Advance the climber according to the existing game rules.
   * If the answer is incorrect:

     * Execute the appropriate fall animation and resulting game-state changes based on the climber's current height.

4. **Present the Next Question**

   * After all feedback, animations, and state updates have completed, automatically generate and display the next coordinate placement question.
   * Do not display the next question while feedback or animations from the previous question are still in progress.

### Continue Gameplay

Repeat this sequence for every question until one of the following conditions occurs:

* **Victory:** The climber successfully reaches the platform. Display the existing celebration sequence and end the game.
* **Game Over:** The climber suffers a fatal fall according to the existing game rules. Display the Game Over sequence and end the game.

### Additional Requirements

* Ensure there is exactly one active question at any time.
* Prevent additional user input while answer evaluation, feedback, or animations are in progress.
* Preserve all existing gameplay mechanics, animations, scoring, sound effects, and victory/game-over conditions. Only modify the game flow so that each question is evaluated and resolved before the next question is presented.
