---
id: TASK-39
title: 'TKT-43: /thinking list + /thinking/[slug] essay route with DRAFT entries'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-22 06:59'
labels:
  - P2
  - 'sp:3'
  - thinking
milestone: m-5
dependencies:
  - TASK-3
  - TASK-5
  - TASK-6
priority: medium
type: feature
ordinal: 39000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`data/writing.ts` with the 5 candidate essays (title, dek, backing passage quoted with source, related project, `draft:true`, reading time); `ThinkingHero` (h1 only), `ThinkingList` (numbered rows, large type, hover per Design.md), `EssayBody` (`Prose`, title, "Draft - pending sign-off" `Tag` instead of a date, body = the sourced passage(s) + a one-paragraph DRAFT framing, related-project `ExternalLink` card); empty-state copy "Essays in progress - five drafts, none published yet." when zero non-draft essays exist (rendered above the list, list still shows drafts); thinking OG.

**Objective.** The editorial voice exists honestly - drafts labelled, never faked (Solution-PRD §5 Thinking).
**Product requirement.** Solution-PRD §5 Thinking; Design.md §3 Thinking; SITEMAP.md `/thinking`, `/thinking/[slug]`; CONTENT_INVENTORY §5.
**Definition of Done.** Base DoD + Truth.
**Related EVAL.** EVAL-006, EVAL-011, EVAL-013, EVAL-017. **Blockers.** Tushar - title sign-off (non-blocking).
**Target sequence.** Phase 6 · **Owner.** Claude.
Source: tickets.md § TKT-43.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 5 entries verbatim from §5 with sources.
- [ ] #2 DRAFT tag visible on list rows and essay pages; no publish dates.
- [ ] #3 Essay body contains only quoted passages + clearly-marked framing, <=600px measure.
- [ ] #4 Essay slugs in sitemap.
- [ ] #5 axe clean; crawler passes; `pnpm eval` regressed.
<!-- AC:END -->
