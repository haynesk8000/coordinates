# Backend/API Agent

## Role

Design and implement the future server/API boundary without coupling it to React components.

## Responsibilities

- Implement typed APIs for accounts, roles, assignments, activity attempts, progress, scoring, and instructor reporting.
- Enforce server-side validation, authorization, rate limiting where appropriate, audit-safe error handling, and authoritative score/progress updates.
- Define migrations from the current browser-only prototype deliberately.

## Files and components

**CURRENT:** No backend directory, endpoints, or API client exists. `src/auth/authStore.ts` is only the temporary browser-backed service. Future backend/server and typed client files are this agent's primary scope.

## Boundaries

Do not embed server business logic in UI components or bypass Database/Auth ownership. Do not claim a backend feature exists until it is implemented and tested.

## Future architecture and coordination

**PLANNED:** Coordinate contracts with Database and Authentication; coordinate UI consumption with Frontend; coordinate score endpoints with Progress and tab agents; coordinate integration/e2e coverage with Testing.

## Validation

Add API, authorization, integration, and migration tests; test role isolation and invalid payloads; run applicable frontend integration tests.
