# Implementer brief — TKT-13 · How-I-Think home section (M-003)

Fresh implementer. Execute **TKT-13** (steps per the plan). Model tier: standard. Branch `m-003-home`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling` for e2e; Chromium installed — don't reinstall); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` unstaged (don't `git checkout`).

## Read first
- `technical-plan.md` §B M-003 → **TKT-13 steps** — *Files / Contract / Gate* authoritative.
- `Design.md` §3 How-I-Think (the framework/stages section on home) + §2 tokens. `CONTENT_INVENTORY.md` for the thinking-framework stages copy (verbatim, sourced — EVAL-013). `components/layout/{Section,SectionHeading}` + `Reveal` (from TKT-05, reuse). `lib/anchors.ts` (if the section anchors).
- EVAL context: **EVAL-003** (this section supports the thinking-framework eval), EVAL-007 (keyboard), EVAL-011 (no dead controls / links resolve), EVAL-013 (sourced content, no fabrication).

## Scope
- `data/thinking-framework.ts` — the typed framework stages (verbatim from CONTENT_INVENTORY; each with its label/description, sourced where it makes a claim). `lib/stages.ts` — any stage-ordering/derivation helper the plan specifies.
- `components/home/HowIThink.tsx` — the home section rendering the framework (server where possible; reveal-on-scroll via the existing `Reveal`; reduced-motion-safe; one accent tone per Design.md §Section `tone`). Wire it into `app/page.tsx` in its Design.md position (do NOT reorder other home sections; this is additive — final home assembly is TKT-14).
- `tests/e2e/how-i-think.spec.ts`.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes (any claim sourced; no fabrication — if the framework copy is DRAFT in the inventory, render it DRAFT-labelled and flag it). Do NOT reorder/rewrite other home sections (Hero, FeaturedWork, Ask) — additive only. Keyboard-accessible, targets ≥44, no console errors. Every step has a hard Gate; if a Design/content contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m003): TKT-13 How-I-Think home section` + Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (content-gate passes with the new thinking data); `pnpm test:e2e --grep how-i-think` green; `pnpm eval --only EVAL-003,EVAL-007,EVAL-011,EVAL-013` no regression. Write `docs/reports/TKT-13.md` (per-step gates, the stages + sources/DRAFT flags, `git diff --stat`). Final 5-line summary: steps, gates, DRAFT/sourced notes, blockers, deviations, commit SHA.
