---
id: TASK-1.6
title: 'TSK-06: One ProjectCard + ViewTransitionLink + stub /work/teachspark'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:1'
milestone: m-0
dependencies:
  - TASK-1.3
parent_task_id: TASK-1
priority: high
type: task
ordinal: 55000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Implementation notes.** React 19.2 `<ViewTransition>`; `ViewTransitionLink` falls back to `next/link` when `document.startViewTransition` is absent. Card data: TeachSpark row from CONTENT_INVENTORY §1.4 (name, proposition, tags AI · WhatsApp · EdTech, status "Live pilot").
**Files.** `components/projects/ProjectCard.tsx`, `components/interactions/ViewTransitionLink.tsx`, `components/case-study/CaseStudyHeader.tsx` (shell), `app/work/page.tsx` (stub), `app/work/[slug]/page.tsx` (stub, single param).
**Related EVAL.** EVAL-011, EVAL-015. Source: tickets.md § TSK-06.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-01 AC 6 in full; transition 450ms `cubic-bezier(.77,0,.175,1)`; reduced motion -> plain navigation.
- [ ] #2 `/work` placeholder route renders "Work - coming in this build" (so the hero CTA is never dead).
<!-- AC:END -->
