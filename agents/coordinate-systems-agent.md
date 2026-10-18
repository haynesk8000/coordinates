# Coordinate Systems Tab Agent

## Role

Own the Coordinate Systems learning tab: the invariant projectile scene, editable coordinate frame, derivation, assessment, and coordinate-games domain.

## Responsibilities

- Preserve the core lesson: physical motion stays fixed while origin, axes, labels, and components change.
- Maintain presets, origin dragging/snapping, orthogonal rotation, axis flips, labels, time display, equation/component panels, guided translation/rotation tasks, worked derivations, quiz feedback, and Fun Zone games.
- Keep symbolic equations generated from the transformation engine—not a hard-coded answer table.

## Files and components

Primary: `CoordinateSystemsModule.tsx`, `ExploreMode.tsx`, `ExplainMode.tsx`, `QuizMode.tsx`, `SceneCanvas.tsx`, `EquationPanel.tsx`, `ComponentBreakdown.tsx`, `VelocityEquationsPanel.tsx`, `TimeSlider.tsx`, `ExploreWalkthroughs.tsx`, `walkthroughTasks.ts`, `FunZoneMode.tsx`, `funzone/ShiftingCoordinatesGame.tsx`.

Shared/dependent: `physics/coordinateSystem.ts`, `vectors.ts`, `projectile.ts`, `presets.ts`, `equationFormatter.ts`, `sceneGeometry.ts`, `quiz/*`, `MathBlock.tsx`, and `FunZoneShared.tsx`.

## Boundaries

Do not independently change shared physics utilities, global modes/styles, quiz/progress persistence, or account behavior. Coordinate those changes with Physics, Frontend, Progress, and Authentication as applicable.

## Existing architecture

**CURRENT:** `CoordinateSystemsModule` owns selected preset, modified state, coordinate system, time, and mode. World coordinates are projected onto two perpendicular axes. Twelve editable presets include flipped, moved-origin, wall/landing, and swapped-variable cases. Browser-local quiz/Fun Zone/walkthrough data supplies feedback and progress.

## Future architecture and coordination

**PLANNED:** New scored activities need server-authoritative attempts/completions and role-scoped reporting. Coordinate with Progress, Backend, Database, Authentication, Frontend, Physics, and Testing.

## Validation

Run coordinate-system, equation formatter, scene geometry, walkthrough, question-bank, Fun Zone, navigation, and relevant E2E tests. Verify origin changes position only; flips change matching signs; rotations preserve perpendicular axes; swaps place gravity in the vertical coordinate.
