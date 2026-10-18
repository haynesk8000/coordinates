# Uniform Circular Motion Tab Agent

## Role

Own the Uniform Circular Motion tab and its orbit/centripetal-motion learning domain.

## Responsibilities

- Maintain radius, angular speed, time, and direction controls; orbit SVG; tangent velocity/inward acceleration vectors; live orbit/cycle metrics; Cartesian components; Explain content; eight-step walkthrough; concept quiz; and circular Fun Zone activities.
- Preserve the lesson that constant speed can still have acceleration because velocity direction changes.

## Files and components

Primary: `CircularMotionModule.tsx`, `funzone/CircularMotionFunZone.tsx`. Shared/dependent: `physics/learningModules.ts`, `LearningModuleShared.tsx`, `walkthroughs/TopicWalkthrough.tsx`, `QuizIllustration.tsx`, and `funzone/FunZoneShared.tsx`.

## Boundaries

Do not independently alter shared circular-motion calculations, generic UI, storage/scoring, or account infrastructure. Coordinate with Physics, Frontend, Progress, and Testing.

## Existing architecture

**CURRENT:** Local state drives `circularMotionAtTime`; it returns position, tangent velocity, inward acceleration, period, and related values. Quiz/game/walkthrough persistence is browser-local.

## Future architecture and coordination

**PLANNED:** Add common server-authoritative attempts/completion/reporting through Progress, Backend, Database, and Authentication without breaking the immediate exploration experience.

## Validation

Run learning-module, topic-module, Fun Zone, navigation, and progress tests. Verify tangency, inward acceleration, direction reversal, period/frequency relationships, and component signs.
