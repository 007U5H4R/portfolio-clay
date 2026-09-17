# Implementer brief — TKT-19 · Case-study page template (M-004, last ticket)

Fresh implementer. Execute **TKT-19** (per §B M-004 TKT-19 + tickets.md TKT-19 ACs). Model tier: most-capable (the full case-study assembly + anchors + VT). Branch `m-004-work`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-004 → **TKT-19** + `tickets.md` TKT-19 ACs + `Design.md` §3 CaseStudy (60/40 header, OverviewToggle 30-second vs deep-dive, Chapter + ChapterNav, NextProject) + **E-3** (chapter ids are schema values; anchors `04-product-bet` etc. live in `lib/anchors.ts` — reuse `CHAPTER_ANCHORS`). Reuse: `CaseStudyHeader` (TKT-06 shell — extend), `DemoVideo` (TKT-18), artifact renderers + inline MetricCard (TKT-20), `ShowTheThinking` (TKT-21), `data/projects.ts` (14 records), `lib/anchors.ts`.

## Scope
- `app/work/[slug]/page.tsx` — the FULL case-study template: `CaseStudyHeader` → `OverviewToggle` (30-second summary ↔ deep-dive) → `Chapter`s (rendered from the project's chapter data via `CHAPTER_ANCHORS` anchors) → inline `MetricCard`/artifacts where the data has them → `DemoVideo` (no-video state until M-005) → `ShowTheThinking` where a thinking chain exists → `NextProject`. + `components/case-study/{OverviewToggle,Chapter,ChapterNav,NextProject}.tsx` and extend `CaseStudyHeader`. + `docs/anchors.md` (finalize the anchor map). `tests/e2e/case-study.spec.ts`.
- **Graceful thin-content:** chapters/metrics/thinking are largely EMPTY in the data today (real content = M-005 TKT-28–33). The template must render meaningfully with thin data — show the header + overview + a labelled "Full case study coming" for empty chapters, NEVER broken/empty sections. Every chapter with content gets its anchor; ChapterNav lists only chapters that exist.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes; no fabrication (render only sourced data; empty→labelled placeholder). All 3 personal-featured + the other personal slugs render (generateStaticParams). Static routes (TP1). VT/anchor behaviour per A5/E-3; reduced-motion + keyboard + ≥44 + axe clean. EVAL-002 hop 3 (case study is reachable + the recruiter path completes), EVAL-015 (VT fallback + JS-off content present). Every step gated; if a Design/E-3 contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m004): TKT-19 case-study page template + chapters + nav` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (all case routes static); `pnpm test:e2e --grep 'case-study'` green; `pnpm eval --only EVAL-002,EVAL-004,EVAL-006,EVAL-007,EVAL-008,EVAL-010,EVAL-015,EVAL-017` no regression. Write `docs/reports/TKT-19.md`. Final 5-line summary: steps, gates (all case routes static + anchors + VT/JS-off + EVAL-002 hop 3), thin-content graceful handling, blockers, deviations, commit SHA.
