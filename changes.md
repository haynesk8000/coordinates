Update the **Projectile Motion** tab by modifying the visualization of the projectile flight. Preserve all existing functionality except where explicitly specified below.

#### Requirements

1. **Ground Scale**

   * Keep the **ground line** exactly the same length on the screen. Do **not** change the size of the interactive display or the length of the ground line.
   * Redefine the world-coordinate scale so that the full length of the ground line represents **110 meters**.

2. **Vertical Scale**

   * Keep the interactive display at its current height.
   * Define the vertical world-coordinate scale so that the distance from the **ground line** to the **top edge of the interactive display** represents **65 meters**.

3. **Fixed World-to-Screen Mapping**

   * Implement a **fixed world-to-screen transformation** based on the dimensions above:

     * Horizontal: **110 meters** across the full ground line.
     * Vertical: **65 meters** from the ground line to the top of the display.
   * This mapping must remain constant for all simulations.

4. **Disable Dynamic Scaling**

   * Do **not** automatically rescale, zoom, or adjust the visualization as the user changes launch speed, launch angle, launch height, or any other flight parameters.
   * All trajectories must be rendered using the same fixed coordinate system.

5. **Preserve Existing Functionality**

   * Do **not** modify the projectile motion equations, physics calculations, controls, animations, or user interface.
   * Only update the visualization's world-to-screen coordinate mapping.

6. **Validation**
   Before completing the task, verify that:

   * The interactive display size is unchanged.
   * The ground line visually remains the same length while representing **110 meters**.
   * The distance from the ground line to the top of the display represents **65 meters**.
   * The visualization never rescales as flight parameters change.
   * All other projectile motion functionality continues to operate correctly.
