---
id: TASK-6
title: 'TKT-06: SEO: metadata builders · OG image generator · sitemap · robots'
status: To Do
assignee: []
created_date: '2026-09-15 13:22'
labels:
  - P1
  - 'sp:3'
  - seo
milestone: m-1
dependencies:
  - TASK-2
priority: high
type: feature
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`lib/seo.ts` (title/description/canonical/OG/Twitter builders with absolute HTTPS base URL from env `NEXT_PUBLIC_SITE_URL`), `app/opengraph-image.tsx` + a reusable `ImageResponse` template for the seven page families (home, work, case study dynamic, about, thinking, playground, contact) using the clay palette + Manrope + avatar poster, `app/sitemap.ts`, `app/robots.ts`, and a tag-level test.

**Objective.** Link previews render correctly everywhere the site is shared (Solution-PRD §8 criterion 9; global CLAUDE.md link-preview rule).
**Product requirement.** Solution-PRD §5 cross-cutting; SITEMAP.md "SEO / sharing"; COMPONENT_ARCHITECTURE §1 `opengraph-image.tsx`; evaluation-plan EVAL-017.
**Definition of Done.** Base DoD.
**Notes.** Human inspector validation (LinkedIn Post Inspector, opengraph.xyz) is TKT-51 - needs a public URL. Consumed by every page ticket.
**Related EVAL.** EVAL-017 (tag part), EVAL-004 (SEO score).
**Target sequence.** Phase 2 · **Owner.** Claude.
Source: tickets.md § TKT-06.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every route emits `<title>`, description, canonical, `og:title/description/image/url/type`, `twitter:card=summary_large_image`, `twitter:image` - all URLs absolute HTTPS.
- [ ] #2 OG images are 1200x630 PNG, generated at build for static families and per-slug for `/work/[slug]` (name + one-liner + status), <=300 kB each, text contrast >=4.5:1.
- [ ] #3 `/sitemap.xml` lists every static route + 11 case studies + essays; `/robots.txt` allows all, points to the sitemap; `/dev/*` excluded.
- [ ] #4 Vitest tag test over rendered HTML for all page families (runs in `pnpm eval` as EVAL-017 automated part).
- [ ] #5 Base URL falls back to the Vercel preview URL when env is unset (so previews validate).
<!-- AC:END -->
