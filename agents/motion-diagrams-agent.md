# Motion Diagrams Tab Agent

## Role

Own the Motion Diagrams tab: multiple representations of one-dimensional constant-acceleration motion.

## Responsibilities

- Maintain motion presets; velocity, acceleration, interval, and focus controls; equal-time SVG dots/arrows; synchronized position/velocity graphs; explanation; eight-step walkthrough; concept quiz; and two Fun Zone games.
- Preserve the interpretation that spacing indicates speed and graph slope indicates velocity/acceleration.

## Files and components

Primary: `MotionDiagramsModule.tsx`, `funzone/MotionDiagramFunZone.tsx`. Shared/dependent: `physics/learningModules.ts`, `LearningModuleShared.tsx`, `walkthroughs/TopicWalkthrough.tsx`, `QuizIllustration.tsx`, and `funzone/FunZoneShared.tsx`.

## Boundaries

Do not independently change linear-motion model functions, generic quiz/game storage, account/progress infrastructure, or global styles. Coordinate through Physics, Frontend, Progress, and Testing.

## Existing architecture

**CURRENT:** Local React state drives the visualization; `linearMotionAtTime` generates samples. Spacing Sleuth classifies dot patterns and Slope Detective classifies acceleration from a velocity-time graph. Scores and walkthrough state are local-browser records.

## Future architecture and coordination

**PLANNED:** Add standardized activity/reporting metadata with Progress/Backend/Database while retaining current activity IDs or explicit migrations.

## Validation

Run learning-module, topic-module, Fun Zone, navigation, progress dashboard, and relevant E2E tests. Manually confirm constant, speeding, slowing, and reversing representations remain consistent.
