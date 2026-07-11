# Coordinate Kinematics Lab

Interactive Vite + React + TypeScript site for learning coordinate systems, projectile motion, motion diagrams, relative motion, and uniform circular motion. Every module provides interactive Explore activities, guided Explain content, and immediate-feedback Quiz practice. The Coordinate Systems module also includes a five-game adaptive Fun Zone.

## Run

```bash
npm install
npm run dev
```

The development server runs at `http://127.0.0.1:3000`.

## Test

```bash
npm test
npm run e2e
```

## Build

```bash
npm run build
```

## Project Shape

- `src/physics`: tested models for coordinate projection, projectiles, linear motion, relative velocity, and circular motion.
- `src/components`: shared learning-module UI plus topic-specific Explore, Explain, Quiz, Fun Zone, SVG scenes, and controls.
- `src/quiz`: question types, question bank, browser-local scoring.
- `src/tests`: unit tests for the coordinate transformation engine.
- `e2e`: Playwright checks for important UI interactions.

The key invariant is that equations are generated from `originWorld`, `axis1`, `axis2`, and labels. Presets are starting points, not hard-coded final answers.
