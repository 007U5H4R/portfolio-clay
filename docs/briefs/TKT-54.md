# Implementer brief — TKT-54 · 5 lighter-build case entries (M-005)

Fresh implementer. Execute **TKT-54** (per §B M-005 TKT-54 + tickets.md TKT-54 ACs). Model tier: standard. Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer. If you hit an auth error, STOP and report (don't retry-loop).

## Read first
- `technical-plan.md` §B M-005 → **TKT-54** + `tickets.md` TKT-54 ACs. `CONTENT_INVENTORY.md` + `AUDIT.md` for each of the 5: **token-toli, pratyasa, tegaki, dino-arcade, cinematic-portfolio**. `data/schema.ts`. Existing card records for these 5 exist in `data/projects.ts`.

## Scope
- `data/projects.ts` — finalize the 5 lighter-build records at the depth their SOURCED content supports (these are the lighter builds — mostly **card-level/thin**, NOT full deep dives; token-toli stays thin per plan / is the JS-off e2e slug). Every metric asOf+source; unsourced → omit. `content/media/*/SOURCES.md` + `docs/trace/*.md` per the ticket for each.
- **cinematic-portfolio is the CURRENTLY-LIVE site (tushar-pathak.vercel.app)** — link to it as live, describe it honestly, do NOT rebuild it or touch that separate repo. It's a real shipped project → card with live link.
- token-toli / pratyasa: roles/team per AUDIT (Token Toli = "Team discovery", Guru-pod 3 co-authors — don't claim solo). dino-arcade: "BYO-ROM" is sanctioned product framing, NOT a banned string; no actual ROMs.

## Rules
- Everything on E Drive; content-gate MUST pass; **no fabrication / no padding** (these are lighter builds — card-level is correct, don't inflate); no PII; forbidden clean; honest roles/hedges. Every step gated; if unsourceable, STOP and report the breaker.
- Commit: `feat(m005): TKT-54 five lighter-build case entries` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes); `pnpm test:e2e --grep case-study` green; `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` no regression + forbidden clean. Write `docs/reports/TKT-54.md`. Final 5-line summary: the 5 records + depth each + sources, cinematic-portfolio linked-not-rebuilt, gate + forbidden result, blockers, commit SHA.
