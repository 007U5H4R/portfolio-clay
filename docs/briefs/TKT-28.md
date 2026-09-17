# Implementer brief — TKT-28 · TeachSpark full case study content (M-005)

Fresh implementer. Execute **TKT-28** (per §B M-005 TKT-28 + tickets.md TKT-28 ACs). Model tier: most-capable (flagship case-study content fidelity). Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-005 → **TKT-28** + `tickets.md` TKT-28 ACs. `CONTENT_INVENTORY.md` (TeachSpark §8.1 + the case-study chapters/metrics) + `AUDIT.md` (verified TeachSpark facts/URLs). `data/schema.ts` (chapter/metric/thinking shape; metric needs asOf+source). `lib/anchors.ts` `CHAPTER_ANCHORS`. Existing teachspark card record in `data/projects.ts` (extend to full fidelity — chapters, metrics, thinking, deepDive:true).

## Scope
- `data/projects.ts` — flesh TeachSpark to a FULL case study: the 8 chapters (context/problem/discovery/bet/built/evaluation/outcome/learned) with sourced bodies, the metrics (each `asOf`+`source`; **metric date default = 2026-08-24** per the decided default), a thinking chain (for ShowTheThinking), overview (30-sec + deepDive:true), sources[]. All VERBATIM/sourced from CONTENT_INVENTORY/AUDIT — **NO fabrication**.
- `docs/trace/teachspark.md` — the number→source trace table (every metric/claim → its inventory/audit source).

## Rules
- Everything on E Drive; content-gate MUST pass (validateAll — every metric asOf+source, chapters valid, deepDive:true needs the chapters). **NEVER include the TeachSpark sandbox join code** (forbidden-strings EVAL-016) or any PII. Any figure not sourced → omit + flag DRAFT (don't invent). "uptime unverified" honesty preserved where the audit says so. Every step gated; if a chapter/metric can't be sourced, STOP and report the breaker (don't fabricate).
- Commit: `feat(m005): TKT-28 TeachSpark full case study content` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes, `/work/teachspark` renders the full case study now — chapters + metrics + thinking + ChapterNav live); `pnpm test:e2e --grep 'case-study'` green (TeachSpark now exercises the real deep-dive path — TC-075/076/077 that were BLOCKED can now run); `pnpm eval --only EVAL-003,EVAL-004,EVAL-011,EVAL-013,EVAL-014` no regression + forbidden-strings clean. Write `docs/reports/TKT-28.md` (the trace table summary, sourced/DRAFT flags, `git diff --stat`). Final 5-line summary: chapters/metrics filled + their sources, content-gate + forbidden-scan result, DRAFT flags, blockers, commit SHA.
