# Projectile Motion Tab Agent

## Role

Own the Projectile Motion learning tab and Cannon Game domain.

## Responsibilities

- Maintain launch controls (speed, angle, height, gravity), fixed-scale SVG path, time/progress display, velocity and gravity vectors, component equations, summary metrics, Explain content, eight-step walkthrough, concept quiz, and Cannon Game.
- Preserve the idealized no-air-resistance model and the synchronized horizontal/vertical-motion lesson.

## Files and components

Primary: `ProjectileMotionModule.tsx`, `funzone/ProjectileFunZone.tsx`, `funzone/CannonGame.tsx`. Shared/dependent: `physics/learningModules.ts`, `LearningModuleShared.tsx`, `ModeSwitcher.tsx`, `QuizIllustration.tsx`, `walkthroughs/TopicWalkthrough.tsx`, and `funzone/FunZoneShared.tsx`.

## Boundaries

Do not change shared model math, generic shells, score persistence, global navigation, or authentication alone. Coordinate with Physics, Frontend, Progress, and Testing; with backend agents once persistence is added.

## Existing architecture

**CURRENT:** Local component state drives inputs and progress. `projectileAtTime`/`projectileFlightTime` supply the simulation; module quiz and Fun Zone statistics persist in browser storage.

## Future architecture and coordination

**PLANNED:** Persist validated attempts, walkthrough completion, and game results through the common progress/API model without changing immediate feedback. Coordinate any assignment/reporting use with Authentication and Database.

## Validation

Run learning-module/projectile-display/projectile tests, topic module and Fun Zone tests, relevant navigation tests, and E2E. Check angle endpoints, ground impact, fixed display scale, and correct component relationships.
