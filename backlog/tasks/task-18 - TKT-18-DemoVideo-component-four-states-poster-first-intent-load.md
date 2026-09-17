---
id: TASK-18
title: 'TKT-18: DemoVideo component - four states, poster-first, intent load'
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 03:37'
labels:
  - P1
  - 'sp:3'
  - media
milestone: m-3
dependencies:
  - TASK-4
priority: high
type: feature
ordinal: 18000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Poster (`next/image`) + centred 56x56 play `ClayButton`; states `no-video` ("Demo coming" badge over poster/placeholder, never a broken player), `loading` (spinner overlay), `playing` (native controls, muted, `preload="none"`, `<video>` mounted only on intent - click, or 50% in view on desktop pointer devices), `error` (overlay "View live ->" to the project's live URL, or "Demo coming" when no live URL). Duration caption from data.

**Objective.** Demo videos never cost Lighthouse points and never break honestly-missing cases (S6).
**Product requirement.** Solution-PRD §4 S6, §9 video-weight risk; Design.md §3 DemoVideo, §4 poster->play row; COMPONENT_ARCHITECTURE §4; DESIGN_DIRECTION §9 budgets; evaluation-plan EVAL-014.
**Definition of Done.** Base DoD + Perf (Lighthouse on `/work` unaffected by the component: >= 90 mobile).
**Notes.** Videos live at `public/video/<slug>.mp4` (H.264, <=4 MB) + `public/video/<slug>-poster.webp` (media tickets TKT-22..27 fill them). Consumed by ProjectCard grid mode, CaseStudyHeader, PrototypeFrame.
**Related EVAL.** EVAL-004, EVAL-005, EVAL-011, EVAL-014, EVAL-015.
**Target sequence.** Phase 4 (parallel with TKT-16) · **Owner.** Claude.
Source: tickets.md § TKT-18.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All four states rendered and screenshot-tested with fixtures (missing src, slow network via Playwright route throttling, 404 src, valid src).
- [ ] #2 No `<video>` element in the DOM before intent; after intent `preload="none"`, `muted`, `playsInline`, `controls`.
- [ ] #3 Play button >=44x44, labelled "Play demo: {project}"; keyboard operable; reduced motion unaffected (opacity/scale of the icon only).
- [ ] #4 Poster is the LCP candidate when the component is above the fold; WebP posters <=120 kB.
- [ ] #5 Error overlay link resolves (crawler) and is announced.
- [ ] #6 `pnpm eval --only EVAL-014` green.
<!-- AC:END -->
