---
id: TASK-36
title: 'TKT-40: About part 1: data · AboutHero · ProductJourney · clusters · Impact'
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-22 04:34'
labels:
  - P1
  - 'sp:5'
  - about
milestone: m-5
dependencies:
  - TASK-3
  - TASK-4
  - TASK-5
  - TASK-6
  - TASK-20
priority: high
type: feature
ordinal: 36000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Author `data/experience.ts` (4 roles: context · responsibility · scale · what changed · outcomes, resume-sourced; scale MISSING where the pack says so) and `data/skills.ts` (4 clusters); build `AboutHero` (flat hero variant: headline "Senior Product Manager. Product Thinker · AI Builder · Problem Solver.", bio paragraph per §4.1 with "AI Product Manager" omitted, avatar), `ProductJourney` (4 stages with the connector-line pattern, reveal-only, plus the 2019-2022 note pending Tushar's framing), 4 `ClayTile` clusters (2x2 / 4x1), `Impact` using `MetricCard` shape - every number with context + "self-reported" where resume-only.

**Objective.** The person and the level, evidence-labelled.
**Product requirement.** Solution-PRD §5 About; Design.md §3 Timeline section, §3 ProductJourney; SITEMAP.md `/about`; CONTENT_INVENTORY §4.1-4.4, §10 decisions.
**Definition of Done.** Base DoD + Truth.
**Notes.** Sub-tasks TSK-22..TSK-24; continued by TKT-41, TKT-42.
**Related EVAL.** EVAL-002 (hop 4), EVAL-004, EVAL-006, EVAL-008, EVAL-013. **Blockers.** Tushar - IntraEdge wording, gap framing, years wording (defaults applied).
**Target sequence.** Phase 6 · **Owner.** Claude.
Source: tickets.md § TKT-40.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Data passes schema; every string traces to §4.1-4.4; "SAFe" appears only as a methodology, never a certification; no DOB/phone/address.
- [ ] #2 Impact rows exactly as §4.4 with labels: AmEx/Godrej/Devin metrics `kind:self-reported`; TeachSpark `measured` (self-reported time saved noted); RailCite corpus `measured` asOf 2026-09-15; "0 invented citations" `structural`.
- [ ] #3 ProductJourney stage copy per §4.2; the gap note renders only after Tushar confirms framing (else omitted).
- [ ] #4 "via IntraEdge" rendered per Tushar's decision (default: "American Express (via IntraEdge)" as the resume states).
- [ ] #5 Years wording "7+ years" (resume) unless Tushar overrides.
- [ ] #6 axe clean; no overflow; `pnpm eval` regressed; Lighthouse `/about` >= 90/95/95/95 (re-checked after TKT-42).
<!-- AC:END -->
