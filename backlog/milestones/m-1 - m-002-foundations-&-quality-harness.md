---
id: m-1
title: "M-002 Foundations & quality harness"
---

## Description

Objective. Make the truth rules and quality budgets mechanical before any page is built: content schema that fails the build on an unsourced claim, the complete clay primitive system (tiers = the anti-toy guardrail, D1), layout/reveal/motion infrastructure, SEO/OG generation, and the single pnpm eval command every later ticket regresses against.

Tickets. TKT-03 (schema + content-integrity gate), TKT-04 (clay primitives), TKT-05 (layout/section/reveal/motion/footer), TKT-06 (SEO/OG/sitemap/robots), TKT-07 (test & eval harness, 5 tasks), TKT-08 (sanitised resume + PII gate - Tushar). 6 tickets, 25 sp, P0, Phase 2.

Entry (PB1). Non-visual tickets (TKT-03, TKT-07, TKT-08) enter on TKT-01 merge; visual tickets (TKT-04/05/06) enter on TKT-02 approval.

Exit. pnpm eval runs end-to-end and writes eval-run-*.json; failing fixture demonstrably fails pnpm build; every clay primitive has a screenshot check; no primitive exposes clay tokens to a flat-tier consumer.

Full record: milestones.md § M-002.
