# Arcade Game Concepts for the Coordinate System Tab

## Design context

The current tab keeps one projectile path fixed while students move the origin, rotate or flip orthogonal axes, choose presets, relabel axes, and swap which physical direction is called `x` or `y`. Its live vectors, component table, equations, derivations, and quizzes teach this chain:

`origin → initial coordinates`  
`axis direction → signs`  
`axis orientation → projected magnitudes`  
`axis label → equation variable`  
`velocity and gravity → components`  
`all choices → component equations`

These proposals reinforce those objectives while differing from the existing plotting, coordinate-reading, translation, rotation, and coordinate-relationship mini-games. All can use the existing React, TypeScript, SVG, projection/equation engine, and `localStorage`; none needs a backend.

## 1. Frame Shift Frenzy

### Gameplay

A fast survival-matching game. The projectile approaches gates along its unchanged world-space path. Each gate requests a frame, such as “origin at wall top; axis 1 left; axis 2 down; labels `a, b`.” The player must reconfigure the overlaid frame before impact. The scenery and trajectory never move, making invariant physical motion visible throughout play.

### Concepts reinforced

Origin changes affect only position components; flips reverse every component on that axis; rotation changes projections while preserving orthogonality; labels change symbols rather than vectors; swaps decide which named equation receives velocity or gravity.

### Core mechanics

- Drag the origin to cliff, ground, wall, or landing anchors.
- Drag an axis handle or use keys to rotate in 15-degree steps.
- Use two flip controls plus label and swap controls.
- Lock the frame before the gate; optional ghost hints reveal origin or orientation.

This can reuse the current SVG handles, anchors, rotation units, flips, and clamping.

### Immediate feedback

Properties validate separately: the origin pulses, axes glow when aligned, and labels snap into sockets. A miss slows time and isolates the issue: “Origin is correct; positive `b` points the wrong way.” A before/after strip identifies changed and invariant components, while world velocity and gravity arrows stay fixed.

### Score and replayability

Award base, speed, and rotation-precision points; grow a combo for first-try frames; use three shield segments as lives. Daily seeded runs, local high scores, and medals for flawless origin, sign, or swapped-label rounds encourage return play.

### Difficulty

- **Beginner:** cardinal axes, visible anchors, one change at a time.
- **Intermediate:** simultaneous origin, flip, and label changes.
- **Advanced:** common non-cardinal angles, swaps, shorter gates.
- **Expert:** infer the frame from a component table or equation pair.

### Arcade presentation

Use sweeping gates, neon lock-on outlines, grid trails, separate confirmation clicks, and a low-time pulse. Rotation pitch can track angle. Reduced motion replaces sweeps with fades; audio is optional.

## 2. Equation Blaster

### Gameplay

A fixed-screen shooter/sorting game. Terms such as `H`, `-d1`, `v0 t`, `-v0 t`, `+1/2 gt²`, and `-1/2 gt²` drift toward two equation bays named for the current axes. The player routes valid terms to the correct bay and destroys decoys. A cleared wave assembles both simplified equations.

### Concepts reinforced

Constants come from origin placement, linear terms from projected launch velocity, and quadratic terms from projected gravity. Students practice independent component signs, swapped/custom label ownership, and omission of zero terms.

### Core mechanics

- Move between two lanes by keyboard, pointer, or touch.
- Fire a capsule into the active bay; switch bays with a key/button.
- Send zero or impossible decoys to a recycle portal.
- Spend a limited “projection scan” for a component hint.
- Order captured terms as constant, linear, and quadratic after a wave.

Generate correct terms from the formatter and distractors through controlled sign, label, origin, or axis-assignment mutations.

### Immediate feedback

A correct term traces to its source: origin, velocity arrow, or gravity arrow. A wrong term bounces away with a specific reason, such as “Gravity has no component along horizontal `a`.” Wave completion compares the assembly with the engine result and highlights corrections.

### Score and replayability

Give points for correctness, speed, and order; a `1×`–`5×` combo; three hull lives; “No Scan” and perfect-wave bonuses; and a locally saved endless-mode score.

### Difficulty

- **Beginner:** one bay, default frame, color-coded term types.
- **Intermediate:** two bays, moved origins, flips, decoys.
- **Advanced:** swapped/custom labels, faster terms, no color categories.
- **Expert:** sine/cosine projection terms and equivalent algebraic forms.

### Arcade presentation

Math capsules glow and streak into KaTeX-rendered slots; completed equations send a pulse along the fixed trajectory. Use a capture chime, descending sign-error tone, and low gravity sound. Icons/text duplicate all color cues.

## 3. Origin Heist

### Gameplay

A top-down stealth/deduction game. The launch point is an “artifact,” and candidate origins are terminals at the cliff, ground, wall, and landing region. A mission supplies coordinates and component clues for an unknown frame. The player positions a survey drone and aims its orthogonal beams until the frame fits the evidence, while patrol sweeps add optional pressure. Unlike Frame Shift Frenzy, this is an inverse problem: infer rather than copy the frame.

### Concepts reinforced

Coordinates are displacement from an origin, not absolute position. Initial-coordinate signs locate the projectile relative to positive axes. Moving only the origin leaves velocity and acceleration unchanged. Mixed position, velocity, and acceleration clues identify directions and labels; partial clues may permit several valid frames.

### Core mechanics

- Move among origin anchors using keys or touch.
- Rotate and flip two scanner beams.
- Interpret clues like `q1,0 = -d1`, `v2,0 = v0`, or `a1 = -g`.
- Spend scanner energy to reveal an extra clue.
- Submit the inferred frame.

Validate every solution with dot products rather than a lookup table.

### Immediate feedback

As the origin moves, position rows animate while velocity and acceleration rows stay visibly pinned. Submission checks each clue and draws its projection. If multiple frames are valid, accept all and explain their equivalence.

### Score and replayability

Offer three stars for correctness, few scans, and speed; three mission attempts; a district-based campaign; procedural clue contracts; and a “Mastermind” bonus for using minimal clues.

### Difficulty

- **Beginner:** two origins, visible axes, numeric guides.
- **Intermediate:** four origins, one hidden direction, symbolic `H`, `h`, `d1`, `d2`.
- **Advanced:** infer directions and labels from mixed clues.
- **Expert:** rotated and intentionally underdetermined frames; find all solutions.

### Arcade presentation

Scanner beams sweep like lasers, projections appear as holograms, and correct terminals unlock with a grid ripple. Give position, velocity, and gravity different sound motifs. Include untimed practice and reduced motion.

## 4. Gravity Groove

### Gameplay

A rhythm game with two lanes named after the current axes. Position, velocity, and acceleration cues approach a judgment line. The player taps the correct lane and sign (`+`, `−`, or `0`). Between phrases, the frame moves, flips, rotates, or relabels while the projectile continues unchanged.

### Concepts reinforced

Physical vectors can have positive, negative, or zero components. Gravity stays physically downward; horizontal launch velocity is not automatically an `x` component; rotated frames distribute vectors across both coordinates; label swaps move components to differently named lanes; current velocity changes while acceleration stays constant.

### Core mechanics

- Six remappable inputs: positive, negative, or zero for each lane.
- Hold notes represent constant acceleration.
- Paired notes represent projection onto two rotated axes.
- Frame-change breaks preview the next orientation.
- Call-and-response shows a world vector, then asks for its components.

### Immediate feedback

Every input gets rhythm and physics judgments: “Perfect: gravity points with positive `b`,” or “Sign miss: positive `y` points up, opposite gravity.” The matching projected arrow flashes. Wrong-lane messages address labels; wrong-sign messages address direction. A phrase recap displays the correct component table.

### Score and replayability

Score timing and physics separately. Physics streaks raise a multiplier even if timing is imperfect. An energy meter serves as lives in Arcade mode; Practice mode cannot fail. Unlock songs by concept and store grades, streaks, and skill improvement locally.

### Difficulty

- **Beginner:** loose timing, cardinal axes, one vector type per phrase.
- **Intermediate:** mixed components and flips between measures.
- **Advanced:** swaps, paired lanes, current velocity, faster changes.
- **Expert:** non-cardinal angles plus qualitative magnitude or common-angle factors.

### Arcade presentation

The trajectory becomes a musical staff, arrows pulse on beat, and labels slide between lanes. Gravity notes fall in world space before splitting into coordinate lanes. Provide calibration, mute, visual beats, reduced flash, and reduced motion.

## 5. Coordinate Crisis Control

### Gameplay

A real-time defense/triage game. Several student consoles surround the projectile scene, each proposing equations for a different frame. Some correctly describe the same motion; others contain one sabotage error—a bad origin term, reversed sign, misplaced gravity term, or label swap. The player approves valid consoles and repairs invalid ones before their timers expire. Later waves resemble a busy control-room game with simultaneous diagnoses.

### Concepts reinforced

Different equations may describe identical motion. Every term must trace to origin, direction, projection, or label. Origin movement affects only constants, flips affect all components on their axis, and gravity belongs to the named coordinate with a vertical component. Equations must be checked against the frame rather than memorized.

### Core mechanics

- Select a console to enlarge its frame, component table, and equations.
- Approve it or drag a replacement sign, term, coefficient, or label into place.
- Spend one “trace” per wave to connect terms to visual choices.
- Chain repairs by error type for bonuses.
- Support keyboard console selection and pointer/touch repair.

Start from the engine's valid equation set and inject a tagged misconception so every error has a precise cause.

### Immediate feedback

Approval runs separate position, velocity, and acceleration checks. Correct consoles stabilize with “Same motion verified.” A wrong approval freezes its timer, isolates the failing row, and names the violated rule. Repairs validate against engine recomputation. The wave report groups errors by skill rather than only showing lost points.

### Score and replayability

Award speed/correctness points and unused-trace bonuses. A reactor meter serves as shared lives. Diagnosis streaks raise a multiplier and slow timers briefly. Campaign shifts add one error family at a time; endless mode mixes them. Local mastery data can weight future rounds toward weak skills.

### Difficulty

- **Beginner:** one console, highlighted suspect term, no countdown.
- **Intermediate:** two consoles, moved origins/custom labels, hidden errors.
- **Advanced:** three or four consoles, swaps, compound changes, zero decoys.
- **Expert:** rotated trigonometric equations, equivalent forms, and fully correct waves where nothing should change.

### Arcade presentation

Consoles flicker near deadlines, verified equations pulse into the central trajectory, and repaired terms reconnect to source vectors. Pair alerts with icons and tones. Add pause-anytime, adjustable speed, mute, and reduced motion.

## Shared implementation guidance

All games should derive answers from the current transformation and equation formatter. Presets may seed rounds, but final answers should not be lookup tables. A shared pipeline should:

1. Generate or select an orthogonal coordinate system.
2. Project world position, velocity, and acceleration.
3. Format valid component equations.
4. Derive a prompt or inject one controlled, tagged misconception.
5. Validate numeric components and semantic term roles, not fragile strings.

Shared infrastructure can provide seeded randomness, difficulty profiles, score/streak/lives UI, audio management, reduced-motion settings, and versioned `localStorage`. Every game should offer untimed practice, keyboard and touch support, ARIA live feedback, and a textual diagram alternative.

Together, these are five distinct styles—survival matching, shooter/sorting, stealth deduction, rhythm performance, and real-time triage—built around the same central lesson: the projectile's motion stays the same; only its coordinate description changes.
