# Implementer brief — TKT-07a · Eval harness part 1: Vitest layer + Playwright specs (M-002, TASK-7)

Fresh implementer. Execute **TSK-08 + TSK-09 only** of ticket TKT-07 (part 1 of 2; TSK-10/11/12 follow in TKT-07b). Model tier: most-capable. Work in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` on branch `m-002-foundations`. Standard guardrails (E-Drive only; don't touch main/backlog/docs ledger+briefs/sibling portfolio; explicit-path staging, never `git add -A`; Chromium already on E-Drive — use `.env.tooling` for e2e, don't reinstall). If the eval run re-renders `docs/screenshots/**`, leave them unstaged (don't `git checkout` — trips a destructive gate).

## Read first
- `technical-plan.md` §B M-002 → **TKT-07 / TSK-08 (S08.01–S08.03) + TSK-09 (S09.01–S09.03)** (lines ~587–595) — *Files / Contract / Gate* authoritative.
- `technical-plan.md` §A9 (Vitest/Playwright config), §A16 (eval wiring). `evals/eval-cases.json` (the 17-case authority). Existing tracer harness: `vitest.config.ts`, `tests/e2e/fixtures.ts`, `scripts/eval.ts` (minimal — extend, don't rebuild).
- The harness must reflect current reality: M-002 has schema (TKT-03), full primitives (TKT-04), layout+footer (TKT-05), SEO/OG (TKT-06). Routes built today: `/`, `/work`, `/work/teachspark`, `/contact`, `/dev/primitives` (QA-only).

## Steps (each has a hard Gate — see the plan for exact commands/outputs)
- **S08.01** `vitest.config.ts` two projects (node `*.test.ts` + jsdom `*.test.tsx`), jest-dom setup, json reporter → `.eval/vitest.json`. Gate: `pnpm test` runs both; `.eval/vitest.json` written.
- **S08.02** `scripts/eval-cases.ts` (zod schema for the case file; `loadCases()`; asserts 17 unique ids + every `automated:true` has a runner mapping) + `evals/evaluation-plan.md` pointer line. Gate: `pnpm exec tsx scripts/eval-cases.ts` → `17 cases OK · 14 automated · 3 manual` (per plan).
- **S08.03** `lib/format.ts` (`formatAsOf`, `formatRange`, `formatNumber` tabular, `readingTime`) + `tests/unit/format.test.ts`. Gate: UNIT green.
- **S09.01** `tests/e2e/fixtures.ts` finalised (add `keyboardOnly` with focus-visible assertion after each Tab: outline 3px accent; `consoleErrors` collector failing on console.error). Gate: `pnpm test:e2e --grep @smoke` green.
- **S09.02** Per-EVAL spec skeletons `tests/e2e/eval-00{2,6,7,8,10,14,15}.spec.ts` — live assertions for what exists now, `test.fixme` for not-yet-built (Ask/filters/timeline → later); each `test` title carries `@EVAL-0xx`. Gate: `pnpm test:e2e --list | grep -c '@EVAL-'` ≥ 8; no automated EVAL id missing.
- **S09.03** `tests/e2e/routes.json` (static list + loader preferring `/sitemap.xml` when 200). Gate: unit test for the loader fallback order.

## Rules
- Extend the tracer harness; keep colour DEFINITIONS at 13 (`pnpm tokens:check`). Follow the plan; no scope beyond TSK-08/09. Do NOT build the crawler (TSK-10), LHCI enforcement (TSK-11) or the full orchestrator/CI (TSK-12) — those are TKT-07b.
- If a plan gate can't pass against current reality, STOP and report the breaker.
- Commit: `feat(m002): TKT-07a eval harness pt1 (vitest projects + playwright specs)` + Co-Authored-By trailer. Explicit paths only.

## Finish
`pnpm typecheck && lint && test && build` green; `pnpm test:e2e` green for the live specs (fixme'd ones skip). Write `docs/reports/TKT-07a.md` (per-step gates, the `17 cases OK…` line, EVAL spec count, `git diff --stat`). Final 5-line summary: steps done, gates, EVAL specs live vs fixme, blockers, deviations, SHA.
