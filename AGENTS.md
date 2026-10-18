# Physics Motion Lab — Agent Architecture Guide

## Status language

- **CURRENT** means verified in this repository as of this document.
- **PLANNED** means requested future work, not implemented.
- **PROPOSED** means a recommendation requiring design and implementation approval.

## Main-agent role

The main agent owns integration. For every request it must identify the affected top-level learning tab(s), shared layers, data boundary, and tests; then delegate focused work to the appropriate tab and architectural agents. It coordinates cross-cutting work, reviews resulting changes for conflicts, preserves working behavior, and runs or coordinates validation before handoff. It should delegate specialized implementation where an applicable agent exists rather than treating each change as a one-agent task.

The main agent must keep tab agents (domain behavior) and architectural agents (technical layers) aligned. For example, a scored activity requires the owning tab agent plus progress/scoring, frontend, testing, and—once present—backend/database agents. Authentication or permissions additionally require the authentication agent.

## Current implementation

### Stack and entry points

- **CURRENT:** Vite 7, React 19, TypeScript, KaTeX, Lucide React, SVG, Vitest/Testing Library, and Playwright. `src/main.tsx` mounts `App.tsx`; all styling is in `src/styles/globals.css`.
- **CURRENT:** This is a static frontend. There are no HTTP API calls, server code, database client, environment-backed secrets, or production email service.
- **CURRENT:** `src/App.tsx` gates the UI on `AuthScreen` and student instructor assignment, then renders learning directly with a browser-local progress dashboard and the five-topic `TopicSwitcher`. Instructor and administrator dashboard tabs are not exposed.

### Five top-level learning tabs

| Tab | Current purpose and primary implementation |
| --- | --- |
| Coordinate Systems | Coordinate transformations for a projectile. `CoordinateSystemsModule.tsx`, `ExploreMode.tsx`, `ExplainMode.tsx`, `QuizMode.tsx`, `SceneCanvas.tsx`, `EquationPanel.tsx`, `ComponentBreakdown.tsx`, `VelocityEquationsPanel.tsx`, `ExploreWalkthroughs.tsx`, `FunZoneMode.tsx`, `physics/coordinateSystem.ts`, `presets.ts`, `equationFormatter.ts`, `sceneGeometry.ts`, `projectile.ts`. |
| Projectile Motion | Launch controls, SVG trajectory, vectors, component equations, guided walkthrough, concept quiz, Cannon Game. `ProjectileMotionModule.tsx`, `funzone/ProjectileFunZone.tsx`, `funzone/CannonGame.tsx`, `physics/learningModules.ts`. |
| Motion Diagrams | Equal-time dots, velocity arrows, synchronized graphs, presets, walkthrough, quiz, Spacing Sleuth and Slope Detective games. `MotionDiagramsModule.tsx`, `funzone/MotionDiagramFunZone.tsx`, `physics/learningModules.ts`. |
| Relative Motion | Boat/current reference-frame simulation, vector triangle, walkthrough, quiz, Current Navigator and Frame Namer games. `RelativeMotionModule.tsx`, `funzone/RelativeMotionFunZone.tsx`, `physics/learningModules.ts`. |
| Uniform Circular Motion | Orbit visualization, radius/angular-speed/time/direction controls, component display, walkthrough, quiz, circular-motion games. `CircularMotionModule.tsx`, `funzone/CircularMotionFunZone.tsx`, `physics/learningModules.ts`. |

Every topic currently offers Explore, Explain, and Quiz. Each also exposes a Fun Zone; the Coordinate Systems topic has Target Plotter, Shifting Coordinates, and Rotation Reactor. Topic modules preserve React state while hidden because `App.tsx` keeps all topic panels mounted.

### Data flow, state, and persistence

- **CURRENT:** Topic/module inputs use local React `useState`. The coordinate engine projects world position, velocity, and acceleration onto orthogonal axes, then the formatter produces displayed equations. Scene interactions update the system passed from `CoordinateSystemsModule`.
- **CURRENT:** `src/physics` holds pure computational models. `src/components/LearningModuleShared.tsx` supplies module shells, common quizzes, controls, metrics, and explanation layout. `src/components/funzone/FunZoneShared.tsx` centralizes game score/difficulty behavior.
- **CURRENT:** Quiz scores, walkthrough completion, Fun Zone statistics, accounts, sessions, instructor assignment, and a snapshot of progress are stored in browser `localStorage`/`sessionStorage` under versioned keys. `authStore.syncProgress()` copies matching local records into the currently stored user; it is not multi-device synchronization.
- **CURRENT:** `src/auth/authStore.ts` performs a client-side SHA-256 PIN digest, local verification/reset token simulation, roles, instructor selection, and administrator mutations. The first verified account becomes administrator; later accounts begin as students. This is a development-only frontend prototype and cannot provide trustworthy authorization, secure credential handling, or real email delivery.
- **CURRENT:** Instructor and administrator dashboard components remain in the repository but are not rendered by the app. Scores are immediate client-side feedback only.

### Testing and accessibility

- **CURRENT:** Unit/component tests live in `src/tests`; Playwright end-to-end checks live in `e2e/app.spec.ts`. The test suite covers physics transformations, formatting, scene geometry, UI navigation, walkthroughs, games, browser persistence, and local auth helpers.
- **CURRENT:** The interface uses semantic tab roles, keyboard topic navigation, ARIA labels for sliders and interactive SVG controls, live feedback, SVG text alternatives, and responsive CSS. Preserve these patterns.

## Planned backend and database

- **PLANNED:** A backend will provide student/instructor accounts, login/logout, authenticated sessions, role-based authorization, activity completion, scores, performance records, instructor access to assigned student results, and persistent storage.
- **PLANNED:** A database will persist users, student/instructor profiles, roles/permissions, authentication metadata, progress, completions, attempts, scores/overall scores, and relevant timestamps. Its schema must support later modules, activities, assignments, tabs, and scoring dimensions without major restructuring.
- **PLANNED:** Passwords/PINs must never be stored plaintext. Replace the browser-only auth prototype with server-side slow salted password hashing, secure session/token lifecycle, validation, authorization enforcement, HTTPS, and protected student data. Use secure HTTP-only cookies where appropriate. Never trust browser values as authoritative permissions or scores.
- **PROPOSED:** Define versioned API contracts and database migrations before replacing local storage. Support a migration/import decision explicitly; do not silently treat prototype browser state as canonical production data.

## Future development principles

- Preserve working functionality and make the smallest reasonable scoped change.
- Do not refactor unrelated files. Follow existing conventions and reuse shared components/utilities where practical.
- Keep UI presentation separate from backend business logic and database access. Centralize authentication/authorization.
- Validate at system boundaries; never expose credentials, secrets, hashes, or tokens.
- Keep scoring/progress calculations consistent, server-authoritative once a backend exists, and compatible with existing activities.
- Respect ownership boundaries. Coordinate shared-component, physics-model, persistence, and cross-tab changes through the main agent.
- Update documentation after architecture changes and test before completion.

## Agent map

- Architectural: `agents/frontend-agent.md`, `physics-learning-agent.md`, `backend-agent.md`, `database-agent.md`, `authentication-agent.md`, `progress-agent.md`, `testing-agent.md`.
- Domain tabs: `coordinate-systems-agent.md`, `projectile-motion-agent.md`, `motion-diagrams-agent.md`, `relative-motion-agent.md`, `uniform-circular-motion-agent.md`.

Shared files are not owned independently by a tab. Changes to `App.tsx`, `TopicSwitcher.tsx`, `ModeSwitcher.tsx`, `LearningModuleShared.tsx`, `ProgressDashboard.tsx`, auth, shared Fun Zone/walkthrough utilities, `physics/*`, or global CSS require the main agent to involve the applicable architectural agent and all affected tab agents.
