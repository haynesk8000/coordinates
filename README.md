# Coordinate Kinematics Lab

Interactive Vite + React + TypeScript site for learning coordinate-system descriptions of projectile motion. The app lets students move, rotate, flip, relabel, and swap coordinate axes while the physical projectile path stays fixed.

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

- `src/physics`: vector math, projectile motion, coordinate projection, presets, symbolic equation formatting.
- `src/components`: Explore, Explain, Quiz, SVG scene, equation panel, controls.
- `src/quiz`: question types, question bank, browser-local scoring.
- `src/tests`: unit tests for the coordinate transformation engine.
- `e2e`: Playwright checks for important UI interactions.

The key invariant is that equations are generated from `originWorld`, `axis1`, `axis2`, and labels. Presets are starting points, not hard-coded final answers.
