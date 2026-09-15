---
id: TASK-41
title: 'TKT-45: /contact - ContactCard + CopyButton'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P1
  - 'sp:2'
  - contact
milestone: m-5
dependencies:
  - TASK-4
  - TASK-5
  - TASK-6
priority: high
type: feature
ordinal: 41000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Single centred hero-tier lavender `ClayCard` (max 640px): "Still curious?" -> `CopyButton` (email; idle -> copied 2 s -> error fallback with selectable text) -> mailto `ClayButton` -> LinkedIn `ClayButton` (external) -> resume action (reads `lib/site.ts`; the `#resume` anchor is the target of every placeholder link, with the "email me for a copy" note); 2x2 grid >=768 / stacked <768; "Bengaluru, India" city line; contact OG. No form (S10).

**Product requirement.** Solution-PRD §4 S10, §5 cross-links; Design.md §3 Contact; CONTENT_INVENTORY §7.
**Definition of Done.** Base DoD + Sec (no PII beyond email/city).
**Dependencies.** TKT-04, TKT-05, TKT-06 (TKT-08 is soft - the resume control renders the PB5 placeholder until the sanitised PDF lands).
**Related EVAL.** EVAL-002 (final hop), EVAL-007, EVAL-011, EVAL-013. **Blockers.** none.
**Target sequence.** Phase 6 · **Owner.** Claude.
Source: tickets.md § TKT-45.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Email/LinkedIn/city verbatim from §7; no phone.
- [ ] #2 All four controls >=44x44 with 12px gaps.
- [ ] #3 `CopyButton` states tested incl. clipboard denied.
- [ ] #4 `#resume` anchor exists; resume control renders placeholder while `resumeAvailable` is `false` and a 200 download once TKT-08 flips it (Playwright covers both).
- [ ] #5 axe clean; crawler passes.
<!-- AC:END -->
