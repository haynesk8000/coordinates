# Coordinate Kinematics Lab — Engagement & Effectiveness Suggestions

Reviewed: 2026-07-18
Scope: read-only review of the current app (React 19 + TypeScript + Vite SPA). No application code was changed as part of this review — this document is recommendations only.

## How the app is structured today (for context)

There are two nested tab layers:
- **Topics** (`TopicSwitcher`): Coordinate Systems, Projectile Motion, Motion Diagrams, Relative Motion, Uniform Circular Motion.
- **Modes** within each topic (`ModeSwitcher`): Explore, Explain, Quiz — plus a **Fun Zone** and **Walkthroughs** that exist *only* inside the Coordinate Systems topic.

That asymmetry — one topic with a full arcade + guided-task system, four topics with a much lighter template — is the single biggest structural fact shaping the suggestions below.

---

## Top priority (highest engagement payoff, least effort)

### 1. Persist Fun Zone progress
`FunZoneMode.tsx` tracks points, accuracy, streaks, and an auto-ramping difficulty meter — the most game-like system in the app — but it lives in plain `useState` with no `localStorage` calls. Every time a student leaves Fun Zone (even just to check Explain mode) and comes back, or reloads the page, their streak and difficulty level reset to zero.

This is very likely undermining the exact feature meant to hook students. The Coordinate Systems quiz and the Walkthroughs both already persist to `localStorage` — Fun Zone should follow the same pattern (e.g. `coordinate-funzone-stats-v1`). This is a small, contained fix with outsized effect on perceived progress and return visits.

### 2. Extend real color beyond Fun Zone
`globals.css` defines CSS variables named like a palette (`--blue`, `--teal`, `--red`, `--amber`, `--purple`) but they all resolve to near-identical dark grays. The entire app — every topic, every mode — is effectively monochrome except Fun Zone, which has a distinct, considerably more vivid palette (coral/blue/green/purple/gold accents, gradient hero banner).

Since a working, appealing color language already exists in one corner of the app, the fix isn't "invent a design system" — it's "use the one you already built." Concrete options:
- Assign each of the 5 topics its own accent color (reuse Fun Zone's palette) so `TopicSwitcher` and each module's header read as visually distinct, memorable places rather than five copies of the same gray shell.
- Use color intentionally for state, not just decoration: correct/incorrect quiz feedback, "task complete" states in Walkthroughs/GuidedChallenges, and difficulty-level changes could all borrow Fun Zone's existing success/level-up treatment instead of staying text-only.
- Keep the serious, low-noise gray as the *base* (it suits equation panels and derivations) but stop treating it as the only voice the app has.

### 3. Bring Walkthroughs and a persisted "discoveries" system to all five topics
The 20-task Translation/Rotation Walkthrough system in Coordinate Systems is arguably the most pedagogically rigorous thing in the app — it verifies task completion from live physics state rather than trusting self-report, shows dual progress bars, and gives idle-triggered hints. The other four topics have only `GuidedChallenges`, a lighter 3-goal version of the same idea, and its progress is **not persisted** (lost on remount).

Two independent improvements here, either one worth doing on its own:
- Persist `GuidedChallenges` progress the same way Walkthroughs does.
- Author topic-specific walkthrough task lists (even 5–8 tasks each, not 20) for Projectile Motion, Motion Diagrams, Relative Motion, and Circular Motion, using the existing Walkthrough component/infra rather than building something new. This directly closes the biggest "rich topic vs. thin topic" gap in the app.

---

## Engagement mechanics worth adding

### 4. A cross-topic progress/mastery view
Every quiz keeps its own isolated `localStorage` score (`coordinate-kinematics-quiz-score`, `physics-motion-lab-projectile-motion-score`, etc.) with no aggregation anywhere. A student who works through all five topics has no way to see overall mastery, total points, or a "3 of 5 topics complete" summary. A simple dashboard (even a card on the landing/topic-switcher screen) that reads all five stored scores and Fun Zone/Walkthrough progress would turn five disconnected mini-apps into one coherent course with visible momentum — a well-established engagement lever (progress visualization) that the app currently has all the underlying data for but never surfaces.

### 5. Let quiz difficulty adapt to tracked skill history
The Coordinate Systems quiz already tracks per-skill scores (origin placement, axis orientation, velocity components, etc.) but always draws 10 random questions regardless of that history. Weighting question selection toward weaker skills (or offering a "focus on what I'm missing" mode) would make the practice loop feel responsive rather than just repetitive, using data the app is already collecting and currently throwing away.

### 6. Add lightweight celebratory feedback
Right now positive feedback across the app is text + icon color only (Fun Zone's "Difficulty increased to X%!" banner is the closest thing to a celebration moment). A small, tasteful animation or transient visual pulse on quiz streaks, walkthrough completion, or difficulty level-ups (no sound needed, respecting `prefers-reduced-motion`) would make milestones feel earned rather than just logged. Keep it subtle — this is an undergraduate physics tool, not a mobile game, so restraint matters more than spectacle.

### 7. Let students choose their own difficulty in Fun Zone
Difficulty currently only ramps automatically (up in 20% steps every 3 correct answers) with no manual override. A visible "Easy / Medium / Hard / Auto" selector would help both stronger students who want an immediate challenge and struggling students who want to dial back without having to "earn" a lower difficulty — small addition, meaningful control.

---

## Pedagogical effectiveness

### 8. Fix the naive short-answer quiz grading
`QuizMode.tsx` grades free-text answers by checking whether at least 3 of N expected keyword substrings appear anywhere in the normalized text. This is easy to game (typing disconnected keywords) and easy to fail through a valid paraphrase that happens to avoid the exact expected words — a plausible source of real student frustration and lost trust in the feedback loop, which matters a lot given the app's stated goal ("help students reason through the formulas," per `AGENTS.md`) rather than just testing recall. Consider either loosening this to accept more phrasings, converting these items to the existing component-builder / multiple-choice formats (which are graded exactly), or showing partial credit with which specific ideas were/weren't detected instead of a binary right/wrong.

### 9. Surface the Walkthroughs more prominently
The Walkthroughs panel is a collapsed section at the top of Explore mode within one topic, with no entry point from Fun Zone, Quiz, or the topic switcher. Given it's the most rigorous guided-learning feature in the app, consider promoting it — e.g., a "Start guided practice" call-to-action visible from the topic landing view, or prompting students who get several quiz questions wrong on a skill to try the relevant walkthrough task.

### 10. Build out the next topics already scoped in `Concepts.md`
`Concepts.md` already proposes (but the app doesn't yet implement) polar coordinates with rotating basis vectors and non-uniform circular motion (tangential vs. radial acceleration split) — both natural, already-planned extensions of the existing topic set, and a good way to keep returning students engaged with genuinely new material rather than re-doing the same five topics.

---

## Smaller polish items

- **Dead CSS**: `.placeholder-panel` in `globals.css` (lines ~212–226) isn't referenced by any component — leftover from an earlier stubbed-out mode. Safe to remove once the app is next touched.
- **Repo root clutter**: 28 numbered `changesN.txt` files plus `plan.md`, `review.md`, `tutorial.md`, `etask.md`, `explorer_tasks.md`, and stray `*.log` files sit at the project root. Not user-facing, but worth archiving or deleting in a housekeeping pass so the repo itself is easier to navigate for whoever works on these suggestions next.
- **Accessibility is a genuine strength, not a gap** — proper ARIA roles/labels, full keyboard navigation on both tab layers, live regions, and parallel plain-text renderings of KaTeX math are already in place. Worth explicitly preserving this bar as new features (color, animation, walkthroughs-for-all-topics) are added, rather than treating it as done and moving on.

---

## Suggested sequencing

If tackled in order of effort vs. impact:
1. Persist Fun Zone stats (#1) — small, isolated, high perceived-progress payoff.
2. Persist `GuidedChallenges` progress (part of #3) — same pattern, same win, different topics.
3. Extend Fun Zone's color palette to the rest of the app (#2) — visual, no new logic, makes everything else feel more finished.
4. Cross-topic progress dashboard (#4) — ties #1–#3 together into a visible "course," reads existing localStorage data.
5. Author Walkthrough task sets for the remaining four topics (#3) — largest content-authoring effort but closes the biggest feature gap.
6. Everything else (adaptive quiz weighting, difficulty selector, grading fix, celebratory feedback, new topics) as incremental follow-ups.
