# Implementer brief — TKT-30 · Velora full case study content (M-005)

Fresh implementer. Execute **TKT-30** (per §B M-005 TKT-30 + tickets.md TKT-30 ACs). Model tier: most-capable. Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-005 → **TKT-30** + `tickets.md` TKT-30 ACs. `CONTENT_INVENTORY.md` (Velora §8.5) + `AUDIT.md` + the Velora PRD (the exact problem line). `data/schema.ts`. TeachSpark/RailCite full records are the reference pattern. Velora = the Nuptis→Velora rename (slug `velora`); its card record exists — extend to full.

## Scope
- `data/projects.ts` — flesh Velora to a FULL case study (8 chapters, metrics, thinking, deepDive:true, sources), all sourced. **Carry-forward from TKT-12:** Velora's `overview.thirtySecond` currently uses a §8.5 discovery-insight STAND-IN because the exact PRD problem line wasn't in the inventory — **swap in the exact PRD problem line now** (from the Velora PRD.md:11 or CONTENT_INVENTORY once located), sourced. Every metric asOf+source.
- `docs/trace/velora.md` — trace table.

## Rules
- Everything on E Drive; content-gate MUST pass; **no fabrication** (unsourced → omit + DRAFT); no PII; forbidden clean; honest hedges. Every step gated; if the exact PRD line or a chapter/metric isn't sourceable, STOP and report the breaker (keep the sourced stand-in + flag, don't invent).
- Commit: `feat(m005): TKT-30 Velora full case study content` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes, `/work/velora` renders full); `pnpm test:e2e --grep case-study` green; `pnpm eval --only EVAL-003,EVAL-011,EVAL-013,EVAL-014` no regression + forbidden clean. Write `docs/reports/TKT-30.md`. Final 5-line summary: chapters/metrics + sources, the PRD-line swap status, gate + forbidden result, blockers, commit SHA.
