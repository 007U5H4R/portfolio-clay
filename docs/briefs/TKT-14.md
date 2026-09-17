# Implementer brief — TKT-14 · FinalCTA + CopyButton behaviour + home assembly + eval-001 pack (M-003 capstone)

Fresh implementer. Execute **TKT-14** (steps per the plan). Model tier: most-capable. Branch `m-003-home`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling` for e2e; Chromium installed — don't reinstall); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/tracer/**` + `evals/results/tkt-*.json` unstaged (tkt-*.json is gitignored). **DO commit the new `docs/screenshots/home/*.png`** (they're the 5-second-test evidence).

## Read first
- `technical-plan.md` §B M-003 → **TKT-14 steps** — *Files / Contract / Gate* authoritative.
- `Design.md` §3 FinalCTA + the full home section order. `components/common/CopyButton.tsx` (skeleton from TKT-04 — implement its behaviour here). `data/*`, `lib/*` as needed. Existing home sections (Hero, Ask inline, FeaturedWork, HowIThink) — this ticket finalizes their assembly/order in `app/page.tsx`; do not rewrite them, just compose + polish transitions.

## Scope
- `components/home/FinalCTA.tsx` — the closing CTA section (Design.md copy; resume via `resumeAction()`, LinkedIn, contact; sourced).
- `components/common/CopyButton.tsx` — implement behaviour (idle→copied→error states, clipboard with a selectable-text fallback when the Clipboard API is blocked — TKT-14 owns this; `[copy]` console.warn prefix on failure per A12, no silent failure).
- `app/page.tsx` — FINAL home assembly + order per Design.md (Hero → Ask → FeaturedWork → HowIThink → FinalCTA, or the exact Design order), transitions/Reveal wired, one accent per section.
- `tests/e2e/home.spec.ts`, `docs/screenshots/home/{390,768,1024,1440}.png` (the 5-second-test evidence — the orchestrator reviews these for the EXE-6 hero-balance ruling), `evals/results/eval-001-<sha>.md` (the EVAL-001 pack scoring stub).

## REQUIRED fixes/carry-forwards folded into this ticket
- **eval-017 sitemap-count is STALE:** `tests/e2e/eval-017.spec.ts` hard-codes an expected sitemap URL count of 4, but TKT-12 added railcite+velora so it's now 6. **Make the assertion DYNAMIC** — derive the expected count from the data (static routes + `projects.filter(personal)` slugs + essays) so it can't go stale again. Confirm `pnpm test:e2e --grep @EVAL-017` green.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes; no fabrication (FinalCTA copy sourced/DRAFT-labelled). CopyButton must never fail silently. Do NOT change the hero grid ratio yourself — the orchestrator makes the EXE-6 hero-balance call from your home screenshots (just report how hero+FeaturedWork read at 1024/1440). Every step has a hard Gate; if a Design contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m003): TKT-14 FinalCTA + CopyButton + home assembly + eval-001 pack` + Co-Authored-By trailer. Explicit paths (include `docs/screenshots/home/`).

## Finish
`pnpm typecheck && lint && test && build` green; `pnpm test:e2e --grep 'home|@EVAL-017'` green (incl. the fixed sitemap assertion); `pnpm eval --only EVAL-001,EVAL-004,EVAL-005,EVAL-006,EVAL-008,EVAL-011,EVAL-017` — report results (EVAL-005 bundle still informational; note the `/` first-load kB). Write `docs/reports/TKT-14.md`. Final 5-line summary: steps, gates, EVAL results (esp. eval-017 dynamic fix + bundle kB), the home screenshots produced, how hero+FeaturedWork read at 1024/1440 (EXE-6 input), blockers, commit SHA.
