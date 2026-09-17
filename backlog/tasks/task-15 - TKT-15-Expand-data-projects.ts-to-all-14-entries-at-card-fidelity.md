---
id: TASK-15
title: 'TKT-15: Expand data/projects.ts to all 14 entries at card fidelity'
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 02:12'
labels:
  - P1
  - 'sp:3'
  - data
milestone: m-3
dependencies:
  - TASK-3
  - TASK-12
priority: high
type: task
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add the remaining 8 personal builds (cubicle, nuptis, bhakti-vilas, token-toli, pratyasa, tegaki, dino-arcade, cinematic-portfolio) and the 3 professional entries (mars-ar-modernization, cloud-modernization-programs, godrej-smartnet) at card fidelity: slug, name, tagline, category, tags <=3, filters, status, gridSize, role, dates, links (live, repoPublic false except cinematic + dino-arcade, github field populated but gated - S5), sources. Chapters/thinking/metrics stay empty arrays flagged `deepDive:false` until their content ticket.

**Objective.** `/work` and every `/work/[slug]` route can render from data with no invented content.
**Product requirement.** Solution-PRD §4 S3/S5, §5 Work; SITEMAP.md slugs + filter mapping; CONTENT_INVENTORY §2.2, §2.3; COMPONENT_ARCHITECTURE §2.
**Definition of Done.** Base DoD + Truth.
**Notes.** Corporate items must never imply a public product (Solution-PRD §5). Expand step of expand -> migrate -> contract (chapters land per slug in M-005).
**Related EVAL.** EVAL-013. **Blockers.** Tushar - FilterTabs bucket decision (default applied, non-blocking).
**Target sequence.** Phase 4 · **Owner.** Claude.
Source: tickets.md § TKT-15.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 14 records pass the schema gate; every field's value traces to the cited CONTENT_INVENTORY row (propositions verbatim, tags as listed, statuses as listed incl. Cubicle "Built, not launched", Nuptis/Velora "Live (mock data)", Bhakti-Vilas "Live prototype (mock data, team build)", Pratyasa/Tegaki/dino/cinematic as listed).
- [ ] #2 Filters per SITEMAP.md mapping; Token Toli / Pratyasa / Bhakti-Vilas under `experiments` by default (open decision - `decisions.md` EXE-n once Tushar answers).
- [ ] #3 `gridSize`: teachspark large; railcite, velora medium; rest small (featured order drives large/medium).
- [ ] #4 Professional entries: `category:'professional'`, no `links.live`, no `demoVideo`, `tags` per §2.3 ("Platform" not "IoT"), sources = `RESUME`.
- [ ] #5 `repoPublic:true` only for cinematic-portfolio and dino-arcade-pwa; Bhakti-Vilas/Pratyasa/Tegaki repos marked unverified -> false.
- [ ] #6 `generateStaticParams` yields 11 slugs; build green.
<!-- AC:END -->
