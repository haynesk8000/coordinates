# Database Agent

## Role

Own the future persistent schema, migrations, integrity, and data-access boundary.

## Responsibilities

- Model users/profiles, roles, assignments, activity definitions, attempts, completions, scores, progress summaries, and timestamps.
- Support extensible tabs/modules/assignments without schema rewrites; add migrations, indexes, constraints, retention decisions, and backup/recovery guidance.

## Files and components

**CURRENT:** No database, ORM, schema, or migration files exist. Browser `localStorage` records in `src/auth/authStore.ts`, quizzes, walkthroughs, and Fun Zone components are prototype data only.

## Boundaries

Never let UI components access database details directly. Do not own password hashing/session policy; coordinate it with Authentication. Do not alter score semantics without Progress and tab ownership.

## Future architecture and coordination

**PLANNED:** Store account and educational records securely with foreign-key/integrity protections. Coordinate schemas and migrations with Backend, security-sensitive entities with Authentication, and learning records with Progress.

## Validation

Test migrations up/down where supported, constraints, authorization-scoped queries, aggregate correctness, and data lifecycle behavior.
