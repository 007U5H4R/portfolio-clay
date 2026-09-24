---
id: TASK-66
title: >-
  TKT-71: Header (no compaction, D12) + MobileMenu paper sheet + nav (D8
  variant) + reading progress + AskAIButton ghost
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:3'
  - m-009
  - phase-0
milestone: m-8
dependencies:
  - TASK-64
  - TASK-65
priority: high
type: feature
ordinal: 102000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Restyle Header per Design.md §4.1: one-height sticky bar, monogram + wordmark + Caveat subline annotation (removed <640), Fraunces nav with ink-stroke underline (≥1024), 'Let's connect →' pill, 44 px menu button opening the native <dialog> MobileMenu as a paper sheet, AskAIButton ghost (S21), reading-progress bar on case studies. Delete useScrollY hysteresis / NavPill / compaction with their tests. lib/nav.ts ships 5 items (D8 default, one-line revert). Spec: tickets.md TKT-71.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Header height constant across scroll at 4 widths; data-scrolled toggles the border only
- [ ] #2 Nav hidden <1024; sheet keyboard path Tab→menu→Enter→focus inside→Esc returns focus (EVAL-007 script updated)
- [ ] #3 aria-current underline; every control ≥44×44
- [ ] #4 Subline annotation absent from DOM <640, aria-hidden ≥640; header EVAL-018 count = 1
- [ ] #5 lib/nav.ts = 5 items (D8); routes test + crawler allow-list agree; revert path documented
- [ ] #6 Reading progress only on /work/[slug], aria-hidden, transform: scaleX
- [ ] #7 useScrollY/hysteresis + NavPill removed with their unit tests; layout.spec.ts updated
- [ ] #8 axe 0 critical/serious on / at 390 & 1440
<!-- AC:END -->
