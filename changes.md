**AI Agent Task: Add a New Game — Shifting Coordinates**

Add a new game called **Shifting Coordinates** to the **Fun Zone → Coordinate Systems** tab.

### 1. Game Placement

Add **Shifting Coordinates** to the Coordinate Systems tab and position it:

**Target Plotter → Shifting Coordinates → Rotation Reactor**

Do not alter the position or functionality of the other games.

---

### 2. Coordinate Grid

The game should use a fixed coordinate grid for the entire game:

* X-axis: **-6 to +6**
* Y-axis: **-6 to +6**
* Origin `(0, 0)` centered on the grid.
* Use uniform spacing between coordinate values.
* A single point should be plotted somewhere on the grid for each question.

Ensure the displayed grid, plotted point, coordinate calculations, and answer validation all use the same coordinate system.

---

### 3. Coordinate Transformation Questions

For each question:

1. Plot a point on the original coordinate system.
2. Present a transformation that changes the original coordinate system into a new coordinate system.
3. Ask the player to determine the coordinates of the point in the **new coordinate system**.

Randomly select from the following transformation types:

* Shift in the **x-direction**.
* Shift in the **y-direction**.
* Shift in both **x and y directions**.
* Flip/reverse the **x-axis**.
* Flip/reverse the **y-axis**.
* Flip/reverse both axes.
* Combined shift and flip.

The transformations and resulting coordinates must be mathematically correct.

---

### 4. Three-Door Answer Interface

To the **right of the coordinate grid**, create an animated scene containing:

* Three doors positioned side-by-side.
* A coordinate answer displayed above each door.
* Exactly **one correct answer**.
* Two incorrect answers.
* A character standing in the scene.

The three answer choices should be generated dynamically for each question.

The incorrect answers should be plausible enough to require the player to understand the coordinate transformation rather than simply guessing.

---

### 5. Door Selection Animation

When the player selects a door:

1. Disable additional input.
2. Animate the character walking toward the selected door.
3. Animate the character opening the door.

#### Correct Door

If the selected door contains the correct coordinate:

1. Character walks through the doorway.
2. Character closes the door behind them.
3. Display clear **Correct!** feedback.
4. Wait approximately **2 seconds**.
5. Generate and display the next question.
6. Reset the character to the starting position for the new question.

#### Incorrect Door

If the selected door contains an incorrect coordinate:

1. Display clear **Incorrect!** feedback.
2. Reveal the correct coordinate.
3. Trigger one randomly selected cartoon-style bad event from the list below.
4. Play an appropriate sound effect.
5. Complete the animation before continuing.

---

### 6. Random Bad Events

When an incorrect door is selected, randomly choose one of these 15 events:

1. **Trapdoor** — The floor opens and the character drops out of sight into darkness.
2. **Monster Attack** — A monster bursts through the doorway and chases the character off-screen.
3. **Falling Rocks** — Cartoon rocks fall around the character and cover the scene.
4. **Lightning Strike** — Lightning flashes and the character is knocked backward in a cartoon-style effect.
5. **Fire Blast** — A burst of flames shoots from the doorway and sends the character running away.
6. **Poison Gas** — Green cartoon gas fills the area and the character becomes dizzy and collapses.
7. **Giant Boulder** — A giant boulder rolls toward the character and the character runs off-screen.
8. **Shark Pit** — The floor opens into a cartoon shark pit and the character falls behind the foreground with a splash.
9. **Cannon Blast** — A cannon fires and launches the character off-screen.
10. **Giant Spider** — A giant spider drops from above and the character runs away.
11. **Avalanche** — Snow and ice rush into the scene and cover the character.
12. **Lava Flow** — Cartoon lava enters the scene and the character escapes upward or off-screen.
13. **Electrified Floor** — The floor becomes electrified and the character reacts with a cartoon electrical effect before collapsing.
14. **Robot Attack** — A robot appears and blasts the character backward with a non-graphic cartoon effect.
15. **The Abyss** — The doorway disappears and the character falls into a stylized swirling void.

The events should be visually distinct and entertaining. Use **cartoon/game-style effects rather than graphic injury or gore**.

---

### 7. Lives / Incorrect Answers

The player may make up to **three incorrect choices** during the game.

* **1st incorrect choice:** Trigger a random bad-event animation. The game continues.
* **2nd incorrect choice:** Trigger another random bad-event animation. The game continues.
* **3rd incorrect choice:** Trigger the bad-event animation, then end the game.

Display the number of incorrect choices/lives remaining clearly.

A correct answer does not restore a lost life.

---

### 8. Winning Condition

The player wins after selecting **5 correct doors**.

After the fifth correct answer:

1. Complete the correct-door animation.
2. Move the character through the door.
3. Display a clear **You Win!** message.
4. Animate the character performing a fun celebratory dance.
5. Play upbeat celebratory music.
6. End the game and prevent additional questions until the player starts a new game.

---

### 9. Game-Over Condition

The game ends after the player's **third incorrect answer**.

After the third bad-event animation:

* Display a clear **Game Over** message.
* Disable additional questions and door selections.
* Provide an option to start a new game.

---

### 10. Question Flow

The game should follow this sequence:

**Generate point → Generate coordinate transformation → Calculate correct transformed coordinate → Generate two plausible incorrect coordinates → Display three doors → Player selects door → Animate character → Evaluate answer → Show feedback → Play appropriate animation → Continue or end game**

Do not present the next question until the current question's animation and feedback have completed.

---

### 11. Mathematical Accuracy

The coordinate transformation calculations are critical.

For every question:

* The correct answer must be calculated from the actual transformation applied to the original coordinate system.
* The displayed transformation must exactly match the calculation.
* The correct answer must be one of the three displayed choices.
* The two incorrect answers must never accidentally equal the correct answer.
* Coordinate values must remain consistent with the **-6 to +6** grid where appropriate.

Test all transformation types, including combinations of shifts and axis flips.

---

### 12. User Interface and Accessibility

* Clearly identify the three answer choices.
* Make the doors large enough to select easily.
* Provide visual feedback for correct and incorrect answers.
* Ensure the game is usable with keyboard navigation where supported.
* Provide appropriate alternative text or accessible descriptions for important visual elements.
* Do not rely solely on color to communicate whether an answer is correct or incorrect.

---

### 13. Preserve Existing Application Functionality

Do not modify the existing **Target Plotter**, **Rotation Reactor**, or any other Fun Zone activities.

The only changes should be:

1. Add the new **Shifting Coordinates** game.
2. Place it between **Target Plotter** and **Rotation Reactor**.
3. Implement the coordinate transformation gameplay and associated animations described above.
