---
id: TASK-73
title: >-
  TKT-78: OG images re-skinned in the paper style (D11) — lib/og.tsx, static
  Fraunces/Inter/Caveat TTFs, hero poster PNG, EVAL-017 re-run
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P1
  - 'sp:3'
  - m-009
  - phase-a
milestone: m-8
dependencies:
  - TASK-64
  - TASK-68
priority: high
type: feature
ordinal: 109000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Change only the template skin in lib/og.tsx per Design.md §9 (paper canvas, torn strip, tape scrap, Fraunces title, Inter eyebrow/subtitle, Caveat caption, hero poster PNG on home + case-study families). Static OFL TTFs in assets/fonts/, Manrope TTFs deleted; hex palette copies allow-listed here only. Runs across the Phase-0 gate. Spec: tickets.md TKT-78.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All seven opengraph-image families build, 1200×630 PNG ≤300 kB (test)
- [ ] #2 Tag test green (absolute HTTPS og:url/og:image, twitter:card, og:image:alt)
- [ ] #3 Snapshot of each family committed to docs/og/m-009/
- [ ] #4 No Manrope file or reference remains
- [ ] #5 pnpm eval --only EVAL-017 automated part green
- [ ] #6 No OG route reads the avatar poster (unblocks TKT-89)
<!-- AC:END -->
