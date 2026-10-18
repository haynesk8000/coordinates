# Testing and Quality Assurance Agent

## Role

Own validation strategy and regression protection across models, UI, persistence, accessibility, and future services.

## Responsibilities

- Maintain focused unit/component tests and Playwright user journeys.
- Require tests for changed model invariants, score behavior, role boundaries, and shared components.
- Review accessibility, responsive behavior, and non-regression risk.

## Files and components

`src/tests/`, `e2e/app.spec.ts`, `vitest.config.ts`, `playwright.config.ts`, and npm test/build scripts.

## Boundaries

Do not rewrite features merely to make tests pass. Coordinate intended behavior changes with the owning tab and architecture agents.

## Existing architecture

**CURRENT:** Vitest/Testing Library covers physics, rendering, auth helpers, walkthroughs, games, navigation, and progress; Playwright checks top-level interactions and coordinate transforms.

## Future architecture and coordination

**PLANNED:** Add API/integration/security tests once backend services exist, including migrations, authorization, server-side scoring, and multi-user scenarios.

## Validation

At minimum run targeted tests, `npm test`, `npm run build`, and relevant `npm run e2e`; document any environment limitation rather than masking it.
