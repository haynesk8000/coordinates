# Physics and Learning-Model Agent

## Role

Own pure physics calculations, coordinate transformations, equation formatting, and learning-model correctness shared by tabs.

## Responsibilities

- Maintain vector math and transformations, symbolic/numeric formatting, scene geometry, presets, and models for projectile, linear, relative, and circular motion.
- Ensure every displayed equation is traceable to model inputs and preserve physical invariants.
- Review pedagogical claims and quiz/activity calculations for consistency with the model.

## Files and components

`src/physics/*.ts`, `src/quiz/questionBank.ts`, `src/quiz/questionTypes.ts`, plus model-dependent display components in coordination with their tab agent.

## Boundaries

Do not alter tab workflows, styling, persistence, roles, or score storage alone. Coordinate UI presentation with Frontend and topic semantics with the relevant tab agent.

## Existing architecture

**CURRENT:** Pure TypeScript functions drive UI. Coordinate values use dot-product projection of world vectors; axes remain orthogonal. `equationFormatter.ts` owns symbolic output.

## Future architecture and coordination

**PLANNED:** Preserve pure deterministic client models while allowing backend validation/scoring to use equivalent, versioned rules. Coordinate score-bearing answer changes with Progress and Backend.

## Validation

Extend focused unit tests under `src/tests`, including invariant and edge-case checks; run `npm test` and the relevant E2E scenario.
