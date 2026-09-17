# TKT-20 — Case-study artifact components + MetricCard + `/dev/artifacts` board

**Milestone:** M-004 · **Type:** Feature · **Branch:** `m-004-work` · **Status:** complete

## What was built

The full typed-artifact rendering layer for case studies (Solution-PRD §5; Design.md §3), plus the
QA review board. Real case-study artifact **data** is out of scope here (lands in M-005 content
tickets); this ticket delivered the **components + dev board**.

### Artifact variants (all 8 the schema's `Artifact` discriminated union defines — no more, no fewer)

| `type` | Component | Shape (Design.md §3) |
|---|---|---|
| `insight` | `InsightCard` | quote block, `butter` left accent bar, attribution |
| `hypothesis` | `HypothesisCard` | "We believe…" / "We'll know when…" split by a rule + status badge |
| `metric` | `MetricCard` | large `tabular-nums` value + label + context + `formatAsOf` + kind badge |
| `decision` | `DecisionCard` | Chosen (mint check) vs Rejected (muted, struck) two columns + reason |
| `evaluation` | `EvaluationCard` | Method → Result → Limitation, 3 stacked labelled rows |
| `experiment` | `ExperimentCard` | Setup → Result → Learning horizontal mini-connector (stacks on mobile) |
| `prototype` | `PrototypeFrame` | 16:9 `ClayFrame` bezel around image/video/placeholder + caption |
| `generic` | `ArtifactCard` | type icon + title (link when `href`) + note, PRD/deck/ledger/doc/link |

Supporting pieces: `ArtifactRenderer` (the single entry point — resolves the source id → label and
dispatches on `type`), `ArtifactShell` (the one shared card-tier `ClayCard` DNA — props only, no
per-type styling forks), `ArtifactGrid` (1-up / 2-up ≥768 / 3-up ≥1024, chapter-column, never
full-bleed — AC 3), `SourceCaption` (renders `label` only; a public `url` becomes an `ExternalLink`),
and `types.ts` (per-variant types derived from the schema union via `Extract`).

### Files

- `components/case-study/artifacts/{ArtifactRenderer,ArtifactShell,ArtifactGrid,SourceCaption,InsightCard,HypothesisCard,MetricCard,DecisionCard,EvaluationCard,ExperimentCard,PrototypeFrame,ArtifactCard,types,index}.tsx/.ts`
- `app/dev/artifacts/{page.tsx,fixtures.ts}` — dev-guarded board rendering every variant with sourced TeachSpark/RailCite fixtures
- `tests/unit/artifacts.test.tsx` — renderer mapping, source-resolution throw, exhaustive-switch backstop, `SourceCaption` label-only, MetricCard sourcing guards (runtime + type-level `@ts-expect-error`)
- `tests/e2e/artifacts.spec.ts` — `@artifacts` board gate (axe + no-overflow + 44px targets + 390/1440 screenshots)
- `data/schema.ts` — added `export type SourceRef` (needed by the renderer; no schema behaviour change)
- `tests/e2e/routes.json` — added `/dev/artifacts` to the `dev` route inventory

## Guards & correctness

- **Exhaustive switch:** `ArtifactRenderer`'s `default` assigns `artifact` to `never` — an unhandled
  future union member is a **compile-time error**, not a silent gap.
- **MetricCard sourcing (EVAL-013, no fabricated metrics):** prop type is the full `Metric`
  (`asOf`/`source`/`kind`/`context` mandatory → partial props are a type error, verified by a
  `@ts-expect-error` test), **plus** a runtime invariant that throws rather than render a metric with
  an empty `asOf`/`source`. `ArtifactRenderer` also throws if an artifact's `source` id is not
  declared. A metric without provenance never reaches the page.
- **No path leakage (security note / EVAL-013/016):** `SourceCaption` renders `SourceRef.label`
  only; `ref` (the `/Volumes/…` / inventory path) is never emitted. Verified: the rendered dev-board
  HTML contains no `/Volumes/` and no source `ref` string.
- **Bug found & fixed during build:** the first generic-card design wrapped the whole card in an
  `<a>`, nesting the source `ExternalLink` anchor inside it (invalid HTML + a11y). Reworked so the
  link is scoped to the title and the source caption is a sibling — no nested anchors.
- Colour never alone (kind/status/decision badges pair icon + text); reduced-motion safe (no new
  animation); 16-token colour budget untouched (reuses existing tokens).

## Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✅ clean (includes the `@ts-expect-error` type-guard assertion) |
| `pnpm lint` | ✅ clean |
| `pnpm test` (unit) | ✅ 186 passed / 1 skipped (artifacts.test.tsx: 8 passed) |
| `pnpm build` | ✅ all routes static; `/dev/artifacts` prerendered |
| `/dev/artifacts` guard | ✅ 200 in dev, **404 in prod** (no `ALLOW_DEV_ROUTES`) |
| `pnpm eval --only EVAL-003,EVAL-006,EVAL-008,EVAL-009,EVAL-013` | ✅ 0 fail, 0 regression — EVAL-006/008/013 PASS, EVAL-003/009 MANUAL (design/content review = this board), EVAL-008 improved FAIL→PASS |

Eval evidence: `evals/results/eval-run-0.2.0-8cb2233.json` (left unstaged per commit-staging rule).
Board screenshots: `docs/screenshots/artifacts/{390,1440}.png` (left unstaged).

## Notes for downstream

- TKT-19 (`Chapter`) should render its artifacts via `ArtifactRenderer` inside `ArtifactGrid`, passing
  the owning project's `sources`.
- `TKT-40` (About Impact) reuses `MetricCard` (value + label + context, never a naked number).
- Real artifact data (M-005) must keep every metric `asOf`+`source` populated or the runtime guard
  throws by design.
