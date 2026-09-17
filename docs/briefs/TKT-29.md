# Implementer brief — TKT-29 · RailCite full case study content (M-005)

Fresh implementer. Execute **TKT-29** (per §B M-005 TKT-29 + tickets.md TKT-29 ACs). Model tier: most-capable. Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-005 → **TKT-29** + `tickets.md` TKT-29 ACs. `CONTENT_INVENTORY.md` (RailCite §8.2 + chapters/metrics) + `AUDIT.md` (RailCite verified facts — `railcite-cron` is the canonical newer checkout, CS5/railcite is stale). `data/schema.ts`. The teachspark full record in `data/projects.ts` is the reference pattern (TKT-28); the railcite CARD record already exists — extend to full.

## Scope
- `data/projects.ts` — flesh RailCite to a FULL case study (8 chapters, metrics, thinking chain, deepDive:true, sources), all sourced from CONTENT_INVENTORY/AUDIT. **RailCite figure/corpus policy = "live, with as-of date"** (the decided default) — cite figures as live-with-date, not frozen snapshots; every metric asOf+source.
- `docs/trace/railcite.md` — number→source trace table.

## Rules
- Everything on E Drive; content-gate MUST pass; **no fabrication** (unsourced → omit + DRAFT flag); no PII; forbidden-strings clean. Preserve honest hedges. Every step gated; if a chapter/metric isn't sourceable, STOP and report the breaker.
- Commit: `feat(m005): TKT-29 RailCite full case study content` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes, `/work/railcite` renders full deep dive); `pnpm test:e2e --grep case-study` green; `pnpm eval --only EVAL-003,EVAL-011,EVAL-013,EVAL-014` no regression + forbidden clean. Write `docs/reports/TKT-29.md`. Final 5-line summary: chapters/metrics + sources, gate + forbidden result, DRAFT flags, blockers, commit SHA.
