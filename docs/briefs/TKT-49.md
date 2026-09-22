# Brief — TKT-49 · Performance pass (perf/bundle) · TASK-45

**You are a fresh implementer subagent. This brief is self-contained — you have no prior chat context.** Work only within this ticket's scope; no unrelated refactors, renames, or cleanup (every changed line must trace to TKT-49). Read the cited files yourself.

## Repo / environment
- Root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` — **everything stays on E Drive** (repo, node_modules, pnpm store, Playwright browsers, Next cache, scratch). Never write build/cache/temp to the Mac internal disk.
- Branch: you are on `m-007-quality` (already checked out). Commit here; do NOT touch `main`.
- Toolchain: node v26.7.0, pnpm 11.25.0. Stack: Next.js 16.3.5 (App Router, static generation), React 19, TS, Tailwind 4, `motion` 13, lucide, pnpm.
- **Host is memory-tight (~100 MB free, load ~2.5).** Run builds/tests **foreground**. Do NOT start a background Monitor to wait on a long process (it has deadlocked on OOM twice). `next build` + `pnpm exec tsx scripts/bundle-budget.ts` are the low-memory tools you need most — use those, not LHCI (see constraint below). If you run Playwright e2e, `workers:1`.

## Objective
Reduce `/` first-load JS toward the **≤180 kB gz** budget, and apply LCP/CLS/font/image code levers — **without weakening any threshold** and **without degrading the approved interactive design**.

## Current baseline (verified 2026-09-22, this branch)
- `pnpm exec tsx scripts/bundle-budget.ts` → **`first-load JS (/) = 244.4 kB gz (budget 180) — 12 chunks, 773.9 kB raw`**. Gap = **64.4 kB**.
- typecheck 0, lint 0, build `all routes static (13)` — all green. Do not regress these.
- **`LazyMotion` is already used** in AskPortfolio, Parallax, ProgressBar, NavPill, EditorialGrid, FilterTabs, StoryCard, HowIThink (grep confirms). So the easy motion-tree reduction is already spent — the remaining 64 kB is harder and likely includes the React 19 + Next 16 framework floor. **Measure before assuming a lever helps.**

## Acceptance criteria (from `tickets.md` TKT-49)
1. `≥ 90/95/95/95` (perf/a11y/best-practices/SEO) mobile + desktop on `/`, `/work`, `/work/teachspark`, `/about`.
   - **DO the code levers.** But the Lighthouse *score* measurement is env-blocked here (see constraint). Report scores as **deferred-to-preview**; do NOT claim a score you couldn't reliably measure.
2. `/` first-load JS **≤ 180 kB gz**, LCP ≤ 2.5 s, CLS < 0.05.
3. Before/after JSON persisted in `evals/results/`.
4. **No threshold lowered (EV2).** The 180/2500/0.05/[90,95,95,95] numbers in `evaluation-plan.md` and `scripts/bundle-budget.ts` / `eval` config are FIXED. Do not edit them to pass.

## What to read first (cite line numbers when reporting)
- `technical-plan.md`: §A14 (perf levers), line ~354 (`scripts/bundle-budget.ts` method: sums gz first-load JS for `/` from `.next/*-build-manifest.json`, asserts ≤180), line ~408 (risk row: `LazyMotion`, dynamic `AskPanel`, CSS-first motion), line ~321 (`next.config.ts` images config), line ~303 (`lib/motion.ts`).
- `evaluation-plan.md`: EVAL-004 (Lighthouse scores) + EVAL-005 (LCP/CLS/JS-budget) — thresholds + method.
- `next.config.ts`, `app/page.tsx` (home), `app/layout.tsx`, `lib/motion.ts`, `components/interactions/{Parallax,ProgressBar}.tsx`, `components/navigation/NavPill.tsx`.
- Carry-forward (ledger "Perf levers (F5)"): tracer first-load 218.7→ now 244; levers = code-split motion, image tuning, chunk analysis.

## Procedure (measure → change → remeasure)
1. **Measure & analyze first.** Run `bundle-budget.ts`; then chunk-analyze (`.next/analyze` if available, or inspect `.next/static/chunks` + `app-build-manifest.json`) to find what the `/` first-load 244 kB actually contains. Report the top contributors with sizes. This determines which levers are worth pulling.
2. **Pull safe levers**, remeasuring after each (attribute the kB delta to each lever):
   - Are any heavy libs in the `/` client bundle that needn't be (zod was split out in M-003 — verify it stayed out)? Icons tree-shaken (named lucide imports, not namespace)?
   - `next/dynamic` (ssr:false where safe) for below-the-fold / interactive-only client components on `/` that aren't needed for first paint (AskPanel is already lazy — confirm; consider Parallax/ProgressBar/FloatingTiles interactivity, HowIThink).
   - `LazyMotion` feature set: is `domMax` used where `domAnimation` suffices? Reduce the loaded feature bundle if so.
   - CSS-first motion for above-fold effects that currently ship JS.
   - Fonts: subsetting / `display:swap` (Plus Jakarta Sans via next/font) — confirm no layout shift and no render-block.
   - Images: `next/image` sizes/priority correct (hero avatar `priority` + blur; posters/screenshots lazy) — for CLS and LCP.
3. **CLS/LCP:** ensure all above-fold images/frames have intrinsic width/height (no layout shift); hero avatar LCP path preserved. You can't reliably score Lighthouse locally, but you CAN verify intrinsic sizing in code + build, and CLS via a targeted Playwright measurement if cheap.
4. **Persist** a before/after record in `evals/results/` (e.g. `evals/results/tkt-49-perf.json` — git-ignored per `.gitignore` `evals/results/tkt-*.json`; ALSO write a small committed summary into your report). Include baseline 244.4 and achieved number + per-lever deltas.
5. Keep typecheck/lint/build green throughout; the `bundle-budget.ts` assertion is your test for AC2 (JS budget).

## Hard constraints
- **If ≤180 kB is not reachable without removing/degrading approved design features** (the glassmorphism/clay system, Apple-inspired cursor-tilt/parallax interactivity, the hero avatar treatment, reduced-motion gating): **STOP, do not force it, do not weaken the budget.** Report the best achievable number, exactly which further cut would be needed and what design/UX it would cost, as an **accepted-risk flag for Tushar's decision.** A 200 kB honest result with a clear tradeoff beats a 180 kB result that guts the design.
- Do NOT edit any threshold constant to pass (EV2). Do NOT run LHCI for *scores* on this host — swiftshader/no-GPU makes mobile perf unreliable (documented M-002/M-003/M-006); note Lighthouse-score verification is deferred to the Vercel preview/CI at TKT-50.
- Do NOT touch content/data truth, the cinematic site, or `portfolio/index.html`.
- Commit in small logical commits on `m-007-quality`; end each message with `Co-Authored-By: <your actual session model> <noreply@anthropic.com>`.

## Report to `docs/reports/TKT-49.md`
Include: baseline (244.4) vs achieved gz + whether AC2 met; chunk breakdown (top contributors, before/after); each lever applied and its kB delta; CLS/LCP handling (what's verified in code vs deferred to preview); the Lighthouse-score deferral note; any **threshold-gap accepted-risk flag** for Tushar with the specific tradeoff; final gate status (typecheck/lint/build/bundle-budget); list of files changed; commit SHAs.
