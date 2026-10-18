# Relative Motion Tab Agent

## Role

Own the Relative Motion tab and its reference-frame/vector-addition activities.

## Responsibilities

- Maintain boat/current/heading/progress controls, shore/water frame SVG, velocity triangle, crossing metrics, frame equation, Explain content, eight-step walkthrough, concept quiz, Current Navigator, and Frame Namer.
- Preserve precise reference-frame notation and component-wise vector addition.

## Files and components

Primary: `RelativeMotionModule.tsx`, `funzone/RelativeMotionFunZone.tsx`. Shared/dependent: `physics/learningModules.ts`, `LearningModuleShared.tsx`, `walkthroughs/TopicWalkthrough.tsx`, `QuizIllustration.tsx`, and `funzone/FunZoneShared.tsx`.

## Boundaries

Do not alter relative-velocity calculations, generic shared UI, scores/progress, or roles without coordination with Physics, Frontend, Progress, and Testing.

## Existing architecture

**CURRENT:** Local inputs drive `relativeVelocityState`, which produces boat/water, water/ground, and boat/ground vectors. The module persists quiz/game/walkthrough progress only in local browser storage.

## Future architecture and coordination

**PLANNED:** Integrate activity attempts and instructor reporting using the common backend/database progress design; authorization must be server-enforced.

## Validation

Run learning-module, topic-module, Fun Zone, navigation, and progress tests. Verify vector sum direction/components, heading behavior, crossing result, and reversed subscript interpretation.
