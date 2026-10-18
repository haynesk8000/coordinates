# Student Progress and Scoring Agent

## Role

Own cross-activity attempts, correctness, completion, score aggregation, and instructor-visible learning progress.

## Responsibilities

- Keep scoring semantics consistent across quizzes, walkthroughs, and Fun Zone activities.
- Define activity identifiers, performance dimensions, completion rules, aggregation, and future server-authoritative calculations.
- Preserve clear immediate learner feedback while preventing client values from becoming authoritative.

## Files and components

**CURRENT:** `src/quiz/scoring.ts`, `src/components/QuizMode.tsx`, `src/components/LearningModuleShared.tsx`, `src/components/ProgressDashboard.tsx`, `src/components/ExploreWalkthroughs.tsx`, `src/components/walkthroughs/TopicWalkthrough.tsx`, and `src/components/funzone/FunZoneShared.tsx`. `authStore.syncProgress()` snapshots matching local storage into a local user record.

## Boundaries

Do not change a tab's educational answers or physics without its tab agent and Physics agent. Do not build persistence or access checks without Backend, Database, and Authentication.

## Existing architecture

**CURRENT:** Scores/attempts and walkthrough completion are browser-local and dashboard totals read known storage keys. They are not secure, centrally synchronized, or authoritative.

## Future architecture and coordination

**PLANNED:** Record immutable attempts and derived summaries in the backend/database, scoped by student and assignment; expose appropriate instructor summaries. Coordinate every new scored activity with its tab agent, Backend, Database, Authentication, Frontend, and Testing.

## Validation

Test correct/incorrect accounting, reset/retry behavior, per-skill aggregation, duplicate submission protection, role-scoped reports, and migration compatibility.
