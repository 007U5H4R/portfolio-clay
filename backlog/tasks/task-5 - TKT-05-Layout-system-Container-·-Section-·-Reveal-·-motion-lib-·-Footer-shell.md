---
id: TASK-5
title: >-
  TKT-05: Layout system: Container · Section · Reveal · motion lib · Footer
  shell
status: To Do
assignee: []
created_date: '2026-09-15 13:22'
labels:
  - P1
  - 'sp:3'
  - layout
milestone: m-1
dependencies:
  - TASK-4
priority: high
type: feature
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`Container` (1200/1320 max, gutters 24/40/64), `Section` (rhythm 72/96/128, optional accent tone - max one per section), `SectionHeading`, `Reveal` (IntersectionObserver once, 500ms `cubic-bezier(.2,.7,.2,1)`, 70ms stagger, opacity-only under reduced motion), `lib/motion.ts` shared variants + `useReducedMotion`, `ProgressBar`, and the two-tier `Footer` (Design.md §3) with actions wired to `/contact`, LinkedIn, and the resume action (reads `lib/site.ts` - placeholder state until TKT-08, PB5).

**Objective.** Page composition infrastructure so every page ticket only writes sections.
**Product requirement.** Design.md §2 spacing/container tokens, §3 Footer, §4 section reveal row; COMPONENT_ARCHITECTURE §1 layout/, §4 Reveal; CONTENT_INVENTORY §1.6.
**Definition of Done.** Base DoD.
**Notes.** `Footer` is a server component; `Reveal`/`ProgressBar` client leaves.
**Related EVAL.** EVAL-008, EVAL-010, EVAL-011.
**Target sequence.** Phase 2 · **Owner.** Claude.
Source: tickets.md § TKT-05.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Container/Section measured at 390/768/1024/1440 match Design.md values (Playwright computed-style assertions).
- [ ] #2 `Reveal` fires once; under `prefers-reduced-motion: reduce` no transform is animated (EVAL-010 assertion).
- [ ] #3 Footer: tier 1 headline "Still curious? Let's build what's next." + Download Resume · LinkedIn (`https://www.linkedin.com/in/pathaktushar`) · Let's Talk (`/contact`); tier 2 name + title, nav links Work · Thinking · About · Contact, "Built with Claude Code" credit, 40px bottom + safe-area inset; all links resolve.
- [ ] #4 Footer copy sourced: email/LinkedIn from CONTENT_INVENTORY §1.6; GitHub link shown only to the profile (`https://github.com/007U5H4R`) - repo links remain data-gated (S5).
- [ ] #5 `pnpm eval` regressed.
<!-- AC:END -->
