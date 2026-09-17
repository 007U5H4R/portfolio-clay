# Implementer brief — TKT-33 · Bhakti-Vilas case study content (M-005)

Fresh implementer. Execute **TKT-33** (per §B M-005 TKT-33 + tickets.md TKT-33 ACs). Model tier: standard. Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer. If you hit an auth error, STOP and report (don't retry-loop).

## Read first
- `technical-plan.md` §B M-005 → **TKT-33** + `tickets.md` TKT-33 ACs. `CONTENT_INVENTORY.md` (Bhakti-Vilas section) + `AUDIT.md` (bhakti-vilas.vercel.app verified live; repoPublic:false — visibility unverified). `data/schema.ts`. The full records (TeachSpark…Cubicle) are the reference pattern; the bhakti-vilas card record exists.
- **Note:** bhakti-vilas is currently the JS-off thin-slug in `tests/e2e/case-study.spec.ts` — if you make it a deep-dive, move that JS-off thin-slug assertion to another still-thin slug (e.g. one of the TKT-54 lighter builds), mirroring how TKT-31/32 handled it.

## Scope
- `data/projects.ts` — flesh bhakti-vilas to the depth its SOURCED content supports (deep-dive only if the chapters/metrics are genuinely sourceable; else card-level, don't pad). Every metric asOf+source; unsourced → omit. `docs/trace/bhakti-vilas.md` — trace table.

## Rules
- Everything on E Drive; content-gate MUST pass; **no fabrication** (unsourced → omit; thin → card-level); no PII; forbidden clean; honest hedges. Every step gated; if unsourceable, STOP and report the breaker.
- Commit: `feat(m005): TKT-33 Bhakti-Vilas case study content` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes); `pnpm test:e2e --grep case-study` green; `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` no regression + forbidden clean. Write `docs/reports/TKT-33.md`. Final 5-line summary: depth chosen + why, sources, gate + forbidden result, blockers, commit SHA.
