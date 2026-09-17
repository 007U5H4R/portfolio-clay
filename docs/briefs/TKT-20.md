# Implementer brief — TKT-20 · Case-study artifact components + MetricCard + dev board (M-004)

Fresh implementer. Execute **TKT-20** (per §B M-004 TKT-20 + tickets.md TKT-20 ACs). Model tier: most-capable (data-shaped artifact rendering + EVAL-009 visual quality). Branch `m-004-work`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling`; Chromium installed — don't reinstall; runner `workers:1` serial); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/*.json` unstaged. Use YOUR session's Co-Authored-By trailer.

## Read first
- `technical-plan.md` §B M-004 → **TKT-20** + `tickets.md` TKT-20 ACs + `Design.md` §3 (case-study artifacts: MetricCard "value + label + context + asOf", and the other artifact types the schema defines) + §2 tokens. `data/schema.ts` — the `Artifact` discriminated union + `Metric` (value/label/context/asOf/source). `lib/format.ts` (formatAsOf/formatNumber — reuse). `lib/stages.ts` (stageTone — reuse for tone).

## Scope
- `components/case-study/artifacts/*.tsx` — the artifact renderers for each `Artifact` variant in the schema (MetricCard, and the others: e.g. quote, image/diagram, list/table — build exactly the variants the schema defines, no more). MetricCard renders value + label + context + `formatAsOf(asOf)`; tabular-nums; sourced (every metric carries a source — EVAL-013). A single `ArtifactRenderer` that switches on the discriminated `kind` is the clean entry point.
- `app/dev/artifacts/page.tsx` — dev-only board rendering every artifact variant (dev guard; 404 in prod) — this is the §C Phase-4 "one artifact board reviewed" checkpoint evidence.
- `tests/unit/artifacts.test.tsx` (renders each variant; MetricCard guards: no metric without asOf/source reaches render).

## Rules
- Everything on E Drive; colour DEFINITIONS 13; content-gate passes; **no fabricated metrics** — artifacts render only what the sourced data provides. Exhaustive switch on the Artifact union (a new variant must be a type error if unhandled). Keyboard/reduced-motion/≥44/axe clean (EVAL-006/008). This ticket builds the COMPONENTS + dev board; real case-study artifact DATA lands in M-005 content tickets. Every step gated; if the schema's Artifact union is ambiguous, STOP and report the breaker.
- Commit: `feat(m004): TKT-20 case-study artifacts + MetricCard + dev board` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green; `/dev/artifacts` 200 dev / 404 prod; `pnpm test:e2e` (artifacts board if a spec) + unit tests green; `pnpm eval --only EVAL-003,EVAL-006,EVAL-008,EVAL-009,EVAL-013` no regression. Write `docs/reports/TKT-20.md`. Final 5-line summary: the artifact variants built, MetricCard sourcing guard, dev-board 200/404, gates, blockers, commit SHA.
