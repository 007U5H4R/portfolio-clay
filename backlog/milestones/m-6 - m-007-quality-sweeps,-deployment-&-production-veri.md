---
id: m-6
title: "M-007 Quality sweeps, deployment & production verification"
---

## Description

Objective. Prove the whole site against the release gates (evaluation-plan §6) on a real deployment, hand a complete evidence pack to Stages 8-10, then ship to the new domain and verify production.

Tickets. TKT-47 (responsive sweep), TKT-48 (accessibility sweep), TKT-49 (performance pass), TKT-50 (Vercel project + preview deploy + headers), TKT-51 (link-preview validation), TKT-52 (hand-off to review: full eval run), TKT-53 (production deployment + verification). 7 tickets, 18 sp, P0, Phase 7.

Dependencies. M-003..M-006 exits; TKT-22/23/24 hard-block TKT-50 (PB4); TKT-08 hard-blocks TKT-53 only (PB5); Stage 8-10 approval + QA-report.md gate before TKT-53.

Exit. Every Critical EVAL passes and no High unaddressed; production URL 200 on every route + /resume.pdf + /sitemap.xml; OG previews render on LinkedIn Post Inspector + opengraph.xyz; Vercel Analytics receiving; rollback path documented.

Full record: milestones.md § M-007.
