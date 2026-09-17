# Implementer brief — TKT-32 · Cubicle case study content (M-005)

Fresh implementer. Execute **TKT-32** (per §B M-005 TKT-32 + tickets.md TKT-32 ACs). Model tier: standard. Branch `m-005-content`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-005 → **TKT-32** + `tickets.md` TKT-32 ACs. `CONTENT_INVENTORY.md` (Cubicle section) + `AUDIT.md` (**Cubicle was NEVER deployed** — "built, not launched"; the artifact diagrams are the Sep-8 ChatGPT PNGs in ~/Downloads, NOT committed here). `data/schema.ts`. The cubicle card record exists (status reflects built-not-launched).

## Scope
- `data/projects.ts` — flesh cubicle to the depth its SOURCED content supports. **CRITICAL honesty (AUDIT):** Cubicle is **built but never deployed** — NO live link, status/statusLabel must say "built, not launched" (or equivalent), do NOT imply a live product or fabricate usage/uptime. Role = "Team build" (named role unrecorded — don't claim solo). Every metric asOf+source; unsourced → omit. `docs/trace/cubicle.md` — trace table.
- The conditional featured-swap (Cubicle → featured only IF deployed) is NOT triggered — it is NOT deployed, so it stays non-featured. Do not change the featured trio.

## Rules
- Everything on E Drive; content-gate MUST pass; **no fabrication** — this is the highest-risk record for overclaiming (a built-not-launched project); render only sourced facts, honest "not deployed" framing. No PII; forbidden clean. Every step gated; if content is thin, keep it card-level (don't pad); if unsourceable, STOP and report the breaker.
- Commit: `feat(m005): TKT-32 Cubicle case study content (built, not launched)` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes); `pnpm test:e2e --grep case-study` green; `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` no regression + forbidden clean. Write `docs/reports/TKT-32.md`. Final 5-line summary: depth + built-not-launched framing confirmed (no live link, no fake usage), sources, gate + forbidden result, blockers, commit SHA.
