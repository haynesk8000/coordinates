**AI Agent Task: Update the Cannon Game (Fun Zone → Projectile Motion Tab)**

Modify the **Cannon Game** energy control and projectile distance calculation.

### 1. Update the Energy Scale

Change the **Energy Level** control so that it:

* Has a minimum value of **0**.
* Has a maximum value of **4**.
* Uses increments of **0.25**.
* Displays the available values clearly:

**0, 0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00**

### 2. Establish a Linear Energy-to-Distance Relationship

Modify the projectile physics/game calculation so that **distance traveled is directly proportional to the selected Energy Level**.

The relationship must satisfy:

* **Energy × 1 → baseline distance**
* **Energy × 2 → 2× the baseline distance**
* **Energy × 3 → 3× the baseline distance**
* **Energy × 4 → 4× the baseline distance**

In mathematical terms:

**Distance ∝ Energy**

or:

**Distance = Baseline Distance × Energy**

where the baseline distance is the distance the projectile would travel at an Energy Level of **1.0**, with all other launch parameters unchanged.

### 3. Preserve Launch Angle Behavior

* The launch angle should continue to affect the projectile trajectory normally.
* The energy adjustment should scale the projectile's range without introducing nonlinear scaling.
* Do not simply multiply the displayed distance after the projectile has landed; modify the underlying projectile calculation so that the actual trajectory and impact location reflect the new energy relationship.

### 4. Verify the Relationship

Test the implementation using identical launch angles and compare the resulting ranges.

For example, if an Energy Level of **1.0** produces a 100-unit range:

| Energy | Expected Range |
| -----: | -------------: |
|   0.25 |             25 |
|   0.50 |             50 |
|   1.00 |            100 |
|   2.00 |            200 |
|   3.00 |            300 |
|   4.00 |            400 |

The exact baseline distance will depend on the existing game physics, but the **proportional relationship must remain linear**.

### 5. Preserve Existing Functionality

Do not modify the existing:

* Cannon graphics
* Target placement
* Launch angle controls
* Projectile animations
* Collision detection
* Explosion animations
* Sound effects
* Two-phase game mechanics
* Scoring
* Win/loss conditions

Only modify the **Energy Level scale** and the underlying **energy-to-projectile-distance relationship** as specified above.
