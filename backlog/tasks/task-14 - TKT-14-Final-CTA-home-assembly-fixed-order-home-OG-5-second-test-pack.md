---
id: TASK-14
title: 'TKT-14: Final CTA + home assembly (fixed order) + home OG + 5-second test pack'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-16 13:50'
labels:
  - P0
  - 'sp:3'
  - home
milestone: m-2
dependencies:
  - TASK-6
  - TASK-10
  - TASK-11
  - TASK-12
  - TASK-13
priority: high
type: feature
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`FinalCTA` section ("Building something AI-native? Let's talk." + email `CopyButton` + Let's Talk -> `/contact` + Download Resume), assemble `app/page.tsx` in the fixed order Header · Hero · Ask · Featured Work · How I Think · Final CTA · Footer (mobile order per Design.md §3), home OG image via TKT-06 template, `Reveal` on sections, then produce the EVAL-001 review pack (screenshots at 390 & 1440, six-item checklist scored by Claude, presented to Tushar) and the EVAL-005 budget check.

**Objective.** Home passes the 5-second test and the performance budget with every section live.
**Product requirement.** Solution-PRD §5 Home, §8 criteria 1 and 4; Design.md §3 Footer/Contact actions reuse; CONTENT_INVENTORY §1.6; evaluation-plan EVAL-001, EVAL-005.
**Definition of Done.** Base DoD + Perf + EVAL-001 pack reviewed by Tushar.
**Notes.** If JS budget fails, the first lever is lazy-loading `AskPanel` and `motion` features, not removing sections. Closes M-003.
**Related EVAL.** EVAL-001, EVAL-004, EVAL-005, EVAL-006, EVAL-008, EVAL-011. **Blockers.** Tushar - EVAL-001 confirmation (can be batched with the next checkpoint).
**Target sequence.** Phase 3 (last) · **Owner.** Claude.
Source: tickets.md § TKT-14.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Section order exact at all widths; section gaps 72/96/128; <=1 accent colour visible per section (screenshot review).
- [ ] #2 `FinalCTA` copy from CONTENT_INVENTORY §1.6; `CopyButton` copies `Tushar_Pathak@outlook.com` with "Copied" toast and a visible-text fallback when the clipboard API is blocked.
- [ ] #3 EVAL-001: 6/6 at 390 and 1440 scored by Claude, screenshots saved to `docs/screenshots/home/`, presented to Tushar for confirmation.
- [ ] #4 EVAL-005 on `/`: first-load JS <= 180 kB gz, LCP <= 2.5 s, CLS < 0.05 (Lighthouse mobile); Lighthouse >= 90/95/95/95 mobile + desktop.
- [ ] #5 Full `pnpm eval` green; no Critical regression vs baseline.
<!-- AC:END -->
