**AI Agent Task: Update the Fun Zone (Projectile Motion Tab)**

Implement the following updates to all activities on the **Projectile Motion** tab.

## 1. Remove Difficulty Levels from All Activities

Remove the difficulty level system from every activity on the Projectile Motion tab.

### Requirements

* Remove all difficulty levels and progression logic.
* Eliminate any adaptive difficulty algorithms or performance-based adjustments.
* Remove all difficulty-related UI elements, including:

  * Difficulty selectors
  * Difficulty labels
  * Difficulty indicators
  * Difficulty percentage displays
  * Level progression controls
* Configure each activity to use a single, fixed set of gameplay parameters for the entire game session.
* Starting a new game should reset only the gameplay state (score, targets, animations, etc.), not any gameplay parameters.

Review each activity and remove any difficulty-dependent behavior, including (where applicable):

* Target generation
* Scoring modifiers
* Time limits
* Physics parameters
* Projectile settings
* Any other mechanics influenced by difficulty

## 2. Update the Cannon Game Target Hit Sound

Modify the **Cannon Game** as follows:

* When the projectile successfully hits the target, play the audio file **`explosion.mp3`**.
* Start playback at the beginning of the target-hit explosion animation so the sound is synchronized with the visual effect.
* Replace the existing target-hit explosion sound with **`explosion.mp3`**.
* Ensure the sound plays exactly once for each successful target hit and does not overlap or replay unintentionally.

## 3. Preserve Existing Functionality

Do **not** modify any other gameplay mechanics. Preserve the existing:

* Projectile physics
* Scoring rules
* Animations
* Game flow
* Win and loss conditions
* User interface layout (except for removing difficulty-related elements)
* All other sound effects not explicitly replaced above

The only changes should be:

1. Complete removal of the difficulty level system from all Projectile Motion activities.
2. Replacement of the Cannon Game's target-hit sound effect with **`explosion.mp3`**.
