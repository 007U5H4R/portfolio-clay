---
id: TASK-68
title: >-
  TKT-73: Hero — illustration manifest + provenance + assets, hero section +
  HeroClip (D10), EVAL-019/021 tests, hero motion system removed
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:8'
  - m-009
  - phase-0
milestone: m-8
dependencies:
  - TASK-64
  - TASK-65
priority: high
type: feature
ordinal: 104000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
(a) Copy the shipped renditions into content/media/illustrations/ + public/media/illustrations/, author manifest.ts (nine ids, exact Design.md §6.3 alts) + README.md provenance, tests/unit/eval-021.test.ts. (b) Rebuild the / hero per Design.md §5: copy column from data/hero.ts, next/image poster (priority) + figcaption annotation, HeroClip client component implementing §5.3 exactly, tests/e2e/eval-019.spec.ts (4 modes × 2 widths, ended ≤4 s, currentTime monotonic, asset caps); EVAL-019 leaves DEFERRED_SPECS. (c) Delete AvatarScene/AvatarStage/FloatingTiles/HeroActivationContext/Parallax/usePointerParallax/heroMotion/ProductScene + tests + site.avatarAlt. Spec: tickets.md TKT-73.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 illustration(id) is the only source of src/alt; nine ids per §6.1; README row per id; eval-021 green both ways and fails on a one-sided fixture
- [ ] #2 Static HTML of / has the poster <img> (fetchpriority=high, eager, 1280×684, §6.3 alt) and no <video>; default mode mounts <video autoplay muted playsinline preload=metadata poster> webm→mp4, no loop/controls; reduced-motion/touch/saveData never mount a <video> (4/4 × 2 widths)
- [ ] #3 Default mode: ended ≤4000 ms; currentTime never decreases over 3 s incl. scroll + visibilitychange; last frame stays painted
- [ ] #4 Asset caps from disk: webm ≤200 kB, mp4 ≤350 kB, poster ≤120 kB
- [ ] #5 Hero EVAL-018 count = 3; no FloatingTiles; 5-second-test elements in the first viewport at 390 & 1440
- [ ] #6 Hero motion files deleted; typecheck/lint/test green; bundle-budget --json on / recorded
- [ ] #7 pnpm eval --only EVAL-019,EVAL-021 executes both with real values
<!-- AC:END -->
