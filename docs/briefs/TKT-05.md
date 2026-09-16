# Implementer brief — TKT-05 · Layout system + Reveal + motion lib + Footer (M-002)

Fresh implementer. Execute **TKT-05 only** (steps S05.01–S05.06). Model tier: standard. Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch `m-002-foundations`. Standard guardrails (E-Drive only; don't touch main/backlog/docs ledger+briefs/sibling portfolio; explicit-path staging, never `git add -A`). The tracer built a minimal `Container` + `lib/motion.ts` (TSK-04) — extend, don't duplicate.

## Read first
- `technical-plan.md` §B M-002 → **TKT-05 steps S05.01–S05.06** (lines ~568–573) — authoritative.
- `technical-plan.md` §A6 (motion), §A1 (client boundaries). `Design.md` §3 Footer + layout, §2 tokens. `CONTENT_INVENTORY.md` §1.6 (footer copy).

## ⚠️ CRITICAL CORRECTION (change-management — the plan §B S05.04 text is STALE)
The plan's S05.04 says the footer tier-2 credit is "Built with Claude Code". **That is wrong** — it predates decisions **TP10 / E-1**. The authoritative rule:
- **Footer credit line = exactly `Built with curiosity.`** (brief §39; TP10; E-1).
- The authorship line "Designed and built with Claude Code" is a **colophon on `/about`**, added later in **M-006 (TKT-40/42)** — NOT in the footer, NOT in this ticket.
Implement the footer with `Built with curiosity.` If any test fixture (test-cases.md) still asserts "Built with Claude Code" in the footer, that fixture is stale per E-1 — note it in your report; assert `Built with curiosity.` instead.

## Steps (each has a hard Gate)
- **S05.01** `Container` (final) + `Section.tsx` (`py` section-gap tokens, optional `tone` = one accent per section, `id`, `aria-labelledby`) + `SectionHeading.tsx` (eyebrow + h2 + optional lead, `max-w-[44ch]`). Gate: Playwright computed paddings @390/768/1440 = 72/96/128; container max-width 1200@1024 / 1320@1440 (EXE-4 2xl=1440); gutters 24/40/64.
- **S05.02** `Reveal.tsx` (`"use client"`; IO threshold 0.2 once; `.reveal` CSS in globals.css using `--ease-reveal` (already defined, EXE-3), `--stagger` ×70ms; reduced-motion → opacity-only 1ms; **static HTML fully visible** — class added only after mount, so JS-off content shows, EVAL-015). Gate: Playwright — element visible in static HTML with JS blocked; reduced-motion transform never changes.
- **S05.03** `lib/motion.ts` add `fadeUp`/`staggerChildren` variants + `LazyMotionRoot`; `ProgressBar.tsx` (reading progress, scaleX, `role="progressbar"`, `aria-valuenow` ≤4×/s, kept under reduced motion). Gate: TYPECHECK; jsdom ProgressBar exposes aria-valuenow.
- **S05.04** `Footer.tsx` (server; tier 1 headline "Still curious? Let's build what's next." + actions: resume (`resumeAction()`), LinkedIn (ExternalLink), "Let's Talk"→/contact; tier 2 caption: name + title, nav Work·Thinking·About·Contact, GitHub profile, prior-site link, **`Built with curiosity.`** credit [see CRITICAL CORRECTION above], `pb-[calc(40px+env(safe-area-inset-bottom))]`) + mount in `app/layout.tsx`. Gate: Playwright — all footer links resolve (internal HEAD 200; external allowlisted); text **"Built with curiosity."** present; text "Built with Claude Code" ABSENT from the footer.
- **S05.05** `tests/e2e/layout.spec.ts` (S05.01/02 assertions, 4 widths). Gate: green.
- **S05.06** Regression + wrap: `pnpm eval --only EVAL-008,EVAL-010,EVAL-011` no regression vs baseline-v1.

## Rules
- Everything on E Drive; keep `--color-` DEFINITIONS at 13 (`pnpm tokens:check`). Do NOT install Chromium. Follow the plan; no components beyond the S05 list.
- Commit: `feat(m002): TKT-05 layout system, Reveal, ProgressBar, Footer` + Co-Authored-By trailer. Explicit paths only.
- If a gate needs a token/Design.md change, STOP and report the breaker.

## Finish
`pnpm typecheck && lint && test && build` green; layout e2e green. Write `docs/reports/TKT-05.md` (per-step gates, the footer-credit correction applied + any stale test fixture noted, `git diff --stat`). Final 5-line summary: steps, gates, footer credit confirmed = "Built with curiosity.", blockers, deviations, SHA.
