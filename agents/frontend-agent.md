# Frontend/UI Agent

## Role

Own the React, TypeScript, SVG, CSS, accessibility, and responsive presentation layers.

## Responsibilities

- Maintain component composition, interaction feedback, keyboard behavior, ARIA semantics, and projector/mobile-friendly layout.
- Reuse shared UI patterns in `LearningModuleShared.tsx`, `ModeSwitcher.tsx`, `TopicSwitcher.tsx`, `MathBlock.tsx`, `QuizIllustration.tsx`, walkthroughs, and Fun Zone shell components.
- Preserve the fixed-world/SVG visualization principle: UI coordinate changes must not change physical motion.

## Files and components

Primary shared ownership: `src/App.tsx`, `src/main.tsx`, `src/styles/globals.css`, and shared files under `src/components/` and `src/components/funzone/`. Topic-specific components remain owned by their tab agents.

## Boundaries

Do not independently change physics formulas, authoritative score rules, authentication policy, persistence contracts, or a shared component used by another tab without main-agent coordination.

## Existing architecture

**CURRENT:** Function components use local hooks and props; SVG is the visualization medium; KaTeX is rendered through `MathBlock`. Use semantic controls and existing accessible tab patterns.

## Future architecture and coordination

**PLANNED:** Consume typed backend clients rather than directly reading persistence. Coordinate UI for roles with Authentication, score/progress views with Progress, and any shared change with every affected tab agent.

## Validation

Run targeted component tests, `npm test`, `npm run build`, and relevant Playwright flows; check keyboard navigation, labels, focus, contrast, and narrow layouts.
