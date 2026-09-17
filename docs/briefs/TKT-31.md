# Implementer brief — TKT-31 · Nuptis case study content (M-005)

Fresh implementer. Execute **TKT-31** (per §B M-005 TKT-31 + tickets.md TKT-31 ACs). Model tier: standard. Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-005 → **TKT-31** + `tickets.md` TKT-31 ACs. `CONTENT_INVENTORY.md` (Nuptis section) + `AUDIT.md`. `data/schema.ts`. TeachSpark/RailCite/Velora full records = the reference pattern; the nuptis card record exists — extend to the depth its sourced content supports.
- **Relationship note:** Velora is the Nuptis→Velora pivot (TKT-30, deepDive). Nuptis is the earlier/related record — make its case study reflect what it actually was per the inventory; do NOT duplicate Velora's content or imply Nuptis is a separate live product if the audit says otherwise. If Nuptis has little distinct sourced content, keep it CARD-level (deepDive:false) with an honest cross-link to Velora — do NOT pad it to look like a full deep dive.

## Scope
- `data/projects.ts` — flesh nuptis to whatever depth its SOURCED content supports (full deep dive only if the chapters/metrics are sourceable; else card-level + honest overview). Every metric asOf+source. `docs/trace/nuptis.md` — trace table.

## Rules
- Everything on E Drive; content-gate MUST pass; **no fabrication** (unsourced → omit; card-level if thin, don't pad); no PII; forbidden clean; honest hedges + cross-link to Velora where it's the pivot. Every step gated; if the schema can't be satisfied, STOP and report the breaker.
- Commit: `feat(m005): TKT-31 Nuptis case study content` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes); `pnpm test:e2e --grep case-study` green; `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` no regression + forbidden clean. Write `docs/reports/TKT-31.md`. Final 5-line summary: depth chosen (deep vs card) + why, sources, gate + forbidden result, blockers, commit SHA.
