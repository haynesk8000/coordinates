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

## Authentication development mode

The application opens at a required registration/login screen. All accounts receive the student experience and can access activities without selecting an instructor. Legacy role and instructor fields are accepted for compatibility; accounts, credentials, and progress are preserved.

The welcome screen randomly selects an image from `Welcome_images` when it opens. Educational links are configured by exact image filename in `src/data/welcomeResources.ts` and rendered by `WelcomeResourceButtons`; new artwork without a resource mapping still displays without links. Resources open in a new tab and preserve the selected image.

This repository remains a static Vite application. For local development, accounts and synchronized progress are represented by the browser-backed service in `src/auth/authStore.ts`, and registration displays an email preview containing the PIN and verification action. PINs are stored as SHA-256 digests rather than plain text.

Before a public or multi-device deployment, replace that service with authenticated HTTPS endpoints and a database, issue secure HTTP-only session cookies, hash PINs server-side with a slow salted password hash, and connect the registration/recovery actions to an email provider. Client storage cannot enforce server authorization or deliver real email on its own.

## Project Shape

- `src/physics`: tested models for coordinate projection, projectiles, linear motion, relative velocity, and circular motion.
- `src/components`: shared learning-module UI plus topic-specific Explore, Explain, Quiz, Fun Zone, SVG scenes, and controls.
- `src/quiz`: question types, question bank, browser-local scoring.
- `src/tests`: unit tests for the coordinate transformation engine.
- `e2e`: Playwright checks for important UI interactions.

The key invariant is that equations are generated from `originWorld`, `axis1`, `axis2`, and labels. Presets are starting points, not hard-coded final answers.
