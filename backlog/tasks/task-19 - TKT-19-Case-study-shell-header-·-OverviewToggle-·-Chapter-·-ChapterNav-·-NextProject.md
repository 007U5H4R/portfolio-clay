---
id: TASK-19
title: >-
  TKT-19: Case-study shell: header · OverviewToggle · Chapter · ChapterNav ·
  NextProject
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:5'
  - case-study
milestone: m-3
dependencies:
  - TASK-15
  - TASK-5
  - TASK-6
  - TASK-18
priority: high
type: feature
ordinal: 19000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`/work/[slug]` renders any `Project`: flat header 60/40 (name, one-line problem, role/duration/status chips, 2-3 inline `MetricCard`s with value + label + context + asOf + kind badge; right: hero media in `ClayFrame` = VT target `project-{slug}`, media = image, `DemoVideo`, or a labelled placeholder), `OverviewToggle` (30-sec default | Deep dive; 200ms crossfade + layout animation; hidden when `deepDive:false`), `Chapter` (flat h3 + `Prose` <=600px + artifacts 1/2/3-up within the text column), `ChapterNav` (sticky left rail >=1024 numbered 01-08 with active underline; sticky horizontal pill row <1024 - Deviation 4), chapters with empty bodies omitted (short honest page), `NextProject` band, per-slug OG image, `ProgressBar`.

**Objective.** One template that scales depth with evidence for all 11 case studies.
**Product requirement.** Solution-PRD §5 Case study; Design.md §3 Case study, §4 shared element row, Deviation 4; COMPONENT_ARCHITECTURE §1 `work/[slug]`, §4 ProjectCard->CaseStudyHeader; CONTENT_INVENTORY §3.
**Definition of Done.** Base DoD + Perf.
**Notes.** Anchor id scheme is load-bearing for TKT-13/TKT-09 links - fix it here and document in `docs/anchors.md`. Replaces TSK-06 stub; sub-tasks TSK-16..TSK-18.
**Related EVAL.** EVAL-002 (hop 3), EVAL-004, EVAL-006, EVAL-007, EVAL-008, EVAL-010, EVAL-015, EVAL-017.
**Target sequence.** Phase 4 · **Owner.** Claude.
Source: tickets.md § TKT-19.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All 11 slugs build statically; slugs with empty chapters render header + 30-sec overview + "Deep dive coming - this project is documented as {status}" note + NextProject, and pass axe.
- [ ] #2 Header metrics render only from `Project.metrics` with all five fields; kind badge text measured / structural / self-reported; asOf shown as "as of {date}".
- [ ] #3 Shared-element transition from any `ProjectCard` lands on the header media; icon `icon-{slug}` also transitions; fallback plain navigation verified with VT disabled.
- [ ] #4 `OverviewToggle` keyboard operable (`role="radiogroup"`), crossfade per spec, reduced motion instant; default 30-sec.
- [ ] #5 `ChapterNav` highlights the chapter in view (IO), anchors `#01-context` ... `#08-what-i-learned` match the ids used by How I Think and Ask evidence links (`#02-problem`, `#03-discovery`, `#04-product-bet`, `#05-what-i-built`, `#06-evaluation`, `#07-outcome`); prose measure <=600px at 768-1023 with the pill nav.
- [ ] #6 `NextProject` cycles through personal projects in `/work` order; thumbnail hover 200ms.
- [ ] #7 Lighthouse `/work/teachspark` >= 90/95/95/95 (with TeachSpark still at card fidelity - re-checked in TKT-28).
<!-- AC:END -->
