# Brief — TKT-47 · Responsive sweep (QA-tester) · TASK-43

**You are a fresh QA-tester subagent. Self-contained brief — no prior chat context.** You are a *separate* role from the implementers: verify honestly, fix only small responsive defects this ticket owns, log the rest. No scope creep, no unrelated refactors. Read cited files yourself.

## Repo / environment
- Root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` — **everything on E Drive** (never the Mac internal disk). Branch `m-007-quality` (already checked out). Commit here, not `main`.
- Stack: Next.js 16.3.5 (App Router, static), React 19, Tailwind 4, `motion` 13, pnpm 11.25.0, node 26.7.0.
- **Host is memory-tight (~100 MB free, load ~2). Run Playwright FOREGROUND with a stop-rule; check `uptime` first; NEVER a background Monitor (it deadlocked on OOM twice).** `playwright.config.ts` already pins **`workers:1`** and a `pnpm start` webServer on **:3000** (`reuseExistingServer`). Do NOT run two Playwright invocations at once (port + OOM). If a run stalls at 0% CPU or the host load spikes past ~6, stop it, reap procs, wait for calm (`uptime`), retry once; if it still fails, report the environmental block — do not loop.
- TKT-49 perf changes just landed (NavPill/AskPortfolio/Parallax off `domAnimation`, `bundle-budget` EXE-10). You sweep the CURRENT code.

## Objective
Prove every public route is responsive at **390 / 768 / 1024 / 1440** and fix any responsive defects this ticket owns.

## Acceptance criteria (from `tickets.md` TKT-47)
1. **0 horizontal overflow, 0 controls < 44×44 px, 0 text < 14px** across **all routes × 4 widths**.
2. Screenshot pack committed to `docs/screenshots/<route>/<width>.png`.
3. Defects fixed (small commits) **or** logged as `QA-###` with a reason.
4. `pnpm eval --only EVAL-008` green.

## What exists already (reuse, don't rebuild)
- `tests/e2e/eval-008.spec.ts` — the EVAL-008 overflow / 44px-target / 14px-text spec. Read it. It already encodes the rules incl. the `data-micro-label` ≥12px exception (EXE-7) and the `a[data-inline-link]` WCAG-2.5.8 allowlist (do NOT re-flag those; they are accepted exceptions).
- `tests/e2e/routes.ts#loadRoutes` prefers a live `/sitemap.xml` (200) over `tests/e2e/routes.json`. The built sitemap includes **all case-study slugs and all 5 essays**, so an EVAL-008 run against a live server sweeps them. Confirm the sitemap is complete (should list `/`, `/work`, 11 `/work/[slug]`, `/about`, `/thinking`, 5 `/thinking/[slug]`, `/playground`, `/contact`).
- Playwright projects = the four widths. `pnpm eval --only EVAL-008` is the gate command.

## Procedure
1. `uptime` (confirm calm) → `pnpm build` (production build the webServer serves) → run the EVAL-008 sweep foreground. Read `tests/e2e/eval-008.spec.ts` first to know exactly what it covers and whether it already iterates all sitemap routes × 4 widths. If it covers only a subset, extend the iteration to **all** public routes (home, /work, every /work/[slug], /about, /thinking, every /thinking/[slug], /playground, /contact) × 4 widths — using the existing rule helpers, not new thresholds.
2. Capture a screenshot per route × width to `docs/screenshots/<route>/<width>.png` (deterministic gate captures — NOT the routine test-results churn; write them explicitly). `/` and `/work` and one case study (`/work/teachspark`) and `/about` are the priority set if disk/time forces a subset — but the AC asks for the full pack; commit what you capture.
3. **Manual review** the captured shots for: text clipping, awkward wrap, the `/work` FilterTabs horizontal "peek" affordance, hero/avatar fit at 390, timeline at 390, case-study chapter nav at 390. Note issues.
4. For each real defect: if it is a small responsive CSS fix clearly in this ticket's scope, fix it in a small commit and re-run the affected width. If it is larger / cross-cutting / a design judgment, log it as `QA-###` (id, route, width, description, why deferred) — do NOT silently fix out-of-scope things.
5. Re-run `pnpm eval --only EVAL-008` until green (or, if a failure is an accepted exception per EXE-7 / inline-link allowlist, cite it). Keep typecheck/lint/build green.

## Constraints
- No threshold weakening (EV2): the 44 / 14 / 0-overflow rules and their EXE-7 exceptions are fixed. Don't relax them to pass; fix the DOM or log QA-###.
- Don't touch content/data truth, the cinematic site, or `portfolio/index.html`.
- Commits on `m-007-quality`, message trailer `Co-Authored-By: <your actual session model> <noreply@anthropic.com>`.

## Report to `docs/reports/TKT-47.md`
Per route × width: overflow / min-target / min-text-size PASS/FAIL. List every defect found → fixed (commit SHA) or QA-### (with reason). Note the screenshot pack location + count. Final `pnpm eval --only EVAL-008` result. Any environmental (OOM) blocks hit and how resolved. Gate status (typecheck/lint/build). Files changed + SHAs.
