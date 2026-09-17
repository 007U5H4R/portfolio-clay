# Implementer brief — TKT-16 · /work page: WorkHero + FilterTabs + WorkGrid/EditorialGrid + EmptyState (M-004)

Fresh implementer. Execute **TKT-16** (per §B M-004 TKT-16 + tickets.md TKT-16 ACs). Model tier: most-capable (FilterTabs URL-param + editorial grid). Branch `m-004-work`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner is `workers:1` serial — expect slow e2e); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/tkt-*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-004 → **TKT-16** + `tickets.md` TKT-16 ACs + `Design.md` §3 Work (editorial grid, filters). `data/projects.ts` (14 records, TKT-15) + `data/schema.ts`.
- **Conflicts (resolved — follow exactly):** **E-4 / TP7** — reading `searchParams` server-side makes `/work` dynamic; instead use CLIENT-side `useSearchParams` in a `<Suspense>` boundary so `/work` stays STATIC (assert-static must still pass); a one-frame flash on deep links is accepted. **E-2** — the filter query key is `?filter=` (NOT `?tab=`); `lib/filters.ts` is the SINGLE parser; `validate-content` rejects unknown query keys. AC2 filter buckets: default **Experiments** for Token Toli/Pratyasa/Bhakti-Vilas (already set in the data).

## Scope
- `lib/filters.ts` — the single `?filter=` parser/definitions (filter set derived from the data's `filters` field).
- `components/projects/{WorkHero,FilterTabs,WorkGrid,EditorialGrid,EmptyState,ProjectCard}.tsx` — `WorkHero` (page intro), `FilterTabs` (`ClayPill variant="filter"` role=tab, `?filter=` via client `useSearchParams`, `aria-current`/`aria-selected`, keyboard-operable), `WorkGrid`/`EditorialGrid` (editorial layout — NOT nine identical rectangles; varied sizes per Design), `EmptyState` (the four-states EVAL-014 empty case when a filter matches nothing), `ProjectCard` grid mode (finalize the `mode:'grid'` path). `app/work/page.tsx` (renders WorkHero + FilterTabs-in-Suspense + grid of all personal projects; professional entries via the ExperienceStrip in TKT-17, not here).
- `tests/e2e/work.spec.ts`.

## Rules
- `/work` MUST stay static (TP1 — `assert-static` passes; filter is client-side). Everything on E Drive; colour DEFINITIONS 13; content-gate passes. Keyboard-accessible tabs (EVAL-007), targets ≥44 (EVAL-008), no dead controls (EVAL-011), editorial grid reads varied (EVAL-009 spirit). Every step gated; if a Design/E-4 contract is ambiguous, STOP and report the breaker.
- Commit: `feat(m004): TKT-16 /work page + FilterTabs + editorial grid` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (`/work` static); `pnpm test:e2e --grep work` green (filter changes URL `?filter=`, grid updates, EmptyState on no-match, keyboard tabs); `pnpm eval --only EVAL-002,EVAL-004,EVAL-007,EVAL-008,EVAL-010,EVAL-011` no regression (EVAL-002 hop 2 = /work → case study). Write `docs/reports/TKT-16.md`. Final 5-line summary: steps, gates (static-/work + filter + EmptyState + keyboard), EVAL results, blockers, deviations, commit SHA.
