# Implementer brief — TKT-17 · ExperienceStrip (professional experience on /work) (M-004)

Fresh implementer. Execute **TKT-17** (per §B M-004 TKT-17 + tickets.md TKT-17 ACs). Model tier: standard. Branch `m-004-work`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-004 → **TKT-17** + `tickets.md` TKT-17 ACs + `Design.md` §3 (experience strip / employment section). `data/projects.ts` — the 3 professional entries (`kind:'professional'`, `status:'archived'`, statusLabel "Professional experience", no live link) added in TKT-15. `app/work/page.tsx` (TKT-16 — add the strip below the personal grid).

## Scope
- `components/projects/ExperienceStrip.tsx` — renders the professional-experience entries as **employment**, VISUALLY DISTINCT from the product ProjectCards (per the §C Phase-4 checkpoint: "ExperienceStrip reads as employment, not product" — e.g. a compact role/company/dates strip or list, NOT clay product cards with status badges). Company + role + dates + one-line scope, sourced verbatim from the data (CONTENT_INVENTORY). No live-product links (they're jobs, not products). Wire it into `app/work/page.tsx` in a clearly-separated section (heading like "Experience") after the personal-project grid — do NOT mix professional entries into the filterable product grid (they were correctly excluded from `generateStaticParams` / the grid in TKT-15/16).

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes (all copy sourced; no fabricated titles/dates — the "Senior Product Manager" title per S8; NO PMP/SAFe claims). Keyboard-accessible, targets ≥44 (EVAL-008), no dead controls (EVAL-011), links resolve (EVAL-011). It must NOT read as a live product (no "live"/uptime badges on employment). `/work` stays static. Every step gated; if a Design/data contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m004): TKT-17 ExperienceStrip (professional experience on /work)` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (`/work` still static); `pnpm test:e2e --grep 'work|experience'` green; `pnpm eval --only EVAL-007,EVAL-011,EVAL-013` no regression. Write `docs/reports/TKT-17.md`. Final 5-line summary: steps, gates, that it reads as employment not product, blockers, deviations, commit SHA.
