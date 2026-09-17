# Implementer brief — TKT-39 · EVAL-003 mapping table + eval-003 report (M-005, last content ticket)

Fresh implementer. Execute **TKT-39** (per §B M-005 TKT-39 + tickets.md TKT-39 ACs). Model tier: standard. Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer. If you hit an auth error, STOP and report (don't retry-loop).

## Read first
- `technical-plan.md` §B M-005 → **TKT-39** + `tickets.md` TKT-39 ACs + `evaluation-plan.md` (EVAL-003 definition — what it maps/scores). `test-cases.md` (the EVAL-003 table location). The case-study content now in `data/projects.ts` (TeachSpark/RailCite/Velora/Nuptis/Cubicle/Bhakti-Vilas full or shorter; the 5 lighter builds card-level) + the `docs/trace/*.md` trace tables.

## Scope
- Complete the **EVAL-003 mapping** per the ticket: the table (in `test-cases.md` per the plan's Traceability, TKT-39 = TASK-35) that maps the thinking-framework / case-study reasoning to its evidence, and generate `evals/results/eval-003-<sha>.md` **from real inspection** (not hand-waved) — 8/8 (or whatever EVAL-003's criteria are) with each row traced to sourced content. EVAL-003 is a MANUAL/inspection eval — produce the honest scored report.
- If EVAL-003's scope is the per-project thinking-chain↔evidence mapping, verify each case study's thinking nodes resolve to real sources (reuse the docs/trace tables). Do NOT fabricate a passing score — report actual coverage.

## Rules
- Everything on E Drive; content-gate passes; **no fabricated scores** — EVAL-003 report generated from real inspection of the committed content. No PII; forbidden clean. Every step gated; if EVAL-003's criteria can't be met by the current content, REPORT the real gaps (don't inflate).
- Commit: `feat(m005): TKT-39 EVAL-003 mapping table + report` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green; `pnpm eval --only EVAL-003,EVAL-011,EVAL-013` (EVAL-003 now scored, not just MANUAL-slot) — report the result; no regression. Write `docs/reports/TKT-39.md`. Final 5-line summary: EVAL-003 mapping result (score + any real gaps), where the table + report live, gate result, blockers, commit SHA.
