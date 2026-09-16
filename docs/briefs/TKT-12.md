# Implementer brief — TKT-12 · FeaturedWork real data (railcite + velora) + FeaturedWork section (M-003)

Fresh implementer. Execute **TKT-12** (steps per the plan). Model tier: most-capable. Branch `m-003-home`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling` for e2e; Chromium installed — don't reinstall); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` unstaged (don't `git checkout`).

## Read first
- `technical-plan.md` §B M-003 → **TKT-12 steps** — *Files / Contract / Gate* authoritative.
- `Design.md` §3 FeaturedWork/ProjectCard. `data/schema.ts` (the rules: distinct featured ranks 1/2/3, exactly one `gridSize:large`, ≤3 tags, metrics need `asOf`+`source`), `data/projects.ts` (TeachSpark exists), `data/index.ts` `validateAll` (now expects `projects:3` for the featured trio).
- Content (verbatim, sourced — EVAL-013): `CONTENT_INVENTORY.md` for RailCite + Velora (§2.2/§8). Defaults already decided (apply them, flag as DRAFT where DRAFT): **TeachSpark metric date = 2026-08-24**; **RailCite corpus-figure policy = live-with-date**; featured trio = TeachSpark (rank 1), RailCite (rank 2), **Velora** (rank 3, the Nuptis→Velora rename, decision S3). Every metric carries `asOf` + a `source` in the record's `sources[]` or the build FAILS.

## Scope
- `data/projects.ts` — add the **railcite** and **velora** records at card fidelity + featured rank/gridSize (one of the 3 is `large`); TeachSpark stays rank 1. All 3 satisfy the schema composition invariant (`projects:3`, distinct ranks, one large). Links: live URL + `repoPublic:false` until public (S5); hero media may be `{}`/placeholder (real media = M-005).
- `components/projects/{FeaturedWork,ProjectCard}.tsx` — `FeaturedWork` home section rendering the 3 featured cards (editorial layout, not 3 identical rectangles — one `large`); extend `ProjectCard` for the featured grid as needed (grid mode fully lands at TKT-16). Wire `<FeaturedWork/>` into `app/page.tsx` replacing the tracer single-card placeholder. `app/work/[slug]/page.tsx` `generateStaticParams` now includes railcite + velora (stubs OK — full case studies are M-005).
- Tests `tests/e2e/featured.spec.ts`.

## Rules
- Everything on E Drive; colour DEFINITIONS 13; **content-gate must pass** (`validateAll` → `projects:3`, all metrics sourced+asOf, no dangling links). Do NOT fabricate metrics — every number traces to CONTENT_INVENTORY with a source; if a needed figure isn't sourced, render the record without it and flag DRAFT, don't invent. Every step has a hard Gate; if a schema rule can't be satisfied with the available sourced content, STOP and report the breaker.
- Commit: `feat(m003): TKT-12 featured work (railcite + velora) + FeaturedWork section` + Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (prebuild `projects:3`); `pnpm test:e2e --grep featured` green; `pnpm eval --only EVAL-001,EVAL-002,EVAL-011,EVAL-013,EVAL-015` no regression (EVAL-002 hop 1 = home featured → case study). Write `docs/reports/TKT-12.md` (the 3 records + their sourced metrics/asOf, DRAFT flags, `git diff --stat`). Final 5-line summary: steps, gates (projects:3 + content-gate + EVAL-013), the featured trio + which is `large`, DRAFT/sourced-metric notes, blockers, commit SHA. **Note for orchestrator:** report how the hero + FeaturedWork read together at 1024/1440 (this is the EXE-6 hero-balance context — the orchestrator judges grid ratio at TKT-14).
